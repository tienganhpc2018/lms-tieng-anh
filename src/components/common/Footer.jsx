import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-300 text-slate-800 py-10 px-6 sm:px-12 border-t border-slate-300/80 font-sans mt-12 select-text">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* CỘT TRÁI: TRANG HỌC LIỆU CHUẨN ẢNH MẪU 2 */}
        <div className="space-y-3">
          <h4 className="text-base sm:text-lg font-black text-slate-900 bg-slate-400/30 px-3 py-1 rounded-lg w-fit">
            Trang Học Liệu
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            Học Liệu Tiếng Anh được hoàn thiện và ra mắt vào ngày 30/8/2023. Với mục đích để lưu giữ tư liệu cá nhân trong việc giảng dạy và đồng thời giúp các em học sinh có thể tham khảo soạn bài và một số tài liệu cần thiết cho việc học.
          </p>
        </div>

        {/* CỘT PHẢI: KẾT NỐI VỚI TÔI CHUẨN ẢNH MẪU 2 */}
        <div className="space-y-3">
          <h4 className="text-base sm:text-lg font-black text-slate-900 bg-slate-400/30 px-3 py-1 rounded-lg w-fit">
            Kết nối với tôi
          </h4>
          <div className="space-y-2 text-xs sm:text-sm text-slate-700 font-semibold">
            <div className="flex items-center space-x-2">
              <span className="text-base">💬</span>
              <span>Nguyễn Văn Hải - THCS Cát Minh</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base">✉️</span>
              <a href="mailto:ngvanhaiai81@gmail.com" className="hover:underline hover:text-slate-950 transition">
                ngvanhaiai81@gmail.com
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base">📞</span>
              <a href="tel:+84384635199" className="hover:underline hover:text-slate-950 transition">
                +84 (0) 384635199
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* DÒNG BẢN QUYỀN DƯỚI CÙNG CHUẨN ẢNH MẪU 2 */}
      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-400/40 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600 font-semibold gap-2">
        <div>
          Bản quyền thuộc © Nguyễn Văn Hải
        </div>
        <div className="flex items-center space-x-1">
          <span>Cung cấp bởi</span>
          <span className="font-extrabold text-slate-900 bg-white/70 px-2 py-0.5 rounded shadow-2xs">
            LMS Tiếng Anh THCS
          </span>
          <span className="text-[11px] text-slate-500">- Tạo website học liệu thông minh</span>
        </div>
      </div>
    </footer>
  );
}
