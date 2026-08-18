import React from 'react';
import { BookOpen, CheckCircle, Circle, Plus, Settings, ChevronRight, Layers } from 'lucide-react';

export default function CourseSidebar({
  sections = [],
  activeSectionId,
  onSelectSection,
  isTeacher,
  onAddSection,
  progressPercentage = 0,
}) {
  return (
    <aside className="w-full md:w-72 bg-white border-r border-slate-200 p-4 flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      {/* Tiêu đề Sidebar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-800 font-bold">
          <Layers className="w-5 h-5 text-brand-600" />
          <span>Nội Dung Khóa Học</span>
        </div>
        {isTeacher && (
          <button
            onClick={onAddSection}
            title="Thêm Chủ đề/Tuần học mới"
            className="p-1 text-slate-500 hover:text-brand-600 hover:bg-emerald-50 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress Bar Tiến Độ Học (Cho Học sinh) */}
      {!isTeacher && (
        <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
            <span>Tiến độ học tập</span>
            <span className="text-brand-600 font-bold">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Danh sách Sections (Chủ đề / Tuần) */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {sections.length === 0 ? (
          <p className="text-xs text-slate-400 p-3 text-center italic">
            Chưa có chủ đề nào được tạo.
          </p>
        ) : (
          sections.map((section, idx) => {
            const isActive = activeSectionId === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-between ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="text-xs w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                    {idx + 1}
                  </span>
                  <span className="truncate">{section.title}</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-400 ${isActive ? 'rotate-90 text-brand-600' : ''}`} />
              </button>
            );
          })
        )}
      </div>

      {/* Nút Thêm Chủ Đề Nhanh Dưới Cùng */}
      {isTeacher && (
        <button
          onClick={onAddSection}
          className="mt-3 w-full py-2 px-3 border border-dashed border-slate-300 text-slate-600 hover:border-brand-500 hover:text-brand-600 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm Chủ đề/Tuần học</span>
        </button>
      )}
    </aside>
  );
}
