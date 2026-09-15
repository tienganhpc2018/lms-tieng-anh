import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Bell, Pin, ArrowRight, UserCheck, CheckCircle2, Award } from 'lucide-react';

export default function ClassForumBox() {
  const navigate = useNavigate();
  const [selectedNotice, setSelectedNotice] = useState(null);

  // 3 NỘI DUNG THÔNG BÁO MẪU CHUẨN ĐÚNG THEO YÊU CẦU CỦA THẦY
  const FORUM_POSTS = [
    {
      id: 'post_1',
      type: 'announcement',
      badge: '🔴 Quan Trọng',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      title: '[THÔNG BÁO] Lịch kiểm tra giữa học kỳ I môn Tiếng Anh 7, 8, 9',
      author: 'Thầy Nguyễn Văn Hải',
      date: '14/09/2026',
      content:
        'Các em học sinh lưu ý lịch kiểm tra giữa kỳ môn Tiếng Anh sẽ diễn ra vào tuần tới. Đề thi bám sát ma trận CV7991 gồm 40 câu hỏi trắc nghiệm và tự luận (Phát âm, Trọng âm, Ngữ pháp Unit 1 - Unit 3, Điền từ và Đọc hiểu). Các em hãy vào mục "Online Test" để luyện đề trước nhé!',
      replies: 16,
      views: 184,
    },
    {
      id: 'post_2',
      type: 'discussion',
      badge: '💬 Thảo Luận Sôi Nổi',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      title: '[THẢO LUẬN] Bí quyết luyện phát âm chuẩn IPA và Shadowing tại nhà',
      author: 'CLB Tiếng Anh THCS',
      date: '11/09/2026',
      content:
        'Làm thế nào để nói tiếng Anh tự tin và ngữ điệu tự nhiên như người bản xứ? Thầy chia sẻ phương pháp Shadowing (nhại giọng theo video bài giảng tương tác). Các em hãy cùng chia sẻ trải nghiệm và để lại câu hỏi để Thầy cùng giải đáp nhé!',
      replies: 28,
      views: 245,
    },
    {
      id: 'post_3',
      type: 'reward',
      badge: '⭐ Thi Đua 4.0',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      title: '[VINH DANH] Bảng vàng thi đua tuần 2 & Mở đợt đổi quà Cửa Hàng 4.0',
      author: 'Hệ Thống Nề Nếp & Khen Thưởng',
      date: '07/09/2026',
      content:
        'Chúc mừng 5 bạn học sinh có điểm cộng thi đua cao nhất tuần qua! Hệ thống đã tự động cộng xu thưởng vào ví cá nhân. Cửa Hàng Quà Tặng 4.0 hiện đã cập nhật thêm nhiều phần quà mới (Voucher miễn 1 lần BTVN, Bút highlight pastel, Vòng quay may mắn...). Các em hãy tích cực thi đua!',
      replies: 34,
      views: 312,
    },
  ];

  return (
    <div className="space-y-6">
      {/* TIÊU ĐỀ BOX 5 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
              Forum & Thông Báo Lớp Học
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Diễn đàn trao đổi học tập, giải đáp bài tập và bảng tin thông báo từ Giáo viên
            </p>
          </div>
        </div>

        <Link
          to="/community"
          className="text-xs font-extrabold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-300 transition flex items-center space-x-1"
        >
          <span>Mở Diễn Đàn Trao Đổi ➔</span>
        </Link>
      </div>

      {/* KHUNG CHỨA 3 NỘI DUNG THÔNG BÁO MẪU */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FORUM_POSTS.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedNotice(post)}
            className="bg-white rounded-3xl border-2 border-slate-200 hover:border-emerald-500 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${post.badgeColor}`}>
                  {post.badge}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {post.date}
                </span>
              </div>

              <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-700 transition line-clamp-2">
                {post.title}
              </h4>

              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal line-clamp-3">
                {post.content}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
              <span className="text-emerald-700 font-extrabold truncate max-w-[140px]">
                ✍️ {post.author}
              </span>
              <span className="text-slate-400 hover:text-blue-600 flex items-center space-x-1">
                <span>Xem chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL XEM CHI TIẾT THÔNG BÁO */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${selectedNotice.badgeColor}`}>
                {selectedNotice.badge}
              </span>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 select-text">
              <h4 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {selectedNotice.title}
              </h4>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                <span>Người đăng: <strong className="text-slate-800">{selectedNotice.author}</strong></span>
                <span>•</span>
                <span>Ngày: {selectedNotice.date}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed pt-2">
                {selectedNotice.content}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedNotice(null);
                  navigate('/community');
                }}
                className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-extrabold rounded-xl text-xs transition cursor-pointer"
              >
                Vào thảo luận cộng đồng ➔
              </button>

              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
