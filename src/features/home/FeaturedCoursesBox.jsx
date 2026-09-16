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
      classTag: 'Lớp 9A',
      badgeText: 'Lớp 9 • Ôn Thi Vào 10',
      description:
        'Với 12 chủ đề bao gồm kiến thức phù hợp với lứa tuổi của học sinh, sách Tiếng Anh 9 sẽ dạy các bạn nhớ những kỹ năng sống cần thiết, có trách nhiệm đối với cộng đồng mình đang sống. Học sinh sẽ được rèn luyện kỹ năng nghe, nói, đọc và viết thông qua các bài học sinh động.',
      keywords: ['9', 'chín', 'nine', 'english 9'],
      // Ảnh thật 100% sắc nét như FRAME #01 ở dưới
      imageIllustration: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=90',
    },
    {
      grade: 8,
      title: 'Tiếng Anh 8',
      subtitle: 'Global success',
      edition: 'Standard edition',
      classTag: 'Lớp 8B',
      badgeText: 'Lớp 8 • Bứt Phá Điểm Số',
      description:
        'Sách Tiếng Anh 8 được biên soạn theo định hướng giao tiếp, bám sát các chủ đề đời sống học sinh, nâng cao vốn từ vựng và tự tin trong các tình huống thực tế. Tích hợp bài tập tương tác số hóa, game từ vựng và video bài giảng tương tác dừng mốc.',
      keywords: ['8', 'tám', 'eight', 'english 8'],
      // Ảnh thật 100% sắc nét như FRAME #02 ở dưới
      imageIllustration: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=90',
    },
    {
      grade: 7,
      title: 'Tiếng Anh 7',
      subtitle: 'Global success',
      edition: 'Standard edition',
      classTag: 'Khối 7-8-9',
      badgeText: 'Lớp 7 • Nền Tảng Vững Chắc',
      description:
        'Cuốn sách này được biên soạn với mục đích phát triển toàn diện cho học sinh ở cả 4 kỹ năng nghe, nói, đọc, viết. Đồng thời chú trọng vào kỹ năng giao tiếp, kèm tích hợp nhiều hoạt động thú vị, kích thích trí sáng tạo của học sinh giúp học sinh hứng thú hơn.',
      keywords: ['7', 'bảy', 'seven', 'english 7'],
      // Ảnh thật 100% sắc nét như FRAME #03 ở dưới
      imageIllustration: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=90',
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
              {/* PHẦN ẢNH BÌA THẬT 100% SẮC NÉT, KHÔNG CHE MỜ, ĐÃ XÓA KHUNG CHỮ TIẾNG ANH 7,8,9 */}
              <div className="relative h-60 w-full bg-slate-100 overflow-hidden flex flex-col justify-between p-3.5 select-none">
                {/* ẢNH THẬT NGUYÊN BẢN SẮC NÉT NHƯ 3 ẢNH DƯỚI */}
                <img
                  src={item.imageIllustration}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* DÒNG TIÊU ĐỀ BÌA TRÊN CÙNG: BADGE ENGLISH VÀ TAG LỚP */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-xs rounded-lg text-[10px] font-black uppercase tracking-wider text-white border border-white/20 shadow-xs">
                    ENGLISH {item.grade}
                  </span>

                  <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-md shadow-xs">
                    {item.classTag}
                  </span>
                </div>

                {/* DƯỚI CÙNG KHUNG ẢNH: THANH THÔNG TIN GỌN GÀNG KHÔNG CHE MẶT */}
                <div className="relative z-10 flex items-center justify-between text-xs px-3 py-1.5 bg-black/60 backdrop-blur-xs rounded-xl text-white font-bold border border-white/20 shadow-xs">
                  <span className="text-[11px] text-slate-100">{item.badgeText}</span>
                  <span className="text-emerald-400 font-extrabold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px]">Đang mở</span>
                  </span>
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

                  <h4 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition leading-snug">
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
                    className="relative overflow-hidden flex-1 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-xs rounded-xl border border-emerald-300/90 shadow-2xs transition flex items-center justify-center space-x-1.5 cursor-pointer group/btn"
                  >
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent pointer-events-none" />
                    <span className="relative z-10">Tìm hiểu thêm</span>
                    <ArrowRight className="relative z-10 w-3.5 h-3.5 text-emerald-700 group-hover/btn:translate-x-0.5 transition transform" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleOpenBook(item, e)}
                    title="Mở chế độ Sách Mềm điện tử tương tác"
                    className="py-2.5 px-3 bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs rounded-xl border border-emerald-200 shadow-2xs transition flex items-center space-x-1 cursor-pointer"
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
