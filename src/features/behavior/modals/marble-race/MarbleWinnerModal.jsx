import React, { useEffect } from 'react';
import { Trophy, Crown, RefreshCw, X, Award, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playWinner, playClick } from '../../../../utils/soundEffects';

export default function MarbleWinnerModal({
  isOpen,
  winnerMarble,
  onClose,
  onRaceAgain,
  removeWinnerNextRound,
  setRemoveWinnerNextRound,
}) {
  useEffect(() => {
    if (isOpen && winnerMarble) {
      playWinner();

      // Bắn pháo hoa rực rỡ 🎉
      try {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            return clearInterval(interval);
          }
          const particleCount = 50 * (timeLeft / duration);
          confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
          });
        }, 250);
      } catch (e) {}
    }
  }, [isOpen, winnerMarble]);

  if (!isOpen || !winnerMarble) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950 border-2 border-amber-400/80 rounded-3xl w-full max-w-md text-white shadow-2xl overflow-hidden p-6 sm:p-8 text-center relative space-y-5 transform animate-bounce-short">
        {/* VẬT THỂ PHÁT SÁNG NỀN TRANG TRÍ */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* CỘT HUY CHƯƠNG / VƯƠNG MIỆN NỔI BẬT */}
        <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 p-1 shadow-2xl shadow-amber-500/40">
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-4xl">
            <Crown className="w-12 h-12 text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* TIÊU ĐỀ CHIẾN THẮNG */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black tracking-widest uppercase">
            🏆 NGƯỜI CHIẾN THẮNG CUỘC ĐUA BI
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight leading-tight">
            {winnerMarble.studentName}
          </h2>
          <p className="text-xs font-bold text-slate-300">
            Viên bi số <strong className="text-amber-400 text-sm">#{winnerMarble.number}</strong> đã xuất sắc về đích đầu tiên!
          </p>
        </div>

        {/* THUMBNAIL VIÊN BI */}
        <div className="inline-flex items-center space-x-3 bg-slate-800/80 border border-slate-700 px-4 py-2.5 rounded-2xl">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-inner border border-white/40"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${winnerMarble.color?.light}, ${winnerMarble.color?.main}, ${winnerMarble.color?.dark})`,
              color: winnerMarble.color?.text || '#FFF',
            }}
          >
            {winnerMarble.number}
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-slate-400 block">Màu đại diện</span>
            <span className="text-xs font-black text-amber-300 block">{winnerMarble.color?.name || 'Viên bi may mắn'}</span>
          </div>
        </div>

        {/* TÙY CHỌN LOẠI NGƯỜI THẮNG Ở VÒNG SAU */}
        <label className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-300 cursor-pointer bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/60">
          <input
            type="checkbox"
            checked={removeWinnerNextRound}
            onChange={(e) => {
              playClick();
              setRemoveWinnerNextRound(e.target.checked);
            }}
            className="rounded border-slate-600 text-purple-600 focus:ring-purple-500 w-4 h-4"
          />
          <span>Tự động loại {winnerMarble.studentName} ở lượt đua tiếp theo</span>
        </label>

        {/* CÁC NÚT THAO TÁC */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={() => {
              playClick();
              onClose();
            }}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl border border-slate-700 transition cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={() => {
              playClick();
              onRaceAgain();
            }}
            className="flex-2 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-500/20 transition cursor-pointer flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>🔄 ĐUA LẠI LƯỢT MỚI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
