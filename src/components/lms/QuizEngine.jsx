import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { HelpCircle, CheckCircle, Volume2, Eye, EyeOff, FileText } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function QuizEngine({ activity }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Toggle Ẩn / Hiện Đáp Án & Audioscript (Chuẩn Ảnh 3)
  const [showAudioscript, setShowAudioscript] = useState(false);

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

  const handleSubmitQuiz = () => {
    let totalScore = 0;
    questions.forEach((q) => {
      const selected = userAnswers[q.id];
      const correctOptIndex = q.content?.options?.findIndex((o) => o.isCorrect);
      if (selected === correctOptIndex) {
        totalScore += Number(q.marks) || 1;
      }
    });

    setScore(totalScore);
    setSubmitted(true);
  };

  if (loading) return <LoadingSpinner text="Đang tải đề thi..." />;

  const audioUrl = activity?.settings?.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  return (
    <div className="space-y-6">
      {/* KHU VỰC BÀI TẬP LISTENING / READING (Chuẩn Ảnh 3) */}
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

        {/* Đoạn văn đề bài Listening (Chuẩn Ảnh 3) */}
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

        {/* NÚT ẨN / HIỆN ĐÁP ÁN & AUDIOSCRIPT (Chuẩn Ảnh 3) */}
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

          {/* KHU VỰC HIỆN AUDIOSCRIPT KHI BẤM TOGGLE (Chuẩn Ảnh 3) */}
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

        {!submitted ? (
          <button
            onClick={handleSubmitQuiz}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition"
          >
            Nộp Bài Thi Quiz
          </button>
        ) : (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-base font-extrabold text-emerald-900">Đã Hoàn Thành Bài Thi!</h4>
            <p className="text-sm font-bold text-emerald-700">Điểm số của bạn: {score} điểm</p>
          </div>
        )}
      </div>
    </div>
  );
}
