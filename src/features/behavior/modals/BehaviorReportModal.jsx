import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Share2,
  Check,
  Award,
  Star,
  GraduationCap,
  Users,
  UserCheck,
  FileText,
  Send,
} from 'lucide-react';
import { playClick, playCorrect } from '../../../utils/soundEffects';

export default function BehaviorReportModal({
  isOpen,
  onClose,
  classInfo,
  students = [],
}) {
  const [viewMode, setViewMode] = useState('summary'); // 'summary' (cả lớp) | 'individual' (từng em)
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || null);
  const [teacherNote, setTeacherNote] = useState('Chăm ngoan, tích cực xây dựng bài, có nhiều tiến bộ.');
  const [copiedZalo, setCopiedZalo] = useState(false);

  if (!isOpen) return null;

  // Sắp xếp học sinh theo điểm thi đua ròng
  const sortedStudents = [...students].sort((a, b) => {
    const netA = (a.plus_points || 0) - (a.minus_points || 0);
    const netB = (b.plus_points || 0) - (b.minus_points || 0);
    return netB - netA;
  });

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || sortedStudents[0] || null;
  const studentRank = selectedStudent
    ? sortedStudents.findIndex((s) => s.id === selectedStudent.id) + 1
    : 1;

  // Thống kê tổng quan cả lớp
  const totalPlus = students.reduce((sum, s) => sum + (s.plus_points || 0), 0);
  const totalMinus = students.reduce((sum, s) => sum + (s.minus_points || 0), 0);
  const totalKttxBonus = students.reduce((sum, s) => sum + (s.kttx_bonus || 0), 0);

  // In trang hoặc xuất PDF (dùng Window.print chuẩn)
  const handlePrint = () => {
    playClick();
    window.print();
  };

  // Mẫu tin nhắn Zalo cho từng học sinh
  const generateIndividualZaloMessage = (st, rank) => {
    if (!st) return '';
    const netScore = (st.plus_points || 0) - (st.minus_points || 0);
    const kttx = st.kttx_bonus || 0;
    const stars = st.coins || st.plus_points || 0;

    return `📢 [PHIẾU BÁO THI ĐUA NỀ NẾP & ĐIỂM THƯỞNG KTTX]
🏛️ Lớp: ${classInfo?.name || ''} • Khối ${classInfo?.grade_level || ''}
👨‍🎓 Học sinh: ${st.full_name} (${st.code})
🏆 Xếp hạng thi đua: #${rank} / ${students.length} học sinh
⭐ Điểm cộng nề nếp: +${st.plus_points || 0} điểm
⚠️ Điểm trừ nề nếp: -${st.minus_points || 0} điểm
📊 Điểm nề nếp ròng: ${netScore >= 0 ? '+' : ''}${netScore} điểm
🎓 Điểm thưởng KTTX quy đổi: +${kttx} điểm (Được cộng vào cột Kiểm tra Thường xuyên)
🌟 Sao quà tích lũy: ${stars} ⭐ (Dùng đổi quà tại Cửa Hàng Quà 4.0)
📝 Nhận xét của Giáo viên: ${teacherNote || 'Em chăm ngoan, chuyên cần, có tinh thần xây dựng bài tốt.'}

Kính gửi Quý Phụ Huynh cùng đồng hành và động viên con! Trân trọng.`;
  };

  // Mẫu tin nhắn Zalo tổng kết cả lớp gửi vào Group Phụ huynh
  const generateClassZaloMessage = () => {
    const top3 = sortedStudents.slice(0, 3);
    let topListText = '';
    top3.forEach((s, idx) => {
      const medals = ['🥇', '🥈', '🥉'];
      const net = (s.plus_points || 0) - (s.minus_points || 0);
      topListText += `\n${medals[idx] || '⭐'} Hạng ${idx + 1}: ${s.full_name} (+${net} đ | +${s.kttx_bonus || 0} đ KTTX)`;
    });

    return `📢 [BÁO CÁO TỔNG KẾT THI ĐUA NỀ NẾP & ĐIỂM THƯỞNG]
🏛️ Lớp: ${classInfo?.name || ''} • Khối ${classInfo?.grade_level || ''}
👥 Sĩ số: ${students.length} học sinh
⭐ Tổng điểm cộng toàn lớp: +${totalPlus} điểm
⚠️ Tổng điểm trừ: -${totalMinus} điểm
🎓 Tổng số điểm KTTX đã thưởng: +${totalKttxBonus} điểm

🌟 TOP HỌC SINH XUẤT SẮC NHẤT KỲ NÀY:${topListText}

Thầy/Cô tuyên dương các em đã nỗ lực rèn luyện nề nếp và học tập xuất sắc!`;
  };

  const handleCopyZalo = (text) => {
    playCorrect();
    navigator.clipboard.writeText(text);
    setCopiedZalo(true);
    setTimeout(() => setCopiedZalo(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-5 my-auto max-h-[92vh] flex flex-col print:shadow-none print:border-none print:max-h-none print:p-2">
        {/* HEADER CỦA MODAL (ẨN KHI IN) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Xuất Phiếu Báo Nề Nếp & Điểm Thưởng KTTX
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                In phiếu PDF hoặc sao chép mẫu tin nhắn gửi phụ huynh qua Zalo
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
              title="In bản giấy hoặc lưu thành file PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In / Xuất PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TÙY CHỌN CHẾ ĐỘ XEM: BẢNG CẢ LỚP HOẶC TỪNG HỌC SINH (ẨN KHI IN) */}
        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-black">
            <button
              type="button"
              onClick={() => {
                playClick();
                setViewMode('summary');
              }}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'summary' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Bảng Tổng Hợp Cả Lớp</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playClick();
                setViewMode('individual');
              }}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'individual' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Phiếu Báo Từng Học Sinh</span>
            </button>
          </div>

          {/* NÚT COPY ZALO NHANH */}
          <button
            type="button"
            onClick={() =>
              handleCopyZalo(
                viewMode === 'summary'
                  ? generateClassZaloMessage()
                  : generateIndividualZaloMessage(selectedStudent, studentRank)
              )
            }
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-black text-xs transition cursor-pointer flex items-center space-x-1.5"
          >
            {copiedZalo ? <Check className="w-4 h-4 text-emerald-600" /> : <Send className="w-4 h-4 text-blue-600" />}
            <span>{copiedZalo ? 'Đã sao chép tin nhắn Zalo!' : 'Copy Tin Nhắn Gửi Zalo'}</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* NỘI DUNG CHÍNH (ĐƯỢC IN RA KHI BẤM PRINT) */}
        {/* =================================================================== */}
        <div className="flex-1 overflow-y-auto space-y-4 print:overflow-visible">
          {/* HEADER TRANG IN CHUẨN A4 */}
          <div className="hidden print:flex items-start justify-between border-b-2 border-slate-900 pb-3 mb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">TRƯỜNG THCS & THPT VIỆT NAM</div>
              <div className="text-sm font-black text-slate-900">BỘ MÔN TIẾNG ANH - SỔ NỀ NẾP 4.0</div>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="text-[10px] text-slate-600 italic">Độc lập - Tự do - Hạnh phúc</div>
              <div className="text-[10px] text-slate-500 mt-1">Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* CHẾ ĐỘ 1: BẢNG TỔNG HỢP CẢ LỚP */}
          {/* ================================================================= */}
          {viewMode === 'summary' && (
            <div className="space-y-4">
              {/* THẺ THỐNG KÊ NHANH */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:grid-cols-4">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">Sĩ Số</span>
                  <span className="text-xl font-black text-slate-900">{students.length} HS</span>
                </div>
                <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-center">
                  <span className="text-[11px] font-bold text-emerald-700 block uppercase">Điểm Cộng</span>
                  <span className="text-xl font-black text-emerald-800">+{totalPlus}</span>
                </div>
                <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-200 text-center">
                  <span className="text-[11px] font-bold text-rose-700 block uppercase">Điểm Trừ</span>
                  <span className="text-xl font-black text-rose-800">-{totalMinus}</span>
                </div>
                <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-200 text-center">
                  <span className="text-[11px] font-bold text-blue-700 block uppercase">Thưởng KTTX</span>
                  <span className="text-xl font-black text-blue-800">+{totalKttxBonus} đ</span>
                </div>
              </div>

              {/* BẢNG DANH SÁCH CHI TIẾT */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px]">
                    <tr>
                      <th className="p-2.5 text-center w-12">Hạng</th>
                      <th className="p-2.5">Học Sinh</th>
                      <th className="p-2.5 text-center">Tổ</th>
                      <th className="p-2.5 text-center text-emerald-700">Cộng</th>
                      <th className="p-2.5 text-center text-rose-700">Trừ</th>
                      <th className="p-2.5 text-center font-black">Điểm Ròng</th>
                      <th className="p-2.5 text-center text-blue-700 font-black">Thưởng KTTX</th>
                      <th className="p-2.5 text-center text-amber-600">Sao Quà</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedStudents.map((st, idx) => {
                      const net = (st.plus_points || 0) - (st.minus_points || 0);
                      const isTop3 = idx < 3;
                      return (
                        <tr
                          key={st.id}
                          className={`hover:bg-slate-50/80 transition ${
                            isTop3 ? 'bg-amber-50/30 font-semibold' : ''
                          }`}
                        >
                          <td className="p-2.5 text-center font-black">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900 flex items-center space-x-2">
                            <span>{st.full_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({st.code})</span>
                          </td>
                          <td className="p-2.5 text-center text-slate-600 font-bold">Tổ {st.team_group || 1}</td>
                          <td className="p-2.5 text-center font-black text-emerald-600">+{st.plus_points || 0}</td>
                          <td className="p-2.5 text-center font-black text-rose-600">-{st.minus_points || 0}</td>
                          <td className="p-2.5 text-center font-black text-slate-900">
                            {net > 0 ? `+${net}` : net}
                          </td>
                          <td className="p-2.5 text-center font-black text-blue-700">
                            {st.kttx_bonus > 0 ? `+${st.kttx_bonus} đ` : '—'}
                          </td>
                          <td className="p-2.5 text-center font-bold text-amber-700">
                            {st.coins || st.plus_points || 0} ⭐
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* CHẾ ĐỘ 2: PHIẾU BÁO TỪNG HỌC SINH */}
          {/* ================================================================= */}
          {viewMode === 'individual' && selectedStudent && (
            <div className="space-y-4">
              {/* CHỌN HỌC SINH (ẨN KHI IN) */}
              <div className="flex items-center space-x-2 print:hidden">
                <span className="text-xs font-black text-slate-700 whitespace-nowrap">Chọn học sinh:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    playClick();
                    setSelectedStudentId(e.target.value);
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.code}) - Tổ {st.team_group}
                    </option>
                  ))}
                </select>
              </div>

              {/* CARD PHIẾU BÁO CÁ NHÂN */}
              <div className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 p-5 sm:p-6 rounded-[2rem] border border-indigo-100 shadow-sm space-y-4 print:border-slate-300 print:rounded-none">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedStudent.avatar}
                      alt={selectedStudent.full_name}
                      className="w-12 h-12 rounded-2xl bg-white border border-indigo-200 p-1 shadow-xs"
                    />
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-slate-900">
                        {selectedStudent.full_name}
                      </h4>
                      <p className="text-xs text-slate-500 font-bold">
                        Mã: {selectedStudent.code} • Lớp: {classInfo?.name || ''} • Tổ {selectedStudent.team_group || 1}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                      🏆 Xếp hạng: #{studentRank} / {students.length}
                    </span>
                  </div>
                </div>

                {/* 4 CHỈ SỐ KẾT QUẢ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Điểm Cộng</span>
                    <span className="text-lg font-black text-emerald-600">+{selectedStudent.plus_points || 0}</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-2xs">
                    <span className="text-[10px] font-bold text-rose-700 uppercase block">Điểm Trừ</span>
                    <span className="text-lg font-black text-rose-600">-{selectedStudent.minus_points || 0}</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-2xs">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">Thưởng KTTX</span>
                    <span className="text-lg font-black text-blue-700">
                      +{selectedStudent.kttx_bonus || 0} đ
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-2xs">
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">Sao Quà</span>
                    <span className="text-lg font-black text-amber-600">
                      {selectedStudent.coins || selectedStudent.plus_points || 0} ⭐
                    </span>
                  </div>
                </div>

                {/* Ô NHẬP LỜI NHẬN XÉT CỦA GIÁO VIÊN */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-black text-slate-700 block">
                    Lời nhận xét & đánh giá của Giáo viên:
                  </label>
                  <textarea
                    value={teacherNote}
                    onChange={(e) => setTeacherNote(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 shadow-2xs"
                    placeholder="Nhập lời khen, động viên hoặc nhắc nhở học sinh..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* CHỮ KÝ VÀ NGÀY THÁNG (HIỂN THỊ KHI IN) */}
          <div className="hidden print:grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-300 text-center text-xs">
            <div>
              <span className="font-bold text-slate-800 block">XÁC NHẬN CỦA PHỤ HUYNH</span>
              <span className="text-[10px] text-slate-500 italic block mt-0.5">(Ký và ghi rõ họ tên)</span>
              <div className="h-16" />
            </div>
            <div>
              <span className="font-bold text-slate-800 block">GIÁO VIÊN BỘ MÔN / CHỦ NHIỆM</span>
              <span className="text-[10px] text-slate-500 italic block mt-0.5">(Ký và ghi rõ họ tên)</span>
              <div className="h-16" />
              <span className="font-bold text-slate-900">Nguyễn Văn Hải</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
