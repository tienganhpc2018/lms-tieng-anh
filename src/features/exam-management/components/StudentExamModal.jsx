import React, { useState } from 'react';
import { 
  X, CheckCircle2, Clock, Award, BookOpen, Volume2, FileText, Send, AlertTriangle, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import AudioPlayerMini from './AudioPlayerMini';
import { saveExamSubmissions, loadExamSubmissions } from '../examStorage';
import { playCorrect, playClick } from '../../../utils/soundEffects';

export default function StudentExamModal({ exam, isOpen, onClose, studentName = 'Trần Minh Hằng', studentClass = '8A1' }) {
  if (!isOpen || !exam) return null;

  // State lưu đáp án làm bài của học sinh
  const [answers, setAnswers] = useState({});
  const [essayText, setEssayText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const handleSelectAnswer = (qId, val) => {
    if (isSubmitted) return;
    playClick();
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleTextAnswerChange = (qId, val) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmitExam = () => {
    if (window.confirm('Em có chắc chắn muốn nộp bài thi không? Sau khi nộp em sẽ nhận kết quả chấm tự động ngay!')) {
      // Tính điểm trắc nghiệm tự động
      let calculatedPoints = 0;
      let totalQuestions = 0;
      let correctCount = 0;

      // 1. Chấm Listening Task 1
      exam.listening?.task1?.questions?.forEach(q => {
        totalQuestions++;
        const studentAns = (answers[q.id] || '').trim().toLowerCase();
        const correctAns = (q.answer || '').trim().toLowerCase();
        if (studentAns === correctAns || (correctAns && studentAns.includes(correctAns))) {
          calculatedPoints += (q.points || 0.25);
          correctCount++;
        }
      });

      // 2. Chấm Listening Task 2
      exam.listening?.task2?.questions?.forEach(q => {
        totalQuestions++;
        const studentAns = (answers[q.id] || '').trim();
        if (studentAns === q.correct || studentAns.startsWith(q.correct)) {
          calculatedPoints += (q.points || 0.25);
          correctCount++;
        }
      });

      // 3. Chấm Phonetics
      exam.language?.phonetics?.forEach(q => {
        totalQuestions++;
        const studentAns = (answers[q.id] || '').trim();
        if (studentAns === q.correct || studentAns.startsWith(q.correct)) {
          calculatedPoints += (q.points || 0.25);
          correctCount++;
        }
      });

      // 4. Chấm Leaflet
      exam.language?.leaflet?.questions?.forEach(q => {
        totalQuestions++;
        const studentAns = (answers[q.id] || '').trim();
        if (studentAns === q.correct || studentAns.startsWith(q.correct)) {
          calculatedPoints += (q.points || 0.25);
          correctCount++;
        }
      });

      // 5. Chấm Announcement
      exam.language?.announcement?.questions?.forEach(q => {
        totalQuestions++;
        const studentAns = (answers[q.id] || '').trim();
        if (studentAns === q.correct || studentAns.startsWith(q.correct)) {
          calculatedPoints += (q.points || 0.25);
          correctCount++;
        }
      });

      // 6. Chấm Reading Part 1 (True/False)
      exam.reading?.part1?.questions?.forEach(q => {
        totalQuestions++;
        const studentAns = (answers[q.id] || '').trim();
        if (studentAns.toLowerCase() === q.correct.toLowerCase()) {
          calculatedPoints += (q.points || 0.25);
          correctCount++;
        }
      });

      // 7. Chấm Reading Part 2 (MCQ)
      exam.reading?.part2?.questions?.forEach(q => {
        totalQuestions++;
        const studentAns = (answers[q.id] || '').trim();
        if (studentAns === q.correct || studentAns.startsWith(q.correct)) {
          calculatedPoints += (q.points || 0.25);
          correctCount++;
        }
      });

      // 8. Chấm Communication
      exam.communication?.forEach(q => {
        totalQuestions++;
        const studentAns = (answers[q.id] || '').trim();
        if (studentAns === q.correct || studentAns.startsWith(q.correct)) {
          calculatedPoints += (q.points || 0.5);
          correctCount++;
        }
      });

      // 9. Chấm Writing Sentence Building
      exam.writing?.sentenceBuilding?.forEach(q => {
        totalQuestions++;
        const studentAns = (answers[q.id] || '').trim().toLowerCase().replace(/[.,!]/g, '');
        const targetAns = (q.correct || '').trim().toLowerCase().replace(/[.,!]/g, '');
        if (studentAns === targetAns) {
          calculatedPoints += (q.points || 0.25);
          correctCount++;
        }
      });

      // 10. Chấm Writing Sentence Transformation
      exam.writing?.sentenceTransformation?.forEach(q => {
        totalQuestions++;
        const studentAns = (answers[q.id] || '').trim().toLowerCase().replace(/[.,!]/g, '');
        const targetAns = (q.correct || '').trim().toLowerCase().replace(/[.,!]/g, '');
        if (studentAns === targetAns) {
          calculatedPoints += (q.points || 0.25);
          correctCount++;
        }
      });

      // Điểm tạm thời (chưa bao gồm đoạn văn tự luận do GV chấm)
      const roundedScore = Math.round(calculatedPoints * 10) / 10;
      setFinalScore({
        autoScore: roundedScore,
        totalScore: roundedScore,
        correctCount,
        totalQuestions,
        writingPending: !!essayText.trim(),
      });

      // Lưu bài nộp vào Storage
      const newSubmission = {
        id: 'sub_' + Date.now(),
        examId: exam.id,
        examTitle: exam.title,
        studentName,
        studentClass,
        submittedAt: new Date().toISOString(),
        answers,
        essayText,
        autoScore: roundedScore,
        teacherScore: null,
        totalScore: roundedScore,
        teacherComment: '',
        status: essayText.trim() ? 'pending_review' : 'graded',
      };

      const existingSubs = loadExamSubmissions();
      saveExamSubmissions([newSubmission, ...existingSubs]);

      setIsSubmitted(true);
      playCorrect();
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-teal-500 overflow-hidden text-slate-800">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-indigo-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-black text-amber-300 text-lg border border-white/20">
              📝
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] tracking-wide uppercase inline-block mb-1">
                Giao Diện Học Sinh Làm Bài
              </span>
              <h2 className="font-black text-sm sm:text-base tracking-tight leading-tight line-clamp-1">
                {exam.title}
              </h2>
              <div className="flex items-center space-x-3 text-xs text-teal-100 font-medium">
                <span>Học sinh: <strong className="text-white">{studentName}</strong> ({studentClass})</span>
                <span>• Thời lượng: <strong>{exam.durationMinutes} phút</strong></span>
                <span>• Thang điểm: <strong>10.0đ</strong></span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung đề thi */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50 text-xs sm:text-sm">
          {/* Thông báo kết quả khi đã nộp bài */}
          {isSubmitted && finalScore && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg space-y-2 animate-scale-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-7 h-7 text-amber-300" />
                  <h3 className="font-black text-base">ĐÃ NỘP BÀI THI THÀNH CÔNG!</h3>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold block text-teal-100">Điểm Trắc Nghiệm Tự Động:</span>
                  <span className="text-2xl font-black text-amber-300">{finalScore.autoScore} / 10đ</span>
                </div>
              </div>
              <p className="text-xs text-teal-50 font-medium leading-relaxed">
                Em đã trả lời đúng {finalScore.correctCount}/{finalScore.totalQuestions} câu trắc nghiệm & điền từ ngắn.
                {finalScore.writingPending && ' Phần bài viết đoạn văn tự luận (Writing Part 3) đã được gửi lên hệ thống để Thầy Nguyễn Văn Hải trực tiếp chấm điểm và nhận xét chi tiết!'}
              </p>
            </div>
          )}

          {/* PHÂN KHU 1: LISTENING (2.0 ĐIỂM) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xs">
                  I
                </span>
                <h4 className="font-black text-sm text-teal-950 uppercase tracking-tight">
                  LISTENING (Kỹ năng Nghe - 2.0 điểm)
                </h4>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                8 câu hỏi • 2.0đ
              </span>
            </div>

            {/* Task 1 */}
            {exam.listening?.task1 && (
              <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                <p className="font-extrabold text-slate-800 text-xs text-teal-900">
                  {exam.listening.task1.instruction}
                </p>
                <AudioPlayerMini audioUrl={exam.listening.task1.audioUrl} label="Audio Nghe Task 1 (Fill in blanks)" />
                <div className="space-y-2.5 pt-2">
                  {exam.listening.task1.questions.map((q) => (
                    <div key={q.id} className="space-y-1">
                      <label className="font-bold text-slate-700 block">{q.text}</label>
                      <input
                        type="text"
                        disabled={isSubmitted}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                        placeholder="Nhập từ cần điền (tối đa 2 từ)..."
                        className="w-full sm:w-72 px-3 py-1.5 border border-slate-300 rounded-xl font-bold text-xs bg-white focus:ring-2 focus:ring-teal-500"
                      />
                      {isSubmitted && (
                        <span className="text-[11px] text-emerald-700 font-bold block">
                          Đáp án đúng: <strong>{q.answer}</strong>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Task 2 */}
            {exam.listening?.task2 && (
              <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                <p className="font-extrabold text-slate-800 text-xs text-teal-900">
                  {exam.listening.task2.instruction}
                </p>
                <AudioPlayerMini audioUrl={exam.listening.task2.audioUrl} label="Audio Nghe Task 2 (Multiple choice)" />
                <div className="space-y-3 pt-2">
                  {exam.listening.task2.questions.map((q) => (
                    <div key={q.id} className="space-y-1.5">
                      <p className="font-bold text-slate-800">{q.text}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const optKey = opt.charAt(0);
                          const isSelected = answers[q.id] === optKey;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={isSubmitted}
                              onClick={() => handleSelectAnswer(q.id, optKey)}
                              className={`px-3 py-2 rounded-xl text-left font-bold text-xs border transition cursor-pointer ${
                                isSelected
                                  ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                                  : 'bg-white hover:bg-teal-50/60 text-slate-700 border-slate-300'
                              } ${isSubmitted && q.correct === optKey ? 'ring-2 ring-emerald-500 bg-emerald-50 text-emerald-900' : ''}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PHÂN KHU 2: KNOWLEDGE OF LANGUAGE (2.5 ĐIỂM) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-xs">
                  II
                </span>
                <h4 className="font-black text-sm text-indigo-950 uppercase tracking-tight">
                  KNOWLEDGE OF LANGUAGE (Kiến thức ngôn ngữ - 2.5 điểm)
                </h4>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                8 câu hỏi • 2.5đ
              </span>
            </div>

            {/* Phonetics */}
            {exam.language?.phonetics && (
              <div className="space-y-3">
                <h5 className="font-black text-xs text-slate-800 uppercase tracking-wider">
                  A. PHONETICS (Phát âm & Trọng âm)
                </h5>
                {exam.language.phonetics.map((q) => (
                  <div key={q.id} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-800">{q.text}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const optKey = opt.charAt(0);
                        const isSelected = answers[q.id] === optKey;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => handleSelectAnswer(q.id, optKey)}
                            className={`px-3 py-2 rounded-xl text-center font-bold text-xs border transition cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                                : 'bg-white hover:bg-indigo-50 text-slate-700 border-slate-300'
                            } ${isSubmitted && q.correct === optKey ? 'ring-2 ring-emerald-500 bg-emerald-50 text-emerald-900' : ''}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Leaflet */}
            {exam.language?.leaflet && (
              <div className="space-y-3 p-3.5 rounded-xl bg-amber-50/50 border border-amber-200">
                <h5 className="font-black text-xs text-amber-900 uppercase">
                  B. CLOZE TEXT: {exam.language.leaflet.title}
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line bg-white p-3 rounded-xl border border-amber-200 shadow-inner">
                  {exam.language.leaflet.content}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {exam.language.leaflet.questions.map((q) => (
                    <div key={q.id} className="space-y-1">
                      <p className="font-bold text-slate-800">{q.text}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {q.options.map((opt, oIdx) => {
                          const optKey = opt.charAt(0);
                          const isSelected = answers[q.id] === optKey;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={isSubmitted}
                              onClick={() => handleSelectAnswer(q.id, optKey)}
                              className={`px-2 py-1.5 rounded-lg text-left font-bold text-xs border transition cursor-pointer truncate ${
                                isSelected
                                  ? 'bg-amber-600 text-white border-amber-700'
                                  : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-300'
                              } ${isSubmitted && q.correct === optKey ? 'ring-2 ring-emerald-500 bg-emerald-100 font-black' : ''}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Announcement */}
            {exam.language?.announcement && (
              <div className="space-y-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-200">
                <h5 className="font-black text-xs text-blue-900 uppercase">
                  C. ANNOUNCEMENT: {exam.language.announcement.title}
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line bg-white p-3 rounded-xl border border-blue-200 shadow-inner">
                  {exam.language.announcement.content}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {exam.language.announcement.questions.map((q) => (
                    <div key={q.id} className="space-y-1">
                      <p className="font-bold text-slate-800">{q.text}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {q.options.map((opt, oIdx) => {
                          const optKey = opt.charAt(0);
                          const isSelected = answers[q.id] === optKey;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={isSubmitted}
                              onClick={() => handleSelectAnswer(q.id, optKey)}
                              className={`px-2 py-1.5 rounded-lg text-left font-bold text-xs border transition cursor-pointer truncate ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-700'
                                  : 'bg-white hover:bg-blue-50 text-slate-700 border-slate-300'
                              } ${isSubmitted && q.correct === optKey ? 'ring-2 ring-emerald-500 bg-emerald-100 font-black' : ''}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PHÂN KHU 3: READING (2.5 ĐIỂM) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                  III
                </span>
                <h4 className="font-black text-sm text-emerald-950 uppercase tracking-tight">
                  READING (Kỹ năng Đọc hiểu - 2.5 điểm)
                </h4>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                10 câu hỏi • 2.5đ
              </span>
            </div>

            {/* Reading Part 1: True / False */}
            {exam.reading?.part1 && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-xs text-slate-900">{exam.reading.part1.title}</h5>
                  <span className="text-[10px] text-slate-400 italic font-medium">{exam.reading.part1.credit}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200 shadow-inner">
                  {exam.reading.part1.passage}
                </p>
                <div className="space-y-2 pt-1">
                  {exam.reading.part1.questions.map((q) => (
                    <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-800">{q.text}</span>
                      <div className="flex space-x-2 shrink-0">
                        {['True', 'False'].map((val) => (
                          <button
                            key={val}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => handleSelectAnswer(q.id, val)}
                            className={`px-3 py-1 rounded-lg font-black text-xs border transition cursor-pointer ${
                              answers[q.id] === val
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                            } ${isSubmitted && q.correct.toLowerCase() === val.toLowerCase() ? 'ring-2 ring-emerald-500 bg-emerald-100 text-emerald-950 font-black' : ''}`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reading Part 2: Multiple Choice */}
            {exam.reading?.part2 && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-xs text-slate-900">{exam.reading.part2.title}</h5>
                  <span className="text-[10px] text-slate-400 italic font-medium">{exam.reading.part2.credit}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200 shadow-inner">
                  {exam.reading.part2.passage}
                </p>
                <div className="space-y-3 pt-1">
                  {exam.reading.part2.questions.map((q) => (
                    <div key={q.id} className="space-y-1.5 p-2 bg-white rounded-lg border border-slate-200">
                      <p className="font-bold text-slate-800">{q.text}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {q.options.map((opt, oIdx) => {
                          const optKey = opt.charAt(0);
                          const isSelected = answers[q.id] === optKey;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={isSubmitted}
                              onClick={() => handleSelectAnswer(q.id, optKey)}
                              className={`px-2.5 py-1.5 rounded-lg text-left font-bold text-xs border transition cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-700'
                                  : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-300'
                              } ${isSubmitted && q.correct === optKey ? 'ring-2 ring-emerald-500 bg-emerald-100 font-black' : ''}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PHÂN KHU 4: COMMUNICATION (1.0 ĐIỂM) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-xs">
                  IV
                </span>
                <h4 className="font-black text-sm text-purple-950 uppercase tracking-tight">
                  COMMUNICATION (Giao tiếp hàng ngày - 1.0 điểm)
                </h4>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                2 câu hỏi • 1.0đ
              </span>
            </div>

            {exam.communication?.map((q) => (
              <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[11px] text-slate-500 italic font-semibold">{q.context}</span>
                <p className="font-extrabold text-slate-800 whitespace-pre-line">{q.dialogue}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {q.options.map((opt, oIdx) => {
                    const optKey = opt.charAt(0);
                    const isSelected = answers[q.id] === optKey;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => handleSelectAnswer(q.id, optKey)}
                        className={`px-2.5 py-1.5 rounded-lg text-left font-bold text-xs border transition cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-700'
                            : 'bg-white hover:bg-purple-50 text-slate-700 border-slate-300'
                        } ${isSubmitted && q.correct === optKey ? 'ring-2 ring-emerald-500 bg-emerald-100 font-black' : ''}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* PHÂN KHU 5: WRITING (2.0 ĐIỂM) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-xs">
                  V
                </span>
                <h4 className="font-black text-sm text-rose-950 uppercase tracking-tight">
                  WRITING (Kỹ năng Viết - 2.0 điểm)
                </h4>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                5 câu hỏi • 2.0đ
              </span>
            </div>

            {/* Sentence Building */}
            {exam.writing?.sentenceBuilding && (
              <div className="space-y-2.5">
                <h5 className="font-black text-xs text-slate-800 uppercase">
                  Part 1: Build complete sentences from the given cues
                </h5>
                {exam.writing.sentenceBuilding.map((q) => (
                  <div key={q.id} className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800">{q.cues}</p>
                    <input
                      type="text"
                      disabled={isSubmitted}
                      value={answers[q.id] || ''}
                      onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                      placeholder="Viết lại câu hoàn chỉnh..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-bold text-xs bg-white focus:ring-2 focus:ring-rose-500"
                    />
                    {isSubmitted && (
                      <span className="text-[11px] text-emerald-700 font-bold block">
                        Đáp án gợi ý: <strong>{q.correct}</strong>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Sentence Transformation */}
            {exam.writing?.sentenceTransformation && (
              <div className="space-y-2.5 pt-2">
                <h5 className="font-black text-xs text-slate-800 uppercase">
                  Part 2: Rewrite the sentences without changing their meaning
                </h5>
                {exam.writing.sentenceTransformation.map((q) => (
                  <div key={q.id} className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800">{q.original}</p>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-rose-700">{q.startWith} →</span>
                      <input
                        type="text"
                        disabled={isSubmitted}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                        placeholder="Viết tiếp phần còn lại của câu..."
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl font-bold text-xs bg-white focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    {isSubmitted && (
                      <span className="text-[11px] text-emerald-700 font-bold block">
                        Đáp án gợi ý: <strong>{q.correct}</strong>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Paragraph Writing */}
            {exam.writing?.paragraph && (
              <div className="space-y-2 pt-2 bg-rose-50/40 p-4 rounded-xl border border-rose-200">
                <h5 className="font-black text-xs text-rose-900 uppercase">
                  Part 3: Paragraph Writing (80 - 100 words) • 1.0 điểm
                </h5>
                <p className="font-extrabold text-slate-900 text-xs">{exam.writing.paragraph.topic}</p>
                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-rose-100">
                  <span className="font-bold block mb-1">Gợi ý dàn ý (Cues):</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {exam.writing.paragraph.cues.map((c, cIdx) => (
                      <li key={cIdx}>{c}</li>
                    ))}
                  </ul>
                </div>
                <textarea
                  rows={6}
                  disabled={isSubmitted}
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  placeholder="Gõ bài viết đoạn văn tiếng Anh của em tại đây (khoảng 80 - 100 từ)..."
                  className="w-full p-3 border border-slate-300 rounded-xl font-medium text-xs bg-white focus:ring-2 focus:ring-rose-500 shadow-inner"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Số từ hiện tại: ~{essayText.trim() ? essayText.trim().split(/\s+/).length : 0} từ</span>
                  <span>Yêu cầu: 80 - 100 từ</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Đóng
          </button>
          {!isSubmitted ? (
            <button
              type="button"
              onClick={handleSubmitExam}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Nộp Bài Thi & Nhận Điểm</span>
            </button>
          ) : (
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              ✅ Đã nộp bài thành công
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
