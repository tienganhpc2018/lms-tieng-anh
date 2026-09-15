// DANH MỤC VÀ CÁC CẤU HÌNH MẪU CUỘN PHIM KỶ NIỆM LỚP HỌC 35MM

export const FILM_REEL_CATEGORIES = [
  'Tất cả',
  'Học tập',
  'Văn nghệ',
  'Dã ngoại',
  'Thể thao',
  'Kỷ niệm',
  'Khác',
];

export const CATEGORY_BADGES = {
  'Học tập': {
    badgeBg: 'bg-indigo-600 text-white',
    pillColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    accentColor: '#4f46e5',
    icon: '📚',
  },
  'Văn nghệ': {
    badgeBg: 'bg-rose-500 text-white',
    pillColor: 'bg-rose-100 text-rose-800 border-rose-200',
    accentColor: '#f43f5e',
    icon: '🎭',
  },
  'Dã ngoại': {
    badgeBg: 'bg-emerald-600 text-white',
    pillColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accentColor: '#059669',
    icon: '🏕️',
  },
  'Thể thao': {
    badgeBg: 'bg-amber-500 text-white',
    pillColor: 'bg-amber-100 text-amber-800 border-amber-200',
    accentColor: '#f59e0b',
    icon: '⚽',
  },
  'Kỷ niệm': {
    badgeBg: 'bg-purple-600 text-white',
    pillColor: 'bg-purple-100 text-purple-800 border-purple-200',
    accentColor: '#9333ea',
    icon: '✨',
  },
  'Khác': {
    badgeBg: 'bg-slate-700 text-white',
    pillColor: 'bg-slate-100 text-slate-800 border-slate-200',
    accentColor: '#475569',
    icon: '📌',
  },
};

// GỢI Ý HOẠT ĐỘNG PHỔ BIẾN CHO TRỢ LÝ AI
export const ACTIVITY_SUGGESTIONS = [
  {
    category: 'Văn nghệ',
    title: 'Lễ Kỷ Niệm Tri Ân 20/11',
    keywords: 'hoa tươi, tri ân thầy cô, tiết mục múa, nụ cười rạng rỡ, xúc động',
  },
  {
    category: 'Học tập',
    title: 'Ngày Hội Trải Nghiệm STEM',
    keywords: 'chế tạo mô hình, làm việc nhóm, tiếng reo hò, sáng tạo, khám phá',
  },
  {
    category: 'Dã ngoại',
    title: 'Chuyến Dã Ngoại Sinh Thái Cuối Tuần',
    keywords: 'hòa mình thiên nhiên, cắm trại, trò chơi teambuilding, nướng thịt, gắn kết',
  },
  {
    category: 'Thể thao',
    title: 'Giải Kéo Co & Bóng Đá Mini Lớp',
    keywords: 'cổ vũ cuồng nhiệt, tinh thần đồng đội, quyết tâm, mồ hôi, chiến thắng vẻ vang',
  },
  {
    category: 'Kỷ niệm',
    title: 'Buổi Sinh Nhật Tập Thể Tháng Này',
    keywords: 'bánh kem ngọt ngào, nến lung linh, điều ước tuổi học trò, ảnh kỷ niệm',
  },
  {
    category: 'Học tập',
    title: 'Cuộc Thi Rung Chuông Vàng Tiếng Anh',
    keywords: 'câu hỏi thử thách, hồi hộp, bạn bè cứu trợ, tự hào, chinh phục đỉnh cao',
  },
];

// 3 BÀI VIẾT MẪU GỢI Ý CHUẨN XÁC THEO ẢNH GIAO DIỆN
export const SAMPLE_FILM_REELS = [
  {
    id: 'sample_reel_1',
    title: 'Lễ Kỷ Niệm Tri Ân Ngày Nhà Giáo Việt Nam 20/11',
    category: 'Văn nghệ',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&auto=format&fit=crop&q=80',
    eventDate: '2026-11-20',
    likesCount: 38,
    isLiked: false,
    blocks: [
      {
        id: 'blk_1_1',
        type: 'paragraph',
        text: 'Sáng ngày 20/11, không khí lớp học rộn ràng hơn bao giờ hết với những lẵng hoa tươi thắm và những nụ cười rạng rỡ của thầy trò. Những lời ca tiếng hát tri ân vang lên chan chứa tình cảm biết ơn sâu sắc đối với người lái đò thầm lặng.',
      },
      {
        id: 'blk_1_2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=80',
        caption: 'Tiết mục múa hát tốp ca đặc sắc của các bạn nữ trong tà áo dài truyền thống.',
      },
      {
        id: 'blk_1_3',
        type: 'paragraph',
        text: 'Mỗi khoảnh khắc trao hoa, mỗi cái ôm ấm áp đều là những viên ngọc quý khắc sâu vào ký ức thanh xuân của mỗi học sinh dưới mái trường thân yêu.',
      },
      {
        id: 'blk_1_4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&auto=format&fit=crop&q=80',
        caption: 'Bức ảnh tập thể chụp kỷ niệm cùng thầy cô chủ nhiệm cuối buổi lễ tri ân.',
      },
    ],
  },
  {
    id: 'sample_reel_2',
    title: 'Ngày Hội Khoa Học & Trải Nghiệm Sáng Tạo STEM',
    category: 'Học tập',
    coverImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1000&auto=format&fit=crop&q=80',
    eventDate: '2026-10-15',
    likesCount: 29,
    isLiked: false,
    blocks: [
      {
        id: 'blk_2_1',
        type: 'paragraph',
        text: 'Ngày hội STEM hôm nay biến phòng học thành một xưởng chế tạo tí hon đầy ắp tiếng reo hò hứng khởi. Các tổ cùng nhau tính toán, lắp ráp mô hình tên lửa nước và cầu treo chịu lực từ que kem.',
      },
      {
        id: 'blk_2_2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1000&auto=format&fit=crop&q=80',
        caption: 'Các bạn học sinh hào hứng thử nghiệm khả năng chịu tải của mô hình kiến trúc.',
      },
      {
        id: 'blk_2_3',
        type: 'paragraph',
        text: 'Thông qua các hoạt động trải nghiệm thực hành, lý thuyết khô khan trở nên sống động, khơi dậy niềm đam mê nghiên cứu khoa học tự nhiên trong mỗi bạn nhỏ.',
      },
      {
        id: 'blk_2_4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000&auto=format&fit=crop&q=80',
        caption: 'Niềm vui rạng ngời khi sản phẩm khoa học của nhóm hoàn thành xuất sắc.',
      },
    ],
  },
  {
    id: 'sample_reel_3',
    title: 'Chuyến Dã Ngoại Sinh Thái Gắn Kết Tình Bạn',
    category: 'Dã ngoại',
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop&q=80',
    eventDate: '2026-09-28',
    likesCount: 45,
    isLiked: false,
    blocks: [
      {
        id: 'blk_3_1',
        type: 'paragraph',
        text: 'Rời xa bảng đen phấn trắng và không gian lớp học quen thuộc, cả lớp đã có một ngày cuối tuần hòa mình vào thiên nhiên trong lành của khu bảo tồn sinh thái. Tiếng cười đùa rộn rã xua tan đi bao căng thẳng sau những giờ học chăm chỉ.',
      },
      {
        id: 'blk_3_2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1000&auto=format&fit=crop&q=80',
        caption: 'Cùng nhau tham gia thử thách vượt chướng ngại vật teambuilding gắn kết.',
      },
      {
        id: 'blk_3_3',
        type: 'paragraph',
        text: 'Cùng nhau nướng bánh mì, cùng chia nhau từng ngụm nước và nắm chặt tay nhau khi vượt qua thử thách. Chuyến đi không chỉ là kỷ niệm đẹp mà còn thắt chặt tình bạn tuổi học trò bền lâu.',
      },
      {
        id: 'blk_3_4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1000&auto=format&fit=crop&q=80',
        caption: 'Khoảnh khắc ngắm hoàng hôn buông xuống bên đồi cỏ xanh ngát cùng nhau.',
      },
    ],
  },
];
