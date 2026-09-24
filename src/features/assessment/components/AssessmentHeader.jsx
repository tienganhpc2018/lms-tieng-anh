import React from 'react';
import {
  GraduationCap,
  Settings,
  Sparkles,
  Upload,
  Download,
  Save,
  CheckCircle2,
  Maximize2,
  Minimize2,
  ChevronDown,
  Layers,
  BookOpen,
} from 'lucide-react';
import { playClick } from '../../../utils/soundEffects';
import { SUBJECT_OPTIONS, SEMESTER_OPTIONS } from '../utils/assessmentStorage';

export default function AssessmentHeader({
  config,
  classes = [],
  selectedClassId,
  onChangeClassId,
  selectedSubject,
  onChangeSubject,
  selectedSemester,
  onChangeSemester,
  onOpenConfig,
  onOpenAiComment,
  onOpenImport,
  onExportCSV,
  onManualSave,
  lastSavedText,
  isCompactView,
  onToggleCompactView,
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
      {/* 1. DÒNG TRÊN: TÊN TRƯỜNG & CHỨNG NHẬN THÔNG TƯ 22 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-black shadow-md text-2xl shrink-0">
            📊
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight uppercase">
                {config.schoolName || 'TRƯỜNG THCS CÁT MINH'}
              </h2>
              <span className="text-[11px] font-black text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 shadow-2xs">
                📜 Thông tư 22/2021/TT-BGDĐT
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium pt-0.5">
              Sổ Đánh Giá & Điểm Số Môn Học Tự Động • Năm Học {config.academicYear || '2026-2027'}
            </p>
          </div>
        </div>

        {/* Trạng thái lưu */}
        <div className="flex items-center space-x-2 shrink-0">
          {lastSavedText ? (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lastSavedText}</span>
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-400 italic">
              * Tự động lưu tức thì khi gõ
            </span>
          )}
        </div>
      </div>

      {/* 2. DÒNG DƯỚI: BỘ CHỌN LỚP, MÔN, HỌC KỲ VÀ CỤM 6 NÚT TÁC VỤ */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Cụm 3 Dropdown chọn Lớp, Môn và Học kỳ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 max-w-2xl">
          {/* Chọn Lớp học */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
              Lớp Học:
            </label>
            <div className="relative">
              <select
                value={selectedClassId || ''}
                onChange={(e) => {
                  playClick();
                  onChangeClassId(e.target.value);
                }}
                className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 bg-slate-50/70 hover:bg-slate-100 text-xs font-black text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 appearance-none cursor-pointer transition"
              >
                {classes.length === 0 ? (
                  <option value="">(Chưa có lớp nào)</option>
                ) : (
                  classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name ? (c.name.startsWith('Lớp') ? c.name : `Lớp ${c.name}`) : 'Lớp Học'}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Chọn Môn học */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
              Môn Học:
            </label>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => {
                  playClick();
                  onChangeSubject(e.target.value);
                }}
                className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 bg-slate-50/70 hover:bg-slate-100 text-xs font-black text-teal-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 appearance-none cursor-pointer transition"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Chọn Học kỳ */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
              Học Kỳ:
            </label>
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => {
                  playClick();
                  onChangeSemester(e.target.value);
                }}
                className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 bg-slate-50/70 hover:bg-slate-100 text-xs font-black text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 appearance-none cursor-pointer transition"
              >
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Cụm 6 Nút Tác Vụ Giáo Viên */}
        <div className="flex items-center justify-end flex-wrap gap-2 pt-2 lg:pt-0">
          {/* 1. Nút Cấu Hình */}
          <button
            type="button"
            onClick={onOpenConfig}
            title="Cấu hình tên trường, năm học và số cột điểm TX"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Cấu Hình</span>
          </button>

          {/* 2. Nút AI Nhận Xét */}
          <button
            type="button"
            onClick={onOpenAiComment}
            title="Trợ lý AI tự sinh lời nhận xét môn học chuẩn Thông tư 22"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>✨ AI Nhận Xét</span>
          </button>

          {/* 3. Nút Nhập Excel */}
          <button
            type="button"
            onClick={onOpenImport}
            title="Dán bảng điểm trực tiếp từ Excel / vnEdu / SMAS"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Nhập Excel</span>
          </button>

          {/* 4. Nút Xuất Excel (CSV) */}
          <button
            type="button"
            onClick={onExportCSV}
            title="Tải bảng điểm file CSV chuẩn UTF-8 BOM không lỗi font"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          {/* 5. Nút Lưu Bảng Điểm */}
          <button
            type="button"
            onClick={onManualSave}
            title="Lưu thủ công bảng điểm"
            className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Điểm</span>
          </button>

          {/* 6. Nút Compact View (Thu nhỏ / Phóng to) */}
          <button
            type="button"
            onClick={onToggleCompactView}
            title={isCompactView ? 'Mở rộng giao diện' : 'Thu nhỏ xem nhiều học sinh'}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer border border-slate-200"
          >
            {isCompactView ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
