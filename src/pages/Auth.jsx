import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ShieldCheck, GraduationCap, Lock, Mail, User } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email.trim(), password.trim(), fullName.trim(), role);
      } else {
        await signIn(email.trim(), password.trim());
      }
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Lỗi Auth:', err);
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('User already registered')) {
        setErrorMsg('Tài khoản Email này đã được đăng ký! Vui lòng chọn tab "Đăng Nhập" bên trên để vào hệ thống.');
      } else if (msg.includes('Invalid login credentials')) {
        setErrorMsg('Email hoặc Mật khẩu không chính xác. Vui lòng thử lại!');
      } else if (msg.includes('Password should be at least')) {
        setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự!');
      } else {
        setErrorMsg('Không thể đăng ký: ' + msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        {/* Banner Logo Header */}
        <div className="bg-navy-900 text-white p-8 text-center relative">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">LMS HỌC LIỆU</h1>
          <p className="text-xs text-slate-300 mt-1">
            Nền tảng Quản lý Học tập & Bài giảng E-learning chuẩn SCORM / H5P
          </p>
        </div>

        {/* Tab Đăng Nhập / Đăng Ký */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-3.5 text-sm font-bold transition ${
              !isSignUp ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white' : 'text-slate-500 bg-slate-50'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-3.5 text-sm font-bold transition ${
              isSignUp ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white' : 'text-slate-500 bg-slate-50'
            }`}
          >
            Đăng Ký Tài Khoản
          </button>
        </div>

        {/* Form Đăng Nhập / Đăng Ký */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold leading-relaxed">
              {errorMsg}
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Họ và Tên</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyen Van Hai"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nguyensea106@gmail.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Chọn vai trò khi đăng ký */}
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Vai trò người dùng</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition ${
                    role === 'student'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Học Sinh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition ${
                    role === 'teacher'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Giáo Viên</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Đang xử lý...' : isSignUp ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
