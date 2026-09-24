// HỆ THỐNG LƯU TRỮ VÀ QUẢN LÝ CUỘN PHIM KỶ NIỆM (LOCALSTORAGE + INDEXEDDB)
import { saveSiteSetting } from '../../services/siteSettingsService';
import { SAMPLE_FILM_REELS } from './constants/filmReelPresets';
import {
  saveReelToIndexedDb,
  getAllReelsFromIndexedDb,
  deleteReelFromIndexedDb,
} from './services/filmReelIndexedDb';

const STORAGE_KEY_PREFIX = 'film_reels_';
const DELETED_IDS_KEY = 'film_reels_deleted_ids';

// Danh sách các ID bài viết đã bị người dùng chủ động xóa (ngăn hồi sinh từ IndexedDB hoặc cache)
export const getDeletedReelIds = () => {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const markReelAsDeleted = (reelId) => {
  if (!reelId) return;
  try {
    const ids = getDeletedReelIds();
    if (!ids.includes(reelId)) {
      ids.push(reelId);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(ids));
    }
  } catch (e) {}
};

export const unmarkReelAsDeleted = (reelId) => {
  if (!reelId) return;
  try {
    let ids = getDeletedReelIds();
    ids = ids.filter((id) => id !== reelId);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(ids));
  } catch (e) {}
};

// Bài viết Văn Nghệ ban đầu (chỉ nạp mẫu lần đầu tiên nếu chưa từng bị xóa)
export const VY_LIVESHOW_REEL = {
  id: 'reel_liveshow_den_ong_sao_vy',
  classId: 'class_7a',
  title: 'Liveshow "Chiếc Đèn Ông Sao" Bất Ổn: Vy Tỏa Sáng',
  category: 'Văn nghệ',
  eventDate: '2026-09-24',
  coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
  isPinned: true,
  isSample: false,
  likesCount: 1,
  blocks: [
    {
      id: 'blk_1',
      type: 'paragraph',
      text: 'Tiết học chào mừng Tết Trung thu bỗng biến thành một sân khấu âm nhạc vô cùng đặc biệt và rộn rã tiếng cười. Bạn Vy bước lên tự tin thể hiện ca khúc "Chiếc Đèn Ông Sao" với phong cách cực kỳ hài hước và nhiệt huyết, khiến cả lớp vỗ tay không ngớt!',
    },
    {
      id: 'blk_2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
      caption: 'Khoảnh khắc Vy tự tin tỏa sáng trên sân khấu lớp học',
    },
  ],
  createdAt: '2026-09-24T02:00:00.000Z',
  updatedAt: '2026-09-24T02:00:00.000Z',
};

// 1. Tải danh sách cuộn phim của lớp học (Hỗ trợ nạp tất cả các lớp nếu classId là all_classes)
export const loadFilmReels = (classId) => {
  if (classId === 'all_classes') {
    return loadAllFilmReelsAcrossClasses();
  }
  const deletedIds = getDeletedReelIds();
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

    // Lọc bỏ triệt để các bài viết mà người dùng đã bấm XÓA
    list = list.filter((r) => r && r.id && !deletedIds.includes(r.id));

    return sortFilmReelsByPinAndDate(list);
  } catch (e) {
    console.error(`Lỗi tải cuộn phim lớp ${targetClassId}:`, e);
    return [];
  }
};

// Đồng bộ danh sách bài viết từ cả LocalStorage và IndexedDB
export const syncAndLoadFilmReels = async (classId) => {
  const deletedIds = getDeletedReelIds();
  const localList = loadFilmReels(classId).filter((r) => r && r.id && !deletedIds.includes(r.id));
  try {
    const idbList = await getAllReelsFromIndexedDb();
    if (!Array.isArray(idbList) || idbList.length === 0) {
      return localList;
    }

    const map = new Map();
    localList.forEach((r) => {
      if (r && r.id && !deletedIds.includes(r.id)) map.set(r.id, r);
    });

    idbList.forEach((r) => {
      // TUYỆT ĐỐI không nạp lại các bài viết mà Thầy đã bấm XÓA
      if (r && r.id && !deletedIds.includes(r.id) && !map.has(r.id)) {
        if (classId === 'all_classes' || !classId || r.classId === classId) {
          map.set(r.id, r);
        }
      }
    });

    return sortFilmReelsByPinAndDate(Array.from(map.values()));
  } catch (err) {
    return localList;
  }
};

// Hàm dọn dẹp bộ nhớ khẩn cấp khi trình duyệt báo đầy QuotaExceededError
export const cleanStorageForEmergency = () => {
  try {
    const keysToClean = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('cache_') || k.startsWith('temp_') || k.startsWith('debug_'))) {
        keysToClean.push(k);
      }
    }
    keysToClean.forEach((k) => localStorage.removeItem(k));

    // Dọn dẹp các bài mẫu nếu có bài viết thật của Thầy để nhường bộ nhớ
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(STORAGE_KEY_PREFIX) || key === 'all_published_film_reels')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const list = JSON.parse(raw);
            if (Array.isArray(list) && list.some((r) => isSampleReel(r))) {
              const cleaned = list.filter((r) => !isSampleReel(r));
              if (cleaned.length > 0) {
                localStorage.setItem(key, JSON.stringify(cleaned));
              }
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {
    console.warn('Lỗi dọn dẹp bộ nhớ khẩn cấp:', e);
  }
};

// 2. Lưu danh sách cuộn phim của lớp học (với cơ chế tự phục hồi chống tràn bộ nhớ Quota)
export const saveFilmReels = (classId, reels) => {
  const targetClassId = classId || 'class_7a';
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + targetClassId, JSON.stringify(reels));
  } catch (quotaErr) {
    console.warn(`LocalStorage đầy, đang tối ưu dọn dẹp để lưu lớp ${targetClassId}:`, quotaErr);
    cleanStorageForEmergency();
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + targetClassId, JSON.stringify(reels));
    } catch (retryErr) {
      console.error('Không thể lưu do bộ nhớ trình duyệt đã đầy:', retryErr);
    }
  }

  // Đồng bộ vào all_published_film_reels (Giới hạn tối đa 20 bài mới nhất để tiết kiệm bộ nhớ)
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
    if (currentAll.length > 20) currentAll = currentAll.slice(0, 20);
    localStorage.setItem('all_published_film_reels', JSON.stringify(currentAll));
    // Tự động đồng bộ lên Supabase Cloud để Học sinh mọi nơi đều nhận được bài viết mới của Admin
    saveSiteSetting('published_film_reels', currentAll).catch(() => {});
  } catch (errSync) {
    console.warn('Không thể đồng bộ all_published_film_reels do đầy bộ nhớ (bỏ qua an toàn):', errSync);
  }

  notifyFilmReelsChanged();
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
    isPinned: Boolean(reelData.isPinned),
    createdAt: reelData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Nếu bài viết này trước đây từng bị đánh dấu xóa (ví dụ do trùng id hoặc tạo lại) -> Bỏ đánh dấu xóa
  if (finalId) {
    unmarkReelAsDeleted(finalId);
  }

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

  // 0. Luôn lưu một bản đầy đủ an toàn vào IndexedDB (không bị giới hạn 5MB của LocalStorage)
  try {
    saveReelToIndexedDb(finalReel);
  } catch (e) {
    console.warn('Lỗi ghi bản sao IndexedDB:', e);
  }

  // 1. Thử lưu vào LocalStorage với cơ chế tự phục hồi nếu LocalStorage báo đầy
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + targetClassId, JSON.stringify(classList));
  } catch (quotaErr) {
    console.warn(`LocalStorage đầy khi lưu bài viết lớp ${targetClassId}, tiến hành dọn dẹp khẩn cấp:`, quotaErr);
    cleanStorageForEmergency();
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + targetClassId, JSON.stringify(classList));
    } catch (retryErr) {
      // Nếu vẫn đầy, lược bỏ ảnh data: nặng trong các bài cũ để bảo vệ bài mới
      console.warn('Tối ưu hóa dung lượng các bài cũ để nhường chỗ cho bài mới:', retryErr);
      try {
        const lightweightList = classList.slice(0, 8).map((item, idx) => {
          if (idx === 0) return item; // Bài mới nhất của Thầy giữ nguyên
          return {
            ...item,
            blocks: (item.blocks || []).map((b) =>
              b.type === 'image' && b.url?.startsWith('data:') ? { ...b, url: '' } : b
            ),
          };
        });
        localStorage.setItem(STORAGE_KEY_PREFIX + targetClassId, JSON.stringify(lightweightList));
      } catch (finalErr) {
        console.warn('LocalStorage đã đầy hoàn toàn, bài viết được lưu trữ trong IndexedDB:', finalErr);
      }
    }
  }

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

  // 3. Luôn đồng bộ vào danh sách toàn cục all_published_film_reels (Tối đa 20 bài mới nhất)
  try {
    const rawAll = localStorage.getItem('all_published_film_reels');
    let currentAll = rawAll ? JSON.parse(rawAll) : [];
    if (!Array.isArray(currentAll)) currentAll = [];

    currentAll = currentAll.filter((r) => r.id !== finalId && r.id !== reelData?.id);
    currentAll.unshift(finalReel);
    if (currentAll.length > 20) currentAll = currentAll.slice(0, 20);
    localStorage.setItem('all_published_film_reels', JSON.stringify(currentAll));
    // Tự động đồng bộ lên Supabase Cloud để Học sinh nhận được bài viết ngay lập tức
    saveSiteSetting('published_film_reels', currentAll).catch(() => {});
  } catch (errSync) {
    console.warn('Không thể đồng bộ all_published_film_reels do đầy bộ nhớ (bỏ qua an toàn):', errSync);
  }

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

// 9. Xóa bài viết triệt để khỏi mọi bảng lưu trữ (LocalStorage + IndexedDB + Danh sách đánh dấu đã xóa)
export const deleteFilmReel = async (classId, reelId) => {
  if (!reelId) return [];

  // 1. Đánh dấu vào danh sách đã xóa để ngăn chặn việc tự phục hồi từ bất kỳ bộ nhớ nào
  markReelAsDeleted(reelId);

  // 2. Xóa triệt để trong IndexedDB
  try {
    await deleteReelFromIndexedDb(reelId);
  } catch (errIdb) {
    console.warn('Lỗi khi xóa trong IndexedDB:', errIdb);
  }

  // 3. Xóa trong tất cả các key của LocalStorage
  try {
    // Xóa trong key của lớp cụ thể nếu có
    if (classId && classId !== 'all_classes') {
      const current = loadFilmReels(classId);
      const updated = current.filter((r) => r.id !== reelId);
      localStorage.setItem(STORAGE_KEY_PREFIX + classId, JSON.stringify(updated));
    }

    // Quét toàn bộ localStorage để xóa triệt để id này khỏi mọi key (kể cả all_published_film_reels)
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
    // Đồng bộ danh sách bài viết còn lại lên Supabase Cloud để Học sinh không bị xem bài đã xóa
    const remainingAll = loadAllFilmReelsAcrossClasses();
    saveSiteSetting('published_film_reels', remainingAll).catch(() => {});
    notifyFilmReelsChanged();
  } catch (e) {
    console.error('Lỗi khi xóa bài viết khỏi LocalStorage:', e);
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
  const deletedIds = getDeletedReelIds();
  try {
    // 1. Quét all_published_film_reels trước
    const rawAll = localStorage.getItem('all_published_film_reels');
    if (rawAll) {
      try {
        const list = JSON.parse(rawAll);
        if (Array.isArray(list)) {
          list.forEach((item) => {
            if (item && item.id && !deletedIds.includes(item.id)) {
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
                if (item && item.id && !deletedIds.includes(item.id) && !map.has(item.id)) {
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

  const all = Array.from(map.values()).filter((r) => r && r.id && !deletedIds.includes(r.id));
  // Sắp xếp ưu tiên bài ghim lên đầu tiên (FRAME #01), sau đó đến ngày mới nhất
  return sortFilmReelsByPinAndDate(all);
};

// Sắp xếp bài viết: Ưu tiên bài viết được ghim (isPinned: true) lên đầu tiên
export const sortFilmReelsByPinAndDate = (list = []) => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const aPinned = Boolean(a?.isPinned);
    const bPinned = Boolean(b?.isPinned);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return new Date(b?.eventDate || b?.createdAt || 0) - new Date(a?.eventDate || a?.createdAt || 0);
  });
};

// 13. Bật / Tắt Ghim bài viết quan trọng lên đầu cuộn phim (Pin to Top)
export const togglePinReel = (classId, reelId) => {
  let targetPinnedState = false;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(STORAGE_KEY_PREFIX) || key === 'all_published_film_reels')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              let changed = false;
              const newList = list.map((r) => {
                if (r.id === reelId) {
                  changed = true;
                  const newPin = !r.isPinned;
                  targetPinnedState = newPin;
                  return { ...r, isPinned: newPin, updatedAt: new Date().toISOString() };
                }
                return r;
              });
              if (changed) {
                localStorage.setItem(key, JSON.stringify(newList));
              }
            }
          } catch (e) {}
        }
      }
    }
    // Đồng bộ thứ tự bài ghim mới lên Supabase Cloud để Học sinh thấy bài ghim ở FRAME #01
    const updatedAll = loadAllFilmReelsAcrossClasses();
    saveSiteSetting('published_film_reels', updatedAll).catch(() => {});
    notifyFilmReelsChanged();
  } catch (err) {
    console.error('Lỗi khi ghim bài viết:', err);
  }
  return classId && classId !== 'all_classes' ? loadFilmReels(classId) : loadAllFilmReelsAcrossClasses();
};

// 14. Bộ nhớ lưu trữ lượt thích (Like) của các bài mẫu mặc định
export const getSampleReelLikes = () => {
  try {
    const raw = localStorage.getItem('sample_reel_likes_map');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

export const toggleSampleReelLike = (sampleId, baseLikes = 0) => {
  try {
    const map = getSampleReelLikes();
    const current = map[sampleId] || { isLiked: false, likesCount: baseLikes };
    const newIsLiked = !current.isLiked;
    const newCount = newIsLiked ? current.likesCount + 1 : Math.max(0, current.likesCount - 1);
    map[sampleId] = { isLiked: newIsLiked, likesCount: newCount };
    localStorage.setItem('sample_reel_likes_map', JSON.stringify(map));
    notifyFilmReelsChanged();
    return map[sampleId];
  } catch (e) {
    console.error('Lỗi like bài mẫu:', e);
    return { isLiked: true, likesCount: baseLikes + 1 };
  }
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
