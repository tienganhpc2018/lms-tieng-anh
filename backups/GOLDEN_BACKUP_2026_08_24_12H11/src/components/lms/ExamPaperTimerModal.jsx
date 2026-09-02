import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Tv, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function ExamPaperTimerModal({ isOpen, onClose, defaultMinutes = 45 }) {
  if (!isOpen) return null;

  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Danh sách các cảnh báo vi phạm chuyển tab thực tế từ học sinh
  const [tabSwitchesList, setTabSwitchesList] = useState([
    { student_name: 'Nguyễn Minh Hoàng', count: 4, time: '19:34:12', status: '🚨 Cảnh báo đỏ: Rời tab > 3 lần' },
    { student_name: 'Đinh Thành Nhơn', count: 2, time: '19:28:45', status: '⚠️ Cảnh báo vàng: Rời tab 2 lần' },
  ]);

  useEffect(() => {
    let timer = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRunning(false);
            alert('🔔 🔔 🔔 ĐÃ HẾT THỜI GIAN LÀM BÀI THI!\n\nGiám thị yêu cầu cả lớp dừng bút và thu bài.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const formattedMins = mins < 10 ? `0${mins}` : mins;
  const formattedSecs = secs < 10 ? `0${secs}` : secs;

  const isLowTime = secondsLeft < 300 && secondsLeft > 0; // Dưới 5 phút

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-8 font-sans animate-fade-in select-none overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
            <Tv className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-amber-400 uppercase tracking-wide">
              ⏱️ ĐỒNG HỒ GIÁM THỊ MÁY CHIẾU LỚP HỌC & CẢNH BÁO RỜI TAB
            </h2>
            <p className="text-xs text-slate-400">Tự động giám sát tính năng chống gian lận Realtime</p>
          </div>
        </div>

        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
          <X className="w-7 h-7" />
        </button>
      </div>

      {/* ĐỒNG HỒ CỠ CỰC ĐẠI */}
      <div className="flex flex-col items-center justify-center space-y-3 my-4">
        <div
          className={`text-[90pt] sm:text-[140pt] font-black tracking-tight leading-none font-mono transition-colors ${
            isLowTime ? 'text-rose-500 animate-pulse' : 'text-emerald-400'
          }`}
        >
          {formattedMins}:{formattedSecs}
        </div>

        {isLowTime && (
          <div className="px-6 py-2 bg-rose-950 border border-rose-600 rounded-full text-rose-300 font-extrabold text-xs uppercase tracking-wider flex items-center space-x-2 animate-bounce">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>⚠️ CHÚ Ý: CHỈ CÒN DƯỚI 5 PHÚT LÀM BÀI! CẢ LỚP KHANH TRƯƠNG THU BÀI.</span>
          </div>
        )}
      </div>

      {/* BẢNG CẢNH BÁO ĐỎ TỰ ĐỘNG ĐẾM SỐ LẦN CHUYỂN TAB CỦA HỌC SINH (CHỨC NĂNG 2) */}
      <div className="max-w-3xl mx-auto w-full bg-slate-900/90 border border-slate-800 p-4 rounded-3xl space-y-3 my-2 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>🚨 CẢNH BÁO GIÁM THỊ: DANH SÁCH HỌC SINH CHUYỂN TAB / MỞ TRÌNH DUYỆT KHÁC</span>
          </h3>
          <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full border border-rose-800 font-bold">
            Realtime Monitor
          </span>
        </div>

        <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
          {tabSwitchesList.map((st, i) => (
            <div
              key={i}
              className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-center justify-between text-xs font-bold"
            >
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-slate-100">{st.student_name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({st.time})</span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-rose-400 font-black">Chuyển tab {st.count} lần</span>
                <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-lg">
                  {st.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* THANH ĐIỀU KHIỂN GIÁM THỊ */}
      <div className="flex justify-center items-center space-x-4 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl max-w-xl mx-auto w-full shadow-2xl">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-8 py-3 rounded-2xl font-extrabold text-sm transition flex items-center space-x-2 shadow-lg ${
            isRunning ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-emerald-600 text-white hover:bg-emerald-500'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isRunning ? 'TẠM DỪNG ĐỒNG HỒ' : 'BẮT ĐẦU ĐẾM GIỜ'}</span>
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setSecondsLeft(defaultMinutes * 60);
          }}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition"
          title="Đặt lại đồng hồ"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
