import { createClient } from '@supabase/supabase-js';

// Đọc thông số kết nối từ biến môi trường
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Khởi tạo Supabase Client duy nhất cho toàn ứng dụng
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper upload file lên Supabase Storage bucket 'lms-files'
 * @param {File} file - File tải lên
 * @param {string} folder - Thư mục lưu trữ trong bucket
 * @returns {Promise<string>} Public URL của file sau khi upload
 */
export async function uploadLMSFile(file, folder = 'uploads') {
  if (!file) return null;
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('lms-files')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
    
  if (error) {
    console.error('Lỗi upload file:', error.message);
    throw error;
  }
  
  const { data: publicUrlData } = supabase.storage
    .from('lms-files')
    .getPublicUrl(fileName);
    
  return publicUrlData.publicUrl;
}
