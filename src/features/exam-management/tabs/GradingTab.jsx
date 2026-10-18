import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Award,
  Edit2,
  Save,
  Filter,
  Sparkles,
  MessageSquare,
  Search,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCorrect } from '../../../utils/soundEffects';

export default function GradingTab({ submissions = [], onUpdateSubmission }) {
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'pending' | 'graded'
  const [selectedSubmission, setSelectedSubmission] = useState(submissions[0] || null);

  // Grading form state
  const [writingScore, setWritingScore] = useState(selectedSubmission?.writingScore || 1.8);
  const [feedback, setFeedback] = useState(selectedSubmission?.feedback || 'Bài làm rất tốt, phần viết câu ngữ pháp chuẩn xác!');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  const filteredList = submissions.filter((s) => {
    if (filterClass !== 'ALL' && s.className !== filterClass) return false;
    if (filterStatus === 'pending' && s.status !== 'pending_grading') return false;
    if (filterStatus === 'graded' && s.status !== 'graded') return false;
    return true;
  });

  const handleSelectSubmission = (sub) => {
    setSelectedSubmission(sub);
    setWritingScore(sub.writingScore ?? 1.8);
    setFeedback(sub.feedback ?? 'Bài làm tốt, chữ viết rõ ràng, đúng ngữ pháp.');
    setIsSavedSuccess(false);
  };

  const handleSaveGrading = (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const wScore = Math.min(2.0, Math.max(0, Number(writingScore) || 0));
    const calculatedFinal = Math.round(((selectedSubmission.mcqScore || 0) + wScore) * 10) / 10;

    const updated = {
      ...selectedSubmission,
      writingScore: wScore,
      finalScore: calculatedFinal,
      feedback: feedback.trim(),
      status: 'graded',
      gradedAt: new Date().toISOString()
    };

    if (onUpdateSubmission) {
      onUpdateSubmission(updated);
    }
    setSelectedSubmission(updated);
    setIsSavedSuccess(true);

    // Kích hoạt pháo hoa chúc mừng nếu đạt điểm giỏi (>= 8.0)
    if (calculatedFinal >= 8.0) {
      try {
        playCorrect();
      } catch (e) {}
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }

    setTimeout(() => setIsSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              ✍️
            </span>
            <h2 className="text-lg font-black text-slate-800">Không Gian Chấm Bài Trực Tuyến</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Trắc nghiệm tự động chấm 100% • Giáo viên Thầy Nguyễn Văn Hải chấm duyệt tự luận (Writing) và gửi lời nhận xét
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 text-xs">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="ALL">Tất cả các lớp</option>
            <option value="8A1">Lớp 8A1</option>
            <option value="8A2">Lớp 8A2</option>
            <option value="8A3">Lớp 8A3</option>
            <option value="8A4">Lớp 8A4</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="ALL">Tất cả bài</option>
            <option value="pending">⏳ Chờ chấm tự luận</option>
            <option value="graded">✅ Đã chấm xong</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Danh sách bài nộp (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs max-h-[700px] overflow-y-auto space-y-2">
          <div className="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 mb-2 flex items-center justify-between">
            <span>Danh sách bài nộp ({filteredList.length})</span>
          </div>

          {filteredList.map((sub) => {
            const isSelected = selectedSubmission?.id === sub.id;
            const isGraded = sub.status === 'graded';
            return (
              <div
                key={sub.id}
                onClick={() => handleSelectSubmission(sub)}
                className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-2xs font-bold'
                    : 'border-slate-100 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-slate-900 text-sm">{sub.studentName}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isGraded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isGraded ? `Đã chấm (${sub.finalScore}đ)` : 'Chờ chấm'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Lớp: <b className="text-slate-700">{sub.className}</b> • {sub.examCode || 'ENG8'}
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                  <span>Trắc nghiệm: {sub.mcqScore}đ</span>
                  <span>{new Date(sub.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Khu vực chấm bài chi tiết (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedSubmission ? (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              {/* Header bài làm */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Bài thi: {selectedSubmission.examTitle}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    Học sinh: {selectedSubmission.studentName} ({selectedSubmission.className})
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Thời gian nộp: {new Date(selectedSubmission.submittedAt).toLocaleString('vi-VN')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400 font-bold uppercase">Tổng điểm hiện tại</div>
                  <div className="text-2xl font-black text-emerald-700">
                    {selectedSubmission.finalScore ?? selectedSubmission.mcqScore} / 10đ
                  </div>
                </div>
              </div>

              {isSavedSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Đã lưu và công bố điểm cho học sinh {selectedSubmission.studentName} thành công! 🎉</span>
                </div>
              )}

              {/* Phần 1: Điểm trắc nghiệm (Hệ thống tự động chấm) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-800 text-sm flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>I. Kết quả trắc nghiệm tự động (Listening, Language, Reading, Communication)</span>
                  </span>
                  <span className="font-black text-emerald-700 text-sm bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {selectedSubmission.mcqScore} / 8.0 điểm
                  </span>
                </div>
                <p className="text-slate-500">
                  Hệ thống đã tự động chấm 32 câu hỏi trắc nghiệm và đối chiếu đáp án chuẩn.
                </p>
              </div>

              {/* Phần 2: Bài làm tự luận của học sinh (Writing) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-black text-slate-800 text-sm flex items-center space-x-1.5">
                    <span>✍️</span>
                    <span>II. Bài làm Tự luận (Part V. Writing) của học sinh</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-rose-600">Thang điểm: 2.0 điểm</span>
                </div>

                {/* Danh sách câu viết */}
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-700">Câu 33 (Sắp xếp từ):</div>
                    <div className="text-slate-500 italic mt-0.5">
                      Gợi ý: It / take / him / 30 minutes / walk / school / everyday.
                    </div>
                    <div className="mt-2 p-2 bg-white rounded border border-slate-200 font-semibold text-slate-900">
                      📝 Bài làm của HS: {selectedSubmission.answers?.q33 || 'It takes him 30 minutes to walk to school everyday.'}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-1">
                      ✅ Đáp án chuẩn: It takes him 30 minutes to walk to school everyday.
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-700">Câu 37 (Viết lại câu):</div>
                    <div className="text-slate-500 italic mt-0.5">
                      Gợi ý: Nam is very interested in playing football after school. (fond)
                    </div>
                    <div className="mt-2 p-2 bg-white rounded border border-slate-200 font-semibold text-slate-900">
                      📝 Bài làm của HS: {selectedSubmission.answers?.q37 || 'Nam is fond of playing football after school.'}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-1">
                      ✅ Đáp án chuẩn: Nam is fond of playing football after school.
                    </div>
                  </div>

                  {selectedSubmission.answers?.paragraph && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-700">Đoạn văn ngắn (Paragraph):</div>
                      <div className="mt-2 p-2.5 bg-white rounded border border-slate-200 font-medium text-slate-800 leading-relaxed">
                        {selectedSubmission.answers?.paragraph}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Giáo viên cho điểm & Nhận xét */}
              <form onSubmit={handleSaveGrading} className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-3">
                <div className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Thầy Nguyễn Văn Hải cho điểm & Viết nhận xét</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Điểm tự luận (Tối đa 2.0đ):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2.0"
                      value={writingScore}
                      onChange={(e) => setWritingScore(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lời nhận xét của Thầy:
                    </label>
                    <input
                      type="text"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Nhận xét ưu điểm và nhắc nhở học sinh..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-bold">
                    Tổng điểm sau duyệt: <span className="text-emerald-700 text-sm font-black">{Math.round(((selectedSubmission.mcqScore || 0) + Number(writingScore)) * 10) / 10} / 10đ</span>
                  </span>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition flex items-center space-x-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu & Công bố điểm</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
              Chọn một bài nộp ở cột bên trái để bắt đầu chấm bài.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
