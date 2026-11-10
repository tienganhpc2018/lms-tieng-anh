import React, { useState } from 'react';
import { 
  X, Search, QrCode, Calendar, CheckCircle2, Clock, 
  Send, FileText, Phone, ShieldCheck, Sparkles 
} from 'lucide-react';
import { formatVND } from './AttendanceGridTab';

export default function StudentPortalModal({
  isOpen,
  onClose,
  trackingSheets = [],
  invoices = [],
  centerConfig,
  onCreateLeaveRequest
}) {
  if (!isOpen) return null;

  // Lấy toàn bộ học sinh
  const allStudents = [];
  trackingSheets.forEach((sh) => {
    sh.students.forEach((st) => {
      if (!allStudents.some((s) => s.id === st.id)) {
        allStudents.push({ ...st, className: sh.className, sheetId: sh.id });
      }
    });
  });

  const [selectedStudentId, setSelectedStudentId] = useState(allStudents[0]?.id || '');
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'invoices' | 'leave'

  // Form gửi đơn nghỉ
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSent, setLeaveSent] = useState(false);

  const currentStudent = allStudents.find((s) => s.id === selectedStudentId) || allStudents[0];
  const currentSheet = trackingSheets.find((sh) => sh.id === currentStudent?.sheetId);

  // Tính buổi có mặt của học sinh
  const attendedSessions = currentSheet
    ? currentSheet.sessions.filter((s) => currentStudent.attendance?.[s.id] === true)
    : [];

  // Hóa đơn của học sinh
  const studentInvoices = invoices.filter(
    (inv) => inv.studentName === currentStudent?.name || inv.studentId === currentStudent?.id
  );

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    onCreateLeaveRequest({
      id: `leave-${Date.now()}`,
      studentName: currentStudent.name,
      className: currentStudent.className,
      date: leaveDate || 'Buổi tới',
      sessionLabel: 'Buổi học',
      reason: leaveReason.trim(),
      parentPhone: currentStudent.phone || '0988.xxx.xxx',
      status: 'pending',
      deductFee: true,
      createdAt: new Date().toLocaleDateString('vi-VN')
    });

    setLeaveSent(true);
    setTimeout(() => {
      setLeaveSent(false);
      setLeaveReason('');
      setLeaveDate('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 relative my-6">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-black"
        >
          ✕
        </button>

        {/* Header Cổng Phụ Huynh / Học Sinh */}
        <div className="text-center space-y-1 pb-3 border-b border-slate-100">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            CỔNG TRA CỨU HỌC TẬP & HỌC PHÍ PHỤ HUYNH 24/7
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 mt-2">
            {centerConfig?.centerName || 'TRUNG TÂM HOA MAI EDUCATION'}
          </h2>
        </div>

        {/* Chọn Học Sinh Tra Cứu */}
        <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <label className="text-[11px] font-bold text-slate-600 block">
            Chọn học sinh để tra cứu kết quả:
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-500"
          >
            {allStudents.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} — {st.className} ({st.phone || 'SĐT: Chưa có'})
              </option>
            ))}
          </select>
        </div>

        {/* 3 Tab Điều Hướng Cho Phụ Huynh */}
        <div className="flex border-b border-slate-200 mt-4 text-xs font-black">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${
              activeTab === 'attendance'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Chuyên cần ({attendedSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${
              activeTab === 'invoices'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Học phí & QR ({studentInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${
              activeTab === 'leave'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Gửi đơn xin nghỉ
          </button>
        </div>

        {/* NỘI DUNG TỪNG TAB */}
        <div className="mt-4 min-h-[260px] max-h-[380px] overflow-y-auto pr-1">
          {/* TAB 1: CHUYÊN CẦN */}
          {activeTab === 'attendance' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-900">Tổng số buổi đã đi học:</span>
                <span className="font-black text-emerald-700 text-sm">
                  {attendedSessions.length} / {currentSheet?.sessions?.length || 12} buổi
                </span>
              </div>

              <div className="text-[11px] font-bold text-slate-600 uppercase">
                Nhật ký các buổi học:
              </div>

              <div className="space-y-1.5">
                {(currentSheet?.sessions || []).map((sess) => {
                  const isPresent = currentStudent.attendance?.[sess.id] === true;
                  return (
                    <div
                      key={sess.id}
                      className="p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs hover:bg-slate-50"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{sess.label}</span>
                        <span className="text-slate-400">({sess.date})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        isPresent
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isPresent ? '✓ Có mặt' : '— Vắng'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: HỌC PHÍ & QUÉT VIETQR */}
          {activeTab === 'invoices' && (
            <div className="space-y-3">
              {studentInvoices.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Chưa có hóa đơn nào được phát hành cho học sinh này.
                </div>
              ) : (
                studentInvoices.map((inv) => {
                  const isPaid = inv.status !== 'unpaid';
                  const qrUrl = `https://img.vietqr.io/image/${centerConfig?.bankInfo?.bankId || 'MB'}-${centerConfig?.bankInfo?.accountNo || '0988123456'}-compact2.png?amount=${inv.totalAmount}&addInfo=${encodeURIComponent(inv.id + ' ' + inv.studentName)}&accountName=${encodeURIComponent(centerConfig?.bankInfo?.accountName || 'NGUYEN VAN HAI')}`;

                  return (
                    <div key={inv.id} className="p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-mono font-black text-xs text-slate-800">{inv.id}</div>
                          <div className="text-xs text-slate-500">{inv.month}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isPaid ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">Số buổi: <b>{inv.sessionsAttended}</b></span>
                        <span className="font-black text-emerald-800 text-sm">{formatVND(inv.totalAmount)}</span>
                      </div>

                      {!isPaid && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                          <div className="text-[11px] font-bold text-slate-700">
                            Bấm để quét mã VietQR chuyển khoản ngay:
                          </div>
                          <img src={qrUrl} alt="QR" className="w-48 h-auto mx-auto rounded-xl shadow-xs" />
                          <div className="text-[10px] text-slate-500">
                            STK: <b>{centerConfig?.bankInfo?.accountNo}</b> ({centerConfig?.bankInfo?.bankName})
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: GỬI ĐƠN NGHỈ PHÉP */}
          {activeTab === 'leave' && (
            <div className="space-y-3">
              {leaveSent && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold text-center">
                  ✓ Đã gửi đơn xin nghỉ thành công tới Thầy Hải! Thầy sẽ sớm xem và phản hồi.
                </div>
              )}

              <form onSubmit={handleSubmitLeave} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Ngày xin phép nghỉ học (VD: 28/10):
                  </label>
                  <input
                    type="text"
                    required
                    value={leaveDate}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    placeholder="VD: Chiều Thứ 5 (28/10)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Lý do xin nghỉ học:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Kính gửi Thầy Hải, cháu xin phép được nghỉ buổi học tới vì lý do..."
                    className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Đơn Xin Phép Cho Giáo Viên</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
