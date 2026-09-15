import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import FooterEditModal, { DEFAULT_FOOTER_CONFIG } from './FooterEditModal';
import { Edit2 } from 'lucide-react';
import { getSiteSetting, saveSiteSetting, subscribeSiteSetting } from '../../services/siteSettingsService';

const SETTING_KEY = 'footer_config';

export default function Footer() {
  const { isTeacher } = useAuth();
  const [config, setConfig] = useState(DEFAULT_FOOTER_CONFIG);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Nạp cấu hình và kết nối Real-Time từ Supabase để đồng bộ tức thì cho Học sinh
  useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
      const data = await getSiteSetting(SETTING_KEY, DEFAULT_FOOTER_CONFIG);
      if (isMounted && data) {
        setConfig(data);
      }
    };
    loadConfig();

    // Lắng nghe thay đổi Real-Time từ Giáo viên
    const unsubscribe = subscribeSiteSetting(SETTING_KEY, (newConfig) => {
      if (isMounted && newConfig) {
        setConfig(newConfig);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleSaveConfig = async (newConfig) => {
    setConfig(newConfig);
    await saveSiteSetting(SETTING_KEY, newConfig);
  };

  return (
    <footer className="bg-slate-200/90 text-slate-800 py-3.5 sm:py-4 px-6 sm:px-12 border-t border-slate-300/80 font-sans mt-6 select-text relative shadow-inner">
      {/* NÚT CHỈNH SỬA THÔNG TIN CHÂN TRANG CHO GIÁO VIÊN */}
      {isTeacher && (
        <div className="max-w-7xl mx-auto flex justify-end mb-1.5 select-none">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1 bg-white/90 hover:bg-white text-slate-800 hover:text-emerald-700 text-[11px] font-bold rounded-xl shadow-2xs border border-slate-300 transition cursor-pointer"
            title="Thầy có thể bấm vào đây để chỉnh sửa thông tin giới thiệu, liên hệ, bản quyền theo ý muốn"
          >
            <Edit2 className="w-3 h-3 text-emerald-600" />
            <span>✏️ Chỉnh sửa chân trang</span>
          </button>
        </div>
      )}

      {/* 2 CỘT NỘI DUNG CHÂN TRANG GỌN GÀNG VỪA VẶN TƯƠNG ĐƯƠNG CHIỀU CAO BANNER */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 items-start">
        {/* CỘT TRÁI: TRANG HỌC LIỆU */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-black text-slate-900 bg-slate-300/60 px-2.5 py-0.5 rounded-lg w-fit">
            {config.titleCol1 || 'Trang Học Liệu'}
          </h4>
          <p className="text-xs sm:text-[13px] text-slate-700 leading-snug font-medium whitespace-pre-line">
            {config.descCol1 || DEFAULT_FOOTER_CONFIG.descCol1}
          </p>
        </div>

        {/* CỘT PHẢI: KẾT NỐI VỚI TÔI */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-black text-slate-900 bg-slate-300/60 px-2.5 py-0.5 rounded-lg w-fit">
            {config.titleCol2 || 'Kết nối với tôi'}
          </h4>
          <div className="space-y-1 text-xs sm:text-[13px] text-slate-700 font-semibold">
            <div className="flex items-center space-x-2">
              <span className="text-sm">💬</span>
              <span>{config.teacherNameSchool || 'Nguyễn Văn Hải - THCS Đề Gi'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">✉️</span>
              <a 
                href={`mailto:${config.email || 'ngvanhaiai81@gmail.com'}`} 
                className="hover:underline hover:text-emerald-800 transition"
              >
                {config.email || 'ngvanhaiai81@gmail.com'}
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">📞</span>
              <a 
                href={`tel:${(config.phone || '+84384635199').replace(/[^0-9+]/g, '')}`} 
                className="hover:underline hover:text-emerald-800 transition"
              >
                {config.phone || '+84 (0) 384635199'}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* DÒNG BẢN QUYỀN DƯỚI CÙNG THU GỌN VỪA KHÍT DÒNG CHỮ */}
      <div className="max-w-7xl mx-auto pt-2 mt-2.5 border-t border-slate-300/70 flex flex-col sm:flex-row justify-between items-center text-[11px] sm:text-xs text-slate-600 font-semibold gap-1.5">
        <div>
          {config.copyright || 'Bản quyền thuộc © Nguyễn Văn Hải'}
        </div>
        <div className="flex items-center space-x-1">
          <span>Cung cấp bởi</span>
          <span className="font-extrabold text-slate-900 bg-white/80 px-2 py-0.5 rounded shadow-2xs border border-slate-200">
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
