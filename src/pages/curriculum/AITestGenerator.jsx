import React, { useState } from 'react';
import { generateExamQuestions } from '../../services/aiService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle, Save, BookOpenCheck, ArrowLeft } from 'lucide-react';

export const AITestGenerator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [grade, setGrade] = useState(7);
  const [unit, setUnit] = useState(1);
  const [topics, setTopics] = useState('Free Time, Hobbies, School Things');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');

  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedQuestions(null);

    try {
      const topicArray = topics.split(',').map((t) => t.trim()).filter(Boolean);
      const questions = await generateExamQuestions({
        grade: Number(grade),
        unit: Number(unit),
        topics: topicArray,
        count: Number(questionCount),
        difficulty,
      });

      setGeneratedQuestions(questions);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToVirtualExamRoom = async () => {
    if (!generatedQuestions || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('virtual_exams').insert({
        title: `Đề thi AI - Lớp ${grade} Unit ${unit} (${difficulty.toUpperCase()})`,
        description: `Đề thi sinh tự động từ Gemini AI bám sát chủ đề: ${topics}`,
        grade: Number(grade),
        duration_minutes: 30,
        questions: generatedQuestions,
        created_by: user.id,
      });

      if (error) throw error;
      alert('Đã lưu thành công Đề thi vào Phòng Thi Ảo!');
      navigate('/exams');
    } catch (err) {
      alert('Lỗi khi lưu đề thi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/curriculum')} variant="ghost" size="sm" icon={ArrowLeft}>
          Quay lại Kho Học Liệu
        </Button>
      </div>

      <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300 glow-brand">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100">Hệ Thống Sinh Đề Thi Thông Minh với Gemini AI</h1>
            <p className="text-xs text-slate-400">Tự động biên soạn đề thi trắc nghiệm chuẩn bám sát Sách Global Success Lớp 6-9</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Khối Lớp</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            >
              <option value={6}>Lớp 6</option>
              <option value={7}>Lớp 7</option>
              <option value={8}>Lớp 8</option>
              <option value={9}>Lớp 9</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Unit Số</label>
            <input
              type="number"
              min={1}
              max={12}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Độ Khó</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            >
              <option value="easy">Nhận biết (Easy)</option>
              <option value="medium">Thông hiểu (Medium)</option>
              <option value="hard">Vận dụng cao (Hard)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1">Chủ Đề (Phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              required
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Số Lượng Câu Hỏi</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            >
              <option value={3}>3 câu</option>
              <option value={5}>5 câu</option>
              <option value={10}>10 câu</option>
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" loading={loading} variant="primary" icon={Sparkles} size="lg">
              Sinh Đề Thi Tự Động Với AI
            </Button>
          </div>
        </form>
      </div>

      {loading && <LoadingSpinner label="AI Gemini đang sinh bộ câu hỏi trắc nghiệm..." />}

      {generatedQuestions && (
        <div className="space-y-4 animate-scaleUp">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100">Đề Thi AI Vừa Khởi Tạo ({generatedQuestions.length} câu)</h2>
            <Button onClick={handleSaveToVirtualExamRoom} loading={saving} variant="emerald" icon={Save}>
              Lưu Vào Phòng Thi Ảo
            </Button>
          </div>

          <div className="space-y-4">
            {generatedQuestions.map((q, idx) => (
              <Card key={idx} className="space-y-3 border-brand-500/30">
                <div className="flex items-center justify-between">
                  <Badge variant="brand">CÂU {idx + 1}</Badge>
                  <span className="text-xs font-bold text-emerald-400">Đáp án chuẩn: {q.correct_answer}</span>
                </div>
                <p className="font-bold text-slate-100 text-base">{q.content}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {q.options?.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-xl text-xs font-medium border ${
                        opt.startsWith(q.correct_answer)
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                    💡 <strong>Giải thích chi tiết:</strong> {q.explanation}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
