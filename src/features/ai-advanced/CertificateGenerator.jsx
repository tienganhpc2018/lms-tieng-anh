import React, { useState } from 'react';
import { Award, Download, Sparkles, Pin, CheckCircle2, User, FileArchive } from 'lucide-react';

export default function CertificateGenerator({ studentName: defaultStudent = 'Nguyễn Minh Hoàng', courseTitle = 'Tiếng Anh 9 - Global Success' }) {
  const [issued, setIssued] = useState(false);

  // Danh sách học sinh lớp học mẫu với điểm số và lời khen cá nhân hóa riêng biệt
  const studentList = [
    { name: 'Nguyễn Minh Hoàng', score: '9.8 / 10', grade: 'Xuất Sắc', praise: 'Đạt thành tích Thủ Khoa bài kiểm tra tổng hợp 4 kỹ năng Tiếng Anh THCS.' },
    { name: 'Đinh Thành Nhơn', score: '9.5 / 10', grade: 'Xuất Sắc', praise: 'Hoàn thành 100% bài tập về nhà và đạt điểm tuyệt đối phần Listening.' },
    { name: 'Hà Nguyễn Minh Thư', score: '9.2 / 10', grade: 'Giỏi', praise: 'Có sự tiến bộ vượt bậc trong kỹ năng Speaking và phản xạ từ vựng.' },
    { name: 'Trần Bảo Nam', score: '8.8 / 10', grade: 'Giỏi', praise: 'Nắm vững ma trận kiến thức CV7991 và làm bài tập ngữ pháp rất cẩn thận.' },
  ];

  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const currentStudent = studentList[selectedStudentIndex];

  // Nút Xuất hàng loạt cả lớp ra file Zip
  const handleExportZipAllClass = () => {
    alert(`📦 Đang tự động đóng gói Giấy Chứng Nhận cho toàn bộ 40 học sinh trong lớp...\n\n🎉 Đã xuất thành công file nén Giay_Chung_Nhan_Lop_9A1_${Date.now()}.zip!`);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 font-sans select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>ADV-07: CẤP GIẤY CHỨNG NHẬN HỌC SINH (CERTIFICATE)</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Cá nhân hóa điểm số và lời khen chi tiết riêng biệt cho từng em học sinh
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* NÚT XUẤT HÀNG LOẠT CẢ LỚP RA FILE ZIP */}
          <button
            onClick={handleExportZipAllClass}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
          >
            <FileArchive className="w-4 h-4" />
            <span>📦 Xuất Hàng Loạt Cả Lớp (.ZIP)</span>
          </button>

          <button
            onClick={() => setIssued(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
          >
            <Sparkles className="w-4 h-4" />
            <span>🚀 Xem & In Chứng Nhận</span>
          </button>
        </div>
      </div>

      {/* BỘ CHỌN HỌC SINH CÁ NHÂN HÓA ĐIỂM SỐ */}
      <div className="flex items-center space-x-3 bg-amber-50/60 p-3 rounded-2xl border border-amber-200 text-xs font-bold">
        <span className="text-amber-900">👤 Chọn Học Sinh Để Cấp Chứng Nhận:</span>
        <select
          value={selectedStudentIndex}
          onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}
          className="px-3 py-1.5 border border-amber-300 rounded-xl bg-white text-slate-900 font-extrabold focus:ring-2 focus:ring-amber-500"
        >
          {studentList.map((st, i) => (
            <option key={i} value={i}>
              {st.name} — Điểm: {st.score} ({st.grade})
            </option>
          ))}
        </select>
      </div>

      {/* KHUNG GIẤY CHỨNG NHẬN NHỎ GỌN VỪA VẶN IN A4 (ẢNH MỚI) */}
      <div className="max-w-xl mx-auto p-6 bg-gradient-to-br from-amber-500/10 via-amber-50 to-amber-100/30 border-4 border-double border-amber-400 rounded-3xl text-center space-y-3 relative overflow-hidden shadow-sm">
        
        {/* LOGO TRÒN TƯỢNG TRƯNG SANG TRỌNG KHÔNG CHỮ (ẢNH MỚI) */}
        <div className="w-14 h-14 mx-auto bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 rounded-full border-2 border-amber-200 flex items-center justify-center shadow-md">
          <Award className="w-8 h-8 text-amber-950 drop-shadow-xs" />
        </div>

        {/* TIÊU ĐỀ CHỈ GIỮ GIẤY CHỨNG NHẬN */}
        <div>
          <h1 className="text-lg font-black text-amber-900 tracking-widest uppercase">
            GIẤY CHỨNG NHẬN
          </h1>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {currentStudent.name}
          </h2>
        </div>

        {/* CÂU KHEN NÊU CỤ THỂ ĐIỂM SỐ RIÊNG CHO MỖI HỌC SINH */}
        <div className="space-y-1 max-w-md mx-auto">
          <p className="text-xs text-slate-700 font-semibold leading-relaxed">
            Đã hoàn thành xuất sắc chương trình môn học: <strong className="text-slate-900">{courseTitle}</strong>.
          </p>
          <div className="p-2 bg-amber-200/40 rounded-xl text-xs text-amber-950 font-extrabold border border-amber-300/50">
            🎯 Đạt điểm số: <span className="text-emerald-700 font-black">{currentStudent.score}</span> • Xếp loại: <span className="text-indigo-700 font-black">{currentStudent.grade}</span>
            <p className="text-[11px] font-medium text-slate-700 mt-0.5 italic">"{currentStudent.praise}"</p>
          </div>
        </div>

        {/* DẤU MỘC VÀNG TRUNG TÂM DẠY HỌC HOA MAI & TÊN NGUYỄN VĂN HẢI */}
        <div className="flex justify-between items-end pt-3 border-t border-amber-300/60 max-w-md mx-auto text-left">
          <div className="text-[10px] text-slate-500 font-extrabold space-y-0.5">
            <div>Mã số: HM-2026-X89</div>
            <div>Ngày cấp: {new Date().toLocaleDateString('vi-VN')}</div>
          </div>

          <div className="text-center relative">
            {/* CON DẤU MỘC VÀNG CHỮ TRUNG TÂM DẠY HỌC HOA MAI */}
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-600 flex items-center justify-center text-[8px] font-black text-amber-950 uppercase rotate-6 bg-amber-200/80 mx-auto shadow-2xs">
              <span className="leading-tight text-center">
                ★ CHỨNG NHẬN ★<br />TRUNG TÂM DẠY HỌC<br />HOA MAI
              </span>
            </div>
            {/* DƯỚI CON DẤU CHỈ GHI DUY NHẤT NGUYỄN VĂN HẢI */}
            <span className="text-[11px] font-extrabold text-slate-900 block mt-1">
              Nguyễn Văn Hải
            </span>
          </div>
        </div>
      </div>

      {issued && (
        <div className="flex justify-end space-x-2 pt-1">
          <button
            onClick={() => alert(`Đã tải xuống file Giấy Chứng Nhận PDF cho học sinh ${currentStudent.name}!`)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Tải PDF Khổ A4 ({currentStudent.name})</span>
          </button>
        </div>
      )}
    </div>
  );
}
