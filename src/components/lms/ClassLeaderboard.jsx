import React from 'react';
import { Trophy, Medal, Award, User, Clock, CheckCircle } from 'lucide-react';

export default function ClassLeaderboard({ submissions = [], activityTitle }) {
  // Sắp xếp danh sách bài nộp: Điểm cao nhất -> Thời gian nộp sớm nhất
  const sortedSubmissions = [...submissions]
    .filter((s) => s.status === 'graded')
    .sort((a, b) => {
      if ((b.score || 0) !== (a.score || 0)) {
        return (b.score || 0) - (a.score || 0);
      }
      return new Date(a.submitted_at || 0) - new Date(b.submitted_at || 0);
    })
    .slice(0, 5); // Lấy Top 5 xuất sắc nhất

  if (sortedSubmissions.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-3xl border border-indigo-800 shadow-xl space-y-4">
      <div className="flex justify-between items-center border-b border-indigo-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-amber-300 uppercase tracking-wide">
              🏆 BẢNG XẾP HẠNG TOP HỌC SINH XUẤT SẮC CẢ LỚP
            </h3>
            <p className="text-[11px] text-indigo-200">Vinh danh Top 5 học sinh có điểm số cao nhất bài thi {activityTitle || ''}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold rounded-xl">
          Top {sortedSubmissions.length} Xuất Sắc
        </span>
      </div>

      <div className="space-y-2">
        {sortedSubmissions.map((sub, index) => {
          let rankBadge = null;
          let bgClass = 'bg-slate-800/60 border-slate-700';

          if (index === 0) {
            rankBadge = <span className="text-xl">🥇</span>;
            bgClass = 'bg-gradient-to-r from-amber-500/20 to-yellow-600/30 border-amber-400/60 ring-2 ring-amber-400/30';
          } else if (index === 1) {
            rankBadge = <span className="text-xl">🥈</span>;
            bgClass = 'bg-gradient-to-r from-slate-300/20 to-slate-400/20 border-slate-300/50';
          } else if (index === 2) {
            rankBadge = <span className="text-xl">🥉</span>;
            bgClass = 'bg-gradient-to-r from-amber-700/20 to-amber-800/20 border-amber-600/50';
          } else {
            rankBadge = <span className="w-6 font-extrabold text-xs text-indigo-300">#{index + 1}</span>;
          }

          return (
            <div
              key={sub.id || index}
              className={`p-3 rounded-2xl border flex items-center justify-between transition ${bgClass}`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 flex items-center justify-center">{rankBadge}</div>
                <div>
                  <h5 className="font-extrabold text-xs text-white flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{sub.profiles?.full_name || 'Học Viên'}</span>
                  </h5>
                  <span className="text-[10px] text-slate-400 block">{sub.profiles?.email}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-amber-400 block">{sub.score} điểm</span>
                <span className="text-[10px] text-indigo-300 flex items-center justify-end space-x-0.5">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span>{new Date(sub.submitted_at || Date.now()).toLocaleTimeString('vi-VN')}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
