import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Calendar, Heart, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { loadAllFilmReelsAcrossClasses } from '../film-reel/filmReelStorage';
import { loadClasses } from '../behavior/behaviorStorage';

export default function MemoriesFilmReelBox({ userIsTeacher = false }) {
  const navigate = useNavigate();
  const [activeModalPost, setActiveModalPost] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [customReels, setCustomReels] = useState([]);
  const scrollContainerRef = useRef(null);

  // Nạp các bài viết thực tế từ hệ thống Cuộn phim kỷ niệm
  const refreshCustomReels = () => {
    try {
      const classesList = loadClasses() || [];
      const classMap = {};
      classesList.forEach((c) => {
        if (c.id) classMap[c.id] = c.name;
      });

      const reelsFromStorage = loadAllFilmReelsAcrossClasses() || [];
      const formatted = reelsFromStorage.map((r) => {
        const firstParagraph = r.blocks?.find((b) => b.type === 'paragraph' && b.text)?.text || '';
        const cName = classMap[r.classId] || r.classId || 'Lớp học';

        let gradeNum = 'all';
        if (cName.includes('9')) gradeNum = '9';
        else if (cName.includes('8')) gradeNum = '8';
        else if (cName.includes('7')) gradeNum = '7';

        let dateFormatted = r.eventDate || '';
        if (dateFormatted.includes('-')) {
          const parts = dateFormatted.split('-');
          if (parts.length === 3) dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        return {
          id: r.id,
          grade: gradeNum,
          title: r.title,
          date: dateFormatted || 'Mới cập nhật',
          classTag: cName.startsWith('Lớp') ? cName : `Lớp ${cName}`,
          category: r.category || 'Kỷ Niệm',
          coverImage:
            r.coverImage ||
            'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
          description: firstParagraph || 'Khoảnh khắc đáng nhớ và tự hào cùng tập thể lớp.',
          tags: ['✨ ' + (r.category || 'Kỷ Niệm'), '📸 Cuộn Phim', '🌟 Mới Đăng'],
          likes: r.likesCount || 0,
          rawReel: r,
          isCustom: true,
        };
      });

      setCustomReels(formatted);
    } catch (e) {
      console.error('Lỗi nạp cuộn phim hồi ức:', e);
    }
  };

  useEffect(() => {
    refreshCustomReels();

    const handleUpdate = () => refreshCustomReels();
    window.addEventListener('filmReelsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('filmReelsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // DANH SÁCH 7 BÀI MẪU CUỘN PHIM HỒI ỨC CHO CẢ 3 KHỐI LỚP 9, 8, 7
  const FILM_MEMORIES = [
    {
      id: 'mem_1',
      grade: '9',
      title: 'Giờ học dự án Speaking sôi nổi của lớp 9A',
      date: '12/09/2026',
      classTag: 'Lớp 9A',
      category: 'Thuyết Trình Tiếng Anh',
      coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
      description:
        'Các nhóm học sinh cùng nhau tự tin thuyết trình về chủ đề "Community Services", sử dụng 100% tiếng Anh kèm sơ đồ tư duy tương tác. Không khí thảo luận vô cùng hào hứng.',
      tags: ['🎤 Thuyết Trình', '⭐ Xuất Sắc', '✨ Tiếng Anh 9'],
      likes: 42,
    },
    {
      id: 'mem_2',
      grade: '8',
      title: 'Hoạt động đóng kịch Role-play Tiếng Anh lớp 8B',
      date: '08/09/2026',
      classTag: 'Lớp 8B',
      category: 'Sân Khấu Hóa Bài Học',
      coverImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
      description:
        'Buổi thực hành kỹ năng Nói đầy ắp tiếng cười với các vở kịch ngắn về tình huống giao tiếp đời sống. Học sinh vận dụng xuất sắc ngữ điệu bản xứ và biểu cảm tự nhiên.',
      tags: ['🎭 Kịch Ngắn', '💬 Giao Tiếp', '🌟 Sáng Tạo'],
      likes: 38,
    },
    {
      id: 'mem_3',
      grade: '7',
      title: 'Lễ trao thưởng vinh danh Ngôi Sao Thi Đua tháng',
      date: '05/09/2026',
      classTag: 'Khối 7-8-9',
      category: 'Vinh Danh & Trao Quà',
      coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      description:
        'Vinh danh những gương mặt học sinh tiêu biểu đạt nhiều điểm cộng nhất trong Sổ nề nếp 4.0 và đổi thưởng những món quà ý nghĩa từ Cửa hàng quà tặng. Chúc mừng các em!',
      tags: ['🏆 Vinh Danh', '🎁 Đổi Quà', '🎉 Tự Hào'],
      likes: 56,
    },
    {
      id: 'mem_4',
      grade: '9',
      title: 'Chuyên đề giải đề thi vào lớp 10 bứt phá điểm 9+',
      date: '02/09/2026',
      classTag: 'Lớp 9C',
      category: 'Ôn Thi Tuyển Sinh',
      coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      description:
        'Buổi phân tích ma trận đề thi tuyển sinh vào 10 chuẩn CV7991 của Thầy Hải. Các chiến thuật bấm giờ làm bài trắc nghiệm và xử lý bẫy từ vựng hay gặp.',
      tags: ['🎯 Ôn Thi 10', '🔥 Quyết Tâm', '📈 Điểm 9+'],
      likes: 49,
    },
    {
      id: 'mem_5',
      grade: '8',
      title: 'CLB Tiếng Anh tranh biện: City Life vs Country Life',
      date: '28/08/2026',
      classTag: 'Lớp 8A',
      category: 'Tranh Biện Hùng Biện',
      coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
      description:
        'Màn tranh luận nảy lửa và giàu sức thuyết phục giữa hai đội ủng hộ cuộc sống thành thị và nông thôn. Khả năng phản xạ tiếng Anh tự nhiên của học sinh được khen ngợi.',
      tags: ['🗣️ Tranh Biện', '💡 Tư Duy', '🌟 Xuất Sắc'],
      likes: 61,
    },
    {
      id: 'mem_6',
      grade: '7',
      title: 'Đấu trường từ vựng Kahoot rộn rã tiếng cười lớp 7B',
      date: '25/08/2026',
      classTag: 'Lớp 7B',
      category: 'Trò Chơi Học Tập',
      coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
      description:
        'Không khí lớp học bùng nổ trong vòng đấu loại trực tiếp của trò chơi từ vựng Unit 1. Tinh thần đồng đội và phản xạ nhanh nhạy giúp các em tiếp thu bài rất hào hứng.',
      tags: ['🎮 Gamification', '⚡ Phản Xạ', '👏 Sôi Động'],
      likes: 53,
    },
  ];

  // BỘ LỌC KỶ NIỆM THEO KHỐI LỚP (Ưu tiên bài viết thật do Thầy biên soạn lên đầu)
  const combinedMemories = [...customReels, ...FILM_MEMORIES];
  const filteredMemories =
    selectedGrade === 'all'
      ? combinedMemories
      : combinedMemories.filter(
          (m) => m.grade === selectedGrade || m.classTag?.includes(selectedGrade)
        );

  // HÀM CUỘN NGANG THƯỚC PHIM BẰNG NÚT MŨI TÊN
  const handleScrollReel = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -380 : 380;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  const GRADE_FILTERS = [
    { id: 'all', label: '🌟 Tất cả khối' },
    { id: '9', label: '🎓 Lớp 9' },
    { id: '8', label: '📖 Lớp 8' },
    { id: '7', label: '🎒 Lớp 7' },
  ];

  return (
    <div className="space-y-4 select-text">
      {/* THANH TIÊU ĐỀ + BỘ LỌC KHỐI LỚP + NÚT CUỘN THƯỚC PHIM */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-3 border-b border-emerald-200/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
              Cuộn phim hồi ức
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Lưu giữ những khoảnh khắc học tập và kỷ niệm đáng nhớ của các thế hệ học trò
            </p>
          </div>
        </div>

        {/* CỤM NÚT BỘ LỌC KHỐI LỚP (TẤT CẢ / LỚP 9 / LỚP 8 / LỚP 7) + ĐIỀU HƯỚNG CUỘN */}
        <div className="flex flex-wrap items-center gap-2 select-none">
          <div className="flex items-center space-x-1 bg-emerald-50/80 p-1 rounded-2xl border border-emerald-200/80 shadow-2xs">
            {GRADE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedGrade(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedGrade === f.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-950 hover:bg-white/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* CẶP NÚT CUỘN NGANG THƯỚC PHIM (❮ VÀ ❯) */}
          <div className="hidden sm:flex items-center space-x-1">
            <button
              type="button"
              onClick={() => handleScrollReel('left')}
              className="p-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs transition cursor-pointer"
              title="Cuộn sang trái"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScrollReel('right')}
              className="p-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs transition cursor-pointer"
              title="Cuộn sang phải"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {userIsTeacher && (
            <Link
              to="/film-reel"
              className="text-xs font-black text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 transition flex items-center space-x-1 shadow-2xs"
            >
              <span>Quản lý ➔</span>
            </Link>
          )}
        </div>
      </div>

      {/* DẢI PHIM NHỰA ĐIỆN ẢNH - NỀN TRONG SUỐT LIỀN MẠCH, KHÔNG MỜ, ẢNH GỐC SẮC NÉT */}
      <div className="bg-transparent rounded-3xl p-4 sm:p-5 border-2 border-emerald-200/90 relative overflow-hidden shadow-2xs">
        {/* DẢI LỖ RĂNG CƯA PHIM TRÊN CÙNG TÔNG XANH LÁ NHẠT */}
        <div className="flex justify-between items-center space-x-2 overflow-hidden pb-3 opacity-90 select-none">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={`sprocket_top_${i}`} className="w-3.5 h-2 bg-emerald-100/90 rounded-xs flex-shrink-0 border border-emerald-300/80 shadow-2xs" />
          ))}
        </div>

        {/* DẢI CUỘN NGANG CHỨA CÁC KHUNG HÌNH KỶ NIỆM (HORIZONTAL FILM SCROLL) */}
        <div 
          ref={scrollContainerRef}
          className="flex space-x-5 overflow-x-auto scroll-smooth no-scrollbar py-2 px-1"
        >
          {filteredMemories.map((post, idx) => (
            <div
              key={post.id}
              onClick={() => setActiveModalPost(post)}
              className="w-[300px] sm:w-[340px] md:w-[360px] flex-shrink-0 bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 p-4 transition duration-300 group cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl hover:scale-[1.01]"
            >
              {/* KHUNG ẢNH KỶ NIỆM NGUYÊN BẢN SẮC NÉT KHÔNG MỜ */}
              <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-100 border border-emerald-200/80">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* SỐ FRAME PHIM */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-950/85 text-emerald-300 font-mono text-[10px] font-bold rounded border border-emerald-400/50">
                  FRAME #{String(idx + 1).padStart(2, '0')}
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-1">
                  {post.isCustom && (
                    <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-md shadow-xs animate-pulse">
                      ✨ MỚI
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-md shadow-xs">
                    {post.classTag}
                  </span>
                </div>

                <div className="absolute bottom-2 left-2 flex items-center space-x-1.5 px-2 py-0.5 bg-black/60 rounded text-white text-[11px] font-bold">
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
        <div className="flex justify-between items-center space-x-2 overflow-hidden pt-3 opacity-90 select-none">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={`sprocket_bottom_${i}`} className="w-3.5 h-2 bg-emerald-100/90 rounded-xs flex-shrink-0 border border-emerald-300/80 shadow-2xs" />
          ))}
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT KHOẢNH KHẮC PHIM */}
      {activeModalPost && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto pt-16 sm:pt-10 pb-8 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0 text-slate-900 my-auto">
            <div className="relative aspect-video w-full bg-slate-950">
              <img
                src={activeModalPost.coverImage}
                alt={activeModalPost.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setActiveModalPost(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white font-black flex items-center justify-center cursor-pointer shadow-lg transition-transform active:scale-90"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3 bg-slate-950/80 text-white text-xs px-3 py-1.5 rounded-xl font-bold backdrop-blur-md border border-white/20">
                📅 {activeModalPost.date} • {activeModalPost.classTag}
              </div>
            </div>

            <div className="p-6 space-y-4 select-text max-h-[60vh] overflow-y-auto">
              <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-black uppercase rounded-full border border-emerald-200">
                {activeModalPost.category}
              </div>

              <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {activeModalPost.title}
              </h4>

              {/* NỘI DUNG CHI TIẾT (Nếu là bài viết tự tạo có blocks thì render từng block) */}
              {activeModalPost.rawReel?.blocks && activeModalPost.rawReel.blocks.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {activeModalPost.rawReel.blocks.map((blk, bIdx) => {
                    if (blk.type === 'paragraph' && blk.text) {
                      return (
                        <p key={bIdx} className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                          {blk.text}
                        </p>
                      );
                    }
                    if (blk.type === 'image' && blk.url) {
                      return (
                        <div key={bIdx} className="space-y-1.5 my-3">
                          <img
                            src={blk.url}
                            alt="Ảnh khoảnh khắc"
                            className="w-full rounded-2xl shadow-md border border-slate-200 max-h-96 object-cover"
                          />
                          {blk.caption && (
                            <p className="text-xs text-slate-500 italic text-center font-medium">
                              📷 {blk.caption}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {activeModalPost.description}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                {activeModalPost.tags.map((tg, idx) => (
                  <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-900 font-bold rounded-full text-xs border border-emerald-200">
                    {tg}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModalPost(null)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md"
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
