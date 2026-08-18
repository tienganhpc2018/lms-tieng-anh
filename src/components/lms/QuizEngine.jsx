import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, CheckCircle, Volume2, Eye, EyeOff, FileText, Clock, Award, User, AlertCircle, RefreshCw } from 'lucide-react';
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

  const handleSelectAnswer = (questionId, optionIndex) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    setTimerActive(false);

    let correctCount = 0;
    let totalScore = 0;
    const totalMarks = questions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0);

    questions.forEach((q) => {
      const selected = userAnswers[q.id];
      const correctOptIndex = q.content?.options?.findIndex((o) => o.isCorrect);
      if (selected === correctOptIndex) {
        correctCount += 1;
        totalScore += Number(q.marks) || 1;
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
      totalQuestions: questions.length,
      score: totalScore,
      totalMarks,
      isPassed,
    };

    setResultData(res);
    setSubmitted(true);

    // Lưu điểm bài thi vào Database Supabase
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

  const audioUrl = activity?.settings?.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  return (
    <div className="space-y-6">
      {/* THÔNG BÁO TỔNG KẾT BÀI THI SAU KHU NỘP (Chuẩn Ảnh 1) */}
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

          <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl text-center space-y-1">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-extrabold text-base text-emerald-300">
              {resultData.isPassed
                ? 'Chúc mừng bạn đã hoàn thành xuất sắc bài kiểm tra!'
                : 'Bạn chưa đạt điểm tối thiểu. Hãy xem lại kiến thức và thử làm lại nhé!'}
            </h4>
          </div>
        </div>
      ) : (
        /* TIMER ĐẾM THỜI GIAN LÀM BÀI */
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

      {/* KHU VỰC BÀI TẬP LISTENING / READING & NÚT AUDIOSCRIPT (Chuẩn Ảnh 3) */}
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
        <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-base">
          <Volume2 className="w-5 h-5 text-emerald-600" />
          <span>Bài Nghe Listening Audio & Hướng Dẫn Làm Bài</span>
        </div>

        {/* Trình phát Audio MP3 */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Trình duyệt của bạn không hỗ trợ phát Audio mp3.
          </audio>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed font-medium space-y-2">
          <h4 className="font-bold text-slate-900 text-sm">Questions 1-{questions.length || 5}</h4>
          <p className="italic text-slate-500">
            For each question, write the correct answer in the gap. Write one word or a number or a date or a time.
          </p>
          <div
            className="prose prose-sm max-w-none text-slate-800 pt-2 border-t border-slate-100"
            dangerouslySetInnerHTML={{ __html: activity?.settings?.richText || 'Listen carefully and select the correct answers below.' }}
          />
        </div>

        {/* NÚT ẨN / HIỆN ĐÁP ÁN & AUDIOSCRIPT */}
        <div className="pt-2">
          <button
            onClick={() => setShowAudioscript(!showAudioscript)}
            className="w-full p-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-between transition shadow-xs"
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Answer & Audioscript (Mã Ẩn / Hiện Đáp Án & Kịch Bản Bài Nghe)</span>
            </div>
            {showAudioscript ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
          </button>

          {showAudioscript && (
            <div className="mt-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-xs space-y-2 animate-fade-in font-medium">
              <h5 className="font-bold text-emerald-900">Audioscript Transcript:</h5>
              <p className="leading-relaxed italic">
                {activity?.settings?.audioscript || 'You will hear a radio presenter giving some information about a music festival. Starts on August...'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DANH SÁCH CÂU HỎI QUIZ TRẮC NGHIỆM */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const selectedOptIndex = userAnswers[q.id];
          return (
            <div key={q.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900">{q.content?.question}</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.content?.options?.map((opt, oIdx) => {
                  const isSelected = selectedOptIndex === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectAnswer(q.id, oIdx)}
                      className={`p-3 rounded-xl text-xs font-semibold text-left border transition ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="mr-2 font-bold text-slate-500">{String.fromCharCode(65 + oIdx)}.</span>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
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
