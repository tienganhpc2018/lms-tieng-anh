import React, { useState } from 'react';
import { X, Settings, Check, BookOpen, Layers, ListOrdered, CheckCircle2, Bookmark, Edit, Sliders } from 'lucide-react';
import { playClick, playCorrect } from '../../../utils/soundEffects';
import TetQuestionEditorTab from './TetQuestionEditorTab';

export default function TetQuestionConfigModal({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  bank,
  onUpdateBank,
  onResetBankToDefault
}) {
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'editor'

  if (!isOpen) return null;

  const grades = [
    { value: 3, label: 'Lớp 3' },
    { value: 4, label: 'Lớp 4' },
    { value: 5, label: 'Lớp 5' },
    { value: 6, label: 'Lớp 6' }
  ];

  const units = [
    { value: 'all', label: 'Tất cả các Unit' },
    { value: 1, label: 'Unit 1: Khởi động & Làm quen' },
    { value: 2, label: 'Unit 2: Tên & Đời sống hàng ngày' },
    { value: 3, label: 'Unit 3: Bạn bè & Trường lớp' },
    { value: 4, label: 'Unit 4: Trường học & Đồ dùng' },
    { value: 5, label: 'Unit 5: Sở thích & Gia đình' }
  ];

  const lessons = [
    { value: 'all', label: 'Tất cả Lessons' },
    { value: 1, label: 'Lesson 1 (Cơ bản / Từ vựng)' },
    { value: 2, label: 'Lesson 2 (Mẫu câu / Ngữ pháp)' },
    { value: 3, label: 'Lesson 3 (Phonics / Ôn tập)' }
  ];

  const counts = [1, 2, 3, 5];

  const questionTypes = [
    { id: 'all', label: 'Tất Cả Dạng (Hỗ Hợp)', desc: 'Xáo trộn ngẫu nhiên cả 3 dạng' },
    { id: 'multiple_choice', label: 'Trắc Nghiệm (A, B, C, D)', desc: '1 lựa chọn đúng trong 4 phương án' },
    { id: 'short_answer', label: 'Trả Lời Ngắn / Điền Từ', desc: 'Gõ từ hoặc cụm từ còn thiếu' },
    { id: 'word_reorder', label: 'Sắp Xếp Từ Thành Câu', desc: 'Bấm chọn từ để tạo câu hoàn chỉnh' }
  ];

  const handleSave = () => {
    playCorrect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 select-none animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#2e0909] via-[#1d0404] to-[#120202] border-[3px] border-amber-500 rounded-[2.2rem] shadow-2xl p-4 sm:p-6 text-amber-100 space-y-4 max-h-[92vh] flex flex-col">
        
        {/* HEADER: TIÊU ĐỀ & 2 TAB ĐIỀU HƯỚNG */}
        <div className="flex items-center justify-between border-b border-amber-800/80 pb-3 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-2xl sm:text-3xl">⚙️</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-300 uppercase tracking-wide">
                CẤU HÌNH & SOẠN CÂU HỎI TIẾNG ANH
              </h3>
              <p className="text-[11px] text-amber-200/70 font-semibold">
                Tùy chỉnh câu hỏi theo từng Unit, Lesson & Tự soạn đề riêng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-amber-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* 2 TAB CHUYỂN ĐỔI: CẤU HÌNH RA ĐỀ / SOẠN CÂU HỎI */}
        <div className="flex items-center space-x-2 p-1 bg-[#180303] rounded-2xl border border-amber-800/80 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              playClick();
              setActiveTab('config');
            }}
            className={`flex-1 py-2 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'config'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                : 'text-amber-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>1. Cấu Hình Ra Đề (Unit / Lesson)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClick();
              setActiveTab('editor');
            }}
            className={`flex-1 py-2 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'editor'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                : 'text-amber-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>2. Soạn & Đổi Câu Hỏi Mẫu</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* NỘI DUNG TAB 1: CẤU HÌNH RA ĐỀ (LỚP, UNIT, LESSON, SỐ CÂU, DẠNG)    */}
        {/* =================================================================== */}
        {activeTab === 'config' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* 1. CHỌN LỚP */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-amber-300 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>1. Chọn Khối Lớp:</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {grades.map((g) => {
                  const isSelected = Number(config.grade) === g.value;
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => {
                        playClick();
                        onChangeConfig({ ...config, grade: g.value });
                      }}
                      className={`py-2 rounded-xl font-black text-xs transition cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_10px_#fde047]'
                          : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border-amber-800/60'
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. CHỌN UNIT VÀ LESSON CÙNG HÀNG */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Unit */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-amber-300 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>2. Chọn Unit Bài Học:</span>
                </label>
                <select
                  value={config.unit}
                  onChange={(e) => {
                    playClick();
                    onChangeConfig({ ...config, unit: e.target.value === 'all' ? 'all' : Number(e.target.value) });
                  }}
                  className="w-full bg-[#1b0505] text-amber-200 border-2 border-amber-700/80 rounded-xl px-3 py-2 text-xs font-bold outline-hidden cursor-pointer"
                >
                  {units.map((u) => (
                    <option key={u.value} value={u.value} className="bg-slate-900 text-white">
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson (Bổ sung mới theo yêu cầu của Thầy) */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-amber-300 flex items-center space-x-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>3. Chọn Lesson Trong Unit:</span>
                </label>
                <select
                  value={config.lesson || 'all'}
                  onChange={(e) => {
                    playClick();
                    onChangeConfig({ ...config, lesson: e.target.value === 'all' ? 'all' : Number(e.target.value) });
                  }}
                  className="w-full bg-[#1b0505] text-amber-200 border-2 border-amber-700/80 rounded-xl px-3 py-2 text-xs font-bold outline-hidden cursor-pointer"
                >
                  {lessons.map((l) => (
                    <option key={l.value} value={l.value} className="bg-slate-900 text-white">
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* BANNER GỢI Ý SOẠN CÂU HỎI */}
            <div className="bg-gradient-to-r from-amber-950/60 to-rose-950/60 p-2.5 rounded-xl border border-amber-700/50 flex items-center justify-between text-xs">
              <span className="text-amber-200 font-bold">
                💡 Thầy/Cô muốn tự soạn hoặc chỉnh sửa câu hỏi cho Unit này?
              </span>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setActiveTab('editor');
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[11px] hover:bg-yellow-300 transition cursor-pointer flex-shrink-0 ml-2"
              >
                Soạn Ngay 👉
              </button>
            </div>

            {/* 4. SỐ CÂU HỎI MỖI LƯỢT */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-amber-300 flex items-center space-x-1.5">
                <ListOrdered className="w-3.5 h-3.5" />
                <span>4. Số câu hỏi mỗi lượt hái hoa:</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {counts.map((c) => {
                  const isSelected = Number(config.count) === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        playClick();
                        onChangeConfig({ ...config, count: c });
                      }}
                      className={`py-2 rounded-xl font-black text-xs transition cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_10px_#fde047]'
                          : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border-amber-800/60'
                      }`}
                    >
                      {c} Câu
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. DẠNG CÂU HỎI */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-amber-300 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>5. Dạng câu hỏi ưu tiên:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {questionTypes.map((t) => {
                  const isSelected = config.questionType === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        playClick();
                        onChangeConfig({ ...config, questionType: t.id });
                      }}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-white'
                          : 'bg-amber-950/40 border-amber-900/50 hover:bg-amber-900/40 text-amber-200/90'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-black">{t.label}</p>
                        <p className="text-[10px] text-amber-300/70">{t.desc}</p>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* NỘI DUNG TAB 2: SOẠN & THAY ĐỔI BỘ CÂU HỎI MẪU                       */}
        {/* =================================================================== */}
        {activeTab === 'editor' && (
          <div className="overflow-y-auto pr-1 flex-1">
            <TetQuestionEditorTab
              bank={bank}
              onUpdateBank={onUpdateBank}
              onResetBankToDefault={onResetBankToDefault}
              currentGrade={config.grade}
              currentUnit={config.unit}
              currentLesson={config.lesson || 'all'}
            />
          </div>
        )}

        {/* NÚT HOÀN TẤT */}
        <div className="pt-2 border-t border-amber-800/60 flex items-center justify-end space-x-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer shadow-lg active:scale-95 text-center flex items-center justify-center space-x-1.5"
          >
            <span>Lưu Cấu Hình & Bắt Đầu Hái Lộc 🌸</span>
          </button>
        </div>

      </div>
    </div>
  );
}
