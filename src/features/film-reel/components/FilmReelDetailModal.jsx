import React, { useState } from 'react';
import {
  X,
  Printer,
  Play,
  Heart,
  Edit3,
  Trash2,
  Calendar,
  Share2,
  Sparkles,
  Maximize2,
  Image as ImageIcon,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';
import { CATEGORY_BADGES } from '../constants/filmReelPresets';
import { playClick, playDeduct } from '../../../utils/soundEffects';

export default function FilmReelDetailModal({
  isOpen,
  onClose,
  reel,
  classNameTitle = '',
  onEdit,
  onDelete,
  onLike,
  onPlaySlideshow,
  onOpenLightbox,
}) {
  const [isLiking, setIsLiking] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  if (!isOpen || !reel) return null;

  const handleCopyLink = () => {
    playClick();
    const shareUrl = `${window.location.origin}${window.location.pathname}?memoryId=${reel.id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopyToast(true);
        setTimeout(() => setCopyToast(false), 3000);
      });
    } else {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 3000);
    }
  };

  const handleShareZalo = () => {
    playClick();
    const shareUrl = `${window.location.origin}${window.location.pathname}?memoryId=${reel.id}`;
    const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(reel.title)}`;
    window.open(zaloUrl, '_blank', 'width=650,height=550');
  };

  const categoryConfig =
    CATEGORY_BADGES[reel.category] || CATEGORY_BADGES['Kỷ niệm'];

  const formattedDate = reel.eventDate
    ? new Date(reel.eventDate).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Thu thập tất cả ảnh trong bài để mở lightbox
  const allImages = [];
  if (reel.coverImage) {
    allImages.push({
      url: reel.coverImage,
      caption: reel.title,
      reelTitle: reel.title,
      category: reel.category,
      eventDate: reel.eventDate,
    });
  }
  reel.blocks?.forEach((b) => {
    if (b.type === 'image' && b.url) {
      allImages.push({
        url: b.url,
        caption: b.caption || reel.title,
        reelTitle: reel.title,
        category: reel.category,
        eventDate: reel.eventDate,
      });
    }
  });

  const handlePrint = () => {
    playClick();
    window.print();
  };

  const handleHeartClick = () => {
    setIsLiking(true);
    playClick();
    if (onLike) onLike(reel.id);
    setTimeout(() => setIsLiking(false), 300);
  };

  const handleDelete = () => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa bài viết "${reel.title}"?`)) {
      playDeduct();
      if (onDelete) onDelete(reel.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto pt-16 sm:pt-8 pb-10 print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:rounded-none">
        {/* CSS DÀN TRANG IN CHUẨN KHỔ GIẤY A4 */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .print-container, .print-container * {
              visibility: visible;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 20px;
              background: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}} />

        <div className="print-container">
          {/* 1. THANH TÁC VỤ HEADER (ẨN KHI IN) */}
          <div className="no-print bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎞️</span>
              <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                NHẬT KÝ KỶ NIỆM LỚP HỌC
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Nút In A4 */}
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In A4 / Lưu PDF</span>
              </button>

              {/* Nút Trình chiếu bài này */}
              {allImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    if (onPlaySlideshow) onPlaySlideshow(allImages);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Trình Chiếu</span>
                </button>
              )}

              {/* Nút Sửa */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  if (onEdit) onEdit(reel);
                  onClose();
                }}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700 cursor-pointer"
                title="Sửa bài viết"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {/* Nút Xóa */}
              <button
                type="button"
                onClick={handleDelete}
                className="w-8 h-8 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 flex items-center justify-center transition-colors border border-rose-800/60 cursor-pointer"
                title="Xóa bài viết"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Nút Đóng */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. KHU VỰC ẢNH BÌA HERO (16:9) */}
          <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
            <img
              src={reel.coverImage}
              alt={reel.title}
              className="w-full h-full object-cover cursor-pointer hover:scale-102 transition-transform duration-300"
              onClick={() => onOpenLightbox && onOpenLightbox(allImages, 0)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white space-y-3">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${categoryConfig.badgeBg}`}>
                  {reel.category || 'Kỷ niệm'}
                </span>
                {allImages.length > 0 && (
                  <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                    <span>{allImages.length} ảnh</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black leading-tight drop-shadow-md">
                {reel.title}
              </h1>

              <div className="flex items-center gap-4 text-xs text-slate-300 font-medium">
                {formattedDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>{formattedDate}</span>
                  </span>
                )}
                {classNameTitle && (
                  <span>• {classNameTitle}</span>
                )}
              </div>
            </div>
          </div>

          {/* 3. NỘI DUNG CHI TIẾT TẠP CHÍ ĐAN XEN CÁC KHỐI BLOCKS */}
          <div className="p-6 sm:p-10 space-y-8 max-h-[60vh] overflow-y-auto print:max-h-none print:overflow-visible">
            {reel.blocks && reel.blocks.length > 0 ? (
              reel.blocks.map((block, idx) => {
                if (block.type === 'paragraph') {
                  return (
                    <div
                      key={block.id || idx}
                      className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal first-letter:text-4xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:text-purple-600 space-y-2"
                    >
                      <p className="whitespace-pre-line">{block.text}</p>
                      {block.aiGenerated && (
                        <span className="no-print inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" /> Đoạn văn do Trợ lý AI đồng tác giả
                        </span>
                      )}
                    </div>
                  );
                }

                if (block.type === 'image' && block.url) {
                  // Tìm vị trí ảnh trong allImages để mở lightbox
                  const imgIdx = allImages.findIndex((img) => img.url === block.url);
                  return (
                    <figure
                      key={block.id || idx}
                      className="my-6 rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-slate-50 group"
                    >
                      <div className="relative overflow-hidden cursor-pointer">
                        <img
                          src={block.url}
                          alt={block.caption || 'Ảnh hoạt động'}
                          className="w-full max-h-[500px] object-cover group-hover:scale-102 transition-transform duration-300"
                          onClick={() => onOpenLightbox && onOpenLightbox(allImages, imgIdx >= 0 ? imgIdx : 0)}
                        />
                        <div className="no-print absolute top-3 right-3 bg-black/60 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                      {block.caption && (
                        <figcaption className="p-3 text-center text-xs sm:text-sm font-semibold text-slate-600 italic bg-white border-t border-slate-100">
                          {block.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                }

                return null;
              })
            ) : (
              <p className="text-slate-400 text-center italic">Bài viết chưa có nội dung chi tiết.</p>
            )}

            {/* 4. FOOTER BÀI VIẾT (THẢ TIM & LỜI KẾT) */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Nút thả tim */}
                <button
                  type="button"
                  onClick={handleHeartClick}
                  className={`px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-2 transition-all cursor-pointer ${
                    reel.isLiked
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm'
                      : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform duration-200 ${
                      reel.isLiked ? 'fill-rose-500 text-rose-500' : ''
                    } ${isLiking ? 'scale-125' : ''}`}
                  />
                  <span>{reel.likesCount || 0} Lượt yêu thích</span>
                </button>

                {/* Nút Sao chép liên kết */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border ${
                    copyToast
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-black'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Sao chép liên kết bài viết"
                >
                  {copyToast ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{copyToast ? 'Đã chép link!' : 'Chép link'}</span>
                </button>

                {/* Nút Gửi Zalo */}
                <button
                  type="button"
                  onClick={handleShareZalo}
                  className="px-3.5 py-2 rounded-2xl bg-[#0068FF] hover:bg-[#0052cc] text-white text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                  title="Gửi bài viết qua Zalo"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Gửi Zalo</span>
                </button>
              </div>

              <div className="text-xs text-slate-400 font-medium">
                Xuất bản: {new Date(reel.createdAt || Date.now()).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
