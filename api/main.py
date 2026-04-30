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

        # 2. BPM Calculation on RAW Audio
        # Sesi sadece normalize ederek BPM bulmaya calisiyoruz (filtrelemeden once)
        normalized_raw = librosa.util.normalize(y)
        tempo, beat_frames = librosa.beat.beat_track(y=normalized_raw, sr=sr)
        bpm = float(tempo[0]) if isinstance(tempo, (list, tuple, np.ndarray)) else float(tempo)
        
        # Adjust BPM bounds
        if bpm > 200:
            bpm = bpm / 2
        elif bpm < 40:
            bpm = bpm * 2

        # Fallback: Eğer ham sesten bulunamadıysa bir de hafif filtrelenmiş halinden deneyelim
        if len(beat_frames) < 3 or bpm <= 0:
            fallback_audio = butter_bandpass_filter(normalized_raw, 20.0, 500.0, sr, order=2)
            tempo_fb, beat_frames_fb = librosa.beat.beat_track(y=fallback_audio, sr=sr)
            bpm_fb = float(tempo_fb[0]) if isinstance(tempo_fb, (list, tuple, np.ndarray)) else float(tempo_fb)
            if bpm_fb > 200:
                bpm_fb = bpm_fb / 2
            elif bpm_fb < 40:
                bpm_fb = bpm_fb * 2
            
            if len(beat_frames_fb) >= 3 and bpm_fb > 0:
                bpm = bpm_fb
                beat_frames = beat_frames_fb
            else:
                os.remove(temp_path)
                if os.path.exists(wav_path):
                    os.remove(wav_path)
                return {"status": "error", "message": "Kalp atışı tespit edilemedi. Lütfen sessiz bir ortamda, mikrofonu göğsünüze tam temas ettirerek tekrar deneyin."}

        print(f"DSP finished. BPM calculated: {bpm} (Beat frames found: {len(beat_frames)})")

        # 4. Extract Waveform Peaks from RAW AUDIO (60 bins)
        # We no longer use filtered_audio to save processing time
        waveform_bins = 60
        chunk_size = len(normalized_raw) // waveform_bins
        waveform_data = []
        if chunk_size > 0:
            for i in range(waveform_bins):
                chunk = normalized_raw[i * chunk_size : (i + 1) * chunk_size]
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
        
        # 5. Cleanup
        os.remove(temp_path)
        if os.path.exists(wav_path):
            os.remove(wav_path)
        
        return {
            "status": "success",
            "bpm": int(bpm),
            "waveform_data": waveform_data
        }
        
    except Exception as e:
        print(f"Error processing audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))
