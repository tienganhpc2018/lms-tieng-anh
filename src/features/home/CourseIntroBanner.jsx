import React, { useState } from 'react';
import { BookOpen, Sparkles, CheckCircle2, ArrowRight, PlayCircle, Star, Award } from 'lucide-react';

export default function CourseIntroBanner({ onExploreClick }) {
  const [showDetailModal, setShowDetailModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* KHẨU HIỆU ĐẦU TRANG CHUẨN ẢNH MẪU */}
      <div className="text-center py-2">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-800 tracking-wide font-serif italic select-text">
          &ldquo;Học để khẳng định mình.&rdquo;
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-2 rounded-full" />
      </div>

      {/* BOX 1: GIỚI THIỆU CÁC KHÓA HỌC */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 lg:p-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* CỘT TRÁI: NỘI DUNG GIỚI THIỆU CHUẨN ẢNH MẪU */}
          <div className="lg:col-span-7 space-y-4 select-text">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Học Liệu Tiếng Anh Thông Minh 4.0</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight leading-tight">
              Giới thiệu các khóa học
            </h3>

            <div className="space-y-3 text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              <p>
                Xin chào! Tôi là một giáo viên tiếng Anh đam mê công nghệ và muốn giúp mọi người có thêm hoạt động học tập thông qua khóa học tiếng Anh. Khóa học không chỉ giới thiệu kiến thức ngữ pháp và từ vựng một cách dễ dàng, mà còn tạo cơ hội cho học sinh luyện tập thường xuyên thông qua các bài tập thực tế và trò chơi học tập.
              </p>
              <p>
                Ngoài ra, tôi cung cấp học liệu đa dạng và công cụ học tập trực tuyến để hỗ trợ việc học tập của học sinh mọi lúc, mọi nơi. Nếu bạn đang tìm kiếm một khóa học tiếng Anh chất lượng và muốn nâng cao kỹ năng của mình, hãy cùng tham gia với tôi để khám phá thế giới của ngôn ngữ và giao tiếp hiệu quả!
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDetailModal(true)}
                className="relative overflow-hidden px-6 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-2xl font-black text-sm border border-emerald-300/90 shadow-2xs transition cursor-pointer flex items-center space-x-2 group"
              >
                {/* VỆT SÁNG NGỌC BÍCH LƯỚT NHẸ MỖI 4 GIÂY (SHIMMER EFFECT) */}
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent pointer-events-none" />
                <span className="relative z-10">Tìm hiểu thêm</span>
                <ArrowRight className="relative z-10 w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition transform" />
              </button>

              <button
                type="button"
                onClick={onExploreClick}
                className="px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-900 rounded-2xl font-black text-sm border border-emerald-200 transition cursor-pointer flex items-center space-x-2 shadow-2xs"
              >
                <PlayCircle className="w-4 h-4 text-emerald-600" />
                <span>Xem các khóa học</span>
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: POSTER BANNER HỌC LIỆU ENGLISH CHUẨN ẢNH MẪU - ĐỒNG BỘ TÔNG XANH LÁ MENU */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-200/80 shadow-xl bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-950 text-white p-6 sm:p-7 space-y-5">
              {/* NỀN HỌA TIẾT HỌC TẬP */}
              <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-xl text-xs font-black uppercase tracking-wider text-emerald-100 border border-white/30">
                  KHO HỌC LIỆU ENGLISH
                </div>

                <h4 className="text-xl sm:text-2xl font-black leading-snug tracking-tight text-white">
                  Cung cấp tài liệu học tập, video bài dạy cho các khóa học cộng đồng
                </h4>

                <p className="text-xs text-emerald-100 font-medium">
                  Hệ thống số hóa sách mềm, bài tập H5P, game từ vựng và luyện đề chuẩn CV7991 Bộ GD&ĐT.
                </p>
              </div>

              {/* KHỐI ĐIỂM NỔI BẬT CHUẨN ẢNH MẪU */}
              <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-2 text-xs font-bold text-emerald-50">
                <div className="flex items-center space-x-2 text-amber-300 font-extrabold text-xs uppercase tracking-wide">
                  <Star className="w-4 h-4 fill-amber-300" />
                  <span>Điểm nổi bật:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[13px]">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <span>Thực hành Tiếng Anh</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <span>Audio bài nghe chuẩn</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <span>Luyện thi vào 10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <span>Chuyên đề tự luyện</span>
                  </div>
                </div>
              </div>

              {/* NÚT LEARN NOW > CÓ HIỆU ỨNG SHIMMER LƯỚT SÁNG */}
              <div className="relative z-10 pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onExploreClick}
                  className="relative overflow-hidden px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 uppercase tracking-wider group"
                >
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                  <span className="relative z-10">LEARN NOW</span>
                  <ArrowRight className="relative z-10 w-3.5 h-3.5 group-hover:translate-x-1 transition transform" />
                </button>

                <span className="text-[11px] font-bold text-emerald-200 italic">
                  #hocdelamchu #english
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL THÔNG TIN CHI TIẾT KHI BẤM "TÌM HIỂU THÊM" */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <h4 className="font-extrabold text-slate-900 text-base">Thông Tin Chi Tiết Khóa Học</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p className="font-semibold text-slate-800">
                Khóa học tiếng Anh THCS được thiết kế toàn diện theo khung chương trình GDPT 2018 (Công văn 7991), trang bị đầy đủ:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 font-medium">
                <li>Bộ sách mềm tương tác điện tử kèm âm thanh bản xứ chuẩn quốc tế.</li>
                <li>Hệ thống video bài giảng tương tác dừng mốc câu hỏi H5P thông minh.</li>
                <li>Ngân hàng đề kiểm tra định kỳ 15 phút, 1 tiết, học kỳ và đề luyện thi vào lớp 10 bám sát ma trận.</li>
                <li>Mô-đun thi đua lớp học 4.0: Sổ nề nếp, tích xu đổi quà và cuộn phim kỷ niệm học đường.</li>
              </ul>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-bold text-xs">
                💡 Giáo viên phụ trách: <strong>Thầy Nguyễn Văn Hải</strong> — Sẵn sàng đồng hành cùng các em học sinh trên con đường chinh phục tiếng Anh!
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow transition cursor-pointer"
              >
                Đã hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
