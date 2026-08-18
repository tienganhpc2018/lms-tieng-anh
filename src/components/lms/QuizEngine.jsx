import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, CheckCircle, Volume2, Eye, EyeOff, FileText, Clock, Award, User, AlertCircle, RefreshCw, XCircle, Lightbulb, Headphones, BookOpen, Search, MessageSquareText, Tag, Camera, UploadCloud, Image as ImageIcon, Printer, Download, Sparkles, Bot } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { compressImage } from '../../utils/imageCompressor';
import { gradeWritingSubmissionWithAI } from '../../services/writingAiGrader';
import { exportStudentPdfReport } from '../../utils/exportQuizReport';

export default function QuizEngine({ activity }) {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [uploadedStudentImages, setUploadedStudentImages] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [aiGradingResult, setAiGradingResult] = useState(null);
  const [isAiGradingLoading, setIsAiGradingLoading] = useState(false);

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
    submittedAt: null,
  });

  // TIMER LOGIC
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

  // HỌC SINH TẢI ẢNH BÀI LÀM TỰ LUẬN -> TỰ ĐỘNG NÉN ẢNH DƯỚI 1MB
  const handleStudentImageUpload = async (e, questionKey) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImage(file, 1200, 1200, 0.75);
      setUploadedStudentImages((prev) => ({ ...prev, [questionKey]: compressedBase64 }));
      alert('📸 Đã nén & tải ảnh bài làm thành công (Tối ưu dung lượng < 1MB)!');
    } catch (err) {
      console.error('Error compressing image:', err);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setUploadedStudentImages((prev) => ({ ...prev, [questionKey]: evt.target.result }));
        alert('📸 Đã tải ảnh bài làm thành công!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    setTimerActive(false);
    setIsAiGradingLoading(true);

    let correctCount = 0;
    let totalScore = 0;
    let totalQCount = 0;
    const totalMarks = questions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0);

    let writingQuestionInfo = null;

    questions.forEach((q) => {
      const sectionType = (q.content?.sectionType || q.type || '').toLowerCase();

      if (sectionType === 'writing_section' && Array.isArray(q.content?.parts)) {
        // Lưu câu hỏi tự luận để chấm bằng AI
        writingQuestionInfo = {
          title: q.content.title,
          prompt: q.content.parts.map(p => p.part_title).join('\n'),
          sampleAnswer: q.content.parts.map(p => p.questions?.map(cq => cq.sample_answer).join('\n')).join('\n'),
        };
      }

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
      } else if (['listening_section', 'reading_section', 'writing_section', 'multiple_choice'].includes(sectionType) && Array.isArray(q.content?.parts) && q.content.parts.length > 0) {
        q.content.parts.forEach((pItem, pIdx) => {
          const pQs = pItem.questions || [];
          const isTF = pItem.part_type === 'true_false';
          const isEssay = pItem.part_type === 'short_essay' || pItem.part_type === 'full_essay';

          pQs.forEach((cQ, qIdx) => {
            totalQCount += 1;
            const key = `${q.id}_p${pIdx}_q${qIdx}`;
            const selected = userAnswers[key];

            if (isTF) {
              if (selected === (cQ.correctAnswer || 'T')) {
                correctCount += 1;
                totalScore += 1;
              }
            } else if (isEssay) {
              if (selected && selected.trim() !== '') {
                correctCount += 1;
                totalScore += 1;
              }
            } else {
              const opts = Array.isArray(cQ.options) ? cQ.options : [];
              const correctOptIndex = opts.findIndex((o) => o?.isCorrect);
              if (selected === correctOptIndex && selected !== undefined) {
                correctCount += 1;
                totalScore += 1;
              }
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

    // 2. TỰ ĐỘNG CHẤM BÀI TỰ LUẬN VỚI AI VÀ OCR ÁNH
    let aiGrading = null;
    const firstImgUrl = Object.values(uploadedStudentImages)[0] || null;
    const studentGotedText = Object.values(userAnswers).filter(v => typeof v === 'string' && isNaN(v)).join('\n');

    if (writingQuestionInfo || firstImgUrl || studentGotedText) {
      try {
        aiGrading = await gradeWritingSubmissionWithAI({
          questionTitle: writingQuestionInfo?.title || 'WRITING SECTION',
          questionPrompt: writingQuestionInfo?.prompt || 'Bài làm tự luận Tiếng Anh',
          sampleAnswer: writingQuestionInfo?.sampleAnswer || '',
          studentText: studentGotedText,
          studentImageUrl: firstImgUrl,
        });
        setAiGradingResult(aiGrading);
      } catch (err) {
        console.error('Error running AI writing grader:', err);
      }
    }
    setIsAiGradingLoading(false);

    let elapsed = secondsElapsed;
    if (isCountdownMode) {
      elapsed = timeLimitSeconds - secondsRemaining;
    }
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeTakenStr = `${mins} phút ${secs} giây`;
    const isPassed = totalScore >= (totalMarks * 0.5);
    const nowIso = new Date().toISOString();

    const res = {
      studentName: profile?.full_name || 'Học Viên',
      timeTakenStr,
      correctCount,
      totalQuestions: totalQCount,
      score: totalScore,
      totalMarks,
      isPassed,
      submittedAt: nowIso,
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
          answers_data: { userAnswers, uploadedStudentImages, aiGrading },
          score: totalScore,
          status: 'graded',
        },
      ]);
    }
  };

  const renderPassageWithHighlights = (passageText) => {
    if (!passageText) return null;
    const parts = passageText.split(/('.*?'|".*?")/g);
    return parts.map((part, idx) => {
      if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) {
        return (
          <span key={idx} className="font-extrabold text-amber-950 bg-amber-200/90 px-1.5 py-0.5 rounded border border-amber-400 mx-0.5 shadow-2xs">
            {part}
          </span>
        );
      }
      return part;
    });
  };

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
        <p key={idx} className={`leading-relaxed text-slate-700 ${idx > 0 ? 'mt-1' : ''}`}>
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

  const renderCompactExplanation = (explanationText, correctText) => {
    if (!explanationText || explanationText.trim() === '') {
      return (
        <div className="mt-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] flex items-center justify-between text-emerald-950">
          <span className="font-extrabold">➔ Đáp án đúng: {correctText}</span>
          <span className="text-emerald-700 text-[10px]">💡 Nhớ từ vựng & cấu trúc trọng tâm!</span>
        </div>
      );
    }

    return (
      <div className="mt-1 p-2 bg-emerald-50/90 border border-emerald-300 rounded-xl text-[11px] space-y-0.5 text-slate-800">
        <span className="font-extrabold text-emerald-950 block border-b border-emerald-200 pb-0.5">
          ➔ ĐÁP ÁN ĐÚNG: {correctText}
        </span>
        <div className="pt-0.5">
          {renderFormattedParagraphs(explanationText)}
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
    <div className="space-y-3">
      {/* THÔNG BÁO TỔNG KẾT BÀI THI SAU KHU NỘP */}
      {submitted ? (
        <div className="p-5 bg-gradient-to-br from-slate-900 to-navy-900 text-white rounded-3xl shadow-xl space-y-5 border border-slate-700 animate-scale-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">KẾT QUẢ BÀI KÍỂM TRA</h3>
                <p className="text-[11px] text-slate-300">Học sinh: {resultData.studentName}</p>
              </div>
            </div>

            {/* NÚT IN / TẢI BÁO CÁO FILE PDF */}
            <button
              onClick={() =>
                exportStudentPdfReport({
                  studentName: resultData.studentName,
                  activityTitle: activity?.title || 'Bài Thi Quiz Online',
                  score: resultData.score,
                  totalMarks: resultData.totalMarks,
                  correctCount: resultData.correctCount,
                  totalQuestions: resultData.totalQuestions,
                  timeTakenStr: resultData.timeTakenStr,
                  submittedAt: resultData.submittedAt,
                  aiGradingFeedback: aiGradingResult?.detailedFeedback,
                })
              }
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4 text-sky-200" />
              <span>🖨️ Tải Báo Cáo PDF Bài Thi</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Thời Gian Làm</span>
              <span className="text-xs font-extrabold text-white flex items-center justify-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>{resultData.timeTakenStr}</span>
              </span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Số Câu Đúng</span>
              <span className="text-xs font-extrabold text-emerald-400">
                {resultData.correctCount} / {resultData.totalQuestions} câu
              </span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Tổng Điểm Đạt Được</span>
              <span className="text-xs font-extrabold text-amber-400">
                {resultData.score} / {resultData.totalMarks} điểm
              </span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Trạng Thái</span>
              <span
                className={`text-[11px] font-extrabold px-2 py-0.5 rounded inline-block ${
                  resultData.isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {resultData.isPassed ? 'VƯỢT QUA 🎉' : 'CHƯA ĐẠT ⚠️'}
              </span>
            </div>
          </div>

          {/* ĐÁNH GIÁ VÀ NHẬN XẾT BÀI VIẾT TỪ AI AGENT (NẾU CÓ BÀI WRITING) */}
          {aiGradingResult && (
            <div className="p-4 bg-gradient-to-r from-purple-950 to-slate-900 border border-purple-800 rounded-2xl space-y-3 shadow-inner text-xs">
              <div className="flex justify-between items-center border-b border-purple-800 pb-2">
                <span className="font-extrabold text-purple-300 uppercase tracking-wide flex items-center space-x-1.5">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>🤖 ĐÁNH GIÁ BÀI TỰ LUẬN TỰ ĐỘNG TỪ AI AGENT (GEMINI VISION OCR)</span>
                </span>
                <span className="px-2 py-0.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold rounded-md">
                  Điểm AI: {aiGradingResult.overallScore} / 10
                </span>
              </div>

              <div className="space-y-2 text-slate-200">
                {aiGradingResult.ocrExtractedText && (
                  <div className="p-2 bg-purple-900/40 rounded-xl border border-purple-800 text-[11px]">
                    <span className="font-bold text-purple-300 block mb-0.5">🔍 Nhận diện chữ bài viết tay (OCR):</span>
                    <p className="italic text-slate-300 font-serif">{aiGradingResult.ocrExtractedText}</p>
                  </div>
                )}

                {aiGradingResult.grammarFixes && aiGradingResult.grammarFixes.length > 0 && (
                  <div className="p-2 bg-rose-950/40 rounded-xl border border-rose-800/60 space-y-1">
                    <span className="font-bold text-rose-300 block">⚠️ Các lỗi ngữ pháp & từ vựng cần khắc phục:</span>
                    {aiGradingResult.grammarFixes.map((gf, idx) => (
                      <div key={idx} className="text-[11px] space-x-1">
                        <span className="line-through text-rose-300">{gf.original}</span>
                        <span className="text-emerald-400 font-bold">➔ {gf.suggestion}</span>
                        <span className="text-slate-400">({gf.explanation})</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-purple-800 leading-relaxed text-slate-200">
                  <span className="font-bold text-amber-400 block mb-1">💡 Nhận xét chi tiết:</span>
                  {aiGradingResult.detailedFeedback}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* THANH ĐỒNG HỒ THỜI GIAN LÀM BÀI */
        <div className="bg-slate-900 text-white p-3 rounded-2xl flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Học sinh: {profile?.full_name || 'Học Viên'}</span>
          </div>
          <div
            className={`flex items-center space-x-2 text-xs font-extrabold px-3 py-1 rounded-xl border transition ${
              isTimeWarning ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse' : 'bg-slate-800 text-emerald-400 border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
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
      <div className="space-y-3">
        {questions.map((q, qIdx) => {
          const sectionType = (q.content?.sectionType || q.type || 'multiple_choice').toLowerCase();
          const isWriting = sectionType === 'writing_section';
          const isReading = sectionType === 'reading_section';
          const isListening = sectionType === 'listening_section';
          const isReadingTF = sectionType === 'reading_tf';
          const isClozeTest = sectionType === 'cloze_test';
          const childQuestions = Array.isArray(q.content?.childQuestions) ? q.content.childQuestions : [];
          const sectionParts = Array.isArray(q.content?.parts) ? q.content.parts : [];

          // HIỂN THỊ DẠNG WRITING SECTION (3 PART)
          if (isWriting && sectionParts.length > 0) {
            return (
              <div key={q.id || qIdx} className="bg-white border-l-4 border-indigo-600 rounded-3xl p-5 shadow-xs border-y border-r border-slate-200 space-y-4">
                <div className="bg-indigo-50/70 rounded-xl p-3 flex justify-between items-center">
                  <h3 className="font-extrabold text-xs text-indigo-900 tracking-wide uppercase flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                      {qIdx + 1}
                    </span>
                    <span>{q.content?.title || 'WRITING SECTION'}</span>
                  </h3>
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>

                {sectionParts.map((pItem, pIdx) => {
                  const pQs = Array.isArray(pItem.questions) ? pItem.questions : [];
                  const isPart1MC = pItem.part_type === 'multiple_choice';
                  const isPart2Short = pItem.part_type === 'short_essay';

                  return (
                    <div key={pIdx} className="space-y-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="p-3 bg-purple-50/80 border-l-4 border-purple-600 rounded-r-xl text-purple-950 font-extrabold text-xs leading-relaxed shadow-2xs">
                        {pItem.part_title || `PART ${pIdx + 1}: Instructions`}
                      </div>

                      {pItem.passage && (
                        <div className="p-3.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs text-amber-950 leading-relaxed font-serif">
                          {pItem.passage}
                        </div>
                      )}

                      <div className="space-y-3 pt-1">
                        {pQs.map((cQ, cIdx) => {
                          const childKey = `${q.id}_p${pIdx}_q${cIdx}`;
                          const selectedVal = userAnswers[childKey] || '';

                          if (isPart1MC) {
                            const cOpts = Array.isArray(cQ.options) ? cQ.options : [];
                            const correctOptIndex = cOpts.findIndex((o) => o?.isCorrect);
                            const isCorrect = submitted && selectedVal === correctOptIndex;
                            const correctText = cOpts.find((o) => o?.isCorrect)?.text || 'Đáp án đúng';

                            return (
                              <div key={cIdx} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                                <h4 className="font-extrabold text-xs text-slate-900">{cQ.question}</h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {cOpts.map((opt, oIdx) => {
                                    const isSelected = selectedVal === oIdx;
                                    const isThisCorrect = opt?.isCorrect;
                                    const label = String.fromCharCode(65 + oIdx);

                                    let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700';
                                    if (submitted) {
                                      if (isThisCorrect) btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                                      else if (isSelected && !isThisCorrect) btnStyle = 'bg-rose-100 border-rose-400 text-rose-950 font-bold line-through';
                                    } else if (isSelected) {
                                      btnStyle = 'bg-indigo-600 text-white font-bold border-transparent shadow-xs';
                                    }

                                    return (
                                      <button
                                        key={oIdx}
                                        disabled={submitted}
                                        onClick={() => handleSelectAnswer(childKey, oIdx)}
                                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 whitespace-normal break-words ${btnStyle}`}
                                      >
                                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-extrabold text-[9px] flex-shrink-0 ${
                                          isSelected ? 'bg-white text-indigo-800' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                          {label}
                                        </span>
                                        <span className="leading-snug">{opt.text}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {submitted && renderCompactExplanation(cQ.explanation || pItem.explanation, correctText)}
                              </div>
                            );
                          } else if (isPart2Short) {
                            return (
                              <div key={cIdx} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                                <h4 className="font-extrabold text-xs text-slate-900 whitespace-pre-line">{cQ.question}</h4>
                                <input
                                  type="text"
                                  disabled={submitted}
                                  value={selectedVal}
                                  onChange={(e) => handleSelectAnswer(childKey, e.target.value)}
                                  placeholder="Gõ câu hoàn chỉnh của bạn tại đây..."
                                  className="w-full p-2.5 border border-indigo-200 rounded-xl text-xs bg-indigo-50/20 font-medium"
                                />
                                {submitted && (
                                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                                    <span className="font-bold text-emerald-950">➔ GỢI Ý ĐÁP ÁN MẪU: {cQ.sample_answer || 'Đáp án mẫu chuẩn'}</span>
                                    {renderFormattedParagraphs(cQ.explanation || pItem.explanation)}
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            const studentImgUrl = uploadedStudentImages[childKey];

                            return (
                              <div key={cIdx} className="p-4 bg-white border border-indigo-200 rounded-2xl space-y-3 shadow-xs">
                                <h4 className="font-extrabold text-xs text-slate-900 whitespace-pre-line">{cQ.question}</h4>

                                <div className="space-y-2">
                                  <label className="block text-[11px] font-bold text-indigo-900 uppercase">
                                    ✍️ HỌC SINH LÀM BÀI: DÁN VĂN BẢN HOẶC CHỤP ẢNH TẢI BÀI LÀM LÊN:
                                  </label>
                                  <textarea
                                    rows={6}
                                    disabled={submitted}
                                    value={selectedVal}
                                    onChange={(e) => handleSelectAnswer(childKey, e.target.value)}
                                    placeholder="Học sinh có thể gõ/dán bài văn trực tiếp vào ô này..."
                                    className="w-full p-3 border border-indigo-300 rounded-xl text-xs bg-white font-serif leading-relaxed"
                                  />
                                </div>

                                <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Camera className="w-4 h-4 text-indigo-600" />
                                    <span className="text-xs font-extrabold text-indigo-950">Chụp ảnh / Tải ảnh bài làm từ máy (Tự động nén):</span>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={submitted}
                                    onChange={(e) => handleStudentImageUpload(e, childKey)}
                                    className="text-xs"
                                  />
                                </div>

                                {studentImgUrl && (
                                  <div className="p-2 bg-slate-100 border rounded-xl text-center">
                                    <span className="text-[10px] font-bold text-slate-600 block mb-1">📷 Ảnh bài làm đã tải lên & nén (&lt; 1MB):</span>
                                    <img src={studentImgUrl} alt="Bài làm học sinh" className="max-h-48 mx-auto rounded-lg shadow-sm border" />
                                  </div>
                                )}

                                {submitted && (
                                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                                    <span className="font-bold text-emerald-950">💡 GỢI Ý DÀN Ý VÀ TIÊU CHUẨN CHẤM:</span>
                                    <div className="text-slate-800">{renderFormattedParagraphs(cQ.sample_answer || cQ.explanation || pItem.explanation)}</div>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          // DẠNG 3: READING (True/False)
          if (isReadingTF) {
            return (
              <div key={q.id || qIdx} className="bg-white border-l-4 border-emerald-500 rounded-3xl p-4 shadow-xs border-y border-r border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                    {qIdx + 1}
                  </span>
                  <span className="font-extrabold text-emerald-900 text-xs uppercase">
                    {q.content?.title || 'READING (True/False)'}
                  </span>
                </div>

                <div className="p-2.5 bg-purple-50/80 border-l-4 border-purple-600 rounded-r-xl text-purple-950 font-extrabold text-xs leading-relaxed shadow-2xs">
                  {q.content?.question || 'Read the passage and decide whether the statements are True (T) or False (F).'}
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3.5 text-slate-800 font-serif text-xs leading-relaxed text-justify shadow-2xs">
                  {renderPassageWithHighlights(q.content?.passage)}
                </div>

                <div className="space-y-1.5 pt-0.5">
                  {childQuestions.map((cQ, cIdx) => {
                    const childKey = `${q.id}_c${cIdx}`;
                    const selectedVal = userAnswers[childKey];
                    return (
                      <div key={cIdx} className="space-y-1">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 gap-3">
                          <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                            {cQ.question}
                          </span>

                          <div className="flex items-center space-x-1.5 flex-shrink-0">
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

                        {submitted && renderCompactExplanation(cQ.explanation || q.content?.explanation, cQ.correctAnswer === 'T' ? 'True (T)' : 'False (F)')}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // DẠNG 4: KNOWLEDGE OF LANGUAGE (Cloze Test)
          if (isClozeTest) {
            const tasksList = Array.isArray(q.content?.tasks) && q.content.tasks.length > 0
              ? q.content.tasks
              : [
                  {
                    task_title: q.content?.question?.split('\n')[0] || "PART 1: READ THE FIRST TEXT AND CHOOSE THE CORRECT WORD TO FILL IN EACH BLANK.",
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
              <div key={q.id || qIdx} className="bg-white border-l-4 border-blue-600 rounded-3xl p-4 shadow-xs border-y border-r border-slate-200 space-y-3">
                <div className="bg-blue-50/70 rounded-xl p-2.5 flex justify-between items-center">
                  <h3 className="font-extrabold text-xs text-blue-900 tracking-wide uppercase flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                      {qIdx + 1}
                    </span>
                    <span>{q.content?.title || 'KNOWLEDGE OF LANGUAGE'}</span>
                  </h3>
                  <Volume2 className="w-4 h-4 text-blue-600 cursor-pointer" />
                </div>

                {tasksList.map((taskItem, tIdx) => {
                  const tQuestions = taskItem.questions || [];

                  return (
                    <div key={tIdx} className="space-y-2.5 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                      <div className="p-2.5 bg-purple-50/80 border-l-4 border-purple-600 rounded-r-xl text-purple-950 font-extrabold text-xs leading-relaxed shadow-2xs space-y-0.5">
                        <h4 className="uppercase tracking-tight text-purple-950">
                          {taskItem.task_title}
                        </h4>
                        {taskItem.task_sub && (
                          <p className="text-[10px] italic text-purple-800 font-medium">
                            {taskItem.task_sub}
                          </p>
                        )}
                      </div>

                      <div className="border border-slate-300 rounded-2xl bg-amber-50/20 p-3.5 relative space-y-1 mt-1.5">
                        <span className={`text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase absolute -top-2.5 left-3 shadow-xs ${
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
                          {renderPassageWithHighlights(taskItem.passage_content)}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-0.5">
                        {tQuestions.map((cQ, cIdx) => {
                          const childKey = `${q.id}_t${tIdx}_q${cIdx}`;
                          const selectedVal = userAnswers[childKey];
                          const opts = Array.isArray(cQ.options) ? cQ.options : [];
                          const correctOpt = cQ.correct_option || opts.find(o => o.isCorrect)?.id || opts.find(o => o.isCorrect)?.text?.substring(0,1);

                          const maxOptLen = Math.max(...opts.map(o => (typeof o === 'string' ? o : (o.text || o.label || '')).length));

                          let btnFontSize = 'text-xs px-2.5 py-1.5';
                          if (maxOptLen > 22) {
                            btnFontSize = 'text-[10px] px-1.5 py-1 leading-tight';
                          } else if (maxOptLen > 15) {
                            btnFontSize = 'text-[11px] px-2 py-1 leading-snug';
                          }

                          return (
                            <div key={cIdx} className="space-y-0.5">
                              <div className="flex items-center gap-2 w-full">
                                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[11px] flex items-center justify-center flex-shrink-0">
                                  {cQ.question_number || (16 + cIdx)}
                                </span>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full items-stretch">
                                  {opts.map((opt, oIdx) => {
                                    const optVal = opt.id || String.fromCharCode(65 + oIdx);
                                    const optText = opt.text || `${optVal}. ${opt.label || opt}`;
                                    const isSelected = selectedVal === optVal || selectedVal === oIdx;

                                    return (
                                      <button
                                        key={oIdx}
                                        disabled={submitted}
                                        onClick={() => handleSelectAnswer(childKey, optVal)}
                                        className={`rounded-xl ${btnFontSize} transition font-semibold text-left whitespace-normal break-words border flex items-center space-x-1 ${
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

                              {submitted && renderCompactExplanation(cQ.explanation || taskItem.explanation, correctOpt ? `Option ${correctOpt}` : 'Đáp án đúng')}
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

          // NẾU LÀ LISTENING_SECTION HOẶC READING_SECTION CÓ MULTI PARTS
          if ((isListening || isReading) && sectionParts.length > 0) {
            return (
              <div key={q.id || qIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                      {qIdx + 1}
                    </span>
                    <span className="uppercase text-emerald-900 tracking-tight text-xs font-extrabold">
                      {q.content?.title || (isListening ? 'LISTENING SECTION' : 'READING SECTION')}
                    </span>
                  </div>
                </div>

                {sectionParts.map((pItem, pIdx) => {
                  const pQs = Array.isArray(pItem.questions) ? pItem.questions : [];
                  const isTF = pItem.part_type === 'true_false';

                  let pAudioSrc = pItem.audioUrl;
                  if ((!pAudioSrc || pAudioSrc.startsWith('blob:')) && pItem.audioFileName) {
                    try {
                      const cached = localStorage.getItem(`audio_file_${pItem.audioFileName}`);
                      if (cached) pAudioSrc = cached;
                    } catch (e) {}
                  }

                  return (
                    <div key={pIdx} className="space-y-2 border-b border-slate-200 pb-2.5 last:border-b-0 last:pb-0">
                      <div className="p-2.5 bg-purple-50/80 border-l-4 border-purple-600 rounded-r-xl text-purple-950 font-extrabold text-xs leading-relaxed shadow-2xs">
                        {pItem.part_title || `PART ${pIdx + 1}: Instruction`}
                      </div>

                      {isListening && (
                        <div className="bg-white p-2 rounded-xl border border-purple-200 shadow-2xs">
                          {pAudioSrc ? (
                            <audio controls preload="auto" className="w-full h-8" src={pAudioSrc}>
                              Trình duyệt không hỗ trợ phát audio.
                            </audio>
                          ) : (
                            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 font-medium">
                              ⚠️ File audio MP3 Part {pIdx + 1} đang chờ Thầy chọn từ máy.
                            </div>
                          )}
                        </div>
                      )}

                      {isReading && pItem.passage && (
                        <div className="p-3.5 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 leading-relaxed font-serif text-justify shadow-2xs">
                          {renderPassageWithHighlights(pItem.passage)}
                        </div>
                      )}

                      <div className="space-y-1.5 pt-0.5">
                        {pQs.map((cQ, cIdx) => {
                          const childKey = `${q.id}_p${pIdx}_q${cIdx}`;
                          const selectedVal = userAnswers[childKey];

                          if (isTF) {
                            const correctAnsTF = cQ.correctAnswer || 'T';
                            return (
                              <div key={cIdx} className="p-2.5 bg-white border border-emerald-200 rounded-xl space-y-1 shadow-2xs">
                                <div className="flex justify-between items-center gap-3">
                                  <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                                    {cQ.question}
                                  </span>

                                  <div className="flex items-center space-x-1.5 flex-shrink-0">
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

                                {submitted && renderCompactExplanation(cQ.explanation || pItem.explanation, correctAnsTF === 'T' ? 'True (T)' : 'False (F)')}
                              </div>
                            );
                          }

                          const cOpts = Array.isArray(cQ.options) ? cQ.options : [];
                          const correctOptIndex = cOpts.findIndex((o) => o?.isCorrect);
                          const isCorrect = submitted && selectedVal === correctOptIndex;
                          const isWrong = submitted && selectedVal !== undefined && selectedVal !== correctOptIndex;
                          const correctText = cOpts.find((o) => o?.isCorrect)?.text || 'Đáp án đúng';

                          const maxOptLen = Math.max(...cOpts.map(o => (typeof o === 'string' ? o : (o.text || o.label || '')).length));

                          let btnFontSize = 'text-xs px-2.5 py-1.5';
                          if (maxOptLen > 30) {
                            btnFontSize = 'text-[10px] px-1.5 py-1 leading-tight';
                          } else if (maxOptLen > 18) {
                            btnFontSize = 'text-[11px] px-2 py-1 leading-snug';
                          }

                          return (
                            <div
                              key={cIdx}
                              className={`p-2.5 bg-white border rounded-xl space-y-1.5 transition shadow-2xs ${
                                submitted
                                  ? isCorrect
                                    ? 'border-emerald-400 bg-emerald-50/20'
                                    : 'border-rose-400 bg-rose-50/20'
                                  : 'border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-xs text-slate-900">
                                  {cQ.question}
                                </h4>

                                {submitted && (
                                  <div>
                                    {isCorrect && (
                                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded flex items-center space-x-1">
                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                        <span>Đúng</span>
                                      </span>
                                    )}
                                    {isWrong && (
                                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded flex items-center space-x-1">
                                        <XCircle className="w-3 h-3 text-rose-600" />
                                        <span>Sai</span>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full items-stretch pt-0.5">
                                {cOpts.map((opt, oIdx) => {
                                  const isSelected = selectedVal === oIdx;
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
                                      className={`w-full text-left rounded-xl ${btnFontSize} font-semibold border transition flex items-center space-x-1 whitespace-normal break-words ${btnStyle}`}
                                    >
                                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-extrabold text-[9px] flex-shrink-0 ${
                                        isSelected ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-600'
                                      }`}>
                                        {label}
                                      </span>
                                      <span className="leading-snug">{opt.text}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {submitted && renderCompactExplanation(cQ.explanation || pItem.explanation, correctText)}
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

          // DẠNG TRẮC NGHIỆM ĐƠN LẺ KHÁC
          return (
            <div key={q.id || qIdx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-3xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                    {qIdx + 1}
                  </span>
                  <span className="uppercase text-emerald-900 tracking-tight text-xs font-extrabold">
                    {isListening ? 'LISTENING SECTION' : isReading ? 'READING SECTION' : 'MULTIPLE CHOICE'}
                  </span>
                </div>
              </div>

              {(q.content?.question || q.content?.title) && (
                <div className="p-2.5 bg-purple-50/80 border-l-4 border-purple-600 rounded-r-xl text-purple-950 font-extrabold text-xs leading-relaxed shadow-2xs">
                  {q.content.question || q.content.title}
                </div>
              )}

              <div className="space-y-1.5 pt-0.5">
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

                  const maxOptLen = Math.max(...cOpts.map(o => (typeof o === 'string' ? o : (o.text || o.label || '')).length));

                  let btnFontSize = 'text-xs px-2.5 py-1.5';
                  if (maxOptLen > 30) {
                    btnFontSize = 'text-[10px] px-1.5 py-1 leading-tight';
                  } else if (maxOptLen > 18) {
                    btnFontSize = 'text-[11px] px-2 py-1 leading-snug';
                  }

                  return (
                    <div
                      key={cIdx}
                      className={`p-2.5 bg-white border rounded-xl space-y-1.5 transition ${
                        submitted
                          ? isCorrect
                            ? 'border-emerald-400 bg-emerald-50/20'
                            : 'border-rose-400 bg-rose-50/20'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs text-slate-900">
                          {cQ.question}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full items-stretch pt-0.5">
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
                              className={`w-full text-left rounded-xl ${btnFontSize} font-semibold border transition flex items-center space-x-1 whitespace-normal break-words ${btnStyle}`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-extrabold text-[9px] flex-shrink-0 ${
                                isSelected ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {label}
                              </span>
                              <span className="leading-snug">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {submitted && renderCompactExplanation(cQ.explanation || q.content?.explanation, correctText)}
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
          disabled={isAiGradingLoading}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center justify-center space-x-2"
        >
          {isAiGradingLoading ? (
            <span>🤖 AI đang chấm bài tự luận & tổng hợp kết quả...</span>
          ) : (
            <span>Nộp Bài Thi Quiz Ngay</span>
          )}
        </button>
      )}
    </div>
  );
}
