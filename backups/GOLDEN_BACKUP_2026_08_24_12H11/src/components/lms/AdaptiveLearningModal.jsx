import React from 'react';
import { X, BookOpen, Compass, CheckCircle2, ArrowRight, Sparkles, Target } from 'lucide-react';

export default function AdaptiveLearningModal({ isOpen, onClose, wrongQuestions = [] }) {
  if (!isOpen) return null;

  // Phân tích các dạng bài học sinh làm sai
  const weakTopics = [
    {
      title: 'Chuyên đề Ngữ Pháp & Từ Vựng Làng Nghề Thủ Công (Local Crafts)',
      description: 'Luyện tập các cụm động từ (Phrasal Verbs: pass down, live on, deal with) và từ vựng Unit 1.',
      duration: '15 phút',
      link: '#',
    },
    {
      title: 'Kỹ Năng Đọc Đục Lỗ Cloze Test & Dạng Bài True/False',
      description: 'Phương pháp xác định từ loại và kỹ thuật gạch chân dẫn chứng (Evidence) trong đoạn văn.',
      duration: '20 phút',
      link: '#',
    },
    {
      title: 'Viết Bài Luận Ngắn & Cấu Trúc Nâng Cáo IELTS/VSTEP',
      description: 'Cách sử dụng mệnh đề quan hệ và các từ nối tương phản (However, Nevertheless, Although).',
      duration: '25 phút',
      link: '#',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 to-indigo-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-amber-300 animate-spin" />
            <div>
              <h3 className="font-extrabold text-sm text-amber-300 uppercase tracking-wide">
                🧭 LỘ TRÌNH ÔN TẬP TỰ ĐỘNG (ADAPTIVE LEARNING)
              </h3>
              <p className="text-[10px] text-sky-200">
                Phân tích {wrongQuestions.length} câu làm sai • Đề xuất 3 bài giảng khắc phục lỗ hổng
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung đề xuất bài giảng */}
        <div className="p-5 space-y-3 bg-slate-50 text-xs max-h-[75vh] overflow-y-auto">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 font-medium space-y-1">
            <span className="font-extrabold flex items-center space-x-1 text-amber-900">
              <Target className="w-4 h-4 text-amber-600" />
              <span>Phân Tích Lỗ Hổng Kiến Thức Của Bạn:</span>
            </span>
            <p className="text-[11px] leading-relaxed">
              Dựa trên kết quả bài thi vừa rồi, AI phát hiện bạn cần củng cố thêm về <strong>Phrasal Verbs</strong> và <strong>Kỹ năng xác định Dẫn chứng True/False</strong>. Dưới đây là 3 bài giảng được AI gợi ý riêng cho bạn:
            </p>
          </div>

          <div className="space-y-2.5">
            {weakTopics.map((topic, idx) => (
              <div
                key={idx}
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 transition space-y-2"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-extrabold text-xs text-indigo-950 flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-[10px] flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span>{topic.title}</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    ⏱️ {topic.duration}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed font-normal">{topic.description}</p>

                <button
                  onClick={() => alert(`🚀 Đang chuyển đến bài giảng: ${topic.title}`)}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl transition flex items-center justify-center space-x-1"
                >
                  <span>Học Bài Này Ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
