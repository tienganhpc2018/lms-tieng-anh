import React, { useRef, useEffect } from 'react';
import { Map, Activity, Flag, ShieldCheck } from 'lucide-react';

export default function MarbleRaceLogs({ marbles = [], logs = [], trackHeight = 600 }) {
  const logContainerRef = useRef(null);

  // Tự động cuộn xuống log mới nhất khi có sự kiện mới
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full lg:w-72 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/60 p-4 flex flex-col h-full shadow-2xl text-white space-y-4">
      {/* 1. BẢN ĐỒ THU NHỎ TOÀN ĐƯỜNG ĐUA (MINIMAP) */}
      <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-black text-slate-200">
            <Map className="w-3.5 h-3.5 text-cyan-400" />
            <span>TOÀN ĐƯỜNG ĐUA</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded-full">
            Minimap
          </span>
        </div>

        {/* KHUNG THỂ HIỆN TOÀN BỘ TIẾN ĐỘ ĐƯỜNG ĐUA */}
        <div className="relative w-full h-28 bg-slate-950/80 rounded-lg border border-slate-700/60 overflow-hidden px-2 py-1 flex flex-col justify-between">
          {/* VẠCH XUẤT PHÁT */}
          <div className="border-b border-dashed border-emerald-500/60 text-[9px] font-black text-emerald-400 pb-0.5 flex items-center justify-between">
            <span>🏁 XUẤT PHÁT</span>
            <span className="text-[8px] text-slate-500">START</span>
          </div>

          {/* VÙNG CHỨA CÁC CHẤM MÀU VIÊN BI */}
          <div className="relative flex-1">
            {marbles.map((m) => {
              // Tính tỷ lệ % chiều dài đường đua
              const progressPct = Math.min(100, Math.max(0, (m.y / (trackHeight || 1)) * 100));
              const isFinished = m.isFinished;

              return (
                <div
                  key={m.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
                  style={{
                    top: `${progressPct}%`,
                    left: `${10 + (m.number % 8) * 11}%`,
                  }}
                  title={`Viên bi #${m.number}: ${m.studentName}`}
                >
                  <div
                    className={`w-3 h-3 rounded-full border border-white/60 shadow-sm flex items-center justify-center text-[7px] font-black ${
                      isFinished ? 'ring-2 ring-emerald-400 animate-ping' : ''
                    }`}
                    style={{
                      backgroundColor: m.color?.main || '#3B82F6',
                      color: m.color?.text || '#FFF',
                    }}
                  >
                    {m.number}
                  </div>
                </div>
              );
            })}
          </div>

          {/* VẠCH ĐÍCH */}
          <div className="border-t border-dashed border-amber-500/60 text-[9px] font-black text-amber-400 pt-0.5 flex items-center justify-between">
            <span>🏆 VẠCH ĐÍCH</span>
            <span className="text-[8px] text-slate-500">FINISH</span>
          </div>
        </div>
      </div>

      {/* 2. DIỄN BIẾN CUỘC ĐUA (RACE LOGS) */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-800/60 rounded-xl border border-slate-700/70 p-3">
        <div className="flex items-center space-x-1.5 border-b border-slate-700/60 pb-2 mb-2">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <h4 className="font-black text-xs text-white uppercase tracking-wider">
            DIỄN BIẾN CUỘC ĐUA
          </h4>
        </div>

        {/* CONTAINER NHẬT KÝ SỰ KIỆN */}
        <div
          ref={logContainerRef}
          className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-700 text-xs"
        >
          {logs.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-[11px] font-medium italic">
              Nhấn "MỞ CỔNG" hoặc nút đếm ngược để khởi chạy cuộc đua...
            </div>
          ) : (
            logs.map((logItem, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg border leading-tight text-[11px] font-semibold transition-all ${
                  logItem.type === 'start'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    : logItem.type === 'finish'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-extrabold shadow-sm'
                    : logItem.type === 'overtake'
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-200'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                  <span>{logItem.time}</span>
                  <span className="uppercase text-[8px] font-bold tracking-widest text-slate-500">
                    {logItem.type}
                  </span>
                </div>
                <div>{logItem.text}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
