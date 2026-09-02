import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, LogOut, User, ChevronDown, Calendar, Folder, FileText, Settings, Award, Menu } from 'lucide-react';
import UserManagementModal from '../lms/UserManagementModal';
import ForcePasswordChangeModal from '../lms/ForcePasswordChangeModal';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, profile, isTeacher, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isForcePasswordChangeOpen, setIsForcePasswordChangeOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user && !isTeacher) {
      const changedUsers = JSON.parse(localStorage.getItem('lms_changed_passwords_v2') || '{}');
      const uKey = profile?.id || profile?.username || user.email;
      if (uKey && !changedUsers[uKey]) {
        setIsForcePasswordChangeOpen(true);
      }
    }
  }, [user, profile, isTeacher]);

  const handleSignOut = async () => {
    setIsUserDropdownOpen(false);
    await signOut();
    navigate('/auth');
  };

  // Đóng dropdown khi nhấp ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ưu tiên hiển thị Họ và Tên đầy đủ thay vì Username (Đặc biệt tài khoản Thầy Hải hiển thị Nguyễn Văn Hải)
  const getDisplayName = (prof, usr) => {
    const emailOrName = (prof?.email || usr?.email || prof?.username || '').toLowerCase();
    if (emailOrName.includes('nguyensea') || emailOrName.includes('nguyenvanhai') || emailOrName.includes('tienganhpc2018')) {
      return 'Nguyễn Văn Hải';
    }
    if (prof?.full_name && prof.full_name.trim() !== '' && prof.full_name !== prof.username) {
      return prof.full_name.trim();
    }
    if (usr?.user_metadata?.full_name && usr.user_metadata.full_name.trim() !== '') {
      return usr.user_metadata.full_name.trim();
    }
    return prof?.full_name || prof?.username || usr?.email?.split('@')[0] || 'User';
  };

  const displayName = getDisplayName(profile, user);
  const avatarImage = profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <nav className="bg-navy-900 text-white sticky top-0 z-[60] shadow-md border-b border-slate-800 font-sans select-none">
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

          {/* USER INFO DROPDOWN CHUẨN MOODLE GNOMIO (GÓC PHẢI NAV BAR) - ẨN HOÀN TOÀN KHI Ở TRANG AUTH */}
          <div className="flex items-center space-x-3" ref={dropdownRef}>
            {user && location.pathname !== '/auth' ? (
              <div className="flex items-center space-x-2">
                {/* 🔔 QUẢ CHUÔNG THÔNG BÁO THẬT NHẢY CHẤM ĐỎ DÀNH CHO HỌC SINH */}
                <NotificationBell />

                <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-2xl border border-slate-700 transition cursor-pointer group shadow-sm"
                >
                  <img
                    src={avatarImage}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-400 shadow-2xs"
                  />
                  <span className="text-xs font-extrabold text-slate-100 group-hover:text-emerald-400 transition">
                    {displayName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN MENU CHUẨN MOODLE GNOMIO */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-xs font-bold text-slate-700 animate-scale-up">
                    <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                      <span className="text-slate-900 font-extrabold block truncate">{displayName}</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase block">
                        {isTeacher ? 'Giáo Viên' : 'Học Sinh'}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="px-4 py-2 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 transition"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Profile (Hồ sơ cá nhân)</span>
                    </Link>

                    <Link
                      to="/analytics"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="px-4 py-2 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 transition"
                    >
                      <Award className="w-4 h-4 text-purple-600" />
                      <span>Grades (Bảng điểm)</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="px-4 py-2 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 transition"
                    >
                      <Calendar className="w-4 h-4 text-sky-600" />
                      <span>Calendar (Lịch học)</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="px-4 py-2 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 transition"
                    >
                      <Folder className="w-4 h-4 text-amber-600" />
                      <span>Private files (Tài liệu cá nhân)</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="px-4 py-2 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 transition"
                    >
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span>Reports (Báo cáo)</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="px-4 py-2 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 transition"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Preferences (Cài đặt)</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1 pt-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center space-x-2 transition font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log out (Đăng xuất)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

      {/* MODAL BẮT BUỘC ĐỔI MẬT KHẨU LẦN ĐẦU CHO HỌC SINH */}
      <ForcePasswordChangeModal
        isOpen={isForcePasswordChangeOpen}
        user={profile || { full_name: displayName, username: user?.email }}
        onPasswordChanged={() => setIsForcePasswordChangeOpen(false)}
      />
    </nav>
  );
}
