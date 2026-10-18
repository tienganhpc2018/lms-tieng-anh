import React, { useState } from 'react';
import { Users, BookOpen, FileCheck, Clock, Send, Bell, TrendingUp, Award, CheckCircle2 } from 'lucide-react';
import { DEFAULT_CLASSES } from '../examStorage';

export default function OverviewTab({ exams = [], submissions = [], onOpenAuthoring, onOpenGrading }) {
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState('ALL');
  const [announcements, setAnnouncements] = useState(() => {
    return [
      {
        id: 'ann-1',
        title: 'Nhắc nhở ôn tập Kiểm tra Giữa kì I',
        content: 'Các em học sinh lớp 8A1, 8A2, 8A3, 8A4 chuẩn bị làm bài kiểm tra 45 phút trên hệ thống. Chú ý phần nghe cần đeo tai nghe để đạt kết quả tốt nhất.',
        target: 'Tất cả các lớp (8A1 - 8A4)',
        author: 'Thầy Nguyễn Văn Hải',
        date: 'Hôm nay, 08:30'
      },
      {
        id: 'ann-2',
        title: 'Hoàn thành bài tập từ vựng Unit 1 & Unit 2',
        content: 'Hạn chót nộp bài tập tự luận là 22:00 tối mai. Những bạn chưa nộp sẽ bị trừ điểm chuyên cần.',
        target: 'Lớp 8A1, 8A2',
        author: 'Thầy Nguyễn Văn Hải',
        date: 'Hôm qua, 15:45'
      }
    ];
  });
  const [showAnnSuccess, setShowAnnSuccess] = useState(false);

  const totalStudents = DEFAULT_CLASSES.reduce((acc, c) => acc + c.studentCount, 0);
  const totalAssignedExams = exams.filter((e) => e.status === 'published').length;
  const pendingGradingCount = submissions.filter((s) => s.status === 'pending_grading').length;

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;

    const newAnn = {
      id: `ann-${Date.now()}`,
      title: announcementTitle.trim(),
      content: announcementContent.trim(),
      target: announcementTarget === 'ALL' ? 'Tất cả các lớp (8A1 - 8A4)' : `Lớp ${announcementTarget}`,
      author: 'Thầy Nguyễn Văn Hải',
      date: 'Vừa xong'
    };

    setAnnouncements([newAnn, ...announcements]);
    setAnnouncementTitle('');
    setAnnouncementContent('');
    setShowAnnSuccess(true);
    setTimeout(() => setShowAnnSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 4 Cards Thống kê KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Số lớp */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
            🏫
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{DEFAULT_CLASSES.length}</div>
            <div className="text-xs font-semibold text-slate-500">Lớp học quản lý</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-0.5">8A1, 8A2, 8A3, 8A4</div>
          </div>
        </div>

        {/* KPI 2: Tổng học sinh */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-xl font-bold">
            👨‍🎓
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{totalStudents}</div>
            <div className="text-xs font-semibold text-slate-500">Tổng số học sinh</div>
            <div className="text-[11px] text-teal-600 font-bold mt-0.5">100% tài khoản đã kích hoạt</div>
          </div>
        </div>

        {/* KPI 3: Đề thi đã giao */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-emerald-300 transition" onClick={onOpenAuthoring}>
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold">
            📝
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{exams.length}</div>
            <div className="text-xs font-semibold text-slate-500">Đề thi trong kho</div>
            <div className="text-[11px] text-indigo-600 font-bold mt-0.5">
              {totalAssignedExams} đề đang mở cho HS
            </div>
          </div>
        </div>

        {/* KPI 4: Chờ chấm */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-amber-300 transition" onClick={onOpenGrading}>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold">
            ⏳
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">{pendingGradingCount}</div>
            <div className="text-xs font-semibold text-slate-500">Bài tự luận chờ chấm</div>
            <div className="text-[11px] text-amber-600 font-bold mt-0.5">Cần duyệt & cho điểm</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Đăng thông báo & Dòng thời gian hoạt động */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Đăng Thông Báo Mới (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center space-x-2 text-slate-800 font-black text-base pb-3 border-b border-slate-100 mb-4">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">
              📢
            </span>
            <span>Đăng thông báo mới cho học sinh</span>
          </div>

          {showAnnSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã phát thông báo thành công đến học sinh!</span>
            </div>
          )}

          <form onSubmit={handlePostAnnouncement} className="space-y-3.5 flex-1 flex flex-col">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Gửi tới đối tượng:</label>
              <select
                value={announcementTarget}
                onChange={(e) => setAnnouncementTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="ALL">Tất cả các lớp (8A1, 8A2, 8A3, 8A4)</option>
                <option value="8A1">Chỉ Lớp 8A1</option>
                <option value="8A2">Chỉ Lớp 8A2</option>
                <option value="8A3">Chỉ Lớp 8A3</option>
                <option value="8A4">Chỉ Lớp 8A4</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tiêu đề thông báo:</label>
              <input
                type="text"
                placeholder="VD: Nhắc nhở hạn nộp bài kiểm tra 45 phút..."
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold text-slate-600 mb-1">Nội dung chi tiết:</label>
              <textarea
                rows={4}
                placeholder="Nhập nội dung lời dặn của thầy tới các em học sinh..."
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                required
                className="w-full flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi thông báo ngay</span>
            </button>
          </form>
        </div>

        {/* Bảng Tin & Dòng Thời Gian Hoạt Động (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Danh sách thông báo đã đăng */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-black text-slate-800 text-sm flex items-center space-x-2 pb-3 border-b border-slate-100 mb-3">
              <Bell className="w-4 h-4 text-emerald-600" />
              <span>Thông báo gần đây trên bảng tin</span>
            </h3>
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-slate-800 text-xs">{ann.title}</span>
                    <span className="text-[10px] text-slate-400">{ann.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">{ann.content}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-emerald-700">{ann.author}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      {ann.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dòng thời gian học sinh nộp bài */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-black text-slate-800 text-sm flex items-center space-x-2 pb-3 border-b border-slate-100 mb-3">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Dòng thời gian học sinh nộp bài & giáo viên chấm điểm</span>
            </h3>

            <div className="space-y-3">
              {submissions.length > 0 ? (
                submissions.slice(0, 4).map((sub) => (
                  <div key={sub.id} className="flex items-start space-x-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">
                      {sub.studentName?.charAt(0) || 'H'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{sub.studentName} ({sub.className})</span>
                        <span className="text-[10px] text-slate-400">{new Date(sub.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-slate-600 text-[11px] mt-0.5">
                        Đã nộp bài: <b className="text-slate-700">{sub.examTitle}</b>
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          Trắc nghiệm: {sub.mcqScore}đ
                        </span>
                        {sub.status === 'pending_grading' ? (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px]">
                            Tự luận: Đang chờ GV chấm
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                            Tổng: {sub.finalScore}đ (Đã duyệt)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Chưa có hoạt động nộp bài nào gần đây.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
