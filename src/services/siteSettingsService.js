import { supabase } from '../lib/supabase';

const TABLE_NAME = 'site_settings';

/**
 * Lấy cấu hình hệ thống từ Supabase DB (ưu tiên) hoặc localStorage (dự phòng)
 * @param {string} key - Tên cấu hình (ví dụ: 'footer_config', 'hero_banner_config')
 * @param {object} fallbackDefault - Giá trị mặc định nếu chưa từng cấu hình
 * @returns {Promise<object>} Dữ liệu cấu hình
 */
export async function getSiteSetting(key, fallbackDefault) {
  const localKey = `lms_${key}`;
  let cachedValue = fallbackDefault;

  // 1. Đọc nhanh từ localStorage để hiển thị ngay tức thì (không có độ trễ)
  try {
    const localData = localStorage.getItem(localKey);
    if (localData) {
      cachedValue = { ...fallbackDefault, ...JSON.parse(localData) };
    }
  } catch (e) {
    console.warn(`[SiteSettings] Lỗi đọc cache ${key}:`, e);
  }

  // 2. Bất đồng bộ truy vấn từ Supabase DB để lấy dữ liệu mới nhất nếu có kết nối mạng
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (!error && data && data.value) {
      const merged = { ...fallbackDefault, ...data.value };
      // Cập nhật lại localStorage để đồng bộ offline
      localStorage.setItem(localKey, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    // Không ném lỗi nếu bảng chưa tạo hoặc offline -> dùng cache cục bộ
    console.log(`[SiteSettings] Sử dụng cache cục bộ cho ${key}`);
  }

  return cachedValue;
}

/**
 * Lưu cấu hình hệ thống đồng bộ lên Supabase DB và cập nhật localStorage
 * @param {string} key - Tên cấu hình
 * @param {object} value - Giá trị cấu hình cần lưu
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export async function saveSiteSetting(key, value) {
  const localKey = `lms_${key}`;

  // 1. Luôn lưu ngay vào localStorage để phản hồi tức thì trên máy hiện tại
  try {
    localStorage.setItem(localKey, JSON.stringify(value));
  } catch (e) {
    console.warn(`[SiteSettings] Lỗi lưu cache ${key}:`, e);
  }

  // 2. Đồng bộ lên bảng site_settings của Supabase DB
  try {
    const payload = {
      key,
      value,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert([payload], { onConflict: 'key' });

    if (error) {
      console.warn(`[SiteSettings] Supabase upsert error cho ${key}:`, error.message);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.warn(`[SiteSettings] Không thể kết nối Supabase cho ${key}:`, err);
    return { success: false, error: err };
  }
}
