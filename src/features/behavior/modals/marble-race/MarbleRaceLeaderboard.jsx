import React from 'react';
import { Trophy, Crown, Flame } from 'lucide-react';

export default function MarbleRaceLeaderboard({ marbles = [], isRacing = false }) {
  // Sắp xếp học sinh theo thứ tự dẫn đầu hoặc thứ tự về đích
  const sortedMarbles = [...marbles].sort((a, b) => {
    if (a.isFinished && b.isFinished) {
      return (a.finishTime || 0) - (b.finishTime || 0);
    }
    if (a.isFinished) return -1;
    if (b.isFinished) return 1;
    // Đang đua: so sánh tung độ Y (y lớn hơn là tiến sát vạch đích hơn)
    return b.y - a.y;
  });

  return (
    <div className="w-full lg:w-72 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/60 p-4 flex flex-col h-full shadow-2xl text-white">
      {/* HEADER BẢNG XẾP HẠNG */}
      <div className="flex items-center justify-between border-b border-slate-700/70 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-sm text-white tracking-wide uppercase">
              BẢNG XẾP HẠNG
            </h3>
            <p className="text-[10px] font-bold text-slate-400">
              {isRacing ? '⚡ Đang cập nhật trực tiếp...' : '🏁 Thứ hạng cuộc đua'}
            </p>
          </div>
        </div>
        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-purple-300">
          {marbles.length} HS
        </span>
      </div>

      {/* DANH SÁCH THỨ HẠNG */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
        {sortedMarbles.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-bold">
            Chưa có học sinh tham gia
          </div>
        ) : (
          sortedMarbles.map((m, idx) => {
            const rank = idx + 1;
            const isTop1 = rank === 1;
            const isTop2 = rank === 2;
            const isTop3 = rank === 3;

            return (
              <div
                key={m.id}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-200 ${
                  isTop1
                    ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border-amber-400/60 shadow-lg shadow-amber-500/10 scale-[1.02]'
                    : isTop2
                    ? 'bg-slate-800/80 border-slate-400/40'
                    : isTop3
                    ? 'bg-slate-800/60 border-amber-700/40'
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70'
                }`}
              >
                {/* THỨ HẠNG & NÚT MÀU VIÊN BI */}
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-6 text-center font-black text-xs flex-shrink-0">
                    {isTop1 ? (
                      <Crown className="w-4 h-4 text-amber-400 mx-auto animate-bounce" />
                    ) : isTop2 ? (
                      <span className="text-slate-300">🥈</span>
                    ) : isTop3 ? (
                      <span className="text-amber-600">🥉</span>
                    ) : (
                      <span className="text-slate-400">#{rank}</span>
                    )}
                  </div>

                  {/* THUMBNAIL VIÊN BI */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-md border border-white/30 flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${m.color.light}, ${m.color.main}, ${m.color.dark})`,
                      color: m.color.text,
                    }}
                  >
                    {m.number}
                  </div>

                  {/* TÊN HỌC SINH */}
                  <span
                    className={`text-xs font-black truncate max-w-[110px] sm:max-w-[130px] ${
                      isTop1
                        ? 'text-amber-300'
                        : isTop2
                        ? 'text-slate-200'
                        : isTop3
                        ? 'text-amber-200'
                        : 'text-slate-300'
                    }`}
                    title={m.studentName}
                  >
                    {m.studentName}
                  </span>
                </div>

                {/* TRẠNG THÁI VỀ ĐÍCH */}
                <div className="flex items-center space-x-1 flex-shrink-0">
                  {m.isFinished ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Về #{m.finishRank || rank}
                    </span>
                  ) : isTop1 && isRacing ? (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                      <span>TOP 1</span>
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
