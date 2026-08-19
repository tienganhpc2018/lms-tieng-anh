import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Sparkles, Award, Bot, HelpCircle, Users, Bell, PhoneCall } from 'lucide-react';
import ClassFeed from '../features/community/ClassFeed';
import DirectChatModal from '../features/community/DirectChatModal';
import QaForum from '../features/community/QaForum';
import AiTutorFloatChat from '../features/ai-advanced/AiTutorFloatChat';
import AiLessonPlanGenerator from '../features/ai-advanced/AiLessonPlanGenerator';
import CertificateGenerator from '../features/ai-advanced/CertificateGenerator';
import AdvancedToolsPanel from '../features/ai-advanced/AdvancedToolsPanel';

export default function CommunityModuleView() {
  const navigate = useNavigate();
  const params = useParams();
  const courseId = params.courseId || 'default_course';

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'qa' | 'ai' | 'cert' | 'advanced'
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER SECTION */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-2xl transition text-slate-700 flex items-center space-x-1 font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Khóa Học</span>
            </button>
            <div>
              <span className="text-[10px] font-extrabold text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded-md">
                MODULE 9 & MODULE 10 (COMM-01 ĐẾN COMM-10 & ADV-01 ĐẾN ADV-10)
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Cộng Đồng Lớp Học, Tương Tác Realtime & Công Cụ AI Nâng Cao
              </h1>
            </div>
          </div>

          <button
            onClick={() => setIsChatOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>💬 Mở Khung Chat 1-1 / Nhóm (COMM-05 & COMM-10)</span>
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs text-xs font-extrabold">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'feed' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            📢 Bảng Tin Lớp Học (COMM-01 ĐẾN COMM-03)
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'qa' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            ❓ Diễn Đàn Hỏi Đáp (COMM-06)
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'ai' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            🤖 AI Trắc Nghiệm & Soạn Giáo Án (ADV-02 & ADV-03)
          </button>

          <button
            onClick={() => setActiveTab('cert')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'cert' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            👑 Cấp Bằng Khen PDF (ADV-07)
          </button>

          <button
            onClick={() => setActiveTab('advanced')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'advanced' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            ⚡ Công Cụ Nâng Cao (ADV-04 ĐẾN ADV-10)
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'feed' && <ClassFeed courseId={courseId} />}
        {activeTab === 'qa' && <QaForum courseId={courseId} />}
        {activeTab === 'ai' && <AiLessonPlanGenerator />}
        {activeTab === 'cert' && <CertificateGenerator />}
        {activeTab === 'advanced' && <AdvancedToolsPanel />}

        {/* FLOATING AI CHATBOT (ADV-01) */}
        <AiTutorFloatChat />

        {/* DIRECT CHAT MODAL (COMM-05 & COMM-10) */}
        <DirectChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          courseId={courseId}
        />
      </div>
    </div>
  );
}
