import React, { useState } from 'react';
import { X, Sparkles, Wand2, Check, RefreshCw, Layers, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playWinner } from '../../../utils/soundEffects';
import { generateBatchComments } from '../utils/aiCommentGenerator';

export default function AiCommentModal({
  isOpen,
  onClose,
  students = [],
  evaluationsMap = {},
  txCount = 4,
  subject = 'Tiếng Anh',
  onApplyComments,
}) {
  if (!isOpen) return null;

  const [scope, setScope] = useState('all'); // 'all' | 'only_empty'
  const [style, setStyle] = useState('standard'); // 'standard' | 'short' | 'detailed'
  const [isGenerating, setIsGenerating] = useState(false);

  // Đếm số lượng học sinh chưa có nhận xét
  const emptyCount = students.filter((st) => {
    const com = evaluationsMap[st.id]?.comment;
    return !com || !com.trim();
  }).length;

  const handleStartGenerate = () => {
    playClick();
    setIsGenerating(true);

    // Giả lập xử lý AI nhẹ 0.5s để tạo cảm giác tự nhiên
    setTimeout(() => {
      const updatedMap = generateBatchComments({
        students,
        evaluationsMap,
        txCount,
        subject,
        style,
        scope,
      });

      onApplyComments(updatedMap);
      setIsGenerating(false);

      // Âm thanh kèn chiến thắng + hiệu ứng pháo hoa Confetti
      playWinner();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#059669', '#f59e0b', '#3b82f6', '#ec4899'],
        });
      } catch (e) {}

      onClose();
    }, 550);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md text-xl">
              ✨
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                <span>Trợ Lý AI Sinh Nhận Xét Sư Phạm</span>
              </h3>
              <p className="text-xs text-teal-200 font-semibold">
                Chuẩn hóa Thông tư 22 - Chuyên biệt môn {subject}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Chọn phạm vi sinh nhận xét */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Phạm Vi Áp Dụng:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setScope('all');
                }}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  scope === 'all'
                    ? 'border-teal-600 bg-teal-50/70 ring-1 ring-teal-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-slate-900">Tất Cả Học Sinh</span>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    {students.length} em
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Sinh mới nhận xét cho toàn bộ học sinh trong lớp (ghi đè nhận xét cũ).
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  setScope('only_empty');
                }}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  scope === 'only_empty'
                    ? 'border-teal-600 bg-teal-50/70 ring-1 ring-teal-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-slate-900">Chỉ Học Sinh Trống</span>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {emptyCount} em
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Giữ nguyên nhận xét Thầy/Cô đã nhập tay, chỉ bổ sung cho các ô còn trống.
                </p>
              </button>
            </div>
          </div>

          {/* Chọn phong cách nhận xét */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Phong Cách Lời Nhận Xét:</span>
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'standard',
                  title: 'Tiêu chuẩn (Khuyên dùng)',
                  desc: 'Cân đối, đầy đủ ghi nhận ưu điểm và định hướng rèn luyện tiến bộ.',
                  badge: 'Được ưa chuộng nhất',
                },
                {
                  id: 'short',
                  title: 'Ngắn gọn, súc tích',
                  desc: 'Câu chữ gãy gọn, phù hợp ô nhận xét kích thước nhỏ của phần mềm vnEdu / SMAS.',
                  badge: 'Tiết kiệm ký tự',
                },
                {
                  id: 'detailed',
                  title: 'Chi tiết 4 kỹ năng (Nghe - Nói - Đọc - Viết)',
                  desc: 'Phân tích sâu ưu nhược điểm từng kỹ năng tiếng Anh và phương pháp cải thiện.',
                  badge: 'Chuyên môn sâu',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    playClick();
                    setStyle(item.id);
                  }}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-start space-x-3 ${
                    style === item.id
                      ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    checked={style === item.id}
                    onChange={() => {}}
                    className="mt-1 accent-teal-600 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black text-slate-900">{item.title}</span>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full shrink-0">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ghi chú thông minh */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 flex items-start space-x-2">
            <span className="text-base leading-none">💡</span>
            <div className="leading-relaxed">
              AI sẽ dựa trên <strong>Điểm TBM thực tế</strong> của từng học sinh để tự động phân mức xếp loại (Tốt, Khá, Đạt, Chưa đạt) và lựa chọn lời nhận xét tương ứng chuẩn xác 100%.
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleStartGenerate}
              disabled={isGenerating || students.length === 0}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Sinh Lời Nhận Xét...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-amber-300" />
                  <span>Bắt Đầu Sinh Nhận Xét Tự Động</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
