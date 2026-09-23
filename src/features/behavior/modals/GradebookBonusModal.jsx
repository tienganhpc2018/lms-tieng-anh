import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Award,
  Check,
  Sparkles,
  Printer,
  Copy,
  Send,
  Zap,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  loadClassGrades,
  saveClassGrades,
  applyStudentKttxBonus,
} from '../behaviorStorage';
import { playClick, playCorrect, playWinner, playDeduct } from '../../../utils/soundEffects';

export default function GradebookBonusModal({
  isOpen,
  onClose,
  classId,
  classNameTitle = '',
  students = [],
  onUpdateStudents,
}) {
  const [examTitle, setExamTitle] = useState('Kiểm Tra Thường Xuyên 15P - Unit 3');
  const [grades, setGrades] = useState({});
  const [toastMsg, setToastMsg] = useState('');
  const [copiedZalo, setCopiedZalo] = useState(false);

  useEffect(() => {
    if (isOpen && classId) {
      const stored = loadClassGrades(classId);
      // Khởi tạo điểm mặc định cho những em chưa có điểm trong bảng
      const initialized = { ...stored };
      students.forEach((s) => {
        if (!initialized[s.id]) {
          initialized[s.id] = {
            baseScore: 8.0,
            bonusAdded: 0,
            finalScore: 8.0,
            appliedHistory: [],
          };
        }
      });
      setGrades(initialized);
    }
  }, [isOpen, classId, students]);

  if (!isOpen) return null;

  // Cập nhật điểm bài thi gốc của 1 học sinh
  const handleBaseScoreChange = (studentId, val) => {
    const num = Math.min(10, Math.max(0, parseFloat(val) || 0));
    const current = grades[studentId] || { bonusAdded: 0 };
    const bonus = current.bonusAdded || 0;
    const finalScore = Math.min(10.0, Number((num + bonus).toFixed(1)));

    const updated = {
      ...grades,
      [studentId]: {
        ...current,
        baseScore: num,
        finalScore,
      },
    };
    setGrades(updated);
    saveClassGrades(classId, updated);
  };

  // Áp dụng điểm thưởng cho 1 học sinh
  const handleApplySingleBonus = (student) => {
    playWinner();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    const bonusAmount = student.kttx_bonus || 0;
    const res = applyStudentKttxBonus(classId, student.id, bonusAmount, examTitle);
    if (res?.success) {
      setGrades((prev) => ({
        ...prev,
        [student.id]: res.gradeRecord,
      }));

      // Cập nhật state học sinh ở ngoài trang chính
      const updatedStudentsList = students.map((s) =>
        s.id === student.id ? res.updatedStudent : s
      );
      onUpdateStudents(updatedStudentsList);

      setToastMsg(`🎉 Đã cộng +${res.bonusApplied}đ thưởng nề nếp cho em ${student.full_name}! (Điểm mới: ${res.newScore}đ)`);
      setTimeout(() => setToastMsg(''), 3000);
    } else {
      playDeduct();
      alert(res?.message || 'Không thể áp dụng điểm lúc này!');
    }
  };

  // Áp dụng điểm thưởng cho TOÀN BỘ HỌC SINH trong lớp có điểm thưởng
  const handleApplyAllBonus = () => {
    playClick();
    const eligibleCount = students.filter((s) => (s.kttx_bonus || 0) > 0).length;
    if (eligibleCount === 0) {
      alert('Hiện không có học sinh nào trong lớp có Điểm thưởng KTTX khả dụng để cộng!');
      return;
    }

    if (window.confirm(`Thầy/Cô có chắc chắn muốn TỰ ĐỘNG CỘNG ĐIỂM THƯỞNG cho tất cả ${eligibleCount} học sinh có điểm thưởng KTTX không?`)) {
      playWinner();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
      });

      let latestStudents = [...students];
      let updatedGrades = { ...grades };

      students.forEach((st) => {
        if ((st.kttx_bonus || 0) > 0) {
          const res = applyStudentKttxBonus(classId, st.id, st.kttx_bonus, examTitle);
          if (res?.success) {
            updatedGrades[st.id] = res.gradeRecord;
            latestStudents = latestStudents.map((s) => (s.id === st.id ? res.updatedStudent : s));
          }
        }
      });

      setGrades(updatedGrades);
      onUpdateStudents(latestStudents);

      setToastMsg(`🚀 Đã cộng điểm thưởng KTTX thành công cho toàn bộ ${eligibleCount} học sinh!`);
      setTimeout(() => setToastMsg(''), 3500);
    }
  };

  // Sao chép tin nhắn Zalo thông báo điểm KTTX sau khi cộng thưởng
  const handleCopyZaloGrades = () => {
    playCorrect();
    let text = `📢 [BẢNG ĐIỂM KIỂM TRA THƯỜNG XUYÊN (KTTX) SAU KHI CỘNG THƯỞNG NỀ NẾP]
🏛️ Lớp: ${classNameTitle}
📝 Bài kiểm tra: ${examTitle}
📅 Ngày áp dụng: ${new Date().toLocaleDateString('vi-VN')}

DANH SÁCH HỌC SINH NHẬN ĐIỂM CỘNG KHEN THƯỞNG:`;

    students.forEach((st, idx) => {
      const g = grades[st.id] || { baseScore: 8.0, bonusAdded: 0, finalScore: 8.0 };
      if (g.bonusAdded > 0) {
        text += `\n${idx + 1}. ${st.full_name} (${st.code}): Điểm gốc ${g.baseScore}đ + Thưởng nề nếp ${g.bonusAdded}đ ➔ ĐIỂM TỔNG: ${g.finalScore} / 10đ`;
      }
    });

    text += `\n\nThầy/Cô tuyên dương các em đã có tinh thần rèn luyện nề nếp tích cực để gặt hái kết quả học tập xuất sắc!`;

    navigator.clipboard.writeText(text);
    setCopiedZalo(true);
    setTimeout(() => setCopiedZalo(false), 2500);
  };

  const handlePrint = () => {
    playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-4 my-auto max-h-[94vh] flex flex-col print:shadow-none print:border-none print:max-h-none print:p-2">
        {/* HEADER MODAL (ẨN KHI IN) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md text-lg">
              📊
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Sổ Điểm Điện Tử LMS & Áp Dụng Điểm Thưởng KTTX
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Cộng trực tiếp điểm thưởng nề nếp vào bài kiểm tra 15 phút của học sinh {classNameTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In Bảng Điểm</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST THÔNG BÁO */}
        {toastMsg && (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fade-in flex items-center space-x-2 print:hidden">
            <span>{toastMsg}</span>
          </div>
        )}

        {/* THANH CÔNG CỤ NHẬP TÊN BÀI THI & NÚT ÁP DỤNG ĐỒNG LOẠT (ẨN KHI IN) */}
        <div className="bg-blue-50/70 border border-blue-200 p-3 sm:p-4 rounded-2xl space-y-3 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Cột Điểm / Tên Bài Kiểm Tra Thường Xuyên:</span>
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="Ví dụ: Kiểm Tra 15P Số 1, Bài Đánh Giá Thường Xuyên..."
                className="w-full px-3.5 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto pt-1">
              <button
                type="button"
                onClick={handleApplyAllBonus}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 transform hover:scale-102"
                title="Cộng điểm thưởng tự động cho toàn bộ học sinh có điểm thưởng nề nếp"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Áp Dụng Cho CẢ LỚP</span>
              </button>

              <button
                type="button"
                onClick={handleCopyZaloGrades}
                className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5"
              >
                {copiedZalo ? <Check className="w-4 h-4 text-emerald-300" /> : <Send className="w-4 h-4" />}
                <span>{copiedZalo ? 'Đã Copy!' : 'Gửi Zalo'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* HEADER DÀNH CHO BẢN IN A4 */}
        <div className="hidden print:flex items-start justify-between border-b-2 border-slate-900 pb-3 mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">TRƯỜNG THCS & THPT VIỆT NAM</div>
            <div className="text-sm font-black text-slate-900">SỔ ĐIỂM ĐIỆN TỬ LMS - BÀI KIỂM TRA THƯỜNG XUYÊN</div>
            <div className="text-xs font-bold text-slate-700 mt-1">Lớp: {classNameTitle} • Bài: {examTitle}</div>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div className="text-[10px] text-slate-600 italic">Độc lập - Tự do - Hạnh phúc</div>
            <div className="text-[10px] text-slate-500 mt-1">Ngày in: {new Date().toLocaleDateString('vi-VN')}</div>
          </div>
        </div>

        {/* BẢNG DANH SÁCH HỌC SINH & ĐIỂM SỐ */}
        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px] sticky top-0 z-10 shadow-2xs">
              <tr>
                <th className="p-3 text-center w-12">STT</th>
                <th className="p-3">Họ và Tên Học Sinh</th>
                <th className="p-3 text-center w-28">Điểm Bài Thi Gốc</th>
                <th className="p-3 text-center w-28 text-blue-700">Thưởng Nề Nếp</th>
                <th className="p-3 text-center w-32 font-black text-emerald-700">Điểm KTTX Cuối</th>
                <th className="p-3 text-center w-32 print:hidden">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st, idx) => {
                const g = grades[st.id] || { baseScore: 8.0, bonusAdded: 0, finalScore: 8.0 };
                const availableBonus = st.kttx_bonus || 0;
                const hasApplied = (g.bonusAdded || 0) > 0;

                return (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">
                      <div className="flex items-center space-x-2.5">
                        <img src={st.avatar} alt={st.full_name} className="w-7 h-7 rounded-full bg-slate-100 p-0.5 border border-slate-200" />
                        <div>
                          <span>{st.full_name}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">Mã: {st.code} • Tổ {st.team_group}</span>
                        </div>
                      </div>
                    </td>

                    {/* Ô NHẬP ĐIỂM BÀI THI GỐC */}
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={g.baseScore ?? 8.0}
                        onChange={(e) => handleBaseScoreChange(st.id, e.target.value)}
                        className="w-16 text-center font-black text-xs py-1 px-1.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white shadow-2xs"
                      />
                    </td>

                    {/* ĐIỂM THƯỞNG NỀ NẾP KHẢ DỤNG */}
                    <td className="p-3 text-center font-black">
                      {availableBonus > 0 ? (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs border border-blue-200 shadow-2xs inline-flex items-center space-x-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>+{availableBonus}đ</span>
                        </span>
                      ) : (
                        <span className="text-slate-300 font-medium">—</span>
                      )}
                    </td>

                    {/* ĐIỂM KTTX CUỐI CÙNG SAU KHI CỘNG */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center space-x-1 font-black text-sm">
                        <span className={`px-2.5 py-1 rounded-xl ${hasApplied ? 'bg-emerald-100 text-emerald-800 font-black border border-emerald-300 shadow-xs' : 'text-slate-800'}`}>
                          {g.finalScore ?? g.baseScore} / 10
                        </span>
                        {hasApplied && (
                          <span className="text-[10px] font-bold text-emerald-600" title={`Đã cộng +${g.bonusAdded}đ thưởng`}>
                            (+{g.bonusAdded})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* NÚT THAO TÁC CỘNG ĐIỂM */}
                    <td className="p-3 text-center print:hidden">
                      <button
                        type="button"
                        onClick={() => handleApplySingleBonus(st)}
                        disabled={availableBonus <= 0}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center space-x-1 mx-auto shadow-2xs ${
                          availableBonus > 0
                            ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Cộng +{availableBonus}đ</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CHỮ KÝ TRANG IN A4 */}
        <div className="hidden print:grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-300 text-center text-xs">
          <div>
            <span className="font-bold text-slate-800 block">XÁC NHẬN BAN GIÁM HIỆU / TỔ TRƯỞNG</span>
            <span className="text-[10px] text-slate-500 italic block mt-0.5">(Ký và ghi rõ họ tên)</span>
            <div className="h-16" />
          </div>
          <div>
            <span className="font-bold text-slate-800 block">GIÁO VIÊN BỘ MÔN CHẤM ĐIỂM</span>
            <span className="text-[10px] text-slate-500 italic block mt-0.5">(Ký và ghi rõ họ tên)</span>
            <div className="h-16" />
            <span className="font-bold text-slate-900">Nguyễn Văn Hải</span>
          </div>
        </div>
      </div>
    </div>
  );
}
