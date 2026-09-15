// HỆ THỐNG LƯU TRỮ & DỮ LIỆU CỬA HÀNG ĐỔI QUÀ THI ĐUA (LOCALSTORAGE)
import { loadStudents, saveStudents } from '../behavior/behaviorStorage';

export const GIFT_STORAGE_KEYS = {
  GIFTS_PREFIX: 'gifts_',
  REDEMPTIONS_PREFIX: 'redemptions_',
  FLASH_SALE_PREFIX: 'gift_flash_sale_',
  PIGGY_BANK_PREFIX: 'piggy_bank_',
};

// 6 PHẦN QUÀ MẪU BAN ĐẦU CHUẨN KỸ THUẬT THEO ĐỀ BÀI VÀ ẢNH THẦY GỬI
export const DEFAULT_GIFT_PRESETS = [
  {
    id: 'gift_preset_1',
    name: 'Bút highlight dạ quang pastel',
    requiredCoins: 10,
    stock: 20,
    category: 'stationery', // 'stationery' | 'souvenir' | 'privilege' | 'snack' | 'other'
    color: 'amber', // 'amber' | 'sky' | 'emerald' | 'rose' | 'purple' | 'indigo'
    iconKey: 'highlighter',
    redemptionLimit: 'none',
  },
  {
    id: 'gift_preset_2',
    name: 'Sổ tay lò xo bìa hoạt hình',
    requiredCoins: 15,
    stock: 15,
    category: 'stationery',
    color: 'sky',
    iconKey: 'notebook',
    redemptionLimit: 'none',
  },
  {
    id: 'gift_preset_3',
    name: 'Thước kẻ phát sáng phản quang',
    requiredCoins: 8,
    stock: 25,
    category: 'stationery',
    color: 'emerald',
    iconKey: 'ruler',
    redemptionLimit: 'none',
  },
  {
    id: 'gift_preset_4',
    name: 'Móc khóa thú bông mini',
    requiredCoins: 20,
    stock: 10,
    category: 'souvenir',
    color: 'rose',
    iconKey: 'bear',
    redemptionLimit: 'none',
  },
  {
    id: 'gift_preset_5',
    name: 'Thẻ miễn 1 lần bài tập về nhà',
    requiredCoins: 25,
    stock: 5,
    category: 'privilege',
    color: 'purple',
    iconKey: 'ticket',
    redemptionLimit: 'week',
  },
  {
    id: 'gift_preset_6',
    name: 'Bút gel xóa được ngòi 0.5mm',
    requiredCoins: 12,
    stock: 18,
    category: 'stationery',
    color: 'indigo',
    iconKey: 'pen',
    redemptionLimit: 'none',
  },
];

// 1. Tải danh sách quà tặng của lớp
export const loadGifts = (classId) => {
  if (!classId) return [];
  try {
    const raw = localStorage.getItem(GIFT_STORAGE_KEYS.GIFTS_PREFIX + classId);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Lỗi nạp quà lớp ${classId}:`, e);
    return [];
  }
};

// 2. Lưu danh sách quà tặng của lớp
export const saveGifts = (classId, gifts) => {
  if (!classId) return;
  try {
    localStorage.setItem(GIFT_STORAGE_KEYS.GIFTS_PREFIX + classId, JSON.stringify(gifts));
  } catch (e) {
    console.error(`Lỗi lưu quà lớp ${classId}:`, e);
  }
};

// 3. Nạp nhanh 6 quà mẫu ban đầu
export const seedDefaultGifts = (classId) => {
  if (!classId) return [];
  const prepared = DEFAULT_GIFT_PRESETS.map((p, idx) => ({
    ...p,
    id: `gift-${Date.now()}-${idx}`,
    classId,
    createdAt: new Date().toISOString(),
  }));
  saveGifts(classId, prepared);
  return prepared;
};

// 4. Tải lịch sử đổi quà của lớp
export const loadRedemptions = (classId) => {
  if (!classId) return [];
  try {
    const raw = localStorage.getItem(GIFT_STORAGE_KEYS.REDEMPTIONS_PREFIX + classId);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

// 5. Lưu lịch sử đổi quà của lớp
export const saveRedemptions = (classId, redemptions) => {
  if (!classId) return;
  try {
    localStorage.setItem(GIFT_STORAGE_KEYS.REDEMPTIONS_PREFIX + classId, JSON.stringify(redemptions));
  } catch (e) {}
};

// 6. Thêm một giao dịch đổi quà mới
export const addRedemption = (classId, item) => {
  const current = loadRedemptions(classId);
  const updated = [item, ...current];
  saveRedemptions(classId, updated);
  return updated;
};

// 7. Tạo mã Voucher dùng 1 lần (VD: 'VC-SCAN-991')
export const generateVoucherCode = () => {
  const randNum = Math.floor(100 + Math.random() * 900);
  const randChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `VC-SCAN-${randNum}${randChar}`;
};

// 8. Trừ xu học sinh trực tiếp vào cơ sở dữ liệu học sinh của lớp
export const deductStudentCoins = (classId, studentId, amount) => {
  if (!classId || !studentId) return null;
  const students = loadStudents(classId);
  let updatedStudent = null;

  const updatedStudents = students.map((s) => {
    if (s.id === studentId) {
      const currentCoins = s.plus_points || s.coins || 0;
      const newCoins = Math.max(0, currentCoins - amount);
      updatedStudent = {
        ...s,
        plus_points: newCoins,
        coins: newCoins,
      };
      return updatedStudent;
    }
    return s;
  });

  saveStudents(classId, updatedStudents);
  return updatedStudent;
};

// 9. Hoàn tác trả lại xu cho học sinh khi hủy giao dịch
export const refundStudentCoins = (classId, studentId, amount) => {
  if (!classId || !studentId) return null;
  const students = loadStudents(classId);
  let updatedStudent = null;

  const updatedStudents = students.map((s) => {
    if (s.id === studentId) {
      const currentCoins = s.plus_points || s.coins || 0;
      const newCoins = currentCoins + amount;
      updatedStudent = {
        ...s,
        plus_points: newCoins,
        coins: newCoins,
      };
      return updatedStudent;
    }
    return s;
  });

  saveStudents(classId, updatedStudents);
  return updatedStudent;
};

// 10. Quản lý sự kiện Giờ Vàng Flash Sale
export const loadFlashSaleConfig = (classId) => {
  if (!classId) return null;
  try {
    const raw = localStorage.getItem(GIFT_STORAGE_KEYS.FLASH_SALE_PREFIX + classId);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Kiểm tra hết hạn
    if (data.endsAt && new Date(data.endsAt) < new Date()) {
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
};

export const saveFlashSaleConfig = (classId, config) => {
  if (!classId) return;
  try {
    if (config) {
      localStorage.setItem(GIFT_STORAGE_KEYS.FLASH_SALE_PREFIX + classId, JSON.stringify(config));
    } else {
      localStorage.removeItem(GIFT_STORAGE_KEYS.FLASH_SALE_PREFIX + classId);
    }
  } catch (e) {}
};

// 11. Quản lý Heo Đất Tiết Kiệm (Piggy Bank)
export const loadPiggyBank = (classId) => {
  if (!classId) return {};
  try {
    const raw = localStorage.getItem(GIFT_STORAGE_KEYS.PIGGY_BANK_PREFIX + classId);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

export const savePiggyBank = (classId, piggyData) => {
  if (!classId) return;
  try {
    localStorage.setItem(GIFT_STORAGE_KEYS.PIGGY_BANK_PREFIX + classId, JSON.stringify(piggyData));
  } catch (e) {}
};
