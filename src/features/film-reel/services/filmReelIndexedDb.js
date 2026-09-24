/**
 * Hệ thống lưu trữ IndexedDB cho Cuộn Phim Kỷ Niệm (Film Reel)
 * Giải quyết triệt để giới hạn 5MB của LocalStorage, cho phép lưu trữ hàng trăm bài viết và ảnh chất lượng cao
 */

const DB_NAME = 'LMS_FILM_REELS_DB';
const DB_VERSION = 1;
const STORE_NAME = 'reels';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('Trình duyệt không hỗ trợ IndexedDB'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('classId', 'classId', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * Lưu hoặc cập nhật bài viết vào IndexedDB
 */
export async function saveReelToIndexedDb(reel) {
  if (!reel || !reel.id) return;
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(reel);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('Lỗi ghi IndexedDB:', err);
  }
}

/**
 * Lấy toàn bộ bài viết từ IndexedDB
 */
export async function getAllReelsFromIndexedDb() {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('Lỗi đọc IndexedDB:', err);
    return [];
  }
}

/**
 * Lấy danh sách bài viết theo lớp từ IndexedDB
 */
export async function getReelsByClassFromIndexedDb(classId) {
  const all = await getAllReelsFromIndexedDb();
  if (classId === 'all_classes') return all;
  return all.filter((r) => r.classId === classId);
}

/**
 * Xóa bài viết khỏi IndexedDB
 */
export async function deleteReelFromIndexedDb(reelId) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(reelId);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('Lỗi xóa IndexedDB:', err);
  }
}
