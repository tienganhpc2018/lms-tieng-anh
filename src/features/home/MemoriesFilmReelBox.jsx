import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Film,
  Calendar,
  Heart,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Pin,
  Share2,
  Copy,
  Check,
  MessageCircle,
} from 'lucide-react';
import {
  loadAllFilmReelsAcrossClasses,
  syncAndLoadFilmReels,
  toggleLikeReel,
  toggleSampleReelLike,
  getSampleReelLikes,
} from '../film-reel/filmReelStorage';
import { loadClasses } from '../behavior/behaviorStorage';
import { playClick } from '../../utils/soundEffects';
import SafeFilmImage from '../film-reel/components/SafeFilmImage';
import { getSiteSetting, subscribeSiteSetting } from '../../services/siteSettingsService';

export default function MemoriesFilmReelBox({ userIsTeacher = false }) {
  const navigate = useNavigate();
  const [activeModalPost, setActiveModalPost] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [customReels, setCustomReels] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [sampleLikesMap, setSampleLikesMap] = useState({});
  const [copyToast, setCopyToast] = useState(false);
  const [popHeartId, setPopHeartId] = useState(null);

  // Định dạng danh sách bài viết từ kho lưu trữ để hiển thị trên Cuộn Phim Hồi Ức
  const formatReels = (reelsList, classMap) => {
    if (!Array.isArray(reelsList)) return [];
    return reelsList.map((r) => {
      const firstParagraph = r.blocks?.find((b) => b.type === 'paragraph' && b.text)?.text || '';
      
      // Xử lý tên lớp thông minh (nhận diện chính xác các dạng 7A5, class_7a5, 7a_5)
      let cName = classMap[r.classId];
      if (!cName && r.classId) {
        cName = r.classId.replace(/^class_/i, '').replace(/_/g, '').toUpperCase();
      }
      if (!cName) cName = '7A';

      // Nhận diện khối lớp thông minh dựa trên tên lớp, classId, tiêu đề và danh mục
      const fullCheck = `${cName} ${r.classId || ''} ${r.title || ''} ${r.category || ''}`.toLowerCase();
      let gradeNum = '7';
      if (fullCheck.includes('9') || fullCheck.includes('khối 9') || fullCheck.includes('lớp 9')) {
        gradeNum = '9';
      } else if (fullCheck.includes('8') || fullCheck.includes('khối 8') || fullCheck.includes('lớp 8')) {
        gradeNum = '8';
      } else if (fullCheck.includes('7') || fullCheck.includes('khối 7') || fullCheck.includes('lớp 7') || fullCheck.includes('7a5')) {
        gradeNum = '7';
      }

      let dateFormatted = r.eventDate || '';
      if (dateFormatted.includes('-')) {
        const parts = dateFormatted.split('-');
        if (parts.length === 3) dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }

      let displayTag = cName.startsWith('Lớp') ? cName : `Lớp ${cName}`;
      if (displayTag.toLowerCase().includes('all_classes')) {
        displayTag = 'Toàn trường';
      }

      return {
        id: r.id,
        grade: gradeNum,
        title: r.title,
        date: dateFormatted || 'Mới cập nhật',
        classTag: displayTag,
        category: r.category || 'Kỷ Niệm',
        coverImage:
          r.coverImage ||
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
        description: firstParagraph || 'Khoảnh khắc đáng nhớ và tự hào cùng tập thể lớp.',
        tags: ['✨ ' + (r.category || 'Kỷ Niệm'), '📸 Cuộn Phim', '🌟 Mới Đăng'],
        likes: r.likesCount || 0,
        isLiked: Boolean(r.isLiked),
        isPinned: Boolean(r.isPinned),
        rawReel: r,
        isCustom: true,
      };
    });
  };

  // Nạp các bài viết thực tế từ hệ thống Cuộn phim kỷ niệm (LocalStorage + IndexedDB)
  const refreshCustomReels = () => {
    try {
      const classesList = loadClasses() || [];
      const classMap = {};
      classesList.forEach((c) => {
        if (c.id) classMap[c.id] = c.name;
      });

      const sampleLikes = getSampleReelLikes();
      setSampleLikesMap(sampleLikes);

      // 1. Nạp tức thì từ LocalStorage
      const reelsFromStorage = loadAllFilmReelsAcrossClasses() || [];
      setCustomReels(formatReels(reelsFromStorage, classMap));

      // 2. Nạp đồng bộ từ IndexedDB để không bị sót bài viết có ảnh lớn
      syncAndLoadFilmReels('all_classes').then((synced) => {
        if (synced && synced.length > 0) {
          setCustomReels(formatReels(synced, classMap));
        }
      }).catch(() => {});
    } catch (e) {
      console.error('Lỗi nạp cuộn phim hồi ức:', e);
    }
  };

  useEffect(() => {
    refreshCustomReels();

    // Tải từ Supabase Cloud để đồng bộ bài viết của Admin cho Học sinh trên mọi thiết bị
    getSiteSetting('published_film_reels', null).then((cloudReels) => {
      if (Array.isArray(cloudReels) && cloudReels.length > 0) {
        const classesList = loadClasses() || [];
        const classMap = {};
        classesList.forEach((c) => {
          if (c.id) classMap[c.id] = c.name;
        });
        setCustomReels(formatReels(cloudReels, classMap));
      }
    }).catch(() => {});

    // Lắng nghe Realtime Broadcast khi Admin đăng hoặc sửa bài
    const unsubCloud = subscribeSiteSetting('published_film_reels', (freshReels) => {
      if (Array.isArray(freshReels) && freshReels.length > 0) {
        const classesList = loadClasses() || [];
        const classMap = {};
        classesList.forEach((c) => {
          if (c.id) classMap[c.id] = c.name;
        });
        setCustomReels(formatReels(freshReels, classMap));
      }
    });

    const handleUpdate = () => refreshCustomReels();
    window.addEventListener('filmReelsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      unsubCloud();
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

  // ĐỒNG BỘ LIKE VỚI CÁC BÀI MẪU
  const enrichedSampleMemories = FILM_MEMORIES.map((m) => {
    const saved = sampleLikesMap[m.id];
    return {
      ...m,
      likes: saved ? saved.likesCount : m.likes,
      isLiked: saved ? saved.isLiked : false,
      isPinned: false,
      isCustom: false,
    };
  });

  // BỘ LỌC KỶ NIỆM THEO KHỐI LỚP (Ưu tiên bài viết được Ghim lên đầu tiên, sau đó đến bài viết thật của Thầy)
  const combinedMemories = [...customReels, ...enrichedSampleMemories];

  // Sắp xếp thông minh:
  // 1. Ưu tiên bài viết được Ghim (isPinned === true) lên FRAME #01
  // 2. Bài viết thật của Thầy (isCustom === true) LUÔN ĐỨNG TRƯỚC bài mẫu mặc định (isCustom === false)
  // 3. Sắp xếp theo ngày sự kiện hoặc ngày tạo mới nhất lên trước
  const sortedMemories = [...combinedMemories].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (a.isCustom && !b.isCustom) return -1;
    if (!a.isCustom && b.isCustom) return 1;

    const timeA = new Date(a.rawReel?.eventDate || a.rawReel?.createdAt || 0).getTime();
    const timeB = new Date(b.rawReel?.eventDate || b.rawReel?.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const filteredMemories =
    selectedGrade === 'all'
      ? sortedMemories
      : sortedMemories.filter(
          (m) =>
            m.grade === selectedGrade ||
            m.classTag?.includes(selectedGrade) ||
            m.title?.toLowerCase().includes(`lớp ${selectedGrade}`) ||
            m.title?.toLowerCase().includes(`khối ${selectedGrade}`) ||
            m.title?.toLowerCase().includes(selectedGrade)
        );

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(filteredMemories.length / ITEMS_PER_PAGE) || 1;
  const validPage = Math.min(currentPage, Math.max(0, totalPages - 1));

  // Mặc định hiển thị đúng 3 khung ảnh vừa khít, không bao giờ lòi 1/2 khung
  const displayedMemories = isExpanded
    ? filteredMemories
    : filteredMemories.slice(validPage * ITEMS_PER_PAGE, validPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

  // Xử lý Thả tim trực tiếp trên khung ảnh
  const handleHeartClick = (e, post) => {
    if (e) e.stopPropagation();
    playClick();
    setPopHeartId(post.id);
    setTimeout(() => setPopHeartId(null), 300);

    if (post.isCustom) {
      toggleLikeReel(post.rawReel?.classId, post.id);
      refreshCustomReels();
    } else {
      toggleSampleReelLike(post.id, post.likes);
      setSampleLikesMap(getSampleReelLikes());
    }

    if (activeModalPost && activeModalPost.id === post.id) {
      setActiveModalPost((prev) => ({
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1,
      }));
    }
  };

  // Sao chép liên kết khoảnh khắc
  const handleCopyLink = (post) => {
    playClick();
    const target = post || activeModalPost;
    if (!target) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?memoryId=${target.id}`;

    const executeToast = () => {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 3000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(executeToast)
        .catch(() => fallbackCopy(shareUrl, executeToast));
    } else {
      fallbackCopy(shareUrl, executeToast);
    }
  };

  const fallbackCopy = (text, callback) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      if (callback) callback();
    } catch (e) {
      alert(`Liên kết khoảnh khắc: ${text}`);
    }
  };

  // Chia sẻ khoảnh khắc qua Zalo
  const handleShareZalo = (post) => {
    playClick();
    const target = post || activeModalPost;
    if (!target) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?memoryId=${target.id}`;
    const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(target.title)}`;
    window.open(zaloUrl, '_blank', 'width=650,height=550');
  };

  const GRADE_FILTERS = [
    { id: 'all', label: '🌟 Tất cả khối' },
    { id: '9', label: '🎓 Lớp 9' },
    { id: '8', label: '📖 Lớp 8' },
    { id: '7', label: '🎒 Lớp 7' },
  ];

  return (
    <div className="space-y-4 select-text">
      {/* THANH TIÊU ĐỀ + BỘ LỌC KHỐI LỚP + NÚT ĐIỀU HƯỚNG 3 KHUNG */}
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

        {/* CỤM NÚT BỘ LỌC KHỐI LỚP (TẤT CẢ / LỚP 9 / LỚP 8 / LỚP 7) + CHUYỂN TRANG 3 KHUNG */}
        <div className="flex flex-wrap items-center gap-2 select-none">
          <div className="flex items-center space-x-1 bg-emerald-50/80 p-1 rounded-2xl border border-emerald-200/80 shadow-2xs">
            {GRADE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setSelectedGrade(f.id);
                  setCurrentPage(0);
                }}
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

          {/* CẶP NÚT CHUYỂN TRANG 3 KHUNG ẢNH (❮ VÀ ❯) - CHỈ HIỆN KHI KHÔNG BUNG TẤT CẢ */}
          {!isExpanded && totalPages > 1 && (
            <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-2xl border border-emerald-300 shadow-2xs text-xs font-bold text-emerald-900">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={validPage === 0}
                className={`p-1 rounded-lg transition ${
                  validPage === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-emerald-800 hover:bg-emerald-100 cursor-pointer'
                }`}
                title="Xem 3 khung trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1 text-emerald-800">
                {validPage + 1}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={validPage >= totalPages - 1}
                className={`p-1 rounded-lg transition ${
                  validPage >= totalPages - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-emerald-800 hover:bg-emerald-100 cursor-pointer'
                }`}
                title="Xem 3 khung tiếp theo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

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

        {/* DANH SÁCH KHUNG HÌNH KỶ NIỆM DẠNG LƯỚI 3 CỘT CÂN ĐỐI - KHÔNG BAO GIỜ BỊ LÒI 1/2 KHUNG */}
        {displayedMemories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-2 px-1">
            {displayedMemories.map((post, idx) => {
              const frameNum = isExpanded ? idx + 1 : validPage * ITEMS_PER_PAGE + idx + 1;
              return (
                <div
                  key={post.id}
                  onClick={() => setActiveModalPost(post)}
                  className="w-full bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 p-4 transition duration-300 group cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl hover:scale-[1.01]"
                >
                  {/* KHUNG ẢNH KỶ NIỆM NGUYÊN BẢN SẮC NÉT KHÔNG MỜ */}
                  <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-100 border border-emerald-200/80">
                    <SafeFilmImage
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    {/* SỐ FRAME PHIM */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-950/85 text-emerald-300 font-mono text-[10px] font-bold rounded border border-emerald-400/50">
                      FRAME #{String(frameNum).padStart(2, '0')}
                    </div>

                    <div className="absolute top-2 right-2 flex items-center gap-1 flex-wrap justify-end">
                      {post.isPinned && (
                        <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-md shadow-sm border border-amber-300 flex items-center gap-1 animate-pulse">
                          <Pin className="w-2.5 h-2.5 fill-slate-950" />
                          <span>TIÊU ĐIỂM</span>
                        </span>
                      )}
                      {post.isCustom && !post.isPinned && (
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

                    {/* TAGS & LƯỢT THÍCH (NÚT THẢ TIM TRỰC TIẾP) */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((tg, tIdx) => (
                          <span key={tIdx} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded text-[10px] font-bold">
                            {tg}
                          </span>
                        ))}
                      </div>

                      {/* Nút thả tim trực tiếp ngoài Trang Chủ */}
                      <button
                        type="button"
                        onClick={(e) => handleHeartClick(e, post)}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-black transition-all transform active:scale-125 cursor-pointer select-none border ${
                          post.isLiked
                            ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-2xs'
                            : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-500 border-slate-200'
                        }`}
                        title={post.isLiked ? 'Bỏ thích' : 'Thả tim khoảnh khắc này'}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            post.isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                          } ${popHeartId === post.id ? 'scale-140' : ''}`}
                        />
                        <span>{post.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 bg-white/60 rounded-2xl border border-dashed border-emerald-300">
            <p className="text-sm font-semibold text-emerald-800">Chưa có bài viết hồi ức nào trong mục này</p>
          </div>
        )}

        {/* NÚT XEM TẤT CẢ / THU GỌN VỀ 3 BÀI */}
        {filteredMemories.length > 3 && (
          <div className="pt-4 pb-1 flex justify-center">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer border border-emerald-500/60"
            >
              {isExpanded ? (
                <span>▲ Thu gọn về 3 khung ảnh chuẩn</span>
              ) : (
                <span>👁️ Xem tất cả ({filteredMemories.length} khoảnh khắc) ▼</span>
              )}
            </button>
          </div>
        )}

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
              <SafeFilmImage
                src={activeModalPost.coverImage}
                alt={activeModalPost.title}
                showWarningIfDriveError={true}
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
                          <SafeFilmImage
                            src={blk.url}
                            alt="Ảnh khoảnh khắc"
                            showWarningIfDriveError={true}
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

              {/* THANH CÔNG CỤ CHIA SẺ VÀ TƯƠNG TÁC */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Nút Thả tim trong Modal */}
                  <button
                    type="button"
                    onClick={(e) => handleHeartClick(e, activeModalPost)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer border ${
                      activeModalPost.isLiked
                        ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-2xs'
                        : 'bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border-slate-200'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeModalPost.isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                      } ${popHeartId === activeModalPost.id ? 'scale-140' : ''}`}
                    />
                    <span>{activeModalPost.likes} Thích</span>
                  </button>

                  {/* Nút Sao chép liên kết */}
                  <button
                    type="button"
                    onClick={() => handleCopyLink(activeModalPost)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer border shadow-2xs ${
                      copyToast
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-black'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                    title="Sao chép link bài viết để gửi cho phụ huynh hoặc bạn bè"
                  >
                    {copyToast ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã chép link!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                        <span>Chép liên kết</span>
                      </>
                    )}
                  </button>

                  {/* Nút Chia sẻ Zalo */}
                  <button
                    type="button"
                    onClick={() => handleShareZalo(activeModalPost)}
                    className="px-3.5 py-2 rounded-xl bg-[#0068FF] hover:bg-[#0052cc] text-white text-xs font-black flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer shadow-sm"
                    title="Mở Zalo chia sẻ nhanh bài viết"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Gửi Zalo</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModalPost(null)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
