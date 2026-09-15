import React, { useState, useRef } from 'react';
import { 
  X, Image as ImageIcon, Upload, Link as LinkIcon, Check, RotateCcw, 
  Sparkles, Sliders, Play, Palette, Layers, Plus, Trash2 
} from 'lucide-react';

export const BANNER_PRESETS = [
  {
    id: 'classroom-wide',
    title: 'Học sinh & Lớp học tươi vui (Trọn mặt)',
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

export const BANNER_FILTERS = [
  { id: 'none', name: 'Tự nhiên nguyên bản', css: 'none', desc: 'Màu sắc chân thực' },
  { id: 'warm', name: 'Màu ấm áp', css: 'sepia(20%) saturate(125%) brightness(96%)', desc: 'Thân thiện, rực rỡ' },
  { id: 'vintage', name: 'Vintage hoài niệm', css: 'sepia(35%) contrast(105%) brightness(92%)', desc: 'Phim nhựa 35mm' },
  { id: 'cyber', name: 'Công nghệ hiện đại', css: 'hue-rotate(190deg) saturate(120%) contrast(105%)', desc: 'Sắc xanh số 4.0' },
  { id: 'cinematic', name: 'Điện ảnh sang trọng', css: 'contrast(115%) saturate(110%) brightness(95%)', desc: 'Chiều sâu nghệ thuật' },
  { id: 'monochrome', name: 'Trầm tĩnh thanh lịch', css: 'grayscale(35%) contrast(105%)', desc: 'Nhẹ nhàng tinh tế' },
];

export const DEFAULT_BANNER_CONFIG = {
  imageUrl: BANNER_PRESETS[0].url,
  position: 'center 20%', // Giữ trọn khuôn mặt học sinh ở góc trên
  overlayOpacity: 70, // % tối lớp phủ để chữ trắng tương phản sắc nét
  colorFilter: 'none',
  slideshowEnabled: true,
  slideshowInterval: 8, // Chuyển sau mỗi 8 giây
  slideshowImages: [
    BANNER_PRESETS[0].url,
    BANNER_PRESETS[1].url,
    BANNER_PRESETS[2].url,
  ],
};

export default function HeroBannerModal({ isOpen, onClose, currentConfig, onSave }) {
  if (!isOpen) return null;

  const [config, setConfig] = useState({
    ...DEFAULT_BANNER_CONFIG,
    ...currentConfig,
    slideshowImages: Array.isArray(currentConfig?.slideshowImages) && currentConfig.slideshowImages.length > 0 
      ? currentConfig.slideshowImages 
      : DEFAULT_BANNER_CONFIG.slideshowImages,
  });

  const [activeTab, setActiveTab] = useState('photos'); // 'photos' | 'slideshow' | 'filters'
  const [inputUrl, setInputUrl] = useState('');
  const fileInputRef = useRef(null);

  const currentFilterObj = BANNER_FILTERS.find((f) => f.id === config.colorFilter) || BANNER_FILTERS[0];

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
        setConfig((prev) => {
          const newSlides = prev.slideshowImages.includes(dataUrl) 
            ? prev.slideshowImages 
            : [...prev.slideshowImages, dataUrl];
          return {
            ...prev,
            imageUrl: dataUrl,
            position: 'center 15%',
            slideshowImages: newSlides,
          };
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!inputUrl.trim()) return;
    const url = inputUrl.trim();
    setConfig((prev) => {
      const newSlides = prev.slideshowImages.includes(url) 
        ? prev.slideshowImages 
        : [...prev.slideshowImages, url];
      return {
        ...prev,
        imageUrl: url,
        slideshowImages: newSlides,
      };
    });
    setInputUrl('');
  };

  const handleToggleSlideshowImage = (url) => {
    setConfig((prev) => {
      const exists = prev.slideshowImages.includes(url);
      let newImages = [];
      if (exists) {
        if (prev.slideshowImages.length <= 1) {
          alert('Cần giữ ít nhất 1 ảnh trong danh sách trình chiếu!');
          return prev;
        }
        newImages = prev.slideshowImages.filter((img) => img !== url);
      } else {
        if (prev.slideshowImages.length >= 6) {
          alert('Chỉ nên chọn tối đa 5-6 ảnh trong Slideshow để trang tải mượt mà!');
          return prev;
        }
        newImages = [...prev.slideshowImages, url];
      }
      return {
        ...prev,
        slideshowImages: newImages,
        imageUrl: newImages[0] || prev.imageUrl,
      };
    });
  };

  const handleReset = () => {
    if (window.confirm('Thầy có chắc chắn muốn khôi phục lại toàn bộ cấu hình banner mặc định không?')) {
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
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Tùy Chỉnh Banner & Slideshow Trang Chủ</h3>
              <p className="text-[11px] text-slate-300 font-medium">Đổi ảnh trọn vẹn mặt, kích hoạt Slideshow 8s & Bộ lọc màu nghệ thuật</p>
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

        {/* TABS NAVIGATION */}
        <div className="flex items-center space-x-1 px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>🖼️ Ảnh Nền & Bố Cục</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('slideshow')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'slideshow'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Play className="w-4 h-4 text-amber-600" />
            <span>🎞️ Slideshow Tự Động ({config.slideshowImages.length} ảnh)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('filters')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'filters'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Palette className="w-4 h-4 text-indigo-600" />
            <span>🎨 Bộ Lọc Màu & Độ Sáng</span>
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* LIVE PREVIEW BANNER VỚI BỘ LỌC MÀU VÀ VỊ TRÍ THỰC TẾ */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black text-slate-800 uppercase tracking-wider">
              <span>👁️ Khung Xem Trước Banner Thực Tế</span>
              <span className="text-[11px] font-bold text-emerald-700 normal-case bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                Bộ lọc: {currentFilterObj.name} • {config.slideshowEnabled ? `Slideshow ${config.slideshowInterval}s` : 'Ảnh tĩnh'}
              </span>
            </div>
            <div className="relative h-44 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-inner">
              <div
                className="absolute inset-0 bg-cover transition-all duration-500"
                style={{
                  backgroundImage: `url('${config.imageUrl}')`,
                  backgroundPosition: config.position,
                  filter: currentFilterObj.css,
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

          {/* TAB 1: ẢNH NỀN & BỐ CỤC */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              {/* CHỌN NHANH TỪ PRESETS */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Bộ Sưu Tập Tuyển Chọn (Góc rộng không khuất mặt)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
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
                          className="h-20 bg-cover"
                          style={{
                            backgroundImage: `url('${preset.url}')`,
                            backgroundPosition: preset.position,
                            filter: currentFilterObj.css,
                          }}
                        />
                        <div className="p-2 bg-white space-y-0.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-900 truncate">{preset.title}</p>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 ml-1" />}
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{preset.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TỰ TẢI ẢNH HOẶC DÁN LINK */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Hoặc Tải Ảnh Từ Máy Tính / Dán Link:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                {/* CĂN CHỈNH GÓC HIỂN THỊ */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    🎯 Căn chỉnh góc hiển thị (Tránh bị cắt đầu / khuất mặt):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Căn trên (Ưu tiên thấy trọn mặt)', value: 'center 15%' },
                      { label: 'Căn 25% (Tiêu chuẩn học sinh)', value: 'center 25%' },
                      { label: 'Căn giữa (Center)', value: 'center center' },
                      { label: 'Căn dưới (Bottom)', value: 'center 80%' },
                    ].map((pos) => (
                      <button
                        key={pos.value}
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, position: pos.value }))}
                        className={`px-3 py-1 text-xs font-bold rounded-xl border transition cursor-pointer ${
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
              </div>
            </div>
          )}

          {/* TAB 2: SLIDESHOW TỰ ĐỘNG (8S) */}
          {activeTab === 'slideshow' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-amber-950 flex items-center space-x-1.5">
                    <Play className="w-4 h-4 text-amber-600" />
                    <span>Kích hoạt Trình Chiếu Ảnh Tự Động (Slideshow)</span>
                  </h4>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Banner sẽ tự động đổi qua lại giữa các hình ảnh Thầy đã chọn một cách mềm mại.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.slideshowEnabled}
                    onChange={(e) => setConfig((prev) => ({ ...prev, slideshowEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
                </label>
              </div>

              {/* CHỌN CHU KỲ CHUYỂN ẢNH (8S MẶC ĐỊNH) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ⏱️ Thời gian chuyển đổi giữa các ảnh:
                </label>
                <div className="flex items-center space-x-3">
                  {[
                    { sec: 5, label: '5 Giây (Nhanh)' },
                    { sec: 8, label: '8 Giây (Khuyên dùng - Chuẩn mẫu)' },
                    { sec: 12, label: '12 Giây (Thong thả)' },
                  ].map((item) => (
                    <button
                      key={item.sec}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, slideshowInterval: item.sec }))}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        config.slideshowInterval === item.sec
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CHỌN CÁC ẢNH VÀO SLIDESHOW */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Chọn 2 - 4 Tấm Ảnh Cho Slideshow:</span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    Đã chọn: {config.slideshowImages.length} ảnh
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {BANNER_PRESETS.map((preset) => {
                    const isSelected = config.slideshowImages.includes(preset.url);
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleToggleSlideshowImage(preset.url)}
                        className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition p-2 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-400/40'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div
                          className="h-16 rounded-xl bg-cover"
                          style={{
                            backgroundImage: `url('${preset.url}')`,
                            backgroundPosition: preset.position,
                          }}
                        />
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800 truncate">
                            {preset.title}
                          </span>
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                              isSelected ? 'bg-amber-500 text-white' : 'bg-slate-200 text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BỘ LỌC MÀU SẮC NGHỆ THUẬT (COLOR FILTERS) */}
          {activeTab === 'filters' && (
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                🎨 Chọn 1 Trong 6 Bộ Lọc Màu Nghệ Thuật (Áp Dụng Chỉ Với 1 Click):
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BANNER_FILTERS.map((filterItem) => {
                  const isSelected = config.colorFilter === filterItem.id;
                  return (
                    <div
                      key={filterItem.id}
                      onClick={() => setConfig((prev) => ({ ...prev, colorFilter: filterItem.id }))}
                      className={`relative rounded-2xl p-3 border-2 cursor-pointer transition transform hover:-translate-y-0.5 text-left ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-400/50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-slate-900">{filterItem.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">{filterItem.desc}</p>
                      
                      {/* MINI COLOR SWATCH PREVIEW */}
                      <div className="mt-2 h-7 rounded-lg overflow-hidden border border-slate-200">
                        <div
                          className="w-full h-full bg-cover"
                          style={{
                            backgroundImage: `url('${config.imageUrl}')`,
                            backgroundPosition: 'center 20%',
                            filter: filterItem.css,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* THANH TRƯỢT ĐỘ TỐI LỚP PHỦ OVERLAY */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>🌑 Độ tối lớp phủ để chữ trắng tương phản sắc nét:</span>
                  <span className="text-indigo-700 font-extrabold">{config.overlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="5"
                  value={config.overlayOpacity}
                  onChange={(e) => setConfig((prev) => ({ ...prev, overlayOpacity: Number(e.target.value) }))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 font-medium">
                  Khuyên dùng mức 65% - 75% để ảnh vẫn rực rỡ mà tiêu đề chữ trắng luôn nổi bật, dễ đọc nhất.
                </p>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mặc định</span>
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
