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
        
        # Railway/Docker (Linux) üzerinde sistem ffmpeg'i daha kararlı çalışır.
        # Windows üzerinde ise imageio_ffmpeg.get_ffmpeg_exe() kullanabiliriz.
        if os.name == 'nt':
            import imageio_ffmpeg
            ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        else:
            ffmpeg_exe = "ffmpeg"
            
        try:
            subprocess.run(
                [ffmpeg_exe, "-y", "-i", temp_path, wav_path], 
                check=True, 
                stdout=subprocess.DEVNULL, 
                stderr=subprocess.PIPE
            )
        except subprocess.CalledProcessError as e:
            os.remove(temp_path)
            error_details = e.stderr.decode('utf-8', errors='replace') if e.stderr else str(e)
            raise HTTPException(status_code=400, detail=f"Ses dosyasi donusturulemedi: {error_details}")
        except Exception as e:
            os.remove(temp_path)
            raise HTTPException(status_code=400, detail=f"Ses dosyasi donusturulemedi (Genel Hata): {e}")

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
        
        # Apply bandpass filter to isolate heartbeat frequencies (20Hz - 400Hz)
        # (Yüksek frekansların eklenmesi telefon hoparlörlerinde duyulabilirliği artırır)
        filtered_audio = butter_bandpass_filter(reduced_noise, 20.0, 400.0, sr, order=3)
        
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

        # If beat frames are extremely sparse (less than 3)
        # We reject the audio as it doesn't contain a clear enough heartbeat.
        if len(beat_frames) < 3 or bpm <= 0:
            os.remove(temp_path)
            if os.path.exists(wav_path):
                os.remove(wav_path)
            return {"status": "error", "message": "Kalp atışı tespit edilemedi. Lütfen sessiz bir ortamda, mikrofonu göğsünüze tam temas ettirerek tekrar deneyin."}
            
        print(f"DSP finished. BPM calculated: {bpm} (Beat frames found: {len(beat_frames)})")

        # 4. Save clean audio to temp wav
        clean_temp_path = temp_path.replace(ext, "_clean.wav")
        sf.write(clean_temp_path, filtered_audio, sr)
        
        # 5. Extract Waveform Peaks (60 bins)
        waveform_bins = 60
        chunk_size = len(filtered_audio) // waveform_bins
        waveform_data = []
        if chunk_size > 0:
            for i in range(waveform_bins):
                chunk = filtered_audio[i * chunk_size : (i + 1) * chunk_size]
                peak = float(np.max(np.abs(chunk)))
                waveform_data.append(peak)
            
            # Normalize between 0.05 and 1.0
            max_peak = max(waveform_data) if len(waveform_data) > 0 else 1.0
            if max_peak > 0:
                waveform_data = [round(max(0.05, p / max_peak), 3) for p in waveform_data]
            else:
                waveform_data = [0.05] * waveform_bins
        else:
            waveform_data = [0.05] * waveform_bins
        
        # 6. Read clean wav and encode to Base64
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
            "clean_audio_b64": clean_b64,
            "waveform_data": waveform_data
        }
        
    except Exception as e:
        print(f"Error processing audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))
