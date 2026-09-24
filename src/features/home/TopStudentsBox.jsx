import React, { useState, useEffect } from 'react';
import { Award, Star, Trophy, Sparkles } from 'lucide-react';
import { getTopStudentsAcrossClasses } from '../behavior/behaviorStorage';

// DANH SÁCH 3 HỌC VIÊN MẪU DỰ PHÒNG (Fallback khi toàn trường chưa có học sinh nào được cộng điểm)
const DEFAULT_TOP_STUDENTS = [
  {
    id: 'sample_1',
    name: 'Nguyễn Thị Vi Na',
    class: 'Học sinh Lớp 9A',
    badge: 'Gương mặt xuất sắc',
    points: 15,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    comment:
      'Luôn ghi điểm với phát biểu sôi nổi và sự tự tin. Điểm cao của bạn không chỉ phản ánh nỗ lực cá nhân mà còn truyền động viên cho lớp.',
    isSample: true,
  },
  {
    id: 'sample_2',
    name: 'Nguyễn Phan Quỳnh Như',
    class: 'Học sinh Lớp 8B',
    badge: 'Nỗ lực bứt phá',
    points: 12,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    comment:
      'Vượt qua nhiều khó khăn trong học tập với sự kiên nhẫn và quyết tâm. Phát biểu của bạn đã tạo động lực cho cả lớp.',
    isSample: true,
  },
  {
    id: 'sample_3',
    name: 'Nguyễn Phan Tấn Đạt',
    class: 'Học sinh Lớp 7C',
    badge: 'Tinh thần gương mẫu',
    points: 10,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    comment:
      'Đã thể hiện một tinh thần học tập xuất sắc, luôn chấp hành nội quy và truyền đạt kiến thức một cách xuất sắc. Điều này đã ảnh hưởng tích cực đến lớp học.',
    isSample: true,
  },
];

// Bộ avatar học sinh ảnh thật đẹp mắt phong cách học đường theo giới tính
const AVATAR_PRESETS = {
  female: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  ],
  male: [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  ],
};

export default function TopStudentsBox() {
  const [topStudents, setTopStudents] = useState(DEFAULT_TOP_STUDENTS);

  // Nạp danh sách top 3 học sinh tiêu biểu nhiều điểm cộng nhất Real-time
  const refreshTopStudents = () => {
    try {
      const realTop = getTopStudentsAcrossClasses(3);

      if (!realTop || realTop.length === 0) {
        setTopStudents(DEFAULT_TOP_STUDENTS);
        return;
      }

      // Huy hiệu và lời khen tự động thông minh theo thứ hạng
      const BADGE_CONFIG = [
        {
          badge: 'Gương mặt xuất sắc',
          commentTemplate: (name, points, className) =>
            `Xuất sắc dẫn đầu toàn trường với +${points} điểm cộng thi đua tại ${className}. Luôn ghi điểm với phát biểu sôi nổi, sự tự tin và tinh thần học tập gương mẫu truyền cảm hứng cho cả lớp.`,
        },
        {
          badge: 'Nỗ lực bứt phá',
          commentTemplate: (name, points, className) =>
            `Thành tích ấn tượng với +${points} điểm cộng thi đua tại ${className}. Tích cực tham gia xây dựng bài, kiên nhẫn vượt qua thử thách học tập và luôn sẵn sàng hỗ trợ các bạn cùng tiến bộ.`,
        },
        {
          badge: 'Tinh thần gương mẫu',
          commentTemplate: (name, points, className) =>
            `Ghi dấu ấn với +${points} điểm cộng thi đua tại ${className}. Luôn chấp hành xuất sắc nề nếp, tác phong nghiêm túc, làm bài tập đầy đủ và lan tỏa năng lượng tích cực đến lớp học.`,
        },
      ];

      const mappedStudents = realTop.map((st, idx) => {
        const config = BADGE_CONFIG[idx] || BADGE_CONFIG[2];
        const isFemale = (st.gender || '').toLowerCase() === 'nữ';
        const presetList = isFemale ? AVATAR_PRESETS.female : AVATAR_PRESETS.male;
        const fallbackAvatar = presetList[idx % presetList.length];

        // Ưu tiên avatar nếu có ảnh thực tế (không phải avatar bottts mặc định)
        let finalAvatar = fallbackAvatar;
        if (st.avatar && (st.avatar.startsWith('http') || st.avatar.startsWith('data:')) && !st.avatar.includes('bottts')) {
          finalAvatar = st.avatar;
        }

        const classNameDisplay = st.className ? (st.className.startsWith('Lớp') ? st.className : `Lớp ${st.className}`) : 'Lớp Học';

        return {
          id: st.id,
          name: st.full_name,
          class: `Học sinh ${classNameDisplay}`,
          badge: config.badge,
          points: st.plus_points || 0,
          avatar: finalAvatar,
          comment: config.commentTemplate(st.full_name, st.plus_points || 0, classNameDisplay),
          isSample: false,
        };
      });

      // Nếu ít hơn 3 học sinh thật thì bổ sung thêm các bạn mẫu dự phòng để luôn đủ 3 khung tròn đẹp mắt
      if (mappedStudents.length < 3) {
        const remaining = DEFAULT_TOP_STUDENTS.slice(mappedStudents.length);
        setTopStudents([...mappedStudents, ...remaining]);
      } else {
        setTopStudents(mappedStudents);
      }
    } catch (e) {
      console.error('Lỗi cập nhật học sinh tiêu biểu Real-time:', e);
      setTopStudents(DEFAULT_TOP_STUDENTS);
    }
  };

  useEffect(() => {
    refreshTopStudents();

    // 1. Lắng nghe sự kiện cập nhật điểm nề nếp học sinh trong cùng tab
    const handleUpdate = () => refreshTopStudents();
    window.addEventListener('behaviorStudentsUpdated', handleUpdate);

    // 2. Lắng nghe sự kiện thay đổi LocalStorage giữa các tab khác nhau
    window.addEventListener('storage', handleUpdate);

    // 3. Cơ chế kiểm tra định kỳ 3 giây để đảm bảo luôn real-time tuyệt đối
    const interval = setInterval(refreshTopStudents, 3000);

    return () => {
      window.removeEventListener('behaviorStudentsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-4 select-text">
      {/* THANH TIÊU ĐỀ HỌC VIÊN TIÊU BIỂU CHUẨN ẢNH MẪU */}
      <div className="bg-emerald-50/90 text-emerald-950 px-6 py-3 rounded-2xl flex items-center justify-between border border-emerald-200/90 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <Trophy className="w-5 h-5 text-amber-600" />
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-800">
            Học viên tiêu biểu
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-extrabold text-emerald-800 bg-white/90 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
            Gương Sáng Thi Đua
          </span>
        </div>
      </div>

      {/* KHUNG CHỨA 3 HỌC SINH TIÊU BIỂU REAL-TIME */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {topStudents.map((student, idx) => (
            <div
              key={student.id || idx}
              className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 group"
            >
              {/* AVATAR TRÒN CỦA HỌC SINH VỚI NGÔI SAO VÀNG */}
              <div className="relative flex-shrink-0">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-3 border-emerald-400 shadow-md group-hover:scale-105 transition"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-xs font-black shadow-xs">
                  ★
                </div>
              </div>

              {/* THÔNG TIN VÀ LỜI TUYÊN DƯƠNG CHUẨN ẢNH MẪU */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition">
                    {student.name}
                  </h4>
                  {student.points > 0 && (
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300 shrink-0">
                      +{student.points} điểm
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-[11px] font-bold text-slate-500">
                    {student.class}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
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
