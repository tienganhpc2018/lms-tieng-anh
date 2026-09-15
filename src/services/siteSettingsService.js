import { supabase } from '../lib/supabase';

const TABLE_NAME = 'site_settings';
const STORAGE_BUCKET = 'lms-files';
const REALTIME_CHANNEL_NAME = 'lms_site_settings_channel';

// Kênh Realtime đơn lẻ chia sẻ toàn ứng dụng
let sharedRealtimeChannel = null;

function getRealtimeChannel() {
  if (!sharedRealtimeChannel) {
    sharedRealtimeChannel = supabase.channel(REALTIME_CHANNEL_NAME, {
      config: { broadcast: { self: false } },
    });
    sharedRealtimeChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[SiteSettings] Supabase Realtime channel connected');
      }
    });
  }
  return sharedRealtimeChannel;
}

/**
 * Lấy cấu hình hệ thống:
 * 1. Đọc nhanh từ localStorage (0ms)
 * 2. Đọc từ bảng site_settings của Supabase DB (nếu đã tạo bảng)
 * 3. Đọc từ Cloud Storage 'lms-files/settings/{key}.json' (đồng bộ 100% giữa GV và HS ngay cả khi DB chưa tạo bảng)
 * @param {string} key - Tên cấu hình (ví dụ: 'hero_banner_config', 'footer_config')
 * @param {object} fallbackDefault - Giá trị mặc định nếu chưa từng lưu
 * @returns {Promise<object>} Dữ liệu cấu hình
 */
export async function getSiteSetting(key, fallbackDefault) {
  const localKey = `lms_${key}`;
  let cachedValue = fallbackDefault;

  // 1. Đọc nhanh từ cache cục bộ
  try {
    const localData = localStorage.getItem(localKey);
    if (localData) {
      cachedValue = { ...fallbackDefault, ...JSON.parse(localData) };
    }
  } catch (e) {
    console.warn(`[SiteSettings] Lỗi đọc cache ${key}:`, e);
  }

  // 2. Thử truy vấn bảng site_settings trên Supabase DB
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (!error && data && data.value) {
      const merged = { ...fallbackDefault, ...data.value };
      localStorage.setItem(localKey, JSON.stringify(merged));
      return merged;
    }
  } catch (dbErr) {
    // Bảng chưa tạo hoặc lỗi schema -> tiếp tục sang Cloud Storage
  }

  // 3. Dự phòng Cloud Storage lms-files/settings/{key}.json (100% không phụ thuộc bảng SQL)
  try {
    const { data: pubUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`settings/${key}.json`);

    if (pubUrlData?.publicUrl) {
      const resp = await fetch(`${pubUrlData.publicUrl}?t=${Date.now()}`);
      if (resp.ok) {
        const cloudData = await resp.json();
        if (cloudData && typeof cloudData === 'object') {
          const merged = { ...fallbackDefault, ...cloudData };
          localStorage.setItem(localKey, JSON.stringify(merged));
          return merged;
        }
      }
    }
  } catch (cloudErr) {
    // Nếu offline thì dùng cache cục bộ
  }

  return cachedValue;
}

/**
 * Lưu cấu hình hệ thống:
 * 1. Lưu ngay vào localStorage
 * 2. Lưu vào Supabase Cloud Storage (đảm bảo HS mở máy khác sẽ đọc được 100%)
 * 3. Đồng bộ vào bảng site_settings (nếu có)
 * 4. Phát sóng Realtime Broadcast cho mọi tài khoản HS đang online
 * @param {string} key - Tên cấu hình
 * @param {object} value - Giá trị cấu hình cần lưu
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export async function saveSiteSetting(key, value) {
  const localKey = `lms_${key}`;

  // 1. Phản hồi ngay lập tức trên máy hiện tại
  try {
    localStorage.setItem(localKey, JSON.stringify(value));
  } catch (e) {
    console.warn(`[SiteSettings] Lỗi lưu cache ${key}:`, e);
  }

  let cloudSaveSuccess = false;

  // 2. Lưu trực tiếp vào Cloud Storage (đảm bảo 100% học sinh máy khác đọc được)
  try {
    const jsonStr = JSON.stringify(value);
    const { error: storageErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`settings/${key}.json`, jsonStr, {
        upsert: true,
        contentType: 'application/json',
      });

    if (!storageErr) {
      cloudSaveSuccess = true;
    } else {
      console.warn(`[SiteSettings] Storage upload warning:`, storageErr.message);
    }
  } catch (storageException) {
    console.warn(`[SiteSettings] Storage upload exception:`, storageException);
  }

  // 3. Đồng bộ lên bảng site_settings trong Supabase DB
  try {
    const payload = {
      key,
      value,
      updated_at: new Date().toISOString(),
    };

    const { error: dbErr } = await supabase
      .from(TABLE_NAME)
      .upsert([payload], { onConflict: 'key' });

    if (!dbErr) {
      cloudSaveSuccess = true;
    }
  } catch (dbException) {
    // Bỏ qua lỗi nếu bảng SQL chưa tạo
  }

  // 4. Phát sóng Realtime qua Supabase Broadcast Channel tới mọi trình duyệt của học sinh
  try {
    const channel = getRealtimeChannel();
    await channel.send({
      type: 'broadcast',
      event: 'setting_change',
      payload: {
        key,
        value,
        timestamp: Date.now(),
      },
    });
  } catch (broadcastErr) {
    console.warn(`[SiteSettings] Realtime broadcast error:`, broadcastErr);
  }

  return { success: cloudSaveSuccess };
}

/**
 * Đăng ký nhận cập nhật Real-time khi Giáo viên thay đổi cấu hình:
 * - Lắng nghe kênh Realtime Broadcast của Supabase
 * - Lắng nghe sự kiện window 'focus' (khi HS chuyển qua tab LMS)
 * - Tự động polling kiểm tra mỗi 12 giây
 * @param {string} key - Tên cấu hình cần theo dõi
 * @param {function} callback - Hàm gọi lại khi có dữ liệu mới (newConfig) => void
 * @returns {function} Hàm hủy đăng ký (unsubscribe)
 */
export function subscribeSiteSetting(key, callback) {
  let isSubscribed = true;
  let lastKnownJson = '';

  const channel = getRealtimeChannel();

  // Handler xử lý Realtime Broadcast
  const handleBroadcast = (data) => {
    if (!isSubscribed) return;
    const payload = data?.payload;
    if (payload && payload.key === key && payload.value) {
      const newJson = JSON.stringify(payload.value);
      if (newJson !== lastKnownJson) {
        lastKnownJson = newJson;
        // Cập nhật lại cache cục bộ
        localStorage.setItem(`lms_${key}`, newJson);
        callback(payload.value);
      }
    }
  };

  channel.on('broadcast', { event: 'setting_change' }, handleBroadcast);

  // Polling ngầm định kỳ 12s và kiểm tra khi người dùng quay lại tab LMS
  const checkFreshUpdate = async () => {
    if (!isSubscribed) return;
    try {
      const fresh = await getSiteSetting(key, null);
      if (fresh && isSubscribed) {
        const freshJson = JSON.stringify(fresh);
        if (freshJson !== lastKnownJson) {
          lastKnownJson = freshJson;
          callback(fresh);
        }
      }
    } catch (e) {}
  };

  const handleFocus = () => {
    checkFreshUpdate();
  };

  window.addEventListener('focus', handleFocus);
  const intervalId = setInterval(checkFreshUpdate, 12000);

  return () => {
    isSubscribed = false;
    window.removeEventListener('focus', handleFocus);
    clearInterval(intervalId);
  };
}
