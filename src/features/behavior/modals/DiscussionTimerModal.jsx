import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Timer, Volume2 } from 'lucide-react';
import { playClick, playTick, playTimerAlarm } from '../../../utils/soundEffects';

export default function DiscussionTimerModal({ isOpen, onClose }) {
  const [totalSeconds, setTotalSeconds] = useState(120); // Mặc định 2 phút
  const [timeLeft, setTimeLeft] = useState(120);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef(null);

  const setPreset = (sec) => {
    playClick();
    setIsRunning(false);
    setIsFinished(false);
    setTotalSeconds(sec);
    setTimeLeft(sec);
  };

  const toggleRun = () => {
    playClick();
    if (isFinished) {
      setTimeLeft(totalSeconds);
      setIsFinished(false);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    playClick();
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(totalSeconds);
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsFinished(true);
            playTimerAlarm();
            return 0;
          }
          if (prev <= 6) {
            playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div
        className={`bg-slate-900 border rounded-[2.5rem] w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-6 my-auto text-white text-center transition-colors max-h-[92vh] ${
          isFinished ? 'border-rose-500 shadow-rose-900/50 animate-pulse' : 'border-indigo-500/40'
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-left">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Đồng Hồ Thảo Luận Nhóm</h3>
              <p className="text-xs text-slate-400 font-medium">Bấm giờ hoạt động học tập trên lớp</p>
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CÁC NÚT MỐC THỜI GIAN NHANH (1m, 2m, 3m, 5m) */}
        <div className="flex items-center justify-center space-x-2">
          {[
            { label: '1 Phút', sec: 60 },
            { label: '2 Phút', sec: 120 },
            { label: '3 Phút', sec: 180 },
            { label: '5 Phút', sec: 300 },
          ].map((item) => (
            <button
              key={item.sec}
              type="button"
              onClick={() => setPreset(item.sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                totalSeconds === item.sec
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* HIỂN THỊ ĐỒNG HỒ SỐ KHỔNG LỒ */}
        <div className="py-4 relative">
          <div
            className={`w-52 h-52 mx-auto rounded-full border-4 flex flex-col items-center justify-center relative shadow-inner ${
              isFinished
                ? 'border-rose-500 bg-rose-950/40 text-rose-400'
                : 'border-indigo-500/50 bg-slate-950/80 text-white'
            }`}
          >
            <span className="font-mono font-black text-5xl tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-bold text-slate-400 mt-2">
              {isFinished ? '🚨 HẾT GIỜ THẢO LUẬN!' : isRunning ? 'Đang đếm ngược...' : 'Tạm dừng'}
            </span>
          </div>
        </div>

        {/* ĐIỀU KHIỂN PLAY / PAUSE / RESET */}
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            type="button"
            onClick={toggleRun}
            className={`px-6 py-3 rounded-2xl font-black text-sm transition shadow-lg flex items-center space-x-2 cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-white" />}
            <span>{isRunning ? 'TẠM DỪNG' : 'BẮT ĐẦU'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition cursor-pointer"
            title="Đặt lại thời gian"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
