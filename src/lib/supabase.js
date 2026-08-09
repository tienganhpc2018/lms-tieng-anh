import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yxfdlyqwbnxacpjspdnd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZmRseXF3Ym54YWNwanNwZG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNTk4NjAsImV4cCI6MjEwMTgzNTg2MH0.qt1Fz0c6eaqqBa0cy9c8HgAd1LIaJYXYTZPEhPppgEo';

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

