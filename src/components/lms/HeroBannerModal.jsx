import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Upload, Link as LinkIcon, Check, RotateCcw, Sparkles } from 'lucide-react';

export const BANNER_PRESETS = [
  {
    id: 'classroom-wide',
    title: 'Học sinh & Lớp học tươi vui (Góc rộng trọn mặt)',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&auto=format&fit=crop&q=80',
    position: 'center 20%',
    description: 'Bố cục góc rộng, học sinh tươi cười trọn vẹn trong khung hình',
  },
  {
    id: 'smart-classroom',
    title: 'Lớp học số & Công nghệ thông minh 4.0',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=80',
    position: 'center center',
    description: 'Không gian sư phạm hiện đại, truyền cảm hứng học tập',
  },
  {
    id: 'study-group',
    title: 'Nhóm học sinh thảo luận sôi nổi',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80',
    position: 'center 15%',
    description: 'Học tập nhóm vui tươi, căn góc trên giữ trọn khuôn mặt',
  },
  {
    id: 'modern-library',
    title: 'Thư viện tri thức hiện đại & Sách tiếng Anh',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&auto=format&fit=crop&q=80',
    position: 'center center',
    description: 'Kệ sách phong phú và ánh sáng học thuật trang nhã',
  },
  {
    id: 'laptop-desk',
    title: 'Góc học tập số với Laptop & Tài liệu',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&auto=format&fit=crop&q=80',
    position: 'center center',
    description: 'Hình ảnh công nghệ bài giảng E-learning chuyên nghiệp',
  },
  {
    id: 'teacher-workspace',
    title: 'Giảng đường & Bàn làm việc sư phạm',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&auto=format&fit=crop&q=80',
    position: 'center center',
    description: 'Không gian chuẩn mực cho thầy cô giảng dạy',
  },
];

export const DEFAULT_BANNER_CONFIG = {
  imageUrl: BANNER_PRESETS[0].url,
  position: 'center 20%', // Giữ trọn khuôn mặt học sinh ở góc trên
  overlayOpacity: 70, // % tối lớp phủ để chữ trắng tương phản sắc nét
};

export default function HeroBannerModal({ isOpen, onClose, currentConfig, onSave }) {
  if (!isOpen) return null;

  const [config, setConfig] = useState({
    ...DEFAULT_BANNER_CONFIG,
    ...currentConfig,
  });

  const [inputUrl, setInputUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleSelectPreset = (preset) => {
    setConfig((prev) => ({
      ...prev,
      imageUrl: preset.url,
      position: preset.position || 'center center',
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (PNG, JPG, WEBP)!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File ảnh quá lớn (tối đa 5MB). Vui lòng chọn ảnh nhỏ hơn để hệ thống tải nhanh!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setConfig((prev) => ({
          ...prev,
          imageUrl: dataUrl,
          position: 'center top',
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!inputUrl.trim()) return;
    setConfig((prev) => ({
      ...prev,
      imageUrl: inputUrl.trim(),
    }));
    setInputUrl('');
  };

  const handleReset = () => {
    if (window.confirm('Thầy có chắc chắn muốn khôi phục lại ảnh nền ban đầu không?')) {
      setConfig(DEFAULT_BANNER_CONFIG);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans select-none overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 animate-in fade-in duration-200">
        {/* HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Tùy Chỉnh Ảnh Nền Banner Trang Chủ</h3>
              <p className="text-[11px] text-slate-300 font-medium">Chọn ảnh đẹp, trọn vẹn khuôn mặt hoặc tải ảnh từ máy tính của Thầy</p>
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

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* PREVIEW KHUNG XEM TRƯỚC BANNER */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <span>👁️ Khung Xem Trước Banner Thực Tế</span>
            </label>
            <div className="relative h-44 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-inner">
              <div
                className="absolute inset-0 bg-cover transition-all duration-300"
                style={{
                  backgroundImage: `url('${config.imageUrl}')`,
                  backgroundPosition: config.position,
                }}
              />
              <div 
                className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent transition-opacity"
                style={{ opacity: config.overlayOpacity / 100 }}
              />
              <div className="relative z-10 p-5 h-full flex flex-col justify-between text-white">
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-2.5 py-0.5 rounded-lg w-fit border border-emerald-500/30">
                  SỔ TAY DẠY HỌC THCS • GLOBAL SUCCESS
                </span>
                <div className="space-y-1">
                  <h4 className="text-lg font-black drop-shadow-md">Chào mừng trở lại, Thầy Nguyễn Văn Hải! 👋</h4>
                  <p className="text-[11px] text-slate-200 font-medium line-clamp-1">
                    Khám phá nền tảng giáo dục thông minh với đầy đủ công cụ quản lý chuyên môn và bài giảng tương tác.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CHỌN NHANH TỪ BỘ SƯU TẬP PRESETS */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Gợi ý Ảnh Tuyển Chọn (Không bị khuất mặt, sắc nét HD)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {BANNER_PRESETS.map((preset) => {
                const isSelected = config.imageUrl === preset.url;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition transform hover:-translate-y-0.5 shadow-xs ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-400/50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className="h-24 bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${preset.url}')`,
                        backgroundPosition: preset.position,
                      }}
                    />
                    <div className="p-2.5 bg-white space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">{preset.title}</p>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-1" />}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{preset.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TÙY CHỌN TỰ TẢI ẢNH HOẶC DÁN LINK */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              Hoặc Thầy tự tải ảnh từ máy tính hoặc dán link ảnh:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* NÚT TẢI FILE TỪ MÁY */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2.5 rounded-xl border border-dashed border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Chọn ảnh từ máy tính của Thầy</span>
                </button>
              </div>

              {/* DÁN LINK URL */}
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Dán link ảnh URL vào đây..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex-shrink-0 cursor-pointer transition"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* CĂN CHỈNH GÓC HIỂN THỊ (POSITION) ĐỂ KHÔNG BỊ KHUẤT MẶT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  🎯 Căn chỉnh góc hiển thị (Tránh bị cắt đầu / khuất mặt):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Căn trên (Ưu tiên thấy trọn mặt)', value: 'center 15%' },
                    { label: 'Căn giữa (Center)', value: 'center center' },
                    { label: 'Căn dưới (Bottom)', value: 'center 80%' },
                  ].map((pos) => (
                    <button
                      key={pos.value}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, position: pos.value }))}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                        config.position === pos.value
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ĐỘ TỐI LỚP PHỦ OVERLAY */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>🌑 Độ tối lớp phủ đọc chữ:</span>
                  <span className="text-emerald-700">{config.overlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="5"
                  value={config.overlayOpacity}
                  onChange={(e) => setConfig((prev) => ({ ...prev, overlayOpacity: Number(e.target.value) }))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục ảnh mẫu chuẩn</span>
            </button>

            <div className="w-full sm:w-auto flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Lưu Áp Dụng Banner</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
