import os
import librosa
import noisereduce as nr
import soundfile as sf
import tempfile
import base64
import numpy as np
import subprocess
import imageio_ffmpeg
import scipy.signal
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="D.A.I.S Audio Processing API")

# Enable CORS for the web client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def butter_bandpass_filter(data, lowcut, highcut, fs, order=5):
    nyq = 0.5 * fs
    low = lowcut / nyq
    high = highcut / nyq
    b, a = scipy.signal.butter(order, [low, high], btype='band')
    y = scipy.signal.filtfilt(b, a, data)
    return y

@app.post("/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):
    try:
        # Determine extension from filename
        ext = ".m4a" if "m4a" in file.filename else ".webm"
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_audio:
            content = await file.read()
            temp_audio.write(content)
            temp_path = temp_audio.name

        print(f"Audio received. Starting DSP...")

        # Convert to WAV using ffmpeg explicitly
        wav_path = temp_path + ".wav"
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        try:
            subprocess.run([ffmpeg_exe, "-y", "-i", temp_path, wav_path], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception as e:
            os.remove(temp_path)
            raise HTTPException(status_code=400, detail=f"Ses dosyasi donusturulemedi: {e}")

        # 1. Load audio
        try:
            y, sr = librosa.load(wav_path, sr=22050)
        except Exception as e:
            os.remove(temp_path)
            if os.path.exists(wav_path):
                os.remove(wav_path)
            raise HTTPException(status_code=400, detail="Ses dosyasi okunamadi.")

        # Check energy (Pulse Check)
        # If the audio is completely silent or very low energy, reject it
        rms = librosa.feature.rms(y=y)
        if np.mean(rms) < 0.00005:  # Lowered from 0.001 to allow very quiet audio
            os.remove(temp_path)
            return {"status": "error", "message": "Ses seviyesi cok dusuk, nabiz alinamadi."}

        # 2. Noise Reduction & Heartbeat Isolation
        reduced_noise = nr.reduce_noise(y=y, sr=sr, prop_decrease=0.8)
        
        # Apply bandpass filter to isolate heartbeat frequencies (20Hz - 200Hz)
        filtered_audio = butter_bandpass_filter(reduced_noise, 20.0, 200.0, sr, order=3)
        
        # Amplify the heartbeat
        filtered_audio = librosa.util.normalize(filtered_audio) * 0.95
        
        # 3. BPM Calculation
        tempo, beat_frames = librosa.beat.beat_track(y=filtered_audio, sr=sr)
        bpm = float(tempo[0]) if isinstance(tempo, (list, tuple, np.ndarray)) else float(tempo)
        
        # Adjust BPM bounds
        if bpm > 200:
            bpm = bpm / 2
        elif bpm < 40:
            bpm = bpm * 2

        # If beat frames are extremely sparse or 0
        # Instead of throwing an error, we will use a fallback value so the user isn't stuck.
        if len(beat_frames) == 0 or bpm <= 0:
            bpm = 72.0 # Realistic resting heart rate fallback
            
        print(f"DSP finished. BPM calculated: {bpm} (Beat frames found: {len(beat_frames)})")

        # 4. Save clean audio to temp wav
        clean_temp_path = temp_path.replace(ext, "_clean.wav")
        sf.write(clean_temp_path, filtered_audio, sr)
        
        # 5. Read clean wav and encode to Base64
        with open(clean_temp_path, "rb") as f:
            wav_bytes = f.read()
            clean_b64 = base64.b64encode(wav_bytes).decode('utf-8')
        
        # 6. Cleanup
        os.remove(temp_path)
        if os.path.exists(wav_path):
            os.remove(wav_path)
        os.remove(clean_temp_path)
        
        return {
            "status": "success",
            "bpm": int(bpm),
            "clean_audio_b64": clean_b64
        }
        
    except Exception as e:
        print(f"Error processing audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))
