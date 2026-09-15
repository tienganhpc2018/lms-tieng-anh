import React, { useState, useEffect } from 'react';
import { X, Zap, Clock, Tag, Flame, AlertCircle, CheckCircle2, StopCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playWinner, playClick, playDeduct } from '../../../utils/soundEffects';
import { loadFlashSaleConfig, saveFlashSaleConfig } from '../giftShopStorage';

export default function FlashSaleModal({
  isOpen,
  onClose,
  classId,
  onConfigChanged,
}) {
  const [activeConfig, setActiveConfig] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(20);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [targetCategory, setTargetCategory] = useState('all');
  const [remainingTime, setRemainingTime] = useState('');

  // Nạp cấu hình hiện có
  useEffect(() => {
    if (isOpen && classId) {
      const current = loadFlashSaleConfig(classId);
      setActiveConfig(current);
    }
  }, [isOpen, classId]);

  // Bộ đếm ngược thời gian thực
  useEffect(() => {
    if (!activeConfig || !activeConfig.endsAt) {
      setRemainingTime('');
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(activeConfig.endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setRemainingTime('00:00 (Đã kết thúc)');
        setActiveConfig(null);
        saveFlashSaleConfig(classId, null);
        if (onConfigChanged) onConfigChanged();
        return;
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setRemainingTime(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeConfig, classId]);

  if (!isOpen) return null;

  // Bắt đầu Flash Sale
  const handleStartFlashSale = () => {
    const now = new Date();
    const endsAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();

    const config = {
      discountPercent: Number(discountPercent),
      durationMinutes: Number(durationMinutes),
      category: targetCategory,
      startedAt: now.toISOString(),
      endsAt,
    };

    saveFlashSaleConfig(classId, config);
    setActiveConfig(config);
    playWinner();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (onConfigChanged) onConfigChanged();
  };

  // Dừng Flash Sale sớm
  const handleStopFlashSale = () => {
    saveFlashSaleConfig(classId, null);
    setActiveConfig(null);
    playClick();
    if (onConfigChanged) onConfigChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        {/* Header Giờ Vàng */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30 animate-pulse">
              ⚡
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                GIỜ VÀNG FLASH SALE
                <span className="text-xs bg-yellow-300 text-red-950 px-2 py-0.5 rounded-full font-black">
                  HOT DEAL
                </span>
              </h2>
              <p className="text-xs text-rose-100 font-medium">
                Kích hoạt sự kiện giảm giá xu cực sốc cho học sinh đổi quà
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="p-6 space-y-5">
          {/* Trạng thái nếu đang diễn ra Giờ Vàng */}
          {activeConfig ? (
            <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-5 text-white shadow-xl space-y-4 text-center">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-red-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider animate-bounce">
                <Flame className="w-4 h-4" /> ĐANG DIỄN RA SỰ KIỆN
              </div>

              <div>
                <div className="text-4xl font-black tracking-tight text-yellow-300">
                  GIẢM -{activeConfig.discountPercent}% XU
                </div>
                <p className="text-xs text-rose-100 mt-1">
                  Áp dụng cho:{' '}
                  <strong>
                    {activeConfig.category === 'all'
                      ? 'Tất cả phần quà'
                      : activeConfig.category === 'stationery'
                      ? 'Dụng cụ học tập'
                      : activeConfig.category === 'souvenir'
                      ? 'Quà lưu niệm'
                      : 'Đặc quyền lớp học'}
                  </strong>
                </p>
              </div>

              {/* Đồng hồ đếm ngược */}
              <div className="bg-black/25 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                <span className="text-xs text-rose-200 block uppercase font-bold">Thời gian còn lại</span>
                <span className="text-3xl font-mono font-black text-white tracking-widest">
                  {remainingTime || 'Đang tính...'}
                </span>
              </div>

              <button
                onClick={handleStopFlashSale}
                className="w-full py-3 bg-white hover:bg-rose-50 text-red-600 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <StopCircle className="w-4 h-4" />
                DỪNG SỰ KIỆN SỚM
              </button>
            </div>
          ) : (
            // Form thiết lập Giờ Vàng mới
            <div className="space-y-4">
              {/* Chọn mức giảm giá */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase">
                  <Tag className="w-3.5 h-3.5 text-red-500" />
                  Mức giảm giá (%):
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[10, 20, 30, 50, 70].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercent(pct)}
                      className={`py-2.5 rounded-xl font-black text-sm transition-all border ${
                        discountPercent === pct
                          ? 'bg-red-500 text-white border-red-600 shadow-md shadow-red-500/30'
                          : 'bg-slate-50 hover:bg-red-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      -{pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn thời lượng */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Thời lượng sự kiện:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-2 rounded-xl font-bold text-xs transition-all border ${
                        durationMinutes === mins
                          ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/30'
                          : 'bg-slate-50 hover:bg-amber-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {mins} phút
                    </button>
                  ))}
                </div>
              </div>

              {/* Áp dụng danh mục */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase">
                  <Zap className="w-3.5 h-3.5 text-orange-500" />
                  Phạm vi áp dụng:
                </label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="all">Tất cả phần quà trong cửa hàng</option>
                  <option value="stationery">Chỉ dụng cụ học tập</option>
                  <option value="souvenir">Chỉ quà lưu niệm & gấu bông</option>
                  <option value="privilege">Chỉ đặc quyền lớp học</option>
                </select>
              </div>

              {/* Nút bấm kích hoạt */}
              <button
                onClick={handleStartFlashSale}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-black text-base tracking-wide shadow-lg shadow-red-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                KÍCH HOẠT GIỜ VÀNG NGAY (-{discountPercent}%)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
