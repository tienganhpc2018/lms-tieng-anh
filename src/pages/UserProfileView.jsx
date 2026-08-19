import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, uploadLMSFile } from '../lib/supabase';
import { User, Mail, Globe, Clock, Edit3, BookOpen, BarChart2, ShieldCheck, GraduationCap, Upload, Check, Lock, Eye, EyeOff, Save, ArrowLeft, Camera, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function UserProfileView() {
  const { user: currentUser, profile: currentProfile, isTeacher } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  const targetUserId = userId || currentUser?.id;
  const [profileData, setProfileData] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // State Form Edit Profile chuẩn Moodle Gnomio (Ảnh 4 & 5)
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSuspended, setIsSuspended] = useState(false);
  const [country, setCountry] = useState('Viet Nam');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const { data: pData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (pData) {
        setProfileData(pData);
        setUsername(pData.username || pData.email?.split('@')[0] || '');
        setEmail(pData.email || '');
        setAvatarUrl(pData.avatar_url || '');
        setIsSuspended(!!pData.suspended);
        setNewPassword(pData.raw_password_hint || '123456');

        const parts = (pData.full_name || '').split(' ');
        if (parts.length > 1) {
          setFirstName(parts[parts.length - 1]);
          setLastName(parts.slice(0, parts.length - 1).join(' '));
        } else {
          setFirstName(pData.full_name || pData.username || 'User');
          setLastName('');
        }
      }

      // 2. Fetch User Courses
      const { data: eData } = await supabase
        .from('course_enrollments')
        .select('course:course_id (*)')
        .eq('user_id', targetUserId);

      if (eData) {
        setUserCourses(eData.map((item) => item.course).filter(Boolean));
      }
    } catch (err) {
      console.warn('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetUserId) fetchUserProfile();
  }, [targetUserId]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadLMSFile(file, 'avatars');
      setAvatarUrl(url);
      alert('📸 Đã nạp ảnh đại diện avatar mới thành công!');
    } catch (err) {
      alert('Lỗi upload avatar: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fullName = `${lastName.trim()} ${firstName.trim()}`.trim() || username;

    try {
      const updatePayload = {
        full_name: fullName,
        username: username.trim().toLowerCase(),
        email: email.trim(),
        avatar_url: avatarUrl,
        raw_password_hint: newPassword.trim(),
        suspended: isSuspended,
      };

      await supabase.from('profiles').update(updatePayload).eq('id', targetUserId);

      setProfileData((prev) => ({ ...prev, ...updatePayload }));
      alert('🎉 ĐÃ CẬP NHẬT THÔNG TIN CÁ NHÂN CHUẨN MOODLE GNOMIO THÀNH CÔNG!');
      setIsEditing(false);
    } catch (err) {
      alert('Lỗi lưu thông tin: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Đang tải hồ sơ thông tin người học..." />;

  const displayName = profileData?.full_name || profileData?.username || 'Người Học';
  const roleName = profileData?.role === 'teacher' ? 'Giáo Viên (Teacher)' : 'Học Sinh (Student)';
  const isSelf = currentUser?.id === targetUserId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans select-none">
      {/* BREADCRUMB MOODLE NGUYÊN BẢN CHUẨN (ẢNH 3) */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <button onClick={() => navigate('/dashboard')} className="hover:text-emerald-600 flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <span>/</span>
        <span>Users</span>
        <span>/</span>
        <span className="font-extrabold text-slate-800">{displayName}</span>
        <span>/</span>
        <span className="text-emerald-700 font-bold">{isEditing ? 'Edit profile' : 'View profile'}</span>
      </div>

      {/* HEADER USER PROFILE CARD (ẢNH 3) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-5">
          <div className="relative group">
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={displayName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-slate-100 shadow-md"
            />
            {(isSelf || isTeacher) && (
              <label className="absolute bottom-0 right-0 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full cursor-pointer shadow-md transition">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>{displayName}</span>
              {profileData?.role === 'teacher' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              ) : (
                <GraduationCap className="w-5 h-5 text-sky-600" />
              )}
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{roleName}</p>
            <p className="text-xs text-slate-400 font-mono">@{profileData?.username || 'user'} • {profileData?.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {(isSelf || isTeacher) && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Xem Hồ Sơ (View Profile)' : 'Chỉnh Sửa Hồ Sơ (Edit Profile)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* CHẾ ĐỘ XEM HỒ SƠ CHUẨN GNOMIO MOODLE (ẢNH 3) */}
      {!isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CỘT 1: USER DETAILS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 border-b pb-3 flex justify-between items-center">
              <span>User details</span>
              {(isSelf || isTeacher) && (
                <button onClick={() => setIsEditing(true)} className="text-xs text-emerald-600 hover:underline font-bold">
                  Edit profile
                </button>
              )}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Email address</span>
                <span className="font-bold text-slate-900 block">{profileData?.email || 'N/A'}</span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Country</span>
                <span className="font-bold text-slate-900 block">{country}</span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Timezone</span>
                <span className="font-bold text-slate-900 block">{timezone}</span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase">Course details / Course profiles</h4>
              <div className="space-y-1.5">
                {userCourses.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Chưa tham gia khóa học nào.</p>
                ) : (
                  userCourses.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/course/${c.id}`)}
                      className="p-2 bg-slate-50 hover:bg-emerald-50 rounded-xl cursor-pointer transition text-xs font-bold text-slate-800 flex items-center space-x-2"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>{c.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* CỘT 2 & 3: REPORTS BÁO CÁO QUÁ TRÌNH HỌC TẬP (ẢNH 3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 border-b pb-3">
                Reports (Quá Trình Học Tập & Bảng Điểm)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-bold">
                <div onClick={() => navigate('/analytics')} className="p-4 bg-slate-50 hover:bg-emerald-50 rounded-2xl cursor-pointer border border-slate-200 transition space-y-1">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span className="text-slate-900 block">Today's logs</span>
                  <span className="text-[10px] text-slate-400 font-normal">Nhật ký hoạt động hôm nay</span>
                </div>

                <div onClick={() => navigate('/analytics')} className="p-4 bg-slate-50 hover:bg-sky-50 rounded-2xl cursor-pointer border border-slate-200 transition space-y-1">
                  <FileText className="w-5 h-5 text-sky-600" />
                  <span className="text-slate-900 block">All logs</span>
                  <span className="text-[10px] text-slate-400 font-normal">Toàn bộ lịch sử làm bài</span>
                </div>

                <div onClick={() => navigate('/analytics')} className="p-4 bg-slate-50 hover:bg-purple-50 rounded-2xl cursor-pointer border border-slate-200 transition space-y-1">
                  <BarChart2 className="w-5 h-5 text-purple-600" />
                  <span className="text-slate-900 block">Grades overview</span>
                  <span className="text-[10px] text-slate-400 font-normal">Tổng quan điểm số bài thi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CHẾ ĐỘ EDIT PROFILE CHUẨN GNOMIO MOODLE (ẢNH 4 & 5) */
        <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b pb-3 flex justify-between items-center">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
              <Edit3 className="w-5 h-5 text-emerald-600" />
              <span>General - Chỉnh Sửa Thông Tin Cá Nhân</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-500 hover:text-slate-900 font-bold"
            >
              Hủy Bỏ
            </button>
          </div>

          <div className="space-y-4 max-w-3xl">
            {/* Username & Authentication Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                  Username (Tên đăng nhập) *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isTeacher && !isSelf}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                  Choose an authentication method
                </label>
                <input
                  type="text"
                  disabled
                  value="Manual accounts"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500"
                />
              </div>
            </div>

            {/* Suspended Account Checkbox cho Giáo viên (Ảnh 4) */}
            {isTeacher && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="suspendCheck"
                  checked={isSuspended}
                  onChange={(e) => setIsSuspended(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <label htmlFor="suspendCheck" className="text-xs font-extrabold text-rose-900 cursor-pointer">
                  Suspended account (Đánh dấu tích để KHÓA TẠM THỜI tài khoản này)
                </label>
              </div>
            )}

            {/* New Password & Mật khẩu cấp (Ảnh 4) */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                New password (Mật khẩu của người dùng)
              </label>
              <div className="relative max-w-md">
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Gõ mật khẩu mới..."
                  className="w-full p-2.5 pr-10 border border-slate-300 rounded-xl text-xs font-mono font-bold bg-amber-50 text-amber-950"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* First Name & Last Name (Ảnh 4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                  First name (Tên) *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                  Last name (Họ và Tên đệm) *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                Email address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>

            {/* User Picture Upload Section (Ảnh 5) */}
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase">User picture (Ảnh đại diện Avatar)</h4>
              <div className="flex items-center space-x-4">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt="Current avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                />
                <div className="space-y-1">
                  <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-sm transition inline-block">
                    {uploadingAvatar ? 'Đang Nạp Ảnh...' : 'Tải Ảnh Đại Diện Mới (.png, .jpg)'}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                  <p className="text-[11px] text-slate-400">Accepted file types: badges .gif .jpe .jpeg .jpg .png .webp</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang Lưu...' : '🚀 Update profile (Cập Nhật Hồ Sơ)'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
