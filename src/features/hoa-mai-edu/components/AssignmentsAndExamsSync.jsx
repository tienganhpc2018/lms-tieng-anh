import React, { useState } from 'react';
import { 
  BookOpen, FileText, CheckCircle2, Clock, AlertCircle, Send, 
  Search, Filter, ExternalLink, Award, Sparkles, ChevronRight 
} from 'lucide-react';
import { formatVND } from './AttendanceGridTab';

export default function AssignmentsAndExamsSync({
  currentSheet,
  allExams = [],
  allSubmissions = [],
  onOpenExamDetail
}) {
  const [activeSubTab, setActiveSubTab] = useState('exams'); // 'exams' | 'assignments'
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterClass, setFilterClass] = useState(currentSheet?.className || 'Lớp 6A (Chính)');

  // Danh sách đề thi đã sẵn sàng từ Module 5 (Authoring)
  const availableExams = allExams.length > 0 ? allExams : [
    {
      id: 'exam-sample-gk1-6',
      title: 'ĐỀ KIỂM TRA GIỮA HỌC KỲ I - TIẾNG ANH 6 GLOBAL SUCCESS',
      durationMinutes: 45,
      totalPoints: 10,
      assignedClasses: ['Lớp 6A (Chính)', 'Lớp 6B (Cuối tuần)'],
      deadline: '2026-10-30T23:59',
      status: 'published'
    },
    {
      id: 'exam-sample-unit2-6',
      title: 'BÀI KIỂM TRA ĐỊNH KỲ 15 PHÚT - UNIT 2: MY HOUSE',
      durationMinutes: 15,
      totalPoints: 10,
      assignedClasses: ['Lớp 6A (Chính)'],
      deadline: '2026-10-25T23:59',
      status: 'published'
    }
  ];

  // Danh sách bài tập từ Module 4 (Assignments)
  const availableAssignments = [
    {
      id: 'hw-unit1-vocab',
      title: 'BÀI TẬP VỀ NHÀ: TỪ VỰNG & PHÁT ÂM UNIT 1',
      skill: 'Vocabulary & Pronunciation',
      deadline: '2026-10-28',
      assignedClasses: ['Lớp 6A (Chính)'],
      totalExercises: 20
    },
    {
      id: 'hw-present-simple',
      title: 'LUYỆN TẬP CHUYÊN ĐỀ: THÌ HIỆN TẠI ĐƠN & HIỆN TẠI TIẾP DIỄN',
      skill: 'Grammar Focus',
      deadline: '2026-11-05',
      assignedClasses: ['Lớp 6A (Chính)', 'Lớp 7A'],
      totalExercises: 25
    }
  ];

  // Chọn đề bài đang xem xét
  const currentViewItem = selectedItem || availableExams[0];

  // Danh sách học sinh của lớp hiện tại
  const studentsInClass = currentSheet?.students || [];

  // Giả lập trạng thái nộp bài của học sinh đối với đề thi / bài tập đang chọn
  const getStudentSubmission = (studentName) => {
    // Tìm submission thật nếu có
    const realSub = allSubmissions.find(
      (s) => s.studentName === studentName && (s.examId === currentViewItem?.id || s.examTitle === currentViewItem?.title)
    );
    if (realSub) return realSub;

    // Giả lập tỷ lệ nộp bài 80% có điểm cho danh sách 21 học sinh lớp 6A
    const hash = studentName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isSubmitted = hash % 5 !== 0; // 80% nộp
    if (isSubmitted) {
      const score = 7 + (hash % 30) / 10; // Điểm 7.0 - 9.9
      return {
        status: 'graded',
        score: Math.min(10, Math.round(score * 10) / 10),
        submittedAt: '24/10/2026 19:45',
        feedback: 'Làm bài cẩn thận, nắm vững ngữ pháp Unit 2.'
      };
    }
    return {
      status: 'not_submitted',
      score: null,
      submittedAt: null,
      feedback: 'Chưa nộp bài'
    };
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Bộ lọc chuyển đổi Đề Kiểm Tra / Bài Tập Về Nhà */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActiveSubTab('exams');
              setSelectedItem(availableExams[0]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 ${
              activeSubTab === 'exams'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>📝</span>
            <span>Đề Kiểm Tra Định Kỳ ({availableExams.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('assignments');
              setSelectedItem(availableAssignments[0]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 ${
              activeSubTab === 'assignments'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>📚</span>
            <span>Bài Tập Về Nhà ({availableAssignments.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-slate-600">Đang theo dõi lớp:</span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg font-black">
            {currentSheet?.className || 'Lớp 6A (Chính)'}
          </span>
        </div>
      </div>

      {/* 2. Danh sách các đề thi / bài tập đang được giao */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CỘT TRÁI: DANH SÁCH BÀI GIAO */}
        <div className="lg:col-span-1 space-y-2.5">
          <div className="text-xs font-black text-slate-700 uppercase tracking-wider px-1">
            {activeSubTab === 'exams' ? 'Danh sách Đề Thi đã giao' : 'Danh sách Bài Tập đã giao'}
          </div>

          {(activeSubTab === 'exams' ? availableExams : availableAssignments).map((item) => {
            const isSelected = (selectedItem?.id || (activeSubTab === 'exams' ? availableExams[0]?.id : availableAssignments[0]?.id)) === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {activeSubTab === 'exams' ? `${item.durationMinutes || 45} phút` : item.skill}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-extrabold flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>LMS Tích hợp</span>
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 mt-2 line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between font-medium">
                  <span>Hạn: {item.deadline ? new Date(item.deadline).toLocaleDateString('vi-VN') : 'Không hạn'}</span>
                  <span className="font-bold text-emerald-800 flex items-center">
                    Xem tiến độ <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CỘT PHẢI: BẢNG TIẾN ĐỘ LÀM BÀI CỦA 21 HỌC SINH TRONG LỚP */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Tiến độ chi tiết lớp học
              </span>
              <h3 className="text-sm font-black text-slate-900">
                {currentViewItem?.title}
              </h3>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold">
                Sĩ số: {studentsInClass.length} học sinh
              </span>
            </div>
          </div>

          {/* Bảng danh sách nộp bài & Điểm */}
          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-2 text-center w-8">STT</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Học Sinh</th>
                  <th className="py-2.5 px-2 text-center min-w-[100px]">Trạng Thái</th>
                  <th className="py-2.5 px-2 text-center min-w-[80px]">Điểm Số</th>
                  <th className="py-2.5 px-2 text-left min-w-[140px]">Thời Gian Nộp</th>
                  <th className="py-2.5 px-2 text-center min-w-[80px]">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsInClass.map((st, idx) => {
                  const sub = getStudentSubmission(st.name);
                  const isSubmitted = sub.status === 'graded';
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2 px-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {st.name}
                        {st.phone && <span className="block text-[10px] text-slate-400 font-normal">{st.phone}</span>}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {isSubmitted ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã nộp bài</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3" />
                            <span>Chưa nộp</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {isSubmitted ? (
                          <span className={`px-2 py-0.5 rounded-md font-black text-xs ${
                            sub.score >= 8 ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {sub.score} / 10
                          </span>
                        ) : (
                          <span className="text-slate-300 font-semibold">—</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-slate-600 font-medium text-[11px]">
                        {sub.submittedAt || 'Chưa thực hiện'}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {isSubmitted ? (
                          <button
                            onClick={() => alert(`Xem chi tiết bài làm của học sinh: ${st.name}\nĐiểm: ${sub.score}\nNhận xét: ${sub.feedback}`)}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded font-bold text-[10px] transition"
                          >
                            Xem bài
                          </button>
                        ) : (
                          <button
                            onClick={() => alert(`Đã gửi tin nhắn Zalo nhắc nhở em ${st.name} (SĐT: ${st.phone}) hoàn thành bài tập!`)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded font-bold text-[10px] transition"
                            title="Gửi tin nhắn nhắc nhở"
                          >
                            Nhắc nộp
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
