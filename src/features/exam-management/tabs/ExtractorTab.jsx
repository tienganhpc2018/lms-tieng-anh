import React, { useState } from 'react';
import { Sparkles, FileText, Upload, CheckCircle2, ArrowRight, Copy } from 'lucide-react';
import { SEED_EXAMS } from '../examStorage';

export default function ExtractorTab({ onExamCreated }) {
  const [rawText, setRawText] = useState(`PART I. LISTENING
Task 1: Listen to Tom talking about his leisure activities. Decide if each statement is True (T) or False (F).
1. Tom spends most of his free time playing football with friends.
2. He prefers playing outdoor games to spending time on computers.

PART II. LANGUAGE FOCUS
Choose the best answer A, B, C, or D:
9. She dislikes ______ in front of a computer screen all day.
A. sit  B. sitting  C. to sit  D. sat
Đáp án: B. sitting`);

  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedExam, setExtractedExam] = useState(null);

  const handleExtract = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Giả lập trích xuất AI thông minh chuẩn 5 phần
      const generated = {
        ...SEED_EXAMS[0],
        id: `exam-ai-${Date.now()}`,
        title: 'ĐỀ KIỂM TRA ĐỊNH KỲ TIẾNG ANH 8 (TRÍCH XUẤT TỪ TÀI LIỆU AI)',
        code: `AI-ENG8-${Math.floor(Math.random() * 900 + 100)}`,
        status: 'draft',
        createdAt: new Date().toISOString()
      };
      setExtractedExam(generated);
      setIsProcessing(false);
    }, 1200);
  };

  const handleSaveToBank = () => {
    if (!extractedExam) return;
    if (onExamCreated) {
      onExamCreated(extractedExam);
    }
    alert('Đã lưu đề thi được trích xuất thành công vào kho đề!');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
            ✨
          </span>
          <h2 className="text-lg font-black text-slate-800">Trích Xuất Đề Thi Thông Minh (AI Material Extractor)</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Dán nội dung đề thi từ Word/PDF hoặc sách bài tập, hệ thống tự động bóc tách thành chuẩn ma trận 5 phần (Listening, Language Focus, Reading, Communication, Writing).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Raw text input (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 text-xs font-bold text-slate-700">
            <span>Dán nội dung văn bản thô (Word / PDF / SGK):</span>
            <button
              onClick={() => {
                setRawText(`PART I. LISTENING
Task 1: Listen and decide True or False...
PART II. LANGUAGE FOCUS
Question 9: They enjoy ______ (play/playing)...`);
              }}
              className="text-emerald-700 hover:underline"
            >
              Tải mẫu thử
            </button>
          </div>

          <textarea
            rows={12}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="w-full flex-1 p-3.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none leading-relaxed"
            placeholder="Dán nội dung đề thi vào đây..."
          ></textarea>

          <button
            onClick={handleExtract}
            disabled={isProcessing || !rawText.trim()}
            className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Đang phân tích cấu trúc 5 phần ma trận...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Bắt đầu trích xuất AI sang đề chuẩn GDPT 2018</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Kết quả trích xuất (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-700">Kết quả cấu trúc đề 5 phần:</span>
              {extractedExam && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Thành công 40 câu hỏi
                </span>
              )}
            </div>

            {extractedExam ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-extrabold text-slate-800 text-sm">{extractedExam.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Mã đề: <b>{extractedExam.code}</b> • Thời lượng: {extractedExam.durationMinutes} phút
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                    <span className="font-bold text-emerald-900">1. Listening</span>
                    <span className="text-slate-600 font-semibold">8 câu (Task 1 & Task 2)</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-teal-200 bg-teal-50/50 flex items-center justify-between">
                    <span className="font-bold text-teal-900">2. Language Focus</span>
                    <span className="text-slate-600 font-semibold">10 câu A, B, C, D</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-cyan-200 bg-cyan-50/50 flex items-center justify-between">
                    <span className="font-bold text-cyan-900">3. Reading</span>
                    <span className="text-slate-600 font-semibold">10 câu (Cloze + Comprehension)</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/50 flex items-center justify-between">
                    <span className="font-bold text-indigo-900">4. Communication</span>
                    <span className="text-slate-600 font-semibold">4 câu giao tiếp thực tế</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/50 flex items-center justify-between">
                    <span className="font-bold text-rose-900">5. Writing</span>
                    <span className="text-slate-600 font-semibold">8 câu + Đoạn văn tự luận</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs">
                Dán văn bản thô ở khung bên trái và bấm nút trích xuất để xem kết quả tại đây.
              </div>
            )}
          </div>

          {extractedExam && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={handleSaveToBank}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>1-Click Lưu vào Kho Đề Giáo Viên</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
