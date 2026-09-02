import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, CheckCircle } from 'lucide-react';

export default function ForcePasswordChangeModal({ isOpen, user, onPasswordChanged }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (newPassword === '123456') {
      setErrorMsg('Mật khẩu mới không được trùng với mật khẩu mặc định 123456!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không khớp!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      // Lưu thông tin đổi mật khẩu thành công vào LocalStorage
      const changedUsers = JSON.parse(localStorage.getItem('lms_changed_passwords_v2') || '{}');
      changedUsers[user.id || user.username] = true;
      localStorage.setItem('lms_changed_passwords_v2', JSON.stringify(changedUsers));

      alert('🎉 ĐÃ ĐỔI MẬT KHẨU THÀNH CÔNG! Chúc em học tập tốt cùng LMS Tiếng Anh!');
      setIsSubmitting(false);
      if (onPasswordChanged) onPasswordChanged(newPassword);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in font-sans select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-amber-200 shadow-2xl space-y-5 animate-scale-up">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase">
            🔒 YÊU CẦU ĐỔI MẬT KHẨU LẦN ĐẦU
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Để bảo mật tài khoản cá nhân và tránh bị lộ thông tin, <strong className="text-emerald-700 font-extrabold">Thầy Nguyễn Văn Hải</strong> yêu cầu học sinh <strong className="text-blue-700 font-bold">{user.full_name || user.username}</strong> tạo Mật Khẩu Mới trước khi vào làm bài nhé!
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              🔑 Mật khẩu mới của em: *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs bg-slate-50 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              🔐 Xác nhận lại mật khẩu mới: *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs bg-slate-50 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang cập nhật...' : '🚀 XÁC NHẬN ĐỔI MẬT KHẨU & VÀO HỌC'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
