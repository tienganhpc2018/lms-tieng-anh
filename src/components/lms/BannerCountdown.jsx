import React, { useState, useEffect } from 'react';
import { Clock, Award, Sparkles } from 'lucide-react';

/**
 * Component Đồng hồ đếm ngược ngày thi học kỳ / thi tuyển sinh vào lớp 10
 */
export default function BannerCountdown({ targetDate, title = 'Kỳ Thi Học Kỳ Môn Tiếng Anh' }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const calculateTime = () => {
      // Nếu không có targetDate hoặc không hợp lệ, lấy mặc định cuối kỳ (ví dụ 15 ngày tới)
      let targetTime;
      if (targetDate) {
        targetTime = new Date(targetDate).getTime();
      } else {
        targetTime = Date.now() + 15 * 24 * 60 * 60 * 1000;
      }

      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <div className="flex items-center space-x-2 bg-rose-950/80 border border-rose-400/50 text-rose-200 px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-md shadow-md">
        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
        <span>Kỳ thi đang diễn ra! Chúc các em làm bài thật tốt!</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/70 border border-amber-400/50 text-white px-3.5 py-1.5 rounded-2xl text-xs font-black backdrop-blur-md shadow-lg select-none">
      <div className="flex items-center space-x-1.5 text-amber-300 mr-1">
        <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
        <span className="text-[11px] uppercase tracking-wider">{title}:</span>
      </div>

      <div className="flex items-center space-x-1 text-xs">
        <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg font-black min-w-[24px] text-center shadow-xs">
          {timeLeft.days}
        </span>
        <span className="text-[10px] text-slate-300 font-bold">Ngày</span>

        <span className="bg-slate-800 border border-slate-600 text-amber-300 px-1.5 py-0.5 rounded-lg font-mono font-bold min-w-[22px] text-center">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-slate-300 font-bold">Giờ</span>

        <span className="bg-slate-800 border border-slate-600 text-amber-300 px-1.5 py-0.5 rounded-lg font-mono font-bold min-w-[22px] text-center">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-slate-300 font-bold">Phút</span>

        <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded-lg font-mono font-bold min-w-[22px] text-center animate-pulse">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-slate-300 font-bold">Giây</span>
      </div>
    </div>
  );
}
