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

// Kiểm tra xem bài viết có phải là bài mẫu hay không
export const isSampleReel = (reel) => {
  if (!reel) return false;
  // Nếu bài viết do Thầy lưu hoặc sửa (isSample === false) thì TUYỆT ĐỐI KHÔNG PHẢI bài mẫu
  if (reel.isSample === false) return false;
  if (reel.isSample === true) return true;

  const sampleTitles = [
    'lễ kỷ niệm tri ân ngày nhà giáo việt nam 20/11',
    'ngày hội khoa học & trải nghiệm sáng tạo stem',
    'chuyến dã ngoại sinh thái gắn kết tình bạn',
  ];
  return sampleTitles.includes((reel.title || '').trim().toLowerCase());
};

// 3. Nạp 3 bài mẫu gợi ý khi giáo viên chủ động bấm nút
export const seedSampleReels = (classId) => {
  const targetClassId = classId === 'all_classes' || !classId ? 'class_7a' : classId;
  const current = loadFilmReels(targetClassId);
  const prepared = SAMPLE_FILM_REELS.map((item, idx) => ({
    ...item,
    id: `sample_reel_${Date.now()}_${idx}`,
    classId: targetClassId,
    isSample: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const updated = [...prepared, ...current];
  saveFilmReels(targetClassId, updated);
  return updated;
};

// 4. Xóa sạch tất cả bài mẫu trên toàn bộ hệ thống hoặc lớp chỉ định
export const clearSampleReels = (classId = null) => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(STORAGE_KEY_PREFIX) || key === 'all_published_film_reels')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const cleaned = list.filter((r) => !isSampleReel(r));
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          } catch (e) {}
        }
      }
    }
    notifyFilmReelsChanged();
  } catch (err) {
    console.error('Lỗi khi xóa bài mẫu:', err);
  }
  return classId ? loadFilmReels(classId) : [];
};

// 5. Xóa toàn bộ bài viết (Làm mới kho dữ liệu)
export const clearAllReels = (classId = null) => {
  try {
    if (!classId || classId === 'all_classes') {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(STORAGE_KEY_PREFIX) || key === 'all_published_film_reels')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } else {
      localStorage.removeItem(STORAGE_KEY_PREFIX + classId);
      const rawAll = localStorage.getItem('all_published_film_reels');
      if (rawAll) {
        const allList = JSON.parse(rawAll);
        if (Array.isArray(allList)) {
          const filtered = allList.filter((item) => item.classId !== classId);
          localStorage.setItem('all_published_film_reels', JSON.stringify(filtered));
        }
      }
    }
    notifyFilmReelsChanged();
  } catch (err) {
    console.error('Lỗi khi làm sạch dữ liệu:', err);
  }
  return [];
};

// 6. Lưu hoặc cập nhật bài viết (Hỗ trợ lưu đè trực tiếp lên bài mẫu hoặc đổi lớp)
export const saveOrUpdateFilmReel = (reelData, previousClassId = null) => {
  const targetClassId = reelData?.classId || 'class_7a';

  // Nếu là bài mẫu được lưu đè, hoặc bài chưa có id -> Luôn cấp id mới chính thức của bài thật
  let finalId = reelData?.id;
  if (!finalId || (typeof finalId === 'string' && finalId.startsWith('sample_reel_'))) {
    finalId = `reel_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  const finalReel = {
    ...reelData,
    id: finalId,
    classId: targetClassId,
    isSample: false, // Bắt buộc false: Bài viết thật của Thầy, không bao giờ bị xóa nhầm
    likesCount: reelData.likesCount || 0,
    isLiked: Boolean(reelData.isLiked),
    createdAt: reelData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Lưu vào danh sách của lớp mục tiêu
  let classList = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + targetClassId);
    if (raw) classList = JSON.parse(raw);
  } catch (e) {}
  if (!Array.isArray(classList)) classList = [];

  // Lọc bỏ bài cũ nếu trùng id hoặc trùng id ban đầu
  classList = classList.filter((r) => r.id !== finalId && r.id !== reelData?.id);
  classList.unshift(finalReel);
  localStorage.setItem(STORAGE_KEY_PREFIX + targetClassId, JSON.stringify(classList));

  // 2. Nếu chuyển từ lớp cũ sang lớp mới -> Xóa khỏi lớp cũ
  if (previousClassId && previousClassId !== targetClassId && previousClassId !== 'all_classes') {
    try {
      const oldRaw = localStorage.getItem(STORAGE_KEY_PREFIX + previousClassId);
      if (oldRaw) {
        let oldList = JSON.parse(oldRaw);
        if (Array.isArray(oldList)) {
          oldList = oldList.filter((r) => r.id !== finalId && r.id !== reelData?.id);
          localStorage.setItem(STORAGE_KEY_PREFIX + previousClassId, JSON.stringify(oldList));
        }
      }
    } catch (e) {}
  }

  // 3. Luôn đồng bộ vào danh sách toàn cục all_published_film_reels để Trang Chủ luôn hiển thị tức thì
  try {
    const rawAll = localStorage.getItem('all_published_film_reels');
    let currentAll = rawAll ? JSON.parse(rawAll) : [];
    if (!Array.isArray(currentAll)) currentAll = [];

    currentAll = currentAll.filter((r) => r.id !== finalId && r.id !== reelData?.id);
    currentAll.unshift(finalReel);
    localStorage.setItem('all_published_film_reels', JSON.stringify(currentAll));
  } catch (errSync) {}

  notifyFilmReelsChanged();
  return { updated: classList, savedReel: finalReel };
};

// 7. Thêm một bài viết mới (Wrapper tương thích ngược)
export const addFilmReel = (classId, reelData) => {
  return saveOrUpdateFilmReel({ ...reelData, classId: reelData?.classId || classId });
};

// 8. Cập nhật bài viết có sẵn (Wrapper tương thích ngược)
export const updateFilmReel = (classId, reelData) => {
  const result = saveOrUpdateFilmReel(reelData, classId);
  return result.updated;
};

// 9. Xóa bài viết triệt để khỏi mọi bảng lưu trữ
export const deleteFilmReel = (classId, reelId) => {
  try {
    // 1. Xóa trong key của lớp cụ thể nếu có
    if (classId && classId !== 'all_classes') {
      const current = loadFilmReels(classId);
      const updated = current.filter((r) => r.id !== reelId);
      localStorage.setItem(STORAGE_KEY_PREFIX + classId, JSON.stringify(updated));
    }

    // 2. Quét toàn bộ localStorage để xóa triệt để id này khỏi mọi key
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(STORAGE_KEY_PREFIX) || key === 'all_published_film_reels')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const list = JSON.parse(raw);
            if (Array.isArray(list) && list.some((item) => item.id === reelId)) {
              const cleaned = list.filter((item) => item.id !== reelId);
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          } catch (e) {}
        }
      }
    }
    notifyFilmReelsChanged();
  } catch (e) {
    console.error('Lỗi khi xóa bài viết:', e);
  }
  return classId ? loadFilmReels(classId) : [];
};

// 10. Thả tim / Bỏ thả tim bài viết
export const toggleLikeReel = (classId, reelId) => {
  const targetClassId = classId === 'all_classes' || !classId ? null : classId;
  let updatedReel = null;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(STORAGE_KEY_PREFIX) || key === 'all_published_film_reels')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              let hasChanged = false;
              const newList = list.map((r) => {
                if (r.id === reelId) {
                  hasChanged = true;
                  const isLiked = !r.isLiked;
                  const likesCount = isLiked ? (r.likesCount || 0) + 1 : Math.max(0, (r.likesCount || 0) - 1);
                  updatedReel = { ...r, isLiked, likesCount };
                  return updatedReel;
                }
                return r;
              });
              if (hasChanged) {
                localStorage.setItem(key, JSON.stringify(newList));
              }
            }
          } catch (e) {}
        }
      }
    }
    notifyFilmReelsChanged();
  } catch (e) {
    console.error('Lỗi thả tim:', e);
  }

  return targetClassId ? loadFilmReels(targetClassId) : loadAllFilmReelsAcrossClasses();
};

// 11. Trích xuất toàn bộ ảnh của tất cả các cuộn phim phục vụ Slideshow
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

// 12. Tải tất cả bài viết cuộn phim từ tất cả các lớp (Phục vụ Cuộn Phim Hồi Ức trên Trang Chủ)
export const loadAllFilmReelsAcrossClasses = () => {
  const map = new Map();
  try {
    // 1. Quét all_published_film_reels trước
    const rawAll = localStorage.getItem('all_published_film_reels');
    if (rawAll) {
      try {
        const list = JSON.parse(rawAll);
        if (Array.isArray(list)) {
          list.forEach((item) => {
            if (item && item.id) {
              map.set(item.id, item);
            }
          });
        }
      } catch (e) {}
    }

    // 2. Quét toàn bộ localStorage để tìm các key lưu trữ cuộn phim của từng lớp
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
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
