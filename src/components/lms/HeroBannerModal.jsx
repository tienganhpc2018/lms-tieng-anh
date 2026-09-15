import React, { useState, useRef } from 'react';
import { 
  X, Image as ImageIcon, Upload, Link as LinkIcon, Check, RotateCcw, 
  Sparkles, Sliders, Play, Palette, Layers, Plus, Trash2, Calendar, 
  ZoomIn, Pause, Sun, BookOpen, Heart, Award, Volume2, Sparkle, Clock
} from 'lucide-react';
import { playWelcomeChime } from '../../utils/audioChime';

export const BANNER_PRESETS = [
  {
    id: 'classroom-sharp-hd',
    title: 'Lớp học hiện đại sắc nét 100% (Không mờ, trọn mặt)',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=90',
    position: 'center center',
    description: 'Không gian sư phạm hiện đại, cô giáo và học sinh vui tươi, ảnh sắc nét sáng rõ từng chi tiết',
  },
  {
    id: 'smart-classroom',
    title: 'Lớp học số & Công nghệ thông minh 4.0',
    url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1600&auto=format&fit=crop&q=90',
    position: 'center center',
    description: 'Phòng học tương tác chất lượng cao, độ nét cao không bị nhòe mờ',
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

export const SEASONAL_THEMES = [
  {
    id: 'auto',
    name: 'Tự động theo lịch năm học (Khuyên dùng)',
    badge: '📅 THEO LỊCH NĂM HỌC TỰ ĐỘNG',
    slogan: 'Tự động kích hoạt chủ đề Khai giảng, Trung Thu, 20/11, Tết hoặc Mùa thi theo ngày tháng',
    icon: '📅',
    colorClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
    particleType: 'confetti',
  },
  {
    id: 'khai_giang',
    name: 'Mùa Khai Giảng & Tựu Trường (Tháng 9)',
    badge: '🎒 CHÀO NĂM HỌC MỚI • TỰ HÀO THCS ĐỀ GI',
    slogan: 'Chúc các em học sinh một năm học mới nhiều hứng khởi, bứt phá xuất sắc môn Tiếng Anh!',
    icon: '🎒',
    presetUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&auto=format&fit=crop&q=80',
    position: 'center 20%',
    colorClass: 'bg-amber-950/90 text-amber-400 border-amber-500/40',
    particleType: 'confetti',
  },
  {
    id: 'trung_thu',
    name: 'Đêm Hội Trăng Rằm & Tết Trung Thu (Tháng 8 ÂL / Tháng 9-10)',
    badge: '🥮 ĐÊM HỘI TRĂNG RẰM • TẾT TRUNG THU THCS ĐỀ GI',
    slogan: 'Vui Tết Trung Thu rước đèn trông trăng - Chúc các em học sinh luôn vui tươi, chăm ngoan và học giỏi!',
    icon: '🏮',
    presetUrl: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=1600&auto=format&fit=crop&q=80',
    position: 'center center',
    colorClass: 'bg-amber-950/90 text-yellow-300 border-amber-400/50',
    particleType: 'trung_thu',
  },
  {
    id: 'tri_an_2011',
    name: 'Kỷ Niệm Ngày Nhà Giáo Việt Nam 20/11',
    badge: '💐 TRI ÂN THẦY CÔ • KỶ NIỆM 20/11',
    slogan: 'Tôn sư trọng đạo - Kính chúc Quý Thầy Cô luôn dồi dào sức khỏe, nhiệt huyết và hạnh phúc!',
    icon: '💐',
    presetUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&auto=format&fit=crop&q=80',
    position: 'center center',
    colorClass: 'bg-rose-950/90 text-rose-300 border-rose-500/40',
    particleType: 'confetti',
  },
  {
    id: 'tet_xuan',
    name: 'Mừng Xuân Mới & Tết Cổ Truyền (Tháng 1-2)',
    badge: '🌸 CHÚC MỪNG NĂM MỚI • XUÂN RỰC RỠ',
    slogan: 'Xuân mới thắng lợi mới, chúc Thầy Cô và các em an khang thịnh vượng, vạn sự cát tường!',
    icon: '🌸',
    presetUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80',
    position: 'center 15%',
    colorClass: 'bg-red-950/90 text-yellow-300 border-yellow-500/40',
    particleType: 'mai_dao',
  },
  {
    id: 'on_thi_hk',
    name: 'Chiến Dịch Ôn Thi Học Kỳ & Tuyển Sinh (Tháng 12, 4-5)',
    badge: '🎯 CHIẾN DỊCH ÔN THI HỌC KỲ • TỰ TIN BỨT PHÁ ĐIỂM 10',
    slogan: 'Nỗ lực hôm nay, thành công ngày mai - Chúc các em học sinh làm bài tự tin và đạt điểm số tối đa!',
    icon: '🎯',
    presetUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=80',
    position: 'center center',
    colorClass: 'bg-blue-950/90 text-cyan-300 border-cyan-500/40',
    particleType: 'confetti',
  },
  {
    id: 'none',
    name: 'Tắt chủ đề sự kiện (Dùng chuẩn thông thường)',
    badge: 'SỔ TAY DẠY HỌC THCS • GLOBAL SUCCESS',
    slogan: 'Khám phá nền tảng giáo dục thông minh với đầy đủ công cụ quản lý chuyên môn, bài giảng tương tác.',
    icon: '✨',
    colorClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
    particleType: 'none',
  },
];

/**
 * Tự động phát hiện chủ đề sự kiện dựa trên ngày tháng thực tế
 */
export function getActiveSeasonalTheme(selectedId) {
  if (!selectedId || selectedId === 'none') return null;

  if (selectedId === 'auto') {
    const now = new Date();
    const month = now.getMonth() + 1; // 1 đến 12
    const day = now.getDate();

    if (month === 9) {
      // Đầu tháng 9 là Khai giảng, giữa/cuối tháng 9 là Trung Thu
      return day <= 15 
        ? SEASONAL_THEMES.find((t) => t.id === 'khai_giang')
        : SEASONAL_THEMES.find((t) => t.id === 'trung_thu');
    } else if (month === 10) {
      return SEASONAL_THEMES.find((t) => t.id === 'trung_thu');
    } else if (month === 11) {
      return SEASONAL_THEMES.find((t) => t.id === 'tri_an_2011');
    } else if (month === 1 || month === 2) {
      return SEASONAL_THEMES.find((t) => t.id === 'tet_xuan');
    } else if (month === 12 || month === 4 || month === 5) {
      return SEASONAL_THEMES.find((t) => t.id === 'on_thi_hk');
    } else {
      return null;
    }
  }

  return SEASONAL_THEMES.find((t) => t.id === selectedId) || null;
}

export const DEFAULT_BANNER_CONFIG = {
  imageUrl: BANNER_PRESETS[0].url,
  position: 'center center',
  overlayOpacity: 0, // Tắt hoàn toàn độ mờ/tối, giữ bức ảnh trong suốt sắc nét 100%
  colorFilter: 'none',
  slideshowEnabled: true,
  slideshowInterval: 8, // Chuyển sau mỗi 8 giây
  kenBurnsEnabled: true, // Hiệu ứng thu phóng nhẹ 3-5% sống động như phim
  pauseOnHover: true, // Tạm dừng slideshow khi rê chuột vào để đọc
  seasonalTheme: 'auto', // Tự động theo lịch năm học
  particlesEnabled: true, // Hiệu ứng hoa mai, tuyết rơi, lồng đèn
  audioChimeEnabled: true, // Chuông chào mừng nhẹ nhàng khi bắt đầu giờ học
  countdownEnabled: true, // Đồng hồ đếm ngược ngày thi
  countdownTitle: 'Kỳ Thi Tuyển Sinh Vào Lớp 10',
  countdownTargetDate: '2026-06-08T07:30:00',
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

  const [activeTab, setActiveTab] = useState('photos'); // 'photos' | 'slideshow' | 'filters' | 'seasonal'
  const [inputUrl, setInputUrl] = useState('');
  const fileInputRef = useRef(null);

  const currentFilterObj = BANNER_FILTERS.find((f) => f.id === config.colorFilter) || BANNER_FILTERS[0];
  const activeSeason = getActiveSeasonalTheme(config.seasonalTheme);

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
              <h3 className="text-base font-extrabold tracking-tight">Tùy Chỉnh Banner, Slideshow & Lễ Hội</h3>
              <p className="text-[11px] text-slate-300 font-medium">Trung Thu, THCS Đề Gi, Hạt rơi lễ hội, Chuông đầu giờ & Đếm ngược ngày thi</p>
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
        <div className="flex items-center space-x-1 px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`px-3.5 py-2.5 rounded-t-xl transition flex items-center space-x-1.5 cursor-pointer flex-shrink-0 ${
              activeTab === 'photos'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>🖼️ Ảnh Nền</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('slideshow')}
            className={`px-3.5 py-2.5 rounded-t-xl transition flex items-center space-x-1.5 cursor-pointer flex-shrink-0 ${
              activeTab === 'slideshow'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Play className="w-4 h-4 text-amber-600" />
            <span>🎞️ Slideshow & Hiệu Ứng</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('filters')}
            className={`px-3.5 py-2.5 rounded-t-xl transition flex items-center space-x-1.5 cursor-pointer flex-shrink-0 ${
              activeTab === 'filters'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Palette className="w-4 h-4 text-indigo-600" />
            <span>🎨 Bộ Lọc Màu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seasonal')}
            className={`px-3.5 py-2.5 rounded-t-xl transition flex items-center space-x-1.5 cursor-pointer flex-shrink-0 ${
              activeTab === 'seasonal'
                ? 'bg-white text-rose-700 border-t-2 border-rose-600 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-rose-600" />
            <span>🎊 Lễ Hội & Mùa Thi</span>
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* LIVE PREVIEW BANNER */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black text-slate-800 uppercase tracking-wider">
              <span>👁️ Khung Xem Trước Banner Thực Tế</span>
              <span className="text-[11px] font-bold text-emerald-700 normal-case bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                {activeSeason ? `Sự kiện: ${activeSeason.name}` : `Bộ lọc: ${currentFilterObj.name}`}
              </span>
            </div>
            <div className="relative h-44 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-inner">
              <div
                className={`absolute inset-0 bg-cover transition-all duration-500 ${config.kenBurnsEnabled ? 'scale-105' : 'scale-100'}`}
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
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-lg w-fit border ${activeSeason?.colorClass || 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'}`}>
                  {activeSeason?.badge || 'SỔ TAY DẠY HỌC THCS • GLOBAL SUCCESS'}
                </span>
                <div className="space-y-1">
                  <h4 className="text-lg font-black drop-shadow-md">Chào mừng trở lại, Thầy Nguyễn Văn Hải! 👋</h4>
                  <p className="text-[11px] text-slate-200 font-medium line-clamp-1">
                    {activeSeason?.slogan || 'Khám phá nền tảng giáo dục thông minh với đầy đủ công cụ quản lý chuyên môn và bài giảng tương tác.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: ẢNH NỀN & BỐ CỤC */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
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

          {/* TAB 2: SLIDESHOW & HIỆU ỨNG (KEN BURNS + PAUSE ON HOVER) */}
          {activeTab === 'slideshow' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-amber-950 flex items-center space-x-1.5">
                    <Play className="w-4 h-4 text-amber-600" />
                    <span>Kích hoạt Trình Chiếu Ảnh Tự Động (Slideshow)</span>
                  </h4>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Banner tự động luân chuyển mềm mại giữa các ảnh đã chọn.
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

              {/* 2 HIỆU ỨNG NÂNG CAO: KEN BURNS & PAUSE ON HOVER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* KEN BURNS EFFECT */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5 pr-2">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                      <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Hiệu ứng Ken Burns (Thu phóng nhẹ 3-5%)</span>
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      Ảnh phóng to chậm tạo cảm giác sống động như phim tư liệu
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={config.kenBurnsEnabled}
                      onChange={(e) => setConfig((prev) => ({ ...prev, kenBurnsEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                  </label>
                </div>

                {/* PAUSE ON HOVER */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5 pr-2">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                      <Pause className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tạm dừng khi rê chuột (Pause on Hover)</span>
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      Dừng chuyển ảnh khi đang đọc dòng chữ để không bị rối mắt
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={config.pauseOnHover}
                      onChange={(e) => setConfig((prev) => ({ ...prev, pauseOnHover: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                  </label>
                </div>
              </div>

              {/* CHỌN CHU KỲ CHUYỂN ẢNH (8S MẶC ĐỊNH) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ⏱️ Thời gian chu kỳ chuyển đổi giữa các ảnh:
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
                  <span>Chọn các ảnh trình chiếu trong Slideshow:</span>
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

          {/* TAB 3: BỘ LỌC MÀU SẮC NGHỆ THUẬT */}
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

              {/* THANH TRƯỢT ĐỘ TỐI LỚP PHỦ */}
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
              </div>
            </div>
          )}

          {/* TAB 4: SỰ KIỆN LỄ HỘI, HẠT RƠI, CHUÔNG & ĐẾM NGƯỢC NGÀY THI */}
          {activeTab === 'seasonal' && (
            <div className="space-y-5">
              <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-1">
                <h4 className="text-xs font-black text-rose-950 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-rose-600" />
                  <span>Chủ Đề Sự Kiện Mùa & Lễ Hội Năm Học THCS Đề Gi</span>
                </h4>
                <p className="text-[11px] text-rose-800 font-medium leading-relaxed">
                  Tự động hoặc thủ công thay đổi diện mạo banner theo các mốc ý nghĩa: Khai giảng, Trung Thu, 20/11, Tết cổ truyền và Mùa ôn thi.
                </p>
              </div>

              {/* DANH SÁCH CHỦ ĐỀ SỰ KIỆN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SEASONAL_THEMES.map((theme) => {
                  const isSelected = config.seasonalTheme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setConfig((prev) => ({ ...prev, seasonalTheme: theme.id }))}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition transform hover:-translate-y-0.5 text-left ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-400/50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                          <span className="text-sm">{theme.icon}</span>
                          <span>{theme.name}</span>
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-rose-600 flex-shrink-0 ml-1" />}
                      </div>
                      <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded border mb-1.5 ${theme.colorClass}`}>
                        {theme.badge}
                      </span>
                      <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                        {theme.slogan}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* KHỐI TÙY CHỌN NÂNG CAO: HẠT RƠI, CHUÔNG ĐẦU GIỜ & ĐẾM NGƯỢC */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Tiện Ích Tương Tác Lễ Hội & Mùa Thi</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. HIỆU ỨNG HẠT RƠI (PARTICLE EFFECTS) */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                        <span>🌸</span>
                        <span>Hạt rơi lễ hội (Hoa mai, tuyết, lồng đèn)</span>
                      </span>
                      <p className="text-[10px] text-slate-500">Hiệu ứng cánh hoa / lồng đèn / pháo giấy bay lượn trên banner</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={config.particlesEnabled}
                        onChange={(e) => setConfig((prev) => ({ ...prev, particlesEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600" />
                    </label>
                  </div>

                  {/* 2. CHUÔNG CHÀO MỪNG ĐẦU GIỜ (AUDIO CHIME) */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chuông chào mừng đầu giờ (2s)</span>
                      </span>
                      <p className="text-[10px] text-slate-500">Âm thanh chuông nhẹ nhàng truyền cảm hứng khi vào học</p>
                      <button
                        type="button"
                        onClick={playWelcomeChime}
                        className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center space-x-1 pt-0.5 cursor-pointer"
                      >
                        <span>🔊 Bấm nghe thử chuông</span>
                      </button>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={config.audioChimeEnabled}
                        onChange={(e) => setConfig((prev) => ({ ...prev, audioChimeEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                    </label>
                  </div>
                </div>

                {/* 3. ĐỒNG HỒ ĐẾM NGƯỢC NGÀY THI (COUNTDOWN TIMER) */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Đồng hồ đếm ngược ngày thi trực tiếp trên Banner</span>
                      </span>
                      <p className="text-[10px] text-slate-500">Đếm ngược chính xác Ngày, Giờ, Phút, Giây đến ngày thi học kỳ / lớp 10</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={config.countdownEnabled}
                        onChange={(e) => setConfig((prev) => ({ ...prev, countdownEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600" />
                    </label>
                  </div>

                  {config.countdownEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">Tên kỳ thi:</label>
                        <input
                          type="text"
                          value={config.countdownTitle}
                          onChange={(e) => setConfig((prev) => ({ ...prev, countdownTitle: e.target.value }))}
                          placeholder="Ví dụ: Kỳ Thi Tuyển Sinh Lớp 10"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 bg-slate-50 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">Ngày diễn ra kỳ thi:</label>
                        <input
                          type="datetime-local"
                          value={config.countdownTargetDate?.substring(0, 16) || '2026-06-08T07:30'}
                          onChange={(e) => setConfig((prev) => ({ ...prev, countdownTargetDate: e.target.value }))}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 bg-slate-50 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
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
