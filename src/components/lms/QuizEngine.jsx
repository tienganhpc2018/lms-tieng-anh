import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, CheckCircle, Volume2, Eye, EyeOff, FileText, Clock, Award, User, AlertCircle, RefreshCw, XCircle, Lightbulb, Headphones, BookOpen } from 'lucide-react';
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

  // Toggle Ẩn / Hiện Đáp Án & Audioscript
  const [showAudioscript, setShowAudioscript] = useState(false);

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
      setLoading(true);
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('activity_id', activity.id)
        .order('created_at', { ascending: true });

      setQuestions(data || []);
      setLoading(false);
    }
    if (activity?.id) fetchQuestions();
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
      if (childs && childs.length > 0) {
        childs.forEach((c, cIdx) => {
          totalQCount += 1;
          const key = `${q.id}_c${cIdx}`;
          const selected = userAnswers[key];
          const correctOptIndex = c.options?.findIndex((o) => o.isCorrect);
          if (selected === correctOptIndex) {
            correctCount += 1;
            totalScore += 1;
          }
        });
      } else {
        totalQCount += 1;
        const selected = userAnswers[q.id];
        const correctOptIndex = q.content?.options?.findIndex((o) => o.isCorrect);
        if (selected === correctOptIndex) {
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

    if (profile?.id) {
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

  if (loading) return <LoadingSpinner text="Đang tải đề thi..." />;

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
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg inline-block ${
                resultData.isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
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

      {/* RENDER DANH SÁCH BÀI ĐỌC HIỂU & CÁC CÂU HỎI TRẮC NGHIỆM CON (CHUẨN 100% ẢNH 2) */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const isReading = q.type?.toLowerCase() === 'reading_section';
          const isListening = q.type?.toLowerCase() === 'listening_section';
          const childQuestions = q.content?.childQuestions;

          if (isReading || (childQuestions && childQuestions.length > 0)) {
            return (
              <div key={q.id} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base">
                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                      {qIdx + 1}
                    </span>
                    <span className="uppercase text-emerald-900 tracking-tight">READING SECTION</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg">
                    Classroom & School Activity
                  </span>
                </div>

                <p className="text-xs text-slate-600 italic font-medium">
                  {q.content?.question || 'Read the passage carefully and answer the questions that follow.'}
                </p>

                {/* KHUNG ĐOẠN VĂN BÀI ĐỌC HIỂU CHUẨN 100% ẢNH 2 */}
                <div className="p-5 bg-white border border-emerald-200 rounded-2xl text-xs text-slate-800 leading-relaxed font-medium shadow-2xs space-y-3">
                  <h5 className="font-extrabold text-emerald-900 text-sm">
                    {q.content?.title || 'Read the passage about Chuong conical hat village and choose the correct answer A, B, C, or D.'}
                  </h5>
                  <p className="text-slate-700 leading-relaxed text-justify">
                    {q.content?.passage ||
                      'Chuong village in Hanoi is famous for its long history of making conical hats (non la). For centuries, local artisans have passed down the craft from generation to generation. However, in recent years, the village has faced up to many challenges. Fewer young people want to learn the craft because they do not know how to make a living from it. To deal with this problem, the local community has turned the village into a tourist destination. Visitors come here to learn how to make conical hats themselves. Artisans show them where to buy the best palm leaves and how to sew the hats neatly. This initiative has helped the village avoid having to close down. Now, the locals are looking forward to welcoming more international tourists. By combining traditional crafts with tourism, Chuong village not only preserves its heritage but also improves the local economy.'}
                  </p>
                </div>

                {/* DANH SÁCH 5 CÂU HỎI TRẮC NGHIỆM CON BÊN DƯỚI (TRÌNH BÀY CHUẨN 2 CỘT A, C & B, D ẢNH 2) */}
                <div className="space-y-4 pt-2">
                  {(childQuestions && childQuestions.length > 0
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
                    const correctOptIndex = cQ.options?.findIndex((o) => o.isCorrect);
                    const isCorrect = submitted && selectedOptIndex === correctOptIndex;
                    const isWrong = submitted && selectedOptIndex !== undefined && selectedOptIndex !== correctOptIndex;

                    return (
                      <div
                        key={cIdx}
                        className={`p-4 bg-white border rounded-2xl space-y-3 transition ${
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

                        {/* 4 LỰA CHỌN TRẮC NGHIỆM 2 CỘT A, C & B, D CHUẨN ẢNH 2 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {cQ.options?.map((opt, oIdx) => {
                            const isSelected = selectedOptIndex === oIdx;
                            const isThisCorrect = opt.isCorrect;

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

                        {submitted && cQ.explanation && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-xs font-medium italic">
                            {cQ.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // CÂU HỎI TRẮC NGHIỆM ĐƠN LẺ KHÁC
          const selectedOptIndex = userAnswers[q.id];
          const correctOptIndex = q.content?.options?.findIndex((o) => o.isCorrect);
          const isCorrect = submitted && selectedOptIndex === correctOptIndex;
          const isWrong = submitted && selectedOptIndex !== undefined && selectedOptIndex !== correctOptIndex;

          return (
            <div
              key={q.id}
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
                  <h4 className="font-extrabold text-sm text-slate-900">{q.content?.question}</h4>
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

              {q.content?.options && q.content?.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.content?.options?.map((opt, oIdx) => {
                    const isSelected = selectedOptIndex === oIdx;
                    const isThisCorrect = opt.isCorrect;

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

              {submitted && (
                <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl text-xs space-y-1.5 animate-fade-in">
                  <div className="flex items-center space-x-1.5 font-extrabold text-emerald-900">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>💡 AI GIẢI THÍCH CHI TIẾT ĐÁP ÁN:</span>
                  </div>
                  <p className="leading-relaxed font-medium">
                    {q.content?.explanation ||
                      `Đáp án đúng là "${q.content?.options?.find((o) => o.isCorrect)?.text || 'chính xác'}". Hãy học thuộc công thức ngữ pháp để ghi nhớ sâu nhé!`}
                  </p>
                </div>
              )}
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
