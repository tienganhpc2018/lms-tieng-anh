import React from 'react';
import { BookOpen, CheckCircle, Circle, Plus, Settings, ChevronRight, Layers, Edit2, Trash2 } from 'lucide-react';

export default function CourseSidebar({
  sections = [],
  activeSectionId,
  onSelectSection,
  isTeacher,
  onAddSection,
  onEditSection,
  onDeleteSection,
  progressPercentage = 0,
}) {
  return (
    <aside className="w-full md:w-72 bg-white border-r border-slate-200 p-4 flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      {/* Tiêu đề Sidebar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-800 font-bold">
          <Layers className="w-5 h-5 text-emerald-600" />
          <span>Chủ Đề Khóa Học</span>
        </div>
        {isTeacher && (
          <button
            onClick={onAddSection}
            title="Thêm Chủ đề/Tuần học mới"
            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
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
            <span className="text-emerald-600 font-bold">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
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
              <div
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-between cursor-pointer group ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="text-[11px] w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-extrabold text-slate-500 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate">{section.title}</span>
                </div>

                {/* NÚT CHỈNH SỬA & XÓA SECTION CHO GIÁO VIÊN */}
                {isTeacher ? (
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSection(section);
                      }}
                      title="Sửa tên chủ đề"
                      className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSection(section.id, section.title);
                      }}
                      title="Xóa chủ đề này"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <ChevronRight className={`w-4 h-4 text-slate-400 ${isActive ? 'rotate-90 text-emerald-600' : ''}`} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Nút Thêm Chủ Đề Nhanh Dưới Cùng */}
      {isTeacher && (
        <button
          onClick={onAddSection}
          className="mt-3 w-full py-2.5 px-3 border border-dashed border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm Chủ Đề / Tuần Học</span>
        </button>
      )}
    </aside>
  );
}
