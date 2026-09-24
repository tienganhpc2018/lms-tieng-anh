import { supabase } from '../lib/supabase';

const TABLE_NAME = 'site_settings';
const STORAGE_BUCKET = 'lms-files';

/**
 * Lấy cấu hình hệ thống:
 * 1. Đọc nhanh từ localStorage (0ms)
 * 2. Đọc từ bảng site_settings của Supabase DB (nếu đã tạo bảng)
 * 3. Đọc từ Cloud Storage 'lms-files/settings/{key}.json' (dự phòng)
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

  // 1. Đọc nhanh từ cache cục bộ (0ms)
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
      try {
        localStorage.setItem(localKey, JSON.stringify(merged));
      } catch (e) {}
      return merged;
    }
  } catch (dbErr) {
    // Bỏ qua lỗi schema/mạng
  }

  // 3. Dự phòng Cloud Storage lms-files/settings/{key}.json
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
          try {
            localStorage.setItem(localKey, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        }
      }
    }
  } catch (cloudErr) {
    // Bỏ qua lỗi Cloud Storage
  }

  return cachedValue;
}

/**
 * Lưu cấu hình hệ thống:
 * 1. Lưu ngay vào localStorage (0ms phản hồi)
 * 2. Đồng bộ lên bảng site_settings trong Supabase DB
 * 3. Phát sóng Realtime Broadcast cho mọi tài khoản HS đang online
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

  // 2. Đồng bộ lên bảng site_settings trong Supabase DB
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

  // 3. Phát sóng Realtime Broadcast thông báo thay đổi
  try {
    const pubChannel = supabase.channel(`pub_notify_${Date.now()}`);
    pubChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const jsonStr = JSON.stringify(value);
        const isLight = jsonStr.length < 50000;
        await pubChannel.send({
          type: 'broadcast',
          event: 'setting_change',
          payload: {
            key,
            timestamp: Date.now(),
            value: isLight ? value : undefined,
          },
        }).catch(() => {});
        // Đóng kênh phát sau 1.5s
        setTimeout(() => {
          try {
            supabase.removeChannel(pubChannel);
          } catch (e) {}
        }, 1500);
      }
    });
  } catch (broadcastErr) {
    console.warn(`[SiteSettings] Realtime broadcast error:`, broadcastErr);
  }

  // 4. Dự phòng Cloud Storage ngầm (không chặn luồng)
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
 * Đăng ký nhận cập nhật Real-time an toàn tuyệt đối:
 * - Lắng nghe Postgres Changes trên bảng site_settings
 * - Lắng nghe Broadcast
 * - Polling dự phòng khi window 'focus' và định kỳ 8 giây
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

  // Hàm cập nhật an toàn không bao giờ throw error
  const handleIncomingValue = (val) => {
    if (!isSubscribed || val === undefined || val === null) return;
    try {
      const newJson = JSON.stringify(val);
      if (newJson !== lastKnownJson) {
        lastKnownJson = newJson;
        try {
          localStorage.setItem(`lms_${key}`, newJson);
        } catch (e) {}
        callback(val);
      }
    } catch (e) {}
  };

  let subChannel = null;

  try {
    const chanName = `sub_${key}_${Math.random().toString(36).slice(2, 7)}`;
    subChannel = supabase.channel(chanName);

    // 1. Đăng ký Realtime Broadcast (BẮT BUỘC gọi trước .subscribe())
    subChannel.on('broadcast', { event: 'setting_change' }, async (data) => {
      if (!isSubscribed) return;
      try {
        const payload = data?.payload;
        if (payload && payload.key === key) {
          if (payload.value !== undefined && payload.value !== null) {
            handleIncomingValue(payload.value);
          } else {
            const fresh = await getSiteSetting(key, null);
            if (fresh) handleIncomingValue(fresh);
          }
        }
      } catch (e) {}
    });

    // 2. Đăng ký Postgres Changes (BẮT BUỘC gọi trước .subscribe())
    subChannel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLE_NAME,
        filter: `key=eq.${key}`,
      },
      (payload) => {
        if (!isSubscribed) return;
        try {
          const newValue = payload?.new?.value;
          if (newValue !== undefined && newValue !== null) {
            handleIncomingValue(newValue);
          }
        } catch (e) {}
      }
    );

    // 3. Gọi subscribe SAU KHI đã gắn đầy đủ listeners
    subChannel.subscribe();
  } catch (subErr) {
    console.warn(`[SiteSettings] Lỗi tạo subChannel cho ${key}:`, subErr);
  }

  // 4. Polling ngầm định kỳ 8s và kiểm tra khi quay lại tab LMS (An toàn tuyệt đối)
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

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', handleFocus);
  }
  const intervalId = setInterval(checkFreshUpdate, 8000);

  return () => {
    isSubscribed = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', handleFocus);
    }
    clearInterval(intervalId);
    if (subChannel) {
      try {
        supabase.removeChannel(subChannel);
      } catch (e) {}
    }
  };
}
