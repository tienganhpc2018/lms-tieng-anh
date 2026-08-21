import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, ShieldCheck, GraduationCap, Lock, Mail, User, Key, LockKeyhole } from 'lucide-react';

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

    const inputVal = emailOrUsername.trim();
    const passVal = password.trim();

    try {
      if (isSignUp) {
        let regEmail = inputVal;
        if (!regEmail.includes('@')) {
          regEmail = `${regEmail.toLowerCase()}@lms.edu.vn`;
        }
        await signUp(regEmail, passVal, fullName.trim(), 'student');
        alert('🎉 ĐĂNG KÝ TÀI KHOẢN HỌC SINH THÀNH CÔNG!\n\nTài khoản của em đã được khởi tạo. Vui lòng nhắn Thầy Nguyễn Văn Hải phê duyệt để bắt đầu vào làm bài nhé!');
        setIsSignUp(false);
        return;
      } else {
        let targetEmail = inputVal;
        let matchedStudentProfile = null;

        // 1. TRA CỨU TÀI KHOẢN TRONG BẢNG PROFILES BẰNG USERNAME HOẶC EMAIL
        try {
          let query = supabase.from('profiles').select('*');
          if (inputVal.includes('@')) {
            query = query.eq('email', inputVal);
          } else {
            query = query.eq('username', inputVal.toLowerCase());
          }

          const { data: profData } = await query;
          if (profData && profData.length > 0) {
            matchedStudentProfile = profData[0];
            targetEmail = matchedStudentProfile.email || `${matchedStudentProfile.username}@lms.edu.vn`;
          } else if (!inputVal.includes('@')) {
            targetEmail = `${inputVal.toLowerCase()}@lms.edu.vn`;
          }
        } catch (lookupErr) {
          if (!inputVal.includes('@')) {
            targetEmail = `${inputVal.toLowerCase()}@lms.edu.vn`;
          }
        }

        // KIỂM TRA NẾU TÀI KHOẢN ĐANG BỊ KHÓA TẠM THỜI (SUSPENDED)
        if (matchedStudentProfile && matchedStudentProfile.suspended) {
          throw new Error('⛔ Tài khoản của bạn đang bị Giáo viên KHÓA TẠM THỜI. Vui lòng liên hệ Thầy cô để được mở lại!');
        }

        // 2. THỬ ĐĂNG NHẬP QUA SUPABASE AUTH
        try {
          await signIn(targetEmail, passVal);
        } catch (signInErr) {
          const errText = signInErr.message || '';
          if (errText.includes('KHÓA TẠM THỜI')) throw signInErr;

          if (matchedStudentProfile || errText.includes('Invalid login credentials')) {
            const studentName = matchedStudentProfile?.full_name || inputVal;
            const studentRole = matchedStudentProfile?.role || 'student';

            try {
              await signUp(targetEmail, passVal, studentName, studentRole);
              await signIn(targetEmail, passVal);
            } catch (autoSyncErr) {
              if (matchedStudentProfile && matchedStudentProfile.raw_password_hint === passVal) {
                await signIn(targetEmail, passVal);
              } else {
                throw signInErr;
              }
            }
          } else {
            throw signInErr;
          }
        }
      }

      navigate(from, { replace: true });
    } catch (err) {
      console.error('Lỗi Auth:', err);
      const msg = err.message || '';
      if (msg.includes('KHÓA TẠM THỜI')) {
        setErrorMsg(msg);
      } else if (msg.includes('already registered') || msg.includes('User already registered')) {
        setErrorMsg('Tài khoản này đã được đăng ký! Vui lòng kiểm tra lại mật khẩu hoặc chọn tab "Đăng Nhập".');
      } else if (msg.includes('Invalid login credentials')) {
        setErrorMsg('Tên đăng nhập / Email hoặc Mật khẩu không chính xác. Vui lòng kiểm tra lại!');
      } else if (msg.includes('Password should be at least')) {
        setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự!');
      } else {
        setErrorMsg('Lỗi đăng nhập: ' + msg);
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
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-extrabold leading-relaxed flex items-center space-x-2">
              <LockKeyhole className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
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
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1 uppercase">
              {isSignUp ? 'Tên đăng nhập hoặc Email' : 'TÊN ĐĂNG NHẬP (USERNAME) / EMAIL'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder={isSignUp ? 'VD: nhondt hay nhondt@gmail.com' : 'Gõ Username (VD: hoangnm) hoặc Email...'}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1 uppercase">
              MẬT KHẨU
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
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-extrabold text-emerald-900 leading-relaxed flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>🎓 Vai trò tài khoản: <b>Học Sinh</b> (Quyền Giáo viên / Admin thuộc sở hữu độc quyền của Thầy Nguyễn Văn Hải).</span>
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
