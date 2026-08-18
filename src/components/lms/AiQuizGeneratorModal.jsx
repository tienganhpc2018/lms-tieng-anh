import React, { useState } from 'react';
import { X, Sparkles, Bot, Check, FileText, Zap } from 'lucide-react';

export default function AiQuizGeneratorModal({ isOpen, onClose, onGenerated }) {
  if (!isOpen) return null;

  const [topic, setTopic] = useState('Lớp 9 Unit 1: Local Community');
  const [gradeLevel, setGradeLevel] = useState('Lớp 9');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        // Trả đề thi mẫu chuẩn định dạng JSON nếu chưa gắn API key
        setTimeout(() => {
          onGenerated({
            title: `BÀI KÍỂM TRA THÔNG MINH - ${topic.toUpperCase()}`,
            parts: [
              {
                part_type: 'multiple_choice',
                part_title: `PART 1: Listen to the passage about ${topic} and choose the correct answer A, B, C, or D.`,
                questions: [
                  {
                    question: '1. What is the main focus of the community project described in the text?',
                    options: [
                      { text: 'Preserving local handicraft villages', isCorrect: true },
                      { text: 'Building high-rise apartments', isCorrect: false },
                      { text: 'Expanding highway networks', isCorrect: false },
                      { text: 'Importing foreign goods', isCorrect: false },
                    ],
                    explanation: '🔍 Phân tích: Dự án tập trung vào việc bảo tồn các làng nghề thủ công truyền thống.',
                  },
                ],
              },
            ],
          });
          setLoading(false);
          onClose();
        }, 1200);
        return;
      }

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const promptText = `
Bạn là một Siêu AI Soạn Đề Thi Tiếng Anh Chuyên Nghiệp.
Hãy tự động soạn 1 Bộ Đề Thi Tiếng Anh Thông Minh đầy đủ cho học sinh ${gradeLevel} dựa trên chủ đề: "${topic}".

YÊU CẦU ĐẦU RA (Trả về duy nhất JSON thuần túy, không kèm markdown hay text giải thích ngoài JSON):
{
  "title": "TIÊU ĐỀ BÀI THI",
  "parts": [
    {
      "part_type": "multiple_choice",
      "part_title": "PART 1: Read/Listen...",
      "passage": "Đoạn văn ngắn chuẩn chương trình học...",
      "questions": [
        {
          "question": "1. Câu hỏi...",
          "options": [
            { "text": "Lựa chọn A", "isCorrect": true },
            { "text": "Lựa chọn B", "isCorrect": false },
            { "text": "Lựa chọn C", "isCorrect": false },
            { "text": "Lựa chọn D", "isCorrect": false }
          ],
          "explanation": "🔍 Phân tích đáp án đúng ngắn gọn..."
        }
      ]
    }
  ]
}
`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
        }),
      });

      const resData = await response.json();
      const rawContent = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      let parsed = {};
      try {
        parsed = JSON.parse(rawContent);
      } catch (err) {
        console.warn('Fallback JSON parse AI Quiz:', err);
      }

      onGenerated(parsed);
      onClose();
    } catch (err) {
      console.error('Lỗi sinh đề AI:', err);
      alert('Có lỗi kết nối AI sinh đề. Thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-amber-300 uppercase tracking-wide">
                ⚡ TẠO ĐỀ THI TỰ ĐỘNG BẰNG AI (5 GIÂY)
              </h3>
              <p className="text-[10px] text-purple-200">Nhập chủ đề/tên bài học, AI tự sinh trọn bộ đề thi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form nhập liệu */}
        <form onSubmit={handleGenerate} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-extrabold text-slate-800 uppercase mb-1">
              Chủ đề bài học / Unit Giáo trình *
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Lớp 9 Unit 1 Local Community, Passages 1..."
              className="w-full p-3 border border-purple-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-800 uppercase mb-1">
              Khối lớp học *
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs font-semibold bg-white"
            >
              <option value="Lớp 6">Lớp 6</option>
              <option value="Lớp 7">Lớp 7</option>
              <option value="Lớp 8">Lớp 8</option>
              <option value="Lớp 9">Lớp 9 (Chương trình mới)</option>
              <option value="Lớp 10">Lớp 10</option>
              <option value="Lớp 11">Lớp 11</option>
              <option value="Lớp 12">Lớp 12 / Ôn Thi THPT Quốc Gia</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>⚡ AI đang phân tích & sinh bộ đề thi...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Sinh Đề Thi Thông Minh Tự Động</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
