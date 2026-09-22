import React, { useState, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Plus,
  Play,
  Search,
  Users,
  ChevronDown,
  Layers,
  Heart,
  Calendar,
  Share2,
  RefreshCw,
  Camera,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  loadClasses,
  loadSelectedClassId,
  saveSelectedClassId,
} from '../behavior/behaviorStorage';
import {
  loadFilmReels,
  saveFilmReels,
  seedSampleReels,
  clearSampleReels,
  clearAllReels,
  saveOrUpdateFilmReel,
  addFilmReel,
  updateFilmReel,
  deleteFilmReel,
  toggleLikeReel,
  togglePinReel,
  extractAllReelImages,
  isSampleReel,
} from './filmReelStorage';
import { FILM_REEL_CATEGORIES } from './constants/filmReelPresets';
import { playClick, playCorrect, playWinner, playDeduct } from '../../utils/soundEffects';

// Import Components
import FilmReelCard from './components/FilmReelCard';
import FilmReelDetailModal from './components/FilmReelDetailModal';
import FilmReelEditorModal from './components/FilmReelEditorModal';
import FilmReelSlideshow from './components/FilmReelSlideshow';
import FilmReelLightbox from './components/FilmReelLightbox';

export default function FilmReelView() {
  // 1. Quản lý lớp học
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [lastSavedTime, setLastSavedTime] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // 2. Dữ liệu cuộn phim
  const [reels, setReels] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Quản lý trạng thái các Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingReel, setEditingReel] = useState(null);

  const [selectedReelDetail, setSelectedReelDetail] = useState(null);

  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [slideshowImages, setSlideshowImages] = useState([]);

  const [lightboxData, setLightboxData] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });

  // Nạp danh sách lớp học
  useEffect(() => {
    let loadedClasses = loadClasses() || [];
    if (loadedClasses.length === 0) {
      loadedClasses = [
        { id: 'class_7a', name: '7A', grade_level: '7' },
        { id: 'class_7b', name: '7B', grade_level: '7' },
        { id: 'class_8a', name: '8A', grade_level: '8' },
        { id: 'class_9a', name: '9A', grade_level: '9' },
      ];
      try {
        saveClasses(loadedClasses);
      } catch (e) {}
    }
    setClasses(loadedClasses);

    let currentClassId = loadSelectedClassId();
    if (!currentClassId && loadedClasses.length > 0) {
      currentClassId = 'all_classes'; // Mặc định hiển thị tất cả các lớp để thấy toàn bộ bài viết
      saveSelectedClassId(currentClassId);
    }
    setSelectedClassId(currentClassId || 'all_classes');

    // Cập nhật giờ lưu hiện tại
    const now = new Date();
    setLastSavedTime(
      `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`
    );
  }, []);

  // Nạp cuộn phim khi chọn lớp
  useEffect(() => {
    if (selectedClassId) {
      refreshReels(selectedClassId);
    } else {
      setReels([]);
    }
  }, [selectedClassId]);

  const refreshReels = (targetId = selectedClassId) => {
    const cId = targetId || selectedClassId || 'all_classes';
    let data = loadFilmReels(cId);

    // Cơ chế thông minh: Nếu lớp cụ thể chưa có bài nhưng các lớp khác có bài viết do Thầy tạo
    // -> Tự động chuyển sang xem "Tất cả các lớp" để Thầy luôn thấy ngay thành quả của mình!
    if (data.length === 0 && cId !== 'all_classes') {
      const allData = loadFilmReels('all_classes');
      if (allData.length > 0) {
        data = allData;
        setSelectedClassId('all_classes');
        saveSelectedClassId('all_classes');
      }
    }

    setReels(data);
    const now = new Date();
    setLastSavedTime(
      `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`
    );
  };

  const handleSelectClass = (cId) => {
    playClick();
    setSelectedClassId(cId);
    saveSelectedClassId(cId);
    refreshReels(cId);
  };

  // Nạp 3 bài mẫu gợi ý
  const handleSeedSamples = () => {
    const cId = selectedClassId === 'all_classes' ? 'class_7a' : selectedClassId;
    playWinner();
    const seeded = seedSampleReels(cId);
    setReels(seeded);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setToastMessage('🎉 Đã nạp thành công 3 bài viết mẫu gợi ý!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Xóa sạch tất cả các bài mẫu gợi ý
  const handleClearSamples = () => {
    if (window.confirm('Thầy có chắc chắn muốn xóa toàn bộ các bài mẫu để bắt đầu tạo bài viết thật cho lớp?')) {
      playDeduct();
      clearSampleReels(selectedClassId);
      refreshReels(selectedClassId);
      setToastMessage('🗑️ Đã xóa sạch toàn bộ bài mẫu gợi ý!');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  // Lưu bài viết (Tạo mới hoặc Sửa đè) - Tự động đồng bộ và hiển thị ngay tức thì
  const handleSaveReel = (reelData) => {
    const targetClass = reelData.classId || 'class_7a';
    
    // Lưu hoặc sửa đè
    const { savedReel } = saveOrUpdateFilmReel(reelData, editingReel?.classId);
    setEditingReel(null);

    // Chuyển sang xem "all_classes" (Tất cả các lớp) để bài mới chắc chắn xuất hiện ngay lập tức
    const nextViewClass = 'all_classes';
    setSelectedClassId(nextViewClass);
    saveSelectedClassId(nextViewClass);
    refreshReels(nextViewClass);

    const targetClassName = classes.find((c) => c.id === targetClass)?.name || targetClass;
    setToastMessage(`🎉 Đã xuất bản khoảnh khắc "${savedReel.title}" thành công!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Xóa bài viết
  const handleDeleteReel = (reelId) => {
    playDeduct();
    deleteFilmReel(selectedClassId, reelId);
    refreshReels(selectedClassId);
    if (selectedReelDetail?.id === reelId) {
      setSelectedReelDetail(null);
    }
    setToastMessage('🗑️ Đã xóa bài viết thành công!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Thả tim
  const handleLikeReel = (reelId) => {
    const updated = toggleLikeReel(selectedClassId, reelId);
    setReels(updated);
    if (selectedReelDetail?.id === reelId) {
      const found = updated.find((r) => r.id === reelId);
      if (found) setSelectedReelDetail(found);
    }
  };

  // Bật / Tắt ghim bài viết lên FRAME #01 Trang Chủ
  const handleTogglePin = (reelId) => {
    playWinner();
    const updated = togglePinReel(selectedClassId, reelId);
    setReels(updated);
    const target = updated.find((r) => r.id === reelId);
    setToastMessage(
      target?.isPinned
        ? `📌 Đã ghim "${target.title}" lên FRAME #01 Trang Chủ!`
        : `Đã bỏ ghim "${target?.title || 'bài viết'}"!`
    );
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Mở trình chiếu Slideshow toàn màn hình
  const handleOpenSlideshow = (customImages = null) => {
    playClick();
    const imgs = customImages || extractAllReelImages(reels);
    if (imgs.length === 0) {
      alert('Chưa có hình ảnh nào để trình chiếu!');
      return;
    }
    setSlideshowImages(imgs);
    setIsSlideshowOpen(true);
  };

  // Mở Lightbox xem chi tiết ảnh
  const handleOpenLightbox = (images, index = 0) => {
    setLightboxData({
      isOpen: true,
      images,
      currentIndex: index,
    });
  };

  // Lọc bài viết theo Danh mục & Từ khóa tìm kiếm
  const filteredReels = reels.filter((r) => {
    const matchesCategory =
      activeCategory === 'Tất cả' || r.category === activeCategory;

    const matchesSearch =
      (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.blocks?.some((b) =>
        (b.text || '').toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesCategory && matchesSearch;
  });

  // Đếm số lượng bài viết theo từng danh mục
  const getCategoryCount = (cat) => {
    if (cat === 'Tất cả') return reels.length;
    return reels.filter((r) => r.category === cat).length;
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-slate-900 font-sans select-none pb-20">
      {/* 1. TOP HEADER APP (CHUẨN ẢNH THẦY GỬI) */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Cuộn Phim Kỷ Niệm Lớp Học</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Nhật ký hoạt động lớp, lưu giữ khoảnh khắc và bài viết đa phương tiện với Gemini AI
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-end sm:self-auto flex-wrap">
          {/* CHIP ĐÃ LƯU THỜI GIAN */}
          {lastSavedTime && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center space-x-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đã lưu {lastSavedTime}</span>
            </span>
          )}

          {/* DROPDOWN CHỌN LỚP */}
          {classes.length > 0 && (
            <div className="relative">
              <select
                value={selectedClassId || 'all_classes'}
                onChange={(e) => handleSelectClass(e.target.value)}
                className="bg-purple-50 hover:bg-purple-100 text-purple-900 font-black text-xs px-3.5 py-2 rounded-2xl border border-purple-200 outline-hidden transition cursor-pointer appearance-none pr-8"
              >
                <option value="all_classes">
                  🌟 Tất cả các lớp (Khối 7 - 8 - 9)
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏛️ Lớp {c.name} • Khối {c.grade_level}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-purple-700 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* CHIP GIÁO VIÊN */}
          <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-black">
              🤖
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-black text-slate-800 block leading-tight">Nguyễn Văn Hải</span>
              <span className="text-[10px] text-purple-600 font-bold block leading-tight">GV Tiếng Anh</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 2. THANH BANNER CLAYMORPHIC & NÚT TÁC VỤ HÀNG ĐẦU */}
        <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl border-2 border-purple-800/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Ánh sáng trang trí nền */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/40 text-xs font-black uppercase tracking-wider text-purple-200">
              <Film className="w-3.5 h-3.5 text-amber-300" />
              <span>35MM FILM REEL & CLASS JOURNAL</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
              Cuộn Phim Kỷ Niệm {selectedClassId === 'all_classes' ? 'Toàn Trường (Khối 7 - 8 - 9)' : `Lớp ${selectedClass?.name || ''}`} ✨
            </h2>
                <p className="text-xs sm:text-sm text-purple-200/80 font-medium max-w-xl leading-relaxed">
                  Lưu giữ trọn vẹn những khoảnh khắc, hoạt động và ký ức thanh xuân tươi đẹp của tập thể lớp qua từng thước phim học trò.
                </p>
              </div>

              {/* 3 Nút tác vụ nổi bật */}
              <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
                {/* Nút Xóa toàn bộ bài mẫu nếu có bài mẫu */}
                {reels.some(isSampleReel) && (
                  <button
                    type="button"
                    onClick={handleClearSamples}
                    className="px-4 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 hover:text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg backdrop-blur-md active:scale-95 transition-all cursor-pointer"
                    title="Xóa sạch toàn bộ các bài mẫu gợi ý để sẵn sàng cho bài viết thật"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Xóa Bài Mẫu ({reels.filter(isSampleReel).length})</span>
                  </button>
                )}

                {/* Nút Trình Chiếu Slideshow */}
                <button
                  type="button"
                  onClick={() => handleOpenSlideshow()}
                  className="px-4 sm:px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg backdrop-blur-md active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Trình Chiếu Slideshow</span>
                </button>

                {/* Nút Tạo khoảnh khắc mới */}
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setEditingReel(null);
                    setIsEditorOpen(true);
                  }}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/40 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tạo Khoảnh Khắc Mới</span>
                </button>
              </div>
            </div>

            {/* 3. THANH LỌC DANH MỤC & TÌM KIẾM (CHUẨN ẢNH THẦY GỬI) */}
            <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Các tab danh mục dạng viên thuốc */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
                {FILM_REEL_CATEGORIES.map((cat) => {
                  const count = getCategoryCount(cat);
                  const isSelected = activeCategory === cat;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        playClick();
                        setActiveCategory(cat);
                      }}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'text-slate-500'
                      }`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Ô tìm kiếm */}
              <div className="relative w-full md:w-80 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tiêu đề, nội dung..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* 4. KHU VỰC HIỂN THỊ CÁC THẺ CUỘN PHIM HOẶC MÀN HÌNH TRỐNG */}
            {reels.length === 0 ? (
              /* CLEAN SLATE: KHI LỚP CHƯA CÓ KHOẢNH KHẮC NÀO */
              <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-purple-300 p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto my-8 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
                  🎬
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-800">
                    Chưa có khoảnh khắc nào trong cuộn phim
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Bắt đầu lưu giữ những kỷ niệm đáng nhớ đầu tiên của lớp hoặc nạp 3 bài viết mẫu để tham khảo giao diện nhé!
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setEditingReel(null);
                      setIsEditorOpen(true);
                    }}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo Khoảnh Khắc Mới Đầu Tiên</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSeedSamples}
                    className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Nạp Lại 3 Bài Mẫu Gợi Ý</span>
                  </button>

                  {selectedClassId !== 'all_classes' && (
                    <button
                      type="button"
                      onClick={() => handleSelectClass('all_classes')}
                      className="px-5 py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🌐 Xem Toàn Bộ Bài Viết (Tất Cả Các Lớp)</span>
                    </button>
                  )}
                </div>
              </div>
            ) : filteredReels.length === 0 ? (
              /* KHI LỌC KHÔNG CÓ KẾT QUẢ */
              <div className="bg-white rounded-3xl p-12 text-center space-y-2 border border-slate-200">
                <p className="text-3xl">🔍</p>
                <h4 className="text-base font-bold text-slate-700">Không tìm thấy bài viết phù hợp</h4>
                <p className="text-xs text-slate-400">
                  Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục "Tất cả".
                </p>
              </div>
            ) : (
              /* LƯỚI THẺ CUỘN PHIM 35MM (GRID 1 ĐẾN 3 CỘT CHUẨN ẢNH) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReels.map((reel) => (
                  <FilmReelCard
                    key={reel.id}
                    reel={reel}
                    onView={(r) => setSelectedReelDetail(r)}
                    onEdit={(r) => {
                      setEditingReel(r);
                      setIsEditorOpen(true);
                    }}
                    onDelete={(rId) => handleDeleteReel(rId)}
                    onLike={(rId) => handleLikeReel(rId)}
                    onTogglePin={(rId) => handleTogglePin(rId)}
                  />
                ))}
              </div>
            )}
      </div>

      {/* =================================================================== */}
      {/* 5. CÁC MODALS CHỨC NĂNG */}
      {/* =================================================================== */}
      {/* Modal Soạn thảo */}
      {isEditorOpen && (
        <FilmReelEditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingReel(null);
          }}
          initialData={editingReel}
          classId={selectedClassId}
          onSave={handleSaveReel}
        />
      )}

      {/* Modal Chi tiết & In A4 */}
      {selectedReelDetail && (
        <FilmReelDetailModal
          isOpen={Boolean(selectedReelDetail)}
          onClose={() => setSelectedReelDetail(null)}
          reel={selectedReelDetail}
          classNameTitle={selectedClass?.name ? `Lớp ${selectedClass.name}` : ''}
          onEdit={(r) => {
            setEditingReel(r);
            setIsEditorOpen(true);
          }}
          onDelete={(rId) => handleDeleteReel(rId)}
          onLike={(rId) => handleLikeReel(rId)}
          onPlaySlideshow={(imgs) => handleOpenSlideshow(imgs)}
          onOpenLightbox={(imgs, idx) => handleOpenLightbox(imgs, idx)}
        />
      )}

      {/* Modal Trình chiếu Slideshow toàn màn hình */}
      {isSlideshowOpen && (
        <FilmReelSlideshow
          isOpen={isSlideshowOpen}
          onClose={() => setIsSlideshowOpen(false)}
          images={slideshowImages}
        />
      )}

      {/* Modal Phóng to Lightbox */}
      {lightboxData.isOpen && (
        <FilmReelLightbox
          isOpen={lightboxData.isOpen}
          onClose={() =>
            setLightboxData((prev) => ({ ...prev, isOpen: false }))
          }
          images={lightboxData.images}
          currentIndex={lightboxData.currentIndex}
          onIndexChange={(newIdx) =>
            setLightboxData((prev) => ({ ...prev, currentIndex: newIdx }))
          }
        />
      )}

      {/* Toast thông báo nổi trạng thái */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-purple-500/40 backdrop-blur-md text-xs font-black animate-in fade-in slide-in-from-bottom-5 duration-200 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
