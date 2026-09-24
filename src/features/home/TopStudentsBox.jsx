import React, { useState, useEffect } from 'react';
import { Award, Star, Trophy, Sparkles, ChevronRight, Eye } from 'lucide-react';
import {
  getTopStudentsAcrossClasses,
  excludeFromTopStudents,
  saveCustomFeaturedStudents,
  getCustomFeaturedStudents,
} from '../behavior/behaviorStorage';
import StudentDetailModal from './StudentDetailModal';
import { playClick } from '../../utils/soundEffects';

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
  const [selectedDetailStudent, setSelectedDetailStudent] = useState(null);

  // Nạp danh sách top 3 học sinh tiêu biểu nhiều điểm cộng nhất Real-time
  const refreshTopStudents = () => {
    try {
      const realTop = getTopStudentsAcrossClasses(3);

      if (!realTop || realTop.length === 0) {
        setTopStudents(DEFAULT_TOP_STUDENTS);
        return;
      }

      // Huy hiệu thi đua theo thứ hạng
      const BADGE_CONFIG = [
        { badge: 'Gương mặt xuất sắc' },
        { badge: 'Nỗ lực bứt phá' },
        { badge: 'Tinh thần gương mẫu' },
      ];

      const mappedStudents = realTop.map((st, idx) => {
        // Nếu học sinh đã có sẵn lời bình hoặc cấu hình tùy chỉnh
        if (st.comment && st.class) {
          return st;
        }

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
        const points = st.plus_points || 0;

        // Xây dựng lời nhận xét chân thực dựa trên hoạt động thực tế
        let realisticComment = '';
        if (Array.isArray(st.activity_history) && st.activity_history.length > 0) {
          const topReason = st.activity_history[0]?.reason || 'Khen ngợi nề nếp';
          realisticComment = `Ghi nhận thành tích tại ${classNameDisplay} với +${points} điểm cộng: "${topReason}". Tinh thần học tập và rèn luyện rất đáng khen ngợi.`;
        } else if (st.notes && st.notes.trim()) {
          realisticComment = `Thành tích thi đua tại ${classNameDisplay}: ${st.notes}. Đạt +${points} điểm cộng nề nếp.`;
        } else {
          realisticComment = `Đạt thành tích thi đua nề nếp tốt tại ${classNameDisplay} với +${points} điểm cộng tích lũy. Luôn có ý thức học tập và rèn luyện gương mẫu.`;
        }

        return {
          id: st.id,
          name: st.full_name,
          class: `Học sinh ${classNameDisplay}`,
          classId: st.classId,
          badge: config.badge,
          points,
          avatar: finalAvatar,
          comment: realisticComment,
          isSample: false,
          rawStudent: st,
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

  // Xử lý chỉnh sửa lời nhận xét học sinh tiêu biểu
  const handleUpdateStudentComment = (studentId, newComment) => {
    const updatedList = topStudents.map((s) => (s.id === studentId ? { ...s, comment: newComment } : s));
    setTopStudents(updatedList);
    saveCustomFeaturedStudents(updatedList);
  };

  // Xử lý gỡ học sinh khỏi danh sách tiêu biểu
  const handleRemoveFromFeatured = (studentId) => {
    excludeFromTopStudents(studentId);
    const updatedList = topStudents.filter((s) => s.id !== studentId);
    setTopStudents(updatedList);
    saveCustomFeaturedStudents(updatedList.length > 0 ? updatedList : null);
    refreshTopStudents();
  };

  // Xử lý chọn học sinh khác thay thế
  const handleChangeFeaturedStudent = (oldId, newStudentData) => {
    const updatedList = topStudents.map((s) => (s.id === oldId ? newStudentData : s));
    setTopStudents(updatedList);
    saveCustomFeaturedStudents(updatedList);
  };

  return (
    <div className="space-y-4 select-text">
      {/* THANH TIÊU ĐỀ HỌC VIÊN TIÊU BIỂU */}
      <div className="bg-emerald-50/90 text-emerald-950 px-6 py-3 rounded-2xl flex items-center justify-between border border-emerald-200/90 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <Trophy className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-800">
              Học viên tiêu biểu
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] sm:text-xs font-extrabold text-emerald-800 bg-white/90 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs flex items-center gap-1">
            <span>✨ Bấm vào để xem chi tiết & tùy chỉnh</span>
          </span>
        </div>
      </div>

      {/* KHUNG CHỨA 3 HỌC SINH TIÊU BIỂU REAL-TIME */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {topStudents.map((student, idx) => (
            <div
              key={student.id || idx}
              onClick={() => {
                playClick();
                setSelectedDetailStudent(student);
              }}
              title="Bấm để xem chi tiết hồ sơ học sinh"
              className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-emerald-50/50 transition-all border border-transparent hover:border-emerald-300 hover:shadow-md group cursor-pointer relative"
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
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition truncate">
                    {student.name}
                  </h4>
                  {student.points > 0 && (
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300 shrink-0">
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
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal pt-1 line-clamp-3">
                  {student.comment}
                </p>
                <div className="pt-1 flex items-center text-[11px] font-bold text-emerald-600 group-hover:text-emerald-700 gap-0.5 opacity-80 group-hover:opacity-100">
                  <Eye className="w-3 h-3" />
                  <span>Xem chi tiết & tùy chỉnh</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT VÀ TÙY CHỈNH HỌC SINH */}
      {selectedDetailStudent && (
        <StudentDetailModal
          isOpen={Boolean(selectedDetailStudent)}
          onClose={() => setSelectedDetailStudent(null)}
          student={selectedDetailStudent}
          onUpdateStudentComment={handleUpdateStudentComment}
          onRemoveFromFeatured={handleRemoveFromFeatured}
          onChangeFeaturedStudent={handleChangeFeaturedStudent}
        />
      )}
    </div>
  );
}
