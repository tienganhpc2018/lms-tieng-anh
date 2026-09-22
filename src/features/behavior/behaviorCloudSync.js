// MODULE ĐỒNG BỘ DỮ LIỆU SỔ NỀ NẾP LÊN SUPABASE CLOUD THEO THỜI GIAN THỰC
import { supabase } from '../../lib/supabase';
import { loadClasses, saveClasses, loadStudents, saveStudents } from './behaviorStorage';

const CLOUD_SYNC_TIME_KEY = 'behavior_cloud_last_sync';

// Lấy thời gian đồng bộ Cloud gần nhất
export const getCloudLastSyncTime = () => {
  try {
    return localStorage.getItem(CLOUD_SYNC_TIME_KEY) || null;
  } catch (e) {
    return null;
  }
};

// 1. ĐẨY DỮ LIỆU LÊN SUPABASE CLOUD (BACKUP TO CLOUD)
export const syncBehaviorToCloud = async (selectedClassId, students = [], classes = []) => {
  try {
    const recordId = selectedClassId ? `class_${selectedClassId}` : 'behavior_all';
    const payload = {
      id: recordId,
      classes_data: classes.length > 0 ? classes : loadClasses(),
      students_data: students.length > 0 ? students : (selectedClassId ? loadStudents(selectedClassId) : []),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('behavior_records')
      .upsert([payload], { onConflict: 'id' });

    if (error) {
      console.warn('Lưu ý đồng bộ Cloud Supabase:', error.message);
      return {
        success: false,
        error: error.message,
        tableMissing: error.message?.includes('relation "public.behavior_records" does not exist') || error.code === '42P01',
      };
    }

    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem(CLOUD_SYNC_TIME_KEY, timeStr);

    return { success: true, lastSyncTime: timeStr };
  } catch (err) {
    console.error('Lỗi khi gọi Supabase Sync:', err);
    return { success: false, error: err.message };
  }
};

// 2. TẢI DỮ LIỆU TỪ SUPABASE CLOUD VỀ MÁY NÀY (RESTORE FROM CLOUD)
export const restoreBehaviorFromCloud = async (selectedClassId) => {
  try {
    const recordId = selectedClassId ? `class_${selectedClassId}` : 'behavior_all';
    const { data, error } = await supabase
      .from('behavior_records')
      .select('*')
      .eq('id', recordId)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, message: 'Chưa tìm thấy bản sao lưu nào trên Cloud cho lớp này!' };
    }

    // Khôi phục vào LocalStorage
    if (data.classes_data && Array.isArray(data.classes_data)) {
      saveClasses(data.classes_data);
    }
    if (selectedClassId && data.students_data && Array.isArray(data.students_data)) {
      saveStudents(selectedClassId, data.students_data);
    }

    return {
      success: true,
      classes: data.classes_data || [],
      students: data.students_data || [],
      updatedAt: data.updated_at,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
