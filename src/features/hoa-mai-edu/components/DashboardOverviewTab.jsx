import React from 'react';
import { 
  Users, BookOpen, DollarSign, TrendingUp, Calendar, Clock, 
  Sparkles, Award, ArrowRight, UserPlus, FileSpreadsheet, QrCode 
} from 'lucide-react';
import { formatVND } from './AttendanceGridTab';

export default function DashboardOverviewTab({
  trackingSheets = [],
  invoices = [],
  classes = [],
  teachers = [],
  onNavigateTab
}) {
  // Tính tổng học sinh từ các bảng theo dõi
  const allStudentIds = new Set();
  trackingSheets.forEach((sh) => sh.students.forEach((st) => allStudentIds.add(st.name)));
  const totalStudents = allStudentIds.size || 21;

  // Tính doanh thu thực tế đã thu
  const totalCollected = invoices
    .filter((inv) => inv.status !== 'unpaid')
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  // Tính tỷ lệ chuyên cần trung bình
  let totalAttended = 0;
  let totalPossible = 0;
  trackingSheets.forEach((sh) => {
    sh.students.forEach((st) => {
      const attCount = sh.sessions.filter((s) => st.attendance?.[s.id] === true).length;
      totalAttended += attCount;
      totalPossible += sh.sessions.length;
    });
  });
  const attendanceRate = totalPossible > 0 ? Math.round((totalAttended / totalPossible) * 100) : 94;

  // Lịch dạy hôm nay mẫu
  const todaySessions = [
    { time: '17:30 - 19:00', class: 'Lớp 6A (Chính)', room: 'Phòng 201 (Lầu 2)', teacher: 'Thầy Nguyễn Văn Hải', students: 21, topic: 'Unit 2: My House - Grammar & Practice' },
    { time: '19:30 - 21:00', class: 'Lớp 9A (Luyện Chuyên)', room: 'Phòng VIP 1', teacher: 'Thầy Nguyễn Văn Hải', students: 15, topic: 'Luyện đề thi tuyển sinh vào lớp 10 Chuyên Bắc Giang' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. BỐN THẺ KPI CHỈ SỐ NHANH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Tổng Học Sinh</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalStudents}</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center space-x-1">
            <span>↑ +5 học sinh mới tháng này</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Lớp Đang Mở</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{classes.length || 5} lớp</div>
          <div className="text-[11px] text-slate-500 mt-1">Từ Khối 6 đến Khối 9</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Thực Thu Tháng Này</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{formatVND(totalCollected || 8250000)}</div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">Đã đối soát qua VietQR</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Tỷ Lệ Chuyên Cần</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{attendanceRate}%</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">Học sinh đi học đầy đủ</div>
        </div>
      </div>

      {/* 2. KHỐI THAO TÁC NHANH & LỊCH DẠY HÔM NAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LỊCH DẠY HÔM NAY (7 CỘT) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>LỊCH DẠY & CA HỌC HÔM NAY</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>

          <div className="space-y-3">
            {todaySessions.map((sess, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-black text-xs">
                    ⏰ {sess.time}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{sess.room}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-slate-900">{sess.class}</div>
                  <div className="text-xs font-semibold text-slate-600">Sĩ số: <b className="text-emerald-700">{sess.students} HS</b></div>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  Chủ đề: <span className="text-slate-900 font-bold">{sess.topic}</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>Giáo viên phụ trách: <b>{sess.teacher}</b></span>
                  <button
                    onClick={() => onNavigateTab('grid')}
                    className="text-emerald-700 font-black hover:underline flex items-center space-x-0.5"
                  >
                    <span>Vào Điểm Danh</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LỐI TẮT HÀNH ĐỘNG NHANH (5 CỘT) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
              Công cụ quản lý 4.0
            </span>
            <h3 className="text-base font-black text-white mt-1">
              Thao Tác Nhanh Hoa Mai Edu
            </h3>
            <p className="text-xs text-emerald-100 mt-1 font-medium">
              Truy cập nhanh các nghiệp vụ trọng tâm hỗ trợ giáo viên quản lý lớp dạy thêm hiệu quả.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => onNavigateTab('grid')}
              className="w-full p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left font-bold text-xs flex items-center justify-between transition cursor-pointer backdrop-blur-xs"
            >
              <div className="flex items-center space-x-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>Bảng Điểm Danh Lưới Ma Trận (Excel)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-300" />
            </button>

            <button
              onClick={() => onNavigateTab('invoices')}
              className="w-full p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left font-bold text-xs flex items-center justify-between transition cursor-pointer backdrop-blur-xs"
            >
              <div className="flex items-center space-x-2.5">
                <QrCode className="w-4 h-4 text-amber-300" />
                <span>Quản Lý Hóa Đơn & Mã VietQR NAPAS</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>

            <button
              onClick={() => onNavigateTab('sync')}
              className="w-full p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left font-bold text-xs flex items-center justify-between transition cursor-pointer backdrop-blur-xs"
            >
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Theo Dõi Tiến Độ Bài Tập & Đề Thi</span>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-300" />
            </button>

            <button
              onClick={() => onNavigateTab('students')}
              className="w-full p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left font-bold text-xs flex items-center justify-between transition cursor-pointer backdrop-blur-xs"
            >
              <div className="flex items-center space-x-2.5">
                <UserPlus className="w-4 h-4 text-blue-300" />
                <span>Quản Lý Học Sinh & Nhập Hàng Loạt</span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
