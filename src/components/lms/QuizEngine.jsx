import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, CheckCircle, Volume2, Eye, EyeOff, FileText, Clock, Award, User, AlertCircle, RefreshCw, XCircle, Lightbulb, Headphones, BookOpen, Search, MessageSquareText, Tag } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function QuizEngine({ activity }) {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Bộ đếm thời gian
  const [isCountdownMode, setIsCountdownMode] = useState(false);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Kết quả tổng kết
  const [resultData, setResultData] = useState({
    studentName: '',
    timeTakenStr: '',
    correctCount: 0,
    totalQuestions: 0,
    score: 0,
    totalMarks: 0,
    isPassed: false,
  });

  // TIMER LOGIC: CỘNG DỒN TỔNG THỜI GIAN CỦA TẤT CẢ CÁC BÀI (VÍ DỤ 5P + 5P = 10P)
  useEffect(() => {
    let interval = null;
    if (timerActive && !submitted) {
      if (isCountdownMode && secondsRemaining > 0) {
        interval = setInterval(() => {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              handleSubmitQuiz(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (!isCountdownMode) {
        interval = setInterval(() => {
          setSecondsElapsed((prev) => prev + 1);
        }, 1000);
      }
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, submitted, isCountdownMode, secondsRemaining]);

  useEffect(() => {
    async function fetchQuestions() {
      if (!activity?.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('activity_id', activity.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Lỗi fetch questions:', error);
          setQuestions([]);
        } else {
          let totalCustomMinutes = 0;
          const safeData = (data || []).map((q) => {
            let cObj = q.content;
            if (typeof cObj === 'string') {
              try {
                cObj = JSON.parse(cObj);
              } catch (e) {
                cObj = { question: q.content };
              }
            }
            if (cObj?.timeLimit && Number(cObj.timeLimit) > 0) {
              totalCustomMinutes += Number(cObj.timeLimit);
            }
            return {
              ...q,
              content: cObj || {},
            };
          });

          if (totalCustomMinutes > 0) {
            setIsCountdownMode(true);
            const totalSecs = totalCustomMinutes * 60;
            setTimeLimitSeconds(totalSecs);
            setSecondsRemaining(totalSecs);
          } else {
            setIsCountdownMode(false);
            setSecondsElapsed(0);
          }

          setQuestions(safeData);
        }
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [activity]);

  const handleSelectAnswer = (questionKey, value) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionKey]: value }));
  };

  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    setTimerActive(false);

    let correctCount = 0;
    let totalScore = 0;
    let totalQCount = 0;
    const totalMarks = questions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0);

    questions.forEach((q) => {
      const sectionType = (q.content?.sectionType || q.type || '').toLowerCase();

      if (sectionType === 'cloze_test' && Array.isArray(q.content?.tasks)) {
        q.content.tasks.forEach((t, tIdx) => {
          const tQs = t.questions || [];
          tQs.forEach((cQ, qIdx) => {
            totalQCount += 1;
            const key = `${q.id}_t${tIdx}_q${qIdx}`;
            const selected = userAnswers[key];
            const correctOpt = cQ.correct_option || cQ.options?.find(o => o.isCorrect)?.id;
            if (selected === correctOpt && selected !== undefined) {
              correctCount += 1;
              totalScore += 1;
            }
          });
        });
      } else if ((sectionType === 'listening_section' || sectionType === 'reading_section') && Array.isArray(q.content?.parts) && q.content.parts.length > 0) {
        q.content.parts.forEach((pItem, pIdx) => {
          const pQs = pItem.questions || [];
          pQs.forEach((cQ, qIdx) => {
            totalQCount += 1;
            const key = `${q.id}_p${pIdx}_q${qIdx}`;
            const selected = userAnswers[key];
            const opts = Array.isArray(cQ.options) ? cQ.options : [];
            const correctOptIndex = opts.findIndex((o) => o?.isCorrect);
            if (selected === correctOptIndex && selected !== undefined) {
              correctCount += 1;
              totalScore += 1;
            }
          });
        });
      } else {
        const childs = q.content?.childQuestions;
        if (Array.isArray(childs) && childs.length > 0) {
          childs.forEach((c, cIdx) => {
            totalQCount += 1;
            const key = `${q.id}_c${cIdx}`;
            const selected = userAnswers[key];

            if (sectionType === 'reading_tf') {
              if (selected === c.correctAnswer) {
                correctCount += 1;
                totalScore += 1;
              }
            } else {
              const opts = Array.isArray(c.options) ? c.options : [];
              const correctOptIndex = opts.findIndex((o) => o?.isCorrect);
              if (selected === correctOptIndex && selected !== undefined) {
                correctCount += 1;
                totalScore += 1;
              }
            }
          });
        } else {
          totalQCount += 1;
          const selected = userAnswers[q.id];
          const opts = Array.isArray(q.content?.options) ? q.content.options : [];
          const correctOptIndex = opts.findIndex((o) => o?.isCorrect);
          if (selected === correctOptIndex && selected !== undefined) {
            correctCount += 1;
            totalScore += Number(q.marks) || 1;
          }
        }
      }
    });

    let elapsed = secondsElapsed;
    if (isCountdownMode) {
      elapsed = timeLimitSeconds - secondsRemaining;
    }
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeTakenStr = `${mins} phút ${secs} giây`;
    const isPassed = totalScore >= (totalMarks * 0.5);

    const res = {
      studentName: profile?.full_name || 'Học Viên',
      timeTakenStr,
      correctCount,
      totalQuestions: totalQCount,
      score: totalScore,
      totalMarks,
      isPassed,
    };

    setResultData(res);
    setSubmitted(true);

    if (isAutoSubmit) {
      alert('⏱️ Đã HẾT THỜI GIAN LÀM BÀI THI!\n\nHệ thống đã tự động thu bài và chấm điểm.');
    }

    if (profile?.id && activity?.id) {
      await supabase.from('submissions').insert([
        {
          activity_id: activity.id,
          student_id: profile.id,
          answers_data: userAnswers,
          score: totalScore,
          status: 'graded',
        },
      ]);
    }
  };

  // HÀM ĐỊNH DẠNG VĂN BẢN XUỐNG DÒNG RÕ RÀNG + BÔI ĐẬM EVIDENCE / DẪN CHỨNG DỄ ĐỌC BÀI
  const renderFormattedParagraphs = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split('\n').filter((l) => l.trim() !== '');

    return lines.map((line, idx) => {
      let isHeader = false;
      const highlightKeywords = ['Evidence:', 'Dẫn chứng:', 'Phân tích:', 'Cấu trúc:', 'Đáp án đúng:', 'Loại trừ:', 'Bản dịch:'];
      highlightKeywords.forEach((kw) => {
        if (line.toLowerCase().includes(kw.toLowerCase())) {
          isHeader = true;
        }
      });

      return (
        <p key={idx} className={`leading-relaxed text-slate-700 ${idx > 0 ? 'mt-2' : ''}`}>
          {isHeader ? (
            <span className="font-extrabold text-slate-900 bg-amber-100/70 px-1.5 py-0.5 rounded mr-1">
              {line}
            </span>
          ) : (
            line
          )}
        </p>
      );
    });
  };

  // Render Khối AI Giải Thích Chuẩn 4 Phần Xuống Dòng Rõ Ràng Cho Học Sinh Yếu
  const renderFourBlockExplanation = (explanationText, correctText) => {
    if (!explanationText) {
      return (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2 col-span-full">
          <p className="font-extrabold text-emerald-950 text-sm">➔ Đáp án đúng: {correctText || 'Chính xác'}</p>
          <p className="text-emerald-800">💡 Ghi nhớ từ vựng & cấu trúc trọng tâm để chọn đúng đáp án bài sau!</p>
        </div>
      );
    }

    const sectionGrammar = explanationText.includes('Phân tích ngữ pháp')
      ? explanationText.split('💡')[0].replace(/🔍/g, '').replace('Phân tích ngữ pháp/ngữ cảnh:', '').trim()
      : 'Câu hỏi kiểm tra từ vựng & ngữ pháp trọng tâm theo bài học.';

    const sectionDetail = explanationText.includes('Giải thích chi tiết')
      ? (explanationText.split('✕')[0] || explanationText).split('💡')[1]?.replace('Giải thích chi tiết:', '').trim()
      : explanationText;

    const sectionExclude = explanationText.includes('Loại trừ gây nhiễu')
      ? (explanationText.split('🇻🇳')[0] || '').split('✕')[1]?.replace('Loại trừ gây nhiễu:', '').trim()
      : 'Các phương án còn lại sai về nghĩa hoặc không đúng cấu trúc ngữ pháp.';

    const sectionTranslation = explanationText.includes('Bản dịch nghĩa song ngữ')
      ? explanationText.split('🇻🇳')[1]?.replace('Bản dịch nghĩa song ngữ:', '').trim()
      : 'Dịch câu hỏi và đáp án chuẩn Tiếng Việt giúp học sinh nắm vững nghĩa.';

    return (
      <div className="p-5 bg-emerald-50/80 border border-emerald-300 rounded-3xl space-y-4 text-xs col-span-full">
        <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xs">
          <p className="font-extrabold text-sm flex items-center space-x-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-200" />
            <span>➔ ĐÁP ÁN ĐÚNG: {correctText}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 bg-white border border-emerald-200 rounded-2xl space-y-2 shadow-2xs">
            <span className="font-extrabold text-emerald-950 flex items-center space-x-1.5 text-[11px] border-b border-emerald-100 pb-1">
              <Search className="w-3.5 h-3.5 text-sky-600" />
              <span>📌 PHÂN TÍCH NGỮ PHÁP / NGỮ CẢNH:</span>
            </span>
            <div className="text-slate-700 space-y-1 font-medium leading-relaxed">
              {renderFormattedParagraphs(sectionGrammar)}
            </div>
          </div>

          <div className="p-4 bg-white border border-emerald-200 rounded-2xl space-y-2 shadow-2xs">
            <span className="font-extrabold text-emerald-950 flex items-center space-x-1.5 text-[11px] border-b border-emerald-100 pb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>💡 GIẢI THÍCH CHI TIẾT (EVIDENCE / DẪN CHỨNG):</span>
            </span>
            <div className="text-slate-700 space-y-1 font-medium leading-relaxed">
              {renderFormattedParagraphs(sectionDetail)}
            </div>
          </div>

          <div className="p-4 bg-white border border-rose-200 rounded-2xl space-y-2 shadow-2xs">
            <span className="font-extrabold text-rose-950 flex items-center space-x-1.5 text-[11px] border-b border-rose-100 pb-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>✕ LOẠI TRỪ CÁC ĐÁP ÁN GÂY NHIỄU:</span>
            </span>
            <div className="text-slate-700 space-y-1 font-medium leading-relaxed">
              {renderFormattedParagraphs(sectionExclude)}
            </div>
          </div>

          <div className="p-4 bg-white border border-emerald-200 rounded-2xl space-y-2 shadow-2xs">
            <span className="font-extrabold text-emerald-950 flex items-center space-x-1.5 text-[11px] border-b border-emerald-100 pb-1">
              <span className="text-xs">🇻🇳</span>
              <span>BẢN DỊCH NGHĨA SONG NGỮ TIẾNG VIỆT:</span>
            </span>
            <div className="text-slate-700 space-y-1 font-medium leading-relaxed">
              {renderFormattedParagraphs(sectionTranslation)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <LoadingSpinner text="Đang tải bài làm..." />;

  const minsLeft = Math.floor(secondsRemaining / 60);
  const secsLeft = secondsRemaining % 60;
  const minsElapsed = Math.floor(secondsElapsed / 60);
  const secsElapsed = secondsElapsed % 60;
  const isTimeWarning = isCountdownMode && secondsRemaining < 120;

  return (
    <div className="space-y-6">
      {/* THÔNG BÁO TỔNG KẾT BÀI THI SAU KHU NỘP */}
      {submitted ? (
        <div className="p-6 bg-gradient-to-br from-slate-900 to-navy-900 text-white rounded-3xl shadow-xl space-y-6 border border-slate-700 animate-scale-up">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">KẾT QUẢ BÀI KÍỂM TRA</h3>
              <p className="text-xs text-slate-300">Học sinh: {resultData.studentName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Thời Gian Làm</span>
              <span className="text-sm font-extrabold text-white flex items-center justify-center space-x-1">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>{resultData.timeTakenStr}</span>
              </span>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Số Câu Đúng</span>
              <span className="text-sm font-extrabold text-emerald-400">
                {resultData.correctCount} / {resultData.totalQuestions} câu
              </span>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Tổng Điểm Đạt Được</span>
              <span className="text-sm font-extrabold text-amber-400">
                {resultData.score} / {resultData.totalMarks} điểm
              </span>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Trạng Thái</span>
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded-lg inline-block ${
                  resultData.isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {resultData.isPassed ? 'VƯỢT QUA 🎉' : 'CHƯA ĐẠT ⚠️'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* THANH ĐỒNG HỒ THỜI GIAN LÀM BÀI */
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Học sinh: {profile?.full_name || 'Học Viên'}</span>
          </div>
          <div
            className={`flex items-center space-x-2 text-xs font-extrabold px-3.5 py-1.5 rounded-xl border transition ${
              isTimeWarning ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse' : 'bg-slate-800 text-emerald-400 border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            {isCountdownMode ? (
              <span>
                ⏱️ Tổng thời gian làm bài ({Math.floor(timeLimitSeconds / 60)} phút): {minsLeft < 10 ? `0${minsLeft}` : minsLeft}:{secsLeft < 10 ? `0${secsLeft}` : secsLeft}
              </span>
            ) : (
              <span>
                ⏱️ Thời gian làm bài: {minsElapsed < 10 ? `0${minsElapsed}` : minsElapsed}:{secsElapsed < 10 ? `0${secsElapsed}` : secsElapsed}
              </span>
            )}
          </div>
        </div>
      )}

      {/* DANH SÁCH CÂU HỎI */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const sectionType = (q.content?.sectionType || q.type || 'multiple_choice').toLowerCase();
          const isReading = sectionType === 'reading_section';
          const isListening = sectionType === 'listening_section';
          const isReadingTF = sectionType === 'reading_tf';
          const isClozeTest = sectionType === 'cloze_test';
          const childQuestions = Array.isArray(q.content?.childQuestions) ? q.content.childQuestions : [];
          const sectionParts = Array.isArray(q.content?.parts) ? q.content.parts : [];

          // Link Audio MP3
          let audioSrc = q.content?.audioUrl;
          if ((!audioSrc || audioSrc.startsWith('blob:')) && q.content?.audioFileName) {
            try {
              const cachedDataUrl = localStorage.getItem(`audio_file_${q.content.audioFileName}`);
              if (cachedDataUrl) audioSrc = cachedDataUrl;
            } catch (errLocal) {}
          }

          // DẠNG 3: READING (True/False) CHUẨN ĐÚNG 100% ẢNH 1
          if (isReadingTF) {
            return (
              <div key={q.id || qIdx} className="bg-white border-l-4 border-emerald-500 rounded-3xl p-6 shadow-sm border-y border-r border-slate-200 space-y-5">
                <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                    {qIdx + 1}
                  </span>
                  <span className="font-extrabold text-emerald-900 text-sm uppercase">
                    {q.content?.title || 'READING (True/False)'}
                  </span>
                </div>

                <div className="p-4 bg-purple-50/80 border-l-4 border-purple-600 rounded-r-2xl text-purple-950 font-extrabold text-xs leading-relaxed shadow-2xs">
                  {q.content?.question || 'Read the passage about a community garden in Green Valley and decide whether the statements are True (T) or False (F).'}
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5 text-slate-800 font-serif text-xs leading-relaxed text-justify shadow-2xs">
                  {q.content?.passage}
                </div>

                <div className="space-y-3 pt-2">
                  {childQuestions.map((cQ, cIdx) => {
                    const childKey = `${q.id}_c${cIdx}`;
                    const selectedVal = userAnswers[childKey];
                    return (
                      <div key={cIdx} className="space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 gap-4">
                          <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                            {cQ.question}
                          </span>

                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              disabled={submitted}
                              onClick={() => handleSelectAnswer(childKey, 'T')}
                              className={`w-7 h-7 rounded-md font-extrabold text-xs transition flex items-center justify-center ${
                                selectedVal === 'T'
                                  ? 'bg-emerald-100 border border-emerald-400 text-emerald-700 shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              T
                            </button>

                            <button
                              disabled={submitted}
                              onClick={() => handleSelectAnswer(childKey, 'F')}
                              className={`w-7 h-7 rounded-md font-extrabold text-xs transition flex items-center justify-center ${
                                selectedVal === 'F'
                                  ? 'bg-rose-100 border border-rose-400 text-rose-700 shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              F
                            </button>
                          </div>
                        </div>

                        {submitted && renderFourBlockExplanation(cQ.explanation || q.content?.explanation, cQ.correctAnswer === 'T' ? 'True (T)' : 'False (F)')}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // DẠNG 4: KNOWLEDGE OF LANGUAGE (Cloze Test Gộp Task 1 & Task 2)
          if (isClozeTest) {
            const tasksList = Array.isArray(q.content?.tasks) && q.content.tasks.length > 0
              ? q.content.tasks
              : [
                  {
                    task_title: q.content?.question?.split('\n')[0] || "TASK 1: READ THE FIRST TEXT AND CHOOSE THE CORRECT WORD TO FILL IN EACH BLANK.",
                    task_sub: q.content?.question?.split('\n')[1] || "Read the following text and choose the best option (A, B, C, or D) for each blank.",
                    badge_label: q.content?.badge || "POSTER",
                    passage_title: q.content?.passageTitle || "Passage Title",
                    passage_content: q.content?.passage || "Passage Content",
                    questions: (q.content?.childQuestions || []).map((cq, idx) => ({
                      question_number: cq.qNum || (16 + idx),
                      options: cq.options || [],
                      correct_option: cq.options?.find(o => o.isCorrect)?.id || "A",
                      explanation: cq.explanation
                    }))
                  }
                ];

            return (
              <div key={q.id || qIdx} className="bg-white border-l-4 border-blue-600 rounded-3xl p-6 shadow-sm border-y border-r border-slate-200 space-y-5">
                {/* Header Bar */}
                <div className="bg-blue-50/70 rounded-xl p-3.5 flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-blue-900 tracking-wide uppercase flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                      {qIdx + 1}
                    </span>
                    <span>{q.content?.title || 'KNOWLEDGE OF LANGUAGE'}</span>
                  </h3>
                  <Volume2 className="w-5 h-5 text-blue-600 cursor-pointer" />
                </div>

                {/* Render Lần Lượt Cả Task 1 & Task 2 */}
                {tasksList.map((taskItem, tIdx) => {
                  const tQuestions = taskItem.questions || [];

                  return (
                    <div key={tIdx} className="space-y-4 border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
                      {/* Khung hướng dẫn tím */}
                      <div className="p-3.5 bg-purple-50/80 border-l-4 border-purple-600 rounded-r-2xl text-purple-950 font-extrabold text-xs leading-relaxed shadow-2xs space-y-0.5">
                        <h4 className="uppercase tracking-tight text-purple-950">
                          {taskItem.task_title}
                        </h4>
                        {taskItem.task_sub && (
                          <p className="text-[11px] italic text-purple-800 font-medium">
                            {taskItem.task_sub}
                          </p>
                        )}
                      </div>

                      {/* Passage Container */}
                      <div className="border border-slate-300 rounded-2xl bg-amber-50/20 p-5 relative space-y-2 mt-3">
                        <span className={`text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase absolute -top-3 left-4 shadow-xs ${
                          tIdx === 1 ? 'bg-teal-600' : 'bg-amber-500'
                        }`}>
                          {taskItem.badge_label || (tIdx === 1 ? 'EMAIL' : 'POSTER')}
                        </span>

                        {taskItem.passage_title && (
                          <h4 className="text-center font-extrabold text-amber-950 text-xs pt-0.5">
                            {taskItem.passage_title}
                          </h4>
                        )}

                        <p className="text-slate-800 font-medium text-xs leading-relaxed text-justify whitespace-pre-line">
                          {taskItem.passage_content}
                        </p>
                      </div>

                      {/* HÀNG CÂU HỎI CLOZE TEST */}
                      <div className="space-y-2.5 pt-1">
                        {tQuestions.map((cQ, cIdx) => {
                          const childKey = `${q.id}_t${tIdx}_q${cIdx}`;
                          const selectedVal = userAnswers[childKey];
                          const opts = Array.isArray(cQ.options) ? cQ.options : [];
                          const correctOpt = cQ.correct_option || opts.find(o => o.isCorrect)?.id || opts.find(o => o.isCorrect)?.text?.substring(0,1);

                          const isLongOptions = opts.some(o => {
                            const txt = typeof o === 'string' ? o : (o.text || o.label || '');
                            return txt.length > 16;
                          });

                          return (
                            <div key={cIdx} className="space-y-1.5">
                              <div className="flex items-start gap-3 w-full">
                                <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-1">
                                  {cQ.question_number || (16 + cIdx)}
                                </span>

                                <div className={`grid gap-2.5 w-full items-stretch ${
                                  isLongOptions ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
                                }`}>
                                  {opts.map((opt, oIdx) => {
                                    const optVal = opt.id || String.fromCharCode(65 + oIdx);
                                    const optText = opt.text || `${optVal}. ${opt.label || opt}`;
                                    const isSelected = selectedVal === optVal || selectedVal === oIdx;

                                    return (
                                      <button
                                        key={oIdx}
                                        disabled={submitted}
                                        onClick={() => handleSelectAnswer(childKey, optVal)}
                                        className={`rounded-2xl px-3.5 py-2 text-xs transition font-semibold text-left whitespace-normal break-words border flex items-center space-x-1.5 ${
                                          isSelected
                                            ? `${tIdx === 1 ? 'bg-teal-600' : 'bg-blue-600'} text-white font-bold shadow-xs border-transparent`
                                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                                        }`}
                                      >
                                        <span>{optText}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {submitted && renderFourBlockExplanation(cQ.explanation || q.content?.explanation, correctOpt ? `Option ${correctOpt}` : 'Đáp án đúng')}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          // NẾU LÀ LISTENING_SECTION HOẶC READING_SECTION CÓ MULTI PARTS (PART 1 & PART 2)
          if ((isListening || isReading) && sectionParts.length > 0) {
            return (
              <div key={q.id || qIdx} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                      {qIdx + 1}
                    </span>
                    <span className="uppercase text-emerald-900 tracking-tight text-sm font-extrabold">
                      {q.content?.title || (isListening ? 'LISTENING SECTION' : 'READING SECTION')}
                    </span>
                  </div>
                </div>

                {sectionParts.map((pItem, pIdx) => {
                  const pQs = Array.isArray(pItem.questions) ? pItem.questions : [];

                  let pAudioSrc = pItem.audioUrl;
                  if ((!pAudioSrc || pAudioSrc.startsWith('blob:')) && pItem.audioFileName) {
                    try {
                      const cached = localStorage.getItem(`audio_file_${pItem.audioFileName}`);
                      if (cached) pAudioSrc = cached;
                    } catch (e) {}
                  }

                  return (
                    <div key={pIdx} className="space-y-4 border-b border-slate-200 pb-6 last:border-b-0 last:pb-0">
                      <div className="p-4 bg-purple-50/80 border-l-4 border-purple-600 rounded-r-2xl text-purple-950 font-extrabold text-xs leading-relaxed shadow-2xs">
                        {pItem.part_title || `PART ${pIdx + 1}: Instruction`}
                      </div>

                      {isListening && (
                        <div className="space-y-2 bg-white p-4 rounded-2xl border border-purple-200 shadow-2xs">
                          <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs">
                            <Volume2 className="w-4 h-4 text-purple-600" />
                            <span>Audio Part {pIdx + 1}</span>
                          </div>
                          {pAudioSrc ? (
                            <audio controls preload="auto" className="w-full h-9" src={pAudioSrc}>
                              Trình duyệt không hỗ trợ phát audio.
                            </audio>
                          ) : (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                              ⚠️ File audio MP3 Part {pIdx + 1} đang chờ Thầy chọn từ máy.
                            </div>
                          )}
                        </div>
                      )}

                      {isReading && pItem.passage && (
                        <div className="p-5 bg-white border border-emerald-200 rounded-2xl text-xs text-slate-800 leading-relaxed font-serif shadow-2xs">
                          {pItem.passage}
                        </div>
                      )}

                      <div className="space-y-4 pt-1">
                        {pQs.map((cQ, cIdx) => {
                          const childKey = `${q.id}_p${pIdx}_q${cIdx}`;
                          const selectedOptIndex = userAnswers[childKey];
                          const cOpts = Array.isArray(cQ.options) ? cQ.options : [];
                          const correctOptIndex = cOpts.findIndex((o) => o?.isCorrect);
                          const isCorrect = submitted && selectedOptIndex === correctOptIndex;
                          const isWrong = submitted && selectedOptIndex !== undefined && selectedOptIndex !== correctOptIndex;
                          const correctText = cOpts.find((o) => o?.isCorrect)?.text || 'Đáp án đúng';

                          const isLongOptions = cOpts.some(o => {
                            const txt = typeof o === 'string' ? o : (o.text || o.label || '');
                            return txt.length > 18;
                          });

                          return (
                            <div
                              key={cIdx}
                              className={`p-5 bg-white border rounded-2xl space-y-3 transition ${
                                submitted
                                  ? isCorrect
                                    ? 'border-emerald-400 bg-emerald-50/20'
                                    : 'border-rose-400 bg-rose-50/20'
                                  : 'border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-xs text-slate-900">{cQ.question}</h4>

                                {submitted && (
                                  <div>
                                    {isCorrect && (
                                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-lg flex items-center space-x-1">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Đúng</span>
                                      </span>
                                    )}
                                    {isWrong && (
                                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-extrabold rounded-lg flex items-center space-x-1">
                                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                        <span>Sai</span>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className={`grid gap-3 w-full items-stretch pt-1 ${
                                isLongOptions ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
                              }`}>
                                {cOpts.map((opt, oIdx) => {
                                  const isSelected = selectedOptIndex === oIdx;
                                  const isThisCorrect = opt?.isCorrect;
                                  const label = String.fromCharCode(65 + oIdx);

                                  let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700';
                                  if (submitted) {
                                    if (isThisCorrect) {
                                      btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                                    } else if (isSelected && !isThisCorrect) {
                                      btnStyle = 'bg-rose-100 border-rose-400 text-rose-950 font-bold line-through';
                                    }
                                  } else if (isSelected) {
                                    btnStyle = 'bg-emerald-600 text-white font-bold border-transparent shadow-xs';
                                  }

                                  return (
                                    <button
                                      key={oIdx}
                                      disabled={submitted}
                                      onClick={() => handleSelectAnswer(childKey, oIdx)}
                                      className={`w-full text-left px-3.5 py-2 rounded-2xl text-xs font-semibold border transition flex items-center space-x-2 whitespace-normal break-words ${btnStyle}`}
                                    >
                                      <span className={`w-4 h-4 rounded-full flex items-center justify-center font-extrabold text-[10px] flex-shrink-0 ${
                                        isSelected ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-600'
                                      }`}>
                                        {label}
                                      </span>
                                      <span className="leading-snug">{opt.text}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {submitted && renderFourBlockExplanation(cQ.explanation || q.content?.explanation, correctText)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          // DẠNG CÂU HỎI TRẮC NGHIỆM ĐƠN LẺ KHÁC
          return (
            <div key={q.id || qIdx} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                    {qIdx + 1}
                  </span>
                  <span className="uppercase text-emerald-900 tracking-tight text-sm font-extrabold">
                    {isListening ? 'LISTENING SECTION' : isReading ? 'READING SECTION' : 'MULTIPLE CHOICE'}
                  </span>
                </div>
              </div>

              {(q.content?.question || q.content?.title) && (
                <div className="p-4 bg-purple-50/80 border-l-4 border-purple-600 rounded-r-2xl text-purple-950 font-extrabold text-xs leading-relaxed shadow-2xs">
                  {q.content.question || q.content.title}
                </div>
              )}

              {isListening && (
                <div className="space-y-2 bg-white p-4 rounded-2xl border border-purple-200 shadow-2xs">
                  <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs">
                    <Volume2 className="w-4 h-4 text-purple-600" />
                    <span>Audio Bài Nghe (Listening Track)</span>
                  </div>
                  {audioSrc ? (
                    <audio controls preload="auto" className="w-full h-9" src={audioSrc}>
                      Trình duyệt của bạn không hỗ trợ phát audio.
                    </audio>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                      ⚠️ File audio MP3 đang chờ Thầy chọn từ máy tính hoặc dán link MP3.
                    </div>
                  )}
                </div>
              )}

              {isReading && (
                <div className="p-5 bg-white border border-emerald-200 rounded-2xl text-xs text-slate-800 leading-relaxed font-medium space-y-3">
                  <p className="text-slate-700 leading-relaxed text-justify">
                    {q.content?.passage || 'Nội dung đoạn văn bài đọc hiểu...'}
                  </p>
                </div>
              )}

              <div className="space-y-4 pt-1">
                {(childQuestions.length > 0
                  ? childQuestions
                  : [
                      {
                        question: q.content?.question || '1. Choose the correct answer A, B, C, or D.',
                        options: q.content?.options || [
                          { text: 'Option A', isCorrect: true },
                          { text: 'Option B', isCorrect: false },
                          { text: 'Option C', isCorrect: false },
                          { text: 'Option D', isCorrect: false },
                        ],
                        explanation: q.content?.explanation,
                      },
                    ]
                ).map((cQ, cIdx) => {
                  const childKey = `${q.id}_c${cIdx}`;
                  const selectedOptIndex = userAnswers[childKey];
                  const cOpts = Array.isArray(cQ.options) ? cQ.options : [];
                  const correctOptIndex = cOpts.findIndex((o) => o?.isCorrect);
                  const isCorrect = submitted && selectedOptIndex === correctOptIndex;
                  const isWrong = submitted && selectedOptIndex !== undefined && selectedOptIndex !== correctOptIndex;
                  const correctText = cOpts.find((o) => o?.isCorrect)?.text || 'Đáp án đúng';

                  const isLongOptions = cOpts.some(o => {
                    const txt = typeof o === 'string' ? o : (o.text || o.label || '');
                    return txt.length > 18;
                  });

                  return (
                    <div
                      key={cIdx}
                      className={`p-5 bg-white border rounded-2xl space-y-3 transition ${
                        submitted
                          ? isCorrect
                            ? 'border-emerald-400 bg-emerald-50/20'
                            : 'border-rose-400 bg-rose-50/20'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs text-slate-900">{cQ.question}</h4>

                        {submitted && (
                          <div>
                            {isCorrect && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-lg flex items-center space-x-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Đúng</span>
                              </span>
                            )}
                            {isWrong && (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-extrabold rounded-lg flex items-center space-x-1">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Sai</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className={`grid gap-3 w-full items-stretch pt-1 ${
                        isLongOptions ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
                      }`}>
                        {cOpts.map((opt, oIdx) => {
                          const isSelected = selectedOptIndex === oIdx;
                          const isThisCorrect = opt?.isCorrect;
                          const label = String.fromCharCode(65 + oIdx);

                          let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700';
                          if (submitted) {
                            if (isThisCorrect) {
                              btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                            } else if (isSelected && !isThisCorrect) {
                              btnStyle = 'bg-rose-100 border-rose-400 text-rose-950 font-bold line-through';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-emerald-600 text-white font-bold border-transparent shadow-xs';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={submitted}
                              onClick={() => handleSelectAnswer(childKey, oIdx)}
                              className={`w-full text-left px-3.5 py-2 rounded-2xl text-xs font-semibold border transition flex items-center space-x-2 whitespace-normal break-words ${btnStyle}`}
                            >
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center font-extrabold text-[10px] flex-shrink-0 ${
                                isSelected ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {label}
                              </span>
                              <span className="leading-snug">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {submitted && renderFourBlockExplanation(cQ.explanation || q.content?.explanation, correctText)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={() => handleSubmitQuiz(false)}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition"
        >
          Nộp Bài Thi Quiz Ngay
        </button>
      )}
    </div>
  );
}
