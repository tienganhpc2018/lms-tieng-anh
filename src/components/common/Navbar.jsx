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
    <nav className="bg-emerald-50/95 backdrop-blur-md text-slate-800 sticky top-0 z-40 shadow-xs border-b border-emerald-200/90 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:bg-emerald-500 transition">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-emerald-950 block leading-tight">
                LMS TIẾNG ANH
              </span>
              <span className="text-[10px] font-extrabold text-emerald-700 block tracking-wider uppercase">
                SMART E-LEARNING PLATFORM
              </span>
            </div>
          </Link>

          {/* NÚT TRUY CẬP NHANH SỔ NỀ NẾP 4.0 & CỬA HÀNG QUÀ TRÊN THANH ĐIỀU HƯỚNG (CHỈ DÀNH CHO GIÁO VIÊN) */}
          {user && isTeacher && location.pathname !== '/auth' && (
            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/behavior"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 shadow-2xs border ${
                  location.pathname === '/behavior'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white/90 hover:bg-emerald-100 text-emerald-950 border-emerald-300/80'
                }`}
              >
                <span>🛡️</span>
                <span>Sổ Nề Nếp 4.0</span>
              </Link>

              <Link
                to="/gift-shop"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 shadow-2xs border ${
                  location.pathname === '/gift-shop'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white/90 hover:bg-emerald-100 text-emerald-950 border-emerald-300/80'
                }`}
              >
                <span>🎁</span>
                <span>Cửa Hàng Quà 4.0</span>
              </Link>

              <Link
                to="/film-reel"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 shadow-2xs border ${
                  location.pathname === '/film-reel'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white/90 hover:bg-emerald-100 text-emerald-950 border-emerald-300/80'
                }`}
              >
                <span>🎞️</span>
                <span>Cuộn Phim Kỷ Niệm</span>
              </Link>

              <Link
                to="/assessment"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 shadow-2xs border ${
                  location.pathname === '/assessment'
                    ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                    : 'bg-white/90 hover:bg-teal-50 text-teal-950 border-teal-300/80'
                }`}
              >
                <span>📊</span>
                <span>Sổ Điểm TT22</span>
              </Link>
            </div>
          )}

          {/* USER INFO DROPDOWN CHUẨN MOODLE GNOMIO (GÓC PHẢI NAV BAR) - ẨN HOÀN TOÀN KHI Ở TRANG AUTH */}
          <div className="flex items-center space-x-3" ref={dropdownRef}>
            {user && location.pathname !== '/auth' ? (
              <div className="flex items-center space-x-2">
                {/* CÁC NÚT NHANH MOBILE CHỈ DÀNH CHO GIÁO VIÊN */}
                {isTeacher && (
                  <>
                    <Link
                      to="/behavior"
                      className="md:hidden p-2 rounded-xl bg-white/90 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-2xs"
                      title="Sổ Nề Nếp 4.0"
                    >
                      🛡️
                    </Link>

                    <Link
                      to="/gift-shop"
                      className="md:hidden p-2 rounded-xl bg-white/90 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-2xs"
                      title="Cửa Hàng Đổi Quà 4.0"
                    >
                      🎁
                    </Link>

                    <Link
                      to="/film-reel"
                      className="md:hidden p-2 rounded-xl bg-white/90 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-2xs"
                      title="Cuộn Phim Kỷ Niệm"
                    >
                      🎞️
                    </Link>

                    <Link
                      to="/assessment"
                      className="md:hidden p-2 rounded-xl bg-white/90 border border-teal-300 text-teal-900 text-xs font-bold shadow-2xs"
                      title="Sổ Điểm TT22"
                    >
                      📊
                    </Link>
                  </>
                )}

                {/* 🔔 QUẢ CHUÔNG THÔNG BÁO THẬT NHẢY CHẤM ĐỎ DÀNH CHO HỌC SINH */}
                <NotificationBell />

                <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 bg-white hover:bg-emerald-100/70 px-3 py-1.5 rounded-2xl border border-emerald-300/80 text-emerald-950 shadow-2xs transition cursor-pointer group"
                >
                  <img
                    src={avatarImage}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500 shadow-2xs"
                  />
                  <span className="text-xs font-black text-emerald-950 group-hover:text-emerald-700 transition">
                    {displayName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-emerald-700 transition transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
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

                    {/* CÁC CHỨC NĂNG QUẢN LÝ CHỈ DÀNH CHO GIÁO VIÊN */}
                    {isTeacher && (
                      <>
                        <Link
                          to="/behavior"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="px-4 py-2 hover:bg-purple-50 hover:text-purple-800 flex items-center space-x-2 transition"
                        >
                          <span className="text-sm">🛡️</span>
                          <span className="text-purple-700 font-extrabold">Sổ Nề Nếp 4.0</span>
                        </Link>

                        <Link
                          to="/gift-shop"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="px-4 py-2 hover:bg-amber-50 hover:text-amber-800 flex items-center space-x-2 transition"
                        >
                          <span className="text-sm">🎁</span>
                          <span className="text-amber-700 font-extrabold">Cửa Hàng Quà 4.0</span>
                        </Link>

                        <Link
                          to="/film-reel"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="px-4 py-2 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 transition"
                        >
                          <span className="text-sm">🎞️</span>
                          <span className="text-emerald-700 font-extrabold">Cuộn Phim Kỷ Niệm</span>
                        </Link>

                        <Link
                          to="/assessment"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="px-4 py-2 hover:bg-teal-50 hover:text-teal-800 flex items-center space-x-2 transition"
                        >
                          <span className="text-sm">📊</span>
                          <span className="text-teal-700 font-extrabold">Sổ Điểm TT22</span>
                        </Link>

                        <Link
                          to="/analytics"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="px-4 py-2 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 transition"
                        >
                          <Award className="w-4 h-4 text-purple-600" />
                          <span>Grades (Bảng điểm)</span>
                        </Link>
                      </>
                    )}

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
