import React, { useState } from 'react';
import { X, Settings, School, Calendar, Sliders, Check, RotateCcw } from 'lucide-react';
import { playClick, playCorrect } from '../../../utils/soundEffects';
import { DEFAULT_CONFIG } from '../utils/assessmentStorage';

export default function ConfigAssessmentModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    schoolName: config.schoolName || DEFAULT_CONFIG.schoolName,
    academicYear: config.academicYear || DEFAULT_CONFIG.academicYear,
    txCount: config.txCount || 4,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    playCorrect();
    onSaveConfig(formData);
    onClose();
  };

  const handleReset = () => {
    playClick();
    setFormData(DEFAULT_CONFIG);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md text-xl">
              ⚙️
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Cấu Hình Sổ Điểm Môn Học</h3>
              <p className="text-xs text-teal-200 font-semibold">
                Chuẩn hóa Thông tư 22/2021/TT-BGDĐT
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tên trường học */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
              <School className="w-4 h-4 text-teal-600" />
              <span>Tên Trường Học (In hoa trên Bảng điểm & File xuất):</span>
            </label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              placeholder="VD: TRƯỜNG THCS CÁT MINH"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm font-bold text-slate-800"
              required
            />
          </div>

          {/* Năm học */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Năm Học:</span>
            </label>
            <input
              type="text"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              placeholder="VD: 2026-2027"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm font-bold text-slate-800"
              required
            />
          </div>

          {/* Số lượng cột điểm ĐĐG Thường xuyên (TX) */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-teal-600" />
                <span>Số Cột Đánh Giá Thường Xuyên (ĐĐG TX):</span>
              </span>
              <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                {formData.txCount} cột
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map((count) => (
                <button
                  type="button"
                  key={count}
                  onClick={() => {
                    playClick();
                    setFormData({ ...formData, txCount: count });
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black transition border flex flex-col items-center justify-center cursor-pointer ${
                    formData.txCount === count
                      ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-base">{count}</span>
                  <span className="text-[10px] opacity-80">cột TX</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 italic">
              * Môn Tiếng Anh (3-4 tiết/tuần) theo Thông tư 22 thường có 4 cột ĐĐG Thường xuyên (TX1, TX2, TX3, TX4).
            </p>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi Phục Mặc Định</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Cấu Hình</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
