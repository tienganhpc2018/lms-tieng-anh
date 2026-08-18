import { createClient } from '@supabase/supabase-js';

// Đọc thông số kết nối từ biến môi trường và làm sạch khoảng trắng thừa (.trim)
const DEFAULT_URL = 'https://wjphcawebrxdvituvuac.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcGhjYXdlYnJ4ZHZpdHV2dWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMTM2MTYsImV4cCI6MjEwMjU4OTYxNn0.zihrFyxoPiD8ndmFa5az5tHI2GIGAqm-oz5Mohyiueo';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (envUrl && envUrl.trim() !== '') ? envUrl.trim() : DEFAULT_URL;
const supabaseAnonKey = (envKey && envKey.trim() !== '') ? envKey.trim() : DEFAULT_KEY;

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
