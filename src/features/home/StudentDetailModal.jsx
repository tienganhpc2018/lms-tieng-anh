import React, { useState } from 'react';
import {
  X,
  Trophy,
  Star,
  Award,
  Calendar,
  CheckCircle2,
  Edit3,
  Trash2,
  Users,
  ExternalLink,
  Save,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { playClick, playCorrect, playDeduct } from '../../utils/soundEffects';
import { loadClasses, loadStudents } from '../behavior/behaviorStorage';

export default function StudentDetailModal({
  isOpen,
  onClose,
  student,
  userIsTeacher = false,
  onUpdateStudentComment,
  onRemoveFromFeatured,
  onChangeFeaturedStudent,
}) {
  const navigate = useNavigate();
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editedComment, setEditedComment] = useState(student?.comment || '');
  const [isSelectOtherOpen, setIsSelectOtherOpen] = useState(false);
  const [selectedOtherClassId, setSelectedOtherClassId] = useState('');
  const [otherClassStudents, setOtherClassStudents] = useState([]);

  if (!isOpen || !student) return null;

  const classes = loadClasses() || [];

  const handleSaveComment = () => {
    playCorrect();
    if (onUpdateStudentComment) {
      onUpdateStudentComment(student.id, editedComment);
    }
    setIsEditingComment(false);
  };

  const handleSelectClassToChange = (classId) => {
    playClick();
    setSelectedOtherClassId(classId);
    const studs = loadStudents(classId) || [];
    setOtherClassStudents(studs);
  };

  const handlePickStudent = (st) => {
    playCorrect();
    const classNameObj = classes.find((c) => c.id === selectedOtherClassId);
    const cName = classNameObj?.name ? `Lớp ${classNameObj.name}` : 'Lớp Học';
    if (onChangeFeaturedStudent) {
      onChangeFeaturedStudent(student.id, {
        id: st.id,
        name: st.full_name,
        class: `Học sinh ${cName}`,
        classId: selectedOtherClassId,
        badge: student.badge || 'Gương mặt xuất sắc',
        points: st.plus_points || 0,
        avatar: st.avatar && !st.avatar.includes('bottts')
          ? st.avatar
          : '/images/avatars/student_female_1.jpg',
        comment: `Được Thầy/Cô vinh danh tại ${cName} với tinh thần học tập xuất sắc và nỗ lực rèn luyện nổi bật.`,
        isCustom: true,
      });
    }
    setIsSelectOtherOpen(false);
    onClose();
  };

  const handleGoToBehavior = () => {
    playClick();
    onClose();
    navigate('/behavior');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* 1. HEADER MODAL VINH DANH */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md text-xl">
              🏆
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                <span>Hồ Sơ Học Viên Tiêu Biểu</span>
              </h3>
              <p className="text-xs text-emerald-200 font-semibold">
                Gương sáng thi đua nề nếp & học tập xuất sắc
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. NỘI DUNG CHI TIẾT */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* KHUNG THÔNG TIN CƠ BẢN VÀ AVATAR */}
          <div className="flex items-center space-x-4 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80">
            <div className="relative flex-shrink-0">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-20 h-20 rounded-full object-cover border-3 border-emerald-500 shadow-md"
                onError={(e) => {
                  e.currentTarget.src = '/images/avatars/student_female_1.jpg';
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-xs font-black shadow-xs">
                ★
              </div>
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black text-slate-900">{student.name}</h4>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  +{student.points || 0} điểm
                </span>
              </div>
              <p className="text-xs font-bold text-slate-600">{student.class}</p>
              <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-black text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-md border border-amber-300">
                  🎖️ {student.badge || 'Gương mặt xuất sắc'}
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  Trạng thái: Tích cực
                </span>
              </div>
            </div>
          </div>

          {/* LỜI TUYÊN DƯƠNG / NHẬN XÉT CỦA GIÁO VIÊN */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Lời Tuyên Dương Của Giáo Viên:</span>
              </label>
              {!isEditingComment && userIsTeacher && (
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setIsEditingComment(true);
                    setEditedComment(student.comment || '');
                  }}
                  className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa lời khen</span>
                </button>
              )}
            </div>

            {isEditingComment ? (
              <div className="space-y-2 pt-1">
                <textarea
                  rows={3}
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                  placeholder="Nhập lời khen ngợi chân thực cho học sinh này..."
                  className="w-full p-2.5 bg-white border-2 border-emerald-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingComment(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveComment}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center gap-1 hover:bg-emerald-700 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Nhận Xét</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal italic bg-white p-3 rounded-xl border border-slate-200">
                "{student.comment}"
              </p>
            )}
          </div>

          {/* LỰA CHỌN ĐỔI HỌC SINH KHÁC HOẶC GỠ BỎ (CHỈ DÀNH CHO GIÁO VIÊN / ADMIN) */}
          {userIsTeacher && (
            isSelectOtherOpen ? (
              <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-amber-950 uppercase flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-700" />
                    <span>Chọn Học Sinh Nổi Bật Thay Thế:</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() => setIsSelectOtherOpen(false)}
                    className="text-xs text-slate-500 font-bold hover:text-slate-800"
                  >
                    Đóng
                  </button>
                </div>

                {/* Chọn lớp */}
                <div className="flex flex-wrap gap-1.5">
                  {classes.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectClassToChange(c.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                        selectedOtherClassId === c.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                {/* Danh sách học sinh của lớp được chọn */}
                {otherClassStudents.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1 bg-white p-2 rounded-xl border border-slate-200">
                    {otherClassStudents.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => handlePickStudent(st)}
                        className="p-2 rounded-lg hover:bg-emerald-50 flex items-center justify-between cursor-pointer border border-transparent hover:border-emerald-200 transition"
                      >
                        <span className="text-xs font-bold text-slate-800">{st.full_name}</span>
                        <span className="text-xs font-black text-emerald-600">
                          +{st.plus_points || 0} điểm
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic text-center py-2">
                    Vui lòng bấm chọn một lớp ở trên để xem danh sách học sinh.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setIsSelectOtherOpen(true);
                    if (classes.length > 0) handleSelectClassToChange(classes[0].id);
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Đổi Học Sinh Tiêu Biểu Khác</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Thầy/Cô có chắc muốn gỡ em "${student.name}" khỏi danh sách học sinh tiêu biểu không?`)) {
                      playDeduct();
                      if (onRemoveFromFeatured) onRemoveFromFeatured(student.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Gỡ Khỏi Tiêu Biểu</span>
                </button>
              </div>
            )
          )}
        </div>

        {/* 3. FOOTER ĐIỀU HƯỚNG */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {userIsTeacher ? (
            <button
              type="button"
              onClick={handleGoToBehavior}
              className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở Sổ Nề Nếp Lớp Học</span>
            </button>
          ) : (
            <div className="text-xs text-slate-500 font-bold">
              🌟 Chúc mừng thành tích tiêu biểu của học sinh!
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
