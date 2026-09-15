import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import FooterEditModal, { DEFAULT_FOOTER_CONFIG } from './FooterEditModal';
import { Settings, Edit2 } from 'lucide-react';

const STORAGE_KEY = 'lms_footer_custom_config';

export default function Footer() {
  const { isTeacher } = useAuth();
  const [config, setConfig] = useState(DEFAULT_FOOTER_CONFIG);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Nạp cấu hình tùy chỉnh từ localStorage khi mở trang
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setConfig({ ...DEFAULT_FOOTER_CONFIG, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Lỗi nạp cấu hình footer:', e);
    }
  }, []);

  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.error('Lỗi lưu cấu hình footer:', e);
    }
  };

  return (
    <footer className="bg-slate-300 text-slate-800 py-10 px-6 sm:px-12 border-t border-slate-300/80 font-sans mt-12 select-text relative">
      {/* NÚT CHỈNH SỬA THÔNG TIN CHÂN TRANG CHO GIÁO VIÊN */}
      {isTeacher && (
        <div className="max-w-7xl mx-auto flex justify-end mb-4 select-none">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white/80 hover:bg-white text-slate-800 hover:text-emerald-700 text-xs font-bold rounded-xl shadow-xs border border-slate-400/40 transition cursor-pointer"
            title="Thầy có thể bấm vào đây để chỉnh sửa thông tin giới thiệu, liên hệ, bản quyền theo ý muốn"
          >
            <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>✏️ Chỉnh sửa chân trang</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* CỘT TRÁI: TRANG HỌC LIỆU CHUẨN ẢNH MẪU 2 */}
        <div className="space-y-3">
          <h4 className="text-base sm:text-lg font-black text-slate-900 bg-slate-400/30 px-3 py-1 rounded-lg w-fit">
            {config.titleCol1 || 'Trang Học Liệu'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
            {config.descCol1 || DEFAULT_FOOTER_CONFIG.descCol1}
          </p>
        </div>

        {/* CỘT PHẢI: KẾT NỐI VỚI TÔI CHUẨN ẢNH MẪU 2 */}
        <div className="space-y-3">
          <h4 className="text-base sm:text-lg font-black text-slate-900 bg-slate-400/30 px-3 py-1 rounded-lg w-fit">
            {config.titleCol2 || 'Kết nối với tôi'}
          </h4>
          <div className="space-y-2 text-xs sm:text-sm text-slate-700 font-semibold">
            <div className="flex items-center space-x-2">
              <span className="text-base">💬</span>
              <span>{config.teacherNameSchool || 'Nguyễn Văn Hải - THCS Cát Minh'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base">✉️</span>
              <a 
                href={`mailto:${config.email || 'ngvanhaiai81@gmail.com'}`} 
                className="hover:underline hover:text-slate-950 transition"
              >
                {config.email || 'ngvanhaiai81@gmail.com'}
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base">📞</span>
              <a 
                href={`tel:${(config.phone || '+84384635199').replace(/[^0-9+]/g, '')}`} 
                className="hover:underline hover:text-slate-950 transition"
              >
                {config.phone || '+84 (0) 384635199'}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* DÒNG BẢN QUYỀN DƯỚI CÙNG CHUẨN ẢNH MẪU 2 */}
      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-400/40 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600 font-semibold gap-2">
        <div>
          {config.copyright || 'Bản quyền thuộc © Nguyễn Văn Hải'}
        </div>
        <div className="flex items-center space-x-1">
          <span>Cung cấp bởi</span>
          <span className="font-extrabold text-slate-900 bg-white/70 px-2 py-0.5 rounded shadow-2xs">
            {config.provider || 'LMS Tiếng Anh THCS'}
          </span>
          <span className="text-[11px] text-slate-500">
            - {config.slogan || 'Tạo website học liệu thông minh'}
          </span>
        </div>
      </div>

      {/* MODAL CHỈNH SỬA THÔNG TIN CHÂN TRANG */}
      <FooterEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentConfig={config}
        onSave={handleSaveConfig}
      />
    </footer>
  );
}
