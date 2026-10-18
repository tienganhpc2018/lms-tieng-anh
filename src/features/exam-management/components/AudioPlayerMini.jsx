import React, { useState } from 'react';
import { Volume2, Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';

export default function AudioPlayerMini({ audioUrl, label = 'Audio bài nghe' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = React.useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Audio play error:', err);
        setAudioError(true);
      });
    }
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  return (
    <div className="flex items-center space-x-3 bg-gradient-to-r from-teal-50 to-indigo-50/70 p-3 rounded-2xl border border-teal-200/90 shadow-2xs">
      <audio
        ref={audioRef}
        src={audioUrl || 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=english-listening-test-sample.mp3'}
        onEnded={() => setIsPlaying(false)}
        onError={() => setAudioError(true)}
        preload="auto"
      />
      <button
        type="button"
        onClick={togglePlay}
        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-md transition transform active:scale-95 cursor-pointer ${
          isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-teal-600 hover:bg-teal-700'
        }`}
        title={isPlaying ? 'Tạm dừng audio' : 'Phát audio bài nghe'}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
      </button>

      <button
        type="button"
        onClick={restartAudio}
        className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
        title="Nghe lại từ đầu"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-teal-600 animate-pulse' : 'text-slate-400'}`} />
          <span className="text-xs font-black text-slate-800 truncate">{label}</span>
        </div>
        <p className="text-[10px] text-slate-500 font-medium">
          {isPlaying ? '🔊 Đang phát audio bài thi chuẩn giọng Anh-Anh...' : 'Bấm Play để nghe bài phát âm'}
        </p>
      </div>

      {audioError && (
        <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Sử dụng Audio demo</span>
        </span>
      )}
    </div>
  );
}
