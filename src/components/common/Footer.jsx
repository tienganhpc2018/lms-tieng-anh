import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import FooterEditModal, { DEFAULT_FOOTER_CONFIG } from './FooterEditModal';
import { Edit2, GraduationCap } from 'lucide-react';
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
    <footer className="w-full bg-emerald-50/95 backdrop-blur-md text-slate-800 border-t border-emerald-200/90 font-sans mt-8 select-none py-3.5 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-left">
        {/* KHỐI TRÁI: BIỂU TƯỢNG HỌC THUẬT + TIÊU ĐỀ & PHỤ ĐỀ HỌC LIỆU CHUẨN ẢNH 2 */}
        <div className="flex items-center space-x-3 text-left w-full md:w-auto">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="select-text">
            <h4 className="font-black text-xs sm:text-sm text-slate-900 tracking-tight leading-snug">
              {config.title || DEFAULT_FOOTER_CONFIG.title}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-tight">
              {config.subtitle || DEFAULT_FOOTER_CONFIG.subtitle}
            </p>
          </div>
        </div>

        {/* KHỐI PHẢI: BẢN QUYỀN + NÚT CHỈNH SỬA CHO GIÁO VIÊN */}
        <div className="flex items-center justify-between md:justify-end space-x-3 w-full md:w-auto text-right select-text">
          <span className="text-[11px] sm:text-xs text-slate-600 font-semibold tracking-tight">
            {config.copyright || DEFAULT_FOOTER_CONFIG.copyright}
          </span>
          {isTeacher && (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-xl shadow-2xs border border-emerald-300/90 transition cursor-pointer flex-shrink-0"
              title="Chỉnh sửa thông tin chân trang"
            >
              <Edit2 className="w-3 h-3 text-emerald-600" />
              <span>Chỉnh sửa chân trang</span>
            </button>
          )}
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
