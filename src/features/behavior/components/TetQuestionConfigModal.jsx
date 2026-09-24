import React from 'react';
import { X, Settings, Check, BookOpen, Layers, ListOrdered, CheckCircle2 } from 'lucide-react';
import { playClick, playCorrect } from '../../../utils/soundEffects';

export default function TetQuestionConfigModal({
  isOpen,
  onClose,
  config,
  onChangeConfig
}) {
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 select-none animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#2e0909] via-[#1d0404] to-[#120202] border-[3px] border-amber-500 rounded-[2rem] shadow-2xl p-4 sm:p-6 text-amber-100 space-y-4">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-amber-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl sm:text-3xl">⚙️</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-300 uppercase tracking-wide">
                CẤU HÌNH CÂU HỎI TIẾNG ANH
              </h3>
              <p className="text-[11px] text-amber-200/70 font-semibold">
                Tự động ra đề ôn tập khi học sinh được hái lộc xuân
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

        {/* CÁC TAB CẤU HÌNH */}
        <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
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

          {/* 2. CHỌN UNIT */}
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

          {/* 3. SỐ CÂU HỎI MỖI LƯỢT */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-amber-300 flex items-center space-x-1.5">
              <ListOrdered className="w-3.5 h-3.5" />
              <span>3. Số câu hỏi mỗi lượt hái hoa:</span>
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

          {/* 4. DẠNG CÂU HỎI */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-amber-300 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>4. Dạng câu hỏi ưu tiên:</span>
            </label>
            <div className="space-y-2">
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
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* NÚT HOÀN TẤT */}
        <div className="pt-2 border-t border-amber-800/60 flex items-center justify-end space-x-2">
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
