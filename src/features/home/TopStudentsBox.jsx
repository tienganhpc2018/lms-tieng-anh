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
import {
  AVATAR_PRESETS,
  getStudentAvatarPreset,
  detectGenderFromName,
} from './studentAvatarHelper';
import {
  getSiteSetting,
  saveSiteSetting,
  subscribeSiteSetting,
} from '../../services/siteSettingsService';

// DANH SÁCH 3 HỌC VIÊN MẪU DỰ PHÒNG (Fallback khi toàn trường chưa có học sinh nào được cộng điểm)
const DEFAULT_TOP_STUDENTS = [
  {
    id: 'sample_1',
    name: 'Nguyễn Thị Vi Na',
    class: 'Học sinh Lớp 9A',
    badge: 'Gương mặt xuất sắc',
    points: 15,
    avatar: '/images/avatars/student_female_1.jpg',
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
    avatar: '/images/avatars/student_female_2.jpg',
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
    avatar: '/images/avatars/student_male_1.jpg',
    comment:
      'Đã thể hiện một tinh thần học tập xuất sắc, luôn chấp hành nội quy và truyền đạt kiến thức một cách xuất sắc. Điều này đã ảnh hưởng tích cực đến lớp học.',
    isSample: true,
  },
];

export default function TopStudentsBox({ userIsTeacher = false }) {
  const [topStudents, setTopStudents] = useState(DEFAULT_TOP_STUDENTS);
  const [selectedDetailStudent, setSelectedDetailStudent] = useState(null);

  // Nạp danh sách top 3 học sinh tiêu biểu nhiều điểm cộng nhất Real-time
  const refreshTopStudents = () => {
    try {
      const realTop = getTopStudentsAcrossClasses(3);

      if (!realTop || realTop.length === 0) {
        // Kiểm tra xem trong LocalStorage có danh sách do Cloud tải về trước đó không
        const custom = getCustomFeaturedStudents();
        if (Array.isArray(custom) && custom.length > 0) {
          setTopStudents(custom);
          return;
        }
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
          const smartAvatar = getStudentAvatarPreset({ ...st, full_name: st.name }, idx);
          const needsFixAvatar =
            !st.avatar ||
            st.avatar.includes('unsplash') ||
            (st.avatar.startsWith('/images/avatars/student_') &&
              detectGenderFromName(st.name) !== (st.avatar.includes('female') ? 'female' : 'male'));

          return {
            ...st,
            avatar: needsFixAvatar ? smartAvatar : st.avatar,
          };
        }

        const config = BADGE_CONFIG[idx] || BADGE_CONFIG[2];
        const finalAvatar = getStudentAvatarPreset(st, idx);

        const classNameDisplay = st.className
          ? st.className.startsWith('Lớp')
            ? st.className
            : `Lớp ${st.className}`
          : 'Lớp Học';
        const points = st.plus_points || 0;

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

      let finalList;
      if (mappedStudents.length < 3) {
        const remaining = DEFAULT_TOP_STUDENTS.slice(mappedStudents.length);
        finalList = [...mappedStudents, ...remaining];
      } else {
        finalList = mappedStudents;
      }

      setTopStudents(finalList);

      // Nếu là Giáo viên/Admin và có học sinh thực tế, tự động đồng bộ lên Supabase Cloud
      if (userIsTeacher && mappedStudents.some((s) => !s.isSample)) {
        saveSiteSetting('featured_top_students', finalList).catch(() => {});
      }
    } catch (e) {
      console.error('Lỗi cập nhật học sinh tiêu biểu Real-time:', e);
      setTopStudents(DEFAULT_TOP_STUDENTS);
    }
  };

  useEffect(() => {
    // 1. Thử kéo dữ liệu thật từ Cloud về trước (đảm bảo Học sinh mở ở máy nào cũng có dữ liệu của Admin)
    const loadFromCloud = async () => {
      try {
        const cloudData = await getSiteSetting('featured_top_students', null);
        if (Array.isArray(cloudData) && cloudData.length > 0) {
          setTopStudents(cloudData);
          saveCustomFeaturedStudents(cloudData);
          return;
        }
      } catch (err) {
        console.warn('Lỗi đọc top học sinh từ Cloud:', err);
      }
      refreshTopStudents();
    };

    loadFromCloud();

    // 2. Lắng nghe Realtime Broadcast từ Supabase khi Admin/GV thay đổi
    const unsubCloud = subscribeSiteSetting('featured_top_students', (freshTop) => {
      if (Array.isArray(freshTop) && freshTop.length > 0) {
        setTopStudents(freshTop);
        saveCustomFeaturedStudents(freshTop);
      }
    });

    // 3. Lắng nghe sự kiện cập nhật điểm nề nếp học sinh trong cùng tab
    const handleUpdate = () => refreshTopStudents();
    window.addEventListener('behaviorStudentsUpdated', handleUpdate);

    // 4. Lắng nghe sự kiện thay đổi LocalStorage giữa các tab khác nhau
    window.addEventListener('storage', handleUpdate);

    // 5. Kiểm tra định kỳ 5 giây để đảm bảo luôn real-time tuyệt đối
    const interval = setInterval(refreshTopStudents, 5000);

    return () => {
      unsubCloud();
      window.removeEventListener('behaviorStudentsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, [userIsTeacher]);

  // Xử lý chỉnh sửa lời nhận xét học sinh tiêu biểu (Đồng bộ cả Local và Cloud)
  const handleUpdateStudentComment = (studentId, newComment) => {
    const updatedList = topStudents.map((s) => (s.id === studentId ? { ...s, comment: newComment } : s));
    setTopStudents(updatedList);
    saveCustomFeaturedStudents(updatedList);
    saveSiteSetting('featured_top_students', updatedList).catch(() => {});
  };

  // Xử lý gỡ học sinh khỏi danh sách tiêu biểu (Đồng bộ cả Local và Cloud)
  const handleRemoveFromFeatured = (studentId) => {
    excludeFromTopStudents(studentId);
    const updatedList = topStudents.filter((s) => s.id !== studentId);
    setTopStudents(updatedList);
    saveCustomFeaturedStudents(updatedList.length > 0 ? updatedList : null);
    saveSiteSetting('featured_top_students', updatedList.length > 0 ? updatedList : []).catch(() => {});
    refreshTopStudents();
  };

  // Xử lý chọn học sinh khác thay thế (Đồng bộ cả Local và Cloud)
  const handleChangeFeaturedStudent = (oldId, newStudentData) => {
    const updatedList = topStudents.map((s) => (s.id === oldId ? newStudentData : s));
    setTopStudents(updatedList);
    saveCustomFeaturedStudents(updatedList);
    saveSiteSetting('featured_top_students', updatedList).catch(() => {});
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
          {userIsTeacher ? (
            <span className="text-[11px] sm:text-xs font-extrabold text-emerald-800 bg-white/90 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs flex items-center gap-1">
              <span>✨ Bấm vào để xem chi tiết & tùy chỉnh</span>
            </span>
          ) : (
            <span className="text-[11px] sm:text-xs font-extrabold text-emerald-800 bg-white/90 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs flex items-center gap-1">
              <span>🏆 Bảng Vinh Danh Tuần Này</span>
            </span>
          )}
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
              title={userIsTeacher ? 'Bấm để xem chi tiết & tùy chỉnh' : 'Bấm để xem chi tiết thành tích'}
              className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-emerald-50/50 transition-all border border-transparent hover:border-emerald-300 hover:shadow-md group cursor-pointer relative"
            >
              {/* AVATAR TRÒN CỦA HỌC SINH VỚI NGÔI SAO VÀNG */}
              <div className="relative flex-shrink-0">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-emerald-400 shadow-md group-hover:scale-105 transition"
                  onError={(e) => {
                    e.currentTarget.src = '/images/avatars/student_female_1.jpg';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[10px] font-black shadow-xs">
                  ★
                </div>
              </div>

              {/* THÔNG TIN VÀ LỜI TUYÊN DƯƠNG CHUẨN ẢNH MẪU */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1.5">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition break-words">
                    {student.name}
                  </h4>
                  {student.points > 0 && (
                    <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300 shrink-0 whitespace-nowrap mt-0.5">
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
                  <span>{userIsTeacher ? 'Xem chi tiết & tùy chỉnh' : 'Xem thành tích'}</span>
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
          userIsTeacher={userIsTeacher}
          onUpdateStudentComment={handleUpdateStudentComment}
          onRemoveFromFeatured={handleRemoveFromFeatured}
          onChangeFeaturedStudent={handleChangeFeaturedStudent}
        />
      )}
    </div>
  );
}
