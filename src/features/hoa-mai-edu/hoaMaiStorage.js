// Storage service cho Hoa Mai Education Suite
// Tự động nạp Seed data lần đầu, lưu bền vững vào LocalStorage không mất khi F5

import {
  DEFAULT_CENTER_CONFIG,
  INITIAL_TRACKING_SHEETS,
  INITIAL_CLASSES,
  INITIAL_TEACHERS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_INVOICES
} from './hoaMaiSeedData';

const STORAGE_KEY = 'hoa_mai_edu_state_v2';

export const loadHoaMaiState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialState = {
        centerConfig: DEFAULT_CENTER_CONFIG,
        trackingSheets: INITIAL_TRACKING_SHEETS,
        classes: INITIAL_CLASSES,
        teachers: INITIAL_TEACHERS,
        leaveRequests: INITIAL_LEAVE_REQUESTS,
        invoices: INITIAL_INVOICES,
        lastUpdated: new Date().toISOString()
      };
      saveHoaMaiState(initialState);
      return initialState;
    }
    const parsed = JSON.parse(raw);
    return {
      centerConfig: parsed.centerConfig || DEFAULT_CENTER_CONFIG,
      trackingSheets: parsed.trackingSheets || INITIAL_TRACKING_SHEETS,
      classes: parsed.classes || INITIAL_CLASSES,
      teachers: parsed.teachers || INITIAL_TEACHERS,
      leaveRequests: parsed.leaveRequests || INITIAL_LEAVE_REQUESTS,
      invoices: parsed.invoices || INITIAL_INVOICES,
      lastUpdated: parsed.lastUpdated || new Date().toISOString()
    };
  } catch (err) {
    console.error('Error loading Hoa Mai state:', err);
    return {
      centerConfig: DEFAULT_CENTER_CONFIG,
      trackingSheets: INITIAL_TRACKING_SHEETS,
      classes: INITIAL_CLASSES,
      teachers: INITIAL_TEACHERS,
      leaveRequests: INITIAL_LEAVE_REQUESTS,
      invoices: INITIAL_INVOICES,
      lastUpdated: new Date().toISOString()
    };
  }
};

export const saveHoaMaiState = (state) => {
  try {
    const dataToSave = {
      ...state,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.error('Error saving Hoa Mai state:', err);
  }
};

// Hàm xuất toàn bộ dữ liệu ra file JSON sao lưu
export const exportHoaMaiBackup = () => {
  const state = loadHoaMaiState();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `HoaMaiEdu_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Hàm khôi phục dữ liệu từ file JSON
export const importHoaMaiBackup = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.trackingSheets || !data.centerConfig) {
      throw new Error('Định dạng file sao lưu không hợp lệ!');
    }
    saveHoaMaiState(data);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Hàm reset về dữ liệu mẫu mặc định
export const resetHoaMaiToDefault = () => {
  localStorage.removeItem(STORAGE_KEY);
  return loadHoaMaiState();
};
