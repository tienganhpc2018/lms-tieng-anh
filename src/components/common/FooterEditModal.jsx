import React, { useState } from 'react';
import { X, Save, RotateCcw, Edit3, CheckCircle } from 'lucide-react';

export const DEFAULT_FOOTER_CONFIG = {
  titleCol1: 'Trang Học Liệu',
  descCol1: 'Học Liệu Tiếng Anh được hoàn thiện và ra mắt vào ngày 30/8/2023. Với mục đích để lưu giữ tư liệu cá nhân trong việc giảng dạy và đồng thời giúp các em học sinh có thể tham khảo soạn bài và một số tài liệu cần thiết cho việc học.',
  titleCol2: 'Kết nối với tôi',
  teacherNameSchool: 'Nguyễn Văn Hải - THCS Cát Minh',
  email: 'ngvanhaiai81@gmail.com',
  phone: '+84 (0) 384635199',
  copyright: 'Bản quyền thuộc © Nguyễn Văn Hải',
  provider: 'LMS Tiếng Anh THCS',
  slogan: 'Tạo website học liệu thông minh',
};

export default function FooterEditModal({ isOpen, onClose, currentConfig, onSave }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    ...DEFAULT_FOOTER_CONFIG,
    ...currentConfig,
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
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 animate-in fade-in duration-200">
        {/* HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Tùy Chỉnh Thông Tin Chân Trang (Footer)</h3>
              <p className="text-[11px] text-slate-300 font-medium">Chỉnh sửa thông tin hiển thị ở phần chân trang web theo ý muốn của Thầy</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-emerald-800 font-bold text-xs animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Đã lưu thông tin chân trang thành công!</span>
            </div>
          )}

          {/* NHÓM 1: CỘT TRÁI - GIỚI THIỆU HỌC LIỆU */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <span>📌 Khối 1: Thông tin giới thiệu (Cột Trái)</span>
            </h4>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Tiêu đề khối 1</label>
              <input
                type="text"
                value={formData.titleCol1}
                onChange={(e) => handleChange('titleCol1', e.target.value)}
                placeholder="Ví dụ: Trang Học Liệu"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Đoạn văn giới thiệu / Mục đích</label>
              <textarea
                rows={3}
                value={formData.descCol1}
                onChange={(e) => handleChange('descCol1', e.target.value)}
                placeholder="Nhập nội dung giới thiệu học liệu..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-white outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* NHÓM 2: CỘT PHẢI - THÔNG TIN LIÊN HỆ */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <span>📞 Khối 2: Thông tin tác giả & Liên hệ (Cột Phải)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">Tiêu đề khối 2</label>
                <input
                  type="text"
                  value={formData.titleCol2}
                  onChange={(e) => handleChange('titleCol2', e.target.value)}
                  placeholder="Ví dụ: Kết nối với tôi"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white outline-none"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">Họ tên Thầy & Trường / Đơn vị</label>
                <input
                  type="text"
                  value={formData.teacherNameSchool}
                  onChange={(e) => handleChange('teacherNameSchool', e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Hải - THCS Cát Minh"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Email liên hệ</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="ngvanhaiai81@gmail.com"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Số điện thoại / Hotline / Zalo</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+84 (0) 384635199"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* NHÓM 3: DÒNG BẢN QUYỀN VÀ THƯƠNG HIỆU */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <span>⚖️ Dòng chân trang dưới cùng</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">Dòng bản quyền</label>
                <input
                  type="text"
                  value={formData.copyright}
                  onChange={(e) => handleChange('copyright', e.target.value)}
                  placeholder="Bản quyền thuộc © Nguyễn Văn Hải"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Đơn vị cung cấp</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => handleChange('provider', e.target.value)}
                  placeholder="LMS Tiếng Anh THCS"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Khẩu hiệu (Slogan)</label>
                <input
                  type="text"
                  value={formData.slogan}
                  onChange={(e) => handleChange('slogan', e.target.value)}
                  placeholder="Tạo website học liệu thông minh"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white outline-none"
                />
              </div>
            </div>
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
