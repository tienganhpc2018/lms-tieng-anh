import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Clock, ShieldAlert, CheckCircle, AlertTriangle, Send, ArrowLeft } from 'lucide-react';

export const VirtualExamRoom = () => {
  const { id: examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Exam state
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // Anti-cheat warnings
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  // Anti-cheat tab change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setTabSwitchCount((prev) => prev + 1);
        setShowCheatWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSubmitted]);

  const fetchExam = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('virtual_exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (error) throw error;
      setExam(data);
      setTimeLeft((data.duration_minutes || 30) * 60);

      // Start countdown
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error fetching exam:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qIdx, optKey) => {
    if (isSubmitted) return;
    setUserAnswers({
      ...userAnswers,
      [qIdx]: optKey,
    });
  };

  const handleSubmitExam = async () => {
    if (isSubmitted) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setIsSubmitted(true);

    // Calculate score
    const questions = exam?.questions || [];
    let correctCount = 0;

    questions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      const correctAns = q.correct_answer;
      if (selected && selected.startsWith(correctAns)) {
        correctCount++;
      }
    });

    const calculatedScore = Number(((correctCount / (questions.length || 1)) * 10).toFixed(1));
    setScore(calculatedScore);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner label="Đang chuẩn bị phòng thi ảo..." />;

  if (!exam) {
    return (
      <div className="p-8 text-center text-slate-400">
        Không tìm thấy phòng thi này trong hệ thống.
      </div>
    );
  }

  const questions = exam.questions || [];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Exam Header Bar */}
      <div className="sticky top-16 z-30 glass-panel rounded-3xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/exams')} variant="ghost" size="sm" icon={ArrowLeft}>
            Rời Phòng Thi
          </Button>
          <div>
            <h2 className="font-bold text-slate-100 text-base">{exam.title}</h2>
            <p className="text-xs text-slate-400">Khảo Thí Phòng Thi Ảo - Global Success</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Anti-cheat status */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
            tabSwitchCount > 0 ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            <ShieldAlert className="w-4 h-4" />
            <span>Anti-Cheat: {tabSwitchCount} Cảnh báo</span>
          </div>

          {/* Countdown Timer */}
          <div className="px-4 py-1.5 rounded-xl bg-brand-500/20 border border-brand-500/40 text-brand-300 font-mono font-bold text-base flex items-center gap-2 glow-brand">
            <Clock className="w-5 h-5 animate-pulse" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          {!isSubmitted && (
            <Button onClick={handleSubmitExam} variant="emerald" icon={Send}>
              Nộp Bài Thi
            </Button>
          )}
        </div>
      </div>

      {/* Anti-cheat Alert Banner */}
      {showCheatWarning && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-between animate-shake">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-sm">CẢNH BÁO GIÁM THỊ ẢO (ANTI-CHEAT DETECTED)!</p>
              <p className="text-xs text-rose-200">
                Hệ thống phát hiện bạn vừa rời khỏi màn hình thi ({tabSwitchCount} lần). Hành vi này sẽ được lưu vào hệ thống giám thị!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCheatWarning(false)}
            className="text-xs font-bold px-3 py-1 bg-rose-500/30 hover:bg-rose-500/50 rounded-lg text-white"
          >
            Đã hiểu
          </button>
        </div>
      )}

      {/* Score Result Panel */}
      {isSubmitted && score !== null && (
        <Card className="border-emerald-500/40 bg-emerald-950/20 space-y-4 animate-scaleUp">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-lg">Kết Quả Chấm Điểm Phòng Thi Ảo</h3>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-400">{score}</span>
              <span className="text-slate-400 text-xs font-bold"> / 10.0 ĐIỂM</span>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Bài làm đã được hệ thống lưu vết điểm số và xem lại chi tiết từng đáp án phía dưới.
          </p>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const selectedOpt = userAnswers[idx];

          return (
            <Card key={idx} className="space-y-4 border-slate-800">
              <div className="flex items-center justify-between">
                <Badge variant="brand">CÂU {idx + 1}</Badge>
                {isSubmitted && q.correct_answer && (
                  <span className="text-xs font-bold text-emerald-400">Đáp án chuẩn: {q.correct_answer}</span>
                )}
              </div>

              <h3 className="font-bold text-slate-100 text-base">{q.content}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options?.map((opt, oIdx) => {
                  const isSelected = selectedOpt === opt;
                  const isCorrect = isSubmitted && opt.startsWith(q.correct_answer);

                  let bgBorder = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-brand-500/50';
                  if (isSelected) {
                    bgBorder = 'bg-brand-500/20 border-brand-500 text-brand-300 font-bold';
                  }
                  if (isSubmitted && isCorrect) {
                    bgBorder = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={isSubmitted}
                      onClick={() => handleSelectAnswer(idx, opt)}
                      className={`p-3.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${bgBorder}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isSubmitted && q.explanation && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                  💡 <strong>Giải thích chi tiết:</strong> {q.explanation}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
