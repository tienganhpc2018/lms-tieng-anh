import React, { useState } from 'react';
import { FileText, CheckCircle2, XCircle, Clock, Check, AlertCircle } from 'lucide-react';

export default function LeaveRequestsTab({ leaveRequests = [], onUpdateLeaveRequest }) {
  const [filter, setFilter] = useState('all');

  const handleAction = (reqId, newStatus, deduct) => {
    onUpdateLeaveRequest(reqId, {
      status: newStatus,
      deductFee: deduct
    });
  };

  const filtered = leaveRequests.filter((r) => {
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'approved') return r.status === 'approved';
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>QUẢN LÝ ĐƠN XIN NGHỈ PHÉP & DUYỆT GIẢM TRỪ HỌC PHÍ</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhận đơn xin nghỉ từ phụ huynh / học sinh và tự động trừ học phí buổi nghỉ có phép
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Tất cả ({leaveRequests.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${filter === 'approved' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800'}`}
          >
            Đã duyệt
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((req) => (
          <div key={req.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-black text-slate-900 text-sm">{req.studentName}</span>
                <span className="text-xs font-semibold text-slate-500">({req.className})</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  req.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {req.status === 'approved' ? '✓ Đã duyệt phép' : '⏳ Chờ duyệt'}
                </span>
              </div>

              <div className="text-xs text-slate-700 font-medium">
                Buổi xin nghỉ: <b className="text-emerald-800">{req.sessionLabel || 'Buổi học'} ({req.date})</b>
              </div>

              <div className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                &ldquo;{req.reason}&rdquo;
              </div>

              <div className="text-[11px] text-slate-400">
                SĐT liên hệ: {req.parentPhone} • Gửi ngày: {req.createdAt}
              </div>
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
              {req.status === 'approved' ? (
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã chấp thuận</span>
                  </span>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {req.deductFee ? '✓ Đã trừ học phí buổi này' : 'Không trừ học phí'}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAction(req.id, 'approved', true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Duyệt & Trừ học phí
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'approved', false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    Duyệt không trừ
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
