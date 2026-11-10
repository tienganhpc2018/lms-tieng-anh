import React, { useState } from 'react';
import { 
  Plus, Check, X, Calendar, DollarSign, RefreshCw, Download, Printer, 
  FileSpreadsheet, Tag, Trash2, Edit2, ChevronRight, UserPlus, Sparkles, CheckCircle2 
} from 'lucide-react';
import { STUDENT_TAG_COLORS } from '../hoaMaiSeedData';

export const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default function AttendanceGridTab({
  trackingSheets,
  activeSheetId,
  onSelectSheet,
  onUpdateSheet,
  onCreateSheet,
  onSyncToInvoices,
  onOpenQuickInvoice
}) {
  const currentSheet = trackingSheets.find((s) => s.id === activeSheetId) || trackingSheets[0];

  // State cho các modal con của Grid
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [newSessionLabel, setNewSessionLabel] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentTag, setNewStudentTag] = useState('default');

  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [newSheetClassName, setNewSheetClassName] = useState('');
  const [newSheetMonth, setNewSheetMonth] = useState('Tháng 11/2026');
  const [newSheetPrice, setNewSheetPrice] = useState(31250);

  const [editingPrice, setEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(currentSheet?.pricePerSession || 31250);

  if (!currentSheet) {
    return <div className="p-8 text-center text-slate-500 font-bold">Chưa có bảng theo dõi nào. Hãy tạo bảng mới!</div>;
  }

  // Toggle điểm danh 1 ô
  const handleToggleAttendance = (studentId, sessionId) => {
    const updatedStudents = currentSheet.students.map((st) => {
      if (st.id === studentId) {
        const currentVal = st.attendance?.[sessionId] ?? false;
        return {
          ...st,
          attendance: {
            ...st.attendance,
            [sessionId]: !currentVal
          }
        };
      }
      return st;
    });

    onUpdateSheet({
      ...currentSheet,
      students: updatedStudents
    });
  };

  // Tick cả cột (đánh dấu cả lớp có mặt hoặc bỏ chọn cả lớp)
  const handleToggleColumn = (sessionId) => {
    // Nếu tất cả đã có mặt thì bỏ chọn, ngược lại thì chọn tất cả có mặt
    const allAttended = currentSheet.students.every((st) => st.attendance?.[sessionId] === true);
    const updatedStudents = currentSheet.students.map((st) => ({
      ...st,
      attendance: {
        ...st.attendance,
        [sessionId]: !allAttended
      }
    }));

    onUpdateSheet({
      ...currentSheet,
      students: updatedStudents
    });
  };

  // Đổi nhãn màu học sinh
  const handleChangeTagColor = (studentId, newColor) => {
    const updatedStudents = currentSheet.students.map((st) =>
      st.id === studentId ? { ...st, tagColor: newColor } : st
    );
    onUpdateSheet({ ...currentSheet, students: updatedStudents });
  };

  // Toggle trạng thái đóng tiền
  const handleTogglePaid = (studentId) => {
    const updatedStudents = currentSheet.students.map((st) =>
      st.id === studentId ? { ...st, isPaid: !st.isPaid } : st
    );
    onUpdateSheet({ ...currentSheet, students: updatedStudents });
  };

  // Xóa học sinh khỏi bảng
  const handleDeleteStudent = (studentId, studentName) => {
    if (!window.confirm(`Thầy có chắc chắn muốn xóa học sinh "${studentName}" khỏi bảng này?`)) return;
    const updatedStudents = currentSheet.students.filter((st) => st.id !== studentId);
    onUpdateSheet({ ...currentSheet, students: updatedStudents });
  };

  // Thêm buổi học mới
  const handleAddSession = (e) => {
    e.preventDefault();
    if (!newSessionLabel.trim()) return;

    const newId = `sess-${Date.now()}`;
    const newSession = {
      id: newId,
      label: newSessionLabel.trim(),
      date: newSessionDate.trim() || new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    };

    // Mặc định tích có mặt cho học sinh khi thêm buổi mới
    const updatedStudents = currentSheet.students.map((st) => ({
      ...st,
      attendance: {
        ...st.attendance,
        [newId]: true
      }
    }));

    onUpdateSheet({
      ...currentSheet,
      sessions: [...currentSheet.sessions, newSession],
      students: updatedStudents
    });

    setNewSessionLabel('');
    setNewSessionDate('');
    setIsAddSessionOpen(false);
  };

  // Thêm học sinh mới vào bảng
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newId = `hs-${Date.now()}`;
    const initialAtt = {};
    currentSheet.sessions.forEach((sess) => {
      initialAtt[sess.id] = true; // Mặc định có mặt
    });

    const newStudent = {
      id: newId,
      name: newStudentName.trim(),
      phone: newStudentPhone.trim() || '0988.000.xxx',
      tagColor: newStudentTag,
      attendance: initialAtt,
      isPaid: false
    };

    onUpdateSheet({
      ...currentSheet,
      students: [...currentSheet.students, newStudent]
    });

    setNewStudentName('');
    setNewStudentPhone('');
    setNewStudentTag('default');
    setIsAddStudentOpen(false);
  };

  // Cập nhật đơn giá buổi học
  const handleSavePrice = () => {
    const val = parseInt(tempPrice, 10);
    if (!isNaN(val) && val > 0) {
      onUpdateSheet({
        ...currentSheet,
        pricePerSession: val
      });
    }
    setEditingPrice(false);
  };

  // Xuất CSV
  const handleExportCSV = () => {
    const headers = ['STT', 'Họ và tên', 'Nhãn', ...currentSheet.sessions.map((s) => `${s.label} (${s.date})`), 'Số buổi có mặt', 'Đơn giá', 'Thành tiền', 'Trạng thái nộp'];
    const rows = currentSheet.students.map((st, idx) => {
      const attendedCount = currentSheet.sessions.filter((s) => st.attendance?.[s.id] === true).length;
      const total = attendedCount * (currentSheet.pricePerSession || 31250);
      const sessionValues = currentSheet.sessions.map((s) => (st.attendance?.[s.id] ? 'V' : '-'));
      return [
        idx + 1,
        `"${st.name}"`,
        `"${STUDENT_TAG_COLORS[st.tagColor || 'default']?.label}"`,
        ...sessionValues,
        attendedCount,
        currentSheet.pricePerSession || 31250,
        total,
        st.isPaid ? 'ĐÃ NỘP' : 'CHƯA NỘP'
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bang_Diem_Danh_${currentSheet.className.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tính toán thống kê cuối bảng
  const totalStudents = currentSheet.students.length;
  let totalAttendedCount = 0;
  let totalExpectedFee = 0;
  let totalCollectedFee = 0;

  currentSheet.students.forEach((st) => {
    const count = currentSheet.sessions.filter((s) => st.attendance?.[s.id] === true).length;
    const fee = count * (currentSheet.pricePerSession || 31250);
    totalAttendedCount += count;
    totalExpectedFee += fee;
    if (st.isPaid) totalCollectedFee += fee;
  });

  return (
    <div className="space-y-4">
      {/* 1. THANH CHỌN TỪNG LỚP & THÁNG THEO DÕI */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {trackingSheets.map((sheet) => {
            const isActive = sheet.id === currentSheet.id;
            return (
              <button
                key={sheet.id}
                onClick={() => onSelectSheet(sheet.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>📋</span>
                <span>{sheet.className}</span>
              </button>
            );
          })}
          <button
            onClick={() => setIsCreateSheetOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition flex items-center space-x-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tạo Bảng Mới</span>
          </button>
        </div>

        {/* Cấu hình đơn giá / buổi */}
        <div className="flex items-center space-x-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs">
          <span className="font-bold text-amber-900">💵 Đơn giá / buổi:</span>
          {editingPrice ? (
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                className="w-24 px-2 py-1 bg-white border border-amber-400 rounded text-xs font-bold"
                step="500"
              />
              <button onClick={handleSavePrice} className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold">
                Lưu
              </button>
              <button onClick={() => setEditingPrice(false)} className="px-1.5 py-1 text-slate-500 text-[11px]">
                Hủy
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <span className="font-black text-emerald-700 text-sm">{formatVND(currentSheet.pricePerSession || 31250)}</span>
              <button
                onClick={() => {
                  setTempPrice(currentSheet.pricePerSession || 31250);
                  setEditingPrice(true);
                }}
                className="p-1 text-slate-500 hover:text-emerald-700"
                title="Sửa đơn giá"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. THANH CÔNG CỤ TÁC VỤ (HÀNH ĐỘNG NHANH) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddSessionOpen(true)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center space-x-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>+ Thêm Buổi Học</span>
          </button>

          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center space-x-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Thêm Học Sinh</span>
          </button>

          <button
            onClick={() => onSyncToInvoices(currentSheet)}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center space-x-1.5"
            title="Tự động nhân buổi và sinh hóa đơn thu học phí cho cả lớp"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🔄 Đồng Bộ Sang Hóa Đơn & VietQR</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel / CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Bảng</span>
          </button>
        </div>
      </div>

      {/* 3. BẢNG MA TRẬN ĐIỂM DANH & HỌC PHÍ KIỂU EXCEL GRID (CUỘN NGANG) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tiêu đề bảng */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-tight flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
              <span>BẢNG THEO DÕI ĐIỂM DANH & HỌC PHÍ: {currentSheet.className.toUpperCase()}</span>
            </h2>
            <p className="text-xs text-emerald-100 font-medium">
              Kỳ thu: <span className="font-bold text-amber-300">{currentSheet.month}</span> • Đơn giá: <span className="font-bold text-white">{formatVND(currentSheet.pricePerSession)}</span>/buổi • Sĩ số: <span className="font-bold text-white">{totalStudents}</span> học sinh
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 bg-white/20 rounded-lg backdrop-blur-xs font-semibold">
              Tick V: Có mặt • Bỏ tick: Vắng
            </span>
          </div>
        </div>

        {/* Lưới cuộn ngang */}
        <div className="overflow-x-auto max-h-[600px] relative">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[11px] sticky top-0 z-20 shadow-2xs">
              <tr className="border-b border-slate-300">
                {/* CỘT CỐ ĐỊNH BÊN TRÁI */}
                <th className="py-3 px-2 text-center w-10 sticky left-0 bg-slate-100 z-30 border-r border-slate-300">STT</th>
                <th className="py-3 px-3 min-w-[190px] sticky left-10 bg-slate-100 z-30 border-r border-slate-300">Họ Và Tên Học Sinh</th>
                
                {/* CÁC CỘT BUỔI HỌC LINH HOẠT */}
                {currentSheet.sessions.map((sess, idx) => (
                  <th key={sess.id} className="py-2 px-1 text-center min-w-[70px] border-r border-slate-200">
                    <div className="font-extrabold text-slate-800">{sess.label}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{sess.date}</div>
                    <button
                      type="button"
                      onClick={() => handleToggleColumn(sess.id)}
                      className="mt-1 px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[9px] font-bold transition w-full"
                      title="Tick chọn / bỏ chọn cả cột"
                    >
                      Tick cả cột
                    </button>
                  </th>
                ))}

                {/* CỘT TÍNH TOÁN & THÀNH TIỀN */}
                <th className="py-3 px-2 text-center min-w-[70px] border-r border-slate-200 bg-emerald-50 text-emerald-950 font-black">
                  Số buổi
                </th>
                <th className="py-3 px-2 text-right min-w-[95px] border-r border-slate-200 bg-emerald-50 text-emerald-950 font-black">
                  Thành tiền
                </th>
                <th className="py-3 px-2 text-center min-w-[100px] border-r border-slate-200">
                  Trạng thái
                </th>
                <th className="py-3 px-2 text-center min-w-[90px]">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {currentSheet.students.map((st, idx) => {
                const attendedSessionsCount = currentSheet.sessions.filter(
                  (s) => st.attendance?.[s.id] === true
                ).length;
                const studentFee = attendedSessionsCount * (currentSheet.pricePerSession || 31250);
                const tag = STUDENT_TAG_COLORS[st.tagColor || 'default'] || STUDENT_TAG_COLORS.default;

                return (
                  <tr key={st.id} className="hover:bg-teal-50/40 transition">
                    {/* STT */}
                    <td className="py-2.5 px-2 text-center font-bold text-slate-500 sticky left-0 bg-white z-10 border-r border-slate-200">
                      {idx + 1}
                    </td>

                    {/* Họ và tên + Tag màu */}
                    <td className="py-2.5 px-3 sticky left-10 bg-white z-10 border-r border-slate-200">
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${tag.bg} ${tag.text} ${tag.border}`}>
                          {st.name}
                        </span>
                        {st.tagColor && st.tagColor !== 'default' && (
                          <span className="text-[9px] text-slate-400 font-semibold italic">
                            ({tag.label.split(' ')[0]})
                          </span>
                        )}
                      </div>
                      {st.phone && (
                        <div className="text-[10px] text-slate-400 mt-0.5">{st.phone}</div>
                      )}
                    </td>

                    {/* Checkbox điểm danh từng buổi */}
                    {currentSheet.sessions.map((sess) => {
                      const isPresent = st.attendance?.[sess.id] === true;
                      return (
                        <td key={sess.id} className="py-1 px-1 text-center border-r border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(st.id, sess.id)}
                            className={`w-7 h-7 mx-auto rounded-lg font-black text-xs flex items-center justify-center transition cursor-pointer shadow-2xs ${
                              isPresent
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                : 'bg-slate-100 hover:bg-red-100 text-slate-300 hover:text-red-600 border border-slate-300'
                            }`}
                            title={isPresent ? 'Có mặt' : 'Vắng'}
                          >
                            {isPresent ? <Check className="w-4 h-4 stroke-[3]" /> : '—'}
                          </button>
                        </td>
                      );
                    })}

                    {/* Số buổi có mặt */}
                    <td className="py-2.5 px-2 text-center font-black text-slate-900 border-r border-slate-200 bg-slate-50/70">
                      <span className="px-2 py-1 bg-white rounded-md border border-slate-200 shadow-2xs">
                        {attendedSessionsCount} / {currentSheet.sessions.length}
                      </span>
                    </td>

                    {/* Thành tiền dự kiến */}
                    <td className="py-2.5 px-2 text-right font-black text-emerald-800 border-r border-slate-200 bg-emerald-50/40">
                      {formatVND(studentFee)}
                    </td>

                    {/* Trạng thái nộp tiền */}
                    <td className="py-2.5 px-2 text-center border-r border-slate-200">
                      <button
                        onClick={() => handleTogglePaid(st.id)}
                        className={`px-2 py-1 rounded-full text-[10px] font-extrabold transition cursor-pointer ${
                          st.isPaid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {st.isPaid ? '✓ Đã nộp' : '⏳ Chưa nộp'}
                      </button>
                    </td>

                    {/* Thao tác */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {/* Chọn nhanh màu tag */}
                        <select
                          value={st.tagColor || 'default'}
                          onChange={(e) => handleChangeTagColor(st.id, e.target.value)}
                          className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1 py-0.5 font-bold cursor-pointer"
                          title="Đổi màu nhãn học sinh"
                        >
                          <option value="default">Mặc định</option>
                          <option value="cyan">Cyan (Học ghép)</option>
                          <option value="purple">Tím (Lớp khác gửi)</option>
                          <option value="green">Xanh lá (Ưu đãi)</option>
                          <option value="yellow">Vàng (Lưu ý)</option>
                        </select>

                        {/* Nút xóa */}
                        <button
                          onClick={() => handleDeleteStudent(st.id, st.name)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                          title="Xóa học sinh khỏi bảng"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* CHÂN TRANG TỔNG KẾT THỐNG KÊ (FOOTER) */}
            <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 text-xs sticky bottom-0 z-20">
              <tr>
                <td colSpan={2} className="py-3 px-3 sticky left-0 bg-slate-100 z-30 border-r border-slate-300">
                  <div className="text-emerald-900 font-black text-xs uppercase">
                    TỔNG CỘNG: {totalStudents} HỌC SINH
                  </div>
                </td>

                {/* Tổng lượt có mặt từng buổi */}
                {currentSheet.sessions.map((sess) => {
                  const sessAttCount = currentSheet.students.filter(
                    (st) => st.attendance?.[sess.id] === true
                  ).length;
                  return (
                    <td key={sess.id} className="py-3 px-1 text-center border-r border-slate-200 text-slate-700 font-extrabold text-[11px]">
                      {sessAttCount}
                    </td>
                  );
                })}

                {/* Tổng lượt có mặt toàn lớp */}
                <td className="py-3 px-2 text-center bg-emerald-100 text-emerald-950 font-black border-r border-slate-300">
                  {totalAttendedCount} lượt
                </td>

                {/* Tổng tiền học phí dự kiến */}
                <td className="py-3 px-2 text-right bg-emerald-100 text-emerald-950 font-black border-r border-slate-300 text-sm">
                  {formatVND(totalExpectedFee)}
                </td>

                {/* Tỷ lệ đã nộp */}
                <td colSpan={2} className="py-3 px-2 text-center text-slate-600 text-[11px]">
                  Đã thu: <span className="text-emerald-700 font-black">{formatVND(totalCollectedFee)}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 4. CHÚ THÍCH MÀU NHÃN THEO QUY ĐỊNH CỦA THẦY */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
        <span className="font-extrabold text-slate-700">🎨 Phân loại màu tên học sinh:</span>
        {Object.entries(STUDENT_TAG_COLORS).map(([key, val]) => (
          <span key={key} className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${val.bg} ${val.text} ${val.border}`}>
            {val.label}
          </span>
        ))}
      </div>

      {/* MODAL 1: THÊM BUỔI HỌC MỚI */}
      {isAddSessionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-900 mb-3 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Thêm Buổi Học Mới</span>
            </h3>
            <form onSubmit={handleAddSession} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên buổi học (VD: Buổi 13, Buổi Bù...):</label>
                <input
                  type="text"
                  required
                  value={newSessionLabel}
                  onChange={(e) => setNewSessionLabel(e.target.value)}
                  placeholder="Buổi 13"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngày học (VD: 25/10):</label>
                <input
                  type="text"
                  value={newSessionDate}
                  onChange={(e) => setNewSessionDate(e.target.value)}
                  placeholder="25/10"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSessionOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700"
                >
                  Xác nhận thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: THÊM HỌC SINH MỚI VÀO BẢNG */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-900 mb-3 flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>Thêm Học Sinh Vào Bảng</span>
            </h3>
            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên học sinh:</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="VD: Nguyễn Văn Anh"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại phụ huynh:</label>
                <input
                  type="text"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  placeholder="0912xxxxxx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Phân loại nhãn màu:</label>
                <select
                  value={newStudentTag}
                  onChange={(e) => setNewStudentTag(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="default">Mặc định</option>
                  <option value="cyan">Cyan (Học ghép)</option>
                  <option value="purple">Tím (Lớp khác gửi)</option>
                  <option value="green">Xanh lá (Ưu đãi)</option>
                  <option value="yellow">Vàng (Cần lưu ý)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TẠO BẢNG THEO DÕI MỚI CHO LỚP HOẶC THÁNG KHÁC */}
      {isCreateSheetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-900 mb-3 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>Tạo Bảng Theo Dõi Mới</span>
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newSheetClassName.trim()) return;
                const newSheet = {
                  id: `sheet-${Date.now()}`,
                  className: newSheetClassName.trim(),
                  month: newSheetMonth.trim(),
                  pricePerSession: parseInt(newSheetPrice, 10) || 31250,
                  sessions: [
                    { id: 's1', label: 'Buổi 1', date: '01/11' },
                    { id: 's2', label: 'Buổi 2', date: '04/11' },
                    { id: 's3', label: 'Buổi 3', date: '08/11' }
                  ],
                  students: []
                };
                onCreateSheet(newSheet);
                setIsCreateSheetOpen(false);
                setNewSheetClassName('');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên lớp / Nhóm học:</label>
                <input
                  type="text"
                  required
                  value={newSheetClassName}
                  onChange={(e) => setNewSheetClassName(e.target.value)}
                  placeholder="VD: Lớp 7B (Nâng cao)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kỳ theo dõi / Tháng:</label>
                <input
                  type="text"
                  required
                  value={newSheetMonth}
                  onChange={(e) => setNewSheetMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Đơn giá / buổi học (VNĐ):</label>
                <input
                  type="number"
                  required
                  value={newSheetPrice}
                  onChange={(e) => setNewSheetPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  step="500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSheetOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700"
                >
                  Tạo Bảng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
