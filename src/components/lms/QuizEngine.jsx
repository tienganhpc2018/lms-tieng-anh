import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

export default function QuizEngine({ activity, onFinished }) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // State lưu câu trả lời của học sinh: { questionId: answerValue }
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);

  useEffect(() => {
    fetchQuestionsAndSubmission();
  }, [activity.id]);

  const fetchQuestionsAndSubmission = async () => {
    setLoading(true);
    // 1. Fetch danh sách câu hỏi
    const { data: qData, error: qErr } = await supabase
      .from('questions')
      .select('*')
      .eq('activity_id', activity.id)
      .order('created_at', { ascending: true });

    if (!qErr) {
      setQuestions(qData || []);
    }

    // 2. Fetch bài làm cũ (nếu có)
    if (user) {
      const { data: subData } = await supabase
        .from('submissions')
        .select('*')
        .eq('activity_id', activity.id)
        .eq('student_id', user.id)
        .maybeSingle();

      if (subData) {
        setUserAnswers(subData.answers_data || {});
        if (subData.status === 'submitted' || subData.status === 'graded') {
          setSubmitted(true);
          setScoreResult({
            score: subData.score,
            totalMarks: (qData || []).reduce((acc, q) => acc + (parseFloat(q.marks) || 0), 0),
          });
        }
      }
    }

    setLoading(false);
  };

  // Cập nhật câu trả lời trắc nghiệm
  const handleSelectMultipleChoice = (qId, optionId) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionId }));
  };

  // Cập nhật câu trả lời dropdown điền từ
  const handleSelectDropdown = (qId, dropdownId, selectedValue) => {
    if (submitted) return;
    setUserAnswers((prev) => {
      const currentQAns = prev[qId] || {};
      return {
        ...prev,
        [qId]: {
          ...currentQAns,
          [dropdownId]: selectedValue,
        },
      };
    });
  };

  // Nộp bài thi & Tự động chấm điểm
  const handleSubmitQuiz = async () => {
    if (!confirm('Bạn có chắc chắn muốn nộp bài thi này?')) return;

    let totalScore = 0;
    let maxMarks = 0;

    questions.forEach((q) => {
      const qMark = parseFloat(q.marks) || 1;
      maxMarks += qMark;
      const userAns = userAnswers[q.id];

      if (q.type === 'multiple_choice') {
        if (userAns === q.content.correctAnswer) {
          totalScore += qMark;
        }
      } else if (q.type === 'fill_blank_dropdown') {
        const dropdowns = q.content.dropdowns || [];
        if (dropdowns.length > 0) {
          let correctCount = 0;
          dropdowns.forEach((d) => {
            if (userAns && userAns[d.id] === d.answer) {
              correctCount += 1;
            }
          });
          totalScore += (correctCount / dropdowns.length) * qMark;
        }
      }
    });

    // Điểm quy đổi thang điểm 10
    const finalScore10 = maxMarks > 0 ? Math.round((totalScore / maxMarks) * 10 * 10) / 10 : 0;

    // Lưu kết quả vào DB submissions
    if (user) {
      await supabase.from('submissions').upsert([
        {
          activity_id: activity.id,
          student_id: user.id,
          answers_data: userAnswers,
          score: finalScore10,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        },
      ]);
    }

    setSubmitted(true);
    setScoreResult({ score: finalScore10, totalMarks: maxMarks });
    if (onFinished) onFinished(finalScore10);
  };

  if (loading) return <LoadingSpinner text="Đang chuẩn bị bài thi Quiz..." />;

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h3 className="font-bold text-slate-700">Bài thi chưa sẵn sàng</h3>
        <p className="text-xs text-slate-500 mt-1">Giáo viên chưa thêm câu hỏi vào bài Quiz này.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isQuestionAnswered = (qId) => {
    const ans = userAnswers[qId];
    if (!ans) return false;
    if (typeof ans === 'object') {
      return Object.keys(ans).length > 0;
    }
    return true;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* VÙNG HIỂN THỊ CÂU HỎI CHÍNH (3 Cột) */}
      <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[420px]">
        {/* Header Thông tin Câu hỏi */}
        <div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg">
              Câu {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Điểm số câu này: <strong className="text-slate-800">{currentQ.marks} điểm</strong>
            </span>
          </div>

          {/* Nội dung Câu hỏi Trắc nghiệm */}
          {currentQ.type === 'multiple_choice' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-800 leading-relaxed">
                {currentQ.content.questionText}
              </h3>
              <div className="space-y-2.5 pt-2">
                {currentQ.content.options.map((opt) => {
                  const isSelected = userAnswers[currentQ.id] === opt.id;
                  let optStyle = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700';

                  if (isSelected) {
                    optStyle = 'border-brand-600 bg-brand-50/60 text-brand-900 font-semibold ring-2 ring-brand-500/20';
                  }

                  if (submitted) {
                    if (opt.id === currentQ.content.correctAnswer) {
                      optStyle = 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (isSelected && opt.id !== currentQ.content.correctAnswer) {
                      optStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={submitted}
                      onClick={() => handleSelectMultipleChoice(currentQ.id, opt.id)}
                      className={`w-full p-3.5 rounded-xl border text-left text-sm transition flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt.text}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nội dung Câu hỏi Dropdown Điền Khuyết */}
          {currentQ.type === 'fill_blank_dropdown' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-600 mb-2">
                Chọn từ thích hợp điền vào các vị trí trống bên dưới:
              </h3>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl leading-loose text-slate-800 text-base">
                {currentQ.content.textWithPlaceholders.split(/(\[\d+\])/g).map((part, pIdx) => {
                  const match = part.match(/\[(\d+)\]/);
                  if (match) {
                    const dropId = match[1];
                    const dropConfig = currentQ.content.dropdowns?.find((d) => d.id === dropId);
                    if (!dropConfig) return part;

                    const currentValue = userAnswers[currentQ.id]?.[dropId] || '';

                    return (
                      <select
                        key={pIdx}
                        disabled={submitted}
                        value={currentValue}
                        onChange={(e) => handleSelectDropdown(currentQ.id, dropId, e.target.value)}
                        className={`mx-1 px-3 py-1 rounded-lg border text-sm font-semibold focus:outline-none ${
                          submitted
                            ? currentValue === dropConfig.answer
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                              : 'bg-rose-100 border-rose-500 text-rose-900'
                            : 'bg-white border-brand-500 text-brand-900 shadow-sm'
                        }`}
                      >
                        <option value="">-- Chọn từ --</option>
                        {dropConfig.options.map((op, oIdx) => (
                          <option key={oIdx} value={op}>
                            {op}
                          </option>
                        ))}
                      </select>
                    );
                  }
                  return <span key={pIdx}>{part}</span>;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Nút Điều Hướng Chuyển Câu */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-6">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 text-sm font-medium transition flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Câu trước</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium transition flex items-center space-x-1"
            >
              <span>Câu tiếp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            !submitted && (
              <button
                onClick={handleSubmitQuiz}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-bold shadow-sm transition flex items-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Nộp Bài Thi</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* KHỐI "QUIZ NAVIGATION" ĐIỀU HƯỚNG BÊN PHẢI (1 Cột) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quiz Navigation</h4>

        {/* Grid các ô chuyển nhanh câu hỏi */}
        <div className="grid grid-cols-4 gap-2">
          {questions.map((q, idx) => {
            const isAnswered = isQuestionAnswered(q.id);
            const isCurrent = currentIndex === idx;

            let btnColor = 'bg-slate-100 text-slate-600 border-slate-200';
            if (isAnswered) {
              btnColor = 'bg-emerald-500 text-white border-emerald-600 font-bold';
            }
            if (isCurrent) {
              btnColor += ' ring-2 ring-slate-900 ring-offset-1 font-extrabold';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-10 rounded-lg text-xs font-semibold border flex items-center justify-center transition ${btnColor}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Chú thích màu sắc */}
        <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span>Đã hoàn thành</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300"></span>
            <span>Chưa làm</span>
          </div>
        </div>

        {/* Kết quả sau khi nộp bài */}
        {submitted && scoreResult && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <h5 className="text-xs font-bold text-emerald-800 uppercase">Kết Quả Bài Thi</h5>
            <div className="text-3xl font-extrabold text-emerald-600 my-1">
              {scoreResult.score} <span className="text-xs font-semibold text-slate-500">/ 10 điểm</span>
            </div>
            <p className="text-[11px] text-emerald-700">Đã chấm điểm tự động và lưu vào bảng điểm LMS.</p>
          </div>
        )}
      </div>
    </div>
  );
}
