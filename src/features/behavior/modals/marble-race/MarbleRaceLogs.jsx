import React, { useRef, useEffect } from 'react';

export default function MarbleRaceLogs({ marbles = [], logs = [], cameraState = {} }) {
  const logContainerRef = useRef(null);

  const { cameraY = 0, viewportHeight = 600, trackHeight = 2600 } = cameraState;

  // Tỷ lệ camera viewport trên Minimap
  const viewTopPct = Math.min(100, Math.max(0, (cameraY / (trackHeight || 1)) * 100));
  const viewHeightPct = Math.min(100, Math.max(10, (viewportHeight / (trackHeight || 1)) * 100));

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full lg:w-72 bg-white border-l border-slate-200 p-4 flex flex-col h-full shadow-sm text-slate-900 select-none space-y-4">
      {/* 1. BẢN ĐỒ THU NHỎ TOÀN ĐƯỜNG ĐUA VỚI KHUNG ĐỎ CAMERA (CHUẨN ẢNH 2, 3, 4) */}
      <div className="space-y-1.5">
        <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider">
          TOÀN ĐƯỜNG ĐUA
        </h4>

        <div className="relative w-full h-48 bg-slate-50 rounded-2xl border border-slate-300 overflow-hidden p-2 flex flex-col justify-between">
          {/* SƠ ĐỒ ĐƯỜNG ĐUA KẺ ZICZAC TRÊN MINIMAP */}
          <svg className="absolute inset-0 w-full h-full stroke-slate-400 fill-none opacity-40 pointer-events-none">
            <line x1="10%" y1="8%" x2="90%" y2="8%" strokeWidth="2" />
            <line x1="10%" y1="20%" x2="70%" y2="28%" strokeWidth="2" />
            <line x1="30%" y1="40%" x2="90%" y2="48%" strokeWidth="2" />
            <line x1="10%" y1="60%" x2="70%" y2="68%" strokeWidth="2" />
            <line x1="10%" y1="90%" x2="42%" y2="96%" strokeWidth="2" />
            <line x1="90%" y1="90%" x2="58%" y2="96%" strokeWidth="2" />
          </svg>

          {/* KHUNG ĐỎ THEO DÕI VÙNG GIỚI HẠN MÀN HÌNH CAMERA (CHUẨN ẢNH 2, 3, 4) */}
          <div
            className="absolute left-1 right-1 border-2 border-rose-500 rounded-md bg-rose-500/10 transition-all duration-100 pointer-events-none"
            style={{
              top: `${viewTopPct}%`,
              height: `${viewHeightPct}%`,
            }}
          />

          {/* CHẤM MÀU CÁC VIÊN BI TRÊN MINIMAP */}
          <div className="relative flex-1">
            {marbles.map((m) => {
              const yPct = Math.min(100, Math.max(0, (m.y / (trackHeight || 1)) * 100));
              return (
                <div
                  key={m.id}
                  className="absolute w-2 h-2 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
                  style={{
                    top: `${yPct}%`,
                    left: `${15 + (m.number % 8) * 10}%`,
                    backgroundColor: m.color?.main || '#3B82F6',
                  }}
                  title={m.studentName}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. DIỄN BIẾN CUỘC ĐUA (RACE LOGS - CHUẨN ẢNH 2, 3, 4) */}
      <div className="flex-1 flex flex-col min-h-0 space-y-1.5">
        <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider">
          DIỄN BIẾN
        </h4>

        <div
          ref={logContainerRef}
          className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs scrollbar-thin scrollbar-thumb-slate-200"
        >
          {logs.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-[11px] font-medium italic">
              Nhấn MỞ THANH GẠT để xem diễn biến...
            </div>
          ) : (
            logs.map((item, idx) => (
              <div key={idx} className="text-[11px] font-semibold text-rose-600 leading-tight">
                <strong className="text-rose-700 font-mono mr-1.5">{item.time}</strong>
                <span>{item.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
