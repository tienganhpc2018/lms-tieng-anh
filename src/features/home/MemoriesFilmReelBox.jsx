import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Calendar, Eye, Heart, Sparkles, ArrowRight, Camera } from 'lucide-react';

export default function MemoriesFilmReelBox({ userIsTeacher = false }) {
  const navigate = useNavigate();
  const [activeModalPost, setActiveModalPost] = useState(null);

  // 3 BÀI MẪU CUỘN PHIM HỒI ỨC CHUẨN ĐÚNG THEO YÊU CẦU CỦA THẦY
  const FILM_MEMORIES = [
    {
      id: 'mem_1',
      title: 'Giờ học dự án Speaking sôi nổi của lớp 9A',
      date: '12/09/2026',
      classTag: 'Lớp 9A',
      category: 'Thuyết Trình Tiếng Anh',
      coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
      description:
        'Các nhóm học sinh cùng nhau tự tin thuyết trình về chủ đề "Community Services", sử dụng 100% tiếng Anh kèm sơ đồ tư duy tương tác. Không khí thảo luận vô cùng hào hứng và tràn ngập năng lượng tích cực.',
      tags: ['🎤 Thuyết Trình', '⭐ Xuất Sắc', '✨ Tiếng Anh 9'],
      likes: 42,
    },
    {
      id: 'mem_2',
      title: 'Hoạt động đóng kịch Role-play Tiếng Anh lớp 8B',
      date: '08/09/2026',
      classTag: 'Lớp 8B',
      category: 'Sân Khấu Hóa Bài Học',
      coverImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
      description:
        'Buổi thực hành kỹ năng Nói đầy ắp tiếng cười với các vở kịch ngắn về tình huống giao tiếp đời sống. Học sinh vận dụng xuất sắc ngữ điệu bản xứ và biểu cảm tự nhiên trước cả lớp.',
      tags: ['🎭 Kịch Ngắn', '💬 Giao Tiếp', '🌟 Sáng Tạo'],
      likes: 38,
    },
    {
      id: 'mem_3',
      title: 'Lễ trao thưởng vinh danh Ngôi Sao Thi Đua tháng',
      date: '05/09/2026',
      classTag: 'Khối 7-8-9',
      category: 'Vinh Danh & Trao Quà',
      coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      description:
        'Vinh danh những gương mặt học sinh tiêu biểu đạt nhiều điểm cộng nhất trong Sổ nề nếp 4.0 và đổi thưởng những món quà ý nghĩa từ Cửa hàng quà tặng. Chúc mừng các em đã luôn nỗ lực!',
      tags: ['🏆 Vinh Danh', '🎁 Đổi Quà', '🎉 Tự Hào'],
      likes: 56,
    },
  ];

  return (
    <div className="space-y-6">
      {/* TIÊU ĐỀ BOX 3 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
              Cuộn phim hồi ức
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Lưu giữ những khoảnh khắc học tập và kỷ niệm đáng nhớ của các thế hệ học trò
            </p>
          </div>
        </div>

        {userIsTeacher && (
          <Link
            to="/film-reel"
            className="text-xs font-black text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-300 transition flex items-center space-x-1 shadow-2xs"
          >
            <span>Quản lý cuộn phim ➔</span>
          </Link>
        )}
      </div>

      {/* DẢI PHIM NHỰA 3 KHUNG HÌNH (FILM REEL) - NỀN TRONG SUỐT KHỚP MÀU MENU NGANG */}
      <div className="bg-transparent rounded-3xl p-4 sm:p-6 lg:p-7 border-2 border-emerald-200/90 relative overflow-hidden shadow-xs">
        {/* DẢI LỖ RĂNG CƯA PHIM TRÊN CÙNG TÔNG XANH LÁ NHẠT */}
        <div className="flex justify-between items-center space-x-2 overflow-hidden pb-4 opacity-90">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={`sprocket_top_${i}`} className="w-3.5 h-2 bg-emerald-100/90 rounded-xs flex-shrink-0 border border-emerald-300/80 shadow-2xs" />
          ))}
        </div>

        {/* 3 KHUNG HÌNH PHIM CHỨA 3 BÀI MẪU NỀN TRẮNG SÁNG THANH LỊCH */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FILM_MEMORIES.map((post, idx) => (
            <div
              key={post.id}
              onClick={() => setActiveModalPost(post)}
              className="bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 p-4 transition duration-300 group cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl hover:scale-[1.02]"
            >
              {/* KHUNG ẢNH KỶ NIỆM */}
              <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-100 border border-emerald-200/80">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500 filter sepia-[0.10] contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* SỐ FRAME PHIM */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-950/85 backdrop-blur-xs text-emerald-300 font-mono text-[10px] font-bold rounded border border-emerald-400/50">
                  FRAME #{String(idx + 1).padStart(2, '0')}
                </div>

                <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-md shadow-xs">
                  {post.classTag}
                </div>

                <div className="absolute bottom-2 left-2 flex items-center space-x-1.5 text-white text-[11px] font-bold drop-shadow-md">
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  <span>{post.date}</span>
                </div>
              </div>

              {/* NỘI DUNG TÓM TẮT BÀI VIẾT */}
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block mb-1">
                    {post.category}
                  </span>
                  <h4 className="text-slate-900 font-black text-sm sm:text-base leading-snug group-hover:text-emerald-700 transition line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mt-1.5 font-normal">
                    {post.description}
                  </p>
                </div>

                {/* TAGS & LƯỢT THÍCH */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tg, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded text-[10px] font-bold">
                        {tg}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-1 text-rose-500 font-bold text-[11px]">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{post.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DẢI LỖ RĂNG CƯA PHIM DƯỚI CÙNG TÔNG XANH LÁ NHẠT */}
        <div className="flex justify-between items-center space-x-2 overflow-hidden pt-4 opacity-90">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={`sprocket_bottom_${i}`} className="w-3.5 h-2 bg-emerald-100/90 rounded-xs flex-shrink-0 border border-emerald-300/80 shadow-2xs" />
          ))}
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT KHOẢNH KHẮC PHIM */}
      {activeModalPost && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0 text-slate-900">
            <div className="relative aspect-video w-full bg-slate-950">
              <img
                src={activeModalPost.coverImage}
                alt={activeModalPost.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setActiveModalPost(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white font-bold flex items-center justify-center cursor-pointer shadow-lg"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3 bg-slate-950/80 text-white text-xs px-3 py-1 rounded-xl font-bold">
                📅 {activeModalPost.date} • {activeModalPost.classTag}
              </div>
            </div>

            <div className="p-6 space-y-4 select-text">
              <h4 className="text-xl font-black text-slate-900 leading-snug">
                {activeModalPost.title}
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {activeModalPost.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {activeModalPost.tags.map((tg, idx) => (
                  <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-900 font-bold rounded-full text-xs border border-amber-200">
                    {tg}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModalPost(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition cursor-pointer"
                >
                  Đóng (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
