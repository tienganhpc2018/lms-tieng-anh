import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, BarChart2, LogOut, ShieldCheck, GraduationCap, Users, User } from 'lucide-react';
import UserManagementModal from '../lms/UserManagementModal';

export default function Navbar() {
  const { user, profile, isTeacher, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);

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

          {/* MENU NGANG TRÊN CÙNG */}
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

            {/* QUẢN LÝ HỌC SINH & TÀI KHOẢN (SITE ADMIN FOR TEACHERS) */}
            {isTeacher && (
              <button
                type="button"
                onClick={() => setIsUserMgmtOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-2 bg-purple-950/40 text-purple-300 border border-purple-500/30 hover:bg-purple-900 hover:text-white"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Quản Lý Học Sinh (Users)</span>
              </button>
            )}

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

          {/* User Info / Profile Button: BẤM VÀO TÊN HOẶC AVATAR MỞ TRANG PROFILE CÁ NHÂN CHUẨN MOODLE GNOMIO */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer group"
                  title="Bấm để xem & chỉnh sửa Hồ sơ cá nhân (User Profile)"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full object-cover border border-emerald-400"
                    />
                  ) : isTeacher ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <GraduationCap className="w-4 h-4 text-sky-400" />
                  )}
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-100 block leading-tight group-hover:text-emerald-400 transition">
                      {profile?.full_name || user.email}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium uppercase">
                      {isTeacher ? 'Giáo Viên' : 'Học Sinh'}
                    </span>
                  </div>
                </Link>

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

      {/* MODAL QUẢN LÝ HỌC SINH SITE ADMIN */}
      <UserManagementModal
        isOpen={isUserMgmtOpen}
        onClose={() => setIsUserMgmtOpen(false)}
      />
    </nav>
  );
}
