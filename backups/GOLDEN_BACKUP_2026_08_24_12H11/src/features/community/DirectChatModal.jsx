import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, X, User, Users, Shield, Clock, Sparkles } from 'lucide-react';

export default function DirectChatModal({ isOpen, onClose, targetUser, courseId }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([
    { id: 'm1', sender_name: 'Nguyễn Văn Hải', message: 'Chào em! Em cần Thầy hỗ trợ bài tập nào không?', created_at: new Date().toISOString() },
    { id: 'm2', sender_name: 'Nguyễn Minh Hoàng', message: 'Dạ Thầy ơi, câu 5 phần Listening Unit 1 em nghe chưa rõ ạ!', created_at: new Date().toISOString() },
  ]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' (COMM-05) | 'group' (COMM-10)

  if (!isOpen) return null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: 'm_' + Date.now(),
      sender_name: profile?.full_name || 'Bạn',
      message: inputText.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans select-none">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-scale-up">
        {/* HEADER CHAT */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-extrabold text-xs">
              💬
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                {activeTab === 'direct' ? `Khung Chat 1-1 với ${targetUser?.full_name || 'Giáo Viên/Học Sinh'}` : 'Phòng Chat Nhóm Toàn Lớp (COMM-10)'}
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold">🟢 Đang Hoạt Động Realtime</span>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* TAB NAVIGATION: COMM-05 & COMM-10 */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-extrabold">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2.5 text-center transition ${
              activeTab === 'direct' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            👤 Nhắn Tin 1-1 (COMM-05)
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`flex-1 py-2.5 text-center transition ${
              activeTab === 'group' ? 'bg-white text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            👥 Chat Nhóm Lớp (COMM-10)
          </button>
        </div>

        {/* MESSAGES BODY */}
        <div className="p-4 h-72 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.map((msg) => {
            const isMe = msg.sender_name === (profile?.full_name || 'Bạn');
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] font-extrabold text-slate-400 px-1 mb-0.5">{msg.sender_name}</span>
                <div
                  className={`p-3 rounded-2xl max-w-[80%] text-xs font-semibold leading-relaxed shadow-2xs ${
                    isMe ? 'bg-emerald-600 text-white rounded-tr-xs' : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
        </div>

        {/* CHAT INPUT */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập tin nhắn trao đổi..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
