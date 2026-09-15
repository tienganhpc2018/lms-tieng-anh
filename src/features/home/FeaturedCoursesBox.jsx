import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Sparkles, Star, CheckCircle, ExternalLink } from 'lucide-react';

export default function FeaturedCoursesBox({ courses = [], userIsTeacher = false }) {
  const navigate = useNavigate();

  // 3 KHÓA HỌC CHUẨN ĐÚNG THEO YÊU CẦU CỦA THẦY VÀ ẢNH MẪU 2
  const FEATURED_COURSES = [
    {
      grade: 9,
      title: 'Tiếng Anh 9',
      subtitle: 'Global success',
      edition: 'Trial version',
      coverBadge: 'THỰC HÀNH TIẾNG ANH 9',
      coverTheme: 'from-blue-900 via-blue-800 to-indigo-950',
      accentColor: 'blue',
      description:
        'Với 12 chủ đề bao gồm kiến thức phù hợp với lứa tuổi của học sinh, sách Tiếng Anh 9 sẽ dạy các bạn nhớ những kỹ năng sống cần thiết, có trách nhiệm đối với cộng đồng mình đang sống. Học sinh sẽ được rèn luyện kỹ năng nghe, nói, đọc và viết thông qua các bài học sinh động.',
      badgeText: 'Lớp 9 • Ôn Thi Vào 10',
      keywords: ['9', 'chín', 'nine', 'english 9'],
      imageIllustration: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
    },
    {
      grade: 8,
      title: 'Tiếng Anh 8',
      subtitle: 'Global success',
      edition: 'Standard edition',
      coverBadge: 'THỰC HÀNH TIẾNG ANH 8',
      coverTheme: 'from-indigo-900 via-purple-900 to-slate-950',
      accentColor: 'indigo',
      description:
        'Sách Tiếng Anh 8 được biên soạn theo định hướng giao tiếp, bám sát các chủ đề đời sống học sinh, nâng cao vốn từ vựng và tự tin trong các tình huống thực tế. Tích hợp bài tập tương tác số hóa, game từ vựng và video bài giảng tương tác dừng mốc.',
      badgeText: 'Lớp 8 • Bứt Phá Điểm Số',
      keywords: ['8', 'tám', 'eight', 'english 8'],
      imageIllustration: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    },
    {
      grade: 7,
      title: 'Tiếng Anh 7',
      subtitle: 'Global success',
      edition: 'Standard edition',
      coverBadge: 'THỰC HÀNH TIẾNG ANH 7',
      coverTheme: 'from-sky-900 via-teal-900 to-slate-950',
      accentColor: 'teal',
      description:
        'Cuốn sách này được biên soạn với mục đích phát triển toàn diện cho học sinh ở cả 4 kỹ năng nghe, nói, đọc, viết. Đồng thời chú trọng vào kỹ năng giao tiếp, kèm tích hợp nhiều hoạt động thú vị, kích thích trí sáng tạo của học sinh giúp học sinh hứng thú hơn.',
      badgeText: 'Lớp 7 • Nền Tảng Vững Chắc',
      keywords: ['7', 'bảy', 'seven', 'english 7'],
      imageIllustration: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
    },
  ];

  // HÀM TÌM KHÓA HỌC THỰC TẾ TRONG DATABASE KHỚP VỚI KHỐI 9, 8, 7
  const findMatchingCourse = (item) => {
    return courses.find((c) => {
      const titleLower = (c.title || '').toLowerCase();
      return item.keywords.some((kw) => titleLower.includes(kw));
    });
  };

  const handleOpenCourse = (item) => {
    const matched = findMatchingCourse(item);
    if (matched) {
      navigate(`/course/${matched.id}`);
    } else if (courses.length > 0) {
      navigate(`/course/${courses[0].id}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleOpenBook = (item, e) => {
    e.stopPropagation();
    const matched = findMatchingCourse(item);
    if (matched) {
      navigate(`/book/${matched.id}`);
    } else if (courses.length > 0) {
      navigate(`/book/${courses[0].id}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-6" id="box-cac-khoa-hoc">
      {/* TIÊU ĐỀ BOX 2 CHUẨN ẢNH MẪU */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
            Các khóa học
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Chương trình Tiếng Anh THCS Global Success chuẩn ma trận CV7991 của Thầy Nguyễn Văn Hải
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          3 Khối Lớp Trọng Tâm
        </span>
      </div>

      {/* LƯỚI 3 CARD KHÓA HỌC DỌC CHUẨN ẢNH MẪU 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {FEATURED_COURSES.map((item) => {
          const matched = findMatchingCourse(item);

          return (
            <div
              key={item.grade}
              onClick={() => handleOpenCourse(item)}
              className="bg-white rounded-3xl border-2 border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
            >
              {/* PHẦN ẢNH BÌA SÁCH THỰC HÀNH TIẾNG ANH THEO PHONG CÁCH ẢNH MẪU */}
              <div className={`relative h-60 w-full bg-gradient-to-b ${item.coverTheme} text-white p-5 flex flex-col justify-between overflow-hidden shadow-inner`}>
                {/* ẢNH MINH HỌA NỀN MỜ */}
                <img
                  src={item.imageIllustration}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition duration-700 pointer-events-none"
                />

                {/* DÒNG TIÊU ĐỀ BÌA TRÊN CÙNG */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-wider text-white border border-white/30">
                    ENGLISH {item.grade}
                  </span>

                  <span className="text-xs font-black text-amber-300 bg-slate-950/50 px-2 py-0.5 rounded-md">
                    ⋮
                  </span>
                </div>

                {/* BANNER HUY HIỆU THỰC HÀNH TIẾNG ANH CHÍNH GIỮA */}
                <div className="relative z-10 text-center space-y-2 my-auto">
                  <div className="inline-block bg-white text-slate-950 px-4 py-2 rounded-2xl shadow-xl border-2 border-amber-400 transform group-hover:scale-105 transition">
                    <span className="block text-[11px] font-black uppercase tracking-widest text-blue-900">
                      THỰC HÀNH
                    </span>
                    <span className="block text-xl font-black uppercase tracking-wider text-slate-950">
                      TIẾNG ANH {item.grade}
                    </span>
                    <span className="block text-[9px] font-extrabold text-emerald-700 uppercase">
                      BẢN ĐIỆN TỬ 4.0
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-300 font-semibold tracking-wide">
                    https://tienganhpc.online
                  </p>
                </div>

                {/* DƯỚI CÙNG BÌA */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-300 font-bold border-t border-white/20 pt-2">
                  <span>{item.badgeText}</span>
                  <span className="text-emerald-400">● Đang mở</span>
                </div>
              </div>

              {/* PHẦN THÂN CARD NỘI DUNG CHUẨN ẢNH MẪU */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {item.subtitle}
                    </span>
                    <span className="text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {item.edition}
                    </span>
                  </div>

                  <h4 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-700 transition leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal line-clamp-4">
                    {item.description}
                  </p>
                </div>

                {/* BỘ NÚT BẤM "TÌM HIỂU THÊM" & "VÀO HỌC" */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenCourse(item)}
                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer group-hover:bg-blue-700"
                  >
                    <span>Tìm hiểu thêm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleOpenBook(item, e)}
                    title="Mở chế độ Sách Mềm điện tử tương tác"
                    className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl border border-emerald-300 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Sách Mềm</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
