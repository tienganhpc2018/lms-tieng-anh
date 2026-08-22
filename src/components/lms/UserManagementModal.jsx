import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, UserPlus, Upload, Search, Key, Trash2, Edit3, CheckCircle, AlertCircle, FileText, Download, ShieldCheck, UserCheck, X, Lock, Unlock, Printer, QrCode } from 'lucide-react';

export default function UserManagementModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('browse');
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State Add Single User
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState('student');
  const [isCreating, setIsCreating] = useState(false);

  // Form State Reset Password Modal
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Form State CSV Upload
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreviewRows, setCsvPreviewRows] = useState([]);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const dbList = data || [];
      const savedCsvStudents = JSON.parse(localStorage.getItem('lms_csv_uploaded_students_v2') || '[]');

      // Học sinh mặc định cố định theo đúng yêu cầu Thầy Hải
      const defaultUsers = [
        { id: 'st_hoangnm', username: 'hoangnm', full_name: 'Nguyễn Minh Hoàng', email: 'hoangnm@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
        { id: 'master_admin', username: 'nguyensea106', full_name: 'Nguyễn Văn Hải', email: 'nguyensea106@gmail.com', role: 'teacher', is_teacher: true, approved: true, suspended: false },
      ];

      const uniqueMap = {};

      // 1. Thêm tài khoản cố định (Nguyễn Minh Hoàng + Nguyễn Văn Hải)
      defaultUsers.forEach((u) => {
        uniqueMap[u.username.toLowerCase()] = u;
      });

      // 2. Thêm dữ liệu từ CSDL Supabase
      dbList.forEach((u) => {
        if (u.username) {
          const key = u.username.toLowerCase();
          uniqueMap[key] = { ...uniqueMap[key], ...u, approved: true };
        }
      });

      // 3. Thêm dữ liệu NẠP CHÍNH XÁC TỪ FILE CSV CỦA THẦY HẢI
      savedCsvStudents.forEach((st) => {
        if (st.username) {
          const key = st.username.toLowerCase();
          uniqueMap[key] = { ...uniqueMap[key], ...st, approved: true };
        }
      });

      const finalList = Object.values(uniqueMap);
      setUsersList(finalList);
    } catch (err) {
      console.warn('Fetch users notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchUsers();
  }, [isOpen]);

  // XUẤT VÀ IN THẺ TÀI KHOẢN HỌC SINH KHỔ A4 CẮT PHÁT CHO CẢ LỚP
  const handlePrintStudentCards = () => {
    const studentUsers = usersList.filter((u) => u.role !== 'teacher');
    if (studentUsers.length === 0) {
      alert('Chưa có học sinh nào trong danh sách để in thẻ!');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="utf-8">
        <title>THẺ TÀI KHOẢN HỌC SINH LMS TIẾNG ANH</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');
          body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 20px;
            background: #ffffff;
            color: #0f172a;
          }
          .title-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #059669;
            padding-bottom: 10px;
          }
          .title-header h1 {
            color: #065f46;
            margin: 0 0 5px 0;
            font-size: 20px;
            text-transform: uppercase;
          }
          .card-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .card {
            border: 2px dashed #059669;
            border-radius: 12px;
            padding: 15px;
            background-color: #f0fdf4;
            position: relative;
            box-sizing: border-box;
          }
          .card-header {
            font-size: 11px;
            font-weight: 900;
            color: #047857;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            border-bottom: 1px solid #a7f3d0;
            padding-bottom: 4px;
          }
          .card-name {
            font-size: 14px;
            font-weight: 900;
            color: #111827;
            margin-bottom: 6px;
          }
          .card-info {
            font-size: 12px;
            margin: 4px 0;
          }
          .card-info strong {
            color: #065f46;
          }
          .card-pass {
            font-family: monospace;
            background-color: #d1fae5;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
            color: #064e3b;
          }
          .footer-note {
            font-size: 9px;
            color: #6b7280;
            margin-top: 8px;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="title-header">
          <h1>DANH SÁCH THẺ TÀI KHOẢN ĐĂNG NHẬP LMS TIẾNG ANH (CẮT PHÁT CHO HỌC SINH)</h1>
          <p style="font-size: 12px; color: #4b5563; margin: 0;">Trường / Lớp E-learning • Cắt theo đường nét đứt để phát cho từng học sinh</p>
        </div>

        <div class="card-grid">
          ${studentUsers
            .map(
              (st) => `
            <div class="card">
              <div class="card-header">LMS TIẾNG ANH • THẺ TÀI KHOẢN HỌC SINH</div>
              <div class="card-name">${st.full_name || st.username}</div>
              <div class="card-info">Tên Đăng Nhập: <strong>@${st.username}</strong></div>
              <div class="card-info">Mật Khẩu Cấp: <span class="card-pass">${st.raw_password_hint || '123456'}</span></div>
              <div class="card-info">Link truy cập: <strong>lms-tieng-anh.vercel.app</strong></div>
              <div class="footer-note">* Học sinh bảo mật mật khẩu và sử dụng để vào học bài giảng & bài thi online.</div>
            </div>
          `
            )
            .join('')}
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
    }
  };

  const handleToggleSuspendUser = async (userItem) => {
    const newStatus = !userItem.suspended;
    const actionText = newStatus ? 'KHÓA TẠM THỜI' : 'MỞ KHÓA';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản của học sinh "${userItem.full_name || userItem.username}"?`)) return;

    try {
      await supabase
        .from('profiles')
        .update({ suspended: newStatus })
        .eq('id', userItem.id);

      setUsersList((prev) =>
        prev.map((u) => (u.id === userItem.id ? { ...u, suspended: newStatus } : u))
      );

      alert(`🎉 ĐÃ ${actionText} TÀI KHOẢN HỌC SINH THÀNH CÔNG!`);
    } catch (err) {
      alert('Lỗi thay đổi trạng thái khóa: ' + err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert('Vui lòng nhập Tên đăng nhập (Username) và Mật khẩu!');
      return;
    }

    setIsCreating(true);
    const fullName = `${lastName.trim()} ${firstName.trim()}`.trim() || username;
    const finalEmail = email.trim() || `${username.trim().toLowerCase()}@lms.edu.vn`;

    try {
      const newUserObj = {
        id: 'u_' + Date.now(),
        username: username.trim().toLowerCase(),
        full_name: fullName,
        email: finalEmail,
        role: userRole,
        raw_password_hint: password.trim(),
        suspended: false,
        created_at: new Date().toISOString(),
      };

      await supabase.from('profiles').insert([newUserObj]);

      setUsersList((prev) => [newUserObj, ...prev]);
      alert(`🎉 ĐÃ THÊM HỌC SINH MỚI THÀNH CÔNG!\n\n• Tên đăng nhập: ${username}\n• Mật khẩu: ${password}\n• Họ tên: ${fullName}`);

      setUsername('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setActiveTab('browse');
    } catch (err) {
      alert('Lỗi tạo tài khoản: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !resetUser) return;
    setIsResetting(true);

    try {
      await supabase
        .from('profiles')
        .update({ raw_password_hint: newPassword.trim() })
        .eq('id', resetUser.id);

      setUsersList((prev) =>
        prev.map((u) => (u.id === resetUser.id ? { ...u, raw_password_hint: newPassword.trim() } : u))
      );

      alert(`🔑 ĐÃ ĐỔI MẬT KHẨU THÀNH CÔNG CHO HỌC SINH: ${resetUser.full_name || resetUser.username}\n\n• Mật khẩu mới: ${newPassword.trim()}`);
      setResetUser(null);
      setNewPassword('');
    } catch (err) {
      alert('Lỗi đổi mật khẩu: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteUser = async (userItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa học sinh "${userItem.full_name || userItem.username}" khỏi hệ thống?`)) return;

    try {
      await supabase.from('profiles').delete().eq('id', userItem.id);
      setUsersList((prev) => prev.filter((u) => u.id !== userItem.id));
      alert('❌ Đã xóa học sinh khỏi danh sách!');
    } catch (err) {
      alert('Lỗi xóa học sinh: ' + err.message);
    }
  };

  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      const rows = [];

      lines.forEach((line, idx) => {
        if (idx === 0 && line.toLowerCase().includes('username')) return;
        const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 2) {
          rows.push({
            username: cols[0] || `student${idx}`,
            password: cols[1] || '123456',
            firstname: cols[2] || '',
            lastname: cols[3] || '',
            email: cols[4] || `${cols[0]}@lms.edu.vn`,
          });
        }
      });
      setCsvPreviewRows(rows);
    };
    reader.readAsText(file);
  };

  const handleResetCsvStudents = () => {
    if (confirm('Thầy Hải có chắc chắn muốn xóa toàn bộ danh sách CSV cũ để nạp lại file CSV mới từ đầu?')) {
      localStorage.removeItem('lms_csv_uploaded_students_v2');
      localStorage.removeItem('lms_csv_enrolled_all_v2');
      fetchUsers();
      alert('🧹 Đã xóa danh sách CSV cũ! Bây giờ Thầy Hải có thể chọn file CSV mới để nạp lại nhé!');
    }
  };

  const handleUploadUsersCsv = async () => {
    if (csvPreviewRows.length === 0) {
      alert('Chưa có dữ liệu học sinh từ file CSV!');
      return;
    }

    setIsUploadingCsv(true);
    try {
      const newCreatedUsers = csvPreviewRows.map((r, i) => ({
        id: (crypto?.randomUUID ? crypto.randomUUID() : 'csv_' + Date.now() + '_' + i),
        username: r.username.toLowerCase().trim(),
        raw_password_hint: r.password.trim(),
        full_name: `${r.lastname} ${r.firstname}`.trim() || r.username,
        email: r.email?.trim() || `${r.username.trim().toLowerCase()}@lms.edu.vn`,
        role: 'student',
        approved: true,
        suspended: false,
        created_at: new Date().toISOString(),
      }));

      // 1. Ghi đè 100% bằng chính xác N học sinh từ file CSV của Thầy Hải
      localStorage.setItem('lms_csv_uploaded_students_v2', JSON.stringify(newCreatedUsers));
      localStorage.setItem('lms_csv_enrolled_all_v2', 'true');

      // 2. Thử insert vào Supabase DB
      try {
        await supabase.from('profiles').upsert(newCreatedUsers, { onConflict: 'username' });
      } catch (dbErr) {}

      // 3. Tự động ghi danh vào tất cả các khóa học
      try {
        const { data: courses } = await supabase.from('courses').select('id');
        if (courses && courses.length > 0) {
          const enrollments = [];
          newCreatedUsers.forEach((u) => {
            courses.forEach((c) => {
              enrollments.push({
                course_id: c.id,
                user_id: u.id,
                role: 'student',
                status: 'active',
              });
            });
          });
          await supabase.from('course_enrollments').upsert(enrollments);
        }
      } catch (enrollErr) {}

      fetchUsers();

      alert(`🚀 ĐÃ NẠP & LƯU CHÍNH XÁC ${newCreatedUsers.length} HỌC SINH TỪ FILE CSV CỦA THẦY HẢI!\n\nThầy Hải mở danh sách [Browse list of users] để xem đúng ${newCreatedUsers.length + 1} học sinh nhé!`);
      setCsvFile(null);
      setCsvPreviewRows([]);
      setActiveTab('browse');
    } catch (err) {
      alert('Lỗi nạp CSV: ' + err.message);
    } finally {
      setIsUploadingCsv(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = `username,password,firstname,lastname,email
nhondt,123456,Nhơn,Đinh Thành,nhondt@gmail.com
ngandtt,123456,Ngân,Đinh Trần Thảo,ngandtt@gmail.com
khanhdn,123456,Dương,Đoàn Ngọc Khánh,khanhdn@gmail.com
thuhnm,123456,Thư,Hà Nguyễn Minh,thuhnm@gmail.com
hoangnm,123456,Hoàng,Nguyễn Minh,hoangnm@gmail.com`;

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'danh_sach_hoc_sinh_mau.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleApproveUser = async (u) => {
    const isTeacherUser = (u.email || '').toLowerCase().includes('nguyensea') || u.role === 'teacher';
    if (isTeacherUser) return;

    const currentApproved = u.approved === true || u.approved === 1;
    const newApproved = !currentApproved;

    try {
      if (u.id) {
        await supabase.from('profiles').update({ approved: newApproved }).eq('id', u.id);
      }
      if (u.username) {
        await supabase.from('profiles').update({ approved: newApproved }).eq('username', u.username);
      }
      if (u.email) {
        await supabase.from('profiles').update({ approved: newApproved }).ilike('email', u.email);
      }
    } catch (err) {}

    // Đồng bộ vào LocalStorage duyệt
    const approvedMap = JSON.parse(localStorage.getItem('lms_approved_students_v2') || '{}');
    if (newApproved) {
      approvedMap[u.id] = true;
      if (u.username) approvedMap[u.username] = true;
      if (u.email) approvedMap[u.email] = true;
    } else {
      delete approvedMap[u.id];
      if (u.username) delete approvedMap[u.username];
      if (u.email) delete approvedMap[u.email];
    }
    localStorage.setItem('lms_approved_students_v2', JSON.stringify(approvedMap));

    setUsersList((prev) =>
      prev.map((item) => (item.id === u.id || item.username === u.username ? { ...item, approved: newApproved } : item))
    );
    alert(`✅ Đã ${newApproved ? 'DUYỆT CHO PHÉP VÀO HỌC' : 'CHUYỂN VỀ TRẠNG THÁI CHỜ DUYỆT'} tài khoản học sinh "${u.full_name || u.username}"!`);
  };

  if (!isOpen) return null;

  const handleToggleUserRole = async (u) => {
    const currentIsTeacher = u.is_teacher || u.role === 'teacher' || u.role === 'admin' || u.email === 'nguyensea106@gmail.com';
    const newIsTeacher = !currentIsTeacher;
    const newRole = newIsTeacher ? 'teacher' : 'student';

    try {
      await supabase
        .from('profiles')
        .update({ is_teacher: newIsTeacher, role: newRole })
        .eq('id', u.id);
    } catch (err) {}

    setUsersList((prev) =>
      prev.map((item) => (item.id === u.id ? { ...item, is_teacher: newIsTeacher, role: newRole } : item))
    );
    alert(`✅ Đã chuyển vai trò tài khoản "${u.full_name || u.username}" sang: ${newIsTeacher ? '👨‍🏫 Giáo Viên (Admin)' : '🎓 Học Sinh'}`);
  };

  const handleAssignClass = async (u, newClass) => {
    try {
      await supabase.from('profiles').update({ class_name: newClass }).eq('id', u.id);
    } catch (e) {}

    const savedCsvStudents = JSON.parse(localStorage.getItem('lms_csv_uploaded_students_v2') || '[]');
    const updated = savedCsvStudents.map((st) => (st.id === u.id || st.username === u.username ? { ...st, class_name: newClass } : st));
    localStorage.setItem('lms_csv_uploaded_students_v2', JSON.stringify(updated));

    setUsersList((prev) => prev.map((item) => (item.id === u.id ? { ...item, class_name: newClass } : item)));
  };

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-40 p-4 pt-20 sm:pt-24 animate-fade-in font-sans select-none">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[80vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* HEADER QUẢN LÝ TÀI KHOẢN NGUYÊN BẢN GNOMIO MOODLE */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-extrabold uppercase tracking-wide">
              <span>Dashboard</span>
              <span>/</span>
              <span>Site administration</span>
              <span>/</span>
              <span>Users</span>
              <span>/</span>
              <span>Accounts</span>
            </div>
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2.5 mt-1">
              <Users className="w-6 h-6 text-emerald-400" />
              <span>QUẢN LÝ TÀI KHOẢN HỌC SINH & PHÂN QUYỀN (SITE ADMINISTRATION)</span>
            </h2>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS MENU THANH ĐIỀU HƯỚNG */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50 space-x-3">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition flex items-center space-x-2 border-b-2 ${
              activeTab === 'browse'
                ? 'bg-white border-emerald-600 text-emerald-800 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Browse list of users (Danh sách {usersList.length} học sinh)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition flex items-center space-x-2 border-b-2 ${
              activeTab === 'add'
                ? 'bg-white border-emerald-600 text-emerald-800 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4 text-sky-600" />
            <span>Add a new user (Thêm học sinh thủ công)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition flex items-center space-x-2 border-b-2 ${
              activeTab === 'csv'
                ? 'bg-white border-emerald-600 text-emerald-800 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-purple-600" />
            <span>Upload users via CSV (Tạo cả lớp bằng file .csv)</span>
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: BROWSE LIST OF USERS */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo Tên hoặc Username..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs bg-white font-medium shadow-2xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* NÚT IN THẺ TÀI KHOẢN HỌC SINH KHỔ A4 CẮT PHÁT CHO CẢ LỚP */}
                  <button
                    type="button"
                    onClick={handlePrintStudentCards}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 border border-emerald-500/40"
                  >
                    <Printer className="w-4 h-4" />
                    <span>🖨️ In Thẻ Tài Khoản Cả Lớp (PDF A4)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('add')}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Add new user</span>
                  </button>
                </div>
              </div>

              {/* BẢNG DANH SÁCH CHUẨN GNOMIO */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-extrabold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Họ và tên</th>
                      <th className="p-3">Username / Email</th>
                      <th className="p-3">🏫 Lớp Học</th>
                      <th className="p-3">Vai Trò</th>
                      <th className="p-3">Duyệt TK</th>
                      <th className="p-3">Trạng thái khóa (Suspend)</th>
                      <th className="p-3 text-right">Thao tác Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredUsers.map((u) => {
                      const isTeacherUser = u.is_teacher || u.role === 'teacher' || u.role === 'admin' || (u.email || '').toLowerCase().includes('nguyensea');
                      const approvedMap = JSON.parse(localStorage.getItem('lms_approved_students_v2') || '{}');
                      const isApproved = isTeacherUser || u.approved === true || u.approved === 1 || approvedMap[u.id] === true || approvedMap[u.email] === true;

                      return (
                        <tr key={u.id} className={`transition ${u.suspended ? 'bg-rose-50/50' : 'hover:bg-slate-50'}`}>
                          <td className="p-3">
                            <div className="flex items-center space-x-2.5">
                              <div className={`w-8 h-8 rounded-full font-extrabold flex items-center justify-center text-xs ${
                                u.suspended ? 'bg-rose-200 text-rose-800' : isTeacherUser ? 'bg-purple-200 text-purple-900' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {(u.full_name || u.username || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 block">{u.full_name || u.username}</span>
                                {u.suspended && <span className="text-[10px] font-extrabold text-rose-600 block">🔒 KHÓA TẠM THỜI</span>}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-0.5">
                              <span className="font-bold text-indigo-700 block">@{u.username || u.email?.split('@')[0]}</span>
                              <span className="text-[11px] text-slate-500 block">{u.email}</span>
                            </div>
                          </td>

                          {/* CỘT CÀI ĐẶT LỚP HỌC KHIẾN HỆ THỐNG GHI DANH TỰ ĐỘNG THEO LỚP */}
                          <td className="p-3">
                            <select
                              value={u.class_name || u.class || '7A3'}
                              onChange={(e) => handleAssignClass(u, e.target.value)}
                              className="bg-emerald-50 text-emerald-900 border border-emerald-300 text-[11px] font-black rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-emerald-100 transition shadow-2xs"
                            >
                              {['7A3', '7A4', '7A5', '7A6', '9A2', '9A5'].map((cName) => (
                                <option key={cName} value={cName}>
                                  🏫 Lớp {cName}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* CỘT VAI TRÒ (ROLE) CHUẨN 100% THEO YÊU CẦU THẦY HẢI */}
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => handleToggleUserRole(u)}
                              title="Nhấp để đổi giữa Giáo Viên và Học Sinh"
                              className={`px-3 py-1 rounded-xl text-[11px] font-black transition flex items-center space-x-1.5 cursor-pointer border shadow-2xs ${
                                isTeacherUser
                                  ? 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200'
                                  : 'bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100'
                              }`}
                            >
                              <span>{isTeacherUser ? '👨‍🏫 Giáo Viên (Admin)' : '🎓 Học Sinh'}</span>
                              <span className="text-[9px] opacity-75 font-semibold text-purple-700">(Đổi ⚡)</span>
                            </button>
                          </td>

                          {/* CỘT DUYỆT TÀI KHOẢN (APPROVED) */}
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => handleToggleApproveUser(u)}
                              title={isApproved ? "Tài khoản đã được duyệt (Nhấp để chuyển về Chờ Duyệt)" : "Nhấp vào đây để DUYỆT cho học sinh vào làm bài"}
                              className={`px-3 py-1 rounded-xl text-[11px] font-black transition flex items-center space-x-1.5 border cursor-pointer shadow-2xs ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-amber-100 text-amber-950 border-amber-400 font-extrabold animate-pulse hover:bg-amber-200 shadow-sm'
                              }`}
                            >
                              <UserCheck className={`w-3.5 h-3.5 ${isApproved ? 'text-emerald-700' : 'text-amber-800'}`} />
                              <span>{isApproved ? '✓ Đã Duyệt' : '⏳ Chờ Duyệt'}</span>
                            </button>
                          </td>

                          <td className="p-3">
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 font-mono font-extrabold rounded-lg text-[11px]">
                              {u.raw_password_hint || '123456'}
                            </span>
                          </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleToggleSuspendUser(u)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center space-x-1 border transition ${
                              u.suspended
                                ? 'bg-rose-600 text-white border-transparent'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            }`}
                          >
                            {u.suspended ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            <span>{u.suspended ? '🔒 Đang Khóa' : '🔓 Đang Mở'}</span>
                          </button>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setResetUser(u)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg transition"
                            title="Khôi phục / Đổi mật khẩu"
                          >
                            🔑 Đổi MK
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[11px] font-bold rounded-lg transition"
                            title="Xóa học sinh này"
                          >
                            ✕ Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ADD A NEW USER (THÊM THỦ CÔNG) */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateUser} className="space-y-5 max-w-2xl mx-auto bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <h3 className="font-extrabold text-base text-slate-900 border-b pb-2 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-sky-600" />
                <span>General - Thông Tin Học Sinh Mới</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                    Username (Tên đăng nhập / Mã HS) *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="VD: nhondt hay 2024001"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                    New password (Mật khẩu ban đầu) *
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="VD: 123456"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                    First name (Tên học sinh)
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="VD: Nhơn"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                    Last name (Họ và Tên đệm)
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="VD: Đinh Thành"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                  Email address (Email phụ huynh hoặc email mặc định)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="VD: nhondt@gmail.com (Nếu để trống tự sinh nhondt@lms.edu.vn)"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white font-semibold"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md"
                >
                  {isCreating ? 'Đang Tạo...' : '🚀 Tạo Tài Khoản Học Sinh'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: UPLOAD USERS VIA CSV (NẠP CẢ LỚP) */}
          {activeTab === 'csv' && (
            <div className="space-y-5 max-w-3xl mx-auto bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-purple-600" />
                  <span>Upload Users - Nạp Danh Sách Tài Khoản Cả Lớp Bằng File CSV</span>
                </h3>

                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-xs rounded-xl transition flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>📥 Tải File CSV Mẫu</span>
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-slate-800 uppercase">
                  Chọn File .CSV danh sách học sinh:
                </label>
                <div className="p-8 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-3xl bg-white text-center space-y-2 cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-10 h-10 text-purple-500 mx-auto" />
                  <p className="font-extrabold text-sm text-slate-800">
                    {csvFile ? `File đã chọn: ${csvFile.name}` : 'Kéo thả file CSV vào đây hoặc Bấm để chọn file'}
                  </p>
                  <p className="text-xs text-slate-400">Định dạng CSV chứa các cột: username, password, firstname, lastname, email</p>
                </div>
              </div>

              {/* PREVIEW BẢNG 10 HÀNG ĐẦU TIÊN */}
              {csvPreviewRows.length > 0 && (
                <div className="space-y-2 border-t pt-3">
                  <span className="font-extrabold text-xs text-purple-900 block uppercase">
                    Preview {csvPreviewRows.length} học sinh sẵn sàng nạp:
                  </span>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto text-xs bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 font-bold text-slate-700 border-b">
                        <tr>
                          <th className="p-2">STT</th>
                          <th className="p-2">Username</th>
                          <th className="p-2">Mật khẩu</th>
                          <th className="p-2">Họ và Tên</th>
                          <th className="p-2">Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-medium text-slate-600">
                        {csvPreviewRows.map((r, i) => (
                          <tr key={i}>
                            <td className="p-2 font-bold">{i + 1}</td>
                            <td className="p-2 text-indigo-700 font-bold">{r.username}</td>
                            <td className="p-2 font-mono font-bold text-amber-800">{r.password}</td>
                            <td className="p-2 font-bold">{r.lastname} {r.firstname}</td>
                            <td className="p-2">{r.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleUploadUsersCsv}
                      disabled={isUploadingCsv}
                      className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
                    >
                      {isUploadingCsv ? 'Đang Nạp...' : `🚀 Upload ${csvPreviewRows.length} Học Sinh Vào Hệ Thống`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL RESET PASSWORD CHO HỌC SINH */}
      {resetUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2 border-b pb-2">
              <Key className="w-5 h-5 text-amber-500" />
              <span>CẤP LẠI MẬT KHẨU CHO HỌC SINH</span>
            </h3>

            <div className="text-xs space-y-1 text-slate-700">
              <p>• Học sinh: <span className="font-extrabold text-slate-900">{resetUser.full_name || resetUser.username}</span></p>
              <p>• Username: <span className="font-bold text-indigo-700">@{resetUser.username}</span></p>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                Nhập Mật Khẩu Mới Cho Học Sinh:
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Gõ mật khẩu mới (VD: 123456)"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-amber-50 font-bold font-mono text-amber-900"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setResetUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isResetting}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow-md"
              >
                {isResetting ? 'Đang Lưu...' : '🔑 Lưu Mật Khẩu Mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
