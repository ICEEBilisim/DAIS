import React, { useState, useEffect, useRef } from 'react';
import { Play, Square } from 'lucide-react';

const WaveformPlayer = ({ audioUrl, waveformData = [], bpm }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const audioRef = useRef(null);
  const reqRef = useRef();

  useEffect(() => {
    // If audioUrl changes, reset
    setIsPlaying(false);
    setProgress(0);
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const updateProgress = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration || 1;
      const curr = audioRef.current.currentTime;
      setProgress(curr / dur);
    }
    reqRef.current = requestAnimationFrame(updateProgress);
  };

  useEffect(() => {
    if (isPlaying) {
      reqRef.current = requestAnimationFrame(updateProgress);
    } else {
      cancelAnimationFrame(reqRef.current);
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [isPlaying]);

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00";
    const s = Math.floor(seconds);
    return `00:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-cyan-50 border border-cyan-100 p-4 rounded-xl shadow-sm w-full">
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onEnded={handleEnded} 
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-bold text-cyan-800 tracking-wide uppercase">Ham Ses Kaydı</span>
        </div>
        {bpm && (
          <span className="text-xs font-bold bg-cyan-200 text-cyan-800 px-3 py-1 rounded-full shadow-sm">
            Nabız: {bpm} BPM
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={togglePlay}
          type="button"
          className="w-10 h-10 flex-shrink-0 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
        >
          {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
        </button>

        <div className="flex-1 flex items-end h-12 space-x-[2px]">
          {waveformData && waveformData.length > 0 ? waveformData.map((peak, idx) => {
            const isActive = (idx / waveformData.length) <= progress;
            return (
              <div 
                key={idx}
                className={`flex-1 rounded-full transition-colors duration-75 ${isActive ? 'bg-cyan-600' : 'bg-cyan-200'}`}
                style={{ height: `${Math.max(10, peak * 100)}%` }}
              />
            );
          }) : (
            <div className="w-full h-2 bg-cyan-200 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-600" style={{ width: `${progress * 100}%` }} />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-2 px-14">
        <span className="text-[10px] text-cyan-600 font-mono font-medium">
          {audioRef.current ? formatTime(audioRef.current.currentTime) : "00:00"}
        </span>
        <span className="text-[10px] text-cyan-600 font-mono font-medium">
          {audioRef.current ? formatTime(audioRef.current.duration) : "00:00"}
        </span>
      </div>
    </div>
  );
};

export default WaveformPlayer;
