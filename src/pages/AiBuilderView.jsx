import React, { useState } from 'react';
import { Sparkles, Wand2, ArrowLeft, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AiBuilderView() {
  const navigate = useNavigate();
  const [lessonText, setLessonText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const handleGenerate = () => {
    if (!lessonText.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setGeneratedQuestions([
        {
          id: 1,
          question: 'What is the main theme of the lesson passage?',
          options: ['Local traditional crafts & culture', 'Space exploration and science', 'Modern technology in big cities'],
          correct: 0,
        },
        {
          id: 2,
          question: 'How do local people preserve their traditional pottery craft?',
          options: ['By passing techniques through generations', 'By closing all local workshops', 'By importing goods from overseas'],
          correct: 0,
        },
      ]);
      setGenerating(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Wand2 className="w-6 h-6 text-amber-500" />
            <span>Công Cụ Soạn Đề AI (Tự Động Tạo Đề Bài Hàng Loạt)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Dán nội dung lesson hoặc mô tả hình ảnh bài học, AI sẽ tự động phân tích và sinh ra ngay các câu hỏi trắc nghiệm chuẩn Tiếng Anh!
          </p>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-slate-900 to-navy-900 text-white rounded-3xl space-y-4 shadow-xl border border-slate-800">
        <textarea
          rows={6}
          value={lessonText}
          onChange={(e) => setLessonText(e.target.value)}
          placeholder="Dán văn bản bài học lesson (Ví dụ: Bat Trang pottery village is a famous traditional craft village...)"
          className="w-full p-4 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 font-mono"
        />

        <button
          onClick={handleGenerate}
          disabled={generating || !lessonText.trim()}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
        >
          <Wand2 className="w-4 h-4" />
          <span>{generating ? 'AI Đang Phân Tích & Phán Đoán Câu Hỏi...' : '🪄 AI Tạo Bài Tập Tự Động Ngay'}</span>
        </button>
      </div>

      {generatedQuestions.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Kết Quả AI Đã Sinh ({generatedQuestions.length} câu)</span>
          </h3>

          <div className="space-y-3">
            {generatedQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900">Câu {idx + 1}: {q.question}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-xl text-xs font-semibold border ${
                        oIdx === q.correct ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {oIdx === q.correct ? '✓ ' : ''}{opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
