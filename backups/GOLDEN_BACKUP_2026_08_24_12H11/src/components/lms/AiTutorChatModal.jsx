import React, { useState } from 'react';
import { X, Send, Bot, Sparkles, User, HelpCircle } from 'lucide-react';

export default function AiTutorChatModal({ isOpen, onClose, questionData, userSelectedAnswer, correctAnswerText }) {
  if (!isOpen) return null;

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Xin chào! Mình là AI Tutor 🤖. Ở câu hỏi "${questionData?.question || 'này'}", bạn đã chọn đáp án: "${userSelectedAnswer || 'N/A'}" và đáp án đúng là "${correctAnswerText || 'N/A'}". Bạn có thắc mắc gì về ngữ pháp, từ vựng hay cấu trúc câu này không? Hãy hỏi mình nhé!`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              sender: 'ai',
              text: `💡 **Giải thích từ AI Tutor:** Trong Tiếng Anh, ở câu hỏi này đáp án đúng là "${correctAnswerText}" vì nó tuân theo đúng cấu trúc ngữ pháp và ngữ cảnh bài học. Bạn nên chú ý cách sử dụng từ vựng này trong câu nhé!`,
            },
          ]);
          setLoading(false);
        }, 800);
        return;
      }

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const promptText = `
Bạn là một AI Tutor Trợ Lý Học Tập Tiếng Anh thân thiện, nhiệt tình.
Học sinh đang hỏi thắc mắc về câu hỏi Tiếng Anh sau:
- Đề bài: ${questionData?.question || 'N/A'}
- Đáp án học sinh chọn: ${userSelectedAnswer || 'N/A'}
- Đáp án đúng của bài: ${correctAnswerText || 'N/A'}
- Lời giải thích mặc định: ${questionData?.explanation || 'N/A'}

Thắc mắc của học sinh: "${userMsg}"

Hãy trả lời học sinh bằng Tiếng Việt một cách ngắn gọn, dễ hiểu, phân tích chi tiết tại sao đáp án đúng là chuẩn nhất và chỉ ra bẫy ngữ pháp / từ vựng nếu có!
`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
      });

      const resData = await response.json();
      const aiReply = resData?.candidates?.[0]?.content?.parts?.[0]?.text || 'AI Tutor đang bận một chút, bạn thử lại sau nhé!';

      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      console.error('Lỗi gọi AI Tutor:', err);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Có lỗi kết nối mạng. Bạn thử lại nhé!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-amber-300">AI TUTOR TRỢ LÝ BÀI HỌC</h3>
              <p className="text-[10px] text-purple-200">Hỏi đáp trực tiếp & giải thích chi tiết câu làm sai</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khung Chat messages */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 bg-slate-50 text-xs">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] p-3 rounded-2xl space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-2xs rounded-tl-none'
                }`}
              >
                <div className="flex items-center space-x-1 text-[10px] opacity-75 font-bold mb-0.5">
                  {msg.sender === 'user' ? (
                    <>
                      <span>Học sinh</span>
                      <User className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span className="text-purple-700 font-extrabold">AI Tutor</span>
                    </>
                  )}
                </div>
                <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-purple-900 flex items-center space-x-2 text-xs font-bold animate-pulse">
                <Bot className="w-4 h-4 text-purple-600" />
                <span>AI Tutor đang phân tích & soạn câu trả lời...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Hỏi AI Tutor: Tại sao câu này lại dùng quá khứ?..."
            className="flex-1 p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
