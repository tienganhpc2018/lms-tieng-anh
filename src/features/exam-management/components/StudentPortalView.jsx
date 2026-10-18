import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Clock,
  Award,
  Sparkles,
  Play,
  CheckCircle2,
  Calendar,
  Flame,
  Star,
  Trophy,
  ArrowRight,
  Gift
} from 'lucide-react';
import StudentExamModal from './StudentExamModal';

export default function StudentPortalView({
  exams = [],
  submissions = [],
  onSwitchToTeacher,
  onExamSubmitted
}) {
  const [studentTab, setStudentTab] = useState('assignments'); // 'home' | 'lessons' | 'assignments' | 'tests' | 'gamification'
  const [activeExamToTake, setActiveExamToTake] = useState(null);

  // Lọc các đề thi đã mở cho lớp 8A1
  const assignedExamsFor8A1 = exams.filter(
    (e) => e.status === 'published' && (!e.assignedClass || e.assignedClass.includes('8A1') || e.assignedClass === 'Tất cả')
  );

  return (
    <div className="space-y-6">
      {/* Role Switcher Indicator Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-bold">
            👩‍🎓
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20">
                Giao diện học sinh thử nghiệm
              </span>
              <span className="text-xs font-bold">Lớp 8A1 • THCS Global Success</span>
            </div>
            <h2 className="text-base font-black">Minh Hằng (HS8-001)</h2>
          </div>
        </div>

        <button
          onClick={onSwitchToTeacher}
          className="px-4 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-md hover:bg-amber-50 transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>👨‍🏫</span>
          <span>Chuyển về Giáo viên (Thầy Nguyễn Văn Hải)</span>
        </button>
      </div>

      {/* 5 Thanh Điều Hướng Dành Cho Học Sinh */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1.5 sm:gap-2">
        {[
          { id: 'home', label: '1. Trang chủ (Home)', icon: '🏠' },
          { id: 'lessons', label: '2. Bài học (Lessons)', icon: '📖' },
          { id: 'assignments', label: '3. Bài tập (Assignments)', icon: '📝' },
          { id: 'tests', label: '4. Kiểm tra (Tests)', icon: '⏱️' },
          { id: 'gamification', label: '5. Khu vui chơi (Gamification)', icon: '🎮' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStudentTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center space-x-2 ${
              studentTab === tab.id
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-transparent text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================
          TAB 1: TRANG CHỦ (Home)
      ======================================================== */}
      {studentTab === 'home' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                  ⭐
                </div>
                <div>
                  <div className="text-xl font-black text-slate-800">450 Sao</div>
                  <div className="text-xs text-slate-500 font-semibold">Tích lũy học tập</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                  🔥
                </div>
                <div>
                  <div className="text-xl font-black text-slate-800">12 Ngày</div>
                  <div className="text-xs text-slate-500 font-semibold">Chuỗi ngày học liên tục (Streak)</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                  🏆
                </div>
                <div>
                  <div className="text-xl font-black text-slate-800">Hạng #3</div>
                  <div className="text-xs text-slate-500 font-semibold">Thi đua Lớp 8A1</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-black text-slate-800 text-sm mb-3">Thông báo từ Thầy Nguyễn Văn Hải</h3>
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">🔔 Bài kiểm tra định kỳ đã mở!</div>
              <p>Các em vào mục "Bài tập" hoặc "Kiểm tra" để làm bài kiểm tra 45 phút nhé. Nhớ chuẩn bị tai nghe cho phần Nghe.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: BÀI HỌC (Lessons)
      ======================================================== */}
      {studentTab === 'lessons' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-800">Chương trình Tiếng Anh 8 (Global Success)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { id: 1, title: 'Unit 1: Leisure Time', status: 'Đã hoàn thành 100%' },
              { id: 2, title: 'Unit 2: Life in the Countryside', status: 'Đang học (80%)' },
              { id: 3, title: 'Unit 3: Teenagers', status: 'Sắp tới' },
              { id: 4, title: 'Unit 4: Ethnic Groups of Viet Nam', status: 'Sắp tới' }
            ].map((u) => (
              <div key={u.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{u.title}</div>
                  <div className="text-emerald-700 font-bold text-[11px] mt-0.5">{u.status}</div>
                </div>
                <button
                  onClick={() => alert(`Mở bài học ${u.title}`)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                >
                  Học ngay
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: BÀI TẬP (Assignments - CÓ NHÃN [ĐỀ KIỂM TRA])
      ======================================================== */}
      {studentTab === 'assignments' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-800">Danh Sách Bài Tập Do Thầy Giao Cho Lớp 8A1</h3>
              <p className="text-xs text-slate-500">Các bài tập tự luyện và các Đề kiểm tra trực tuyến cần hoàn thành</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              {assignedExamsFor8A1.length} Đề kiểm tra đang mở
            </span>
          </div>

          <div className="space-y-3">
            {/* Đề Kiểm Tra có gắn nhãn [ĐỀ KIỂM TRA] rõ ràng */}
            {assignedExamsFor8A1.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border-2 border-emerald-500/80 shadow-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-xs">
                      [ĐỀ KIỂM TRA]
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-200">
                      {exam.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                      ⏱️ 45 phút • 10 điểm
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                    {exam.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hạn nộp: <b className="text-slate-800">{exam.deadline || '23:59'}</b></span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>Giáo viên ra đề: <b className="text-emerald-800">Thầy Nguyễn Văn Hải</b></span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-600 font-bold">5 Phần chuẩn GDPT 2018</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveExamToTake(exam)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 shrink-0 animate-pulse hover:animate-none"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Bắt đầu làm bài thi ngay</span>
                </button>
              </div>
            ))}

            {/* Bài tập tự luyện thường */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-xs">
                    Bài tập kỹ năng
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Listening & Speaking Unit 1</span>
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">
                  Luyện nghe đoạn hội thoại về các hoạt động thể thao ngoài trời
                </h4>
                <div className="text-xs text-slate-500">Hạn nộp: 22:00 ngày mai • Thưởng +50 Sao</div>
              </div>
              <button
                onClick={() => alert('Mở bài tập luyện nghe thường')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
              >
                Làm bài tự luyện
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: KIỂM TRA (Tests)
      ======================================================== */}
      {studentTab === 'tests' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-800">Khu Vực Thi & Kiểm Tra Định Kỳ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/40 space-y-2">
              <div className="font-extrabold text-slate-900 text-sm">Kiểm tra Giữa kì I (45 phút)</div>
              <div className="text-slate-600">Bao gồm 5 phần chuẩn: Listening, Language Focus, Reading, Communication, Writing.</div>
              <button
                onClick={() => setActiveExamToTake(assignedExamsFor8A1[0] || exams[0])}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
              >
                Vào phòng thi 45 phút
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="font-extrabold text-slate-900 text-sm">Kiểm tra 15 phút thường xuyên</div>
              <div className="text-slate-600">Trắc nghiệm nhanh từ vựng và ngữ pháp Unit 1 & Unit 2.</div>
              <button
                onClick={() => alert('Bắt đầu bài kiểm tra 15 phút')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition"
              >
                Vào kiểm tra 15 phút
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: GAMIFICATION (Khu vui chơi)
      ======================================================== */}
      {studentTab === 'gamification' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-black text-slate-800">Khu Vui Chơi & Đổi Quà (Gamification)</h3>
            <p className="text-xs text-slate-500">Dùng số sao tích lũy sau mỗi bài kiểm tra để quay thưởng và đổi huy hiệu</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-center space-y-2">
              <div className="text-3xl">🎡</div>
              <div className="font-black text-slate-900 text-sm">Vòng Quay May Mắn</div>
              <div className="text-xs text-slate-600">50 sao / lượt quay</div>
              <button
                onClick={() => alert('Chúc mừng Minh Hằng đã trúng +20 Sao thưởng!')}
                className="w-full py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition"
              >
                Quay ngay
              </button>
            </div>

            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 text-center space-y-2">
              <div className="text-3xl">🏅</div>
              <div className="font-black text-slate-900 text-sm">Bảng Huy Hiệu</div>
              <div className="text-xs text-slate-600">Đã mở khóa 8/12 huy hiệu</div>
              <button
                onClick={() => alert('Xem bộ sưu tập huy hiệu')}
                className="w-full py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition"
              >
                Xem huy hiệu
              </button>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-center space-y-2">
              <div className="text-3xl">🎁</div>
              <div className="font-black text-slate-900 text-sm">Cửa Hàng Quà 4.0</div>
              <div className="text-xs text-slate-600">Đổi thẻ quà tặng và sticker</div>
              <button
                onClick={() => alert('Mở cửa hàng đổi quà')}
                className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
              >
                Vào cửa hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Làm bài thi trực tuyến của học sinh */}
      {activeExamToTake && (
        <StudentExamModal
          exam={activeExamToTake}
          student={{ id: 'HS8-001', name: 'Minh Hằng', className: '8A1' }}
          onClose={() => setActiveExamToTake(null)}
          onSubmitSuccess={(sub) => {
            if (onExamSubmitted) {
              onExamSubmitted(sub);
            }
          }}
        />
      )}
    </div>
  );
}
