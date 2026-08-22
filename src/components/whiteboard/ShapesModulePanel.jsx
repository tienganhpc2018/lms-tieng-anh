import React from 'react';
import { X, Square, Circle, Triangle, Minus, ArrowRight, PaintBucket, CircleDot, Sun } from 'lucide-react';

export default function ShapesModulePanel({
  isOpen,
  onClose,
  strokeColor,
  setStrokeColor,
  fillColor,
  setFillColor,
  hasFill,
  setHasFill,
  strokeWidth,
  setStrokeWidth,
  opacity,
  setOpacity,
  onSelectShape,
  activeObject,
  fabricCanvas
}) {
  if (!isOpen) return null;

  const colorPalette = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#1d4ed8', '#9333ea', '#ffffff', '#09090b',
    '#f472b6', '#fb923c', '#fde047', '#4ade80', '#60a5fa', '#a78bfa', '#e4e4e7', '#71717a',
    '#fbcfe8', '#fed7aa', '#fef08a', '#bbf7d0', '#bfdbfe', '#ddd6fe', '#f4f4f5', '#27272a',
    '#fff1f2', '#fff7ed', '#fefce8', '#f0fdf4', '#eff6ff', '#faf5ff', '#fafafa', '#18181b'
  ];

  const handleStrokeWidthChange = (val) => {
    setStrokeWidth(val);
    if (activeObject && fabricCanvas) {
      activeObject.set('strokeWidth', Number(val));
      fabricCanvas.renderAll();
    }
  };

  const handleOpacityChange = (val) => {
    setOpacity(val);
    if (activeObject && fabricCanvas) {
      activeObject.set('opacity', Number(val));
      fabricCanvas.renderAll();
    }
  };

  const handleStrokeColorChange = (c) => {
    setStrokeColor(c);
    if (activeObject && fabricCanvas) {
      activeObject.set('stroke', c);
      fabricCanvas.renderAll();
    }
  };

  const handleFillColorChange = (c) => {
    setFillColor(c);
    if (activeObject && fabricCanvas) {
      activeObject.set('fill', hasFill ? c : 'transparent');
      fabricCanvas.renderAll();
    }
  };

  const handleToggleHasFill = () => {
    const nextHasFill = !hasFill;
    setHasFill(nextHasFill);
    if (activeObject && fabricCanvas) {
      activeObject.set('fill', nextHasFill ? fillColor : 'transparent');
      fabricCanvas.renderAll();
    }
  };

  return (
    <div className="fixed top-16 left-16 z-[100] bg-[#ded8be] border-4 border-[#b8af91] rounded-3xl shadow-2xl p-4 w-96 font-sans text-slate-900 animate-scale-up">
      {/* HEADER POPUP SHAPES */}
      <div className="flex justify-between items-center border-b border-[#c8c0a3] pb-2 mb-3">
        <h3 className="font-extrabold text-base text-slate-800 tracking-wide">Shapes (Bảng Hình Học)</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-[#c8c0a3] hover:bg-[#b8af91] flex items-center justify-center text-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* BẢNG MÀU 32 Ô CHUẨN ẢNH MYVIEWBOARD */}
      <div className="space-y-1 mb-3">
        <div className="grid grid-cols-8 gap-1.5 p-2 bg-[#d2caa9] rounded-2xl border border-[#c8c0a3]">
          {colorPalette.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                handleStrokeColorChange(c);
                if (hasFill) handleFillColorChange(c);
              }}
              style={{ backgroundColor: c }}
              className={`w-7 h-7 rounded-full border-2 border-slate-200/80 shadow-2xs transition transform hover:scale-110 cursor-pointer ${
                strokeColor === c ? 'ring-2 ring-slate-900 scale-110' : ''
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2 THANH TRƯỢT CONTROL: ĐỘ DÀY VIỀN & ĐỘ TRONG SUỐT (CHUẨN ẢNH MYVIEWBOARD) */}
      <div className="bg-[#d2caa9] p-3 rounded-2xl border border-[#c8c0a3] space-y-3 mb-3">
        {/* Thanh trượt 1: Độ dày viền khung bo (Stroke Width) */}
        <div>
          <div className="flex justify-between items-center text-[11px] font-extrabold text-slate-800 mb-1">
            <span className="flex items-center space-x-1">
              <CircleDot className="w-3.5 h-3.5 text-slate-700" />
              <span>Độ dày viền khung (Stroke):</span>
            </span>
            <span className="font-mono text-sky-800">{strokeWidth}px</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-[#ded8be] rounded-full border border-slate-600 flex items-center justify-center">
              <div
                style={{ width: `${Math.min(18, Math.max(4, strokeWidth))}px`, height: `${Math.min(18, Math.max(4, strokeWidth))}px` }}
                className="bg-slate-900 rounded-full"
              />
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={strokeWidth}
              onChange={(e) => handleStrokeWidthChange(e.target.value)}
              className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>
        </div>

        {/* Thanh trượt 2: Độ trong suốt (Opacity) */}
        <div>
          <div className="flex justify-between items-center text-[11px] font-extrabold text-slate-800 mb-1">
            <span className="flex items-center space-x-1">
              <Sun className="w-3.5 h-3.5 text-slate-700" />
              <span>Độ trong suốt (Opacity):</span>
            </span>
            <span className="font-mono text-sky-800">{Math.round(opacity * 100)}%</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-[#ded8be] rounded-full border border-slate-600 flex items-center justify-center">
              <div
                style={{ opacity: opacity }}
                className="w-4 h-4 bg-slate-900 rounded-full"
              />
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => handleOpacityChange(e.target.value)}
              className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>
        </div>
      </div>

      {/* GRID ICONS DẠNG KHỐI HÌNH HỌC THEO MYVIEWBOARD */}
      <div className="bg-[#d2caa9] p-3 rounded-2xl border border-[#c8c0a3] space-y-2 mb-3">
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-black">
          <button
            onClick={() => onSelectShape('rect')}
            className="p-2.5 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-xl border border-slate-600 flex flex-col items-center justify-center space-y-1 shadow-2xs transition cursor-pointer"
            title="Chữ nhật / Vuông"
          >
            <Square className="w-5 h-5 text-slate-900" />
            <span className="text-[10px]">Vuông</span>
          </button>

          <button
            onClick={() => onSelectShape('circle')}
            className="p-2.5 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-xl border border-slate-600 flex flex-col items-center justify-center space-y-1 shadow-2xs transition cursor-pointer"
            title="Hình Tròn"
          >
            <Circle className="w-5 h-5 text-slate-900" />
            <span className="text-[10px]">Tròn</span>
          </button>

          <button
            onClick={() => onSelectShape('oval')}
            className="p-2.5 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-xl border border-slate-600 flex flex-col items-center justify-center space-y-1 shadow-2xs transition cursor-pointer"
            title="Hình Bầu Dục (Oval)"
          >
            <div className="w-6 h-4 border-2 border-slate-900 rounded-full" />
            <span className="text-[10px]">Bầu Dục</span>
          </button>

          <button
            onClick={() => onSelectShape('triangle')}
            className="p-2.5 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-xl border border-slate-600 flex flex-col items-center justify-center space-y-1 shadow-2xs transition cursor-pointer"
            title="Hình Tam Giác"
          >
            <Triangle className="w-5 h-5 text-slate-900" />
            <span className="text-[10px]">Tam Giác</span>
          </button>

          <button
            onClick={() => onSelectShape('line')}
            className="p-2.5 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-xl border border-slate-600 flex flex-col items-center justify-center space-y-1 shadow-2xs transition cursor-pointer"
            title="Đường Thẳng"
          >
            <Minus className="w-5 h-5 text-slate-900" />
            <span className="text-[10px]">Đường Thẳng</span>
          </button>

          <button
            onClick={() => onSelectShape('arrow')}
            className="p-2.5 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-xl border border-slate-600 flex flex-col items-center justify-center space-y-1 shadow-2xs transition cursor-pointer"
            title="Mũi Tên"
          >
            <ArrowRight className="w-5 h-5 text-slate-900" />
            <span className="text-[10px]">Mũi Tên</span>
          </button>

          <button
            onClick={() => onSelectShape('polygon5')}
            className="p-2.5 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-xl border border-slate-600 flex flex-col items-center justify-center space-y-1 shadow-2xs transition cursor-pointer"
            title="Ngũ Giác (5 cạnh)"
          >
            <span className="text-xs font-black border border-slate-800 px-1 rounded">5</span>
            <span className="text-[10px]">Ngũ Giác</span>
          </button>

          <button
            onClick={() => onSelectShape('polygon6')}
            className="p-2.5 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-xl border border-slate-600 flex flex-col items-center justify-center space-y-1 shadow-2xs transition cursor-pointer"
            title="Lục Giác (6 cạnh)"
          >
            <span className="text-xs font-black border border-slate-800 px-1 rounded">6</span>
            <span className="text-[10px]">Lục Giác</span>
          </button>
        </div>

        {/* NÚT TOGGLE MÀU NỀN & XÔ SƠN FILL */}
        <div className="flex items-center justify-between pt-2 border-t border-[#c8c0a3] text-xs font-extrabold">
          <div className="flex items-center space-x-2">
            <PaintBucket className="w-4 h-4 text-slate-800" />
            <span>Màu Nền (Fill):</span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={fillColor}
              onChange={(e) => handleFillColorChange(e.target.value)}
              disabled={!hasFill}
              className="w-7 h-7 rounded-lg cursor-pointer border border-slate-600 p-0 disabled:opacity-30"
            />

            <button
              type="button"
              onClick={handleToggleHasFill}
              className={`px-3 py-1 rounded-xl border text-[11px] transition font-black cursor-pointer ${
                hasFill ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-300 text-slate-700 border-slate-400'
              }`}
            >
              {hasFill ? '☑️ Có Màu' : '🚫 Trong Suốt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
