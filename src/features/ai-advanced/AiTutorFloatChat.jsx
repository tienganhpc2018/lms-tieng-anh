import React, { useState } from 'react';
import { Bot, Sparkles, Send, X, Minimize2, Maximize2, BookOpen } from 'lucide-react';

export default function AiTutorFloatChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Xin chào em! Thầy AI Trợ Giảng sẵn sàng giải đáp thắc mắc về Ngữ pháp, Từ vựng và Đề thi tiếng Anh 24/7. Em có câu hỏi gì cần hỗ trợ không?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setInputMsg('');
    setLoading(true);

    setTimeout(() => {
      let aiReply = 'Cảm ơn em đã hỏi! ';
      if (userText.toLowerCase().includes('quá khứ') || userText.toLowerCase().includes('thi')) {
        aiReply += 'Thì Quá Khứ Đơn dùng để diễn tả hành động đã xảy ra và kết thúc trong quá khứ. Cấu trúc: S + V2/ed. Ví dụ: I visited Ha Long Bay last summer.';
      } else {
        aiReply += 'Em lưu ý xem lại bài học trong Unit 1 hoặc dán câu hỏi trắc nghiệm vào đây để Thầy AI hướng dẫn từng bước nhé!';
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: aiReply }]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 bg-gradient-to-r from-emerald-600 to-sky-600 text-white rounded-full shadow-2xl hover:scale-110 transition flex items-center space-x-2 border-2 border-white animate-bounce"
        >
          <Bot className="w-6 h-6 text-white" />
          <span className="text-xs font-extrabold pr-1">AI Trợ Giảng (ADV-01)</span>
        </button>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-80 sm:w-96 overflow-hidden flex flex-col h-[460px] animate-scale-up">
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-600 rounded-xl">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-white">AI Chatbot Trợ Giảng (ADV-01)</h3>
                <span className="text-[10px] text-emerald-400 font-bold">🟢 Trả lời dựa trên bài học</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-2xs ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-[11px] text-slate-400 font-bold italic">AI đang suy nghĩ trả lời...</div>}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Hỏi AI về ngữ pháp, từ vựng..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
