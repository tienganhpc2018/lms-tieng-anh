import React, { useState } from 'react';
import { Trophy, Award, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { playClick } from '../../../utils/soundEffects';

export default function GiftShopLeaderboard({ students = [], redemptions = [] }) {
  const [activeTab, setActiveTab] = useState('coins'); // 'coins' | 'redeemed'
  const [isExpanded, setIsExpanded] = useState(true);

  // 1. Top 5 Đại gia tích xu (Số dư xu hiện tại)
  const topCoins = [...students]
    .sort((a, b) => (b.plus_points || b.coins || 0) - (a.plus_points || a.coins || 0))
    .slice(0, 5);

  // 2. Top 5 Siêu sao đổi quà (Tổng xu hoặc số lần đã đổi)
  const redemptionCounts = {};
  redemptions.forEach((r) => {
    if (!redemptionCounts[r.studentId]) {
      redemptionCounts[r.studentId] = {
        studentId: r.studentId,
        studentName: r.studentName,
        totalSpent: 0,
        count: 0,
      };
    }
    redemptionCounts[r.studentId].totalSpent += r.coinsSpent || 0;
    redemptionCounts[r.studentId].count += 1;
  });

  const topRedeemers = Object.values(redemptionCounts)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-3xl border border-amber-200/80 shadow-md p-4 sm:p-5 space-y-3 transition-all">
      {/* HEADER BẢNG VINH DANH */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-xl shadow-xs">
            🏆
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-1.5">
              <span>Bảng Vinh Danh Thi Đua Lớp</span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Vinh danh những gương mặt tích cực và nỗ lực nhất trong tháng
            </p>
          </div>
        </div>

        {/* 2 TABS & NÚT THU GỌN */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                playClick();
                setActiveTab('coins');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'coins'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🪙</span>
              <span>Đại Gia Tích Xu</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClick();
                setActiveTab('redeemed');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'redeemed'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🎁</span>
              <span>Siêu Sao Đổi Quà</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* DANH SÁCH TOP VINH DANH */}
      {isExpanded && (
        <div className="pt-2 border-t border-slate-100">
          {activeTab === 'coins' ? (
            topCoins.length === 0 || topCoins.every((s) => (s.plus_points || s.coins || 0) === 0) ? (
              <div className="py-4 text-center text-xs text-slate-400 font-semibold italic">
                Chưa có học sinh nào tích lũy xu thi đua. Thầy/Cô hãy cộng sao ở Sổ Nề Nếp để vinh danh các em nhé!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                {topCoins.map((st, idx) => {
                  const coins = st.plus_points || st.coins || 0;
                  return (
                    <div
                      key={st.id}
                      className={`p-2.5 rounded-2xl border transition flex items-center space-x-2.5 ${
                        idx === 0
                          ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-200/60 shadow-xs'
                          : idx === 1
                          ? 'bg-slate-50 border-slate-300'
                          : idx === 2
                          ? 'bg-orange-50/60 border-orange-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>

                      <div className="w-8 h-8 rounded-full bg-white border border-amber-200 p-0.5 overflow-hidden flex-shrink-0">
                        <img src={st.avatar} alt={st.full_name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate">{st.full_name}</h4>
                        <span className="text-[11px] font-black text-amber-600 flex items-center space-x-1">
                          <span>🪙 {coins} xu</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            topRedeemers.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 font-semibold italic">
                Chưa có học sinh nào đổi quà trong tháng này. Hãy khuyến khích các em dùng xu đổi quà học tập nhé!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                {topRedeemers.map((r, idx) => {
                  const student = students.find((s) => s.id === r.studentId);
                  return (
                    <div
                      key={r.studentId}
                      className={`p-2.5 rounded-2xl border transition flex items-center space-x-2.5 ${
                        idx === 0
                          ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-200 shadow-xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">
                        {idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>

                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-purple-200 p-0.5 overflow-hidden flex-shrink-0">
                        <img
                          src={student?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${r.studentName}`}
                          alt={r.studentName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate">{r.studentName}</h4>
                        <span className="text-[10px] font-extrabold text-purple-700 block">
                          Đã đổi {r.count} món ({r.totalSpent} xu)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
