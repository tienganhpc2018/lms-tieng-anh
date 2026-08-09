import React, { useState } from 'react';
import { evaluateWritingSubmission } from '../../services/aiService';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PenTool, Sparkles, CheckCircle2, AlertCircle, RefreshCw, BookOpen } from 'lucide-react';

export const AIWritingGrader = () => {
  const [promptText, setPromptText] = useState(
    'Write a paragraph (80-100 words) about your school or your favorite hobby.'
  );
  const [studentEssay, setStudentEssay] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!studentEssay.trim()) return;

    setLoading(true);
    setEvaluation(null);

    try {
      const result = await evaluateWritingSubmission({ promptText, studentEssay });
      setEvaluation(result);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Công Cụ AI Chấm Bài Writing Tự Động</h1>
          <p className="text-xs text-slate-400">Phân tích lỗi ngữ pháp, gợi ý nâng cấp từ vựng, chấm điểm & viết lại bài mẫu</p>
        </div>

        <Badge variant="brand" className="text-xs py-1">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Gemini AI Grader Engine
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Essay Input Form */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <form onSubmit={handleEvaluate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Đề Bài Writing (Prompt)</label>
              <input
                type="text"
                required
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Bài Làm Viết Tiếng Anh Của Học Sinh</label>
              <textarea
                rows={10}
                required
                placeholder="Nhập hoặc dán bài viết tiếng Anh vào đây..."
                value={studentEssay}
                onChange={(e) => setStudentEssay(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 focus:outline-none focus:border-brand-500 font-sans leading-relaxed"
              />
            </div>

            <Button type="submit" loading={loading} variant="primary" icon={PenTool} className="w-full" size="lg">
              Phân Tích & Chấm Bài Tự Động
            </Button>
          </form>
        </div>

        {/* Right Column: AI Analysis Result */}
        <div className="space-y-4">
          {loading && <LoadingSpinner label="AI Gemini đang chấm bài chi tiết và đề xuất bài viết mẫu..." />}

          {!loading && !evaluation && (
            <div className="glass-panel rounded-3xl p-12 border border-slate-800 text-center space-y-3">
              <PenTool className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">Nhập bài viết và ấn Chấm Bài</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                AI sẽ phân tích chi tiết từng câu, sửa lỗi chính tả, chấm điểm thang 10.0 và biên soạn lại bài mẫu tối ưu.
              </p>
            </div>
          )}

          {evaluation && (
            <div className="space-y-4 animate-scaleUp">
              {/* Score Header */}
              <Card className="border-brand-500/40 bg-brand-950/20">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <Badge variant="emerald">THANG ĐIỂM 10.0</Badge>
                    <h3 className="text-2xl font-black text-white mt-1">ĐIỂM SỐ: {evaluation.score}</h3>
                  </div>
                  <span className="text-xs text-slate-400 max-w-[200px] text-right italic">
                    {evaluation.summary}
                  </span>
                </div>
              </Card>

              {/* Grammar Corrections */}
              <Card className="border-slate-800 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> SỬA LỖI NGỮ PHÁP (GRAMMAR CORRECTIONS)
                </h4>

                <div className="space-y-2">
                  {evaluation.grammar_corrections?.map((c, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      <div className="text-rose-400 line-through">❌ {c.original}</div>
                      <div className="text-emerald-400 font-bold">✅ {c.corrected}</div>
                      <div className="text-slate-400 italic">💡 Lý do: {c.reason}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Model Essay */}
              <Card className="border-purple-500/30 bg-purple-950/20 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> BÀI VIẾT MẪU HOÀN CHỈNH (MODEL REWRITE)
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  "{evaluation.model_essay}"
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
