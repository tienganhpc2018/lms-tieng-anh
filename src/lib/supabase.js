import { createClient } from '@supabase/supabase-js';

// Cấu hình URL & Key Supabase chuẩn 100% làm giá trị bảo vệ tuyệt đối
const HARDCODED_URL = 'https://wjphcawebrxdvituvuac.supabase.co';
const HARDCODED_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcGhjYXdlYnJ4ZHZpdHV2dWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMTM2MTYsImV4cCI6MjEwMjU4OTYxNn0.zihrFyxoPiD8ndmFa5az5tHI2GIGAqm-oz5Mohyiueo';

function getValidUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return HARDCODED_URL;
  const clean = rawUrl.trim().replace(/^["']|["']$/g, '');
  try {
    const parsed = new URL(clean);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return clean;
    }
  } catch (e) {}
  return HARDCODED_URL;
}

function getValidKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string') return HARDCODED_KEY;
  const clean = rawKey.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
  if (clean.length < 20) return HARDCODED_KEY;
  return clean;
}

const supabaseUrl = getValidUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = getValidKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

console.log('[Supabase Connect] Connected to URL:', supabaseUrl);

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
