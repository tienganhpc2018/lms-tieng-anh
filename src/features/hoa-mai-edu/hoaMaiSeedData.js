// Dữ liệu mẫu khởi tạo cho HOA MAI EDUCATION SUITE (V2 PRO)
// Bám sát yêu cầu nghiệp vụ thực tế của Thầy Hải và Master Prompt

export const DEFAULT_CENTER_CONFIG = {
  centerName: 'TRUNG TÂM BỒI DƯỠNG VĂN HÓA HOA MAI',
  slogan: 'Hoa Mai Education - Chắp cánh tương lai, Vươn tầm tri thức',
  hotline: '0988.123.456',
  address: 'Số 86 Đường Lê Lợi, TP. Bắc Giang',
  defaultPricePerSession: 31250, // 31.250đ / buổi theo đúng thực tế của Thầy
  bankInfo: {
    bankId: 'MB', // MBBank, VCB, TCB, BIDV, ICB, VPB...
    bankName: 'MBBank (Ngân hàng TMCP Quân đội)',
    accountNo: '0988123456',
    accountName: 'NGUYEN VAN HAI',
    template: 'compact2'
  }
};

// 21 học sinh thực tế lớp 6A theo đúng Master Prompt
export const INITIAL_STUDENTS_6A = [
  { id: 'hs-6a-01', name: 'Diệu Linh', phone: '0912345601', parentName: 'Phụ huynh Diệu Linh', school: 'THCS Lê Quý Đôn', tagColor: 'default' },
  { id: 'hs-6a-02', name: 'Em Thoại', phone: '0912345602', parentName: 'Phụ huynh Thoại', school: 'THCS Lê Quý Đôn', tagColor: 'default' },
  { id: 'hs-6a-03', name: 'Trúc Lâm', phone: '0912345603', parentName: 'Phụ huynh Trúc Lâm', school: 'THCS Ngô Sĩ Liên', tagColor: 'default' },
  { id: 'hs-6a-04', name: 'Ngọc Diệp', phone: '0912345604', parentName: 'Phụ huynh Ngọc Diệp', school: 'THCS Lê Quý Đôn', tagColor: 'default' },
  { id: 'hs-6a-05', name: 'Mỹ Tình', phone: '0912345605', parentName: 'Phụ huynh Mỹ Tình', school: 'THCS Trần Phú', tagColor: 'default' },
  { id: 'hs-6a-06', name: 'Hồng Ánh', phone: '0912345606', parentName: 'Phụ huynh Hồng Ánh', school: 'THCS Lê Quý Đôn', tagColor: 'default' },
  { id: 'hs-6a-07', name: 'Đức - Thuận', phone: '0912345607', parentName: 'Phụ huynh Đức Thuận', school: 'THCS Ngô Sĩ Liên', tagColor: 'cyan' }, // Học ghép 2 anh em
  { id: 'hs-6a-08', name: 'Khắc Việt', phone: '0912345608', parentName: 'Phụ huynh Khắc Việt', school: 'THCS Lê Quý Đôn', tagColor: 'default' },
  { id: 'hs-6a-09', name: 'Bảo Trâm', phone: '0912345609', parentName: 'Phụ huynh Bảo Trâm', school: 'THCS Dĩnh Kế', tagColor: 'default' },
  { id: 'hs-6a-10', name: 'Trung Hiếu', phone: '0912345610', parentName: 'Phụ huynh Trung Hiếu', school: 'THCS Lê Quý Đôn', tagColor: 'default' },
  { id: 'hs-6a-11', name: 'Lan Anh', phone: '0912345611', parentName: 'Phụ huynh Lan Anh', school: 'THCS Tân Mỹ', tagColor: 'default' },
  { id: 'hs-6a-12', name: 'Quỳnh Như', phone: '0912345612', parentName: 'Phụ huynh Quỳnh Như', school: 'THCS Lê Quý Đôn', tagColor: 'default' },
  { id: 'hs-6a-13', name: 'Nhã Trang', phone: '0912345613', parentName: 'Phụ huynh Nhã Trang', school: 'THCS Trần Phú', tagColor: 'default' },
  { id: 'hs-6a-14', name: 'Khởi Nguyệt', phone: '0912345614', parentName: 'Phụ huynh Khởi Nguyệt', school: 'THCS Lê Quý Đôn', tagColor: 'default' },
  { id: 'hs-6a-15', name: 'Tuyết Thủy', phone: '0912345615', parentName: 'Phụ huynh Tuyết Thủy', school: 'THCS Ngô Sĩ Liên', tagColor: 'default' },
  { id: 'hs-6a-16', name: 'Thanh Duyên', phone: '0912345616', parentName: 'Phụ huynh Thanh Duyên', school: 'THCS Lê Quý Đôn', tagColor: 'default' },
  { id: 'hs-6a-17', name: 'Việt Trung', phone: '0912345617', parentName: 'Phụ huynh Việt Trung', school: 'THCS Tân Mỹ', tagColor: 'default' },
  { id: 'hs-6a-18', name: 'Ngọc Duyên', phone: '0912345618', parentName: 'Phụ huynh Ngọc Duyên', school: 'THCS Lê Quý Đôn', tagColor: 'default' },
  { id: 'hs-6a-19', name: 'Em Hội 9A', phone: '0912345619', parentName: 'Phụ huynh Hội', school: 'THCS Lê Quý Đôn', tagColor: 'purple' }, // HS lớp 9 gửi bổ trợ
  { id: 'hs-6a-20', name: 'Cháu Thịnh', phone: '0912345620', parentName: 'Cô Thịnh', school: 'THCS Lê Quý Đôn', tagColor: 'green' }, // Người quen ưu đãi
  { id: 'hs-6a-21', name: 'Đạt', phone: '0912345621', parentName: 'Phụ huynh Đạt', school: 'THCS Song Mai', tagColor: 'yellow' } // Cần lưu ý chuyên cần
];

// 12 buổi học thực tế của Lớp 6A
export const INITIAL_SESSIONS_6A = [
  { id: 's1', label: 'Buổi 1', date: '13/09' },
  { id: 's2', label: 'Buổi 2', date: '14/09' },
  { id: 's3', label: 'Buổi 3', date: '20/09' },
  { id: 's4', label: 'Buổi 4', date: '21/09' },
  { id: 's5', label: 'Buổi 5', date: '27/09' },
  { id: 's6', label: 'Buổi 6', date: '28/09' },
  { id: 's7', label: 'Buổi 7', date: '04/10' },
  { id: 's8', label: 'Buổi 8', date: '05/10' },
  { id: 's9', label: 'Buổi 9', date: '11/10' },
  { id: 's10', label: 'Buổi 10', date: '12/10' },
  { id: 's11', label: 'Buổi 11', date: '18/10' },
  { id: 's12', label: 'Buổi 12', date: '19/10' }
];

// Danh sách các Bảng theo dõi ma trận (Tracking Sheets)
export const INITIAL_TRACKING_SHEETS = [
  {
    id: 'sheet-6a-chinh',
    classId: 'lop-6a',
    className: 'Lớp 6A (Chính)',
    month: 'Tháng 9 & 10/2026',
    pricePerSession: 31250,
    sessions: INITIAL_SESSIONS_6A,
    students: INITIAL_STUDENTS_6A.map((st, idx) => {
      // Giả lập điểm danh: phần lớn có mặt 11-12 buổi
      const attendance = {};
      INITIAL_SESSIONS_6A.forEach((sess, sIdx) => {
        // Cho vài bạn vắng 1-2 buổi để sinh động thực tế
        if (st.name === 'Đạt' && (sIdx === 2 || sIdx === 6)) {
          attendance[sess.id] = false;
        } else if (st.name === 'Em Hội 9A' && sIdx === 5) {
          attendance[sess.id] = false;
        } else if (idx === 8 && sIdx === 3) {
          attendance[sess.id] = false;
        } else {
          attendance[sess.id] = true;
        }
      });
      return {
        ...st,
        attendance,
        isPaid: idx < 12 // 12 em đầu đã nộp tiền
      };
    })
  },
  {
    id: 'sheet-6b-cuoituan',
    classId: 'lop-6b',
    className: 'Lớp 6B (Cuối tuần)',
    month: 'Tháng 9 & 10/2026',
    pricePerSession: 35000,
    sessions: [
      { id: 's1', label: 'Buổi 1', date: '14/09' },
      { id: 's2', label: 'Buổi 2', date: '15/09' },
      { id: 's3', label: 'Buổi 3', date: '21/09' },
      { id: 's4', label: 'Buổi 4', date: '22/09' },
      { id: 's5', label: 'Buổi 5', date: '28/09' },
      { id: 's6', label: 'Buổi 6', date: '29/09' },
      { id: 's7', label: 'Buổi 7', date: '05/10' },
      { id: 's8', label: 'Buổi 8', date: '06/10' }
    ],
    students: [
      { id: 'hs-6b-01', name: 'Nguyễn Minh Quân', phone: '0987111221', tagColor: 'default', attendance: { s1: true, s2: true, s3: true, s4: true, s5: true, s6: true, s7: true, s8: true }, isPaid: true },
      { id: 'hs-6b-02', name: 'Trần Thảo My', phone: '0987111222', tagColor: 'green', attendance: { s1: true, s2: true, s3: true, s4: false, s5: true, s6: true, s7: true, s8: true }, isPaid: true },
      { id: 'hs-6b-03', name: 'Lê Hoàng Long', phone: '0987111223', tagColor: 'default', attendance: { s1: true, s2: true, s3: true, s4: true, s5: true, s6: true, s7: true, s8: true }, isPaid: false },
      { id: 'hs-6b-04', name: 'Vũ Gia Bảo', phone: '0987111224', tagColor: 'yellow', attendance: { s1: false, s2: true, s3: true, s4: true, s5: false, s6: true, s7: true, s8: true }, isPaid: false }
    ]
  },
  {
    id: 'sheet-7a',
    classId: 'lop-7a',
    className: 'Lớp 7A (Ngữ pháp & Giao tiếp)',
    month: 'Tháng 10/2026',
    pricePerSession: 40000,
    sessions: [
      { id: 's1', label: 'Buổi 1', date: '02/10' },
      { id: 's2', label: 'Buổi 2', date: '06/10' },
      { id: 's3', label: 'Buổi 3', date: '09/10' },
      { id: 's4', label: 'Buổi 4', date: '13/10' },
      { id: 's5', label: 'Buổi 5', date: '16/10' },
      { id: 's6', label: 'Buổi 6', date: '20/10' }
    ],
    students: [
      { id: 'hs-7a-01', name: 'Phạm Đức Hải', phone: '0912000301', tagColor: 'default', attendance: { s1: true, s2: true, s3: true, s4: true, s5: true, s6: true }, isPaid: true },
      { id: 'hs-7a-02', name: 'Hoàng Yến Nhi', phone: '0912000302', tagColor: 'default', attendance: { s1: true, s2: true, s3: true, s4: true, s5: true, s6: true }, isPaid: false }
    ]
  },
  {
    id: 'sheet-8a',
    classId: 'lop-8a',
    className: 'Lớp 8A (Chuẩn GDPT 2018)',
    month: 'Tháng 10/2026',
    pricePerSession: 40000,
    sessions: [
      { id: 's1', label: 'Buổi 1', date: '01/10' },
      { id: 's2', label: 'Buổi 2', date: '04/10' },
      { id: 's3', label: 'Buổi 3', date: '08/10' },
      { id: 's4', label: 'Buổi 4', date: '11/10' }
    ],
    students: [
      { id: 'hs-8a-01', name: 'Đặng Tuấn Kiệt', phone: '0981999881', tagColor: 'default', attendance: { s1: true, s2: true, s3: true, s4: true }, isPaid: true },
      { id: 'hs-8a-02', name: 'Bùi Thị Hà', phone: '0981999882', tagColor: 'cyan', attendance: { s1: true, s2: true, s3: false, s4: true }, isPaid: false }
    ]
  },
  {
    id: 'sheet-9a-chuyen',
    classId: 'lop-9a',
    className: 'Lớp 9A (Luyện Thi Chuyên & Vào 10)',
    month: 'Tháng 10/2026',
    pricePerSession: 50000,
    sessions: [
      { id: 's1', label: 'Buổi 1', date: '03/10' },
      { id: 's2', label: 'Buổi 2', date: '07/10' },
      { id: 's3', label: 'Buổi 3', date: '10/10' },
      { id: 's4', label: 'Buổi 4', date: '14/10' }
    ],
    students: [
      { id: 'hs-9a-01', name: 'Nguyễn Văn Minh', phone: '0903888771', tagColor: 'default', attendance: { s1: true, s2: true, s3: true, s4: true }, isPaid: true },
      { id: 'hs-9a-02', name: 'Trần Mai Phương', phone: '0903888772', tagColor: 'green', attendance: { s1: true, s2: true, s3: true, s4: true }, isPaid: true }
    ]
  }
];

// Danh sách lớp học và thời khóa biểu
export const INITIAL_CLASSES = [
  { id: 'lop-6a', name: 'Lớp 6A (Chính)', grade: 6, subject: 'Tiếng Anh THCS', room: 'Phòng 201 (Lầu 2)', teacher: 'Thầy Nguyễn Văn Hải', schedule: 'Thứ 3, Thứ 5 (17h30 - 19h00)', maxStudents: 25, currentStudents: 21 },
  { id: 'lop-6b', name: 'Lớp 6B (Cuối tuần)', grade: 6, subject: 'Tiếng Anh THCS', room: 'Phòng 202 (Lầu 2)', teacher: 'Cô Trần Mai Lan', schedule: 'Thứ 7, Chủ Nhật (08h00 - 09h30)', maxStudents: 20, currentStudents: 16 },
  { id: 'lop-7a', name: 'Lớp 7A (Ngữ pháp & Giao tiếp)', grade: 7, subject: 'Tiếng Anh THCS', room: 'Phòng 201 (Lầu 2)', teacher: 'Thầy Nguyễn Văn Hải', schedule: 'Thứ 2, Thứ 6 (18h00 - 19h30)', maxStudents: 22, currentStudents: 18 },
  { id: 'lop-8a', name: 'Lớp 8A (Chuẩn GDPT 2018)', grade: 8, subject: 'Tiếng Anh THCS', room: 'Phòng 301 (Lầu 3)', teacher: 'Thầy Lê Minh Đức', schedule: 'Thứ 4, Thứ 7 (18h00 - 19h30)', maxStudents: 25, currentStudents: 20 },
  { id: 'lop-9a', name: 'Lớp 9A (Luyện Thi Chuyên & Vào 10)', grade: 9, subject: 'Tiếng Anh THCS', room: 'Phòng VIP 1', teacher: 'Thầy Nguyễn Văn Hải', schedule: 'Thứ 3, Chủ Nhật (19h30 - 21h00)', maxStudents: 18, currentStudents: 15 }
];

// Danh sách giáo viên
export const INITIAL_TEACHERS = [
  { id: 'gv-01', name: 'Thầy Nguyễn Văn Hải', phone: '0988.123.456', email: 'hai.nguyen@hoamaiedu.vn', subject: 'Tiếng Anh THCS & Luyện Chuyên', bankInfo: 'MBBank - 0988123456', sessionsThisMonth: 38, ratePerSession: 180000 },
  { id: 'gv-02', name: 'Cô Trần Mai Lan', phone: '0977.654.321', email: 'lan.tran@hoamaiedu.vn', subject: 'Tiếng Anh Giao Tiếp & Kỹ Năng Nghe', bankInfo: 'Vietcombank - 001100223344', sessionsThisMonth: 24, ratePerSession: 150000 },
  { id: 'gv-03', name: 'Thầy Lê Minh Đức', phone: '0933.888.999', email: 'duc.le@hoamaiedu.vn', subject: 'Ngữ Pháp Nâng Cao Khối 8-9', bankInfo: 'Techcombank - 190333222111', sessionsThisMonth: 16, ratePerSession: 160000 }
];

// Đơn xin nghỉ phép mẫu
export const INITIAL_LEAVE_REQUESTS = [
  { id: 'leave-01', studentName: 'Đạt', className: 'Lớp 6A (Chính)', date: '20/09/2026', sessionLabel: 'Buổi 3', reason: 'Em bị sốt xuất huyết phải nằm viện theo dõi', parentPhone: '0912345621', status: 'approved', deductFee: true, createdAt: '19/09/2026' },
  { id: 'leave-02', studentName: 'Em Hội 9A', className: 'Lớp 6A (Chính)', date: '28/09/2026', sessionLabel: 'Buổi 6', reason: 'Trùng lịch thi hùng biện tiếng Anh cấp trường', parentPhone: '0912345619', status: 'approved', deductFee: true, createdAt: '27/09/2026' },
  { id: 'leave-03', studentName: 'Bảo Trâm', className: 'Lớp 6A (Chính)', date: '21/09/2026', sessionLabel: 'Buổi 4', reason: 'Gia đình có việc hiếu ở quê', parentPhone: '0912345609', status: 'approved', deductFee: false, createdAt: '20/09/2026' }
];

// Hóa đơn khởi tạo sẵn sàng cho VietQR
export const INITIAL_INVOICES = [
  {
    id: 'HD-2609-001',
    studentId: 'hs-6a-01',
    studentName: 'Diệu Linh',
    className: 'Lớp 6A (Chính)',
    month: 'Tháng 9 & 10/2026',
    sessionsAttended: 12,
    pricePerSession: 31250,
    deduction: 0,
    materialsFee: 25000,
    totalAmount: 400000, // 12 * 31250 = 375000 + 25000 = 400.000đ
    status: 'paid_transfer', // Đã chuyển khoản VietQR
    paidAt: '25/09/2026',
    phone: '0912345601'
  },
  {
    id: 'HD-2609-002',
    studentId: 'hs-6a-02',
    studentName: 'Em Thoại',
    className: 'Lớp 6A (Chính)',
    month: 'Tháng 9 & 10/2026',
    sessionsAttended: 12,
    pricePerSession: 31250,
    deduction: 0,
    materialsFee: 25000,
    totalAmount: 400000,
    status: 'paid_cash', // Đã nộp tiền mặt
    paidAt: '26/09/2026',
    phone: '0912345602'
  },
  {
    id: 'HD-2609-021',
    studentId: 'hs-6a-21',
    studentName: 'Đạt',
    className: 'Lớp 6A (Chính)',
    month: 'Tháng 9 & 10/2026',
    sessionsAttended: 10,
    pricePerSession: 31250,
    deduction: 62500, // Nghỉ 2 buổi có phép trừ 62.500đ
    materialsFee: 25000,
    totalAmount: 275000,
    status: 'unpaid', // Chưa thanh toán
    paidAt: null,
    phone: '0912345621'
  }
];

// Màu sắc nhãn học sinh
export const STUDENT_TAG_COLORS = {
  default: { label: 'Mặc định', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  cyan: { label: 'Học ghép (Cyan)', bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
  purple: { label: 'Lớp khác gửi (Tím)', bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' }, // tránh tím chói, dùng indigo dịu
  green: { label: 'Ưu đãi / Quen (Xanh)', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  yellow: { label: 'Cần lưu ý (Vàng)', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' }
};
