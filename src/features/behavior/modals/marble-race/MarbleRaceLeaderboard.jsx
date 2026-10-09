import React from 'react';
import { formatRaceTime } from './marblePhysics';

export default function MarbleRaceLeaderboard({ marbles = [], elapsedTimeMs = 0 }) {
  // Sắp xếp học sinh theo thứ tự về đích hoặc theo vị trí Y hiện tại
  const sortedMarbles = [...marbles].sort((a, b) => {
    if (a.isFinished && b.isFinished) {
      return (a.finishTime || 0) - (b.finishTime || 0);
    }
    if (a.isFinished) return -1;
    if (b.isFinished) return 1;
    return b.y - a.y;
  });

  return (
    <div className="w-full lg:w-72 bg-white border-r border-slate-200 p-4 flex flex-col h-full shadow-sm text-slate-900 select-none">
      {/* 1. HEADER TRỰC TIẾP & BỘ ĐỒNG HỒ ĐIỆN TỬ (CHUẨN ẢNH 2, 3, 4) */}
      <div className="space-y-1 pb-3 mb-2 border-b border-slate-100">
        <div className="flex items-center space-x-1.5 text-xs font-black text-rose-500">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>TRỰC TIẾP</span>
        </div>
        <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
          {formatRaceTime(elapsedTimeMs)}
        </div>
        <div className="text-xs font-black text-slate-800 uppercase tracking-wide pt-1">
          BẢNG XẾP HẠNG
        </div>
      </div>

      {/* 2. DANH SÁCH THỨ HẠNG CÁC HỌC SINH (CHUẨN ẢNH 2, 3, 4) */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
        {sortedMarbles.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-bold">
            Chưa có học sinh tham gia
          </div>
        ) : (
          sortedMarbles.map((m, idx) => {
            const rank = idx + 1;
            const isTop1 = rank === 1;

            return (
              <div
                key={m.id}
                className={`flex items-center justify-between px-3 py-2 rounded-2xl border transition-all ${
                  isTop1
                    ? 'bg-amber-50/90 border-amber-300 shadow-xs ring-2 ring-amber-400/40'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                }`}
              >
                {/* HẠNG & BADGE VIÊN BI */}
                <div className="flex items-center space-x-2 min-w-0">
                  <span
                    className={`w-5 text-center font-black text-xs ${
                      isTop1 ? 'text-amber-700' : 'text-slate-600'
                    }`}
                  >
                    {rank}
                  </span>

                  {/* THUMBNAIL VIÊN BI VỚI CHỮ VIẾT TẮT / SỐ ÁO */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px] shadow-2xs border border-white/60 flex-shrink-0"
                    style={{
                      backgroundColor: m.color?.main || '#3B82F6',
                      color: m.color?.text || '#FFF',
                    }}
                  >
                    {m.number}
                  </div>

                  {/* TÊN HỌC SINH */}
                  <span
                    className={`text-xs font-black truncate max-w-[100px] ${
                      isTop1 ? 'text-amber-950' : 'text-slate-800'
                    }`}
                    title={m.studentName}
                  >
                    {m.studentName}
                  </span>
                </div>

                {/* THỜI GIAN VỀ ĐÍCH */}
                <div className="flex-shrink-0 text-[10px] font-mono font-bold text-slate-500">
                  {m.isFinished ? formatRaceTime(m.finishTime) : ''}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
