import React, { useState } from 'react';
import { X, Calendar, Clock, Check, Users, Sparkles, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { DEFAULT_CLASSES, assignExamToClass } from '../examStorage';

export default function AssignExamModal({ exam, onClose, onAssignedSuccess }) {
  const [selectedClasses, setSelectedClasses] = useState(['8A1']);
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [isOpenNow, setIsOpenNow] = useState(true);
  const [allowRetake, setAllowRetake] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!exam) return null;

  const toggleClass = (classId) => {
    if (selectedClasses.includes(classId)) {
      if (selectedClasses.length === 1) return; // Giữ ít nhất 1 lớp
      setSelectedClasses(selectedClasses.filter((c) => c !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  const handleAssign = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const assignedTarget = selectedClasses.join(', ');
      const deadlineStr = `${deadlineDate} ${deadlineTime}`;
      
      const updated = assignExamToClass(exam.id, assignedTarget, deadlineStr, isOpenNow);
      
      setIsSubmitting(false);
      if (onAssignedSuccess) {
        onAssignedSuccess(updated, assignedTarget);
      }
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">
              📋
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                Giao Đề Kiểm Tra Chuẩn GDPT 2018
              </span>
              <h2 className="text-base sm:text-lg font-black mt-0.5 line-clamp-1">{exam.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Chọn lớp nhận đề */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>1. Chọn Lớp Nhận Đề (Click chọn nhiều lớp)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_CLASSES.map((cls) => {
                const isSelected = selectedClasses.includes(cls.id);
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => toggleClass(cls.id)}
                    className={`p-3 rounded-xl border-2 text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm">{cls.name}</div>
                      <div className="text-[11px] text-slate-500">{cls.studentCount} Học sinh • Phòng {cls.room}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cấu hình thời gian & hạn nộp */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>2. Hạn Chót Nộp Bài</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Ngày kết thúc</span>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs sm:text-sm"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Giờ kết thúc</span>
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Cài đặt trạng thái mở đề & thông báo */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isOpenNow}
                onChange={(e) => setIsOpenNow(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-slate-800 text-xs sm:text-sm block">
                  🟢 Công bố & Mở đề cho học sinh làm bài ngay
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Đề thi sẽ hiện ngay lập tức trong mục "Bài tập" của học sinh với nhãn [ĐỀ KIỂM TRA]
                </span>
              </div>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer pt-2 border-t border-slate-200">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="font-semibold text-slate-700 text-xs sm:text-sm block">
                  Trộn ngẫu nhiên thứ tự câu hỏi và đáp án
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Hạn chế học sinh nhìn bài nhau khi ngồi gần trong phòng máy
                </span>
              </div>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer pt-2 border-t border-slate-200">
              <input
                type="checkbox"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="font-semibold text-slate-700 text-xs sm:text-sm block">
                  Gửi thông báo LMS chuông reo cho học sinh các lớp
                </span>
                <span className="text-[11px] text-slate-500 block">
                  "Thầy Nguyễn Văn Hải vừa giao đề kiểm tra: {exam.title}"
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleAssign}
            disabled={isSubmitting || selectedClasses.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Xác nhận giao đề ({selectedClasses.join(', ')})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
