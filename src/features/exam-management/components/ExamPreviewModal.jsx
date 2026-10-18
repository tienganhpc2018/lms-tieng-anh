import React, { useState } from 'react';
import { X, Clock, Award, FileText, CheckCircle2, Volume2, HelpCircle, Eye, Printer } from 'lucide-react';
import AudioPlayerMini from './AudioPlayerMini';

export default function ExamPreviewModal({ exam, onClose, onAssign }) {
  const [showAnswers, setShowAnswers] = useState(true);

  if (!exam) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg border border-white/20">
              👁️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                  Xem Trước Đề Chuẩn GDPT 2018
                </span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
                  {exam.code || 'ENG8-MT1'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-0.5 line-clamp-1">{exam.title}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                showAnswers
                  ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="Bật/tắt hiển thị đáp án và lời giải chi tiết"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showAnswers ? 'Ẩn đáp án' : 'Hiện đáp án & lời giải'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/25 flex items-center justify-center transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Exam Quick Specs Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 shrink-0">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 font-semibold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{exam.durationMinutes || 45} phút</span>
            </span>
            <span className="flex items-center space-x-1 font-semibold text-slate-700">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{exam.totalPoints || 10} điểm (40 câu)</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-500">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Ma trận 5 phần chuẩn</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onAssign && (
              <button
                onClick={() => {
                  onClose();
                  onAssign(exam);
                }}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1"
              >
                <span>📋</span>
                <span>Giao cho lớp ngay</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm">
          {/* PHẦN 1: LISTENING */}
          <section className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <h3 className="font-black text-slate-800 text-base flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">1</span>
                <span>PART I. LISTENING (2.0 pts)</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">8 câu • 2.0 điểm</span>
            </div>

            {/* Task 1 */}
            <div className="mb-5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700 text-xs">Task 1: Listen and choose True (T) or False (F)</span>
                <span className="text-[11px] text-slate-500">(Nghe 2 lần)</span>
              </div>
              <AudioPlayerMini
                src={exam.sections?.listening?.task1?.audioUrl}
                label="Audio Task 1 (Teens leisure activities)"
              />
              <div className="mt-3 space-y-2">
                {exam.sections?.listening?.task1?.questions?.map((q, idx) => (
                  <div key={q.id || idx} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-600 mr-2">Question {q.number || idx + 1}:</span>
                      <span className="text-slate-800">{q.prompt}</span>
                      {showAnswers && (
                        <div className="mt-1 text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                          <span>Đáp án đúng: {q.correctAnswer}</span>
                          {q.explanation && <span className="text-slate-500 font-normal">({q.explanation})</span>}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      [ T / F ]
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Task 2 */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700 text-xs">Task 2: Listen and fill in each blank with ONE word</span>
                <span className="text-[11px] text-slate-500">(Nghe 2 lần)</span>
              </div>
              <AudioPlayerMini
                src={exam.sections?.listening?.task2?.audioUrl}
                label="Audio Task 2 (Life in the countryside)"
              />
              <div className="mt-3 space-y-2">
                {exam.sections?.listening?.task2?.questions?.map((q, idx) => (
                  <div key={q.id || idx} className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-600 mr-2">Question {q.number || idx + 5}:</span>
                      <span className="text-slate-800">{q.prompt}</span>
                      {showAnswers && (
                        <div className="mt-1 text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                          <span>Đáp án đúng: <b className="text-emerald-800">{q.correctAnswer}</b></span>
                          {q.explanation && <span className="text-slate-500 font-normal">({q.explanation})</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PHẦN 2: LANGUAGE FOCUS */}
          <section className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <h3 className="font-black text-slate-800 text-base flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-xs">2</span>
                <span>PART II. LANGUAGE FOCUS (2.5 pts)</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">10 câu • 2.5 điểm</span>
            </div>

            <div className="space-y-3">
              {exam.sections?.languageFocus?.questions?.map((q, idx) => (
                <div key={q.id || idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="font-semibold text-slate-800 mb-2">
                    <span className="text-emerald-700 font-bold mr-1.5">Question {q.number || idx + 9}:</span>
                    {q.prompt}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options?.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      const isCorrect = showAnswers && letter === q.correctAnswer;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-md border flex items-center space-x-2 ${
                            isCorrect
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {letter}
                          </span>
                          <span>{opt}</span>
                          {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
                        </div>
                      );
                    })}
                  </div>
                  {showAnswers && q.explanation && (
                    <div className="mt-2 text-xs text-slate-500 bg-white p-2 rounded border border-slate-100">
                      💡 <b>Giải thích:</b> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* PHẦN 3: READING */}
          <section className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <h3 className="font-black text-slate-800 text-base flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center text-xs">3</span>
                <span>PART III. READING (2.5 pts)</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700">10 câu • 2.5 điểm</span>
            </div>

            {/* Reading Passage 1: Cloze test */}
            <div className="mb-4 bg-cyan-50/30 p-3.5 rounded-xl border border-cyan-100">
              <h4 className="font-bold text-slate-700 text-xs mb-2 uppercase tracking-wide">
                1. Đọc đoạn văn và chọn từ thích hợp điền vào chỗ trống
              </h4>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed text-xs italic mb-3">
                {exam.sections?.reading?.passage1?.text}
              </div>
              <div className="space-y-2">
                {exam.sections?.reading?.passage1?.questions?.map((q, idx) => (
                  <div key={q.id || idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                    <span className="font-bold text-cyan-800 mr-2">Question {q.number || idx + 19}:</span>
                    {q.options?.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      const isCorrect = showAnswers && letter === q.correctAnswer;
                      return (
                        <span
                          key={oIdx}
                          className={`mr-3 px-1.5 py-0.5 rounded ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300' : 'text-slate-600'
                          }`}
                        >
                          {letter}. {opt}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Reading Passage 2: Comprehension */}
            <div className="bg-cyan-50/30 p-3.5 rounded-xl border border-cyan-100">
              <h4 className="font-bold text-slate-700 text-xs mb-2 uppercase tracking-wide">
                2. Đọc đoạn văn và chọn câu trả lời đúng
              </h4>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed text-xs mb-3">
                {exam.sections?.reading?.passage2?.text}
              </div>
              <div className="space-y-2">
                {exam.sections?.reading?.passage2?.questions?.map((q, idx) => (
                  <div key={q.id || idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-800 mb-1.5">
                      <span className="font-bold text-cyan-800 mr-1.5">Question {q.number || idx + 24}:</span>
                      {q.prompt}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {q.options?.map((opt, oIdx) => {
                        const letter = String.fromCharCode(65 + oIdx);
                        const isCorrect = showAnswers && letter === q.correctAnswer;
                        return (
                          <div
                            key={oIdx}
                            className={`p-1.5 rounded border text-[11px] ${
                              isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <b>{letter}.</b> {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PHẦN 4: COMMUNICATION */}
          <section className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <h3 className="font-black text-slate-800 text-base flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs">4</span>
                <span>PART IV. EVERYDAY ENGLISH & COMMUNICATION (1.0 pt)</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">4 câu • 1.0 điểm</span>
            </div>

            <div className="space-y-2.5">
              {exam.sections?.communication?.questions?.map((q, idx) => (
                <div key={q.id || idx} className="p-3 bg-slate-50/70 rounded-lg border border-slate-200 text-xs">
                  <div className="font-semibold text-slate-800 mb-1.5">
                    <span className="font-bold text-indigo-700 mr-1.5">Question {q.number || idx + 29}:</span>
                    {q.prompt}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options?.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      const isCorrect = showAnswers && letter === q.correctAnswer;
                      return (
                        <div
                          key={oIdx}
                          className={`p-1.5 rounded border ${
                            isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <b>{letter}.</b> {opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PHẦN 5: WRITING */}
          <section className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <h3 className="font-black text-slate-800 text-base flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center text-xs">5</span>
                <span>PART V. WRITING (2.0 pts)</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">8 câu • 2.0 điểm</span>
            </div>

            {/* Task 1: Sentence Building */}
            <div className="mb-4 bg-rose-50/30 p-3.5 rounded-xl border border-rose-100">
              <h4 className="font-bold text-slate-700 text-xs mb-2 uppercase">
                Task 1: Sắp xếp / Dùng từ gợi ý viết thành câu hoàn chỉnh
              </h4>
              <div className="space-y-2.5">
                {exam.sections?.writing?.task1?.questions?.map((q, idx) => (
                  <div key={q.id || idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-800">
                      <span className="text-rose-700 font-bold mr-1.5">Question {q.number || idx + 33}:</span>
                      {q.prompt}
                    </div>
                    {showAnswers && (
                      <div className="mt-1.5 p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-900">
                        <b>Gợi ý đáp án:</b> {q.suggestedAnswer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Task 2: Sentence Transformation */}
            <div className="mb-4 bg-rose-50/30 p-3.5 rounded-xl border border-rose-100">
              <h4 className="font-bold text-slate-700 text-xs mb-2 uppercase">
                Task 2: Viết lại câu sao cho nghĩa không đổi
              </h4>
              <div className="space-y-2.5">
                {exam.sections?.writing?.task2?.questions?.map((q, idx) => (
                  <div key={q.id || idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-800">
                      <span className="text-rose-700 font-bold mr-1.5">Question {q.number || idx + 37}:</span>
                      {q.prompt}
                    </div>
                    {showAnswers && (
                      <div className="mt-1.5 p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-900">
                        <b>Gợi ý đáp án:</b> {q.suggestedAnswer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Task 3: Paragraph Writing (Optional / In-depth) */}
            {exam.sections?.writing?.paragraph && (
              <div className="bg-rose-50/30 p-3.5 rounded-xl border border-rose-100">
                <h4 className="font-bold text-slate-700 text-xs mb-2 uppercase">
                  Task 3: Viết đoạn văn (80 - 100 từ)
                </h4>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 text-xs">
                  <div className="font-bold text-slate-800 mb-1">{exam.sections?.writing?.paragraph?.prompt}</div>
                  <div className="text-slate-500 mb-2"><b>Gợi ý:</b> {exam.sections?.writing?.paragraph?.guidance}</div>
                  {showAnswers && (
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 leading-relaxed">
                      <b>Bài viết mẫu tham khảo:</b>
                      <p className="mt-1">{exam.sections?.writing?.paragraph?.sampleParagraph}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Học liệu chuẩn Tiếng Anh 8 Global Success • Bộ Giáo Dục & Đào Tạo
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In đề thi</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition"
            >
              Đóng xem lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
