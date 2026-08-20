import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Award, CheckCircle, XCircle, ArrowLeft, Clock, BookOpen, Bot, Sparkles, RefreshCw, BarChart2 } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AssignmentResultView() {
  const { id, activityId } = useParams();
  const targetId = id || activityId;
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionForTutor, setSelectedQuestionForTutor] = useState(null);
  const [aiTutorModalOpen, setAiTutorModalOpen] = useState(false);

  useEffect(() => {
    async function loadResultData() {
      if (!targetId || !user) return;
      setLoading(true);
      try {
        // 1. Fetch chi tiết bài học / đề thi
        const { data: actData } = await supabase
          .from('activities')
          .select('*, section:section_id (course_id)')
          .eq('id', targetId)
          .single();
        setActivity(actData);

        // 2. Fetch danh sách câu hỏi trong bài thi
        const { data: qData } = await supabase
          .from('questions')
          .select('*')
          .eq('activity_id', targetId)
          .order('created_at', { ascending: true });

        let parsedQuestions = (qData || []).map((q) => {
          let cObj = q.content;
          if (typeof cObj === 'string') {
            try { cObj = JSON.parse(cObj); } catch (e) { cObj = { question: q.content }; }
          }
          return { ...q, content: cObj || {} };
        });
        setQuestions(parsedQuestions);

        // 3. Fetch bài nộp của học sinh
        const { data: subData } = await supabase
          .from('submissions')
          .select('*')
          .eq('activity_id', targetId)
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setSubmission(subData);
      } catch (err) {
        console.error('Lỗi tải trang kết quả bài thi:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResultData();
  }, [targetId, user]);

  if (loading) return <LoadingSpinner text="Đang tải bảng kết quả bài thi..." />;

  if (!submission) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex flex-col items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
            ⚠️
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">CHƯA CÓ BÀI NỘP NÀO!</h2>
          <p className="text-xs text-slate-600 font-medium">
            Bạn chưa thực hiện làm bài thi này. Vui lòng làm bài thi trước khi xem kết quả.
          </p>
          <button
            onClick={() => navigate(`/assignment/${targetId}`)}
            className="w-full py-3 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-emerald-700 transition"
          >
            🚀 Đến Trang Làm Bài Thi Ngay
          </button>
        </div>
      </div>
    );
  }

  const userAnswers = submission.answers_data?.userAnswers || {};
  const score = submission.score || 0;
  const isPassed = score >= 5.0;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* NÚT QUAY LẠI TRANG CHỦ HỌC TẬP */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-extrabold text-slate-700 hover:text-slate-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách bài học</span>
        </button>

        {/* THẺ HEADER BẢNG KẾT QUẢ ĐIỂM SỐ TỔNG KẾT RẠNG RỠ */}
        <div className="bg-gradient-to-br from-navy-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-lg text-[11px] font-black uppercase tracking-wider">
                🏆 BẢNG KẾT QUẢ THI THỬ TRỰC TUYẾN
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight mt-2">
                {activity?.title?.replace('[WHITEBOARD]', '').trim() || 'Bài Thi Thử Trực Tuyến'}
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Học sinh: <strong className="text-white">{profile?.full_name || 'Học Viên'}</strong> | Thời gian nộp: {new Date(submission.created_at).toLocaleString('vi-VN')}
              </p>
            </div>

            {/* KHUNG ĐIỂM SỐ NỔI BẬT */}
            <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-700/80 px-6 py-4 rounded-2xl shadow-inner self-stretch sm:self-auto justify-center">
              <div className="text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ĐIỂM ĐẠT ĐƯỢC</span>
                <span className={`text-3xl font-black tracking-tight ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {score.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 10</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] font-extrabold uppercase">KẾT QUẢ ĐÁNH GIÁ</span>
              <p className={`font-black text-sm ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPassed ? '🎉 ĐẠT YÊU CẦU' : '⚠️ CẦN ÔN TẬP THÊM'}
              </p>
            </div>
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] font-extrabold uppercase">TRẠNG THÁI BÀI LÀM</span>
              <p className="font-extrabold text-white text-sm">✅ Đã Thu & Chấm Điểm</p>
            </div>
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1 col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[10px] font-extrabold uppercase">XEM LẠI CHI TIẾT</span>
              <p className="font-extrabold text-amber-400 text-sm">🔍 Xem Đáp Án Bên Dưới</p>
            </div>
          </div>
        </div>

        {/* CHI TIẾT CÁC CÂU HỎI VÀ ĐÁP ÁN ĐÚNG / SAI CỦA BÀI THI */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>CHI TIẾT ĐÁP ÁN VÀ LỜI GIẢI THÍCH TỪ THẦY HẢI</span>
            </h3>
            <span className="text-xs font-extrabold bg-indigo-50 text-indigo-900 px-3 py-1 rounded-full border border-indigo-200">
              Tổng số {questions.length} câu hỏi
            </span>
          </div>

          {/* DANH SÁCH CÂU HỎI TRONG BÀI THI */}
          <div className="space-y-6">
            {questions.map((q, qIdx) => {
              const parts = Array.isArray(q.content?.parts) ? q.content.parts : [];

              return (
                <div key={q.id || qIdx} className="space-y-4 border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                  <h4 className="font-black text-sm text-navy-950 uppercase border-b border-slate-200 pb-2">
                    {q.content?.title || q.content?.question || `PHẦN ${qIdx + 1}`}
                  </h4>

                  {parts.map((pItem, pIdx) => {
                    const pQs = Array.isArray(pItem.questions) ? pItem.questions : [];
                    const isTrueFalse = pItem.part_type === 'true_false' || (pItem.part_title && (pItem.part_title.includes('True') || pItem.part_title.includes('False')));

                    return (
                      <div key={pIdx} className="space-y-3 pt-2">
                        {pItem.part_title && (
                          <div className="p-2.5 bg-purple-50 border-l-4 border-purple-600 rounded-r-xl text-purple-950 font-extrabold text-xs">
                            {pItem.part_title}
                          </div>
                        )}

                        {pItem.passage && (
                          <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl text-xs text-slate-900 leading-relaxed font-serif italic">
                            {pItem.passage}
                          </div>
                        )}

                        <div className="space-y-3">
                          {pQs.map((cQ, cIdx) => {
                            const childKey = `${q.id}_p${pIdx}_q${cIdx}`;
                            const userChoice = userAnswers[childKey];

                            if (isTrueFalse) {
                              const isCorrectTrue = cQ.correctAnswer === 'True' || cQ.correctAnswer === 'T';
                              const isUserTrue = userChoice === 'True' || userChoice === 'T';
                              const isUserFalse = userChoice === 'False' || userChoice === 'F';

                              return (
                                <div key={cIdx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <h5 className="font-extrabold text-xs text-slate-900 flex-1">{cQ.question}</h5>
                                    <div className="flex items-center space-x-1.5 font-extrabold text-xs">
                                      <span className={`px-2.5 py-1 rounded-lg border ${isUserTrue ? (isCorrectTrue ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white line-through') : 'bg-slate-50 text-slate-400'}`}>T</span>
                                      <span className={`px-2.5 py-1 rounded-lg border ${isUserFalse ? (!isCorrectTrue ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white line-through') : 'bg-slate-50 text-slate-400'}`}>F</span>
                                    </div>
                                  </div>

                                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                                    <span className="font-black block">➔ Đáp án đúng: {isCorrectTrue ? 'True (Đúng)' : 'False (Sai)'}</span>
                                    <p className="text-[11px] text-slate-700 font-medium">
                                      💡 <strong>Giải thích chi tiết:</strong> {cQ.explanation || pItem.explanation || 'Dựa vào văn bản bài đọc, phát biểu này khớp chính xác với thông tin trong bài.'}
                                    </p>
                                  </div>
                                </div>
                              );
                            }

                            const cOpts = Array.isArray(cQ.options) ? cQ.options : [];
                            const correctOptIndex = cOpts.findIndex((o) => typeof o === 'object' ? o?.isCorrect : false);
                            const correctText = (cOpts.find((o) => typeof o === 'object' && o?.isCorrect)?.text) || (cOpts[correctOptIndex]?.text) || 'Đáp án đúng';

                            return (
                              <div key={cIdx} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                                <h5 className="font-extrabold text-xs text-slate-900">{cIdx + 1}. {cQ.question}</h5>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                                  {cOpts.map((opt, oIdx) => {
                                    const isSelected = userChoice === oIdx;
                                    const isCorrect = typeof opt === 'object' ? opt?.isCorrect : false;
                                    const label = String.fromCharCode(65 + oIdx);
                                    let rawText = typeof opt === 'object' ? opt?.text : opt;

                                    let style = 'bg-slate-50 border-slate-200 text-slate-700';
                                    if (isCorrect) style = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-extrabold';
                                    else if (isSelected && !isCorrect) style = 'bg-rose-100 border-rose-400 text-rose-950 font-bold line-through';

                                    return (
                                      <div key={oIdx} className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center space-x-1.5 ${style}`}>
                                        <span className="font-black">{label}.</span>
                                        <span className="text-[11px]">{rawText}</span>
                                      </div>
                                    );
                                  })}
                                </div>

                                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                                  <span className="font-black block">➔ Đáp án đúng chuẩn: {correctText}</span>
                                  <p className="text-[11px] text-slate-800 font-medium">
                                    💡 <strong>Giải thích & Dẫn chứng ngữ pháp:</strong> {cQ.explanation || pItem.explanation || `Dẫn chứng phân tích chi tiết đáp án đúng chính xác là "${correctText}".`}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
