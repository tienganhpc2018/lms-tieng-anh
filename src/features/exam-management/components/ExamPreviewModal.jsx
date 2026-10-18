import React, { useState } from 'react';
import { X, Clock, Award, FileText, CheckCircle2, Volume2, HelpCircle, Eye, Printer } from 'lucide-react';
import AudioPlayerMini from './AudioPlayerMini';

export default function ExamPreviewModal({ exam, onClose, onAssign }) {
  const [showAnswers, setShowAnswers] = useState(true);

  if (!exam) return null;

  const listening = exam.sections?.listening || exam.listening || {};
  const languageFocus = exam.sections?.languageFocus || exam.language || {};
  const reading = exam.sections?.reading || exam.reading || {};
  const communication = exam.sections?.communication || exam.communication || [];
  const writing = exam.sections?.writing || exam.writing || {};

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
          {/* =================================================================
              PHẦN 1: LISTENING
          ================================================================== */}
          <section className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-black text-slate-800 text-base flex items-center space-x-2">
                <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">1</span>
                <span>PART I. LISTENING (Kỹ năng Nghe)</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                Listening Section
              </span>
            </div>

            {/* Task 1 / Part 1 */}
            {(listening?.part1 || listening?.task1) && (
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    {listening?.part1?.instruction || listening?.task1?.instruction || 'Task 1: Listen and fill in each blank'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">(Nghe 2 lần)</span>
                </div>
                <AudioPlayerMini
                  src={listening?.part1?.audioUrl || listening?.task1?.audioUrl}
                  label={listening?.part1?.topic || listening?.task1?.audioName || 'Audio Listening Part 1'}
                />
                <div className="space-y-2">
                  {(listening?.part1?.questions || listening?.task1?.questions || []).map((q, idx) => (
                    <div key={q.id || idx} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-emerald-700 mr-2">Câu {q.num || q.number || idx + 1}:</span>
                        <span className="text-slate-800 font-medium">{q.prompt || q.text}</span>
                        {showAnswers && (
                          <div className="mt-1 text-xs text-emerald-700 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                            <span>Đáp án đúng: <b className="text-emerald-900">{q.answer || q.correctAnswer || q.correct}</b></span>
                            {q.explanation && <span className="text-slate-500 font-normal">({q.explanation})</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Task 2 / Part 2: Multiple Choice */}
            {(listening?.part2 || listening?.task2) && (
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    {listening?.part2?.instruction || listening?.task2?.instruction || 'Task 2: Listen and choose the best answer'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">(Nghe 2 lần)</span>
                </div>
                <AudioPlayerMini
                  src={listening?.part2?.audioUrl || listening?.task2?.audioUrl}
                  label={listening?.part2?.topic || listening?.task2?.audioName || 'Audio Listening Part 2'}
                />
                <div className="space-y-3">
                  {(listening?.part2?.questions || listening?.task2?.questions || []).map((q, idx) => (
                    <div key={q.id || idx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-800 text-xs">
                        <span className="text-emerald-700 font-black mr-1.5">Câu {q.num || q.number || idx + 5}:</span>
                        {q.prompt || q.text}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                        {(q.options || []).map((opt, oIdx) => {
                          const letter = String.fromCharCode(65 + oIdx);
                          const isCorrect = showAnswers && (q.correct === letter || q.correctAnswer === letter || opt.startsWith(q.correct));
                          return (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-lg border text-xs flex items-center space-x-2 ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className="font-bold">{opt.startsWith(letter) ? '' : `${letter}. `}</span>
                              <span>{opt}</span>
                              {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                      {showAnswers && q.explanation && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          💡 <b>Giải thích:</b> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Task 3 / Part 3: True / False */}
            {listening?.part3 && (
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    {listening.part3.instruction || 'Part 3: Listen and decide True or False'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">(Nghe 2 lần)</span>
                </div>
                {listening.part3.audioUrl && (
                  <AudioPlayerMini src={listening.part3.audioUrl} label={listening.part3.topic || 'Audio Part 3'} />
                )}
                <div className="space-y-2">
                  {(listening.part3.questions || []).map((q, idx) => (
                    <div key={q.id || idx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-purple-700 mr-2">Câu {q.num || idx + 11}:</span>
                        <span className="text-slate-800 font-medium text-xs">{q.statement || q.prompt}</span>
                        {showAnswers && (
                          <div className="mt-1 text-xs text-emerald-700 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                            <span>Đáp án đúng: <b className="text-emerald-900">{q.correct}</b></span>
                            {q.explanation && <span className="text-slate-500 font-normal">({q.explanation})</span>}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200 shrink-0">
                        {q.correct}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* =================================================================
              PHẦN 2: KNOWLEDGE OF LANGUAGE (CLOZE TEXT & PHONETICS)
          ================================================================== */}
          <section className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-black text-slate-800 text-base flex items-center space-x-2">
                <span className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">2</span>
                <span>PART II. KNOWLEDGE OF LANGUAGE (2.5 pts)</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                10 câu • 2.5 điểm
              </span>
            </div>

            {/* Trường hợp Format Mới: Cloze Leaflet & Announcement (Ảnh 1) */}
            {languageFocus?.part1 && (
              <div className="p-3.5 rounded-xl bg-teal-50/40 border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-teal-950 text-xs sm:text-sm">
                    {languageFocus.part1.badge || 'Part 1: Leaflet'}: {languageFocus.part1.title}
                  </h4>
                  <span className="text-xs font-bold text-teal-700">Câu 11 - Câu 15</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-teal-100 text-xs text-slate-700 leading-relaxed italic whitespace-pre-line">
                  {languageFocus.part1.passage}
                </div>
                <div className="space-y-2.5">
                  {(languageFocus.part1.questions || []).map((q) => (
                    <div key={q.id} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                      <div className="font-bold text-slate-800 mb-1.5">
                        <span className="text-teal-700 mr-2">{q.blankLabel || `Câu ${q.num}:`}</span>
                        Điền từ vào chỗ trống ({q.num})
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {q.options?.map((opt, oIdx) => {
                          const letter = String.fromCharCode(65 + oIdx);
                          const isCorrect = showAnswers && (q.correct === letter || opt.startsWith(q.correct));
                          return (
                            <div
                              key={oIdx}
                              className={`p-1.5 rounded border text-center font-semibold text-xs ${
                                isCorrect
                                  ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-black'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                      {showAnswers && q.explanation && (
                        <div className="mt-1 text-[11px] text-slate-500">💡 <b>Giải thích:</b> {q.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {languageFocus?.part2 && (
              <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-blue-950 text-xs sm:text-sm">
                    {languageFocus.part2.badge || 'Part 2: Announcement'}: {languageFocus.part2.title}
                  </h4>
                  <span className="text-xs font-bold text-blue-700">Câu 16 - Câu 20</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-100 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-line text-[11px]">
                  {languageFocus.part2.passage}
                </div>
                <div className="space-y-2.5">
                  {(languageFocus.part2.questions || []).map((q) => (
                    <div key={q.id} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                      <div className="font-bold text-slate-800 mb-1.5">
                        <span className="text-blue-700 mr-2">{q.blankLabel || `Câu ${q.num}:`}</span>
                        Điền từ vào chỗ trống ({q.num})
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {q.options?.map((opt, oIdx) => {
                          const letter = String.fromCharCode(65 + oIdx);
                          const isCorrect = showAnswers && (q.correct === letter || opt.startsWith(q.correct));
                          return (
                            <div
                              key={oIdx}
                              className={`p-1.5 rounded border text-center font-semibold text-xs ${
                                isCorrect
                                  ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-black'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                      {showAnswers && q.explanation && (
                        <div className="mt-1 text-[11px] text-slate-500">💡 <b>Giải thích:</b> {q.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trường hợp Format SEED_EXAMS cũ: có questions list hoặc phonetics */}
            {!languageFocus?.part1 && Array.isArray(languageFocus?.questions) && (
              <div className="space-y-3">
                {languageFocus.questions.map((q, idx) => (
                  <div key={q.id || idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="font-semibold text-slate-800 mb-2">
                      <span className="text-emerald-700 font-bold mr-1.5">Question {q.number || q.num || idx + 9}:</span>
                      {q.prompt || q.text}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options?.map((opt, oIdx) => {
                        const letter = String.fromCharCode(65 + oIdx);
                        const isCorrect = showAnswers && (letter === q.correctAnswer || letter === q.correct);
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
            )}
          </section>

          {/* =================================================================
              PHẦN 3: READING (KỸ NĂNG ĐỌC HIỂU)
          ================================================================== */}
          <section className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-black text-slate-800 text-base flex items-center space-x-2">
                <span className="w-7 h-7 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center text-xs font-bold">3</span>
                <span>PART III. READING COMPREHENSION (2.5 pts)</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200">
                10 câu • 2.5 điểm
              </span>
            </div>

            {/* Bài đọc 1: Đúng / Sai (True / False • Câu 21 - 25) */}
            {(reading?.part1 || reading?.passage1) && (
              <div className="bg-cyan-50/30 p-3.5 rounded-xl border border-cyan-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-cyan-950 text-xs sm:text-sm uppercase tracking-wide">
                    {reading?.part1?.title || 'Bài đọc 1: True / False'}
                  </h4>
                  <span className="text-xs font-bold text-cyan-700">Câu 21 - Câu 25 (1.25đ)</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed text-xs italic whitespace-pre-line">
                  {reading?.part1?.passage || reading?.passage1?.text}
                </div>
                <div className="space-y-2">
                  {(reading?.part1?.questions || reading?.passage1?.questions || []).map((q, idx) => (
                    <div key={q.id || idx} className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-cyan-800 mr-2">Câu {q.num || q.number || idx + 21}:</span>
                        <span className="text-slate-800 font-medium">{q.prompt || q.text}</span>
                        {showAnswers && (
                          <div className="mt-1 text-xs text-emerald-700 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                            <span>Đáp án: <b className="text-emerald-900">{q.correct || q.correctAnswer}</b></span>
                            {q.explanation && <span className="text-slate-500 font-normal">({q.explanation})</span>}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded border border-cyan-200 shrink-0">
                        {q.correct || q.correctAnswer || '[ T / F ]'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bài đọc 2: Trắc nghiệm 4 lựa chọn (A, B, C, D • Câu 26 - 30) */}
            {(reading?.part2 || reading?.passage2) && (
              <div className="bg-indigo-50/30 p-3.5 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-indigo-950 text-xs sm:text-sm uppercase tracking-wide">
                    {reading?.part2?.title || 'Bài đọc 2: Trắc nghiệm ABCD'}
                  </h4>
                  <span className="text-xs font-bold text-indigo-700">Câu 26 - Câu 30 (1.25đ)</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed text-xs whitespace-pre-line">
                  {reading?.part2?.passage || reading?.passage2?.text}
                </div>
                <div className="space-y-2.5">
                  {(reading?.part2?.questions || reading?.passage2?.questions || []).map((q, idx) => (
                    <div key={q.id || idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="font-bold text-slate-800">
                        <span className="text-indigo-800 font-black mr-1.5">Câu {q.num || q.number || idx + 26}:</span>
                        {q.prompt || q.text}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {(q.options || []).map((opt, oIdx) => {
                          const letter = String.fromCharCode(65 + oIdx);
                          const isCorrect = showAnswers && (q.correct === letter || q.correctAnswer === letter || opt.startsWith(q.correct));
                          return (
                            <div
                              key={oIdx}
                              className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1.5 ${
                                isCorrect
                                  ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className="font-bold">{letter}.</span>
                              <span>{opt.replace(/^[A-D]\.\s*/, '')}</span>
                              {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
                            </div>
                          );
                        })}
                      </div>
                      {showAnswers && q.explanation && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          💡 <b>Giải thích:</b> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* =================================================================
              PHẦN 4: COMMUNICATION (NẾU CÓ TRONG ĐỀ CŨ)
          ================================================================== */}
          {communication && (Array.isArray(communication) ? communication.length > 0 : communication?.questions?.length > 0) && (
            <section className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-black text-slate-800 text-sm flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-xs font-bold">4</span>
                  <span>EVERYDAY ENGLISH & COMMUNICATION</span>
                </h3>
              </div>
              <div className="space-y-2">
                {(Array.isArray(communication) ? communication : communication.questions).map((q, idx) => (
                  <div key={q.id || idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="font-bold text-purple-800 mr-2">Câu {q.number || idx + 1}:</span>
                    <span>{q.prompt || q.dialogue}</span>
                    <div className="mt-1 text-emerald-700 font-bold">Đáp án: {q.correctAnswer || q.correct}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* =================================================================
              PHẦN 5: WRITING (KỸ NĂNG VIẾT - 3 PARTS)
          ================================================================== */}
          <section className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-black text-slate-800 text-base flex items-center space-x-2">
                <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-bold">5</span>
                <span>PART V. WRITING (2.5 pts)</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                3 Parts • 2.5 điểm
              </span>
            </div>

            {/* Part 1: Sắp xếp hội thoại (Câu 31 - 32) */}
            {writing?.part1 && (
              <div className="p-3.5 rounded-xl bg-amber-50/30 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-900 text-xs uppercase">
                    {writing.part1.title || 'Part 1: Sắp xếp đoạn hội thoại'}
                  </h4>
                  <span className="text-xs font-bold text-amber-700">Câu 31 - 32 (0.5đ)</span>
                </div>
                <div className="space-y-2.5">
                  {(writing.part1.questions || []).map((q) => (
                    <div key={q.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div className="font-bold text-slate-800">
                        <span className="text-amber-800 font-black mr-2">Câu {q.num}:</span>
                        {q.title}
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg font-mono text-[11px] text-slate-700 space-y-0.5">
                        {q.cuesList?.map((cue, cIdx) => (
                          <div key={cIdx}>{cue}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {q.options?.map((opt, oIdx) => {
                          const isCorrect = showAnswers && (opt.startsWith(q.correct) || q.correct === String.fromCharCode(65 + oIdx));
                          return (
                            <div
                              key={oIdx}
                              className={`p-1.5 rounded-lg border text-center font-bold text-xs ${
                                isCorrect
                                  ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-black'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                      {showAnswers && q.explanation && (
                        <div className="text-[11px] text-slate-500">💡 <b>Giải thích:</b> {q.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Part 2: Viết lại câu cùng nghĩa (Sentence Transformation • Câu 33 - 36) */}
            {(writing?.part2 || writing?.task2 || writing?.sentenceTransformation) && (
              <div className="p-3.5 rounded-xl bg-rose-50/30 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-rose-900 text-xs uppercase">
                    {writing?.part2?.title || 'Part 2: Viết lại câu không đổi nghĩa'}
                  </h4>
                  <span className="text-xs font-bold text-rose-700">Câu 33 - 36 (1.0đ)</span>
                </div>
                <div className="space-y-2.5">
                  {(writing?.part2?.questions || writing?.task2?.questions || writing?.sentenceTransformation || []).map((q, idx) => (
                    <div key={q.id || idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div className="font-bold text-slate-800">
                        <span className="text-rose-800 font-black mr-2">Câu {q.num || q.number || idx + 33}:</span>
                        {q.original || q.prompt}
                      </div>
                      <div className="font-semibold text-rose-900 bg-rose-50/50 p-2 rounded-lg border border-rose-100 flex items-center space-x-1.5">
                        <span>{q.startWith} → ____________________________</span>
                      </div>
                      {showAnswers && (
                        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 font-bold">
                          ✅ Đáp án đúng: {q.correct || q.suggestedAnswer}
                        </div>
                      )}
                      {showAnswers && q.explanation && (
                        <div className="text-[11px] text-slate-500">💡 <b>Giải thích:</b> {q.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Part 3: Đoạn văn tự luận (Câu 37 • 1.0đ) */}
            {(writing?.part3 || writing?.paragraph) && (
              <div className="p-3.5 rounded-xl bg-purple-50/30 border border-purple-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-purple-900 text-xs uppercase">
                    {writing?.part3?.title || 'Part 3: Viết đoạn văn tự luận (80 - 100 từ)'}
                  </h4>
                  <span className="text-xs font-bold text-purple-700">Câu 37 (1.0đ)</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="font-black text-slate-900 text-sm">
                    {writing?.part3?.topic || writing?.paragraph?.prompt || writing?.paragraph?.topic}
                  </div>
                  <div className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line leading-relaxed">
                    <b>Gợi ý dàn ý:</b> {writing?.part3?.guidance || writing?.paragraph?.guidance}
                  </div>
                  {showAnswers && (
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 leading-relaxed">
                      <b className="block mb-1 text-emerald-900">Bài viết mẫu tham khảo (Sample Essay):</b>
                      <p className="italic">{writing?.part3?.sampleEssay || writing?.paragraph?.sampleParagraph || writing?.paragraph?.sampleEssay}</p>
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
