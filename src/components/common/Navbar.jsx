import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, BarChart2, LogOut, User, ShieldCheck, GraduationCap, Award } from 'lucide-react';

export default function Navbar() {
  const { user, profile, isTeacher, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="bg-navy-900 text-white sticky top-0 z-40 shadow-md border-b border-slate-800 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-emerald-500 transition">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-tight">
                LMS TIẾNG ANH
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 block tracking-wider uppercase">
                SMART E-LEARNING PLATFORM
              </span>
            </div>
          </Link>

          {/* MENU NGANG TRÊN CÙNG ĐÃ LOẠI BỎ TAB SOẠN ĐỀ AI VÀ NGÂN HÀNG CÂU HỎI THEO CHỈ ĐẠO CỦA THẦY */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-2 ${
                location.pathname === '/dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Khóa Học</span>
            </Link>

            {/* TAB MENU: THI THỬ */}
            <Link
              to="/mock-exam"
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-2 ${
                location.pathname === '/mock-exam'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-purple-400" />
              <span>Thi Thử</span>
            </Link>

            {/* Trang Analytics cho Giáo viên */}
            {isTeacher && (
              <Link
                to="/analytics"
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-2 ${
                  location.pathname === '/analytics'
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BarChart2 className="w-4 h-4 text-teal-400" />
                <span>Bảng Điểm & Analytics</span>
              </Link>
            )}
          </div>

          {/* User Info / Profile Button */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                  {isTeacher ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <GraduationCap className="w-4 h-4 text-sky-400" />
                  )}
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-100 block leading-tight">
                      {profile?.full_name || user.email}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium uppercase">
                      {isTeacher ? 'Giáo Viên' : 'Học Sinh'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Đăng Nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
