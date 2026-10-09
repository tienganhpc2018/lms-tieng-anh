import React from 'react';
import { Zap, Play, CheckCircle } from 'lucide-react';
import { playClick } from '../../../../utils/soundEffects';

export default function MarbleRaceOverlay({
  gateLocked = true,
  countdownStep = 0,
  isAutoCounting = false,
  onTriggerStep,
  onStartAutoCountdown,
  onOpenInstantly,
}) {
  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4 pointer-events-auto animate-fade-in">
      <div className="bg-slate-900/95 border-2 border-slate-700/80 rounded-3xl p-5 sm:p-6 text-center shadow-2xl backdrop-blur-md text-white space-y-4">
        {/* HEADER BADGE */}
        <div className="inline-flex items-center space-x-1.5 px-4 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-emerald-500/20 border border-emerald-400/50 text-emerald-300">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>
            {gateLocked
              ? '🔒 TÍN HIỆU XUẤT PHÁT - MỞ THANH GẠT'
              : '🔓 THANH GẠT ĐÃ MỞ - XUẤT PHÁT!'}
          </span>
        </div>

        {/* 4 NÚT TRÒN MÀU XANH LÁ PHÁT SÁNG (NÚT 1, 2, 3, 4) - CHUẨN ẢNH 2 */}
        <div className="grid grid-cols-4 gap-3 py-1">
          {[1, 2, 3, 4].map((step) => {
            const isFour = step === 4;
            const isActive = countdownStep >= step;

            return (
              <div key={step} className="flex flex-col items-center space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    onTriggerStep(step);
                  }}
                  className={`w-14 h-14 rounded-full font-black text-xl flex items-center justify-center transition cursor-pointer transform active:scale-95 shadow-lg ${
                    isActive || (!gateLocked && isFour)
                      ? 'bg-gradient-to-tr from-emerald-500 to-green-400 text-slate-950 shadow-emerald-500/50 ring-4 ring-emerald-400/30 scale-105'
                      : 'bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 border border-emerald-500/40'
                  }`}
                >
                  {step}
                </button>
                <span className="text-[11px] font-extrabold text-slate-300">
                  {isFour ? 'Nút 4 (Mở gạt)' : `Nút ${step}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* CẶP NÚT ĐIỀU KHIỂN CHÍNH: TỰ ĐỘNG ĐẾM & MỞ NGAY (CHUẨN ẢNH 2) */}
        <div className="flex items-center gap-2 pt-1">
          {/* NÚT ĐỎ CHÍNH: TỰ ĐỘNG ĐẾM 1-2-3-4 */}
          <button
            type="button"
            onClick={() => {
              playClick();
              onStartAutoCountdown();
            }}
            disabled={isAutoCounting || !gateLocked}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-600/30 transition cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>▶ TỰ ĐỘNG ĐẾM 1-2-3-4 & MỞ THANH GẠT (SPACE)</span>
          </button>

          {/* NÚT XANH THÂM: MỞ NGAY */}
          <button
            type="button"
            onClick={() => {
              playClick();
              onOpenInstantly();
            }}
            className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 font-black text-xs transition cursor-pointer flex items-center space-x-1"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />
            <span>⚡ Mở ngay</span>
          </button>
        </div>

        {/* GHI CHÚ PHÍM TẮT DƯỚI ĐÁY */}
        <p className="text-[11px] font-semibold text-slate-400">
          Bấm các nút 1 → 2 → 3 → 4 hoặc gõ phím 1, 2, 3, 4 trên bàn phím
        </p>
      </div>
    </div>
  );
}
