import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, CheckCircle, Volume2, Eye, EyeOff, FileText, Clock, Award, User, AlertCircle, RefreshCw, XCircle, Lightbulb, Headphones, BookOpen, Search } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function QuizEngine({ activity }) {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Bộ đếm thời gian làm bài (Timer)
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

  useEffect(() => {
    let interval = null;
    if (timerActive && !submitted) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, submitted]);

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
          const safeData = (data || []).map((q) => {
            let cObj = q.content;
            if (typeof cObj === 'string') {
              try {
                cObj = JSON.parse(cObj);
              } catch (e) {
                cObj = { question: q.content };
              }
            }
            return {
              ...q,
              content: cObj || {},
            };
          });
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

  const handleSelectAnswer = (questionKey, optionIndex) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionKey]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    setTimerActive(false);

    let correctCount = 0;
    let totalScore = 0;
    let totalQCount = 0;
    const totalMarks = questions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0);

    questions.forEach((q) => {
      const childs = q.content?.childQuestions;
      if (Array.isArray(childs) && childs.length > 0) {
        childs.forEach((c, cIdx) => {
          totalQCount += 1;
          const key = `${q.id}_c${cIdx}`;
          const selected = userAnswers[key];
          const opts = Array.isArray(c.options) ? c.options : [];
          const correctOptIndex = opts.findIndex((o) => o?.isCorrect);
          if (selected === correctOptIndex && selected !== undefined) {
            correctCount += 1;
            totalScore += 1;
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
    });

    const mins = Math.floor(secondsElapsed / 60);
    const secs = secondsElapsed % 60;
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

  // Render Khối AI Giải Thích Chuẩn 4 Phần Cho Học Sinh Yếu
  const renderFourBlockExplanation = (explanationText, correctText) => {
    if (!explanationText) {
      return (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2">
          <p className="font-bold text-emerald-900">➔ Đáp án đúng: {correctText || 'Chính xác'}</p>
          <p className="text-emerald-800">💡 Hãy ghi nhớ công thức và từ vựng trọng tâm bài học!</p>
        </div>
      );
    }

    return (
      <div className="p-5 bg-emerald-50/80 border border-emerald-300 rounded-3xl space-y-3 text-xs">
        <p className="font-extrabold text-emerald-950 text-sm flex items-center space-x-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>➔ Đáp án đúng: {correctText}</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-3.5 bg-white border border-emerald-200 rounded-2xl space-y-1">
            <span className="font-extrabold text-emerald-900 flex items-center space-x-1 text-[11px]">
              <Search className="w-3.5 h-3.5 text-sky-600" />
              <span>Phân tích ngữ pháp/ngữ cảnh:</span>
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {explanationText.includes('Phân tích ngữ pháp')
                ? explanationText.split('💡')[0].replace(/🔍/g, '').replace('Phân tích ngữ pháp/ngữ cảnh:', '').trim()
                : 'Câu hỏi kiểm tra kiến thức từ vựng & ngữ pháp trọng tâm theo bài học.'}
            </p>
          </div>

          <div className="p-3.5 bg-white border border-emerald-200 rounded-2xl space-y-1">
            <span className="font-extrabold text-emerald-900 flex items-center space-x-1 text-[11px]">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Giải thích chi tiết:</span>
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {explanationText.includes('Giải thích chi tiết')
                ? (explanationText.split('✕')[0] || explanationText).split('💡')[1]?.replace('Giải thích chi tiết:', '').trim()
                : explanationText}
            </p>
          </div>

          <div className="p-3.5 bg-white border border-emerald-200 rounded-2xl space-y-1">
            <span className="font-extrabold text-rose-900 flex items-center space-x-1 text-[11px]">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Loại trừ gây nhiễu:</span>
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {explanationText.includes('Loại trừ gây nhiễu')
                ? (explanationText.split('🇻🇳')[0] || '').split('✕')[1]?.replace('Loại trừ gây nhiễu:', '').trim()
                : 'Các phương án còn lại sai về ý nghĩa hoặc không đúng ngữ pháp.'}
            </p>
          </div>

          <div className="p-3.5 bg-white border border-emerald-200 rounded-2xl space-y-1">
            <span className="font-extrabold text-emerald-900 flex items-center space-x-1 text-[11px]">
              <span className="text-xs">🇻🇳</span>
              <span>Bản dịch nghĩa song ngữ:</span>
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {explanationText.includes('Bản dịch nghĩa song ngữ')
                ? explanationText.split('🇻🇳')[1]?.replace('Bản dịch nghĩa song ngữ:', '').trim()
                : 'Dịch câu hỏi và đáp án chuẩn Tiếng Việt giúp học sinh dễ nhớ.'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <LoadingSpinner text="Đang tải bài làm..." />;

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
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Học sinh: {profile?.full_name || 'Học Viên'}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-extrabold bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              Thời gian: {Math.floor(secondsElapsed / 60)} phút {secondsElapsed % 60} giây
            </span>
          </div>
        </div>
      )}

      {/* DANH SÁCH CÂU HỎI */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const isReading = q.type?.toLowerCase() === 'reading_section';
          const isListening = q.type?.toLowerCase() === 'listening_section';
          const childQuestions = Array.isArray(q.content?.childQuestions) ? q.content.childQuestions : [];

          if (isReading || isListening || childQuestions.length > 0) {
            return (
              <div key={q.id || qIdx} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base">
                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                      {qIdx + 1}
                    </span>
                    <span className="uppercase text-emerald-900 tracking-tight">
                      {isListening ? 'PHẦN 1: LISTENING SECTION' : 'PHẦN 2: READING SECTION'}
                    </span>
                  </div>
                </div>

                {/* BÀI NGHE LISTENING CÓ KHUNG PHÁT AUDIO MP3 */}
                {isListening && (
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-purple-200">
                    <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs">
                      <Volume2 className="w-4 h-4 text-purple-600" />
                      <span>Bài Nghe Audio MP3: {q.content?.audioFileName ? `(${q.content.audioFileName})` : ''}</span>
                    </div>
                    {q.content?.audioUrl ? (
                      <audio controls className="w-full">
                        <source src={q.content.audioUrl} />
                      </audio>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                        ⚠️ Bài nghe này chưa có tệp audio MP3.
                      </div>
                    )}
                  </div>
                )}

                {/* BÀI ĐỌC READING SECTION CÓ ĐOẠN VĂN */}
                {isReading && (
                  <div className="p-5 bg-white border border-emerald-200 rounded-2xl text-xs text-slate-800 leading-relaxed font-medium space-y-3">
                    <h5 className="font-extrabold text-emerald-900 text-sm">
                      {q.content?.title || 'Read the passage carefully and choose the correct answer.'}
                    </h5>
                    <p className="text-slate-700 leading-relaxed text-justify">
                      {q.content?.passage || 'Nội dung đoạn văn bài đọc hiểu...'}
                    </p>
                  </div>
                )}

                {/* DANH SÁCH CÂU HỎI TRẮC NGHIỆM CON KÈM AI GIẢI THÍCH 4 KHỐI */}
                <div className="space-y-4 pt-2">
                  {(childQuestions.length > 0
                    ? childQuestions
                    : [
                        {
                          question: '1. What traditional craft is Chuong village famous for?',
                          options: [
                            { text: 'A. Making pottery', isCorrect: false },
                            { text: 'B. Making conical hats', isCorrect: true },
                            { text: 'C. Weaving silk', isCorrect: false },
                            { text: 'D. Carving wood', isCorrect: false },
                          ],
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
                          <h4 className="font-extrabold text-sm text-slate-900">{cQ.question}</h4>

                          {submitted && (
                            <div>
                              {isCorrect && (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-lg flex items-center space-x-1">
                                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                                  <span>Đúng</span>
                                </span>
                              )}
                              {isWrong && (
                                <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-extrabold rounded-lg flex items-center space-x-1">
                                  <XCircle className="w-4 h-4 text-rose-600" />
                                  <span>Sai</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 4 LỰA CHỌN TRẮC NGHIỆM */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {cOpts.map((opt, oIdx) => {
                            const isSelected = selectedOptIndex === oIdx;
                            const isThisCorrect = opt?.isCorrect;

                            let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700';
                            if (submitted) {
                              if (isThisCorrect) {
                                btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                              } else if (isSelected && !isThisCorrect) {
                                btnStyle = 'bg-rose-100 border-rose-400 text-rose-950 font-bold line-through';
                              }
                            } else if (isSelected) {
                              btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs';
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleSelectAnswer(childKey, oIdx)}
                                className={`p-3 rounded-xl text-xs font-semibold text-left border transition flex items-center space-x-2 ${btnStyle}`}
                              >
                                <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center font-bold text-[11px] text-slate-500">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* KHỐI AI GIẢI THÍCH 4 PHẦN DÀNH CHO HỌC SINH YẾU */}
                        {submitted && renderFourBlockExplanation(cQ.explanation || q.content?.explanation, correctText)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // CÂU HỎI TRẮC NGHIỆM ĐƠN LẺ
          const selectedOptIndex = userAnswers[q.id];
          const qOpts = Array.isArray(q.content?.options) ? q.content.options : [];
          const correctOptIndex = qOpts.findIndex((o) => o?.isCorrect);
          const isCorrect = submitted && selectedOptIndex === correctOptIndex;
          const isWrong = submitted && selectedOptIndex !== undefined && selectedOptIndex !== correctOptIndex;
          const correctText = qOpts.find((o) => o?.isCorrect)?.text || 'Đáp án đúng';

          return (
            <div
              key={q.id || qIdx}
              className={`p-5 bg-white border rounded-2xl shadow-xs space-y-3 transition ${
                submitted
                  ? isCorrect
                    ? 'border-emerald-400 bg-emerald-50/20'
                    : 'border-rose-400 bg-rose-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                    {qIdx + 1}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900">{q.content?.question || q.content?.title || 'Question'}</h4>
                </div>

                {submitted && (
                  <div>
                    {isCorrect && (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-lg flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Chính xác</span>
                      </span>
                    )}
                    {isWrong && (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-extrabold rounded-lg flex items-center space-x-1">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Chưa đúng</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {qOpts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {qOpts.map((opt, oIdx) => {
                    const isSelected = selectedOptIndex === oIdx;
                    const isThisCorrect = opt?.isCorrect;

                    let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700';
                    if (submitted) {
                      if (isThisCorrect) {
                        btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                      } else if (isSelected && !isThisCorrect) {
                        btnStyle = 'bg-rose-100 border-rose-400 text-rose-950 font-bold line-through';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs';
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectAnswer(q.id, oIdx)}
                        className={`p-3 rounded-xl text-xs font-semibold text-left border transition ${btnStyle}`}
                      >
                        <span className="mr-2 font-bold text-slate-500">{String.fromCharCode(65 + oIdx)}.</span>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* KHỐI AI GIẢI THÍCH 4 PHẦN CHUẨN ẢNH 2 */}
              {submitted && renderFourBlockExplanation(q.content?.explanation, correctText)}
            </div>
          );
        })}

        {!submitted && (
          <button
            onClick={handleSubmitQuiz}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition"
          >
            Nộp Bài Thi Quiz Ngay
          </button>
        )}
      </div>
    </div>
  );
}
