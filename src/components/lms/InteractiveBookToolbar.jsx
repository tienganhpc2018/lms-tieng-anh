import React, { useState } from 'react';
import {
  MousePointer,
  Pencil,
  Highlighter,
  Eraser,
  Trash2,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Volume2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Palette,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function InteractiveBookToolbar({
  activeTool,
  setActiveTool,
  penColor,
  setPenColor,
  penSize,
  setPenSize,
  highlighterColor,
  setHighlighterColor,
  onClearCanvas,
  showAnswerKey,
  onToggleAnswerKey,
  isFullscreen,
  onToggleFullscreen,
  currentTaskIndex,
  totalTasks,
  onPrevTask,
  onNextTask,
  audioRate,
  onChangeAudioRate,
  onReplayAudio
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const penColors = [
    { name: 'Đỏ', value: '#ef4444' },
    { name: 'Xanh lam', value: '#2563eb' },
    { name: 'Xanh lục', value: '#10b981' },
    { name: 'Cam', value: '#f97316' },
    { name: 'Đen', value: '#0f172a' },
    { name: 'Tím', value: '#8b5cf6' },
  ];

  const highlighterColors = [
    { name: 'Vàng', value: 'rgba(253, 224, 71, 0.45)' },
    { name: 'Xanh neon', value: 'rgba(74, 222, 128, 0.45)' },
    { name: 'Hồng', value: 'rgba(244, 114, 182, 0.45)' },
    { name: 'Xanh biển', value: 'rgba(56, 189, 248, 0.45)' },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-white px-3 sm:px-4 py-2 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center space-x-1 sm:space-x-2 select-none max-w-[98vw] overflow-x-auto">
      {/* 1. BỘ CÔNG CỤ CHỌN / VẼ / HIGHLIGHT / TẨY */}
      <div className="flex items-center space-x-1 pr-2 border-r border-slate-700/80">
        <button
          type="button"
          onClick={() => setActiveTool('select')}
          className={`p-1.5 sm:p-2 rounded-xl transition cursor-pointer ${
            activeTool === 'select' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Chuột tương tác bình thường"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setActiveTool('pen');
              setShowColorPicker(!showColorPicker);
            }}
            className={`p-1.5 sm:p-2 rounded-xl transition cursor-pointer flex items-center space-x-1 ${
              activeTool === 'pen' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Bút vẽ ghi chú lên màn hình"
          >
            <Pencil className="w-4 h-4" />
            <div className="w-2.5 h-2.5 rounded-full border border-slate-900" style={{ backgroundColor: penColor }} />
          </button>

          {/* Popover chọn màu bút */}
          {showColorPicker && (
            <div className="absolute bottom-12 left-0 bg-slate-900 border border-slate-700 rounded-xl p-2.5 shadow-2xl flex flex-col space-y-2 z-50">
              <span className="text-[10px] font-bold text-slate-400">Màu bút vẽ:</span>
              <div className="flex items-center space-x-1.5">
                {penColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      setPenColor(c.value);
                      setShowColorPicker(false);
                    }}
                    className={`w-5 h-5 rounded-full border-2 transition cursor-pointer ${
                      penColor === c.value ? 'border-white scale-110 shadow-sm' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>Nét:</span>
                <div className="flex items-center space-x-1">
                  {[2, 4, 7].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setPenSize(sz)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        penSize === sz ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {sz}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setActiveTool('highlighter')}
          className={`p-1.5 sm:p-2 rounded-xl transition cursor-pointer flex items-center space-x-1 ${
            activeTool === 'highlighter' ? 'bg-yellow-400 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Bút dạ quang Highlight từ vựng quan trọng"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('eraser')}
          className={`p-1.5 sm:p-2 rounded-xl transition cursor-pointer ${
            activeTool === 'eraser' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Tẩy xóa nét vẽ"
        >
          <Eraser className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onClearCanvas}
          className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
          title="Xóa toàn bộ nét vẽ"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* 2. NÚT SOI ĐÁP ÁN (SHOW/HIDE KEY) */}
      <div className="flex items-center space-x-1 px-2 border-r border-slate-700/80">
        <button
          type="button"
          onClick={onToggleAnswerKey}
          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer ${
            showAnswerKey
              ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
          }`}
          title="Hiện hoặc ẩn đáp án bài tập"
        >
          {showAnswerKey ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{showAnswerKey ? 'Ẩn Đáp Án' : 'Soi Đáp Án'}</span>
        </button>
      </div>

      {/* 3. TỐC ĐỘ ĐỌC AUDIO & PHÁT LẠI */}
      <div className="flex items-center space-x-1 px-2 border-r border-slate-700/80">
        <button
          type="button"
          onClick={onReplayAudio}
          className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition cursor-pointer"
          title="Đọc lại toàn bài"
        >
          <Volume2 className="w-4 h-4 text-emerald-400" />
        </button>

        <select
          value={audioRate}
          onChange={(e) => onChangeAudioRate(Number(e.target.value))}
          className="bg-slate-800 text-slate-200 text-xs font-bold rounded-lg px-2 py-1 border border-slate-700 cursor-pointer outline-hidden"
          title="Tốc độ đọc giọng nói"
        >
          <option value={0.75}>0.75x</option>
          <option value={0.9}>0.9x</option>
          <option value={1.0}>1.0x</option>
          <option value={1.2}>1.2x</option>
        </select>
      </div>

      {/* 4. ĐIỀU HƯỚNG CHUYỂN TASK (< 1/5 >) */}
      <div className="flex items-center space-x-1.5 px-2">
        <button
          type="button"
          onClick={onPrevTask}
          disabled={currentTaskIndex <= 0}
          className={`p-1.5 rounded-xl transition cursor-pointer ${
            currentTaskIndex <= 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Task trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-black text-amber-300 px-1 font-mono">
          {currentTaskIndex + 1}/{totalTasks || 1}
        </span>

        <button
          type="button"
          onClick={onNextTask}
          disabled={currentTaskIndex >= totalTasks - 1}
          className={`p-1.5 rounded-xl transition cursor-pointer ${
            currentTaskIndex >= totalTasks - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Task kế tiếp"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 5. TOÀN MÀN HÌNH */}
      <div className="pl-2 border-l border-slate-700/80">
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition cursor-pointer"
          title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
