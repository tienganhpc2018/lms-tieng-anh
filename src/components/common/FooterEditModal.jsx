import React, { useState } from 'react';
import { X, Save, RotateCcw, Edit3, CheckCircle } from 'lucide-react';

export const DEFAULT_FOOTER_CONFIG = {
  title: 'Sổ Tay Dạy Học THCS –:- Giáo dục công nghệ 4.0',
  subtitle: 'Nền tảng chia sẻ và trao đổi học liệu số, thiết bị dạy học tự làm chất lượng cao (Khối 6, 7, 8, 9 Global Success).',
  copyright: '© 2026 SỔ TAY DẠY HỌC THCS. Tất cả quyền được bảo lưu.',
};

export default function FooterEditModal({ isOpen, onClose, currentConfig, onSave }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    title: currentConfig?.title || currentConfig?.titleCol1 || DEFAULT_FOOTER_CONFIG.title,
    subtitle: currentConfig?.subtitle || currentConfig?.descCol1 || DEFAULT_FOOTER_CONFIG.subtitle,
    copyright: currentConfig?.copyright || DEFAULT_FOOTER_CONFIG.copyright,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    if (window.confirm('Thầy có chắc chắn muốn khôi phục về nội dung chân trang mặc định ban đầu không?')) {
      setFormData(DEFAULT_FOOTER_CONFIG);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans select-none overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 animate-in fade-in duration-200">
        {/* HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Tùy Chỉnh Chân Trang (Thanh Ngang Tinh Gọn)</h3>
              <p className="text-[11px] text-slate-300 font-medium">Chỉnh sửa thông tin chân trang đồng bộ Real-Time trên máy Thầy và Học sinh</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-emerald-800 font-bold text-xs animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Đã lưu thông tin chân trang thành công!</span>
            </div>
          )}

          {/* TRƯỜNG 1: TIÊU ĐỀ CHÍNH */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
            <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
              🎓 Tiêu đề chân trang (Dòng in đậm)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ví dụ: Sổ Tay Dạy Học THCS –:- Giáo dục công nghệ 4.0"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-white outline-none text-slate-900 shadow-2xs"
            />
          </div>

          {/* TRƯỜNG 2: PHỤ ĐỀ HỌC LIỆU */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              📖 Dòng phụ đề mô tả học liệu (Dòng chữ nhỏ bên dưới)
            </label>
            <textarea
              rows={3}
              value={formData.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              placeholder="Ví dụ: Nền tảng chia sẻ và trao đổi học liệu số, thiết bị dạy học tự làm chất lượng cao..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-white outline-none leading-relaxed text-slate-700 shadow-2xs"
            />
          </div>

          {/* TRƯỜNG 3: BẢN QUYỀN */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              ©️ Dòng bản quyền (Góc bên phải)
            </label>
            <input
              type="text"
              value={formData.copyright}
              onChange={(e) => handleChange('copyright', e.target.value)}
              placeholder="Ví dụ: © 2026 SỔ TAY DẠY HỌC THCS. Tất cả quyền được bảo lưu."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white outline-none text-slate-800 shadow-2xs"
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mặc định ban đầu</span>
            </button>

            <div className="w-full sm:w-auto flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Thay Đổi</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
