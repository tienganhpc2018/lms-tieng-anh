import React from 'react';
import { Award, Star, Trophy, Sparkles } from 'lucide-react';

export default function TopStudentsBox() {
  // DANH SÁCH 3 HỌC VIÊN TIÊU BIỂU CHUẨN XÁC THEO ẢNH MẪU CỦA THẦY
  const TOP_STUDENTS = [
    {
      id: 1,
      name: 'Nguyễn Thị Vi Na',
      class: 'Học sinh Lớp 9A',
      badge: 'Gương mặt xuất sắc',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      comment:
        'Luôn ghi điểm với phát biểu sôi nổi và sự tự tin. Điểm cao của bạn không chỉ phản ánh nỗ lực cá nhân mà còn truyền động viên cho lớp.',
    },
    {
      id: 2,
      name: 'Nguyễn Phan Quỳnh Như',
      class: 'Học sinh Lớp 8B',
      badge: 'Nỗ lực bứt phá',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      comment:
        'Vượt qua nhiều khó khăn trong học tập với sự kiên nhẫn và quyết tâm. Phát biểu của bạn đã tạo động lực cho cả lớp.',
    },
    {
      id: 3,
      name: 'Nguyễn Phan Tấn Đạt',
      class: 'Học sinh Lớp 7C',
      badge: 'Tinh thần gương mẫu',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
      comment:
        'Đã thể hiện một tinh thần học tập xuất sắc, luôn chấp hành nội quy và truyền đạt kiến thức một cách xuất sắc. Điều này đã ảnh hưởng tích cực đến lớp học.',
    },
  ];

  return (
    <div className="space-y-4 select-text">
      {/* THANH TIÊU ĐỀ HỌC VIÊN TIÊU BIỂU CHUẨN ẢNH MẪU */}
      <div className="bg-slate-200/90 text-slate-800 px-6 py-3 rounded-2xl flex items-center justify-between border border-slate-300/80 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <Trophy className="w-5 h-5 text-amber-600" />
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Học viên tiêu biểu
          </h3>
        </div>
        <span className="text-xs font-extrabold text-slate-600 bg-white/70 px-3 py-1 rounded-full">
          Gương Sáng Thi Đua
        </span>
      </div>

      {/* KHUNG CHỨA 3 HỌC SINH TIÊU BIỂU CHUẨN ẢNH MẪU */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {TOP_STUDENTS.map((student) => (
            <div
              key={student.id}
              className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 group"
            >
              {/* AVATAR TRÒN CỦA HỌC SINH */}
              <div className="relative flex-shrink-0">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-3 border-emerald-400 shadow-md group-hover:scale-105 transition"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-xs font-black shadow-xs">
                  ★
                </div>
              </div>

              {/* THÔNG TIN VÀ LỜI TUYÊN DƯƠNG CHUẨN ẢNH MẪU */}
              <div className="space-y-1.5 flex-1">
                <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition">
                  {student.name}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-slate-500">
                    {student.class}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {student.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal pt-1">
                  {student.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
