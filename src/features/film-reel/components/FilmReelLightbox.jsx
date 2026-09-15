import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Calendar, Tag } from 'lucide-react';
import { playClick } from '../../../utils/soundEffects';

export default function FilmReelLightbox({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onIndexChange,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex] || images[0];

  const handleNext = () => {
    playClick();
    if (onIndexChange) {
      onIndexChange((currentIndex + 1) % images.length);
    }
  };

  const handlePrev = () => {
    playClick();
    if (onIndexChange) {
      onIndexChange((currentIndex - 1 + images.length) % images.length);
    }
  };

  const handleDownload = () => {
    if (!currentImg?.url) return;
    const a = document.createElement('a');
    a.href = currentImg.url;
    a.download = `film-reel-photo-${currentIndex + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* Nút đóng góc trên phải */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 active:scale-95"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Nút tải ảnh */}
      <button
        type="button"
        onClick={handleDownload}
        title="Tải ảnh về máy"
        className="absolute top-4 right-18 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 active:scale-95"
      >
        <Download className="w-5 h-5" />
      </button>

      {/* Số thứ tự ảnh góc trên trái */}
      <div className="absolute top-4 left-4 z-20 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-bold text-white">
        Ảnh {currentIndex + 1} / {images.length}
      </div>

      {/* Nút Lùi ảnh */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 active:scale-95"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {/* Khung chứa ảnh chính */}
      <div className="relative max-w-5xl max-h-[80vh] mx-auto px-4 flex flex-col items-center justify-center">
        <img
          src={currentImg.url}
          alt={currentImg.caption || 'Hình ảnh cuộn phim'}
          className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200"
        />

        {/* Chú thích ảnh & Thông tin sự kiện */}
        <div className="mt-4 text-center max-w-2xl px-4 space-y-1">
          {currentImg.caption && (
            <p className="text-white text-sm font-semibold leading-relaxed drop-shadow-md">
              {currentImg.caption}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
            {currentImg.reelTitle && (
              <span className="font-bold text-purple-300">
                {currentImg.reelTitle}
              </span>
            )}
            {currentImg.eventDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(currentImg.eventDate).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nút Tiến ảnh */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 active:scale-95"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}
    </div>
  );
}
