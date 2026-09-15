import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Film,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { CATEGORY_BADGES } from '../constants/filmReelPresets';
import { playClick } from '../../../utils/soundEffects';

const SLIDE_DURATION = 4000; // 4 giây mỗi slide

export default function FilmReelSlideshow({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Quản lý đếm ngược 4s và chuyển slide
  useEffect(() => {
    if (!isOpen || !isPlaying || images.length <= 1) {
      setProgress(0);
      return;
    }

    const stepTime = 50; // cập nhật tiến trình mỗi 50ms
    const totalSteps = SLIDE_DURATION / stepTime;
    let stepCount = 0;

    progressIntervalRef.current = setInterval(() => {
      stepCount++;
      const currentPct = (stepCount / totalSteps) * 100;
      setProgress(currentPct);

      if (stepCount >= totalSteps) {
        stepCount = 0;
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setProgress(0);
      }
    }, stepTime);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isOpen, isPlaying, currentIndex, images.length]);

  // Lắng nghe phím tắt: Space, ArrowLeft, ArrowRight, Esc
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length]);

  // Lắng nghe thay đổi trạng thái Fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex] || images[0];
  const categoryConfig =
    CATEGORY_BADGES[currentImg.category] || CATEGORY_BADGES['Kỷ niệm'];

  const handleNext = () => {
    playClick();
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    playClick();
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleFullscreen = () => {
    playClick();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[90] flex flex-col justify-between bg-black text-white select-none animate-in fade-in duration-300"
    >
      {/* 1. RĂNG CƯA PHIM 35MM TRÊN CÙNG */}
      <div className="bg-[#0b0e14] py-2 px-4 flex items-center justify-between overflow-hidden border-b border-white/10 shrink-0">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-2 bg-[#1f2430] border border-slate-700/60 rounded-[2px] shrink-0 mx-1 shadow-inner"
          />
        ))}
      </div>

      {/* 2. THANH TIÊU ĐỀ & ĐIỀU KHIỂN TRÊN CÙNG */}
      <div className="px-6 py-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wide text-white uppercase flex items-center gap-2">
              TRÌNH CHIẾU CUỘN PHIM LỚP HỌC
              <span className="text-[10px] bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full border border-purple-400/30">
                {currentIndex + 1} / {images.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Phím Space: Phát / Dừng • Mũi tên: Chuyển ảnh • Phím Esc: Thoát
            </p>
          </div>
        </div>

        {/* Các nút tác vụ góc phải */}
        <div className="flex items-center gap-2">
          {/* Nút Play / Pause */}
          <button
            type="button"
            onClick={() => {
              playClick();
              setIsPlaying(!isPlaying);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Tạm Dừng' : 'Phát Tiếp'}</span>
          </button>

          {/* Nút Toàn màn hình */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Nút Đóng */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white flex items-center justify-center border border-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. KHU VỰC CHIẾU ẢNH TRUNG TÂM */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-2 overflow-hidden">
        {/* Nút Lùi */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-2xl"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Khung ảnh chính */}
        <div className="relative max-w-6xl max-h-[68vh] w-full h-full flex flex-col items-center justify-center">
          <img
            key={currentImg.url}
            src={currentImg.url}
            alt={currentImg.caption || currentImg.reelTitle}
            className="max-h-[65vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-500"
          />

          {/* Hộp thông tin sự kiện nổi bật */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-3xl bg-black/75 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center shadow-2xl space-y-1.5 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-center gap-2.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${categoryConfig.badgeBg}`}>
                {currentImg.category || 'Kỷ niệm'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide truncate">
                {currentImg.reelTitle}
              </h3>
              {currentImg.eventDate && (
                <span className="text-xs text-slate-300 font-bold flex items-center gap-1 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  {new Date(currentImg.eventDate).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>

            {currentImg.caption && (
              <p className="text-xs sm:text-sm text-purple-200 font-medium line-clamp-2 leading-relaxed">
                "{currentImg.caption}"
              </p>
            )}
          </div>
        </div>

        {/* Nút Tiến */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-2xl"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* 4. THANH TIẾN TRÌNH ĐẾM NGƯỢC 4 GIÂY */}
      <div className="w-full bg-slate-900 h-1.5 relative overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 h-full transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 5. RĂNG CƯA PHIM 35MM DƯỚI ĐÁY */}
      <div className="bg-[#0b0e14] py-2 px-4 flex items-center justify-between overflow-hidden border-t border-white/10 shrink-0">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-2 bg-[#1f2430] border border-slate-700/60 rounded-[2px] shrink-0 mx-1 shadow-inner"
          />
        ))}
      </div>
    </div>
  );
}
