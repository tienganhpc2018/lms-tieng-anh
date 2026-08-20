import React, { useState } from 'react';
import { Clock, ShieldAlert, Calendar, Key, CheckCircle, X, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AssignModal({ isOpen, onClose, activity }) {
  if (!isOpen || !activity) return null;

  const [timeLimit, setTimeLimit] = useState(45);
  const [maxTabSwitches, setMaxTabSwitches] = useState(3);
  const [openTime, setOpenTime] = useState(new Date().toISOString().slice(0, 16));
  const [deadline, setDeadline] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16));
  const [passcode, setPasscode] = useState('');
  const [isRandomized, setIsRandomized] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Cập nhật thông tin cài đặt bài thi vào activity
      const { data: existingAct } = await supabase
        .from('activities')
        .select('content')
        .eq('id', activity.id)
        .maybeSingle();

      const prevContent = existingAct?.content || {};
      const updatedContent = {
        ...prevContent,
        timeLimit: Number(timeLimit),
        maxTabSwitches: Number(maxTabSwitches),
        openTime: openTime,
        deadline: deadline,
        passcode: passcode.trim(),
        isRandomized: isRandomized,
        isAssigned: true,
      };

      const { error } = await supabase
        .from('activities')
        .update({ content: updatedContent })
        .eq('id', activity.id);

      if (error) {
        alert('Lỗi lưu cài đặt bài thi: ' + error.message);
      } else {
        const actTitleClean = activity.title?.replace('[WHITEBOARD]', '').trim();

        // 2. TỰ ĐỘNG ĐĂNG BÀI VIẾT THÔNG BÁO GIAO ĐỀ OUT TRANG CHỦ (BẢNG TIN CLASS FEED)
        try {
          await supabase.from('class_feed').insert({
            course_id: 'general_announcement',
            author_name: 'Giáo viên Nguyễn Văn Hải',
            author_role: 'teacher',
            content: `📢 DẶN DÒ BÀI THI MỚI: Thầy đã giao đề thi thử "${actTitleClean}"!\n⏱️ Thời gian làm bài: ${timeLimit} phút.\n📅 Thời gian mở thi: ${openTime}.\n⏰ Hạn chót nộp bài: ${deadline}.\n👉 Các em nhấp chọn Ngân hàng đề thi hoặc mở link bài học để bắt đầu làm bài nhé!`,
            is_pinned: true,
          });
        } catch (errFeed) {}

        // 3. TỰ ĐỘNG ĐẨY THÔNG BÁO QUẢ CHUÔNG NHẢY CHẤM ĐỎ DÀNH CHO HỌC SINH
        try {
          const { data: students } = await supabase.from('profiles').select('id').eq('role', 'student');
          if (students && students.length > 0) {
            const notifPayloads = students.map((st) => ({
              user_id: st.id,
              title: `📢 ĐỀ THI MỚI: ${actTitleClean}`,
              message: `Thầy Hải đã giao đề thi thử mới. Thời gian làm bài: ${timeLimit} phút. Hạn nộp: ${deadline}`,
              read: false,
              link: `/assignment/${activity.id}`,
            }));
            await supabase.from('notifications').insert(notifPayloads);
          }
        } catch (errNotif) {}

        alert(`🎉 GIAO BÀI VÀ THÔNG BÁO THÀNH CÔNG!\n\nĐã đăng thông báo dặn dò ra Bảng tin trang chủ và đẩy chấm đỏ Quả chuông tới 100% tài khoản Học Sinh!\n\nĐề thi: "${actTitleClean}"\n⏱️ Thời gian: ${timeLimit} phút\n📅 Mở bài: ${openTime}\n⏰ Hạn chót: ${deadline}`);
        onClose();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans select-none animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-scale-up">
        {/* HEADER MODAL */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-6 py-4 flex justify-between items-center font-extrabold">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-slate-950" />
            <h3 className="text-base uppercase tracking-tight">
              🚀 GIAO BÀI & CÀI ĐẶT LỊCH THI THỬ
            </h3>
          </div>
          <button onClick={onClose} className="hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveSettings} className="p-6 space-y-4 text-xs font-semibold">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <span className="font-extrabold text-amber-950 block">Đề thi đang cài đặt:</span>
            <h4 className="text-sm font-black text-slate-900 mt-0.5">
              {activity.title?.replace('[WHITEBOARD]', '').trim()}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. THỜI GIAN LÀM BÀI */}
            <div>
              <label className="block font-extrabold text-slate-800 uppercase mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>⏱️ Số phút làm bài:</span>
              </label>
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50 text-slate-900"
              >
                <option value={15}>15 Phút (Bài kiểm tra nhanh)</option>
                <option value={45}>45 Phút (Bài thi 1 tiết)</option>
                <option value={60}>60 Phút</option>
                <option value={90}>90 Phút (Thi Học Kỳ I / THPT)</option>
                <option value={0}>Không giới hạn thời gian</option>
              </select>
            </div>

            {/* 2. CHỐNG GIAN LẬN */}
            <div>
              <label className="block font-extrabold text-slate-800 uppercase mb-1 flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>🛡️ Giới hạn rời tab:</span>
              </label>
              <select
                value={maxTabSwitches}
                onChange={(e) => setMaxTabSwitches(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50 text-slate-900"
              >
                <option value={1}>🚫 Tối đa 1 lần (Nghiêm ngặt)</option>
                <option value={3}>⚠️ Tối đa 3 lần (Tiêu chuẩn)</option>
                <option value={5}>💬 Tối đa 5 lần</option>
                <option value={99}>Không giới hạn</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* 3. NGÀY GIAO MỞ ĐỀ THI */}
            <div>
              <label className="block font-extrabold text-slate-800 uppercase mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>📅 Ngày giờ mở bài thi:</span>
              </label>
              <input
                type="datetime-local"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50 text-slate-900"
              />
            </div>

            {/* 4. HẠN CHÓT NỘP BÀI */}
            <div>
              <label className="block font-extrabold text-slate-800 uppercase mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                <span>⏰ Hạn chót nộp bài:</span>
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50 text-slate-900"
              />
            </div>
          </div>

          {/* 5. MẬT KHẨU VÀO THI & TRỘN ĐỀ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-extrabold text-slate-800 uppercase mb-1 flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>🔑 Mật khẩu bài thi (Nếu có):</span>
              </label>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="VD: LOP9A1..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-800 uppercase mb-1">
                🔀 Tự động trộn ngẫu nhiên:
              </label>
              <button
                type="button"
                onClick={() => setIsRandomized(!isRandomized)}
                className={`w-full py-2 px-3 rounded-xl font-extrabold border transition ${
                  isRandomized ? 'bg-purple-600 text-white border-transparent' : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {isRandomized ? '🔀 Đã bật trộn ngẫu nhiên' : 'Tắt trộn đề'}
              </button>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{saving ? 'Đang Lưu...' : '🚀 LƯU & GIAO BÀI NGAY'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
