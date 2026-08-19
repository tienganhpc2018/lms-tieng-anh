import React, { useState } from 'react';
import { HelpCircle, MessageSquare, CheckCircle2, User, Plus, Search, Sparkles, Send } from 'lucide-react';

export default function QaForum({ courseId }) {
  const [threads, setThreads] = useState([
    {
      id: 'qa_1',
      title: 'Cách phân biệt thì Quá Khứ Đơn và Quá Khứ Hoàn Thành trong câu phức?',
      author: 'Đinh Thành Nhơn',
      answers: 3,
      is_resolved: true,
      created_at: '2 giờ trước',
    },
    {
      id: 'qa_2',
      title: 'Từ vựng "Local community" trong Unit 1 áp dụng vào bài nói Speaking thế nào?',
      author: 'Hà Nguyễn Minh Thư',
      answers: 1,
      is_resolved: false,
      created_at: '5 giờ trước',
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const handleCreateQuestion = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newQa = {
      id: 'qa_' + Date.now(),
      title: newTitle.trim(),
      author: 'Học Sinh',
      answers: 0,
      is_resolved: false,
      created_at: 'Vừa xong',
    };

    setThreads([newQa, ...threads]);
    setNewTitle('');
    setIsAsking(false);
  };

  return (
    <div className="space-y-4 font-sans select-none">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <span>COMM-06: Diễn Đàn Hỏi Đáp Kiến Thức Q&A</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Học sinh đăng câu hỏi bài tập khó để Giáo viên và các bạn học vào giải đáp
          </p>
        </div>

        <button
          onClick={() => setIsAsking(!isAsking)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>+ Đặt Câu Hỏi Mới</span>
        </button>
      </div>

      {isAsking && (
        <form onSubmit={handleCreateQuestion} className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200 space-y-3">
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nhập tiêu đề câu hỏi khó cần giải đáp..."
            className="w-full p-2.5 border border-indigo-200 rounded-xl text-xs font-extrabold focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setIsAsking(false)} className="px-3 py-1.5 text-xs font-bold text-slate-600">Hủy</button>
            <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-xs">
              🚀 Đăng Câu Hỏi
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {threads.map((qa) => (
          <div key={qa.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-extrabold text-xs text-slate-900 hover:text-indigo-600 cursor-pointer flex items-center space-x-2">
                <span>{qa.title}</span>
                {qa.is_resolved && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded-md flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Đã Giải Đáp</span>
                  </span>
                )}
              </h4>
              <div className="text-[10px] text-slate-400 font-bold flex items-center space-x-3">
                <span>Đăng bởi: {qa.author}</span>
                <span>• {qa.created_at}</span>
              </div>
            </div>

            <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-extrabold text-slate-700 flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span>{qa.answers} Trả lời</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
