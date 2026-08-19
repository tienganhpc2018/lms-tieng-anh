import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, ShieldCheck, GraduationCap, Lock, Mail, User, Key } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
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

    let targetEmail = emailOrUsername.trim();

    try {
      if (isSignUp) {
        if (!targetEmail.includes('@')) {
          targetEmail = `${targetEmail.toLowerCase()}@lms.edu.vn`;
        }
        await signUp(targetEmail, password.trim(), fullName.trim(), role);
      } else {
        // NẾU LÀ ĐĂNG NHẬP BẰNG USERNAME
        if (!targetEmail.includes('@')) {
          // Tra cứu Username trong DB profiles
          try {
            const { data } = await supabase
              .from('profiles')
              .select('email')
              .eq('username', targetEmail.toLowerCase())
              .single();

            if (data && data.email) {
              targetEmail = data.email;
            } else {
              targetEmail = `${targetEmail.toLowerCase()}@lms.edu.vn`;
            }
          } catch (lookupErr) {
            targetEmail = `${targetEmail.toLowerCase()}@lms.edu.vn`;
          }
        }

        await signIn(targetEmail, password.trim());
      }
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Lỗi Auth:', err);
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('User already registered')) {
        setErrorMsg('Tài khoản này đã được đăng ký! Vui lòng chọn tab "Đăng Nhập" bên trên.');
      } else if (msg.includes('Invalid login credentials')) {
        setErrorMsg('Tên đăng nhập / Email hoặc Mật khẩu không chính xác. Vui lòng kiểm tra lại!');
      } else if (msg.includes('Password should be at least')) {
        setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự!');
      } else {
        setErrorMsg('Không thể đăng nhập: ' + msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        {/* Banner Logo Header */}
        <div className="bg-navy-900 text-white p-8 text-center relative">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">LMS TIẾNG ANH</h1>
          <p className="text-xs text-slate-300 mt-1">
            Nền tảng Quản lý Học tập & Bài giảng E-learning chuẩn Gnomio / Moodle
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
            Đăng Nhập (Username / Email)
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và Tên Học sinh / Giáo viên
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn Hải"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1 uppercase">
              {isSignUp ? 'Tên đăng nhập hoặc Email' : 'Tên Đăng Nhập (Username) / Email'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder={isSignUp ? 'VD: nhondt hay nhondt@gmail.com' : 'Gõ Username (VD: nhondt) hoặc Email...'}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1 uppercase">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu của bạn..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bạn là:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    role === 'student'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Học Sinh</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    role === 'teacher'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Giáo Viên (Admin)</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition"
          >
            {loading ? 'Đang xử lý...' : isSignUp ? 'Tạo Tài Khoản Mới' : 'Đăng Nhập Vào Hệ Thống'}
          </button>
        </form>
      </div>
    </div>
  );
}
