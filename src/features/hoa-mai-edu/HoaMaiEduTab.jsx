import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Sparkles, QrCode, TrendingUp, Users, Calendar, 
  UserCheck, FileText, Settings, Smartphone, Plus, RefreshCw, Award 
} from 'lucide-react';
import { loadHoaMaiState, saveHoaMaiState } from './hoaMaiStorage';
import AttendanceGridTab from './components/AttendanceGridTab';
import AssignmentsAndExamsSync from './components/AssignmentsAndExamsSync';
import InvoicesFinanceTab from './components/InvoicesFinanceTab';
import DashboardOverviewTab from './components/DashboardOverviewTab';
import StudentsManagerTab from './components/StudentsManagerTab';
import ClassScheduleTab from './components/ClassScheduleTab';
import TeachersTab from './components/TeachersTab';
import LeaveRequestsTab from './components/LeaveRequestsTab';
import InvoicePrintModal from './components/InvoicePrintModal';
import StudentPortalModal from './components/StudentPortalModal';
import CenterSettingsModal from './components/CenterSettingsModal';

export default function HoaMaiEduTab({ allExams = [], allSubmissions = [] }) {
  // Nạp toàn bộ State của Hoa Mai Education Suite từ LocalStorage
  const [eduState, setEduState] = useState(() => loadHoaMaiState());

  // Sub-Tab nội bộ đang chọn
  const [currentSubTab, setCurrentSubTab] = useState('grid'); // 'grid' | 'sync' | 'invoices' | 'overview' | 'students' | 'schedule' | 'teachers' | 'leaves'

  // Bảng theo dõi điểm danh đang chọn
  const [activeSheetId, setActiveSheetId] = useState(eduState.trackingSheets[0]?.id || '');

  // Modals toàn cục
  const [printingInvoice, setPrintingInvoice] = useState(null);
  const [isStudentPortalOpen, setIsStudentPortalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Tự động lưu khi State thay đổi
  const updateEduState = (nextState) => {
    setEduState(nextState);
    saveHoaMaiState(nextState);
  };

  const currentSheet = eduState.trackingSheets.find((s) => s.id === activeSheetId) || eduState.trackingSheets[0];

  // 1. Cập nhật Bảng theo dõi điểm danh
  const handleUpdateSheet = (updatedSheet) => {
    const nextSheets = eduState.trackingSheets.map((s) =>
      s.id === updatedSheet.id ? updatedSheet : s
    );
    updateEduState({
      ...eduState,
      trackingSheets: nextSheets
    });
  };

  // 2. Tạo Bảng theo dõi mới
  const handleCreateSheet = (newSheet) => {
    const nextSheets = [...eduState.trackingSheets, newSheet];
    updateEduState({
      ...eduState,
      trackingSheets: nextSheets
    });
    setActiveSheetId(newSheet.id);
  };

  // 3. Cập nhật hóa đơn
  const handleUpdateInvoice = (invoiceId, fieldsToUpdate) => {
    const nextInvoices = eduState.invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, ...fieldsToUpdate } : inv
    );
    updateEduState({
      ...eduState,
      invoices: nextInvoices
    });
  };

  // 4. Đồng bộ từ Bảng điểm danh sang Hóa đơn VietQR
  const handleSyncToInvoices = (sheetToSync) => {
    const targetSheet = sheetToSync || currentSheet;
    if (!targetSheet) return;

    const newInvoices = [...eduState.invoices];
    let createdCount = 0;
    let updatedCount = 0;

    targetSheet.students.forEach((st, idx) => {
      // Đếm số buổi có mặt
      const attendedCount = targetSheet.sessions.filter((s) => st.attendance?.[s.id] === true).length;
      const unitPrice = targetSheet.pricePerSession || 31250;
      const subTotal = attendedCount * unitPrice;
      const materialsFee = 25000;
      const total = subTotal + materialsFee;

      // Tìm hóa đơn đã có cho kỳ học này
      const invoiceId = `HD-2609-${String(idx + 1).padStart(3, '0')}`;
      const existingIdx = newInvoices.findIndex(
        (inv) => inv.studentName === st.name && inv.className === targetSheet.className
      );

      const invoiceData = {
        id: invoiceId,
        studentId: st.id,
        studentName: st.name,
        className: targetSheet.className,
        month: targetSheet.month,
        sessionsAttended: attendedCount,
        pricePerSession: unitPrice,
        deduction: 0,
        materialsFee,
        totalAmount: total,
        status: st.isPaid ? 'paid_transfer' : 'unpaid',
        paidAt: st.isPaid ? new Date().toLocaleDateString('vi-VN') : null,
        phone: st.phone || '0988.xxx.xxx'
      };

      if (existingIdx >= 0) {
        newInvoices[existingIdx] = { ...newInvoices[existingIdx], ...invoiceData };
        updatedCount++;
      } else {
        newInvoices.push(invoiceData);
        createdCount++;
      }
    });

    updateEduState({
      ...eduState,
      invoices: newInvoices
    });

    alert(`Đã đồng bộ thành công sang Hóa đơn & VietQR!\n- Tạo mới: ${createdCount} hóa đơn\n- Cập nhật: ${updatedCount} hóa đơn\nThầy có thể bấm sang tab "3. Thu Học Phí & VietQR" để xem mã QR của từng em.`);
  };

  // 5. Cập nhật Đơn xin nghỉ phép
  const handleUpdateLeaveRequest = (reqId, fields) => {
    const nextRequests = eduState.leaveRequests.map((r) =>
      r.id === reqId ? { ...r, ...fields } : r
    );
    updateEduState({
      ...eduState,
      leaveRequests: nextRequests
    });
  };

  // 6. Tạo Đơn xin nghỉ phép mới (từ cổng phụ huynh)
  const handleCreateLeaveRequest = (newReq) => {
    updateEduState({
      ...eduState,
      leaveRequests: [newReq, ...eduState.leaveRequests]
    });
  };

  // 7. Lưu cấu hình trung tâm
  const handleSaveCenterConfig = (newConfig) => {
    updateEduState({
      ...eduState,
      centerConfig: newConfig
    });
  };

  // Menu các Tab con bên trong Hoa Mai Edu
  const subTabs = [
    { id: 'grid', label: '1. Bảng Điểm Danh (Excel Matrix)', icon: '📊', badge: `${currentSheet?.students?.length || 21} HS` },
    { id: 'sync', label: '2. Tiến Độ Bài Tập & Đề Thi', icon: '📝', badge: 'LMS Sync' },
    { id: 'invoices', label: '3. Thu Học Phí & VietQR', icon: '💳', badge: `${eduState.invoices?.length || 3} HD` },
    { id: 'overview', label: '4. Tổng Quan Điều Hành', icon: '📈' },
    { id: 'students', label: '5. Quản Lý Học Sinh', icon: '👥' },
    { id: 'schedule', label: '6. Thời Khóa Biểu', icon: '📅' },
    { id: 'teachers', label: '7. Giáo Viên & Thù Lao', icon: '👨‍🏫' },
    { id: 'leaves', label: '8. Đơn Xin Nghỉ Phép', icon: '📄', badge: `${eduState.leaveRequests?.filter(r => r.status === 'pending').length || 0} mới` }
  ];

  return (
    <div className="space-y-5 animate-fade-in pb-12 font-sans">
      {/* 1. BANNER TIÊU ĐỀ HOA MAI EDUCATION SUITE (V2 PRO) */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow-xs">
                🌸 HOA MAI EDUCATION SUITE (V2 PRO)
              </span>
              <span className="text-xs font-bold text-emerald-200">
                Quản Trị Trung Tâm, Lớp Dạy Thêm & Bảng Tính Điểm Danh Thông Minh
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {eduState.centerConfig?.centerName || 'TRUNG TÂM BỒI DƯỠNG VĂN HÓA HOA MAI'}
            </h2>
            <p className="text-xs text-emerald-100 font-medium">
              {eduState.centerConfig?.slogan || 'Hoa Mai Education - Chắp cánh tương lai, Vươn tầm tri thức'} • Hotline: <b className="text-amber-300">{eduState.centerConfig?.hotline}</b>
            </p>
          </div>

          {/* CÁC NÚT TÁC VỤ NHANH TRÊN HEADER */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsStudentPortalOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              title="Mở cổng tra cứu kết quả và quét mã VietQR cho học sinh / phụ huynh"
            >
              <Smartphone className="w-4 h-4 text-slate-950" />
              <span>📱 Cổng Phụ Huynh / Học Sinh</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-xs transition flex items-center space-x-1.5 cursor-pointer"
              title="Cài đặt ngân hàng nhận học phí VietQR và sao lưu dữ liệu"
            >
              <Settings className="w-4 h-4 text-emerald-300" />
              <span>Cài Đặt & Ngân Hàng</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-TABS NỘI BỘ CỦA HOA MAI EDU */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex overflow-x-auto no-scrollbar gap-1.5">
        {subTabs.map((tab) => {
          const isActive = currentSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentSubTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition flex items-center space-x-1.5 shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. NỘI DUNG TỪNG SUB-TAB */}
      <div>
        {/* SUB-TAB 1: BẢNG ĐIỂM DANH LƯỚI MA TRẬN EXCEL */}
        {currentSubTab === 'grid' && (
          <AttendanceGridTab
            trackingSheets={eduState.trackingSheets}
            activeSheetId={activeSheetId}
            onSelectSheet={(id) => setActiveSheetId(id)}
            onUpdateSheet={handleUpdateSheet}
            onCreateSheet={handleCreateSheet}
            onSyncToInvoices={handleSyncToInvoices}
          />
        )}

        {/* SUB-TAB 2: TIẾN ĐỘ BÀI TẬP & ĐỀ THI LMS */}
        {currentSubTab === 'sync' && (
          <AssignmentsAndExamsSync
            currentSheet={currentSheet}
            allExams={allExams}
            allSubmissions={allSubmissions}
          />
        )}

        {/* SUB-TAB 3: THU HỌC PHÍ & VIETQR NAPAS */}
        {currentSubTab === 'invoices' && (
          <InvoicesFinanceTab
            invoices={eduState.invoices}
            centerConfig={eduState.centerConfig}
            onUpdateInvoice={handleUpdateInvoice}
            onOpenPrintModal={(inv) => setPrintingInvoice(inv)}
          />
        )}

        {/* SUB-TAB 4: TỔNG QUAN ĐIỀU HÀNH */}
        {currentSubTab === 'overview' && (
          <DashboardOverviewTab
            trackingSheets={eduState.trackingSheets}
            invoices={eduState.invoices}
            classes={eduState.classes}
            teachers={eduState.teachers}
            onNavigateTab={(tabKey) => setCurrentSubTab(tabKey)}
          />
        )}

        {/* SUB-TAB 5: QUẢN LÝ HỌC SINH & NHẬP HÀNG LOẠT */}
        {currentSubTab === 'students' && (
          <StudentsManagerTab
            trackingSheets={eduState.trackingSheets}
            onUpdateSheet={handleUpdateSheet}
          />
        )}

        {/* SUB-TAB 6: THỜI KHÓA BIỂU & TRÙNG LỊCH */}
        {currentSubTab === 'schedule' && (
          <ClassScheduleTab classes={eduState.classes} />
        )}

        {/* SUB-TAB 7: GIÁO VIÊN & THÙ LAO */}
        {currentSubTab === 'teachers' && (
          <TeachersTab teachers={eduState.teachers} />
        )}

        {/* SUB-TAB 8: ĐƠN XIN NGHỈ PHÉP */}
        {currentSubTab === 'leaves' && (
          <LeaveRequestsTab
            leaveRequests={eduState.leaveRequests}
            onUpdateLeaveRequest={handleUpdateLeaveRequest}
          />
        )}
      </div>

      {/* MODAL 1: IN PHIẾU THU HỌC PHÍ A4/A5 */}
      {printingInvoice && (
        <InvoicePrintModal
          invoice={printingInvoice}
          centerConfig={eduState.centerConfig}
          onClose={() => setPrintingInvoice(null)}
        />
      )}

      {/* MODAL 2: CỔNG TRA CỨU CHO HỌC SINH / PHỤ HUYNH */}
      {isStudentPortalOpen && (
        <StudentPortalModal
          isOpen={isStudentPortalOpen}
          onClose={() => setIsStudentPortalOpen(false)}
          trackingSheets={eduState.trackingSheets}
          invoices={eduState.invoices}
          centerConfig={eduState.centerConfig}
          onCreateLeaveRequest={handleCreateLeaveRequest}
        />
      )}

      {/* MODAL 3: CÀI ĐẶT TRUNG TÂM & NGÂN HÀNG VIETQR */}
      {isSettingsOpen && (
        <CenterSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          centerConfig={eduState.centerConfig}
          onSaveConfig={handleSaveCenterConfig}
          onReloadState={() => setEduState(loadHoaMaiState())}
        />
      )}
    </div>
  );
}
