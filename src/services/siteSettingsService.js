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

  const mergeValues = (base, incoming) => {
    if (incoming === undefined || incoming === null) return base;
    if (Array.isArray(incoming)) return incoming;
    if (typeof incoming === 'object' && typeof base === 'object' && !Array.isArray(base)) {
      return { ...base, ...incoming };
    }
    return incoming;
  };

  // 1. Đọc nhanh từ cache cục bộ
  try {
    const localData = localStorage.getItem(localKey);
    if (localData) {
      cachedValue = mergeValues(fallbackDefault, JSON.parse(localData));
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

    if (!error && data && data.value !== undefined && data.value !== null) {
      const merged = mergeValues(fallbackDefault, data.value);
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
        if (cloudData !== undefined && cloudData !== null) {
          const merged = mergeValues(fallbackDefault, cloudData);
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
 * 1. Lưu ngay vào localStorage (0ms phản hồi cục bộ)
 * 2. Đồng bộ lên bảng site_settings trong Supabase DB (kích hoạt Postgres Changes Real-time)
 * 3. Phát sóng Realtime Broadcast cho mọi trình duyệt HS đang online
 * 4. Dự phòng Cloud Storage ngầm
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

  let dbSaveSuccess = false;

  // 2. Ưu tiên hàng đầu: Đồng bộ lên bảng site_settings trong Supabase DB (Tốc độ vài chục ms)
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
      dbSaveSuccess = true;
    } else {
      console.warn(`[SiteSettings] Lỗi lưu DB ${key}:`, dbErr.message);
    }
  } catch (dbException) {
    console.warn(`[SiteSettings] Ngoại lệ lưu DB:`, dbException);
  }

  // 3. Phát sóng Realtime qua Supabase Broadcast Channel tới mọi trình duyệt của học sinh
  // Tối ưu: Nếu dữ liệu lớn (>50KB, ví dụ cuộn phim chứa ảnh), chỉ gửi key + timestamp để không vượt 256KB giới hạn WebSocket
  try {
    const channel = getRealtimeChannel();
    const jsonStr = JSON.stringify(value);
    const isLightPayload = jsonStr.length < 50000;

    const broadcastPayload = {
      key,
      timestamp: Date.now(),
    };
    if (isLightPayload) {
      broadcastPayload.value = value;
    }

    await channel.send({
      type: 'broadcast',
      event: 'setting_change',
      payload: broadcastPayload,
    });
  } catch (broadcastErr) {
    console.warn(`[SiteSettings] Realtime broadcast error:`, broadcastErr);
  }

  // 4. Dự phòng Cloud Storage ngầm (không chặn luồng chính)
  try {
    const jsonStr = JSON.stringify(value);
    supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`settings/${key}.json`, jsonStr, {
        upsert: true,
        contentType: 'application/json',
      })
      .catch(() => {});
  } catch (e) {}

  return { success: dbSaveSuccess };
}

/**
 * Đăng ký nhận cập nhật Real-time khi Giáo viên thay đổi cấu hình:
 * - Lắng nghe Postgres Changes trên bảng site_settings của Supabase DB
 * - Lắng nghe kênh Realtime Broadcast của Supabase
 * - Lắng nghe sự kiện window 'focus' (khi HS chuyển qua tab LMS)
 * - Tự động polling kiểm tra mỗi 8 giây
 * @param {string} key - Tên cấu hình cần theo dõi
 * @param {function} callback - Hàm gọi lại khi có dữ liệu mới (newConfig) => void
 * @returns {function} Hàm hủy đăng ký (unsubscribe)
 */
export function subscribeSiteSetting(key, callback) {
  let isSubscribed = true;
  let lastKnownJson = '';

  // Nạp trạng thái đã biết từ cache cục bộ
  try {
    const cached = localStorage.getItem(`lms_${key}`);
    if (cached) lastKnownJson = cached;
  } catch (e) {}

  const channel = getRealtimeChannel();

  // Hàm xử lý dữ liệu mới nhận được
  const handleIncomingValue = (val) => {
    if (!isSubscribed || val === undefined || val === null) return;
    const newJson = JSON.stringify(val);
    if (newJson !== lastKnownJson) {
      lastKnownJson = newJson;
      try {
        localStorage.setItem(`lms_${key}`, newJson);
      } catch (e) {}
      callback(val);
    }
  };

  // 1. Lắng nghe Realtime Broadcast
  const handleBroadcast = async (data) => {
    if (!isSubscribed) return;
    const payload = data?.payload;
    if (payload && payload.key === key) {
      if (payload.value !== undefined && payload.value !== null) {
        handleIncomingValue(payload.value);
      } else {
        // Payload rút gọn -> kéo dữ liệu mới nhất từ Supabase DB ngay
        try {
          const fresh = await getSiteSetting(key, null);
          if (fresh) handleIncomingValue(fresh);
        } catch (e) {}
      }
    }
  };

  channel.on('broadcast', { event: 'setting_change' }, handleBroadcast);

  // 2. Lắng nghe trực tiếp Postgres Changes trên bảng site_settings (Độ trễ <100ms)
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: TABLE_NAME,
      filter: `key=eq.${key}`,
    },
    (payload) => {
      if (!isSubscribed) return;
      const newValue = payload?.new?.value;
      if (newValue !== undefined && newValue !== null) {
        handleIncomingValue(newValue);
      }
    }
  );

  // 3. Polling ngầm định kỳ 8s và kiểm tra khi người dùng quay lại tab LMS (Dự phòng mạng)
  const checkFreshUpdate = async () => {
    if (!isSubscribed) return;
    try {
      const fresh = await getSiteSetting(key, null);
      if (fresh) handleIncomingValue(fresh);
    } catch (e) {}
  };

  const handleFocus = () => {
    checkFreshUpdate();
  };

  window.addEventListener('focus', handleFocus);
  const intervalId = setInterval(checkFreshUpdate, 8000);

  return () => {
    isSubscribed = false;
    window.removeEventListener('focus', handleFocus);
    clearInterval(intervalId);
  };
}
