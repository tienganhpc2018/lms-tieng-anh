import React, { useState } from 'react';
import { X, UserCheck, Copy, Check, AlertCircle, Clock, Calendar } from 'lucide-react';
import { playClick, playCorrect } from '../../../utils/soundEffects';

export default function AttendanceModal4({ isOpen, onClose, classInfo, students, onUpdateStudents }) {
  const [localStudents, setLocalStudents] = useState([...students]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleStatusChange = (index, newStatus) => {
    playClick();
    const updated = [...localStudents];
    updated[index] = { ...updated[index], status: newStatus };
    setLocalStudents(updated);
  };

  const handleNotesChange = (index, notes) => {
    const updated = [...localStudents];
    updated[index] = { ...updated[index], notes };
    setLocalStudents(updated);
  };

  const handleMarkAllPresent = () => {
    playCorrect();
    const updated = localStudents.map((s) => ({ ...s, status: 'Present' }));
    setLocalStudents(updated);
  };

  const handleSave = () => {
    playCorrect();
    onUpdateStudents(localStudents);
    onClose();
  };

  // Thống kê nhanh
  const total = localStudents.length;
  const presentCount = localStudents.filter((s) => s.status === 'Present').length;
  const absentPermCount = localStudents.filter((s) => s.status === 'Absent_Perm').length;
  const absentNoPermCount = localStudents.filter((s) => s.status === 'Absent_NoPerm').length;
  const lateCount = localStudents.filter((s) => s.status === 'Late').length;

  // 1-Click Sao chép báo cáo Zalo
  const handleCopyZaloReport = () => {
    playCorrect();
    const today = new Date().toLocaleDateString('vi-VN');
    const absentList = localStudents.filter(
      (s) => s.status === 'Absent_Perm' || s.status === 'Absent_NoPerm'
    );
    const lateList = localStudents.filter((s) => s.status === 'Late');

    let text = `📋 BÁO CÁO ĐIỂM DANH ${classInfo?.full_name || 'LỚP HỌC'}\n`;
    text += `📅 Ngày: ${today}\n`;
    text += `👥 Sĩ số: ${total} HS • Hiện diện: ${presentCount} • Vắng: ${absentPermCount + absentNoPermCount} (Phép: ${absentPermCount}, K.Phép: ${absentNoPermCount}) • Trễ: ${lateCount}\n\n`;

    if (absentList.length > 0) {
      text += `🔴 DANH SÁCH VẮNG MẶT:\n`;
      absentList.forEach((s, idx) => {
        const typeStr = s.status === 'Absent_Perm' ? 'Có phép' : 'Không phép';
        const noteStr = s.notes ? ` - ${s.notes}` : '';
        text += `${idx + 1}. ${s.full_name} (${s.code}) [${typeStr}]${noteStr}\n`;
      });
      text += `\n`;
    } else {
      text += `✅ Lớp đi học đầy đủ 100%!\n\n`;
    }

    if (lateList.length > 0) {
      text += `🟡 HỌC SINH ĐI TRỄ:\n`;
      lateList.forEach((s, idx) => {
        const noteStr = s.notes ? ` - ${s.notes}` : '';
        text += `${idx + 1}. ${s.full_name} (${s.code})${noteStr}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 my-auto max-h-[92vh] flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Bảng Điểm Danh: {classInfo?.name || 'Lớp Học'}
              </h2>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 mt-0.5">
                <span>Sĩ số: {total}</span>
                <span>•</span>
                <span className="text-emerald-600">Có mặt: {presentCount}</span>
                <span>•</span>
                <span className="text-rose-600">Vắng: {absentPermCount + absentNoPermCount}</span>
                <span>•</span>
                <span className="text-amber-600">Trễ: {lateCount}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyZaloReport}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center space-x-1.5"
              title="Sao chép toàn bộ báo cáo điểm danh gửi vào nhóm Zalo phụ huynh"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã Copy Zalo!' : 'Copy Báo Cáo Zalo'}</span>
            </button>

            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NÚT TÁC VỤ NHANH */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          <span className="text-xs font-black text-slate-600 uppercase tracking-wider pl-2">
            Chọn trạng thái cho từng bạn bên dưới:
          </span>
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="px-4 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-black rounded-xl transition cursor-pointer"
          >
            ✓ Đánh Dấu Tất Cả Có Mặt
          </button>
        </div>

        {/* DANH SÁCH ĐIỂM DANH */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {localStudents.map((st, idx) => {
            const isPresent = st.status === 'Present';
            const isAbsentPerm = st.status === 'Absent_Perm';
            const isAbsentNoPerm = st.status === 'Absent_NoPerm';
            const isLate = st.status === 'Late';

            return (
              <div
                key={st.id}
                className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                  !isPresent
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 overflow-hidden flex-shrink-0">
                    <img src={st.avatar} alt={st.full_name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{st.code}</span>
                      <span className="font-black text-sm text-slate-900">{st.full_name}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          st.gender === 'Nam' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        {st.gender}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 NÚT TRẠNG THÁI */}
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(idx, 'Present')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                      isPresent
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    Có mặt
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(idx, 'Absent_Perm')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                      isAbsentPerm
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    Vắng có phép
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(idx, 'Absent_NoPerm')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                      isAbsentNoPerm
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    Không phép
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(idx, 'Late')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                      isLate
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    Trễ
                  </button>

                  {!isPresent && (
                    <input
                      type="text"
                      value={st.notes || ''}
                      onChange={(e) => handleNotesChange(idx, e.target.value)}
                      placeholder="Lý do..."
                      className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 outline-hidden w-28 focus:w-36 transition-all"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              playClick();
              onClose();
            }}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition cursor-pointer flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Lưu Trạng Thái Điểm Danh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
