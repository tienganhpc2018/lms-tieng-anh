import React, { useState } from 'react';
import { Heart, Edit3, Eye, Calendar, Image as ImageIcon } from 'lucide-react';
import { CATEGORY_BADGES } from '../constants/filmReelPresets';
import { playClick } from '../../../utils/soundEffects';

// Dải đục lỗ răng cưa phim nhựa 35mm (35mm Sprocket Holes)
function SprocketStrip() {
  return (
    <div className="bg-[#0b0e14] py-1.5 px-3 flex items-center justify-between overflow-hidden select-none">
      {[...Array(14)].map((_, i) => (
        <div
          key={i}
          className="w-2.5 h-1.5 bg-[#1f2430] border border-slate-700/60 rounded-[1.5px] shrink-0 mx-1 shadow-inner"
        />
      ))}
    </div>
  );
}

export default function FilmReelCard({
  reel,
  onView,
  onEdit,
  onLike,
}) {
  const [isLiking, setIsLiking] = useState(false);

  // Đếm tổng số lượng ảnh (ảnh bìa + ảnh trong các khối)
  const imageCount =
    (reel.coverImage ? 1 : 0) +
    (reel.blocks?.filter((b) => b.type === 'image' && b.url)?.length || 0);

  // Lấy đoạn văn đầu tiên làm tóm tắt
  const summaryText =
    reel.blocks?.find((b) => b.type === 'paragraph' && b.text)?.text ||
    'Không có mô tả chi tiết...';

  // Định dạng ngày hiển thị (DD/MM/YYYY)
  const formattedDate = reel.eventDate
    ? new Date(reel.eventDate).toLocaleDateString('vi-VN')
    : 'Chưa có ngày';

  const categoryConfig =
    CATEGORY_BADGES[reel.category] || CATEGORY_BADGES['Kỷ niệm'];

  const handleHeartClick = (e) => {
    e.stopPropagation();
    setIsLiking(true);
    playClick();
    if (onLike) onLike(reel.id);
    setTimeout(() => setIsLiking(false), 300);
  };

  return (
    <div className="bg-[#121620] border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl hover:border-purple-500/50 hover:shadow-purple-900/20 transition-all duration-300 flex flex-col group">
      {/* 1. RĂNG CƯA PHIM TRÊN CÙNG */}
      <SprocketStrip />

      {/* 2. KHUNG ẢNH BÌA TỶ LỆ 16:9 */}
      <div
        onClick={() => onView && onView(reel)}
        className="relative aspect-video w-full overflow-hidden cursor-pointer bg-slate-950"
      >
        <img
          src={reel.coverImage || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80'}
          alt={reel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Lớp phủ gradient mờ nhẹ */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-transparent to-black/30 pointer-events-none" />

        {/* Góc trên trái: Nhãn danh mục hoạt động */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md backdrop-blur-md ${categoryConfig.badgeBg}`}
          >
            {reel.category || 'Kỷ niệm'}
          </span>
        </div>

        {/* Góc trên phải: Huy hiệu số lượng ảnh */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-black/60 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
            <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
            <span>{imageCount} ảnh</span>
          </span>
        </div>

        {/* Góc dưới trái: Ngày sự kiện */}
        <div className="absolute bottom-2.5 left-3 z-10">
          <span className="text-white text-xs font-bold flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <Calendar className="w-3.5 h-3.5 text-rose-400" />
            <span>{formattedDate}</span>
          </span>
        </div>
      </div>

      {/* 3. DẢI RĂNG CƯA PHÂN CÁCH GIỮA ẢNH VÀ NỘI DUNG */}
      <SprocketStrip />

      {/* 4. NỘI DUNG BÀI VIẾT */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#121620]">
        <div className="space-y-1.5">
          <h3
            onClick={() => onView && onView(reel)}
            className="text-base font-black text-white line-clamp-2 leading-snug cursor-pointer group-hover:text-purple-300 transition-colors"
          >
            {reel.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
            {summaryText}
          </p>
        </div>

        {/* 5. FOOTER THAO TÁC (Thả tim, Sửa, Xem chi tiết) */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
          {/* Nút thả tim nảy pop */}
          <button
            type="button"
            onClick={handleHeartClick}
            className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              reel.isLiked
                ? 'bg-rose-950/80 border border-rose-500/80 text-rose-400 shadow-sm shadow-rose-900/30'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                reel.isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              } ${isLiking ? 'scale-135' : ''}`}
            />
            <span>{reel.likesCount || 0}</span>
          </button>

          {/* Cụm nút Sửa & Xem */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playClick();
                if (onEdit) onEdit(reel);
              }}
              title="Chỉnh sửa bài viết"
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                playClick();
                if (onView) onView(reel);
              }}
              className="px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-purple-600/30 active:scale-95 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. RĂNG CƯA PHIM DƯỚI ĐÁY */}
      <SprocketStrip />
    </div>
  );
}
