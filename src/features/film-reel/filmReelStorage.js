// HỆ THỐNG LƯU TRỮ VÀ QUẢN LÝ CUỘN PHIM KỶ NIỆM (LOCALSTORAGE)
import { SAMPLE_FILM_REELS } from './constants/filmReelPresets';

const STORAGE_KEY_PREFIX = 'film_reels_';

// 1. Tải danh sách cuộn phim của lớp học (Hỗ trợ nạp tất cả các lớp nếu classId là all_classes)
export const loadFilmReels = (classId) => {
  if (classId === 'all_classes') {
    return loadAllFilmReelsAcrossClasses();
  }
  const targetClassId = classId || 'class_7a';
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + targetClassId);
    let list = raw ? JSON.parse(raw) : [];
    // Nếu lớp cụ thể chưa có bài, thử nạp từ all_published_film_reels lọc theo targetClassId
    if (list.length === 0) {
      const all = loadAllFilmReelsAcrossClasses();
      const matched = all.filter((r) => r.classId === targetClassId);
      if (matched.length > 0) list = matched;
    }
    return list;
  } catch (e) {
    console.error(`Lỗi tải cuộn phim lớp ${targetClassId}:`, e);
    return [];
  }
};

// 2. Lưu danh sách cuộn phim của lớp học
export const saveFilmReels = (classId, reels) => {
  const targetClassId = classId || 'class_7a';
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + targetClassId, JSON.stringify(reels));

    // Luôn đồng bộ vào danh sách toàn cục all_published_film_reels để Trang Chủ luôn nạp được tức thì
    try {
      const rawAll = localStorage.getItem('all_published_film_reels');
      let currentAll = rawAll ? JSON.parse(rawAll) : [];
      if (!Array.isArray(currentAll)) currentAll = [];

      reels.forEach((r) => {
        const idx = currentAll.findIndex((item) => item.id === r.id);
        if (idx >= 0) {
          currentAll[idx] = r;
        } else {
          currentAll.unshift(r);
        }
      });
      localStorage.setItem('all_published_film_reels', JSON.stringify(currentAll));
    } catch (errSync) {
      // bỏ qua lỗi đồng bộ
    }

    notifyFilmReelsChanged();
  } catch (e) {
    console.error(`Lỗi lưu cuộn phim lớp ${targetClassId}:`, e);
  }
};

// 3. Nạp 3 bài mẫu gợi ý khi giáo viên chủ động bấm nút
export const seedSampleReels = (classId) => {
  const targetClassId = classId || 'class_7a';
  const current = loadFilmReels(targetClassId);
  const prepared = SAMPLE_FILM_REELS.map((item, idx) => ({
    ...item,
    id: `reel_${Date.now()}_${idx}`,
    classId: targetClassId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const updated = [...prepared, ...current];
  saveFilmReels(targetClassId, updated);
  return updated;
};

// 4. Thêm một bài viết mới (Đảm bảo an toàn không mất bài kể cả khi chưa có classId)
export const addFilmReel = (classId, reelData) => {
  const targetClassId = reelData?.classId || classId || 'class_7a';
  const current = loadFilmReels(targetClassId);
  const newReel = {
    ...reelData,
    id: reelData.id || `reel_${Date.now()}`,
    classId: targetClassId,
    likesCount: reelData.likesCount || 0,
    isLiked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = [newReel, ...current];
  saveFilmReels(targetClassId, updated);
  return { updated, newReel };
};

// 5. Cập nhật bài viết có sẵn
export const updateFilmReel = (classId, reelData) => {
  const current = loadFilmReels(classId);
  const updated = current.map((r) =>
    r.id === reelData.id
      ? {
          ...r,
          ...reelData,
          updatedAt: new Date().toISOString(),
        }
      : r
  );
  saveFilmReels(classId, updated);
  return updated;
};

// 6. Xóa bài viết
export const deleteFilmReel = (classId, reelId) => {
  const current = loadFilmReels(classId);
  const updated = current.filter((r) => r.id !== reelId);
  saveFilmReels(classId, updated);
  return updated;
};

// 7. Thả tim / Bỏ thả tim bài viết
export const toggleLikeReel = (classId, reelId) => {
  const current = loadFilmReels(classId);
  const updated = current.map((r) => {
    if (r.id === reelId) {
      const isLiked = !r.isLiked;
      const likesCount = isLiked ? (r.likesCount || 0) + 1 : Math.max(0, (r.likesCount || 0) - 1);
      return { ...r, isLiked, likesCount };
    }
    return r;
  });
  saveFilmReels(classId, updated);
  return updated;
};

// 8. Trích xuất toàn bộ ảnh của tất cả các cuộn phim phục vụ Slideshow
export const extractAllReelImages = (reels = []) => {
  const allImages = [];

  reels.forEach((reel) => {
    // 1. Ảnh bìa đại diện
    if (reel.coverImage) {
      allImages.push({
        url: reel.coverImage,
        caption: reel.title,
        reelId: reel.id,
        reelTitle: reel.title,
        category: reel.category,
        eventDate: reel.eventDate,
      });
    }

    // 2. Các ảnh trong khối nội dung blocks
    if (Array.isArray(reel.blocks)) {
      reel.blocks.forEach((blk) => {
        if (blk.type === 'image' && blk.url) {
          allImages.push({
            url: blk.url,
            caption: blk.caption || reel.title,
            reelId: reel.id,
            reelTitle: reel.title,
            category: reel.category,
            eventDate: reel.eventDate,
          });
        }
      });
    }
  });

  return allImages;
};

// 9. Tải tất cả bài viết cuộn phim từ tất cả các lớp (Phục vụ Cuộn Phim Hồi Ức trên Trang Chủ)
export const loadAllFilmReelsAcrossClasses = () => {
  const map = new Map();
  try {
    // Quét toàn bộ localStorage để tìm các key lưu trữ cuộn phim
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(STORAGE_KEY_PREFIX) || key === 'all_published_film_reels')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              list.forEach((item) => {
                if (item && item.id && !map.has(item.id)) {
                  map.set(item.id, item);
                }
              });
            }
          } catch (err) {
            // bỏ qua parse error
          }
        }
      }
    }
  } catch (e) {
    console.error('Lỗi khi tải toàn bộ bài viết cuộn phim:', e);
  }

  const all = Array.from(map.values());
  // Sắp xếp bài mới nhất lên đầu tiên
  return all.sort(
    (a, b) => new Date(b.eventDate || b.createdAt || 0) - new Date(a.eventDate || a.createdAt || 0)
  );
};

// Phát sự kiện cập nhật toàn hệ thống (Custom Event)
export const notifyFilmReelsChanged = () => {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('filmReelsUpdated'));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (e) {
    // bỏ qua nếu SSR
  }
};
