import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, LogOut, User, ShieldCheck, GraduationCap, BarChart2 } from 'lucide-react';

export default function Navbar() {
  const { user, profile, signOut, isTeacher } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="bg-navy-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Tên Hệ Thống */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-500 transition">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-none">LMS HỌC LIỆU</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">HỆ THỐNG QUẢN LÝ HỌC TẬP E-LEARNING</span>
            </div>
          </Link>

          {/* User Info & Actions */}
          {user && (
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-slate-300 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-slate-800"
              >
                Khóa học
              </Link>

              {isTeacher && (
                <Link
                  to="/analytics"
                  className="flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-slate-800"
                >
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  <span>Thống kê & Điểm</span>
                </Link>
              )}

              {/* Tag Vai Trò */}
              <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
                {isTeacher ? (
                  <span className="flex items-center text-xs font-semibold text-emerald-400 space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Giáo viên</span>
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-semibold text-teal-400 space-x-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Học sinh</span>
                  </span>
                )}
                <span className="text-slate-600">|</span>
                <span className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
                  {profile?.full_name || user.email}
                </span>
              </div>

              {/* Nút Đăng xuất */}
              <button
                onClick={handleSignOut}
                title="Đăng xuất khỏi hệ thống"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
