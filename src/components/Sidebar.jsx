import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  BookOpenCheck,
  FileCheck2,
  Mic,
  PenTool,
  BarChart3,
  ShieldAlert,
  Sparkles,
  Gamepad2,
} from 'lucide-react';

export const Sidebar = () => {
  const { role } = useAuth();

  const teacherStudentLinks = [
    { to: '/dashboard', label: 'Tổng Quan (Dashboard)', icon: LayoutDashboard },
    { to: '/classes', label: 'Lớp Học & Học Sinh', icon: Users },
    { to: '/materials', label: 'Kho Học Liệu & Game', icon: Gamepad2 },
    { to: '/curriculum', label: 'Học Liệu & Ngữ Pháp 6-9', icon: FolderKanban },
    { to: '/ai-test-gen', label: 'AI Sinh Đề Thi', icon: Sparkles },
    { to: '/ai-writing', label: 'AI Chấm Bài Writing', icon: PenTool },
    { to: '/ai-speaking', label: 'AI Chấm Bài Speaking', icon: Mic },
    { to: '/exams', label: 'Khảo Thí Phòng Thi Ảo', icon: BookOpenCheck },
    { to: '/analytics', label: 'Báo Cáo & Tiến Độ', icon: BarChart3 },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Quản Lý Hệ Thống', icon: ShieldAlert },
  ];

  const links = role === 'admin' ? [...teacherStudentLinks, ...adminLinks] : teacherStudentLinks;

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex flex-col p-4 space-y-6 hidden md:flex shrink-0">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
          MENU CHÍNH
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600/30 to-brand-500/10 text-brand-300 border border-brand-500/30 shadow-md shadow-brand-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-brand-950/50 to-slate-900/80 border border-brand-500/20 text-center">
        <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto mb-2 glow-brand">
          <Sparkles className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold text-slate-200 mb-1">Global Success 6-9 AI</h4>
        <p className="text-[11px] text-slate-400">Tự động hóa giảng dạy, soạn đề & chấm chữa bằng Gemini AI.</p>
      </div>
    </aside>
  );
};
