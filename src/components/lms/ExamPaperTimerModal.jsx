import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Tv, Volume2, VolumeX, AlertCircle } from 'lucide-react';

export default function ExamPaperTimerModal({ isOpen, onClose, defaultMinutes = 45 }) {
  if (!isOpen) return null;

  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRunning(false);
            alert('🔔 🔔 🔔 ĐÃ HẾT THỜI GIAN LÀM BÀI THI GIẤY!\n\nGiám thị yêu cầu cả lớp dừng bút và thu bài.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const formattedMins = mins < 10 ? `0${mins}` : mins;
  const formattedSecs = secs < 10 ? `0${secs}` : secs;

  const isLowTime = secondsLeft < 300 && secondsLeft > 0; // Dưới 5 phút

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-8 font-sans animate-fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
            <Tv className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-amber-400 uppercase tracking-wide">
              ⏱️ ĐỒNG HỒ GIÁM THỊ CHIẾU TIVI / MÁY CHIẾU LỚP HỌC
            </h2>
            <p className="text-xs text-slate-400">Đồng hồ đếm ngược thời gian làm bài thi giấy cho cả lớp</p>
          </div>
        </div>

        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
          <X className="w-7 h-7" />
        </button>
      </div>

      {/* ĐỒNG HỒ CỠ CỰC ĐẠI */}
      <div className="flex flex-col items-center justify-center space-y-4 my-auto">
        <div
          className={`text-[120pt] sm:text-[180pt] font-black tracking-tight leading-none font-mono transition-colors ${
            isLowTime ? 'text-rose-500 animate-pulse' : 'text-emerald-400'
          }`}
        >
          {formattedMins}:{formattedSecs}
        </div>

        {isLowTime && (
          <div className="px-6 py-2 bg-rose-950 border border-rose-600 rounded-full text-rose-300 font-extrabold text-sm uppercase tracking-wider flex items-center space-x-2 animate-bounce">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <span>⚠️ CHÚ Ý: CHỈ CÒN DƯỚI 5 PHÚT LÀM BÀI! CẢ LỚP KHANH TRƯƠNG TÔ ĐÁP ÁN.</span>
          </div>
        )}
      </div>

      {/* THANH ĐIỀU KHIỂN GIÁM THỊ */}
      <div className="flex justify-center items-center space-x-4 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl max-w-xl mx-auto w-full shadow-2xl">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-6 py-3 rounded-2xl font-extrabold text-sm transition flex items-center space-x-2 shadow-lg ${
            isRunning ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isRunning ? 'Tạm Dừng' : 'Bắt Đầu Đếm Ngược'}</span>
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setSecondsLeft(defaultMinutes * 60);
          }}
          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-2xl transition flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Đặt Lại {defaultMinutes} Phút</span>
        </button>
      </div>
    </div>
  );
}
