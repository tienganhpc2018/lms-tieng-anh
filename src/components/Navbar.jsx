import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge } from './Badge';
import { LogOut, User, Sparkles, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, profile, role, signOut, isConfigured } = useAuth();
  const navigate = useNavigate();

  const getRoleBadge = (r) => {
    switch (r) {
      case 'admin':
        return <Badge variant="purple">ADMINISTRATOR</Badge>;
      case 'teacher':
        return <Badge variant="emerald">GIÁO VIÊN</Badge>;
      default:
        return <Badge variant="brand">HỌC SINH</Badge>;
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
              EduSmart AI
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
              GLOBAL SUCCESS 6-9
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Hệ thống Quản lý & Khảo thí Giáo dục AI</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isConfigured && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Cần file .env (Supabase)
          </span>
        )}

        {user ? (
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl px-3 py-1.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300 font-bold">
              {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200 truncate max-w-[140px]">
                  {profile?.full_name || user.email}
                </span>
                {getRoleBadge(role)}
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              title="Đăng xuất"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 transition-all"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-500/20 transition-all"
            >
              Đăng ký
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
