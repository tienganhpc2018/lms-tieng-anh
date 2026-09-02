import React, { useState } from 'react';
import { Sparkles, FileText, Bot, Download, CheckCircle2, Zap, BookOpen } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AiLessonPlanGenerator() {
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' (ADV-02) | 'lesson_plan' (ADV-03)
  const [inputText, setInputText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [resultData, setResultData] = useState(null);

  const handleGenerateAI = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setGenerating(true);
    setTimeout(() => {
      if (activeTab === 'quiz') {
        setResultData({
          type: 'quiz',
          questions: [
            { q: '1. What is the main idea of the reading text?', options: ['A. Local Community', 'B. City Pollution', 'C. Space Travel', 'D. Music History'], answer: 'A' },
            { q: '2. Which word is CLOSEST in meaning to "artisan"?', options: ['A. Craftsperson', 'B. Teacher', 'C. Doctor', 'D. Driver'], answer: 'A' },
            { q: '3. Form the correct past tense of "preserve":', options: ['A. Preserved', 'B. Preserves', 'C. Preserving', 'D. Preservative'], answer: 'A' },
          ],
        });
      } else {
        setResultData({
          type: 'lesson_plan',
          title: 'KẾ HOẠCH BÀI DẠY (LESSON PLAN) - UNIT 1: LOCAL COMMUNITY',
          objectives: 'GV giúp học sinh nắm vững 15 từ vựng về làng nghề truyền thống và cấu trúc Phrasal Verbs.',
          procedure: [
            '1. Warm-up (5 mins): Trò chơi lật mảnh ghép hình ảnh làng gốm Bát Tràng.',
            '2. Knowledge (15 mins): Dạy từ vựng mới qua hình ảnh tương tác trên Bảng Whiteboard.',
            '3. Practice (15 mins): Làm bài tập trắc nghiệm nhóm 20 dạng câu hỏi.',
            '4. Production (10 mins): Thảo luận về nơi sống của em và trình bày Speaking.',
          ],
        });
      }
      setGenerating(false);
    }, 1200);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 font-sans select-none">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>AI SOẠN ĐỀ & SOẠN GIÁO ÁN TỰ ĐỘNG (ADV-02 & ADV-03)</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Phân tích văn bản/PDF để tạo 10 câu hỏi trắc nghiệm hoặc gợi ý Kế hoạch bài dạy chuẩn CV7991
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-extrabold">
          <button
            onClick={() => { setActiveTab('quiz'); setResultData(null); }}
            className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'quiz' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'}`}
          >
            📝 AI Tạo Trắc Nghiệm (ADV-02)
          </button>
          <button
            onClick={() => { setActiveTab('lesson_plan'); setResultData(null); }}
            className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'lesson_plan' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600'}`}
          >
            📖 AI Soạn Giáo Án (ADV-03)
          </button>
        </div>
      </div>

      <form onSubmit={handleGenerateAI} className="space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase">
          DÁN VĂN BẢN HOẶC NỘI DUNG TÀI LIỆU BÀI HỌC:
        </label>
        <textarea
          rows={4}
          required
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Dán đoạn văn Tiếng Anh hoặc bài đọc vào đây để AI tự động tạo trắc nghiệm / giáo án..."
          className="w-full p-3.5 border border-slate-300 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-slate-50"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={generating}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>{generating ? 'AI Đang Phân Tích...' : '🚀 BẮT ĐẦU TẠO BẰNG AI'}</span>
          </button>
        </div>
      </form>

      {generating && <LoadingSpinner text="AI đang đọc tài liệu và phân tích ma trận kiến thức..." />}

      {resultData && (
        <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-3xl space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{resultData.type === 'quiz' ? '🎉 ĐÃ TẠO THÀNH CÔNG 3 CÂU HỎI TRẮC NGHIỆM' : resultData.title}</span>
            </h4>
            <button
              onClick={() => alert('Đã xuất file Word / PDF giáo án thành công!')}
              className="px-3 py-1.5 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Xuất File</span>
            </button>
          </div>

          {resultData.type === 'quiz' ? (
            <div className="space-y-3">
              {resultData.questions.map((q, idx) => (
                <div key={idx} className="p-3 bg-white rounded-2xl border border-amber-200 text-xs space-y-1">
                  <p className="font-extrabold text-slate-900">{q.q}</p>
                  <div className="grid grid-cols-2 gap-1 text-slate-600 font-medium pl-2">
                    {q.options.map((opt, i) => <span key={i}>{opt}</span>)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-800">📌 MỤC TIÊU: {resultData.objectives}</p>
              <div className="space-y-1">
                <span className="font-extrabold text-slate-900 block">📝 TIẾN TRÌNH DẠY HỌC:</span>
                {resultData.procedure.map((step, i) => (
                  <p key={i} className="pl-3 text-slate-700 font-semibold">• {step}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
