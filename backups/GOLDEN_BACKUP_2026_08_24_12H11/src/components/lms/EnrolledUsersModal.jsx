import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, UserPlus, Upload, Search, X, CheckCircle, Shield, GraduationCap, Lock, Trash2, CheckSquare, Filter } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const AVAILABLE_CLASSES = ['Tất cả lớp', '7A3', '7A4', '7A5', '7A6', '9A2', '9A5'];

export default function EnrolledUsersModal({ isOpen, onClose, courseId, courseTitle = 'ENGLISH 7 (GLOBAL SUCCESS)', isTeacher }) {
  const [users, setUsers] = useState([]);
  const [allStudentsList, setAllStudentsList] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedEnrolledUserIds, setSelectedEnrolledUserIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolPopupOpen, setIsEnrolPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [letterFilter, setLetterFilter] = useState('All');
  const [selectedClassFilter, setSelectedClassFilter] = useState('Tất cả lớp');
  const [enrolling, setEnrolling] = useState(false);

  const defaultUsers = [
    { id: 'st_hoangnm', username: 'hoangnm', full_name: 'Nguyễn Minh Hoàng', email: 'hoangnm@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'master_admin', username: 'nguyensea106', full_name: 'Nguyễn Văn Hải', email: 'nguyensea106@gmail.com', role: 'teacher', is_teacher: true, approved: true, suspended: false },
  ];

  const fetchEnrolledUsers = async () => {
    setLoading(true);
    try {
      // 1. Lấy dữ liệu ghi danh từ CSDL Supabase theo đúng khóa học này
      const { data } = await supabase
        .from('course_enrollments')
        .select('*, profile:user_id (*)')
        .eq('course_id', courseId)
        .order('enrolled_at', { ascending: false });

      let dbList = data || [];
      const localCourseEnrollments = JSON.parse(localStorage.getItem(`lms_enrolled_users_${courseId}`) || '[]');

      const enrolledMap = {};

      // Nạp danh sách ghi danh từ Supabase
      dbList.forEach((u) => {
        const pKey = (u.profile?.username || u.profile?.full_name || u.user_id || '').toLowerCase();
        if (pKey) enrolledMap[pKey] = u;
      });

      // Nạp danh sách ghi danh thực tế của riêng khóa học này từ LocalStorage
      localCourseEnrollments.forEach((u) => {
        const pKey = (u.profile?.username || u.profile?.full_name || u.user_id || '').toLowerCase();
        if (pKey && !enrolledMap[pKey]) enrolledMap[pKey] = u;
      });

      // Giữ Giáo viên Master Admin (Thầy Hải) và Nguyễn Minh Hoàng
      defaultUsers.forEach((st, idx) => {
        const stName = (st.username || st.full_name || '').toLowerCase();
        if (stName && !enrolledMap[stName]) {
          enrolledMap[stName] = {
            id: 'enrol_def_' + idx,
            course_id: courseId,
            user_id: st.id,
            role: st.role || 'student',
            status: 'active',
            enrolled_at: new Date().toISOString(),
            profile: st,
          };
        }
      });

      const finalList = Object.values(enrolledMap);
      setUsers(finalList);
    } catch (err) {
      console.warn('Fetch enrolled error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSchoolStudents = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name', { ascending: true });

      let dbList = data || [];
      const savedCsvStudents = JSON.parse(localStorage.getItem('lms_csv_uploaded_students_v2') || '[]');
      
      const map = {};
      defaultUsers.forEach((st) => {
        if (st.role === 'student') map[st.username.toLowerCase()] = st;
      });
      dbList.forEach((s) => {
        if (s.username) map[s.username.toLowerCase()] = s;
      });
      savedCsvStudents.forEach((st) => {
        if (st.username) map[st.username.toLowerCase()] = st;
      });

      setAllStudentsList(Object.values(map));
    } catch (err) {}
  };

  useEffect(() => {
    if (isOpen && courseId) {
      fetchEnrolledUsers();
      fetchAllSchoolStudents();
    }
  }, [isOpen, courseId]);

  const saveLocalEnrollments = (newStudentList) => {
    const existing = JSON.parse(localStorage.getItem(`lms_enrolled_users_${courseId}`) || '[]');
    const map = {};
    existing.forEach((u) => {
      const key = (u.profile?.username || u.profile?.full_name || u.user_id || '').toLowerCase();
      if (key) map[key] = u;
    });

    newStudentList.forEach((st, idx) => {
      const key = (st.username || st.full_name || st.id || '').toLowerCase();
      if (key) {
        map[key] = {
          id: 'enrol_loc_' + Date.now() + '_' + idx,
          course_id: courseId,
          user_id: st.id,
          role: 'student',
          status: 'active',
          enrolled_at: new Date().toISOString(),
          profile: st,
        };
      }
    });

    const finalList = Object.values(map);
    localStorage.setItem(`lms_enrolled_users_${courseId}`, JSON.stringify(finalList));
    return finalList;
  };

  // GHI DANH HÀNG LOẠT HỌC SINH ĐƯỢC CHỌN VÀO KHÓA HỌC (ENROL USERS)
  const handleEnrolSelectedUsers = async () => {
    if (selectedUserIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 học sinh để ghi danh vào khóa học!');
      return;
    }
    setEnrolling(true);

    try {
      const targetStudents = allStudentsList.filter((s) => selectedUserIds.includes(s.id));
      const newEntries = selectedUserIds.map((uid) => ({
        course_id: courseId,
        user_id: uid,
        role: 'student',
        status: 'active',
      }));

      try {
        await supabase.from('course_enrollments').upsert(newEntries);
      } catch (dbErr) {}

      saveLocalEnrollments(targetStudents);

      alert(`🎉 ĐÃ GHI DANH THÀNH CÔNG ${selectedUserIds.length} HỌC SINH VÀO KHÓA HỌC NÀY!`);
      setSelectedUserIds([]);
      setIsEnrolPopupOpen(false);
      await fetchEnrolledUsers();
    } catch (err) {
      alert('Lỗi ghi danh: ' + err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleEnrolAllSchoolStudents = async () => {
    if (allStudentsList.length === 0) {
      alert('Chưa có học sinh nào trong hệ thống!');
      return;
    }
    if (!confirm(`Thầy Hải có chắc chắn muốn đưa TOÀN BỘ ${allStudentsList.length} em học sinh trong hệ thống vào khóa học này?`)) return;

    setEnrolling(true);
    try {
      const newEntries = allStudentsList.map((st) => ({
        course_id: courseId,
        user_id: st.id,
        role: 'student',
        status: 'active',
      }));

      try {
        await supabase.from('course_enrollments').upsert(newEntries, { onConflict: 'course_id,user_id' });
      } catch (dbErr) {}

      saveLocalEnrollments(allStudentsList);

      alert(`🎉 ĐÃ GHI DANH THÀNH CÔNG TẤT CẢ ${allStudentsList.length} HỌC SINH VÀO KHÓA HỌC NÀY!`);
      await fetchEnrolledUsers();
    } catch (err) {
      alert('Lỗi ghi danh: ' + err.message);
    } finally {
      setEnrolling(false);
    }
  };

  // Xóa Người Học Khỏi Khóa Học
  const handleRemoveUser = async (enrollmentId, userName) => {
    if (!confirm(`Bạn có chắc muốn xóa học sinh "${userName}" khỏi khóa học này?`)) return;

    try {
      try {
        await supabase.from('course_enrollments').delete().eq('id', enrollmentId);
      } catch (dbErr) {}

      const existing = JSON.parse(localStorage.getItem(`lms_enrolled_users_${courseId}`) || '[]');
      const filtered = existing.filter((u) => u.id !== enrollmentId && (u.profile?.full_name || u.profile?.username) !== userName);
      localStorage.setItem(`lms_enrolled_users_${courseId}`, JSON.stringify(filtered));

      await fetchEnrolledUsers();
      alert('Đã xóa học sinh khỏi khóa học!');
    } catch (err) {
      alert('Lỗi xóa: ' + err.message);
    }
  };

  const toggleSelectUser = (uid) => {
    setSelectedUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const toggleSelectEnrolledUser = (uid) => {
    setSelectedEnrolledUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const alphabet = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const handleEnrolByClass = async () => {
    let targetStudents = allStudentsList;
    if (selectedClassFilter !== 'Tất cả lớp') {
      targetStudents = allStudentsList.filter((s) => {
        const cls = (s.class_name || s.class || s.user_class || '').toUpperCase();
        return cls.includes(selectedClassFilter.toUpperCase());
      });
    }

    if (targetStudents.length === 0) {
      alert(`Hiện tại chưa có học sinh nào được phân vào [${selectedClassFilter}]! Thầy Hải có thể phân lớp cho học sinh ở bảng Quản Lý Học Sinh nhé.`);
      return;
    }

    if (!confirm(`Thầy Hải có chắc chắn muốn ghi danh ${targetStudents.length} học sinh thuộc [${selectedClassFilter}] vào khóa học này?`)) return;

    setEnrolling(true);
    try {
      const newEntries = targetStudents.map((st) => ({
        course_id: courseId,
        user_id: st.id,
        role: 'student',
        status: 'active',
      }));

      try {
        await supabase.from('course_enrollments').upsert(newEntries, { onConflict: 'course_id,user_id' });
      } catch (dbErr) {}

      saveLocalEnrollments(targetStudents);

      alert(`🎉 ĐÃ GHI DANH THÀNH CÔNG ${targetStudents.length} HỌC SINH [${selectedClassFilter}] VÀO KHÓA HỌC NÀY!`);
      await fetchEnrolledUsers();
    } catch (err) {
      alert('Lỗi ghi danh: ' + err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const filteredEnrolledUsers = (users || []).filter((u) => {
    if (!u) return false;
    const p = u.profile || u;
    const name = (p.full_name || p.username || '').toLowerCase();
    const cls = (p.class_name || p.class || p.user_class || '').toUpperCase();

    const matchesSearch = name.includes(searchQuery.toLowerCase()) || (p.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = letterFilter === 'All' || name.toUpperCase().startsWith(letterFilter);
    const matchesClass = selectedClassFilter === 'Tất cả lớp' || cls.includes(selectedClassFilter.toUpperCase());

    return matchesSearch && matchesLetter && matchesClass;
  });

  const handleSelectAllEnrolled = () => {
    if (selectedEnrolledUserIds.length === filteredEnrolledUsers.length) {
      setSelectedEnrolledUserIds([]);
    } else {
      setSelectedEnrolledUserIds(filteredEnrolledUsers.map((u) => u.id));
    }
  };

  const handleBulkUnenrol = async () => {
    if (selectedEnrolledUserIds.length === 0) {
      alert('Vui lòng tích chọn ít nhất 1 học sinh để thực hiện rút khỏi khóa học!');
      return;
    }
    if (!confirm(`Thầy Hải có chắc chắn muốn rút ${selectedEnrolledUserIds.length} học sinh đã chọn khỏi khóa học này?`)) return;

    try {
      await supabase.from('course_enrollments').delete().in('id', selectedEnrolledUserIds);
      alert(`Đã rút ${selectedEnrolledUserIds.length} học sinh khỏi khóa học!`);
      setSelectedEnrolledUserIds([]);
      await fetchEnrolledUsers();
    } catch (err) {
      alert('Lỗi rút học sinh: ' + err.message);
    }
  };

  const [editingRoleId, setEditingRoleId] = useState(null);
  const [detailsModalUser, setDetailsModalUser] = useState(null);

  const formatLastAccess = (uObj) => {
    if (!uObj) return 'Never';
    const p = uObj.profile || {};
    const rawTime = uObj.last_login || p.last_login || uObj.last_access || p.last_access;
    if (!rawTime) return 'Never';

    const diffMs = Date.now() - new Date(rawTime).getTime();
    if (isNaN(diffMs) || diffMs <= 0) return 'Never';

    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return `${diffSecs} secs`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} mins`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 365) return `${diffDays} days`;
    const diffYears = Math.floor(diffDays / 365);
    const remDays = diffDays % 365;
    return `${diffYears} year ${remDays} days`;
  };

  const handleUpdateRole = async (userObj, newRole) => {
    try {
      await supabase.from('course_enrollments').update({ role: newRole }).eq('id', userObj.id);
    } catch (e) {}

    setUsers((prev) => prev.map((item) => (item.id === userObj.id ? { ...item, role: newRole } : item)));
    setEditingRoleId(null);
  };

  // CHỈ CHECK isOpen TẠI ĐÂY (SAU KHI ĐÃ KHAI BÁO TẤT CẢ HOOKS)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 pt-20 sm:pt-24 animate-fade-in font-sans select-none">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[85vh] my-auto flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
        {/* HEADER QUẢN LÝ HỌC VIÊN NGUYÊN BẢN MOODLE GNOMIO */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-extrabold uppercase tracking-wide">
              <span>My courses</span>
              <span>/</span>
              <span>Participants</span>
              <span>/</span>
              <span>Enrolled users</span>
            </div>
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2.5 mt-1">
              <Users className="w-6 h-6 text-emerald-400" />
              <span>Enrolled users ({users.length} học viên trong khóa)</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {isTeacher && (
              <>
                {/* SELECT CHỌN LỚP ĐỂ GHI DANH TỰ ĐỘNG NỔI BẬT DÀNH CHO THẦY HẢI */}
                <div className="flex items-center space-x-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                  <Filter className="w-4 h-4 text-emerald-400 ml-1" />
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="bg-slate-900 text-emerald-300 font-extrabold text-xs px-2 py-1 rounded-lg border border-slate-700 outline-none cursor-pointer"
                  >
                    {AVAILABLE_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        🏫 {cls === 'Tất cả lớp' ? 'Tất cả các lớp' : `Lớp ${cls}`}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleEnrolByClass}
                    disabled={enrolling}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg shadow-sm transition flex items-center space-x-1 border border-emerald-400/40 cursor-pointer"
                    title={`Ghi danh tất cả học sinh thuộc [${selectedClassFilter}] vào khóa này`}
                  >
                    <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ghi Danh {selectedClassFilter === 'Tất cả lớp' ? 'Cả Lớp' : `[Lớp ${selectedClassFilter}]`}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEnrolPopupOpen(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 border border-blue-400/40 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Enrol users (Chọn Lọc)</span>
                </button>
              </>
            )}

            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BỘ LỌC TÌM KIẾM & CHỮ CÁI A-Z NGUYÊN BẢN CHUẨN MOODLE (ẢNH 3) */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo Tên hoặc Email học sinh..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs bg-white font-medium shadow-2xs"
              />
            </div>

            <div className="flex items-center space-x-3 text-xs font-bold text-slate-600">
              {selectedEnrolledUserIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkUnenrol}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-2xs transition flex items-center space-x-1 cursor-pointer animate-pulse"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>🗑️ Rút {selectedEnrolledUserIds.length} học sinh khỏi khóa</span>
                </button>
              )}
              <span>Hiển thị: <strong className="text-emerald-700">{filteredEnrolledUsers.length}</strong> / {users.length} học sinh</span>
            </div>
          </div>

          {/* LỌC THEO TÊN A-Z NGUYÊN BẢN MOODLE (ẢNH 3) */}
          <div className="flex items-center space-x-1 text-[11px] font-bold overflow-x-auto pb-1 pt-1">
            <span className="text-slate-400 mr-1">First name:</span>
            {alphabet.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => setLetterFilter(letter)}
                className={`px-2 py-0.5 rounded font-extrabold transition ${
                  letterFilter === letter ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT BODY BẢNG DANH SÁCH PARTICIPANTS CHUẨN NGUYÊN BẢN MOODLE (ẢNH 3) */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <LoadingSpinner text="Đang tải danh sách học viên trong khóa..." />
          ) : filteredEnrolledUsers.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-extrabold text-slate-700 text-sm">Chưa có học sinh nào được thêm vào khóa học này!</p>
              <p className="text-xs text-slate-400 mt-1">Bấm nút "Enrol users" màu xanh ở góc trên để chọn và thêm học sinh vào khóa.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 font-extrabold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedEnrolledUserIds.length > 0 && selectedEnrolledUserIds.length === filteredEnrolledUsers.length}
                        onChange={handleSelectAllEnrolled}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                        title="Tích chọn tất cả"
                      />
                    </th>
                    <th className="p-3">FIRST NAME / LAST NAME</th>
                    <th className="p-3">EMAIL ADDRESS</th>
                    <th className="p-3">ROLES</th>
                    <th className="p-3">GROUPS</th>
                    <th className="p-3">LAST ACCESS TO COURSE</th>
                    <th className="p-3">STATUS</th>
                    {isTeacher && <th className="p-3 text-right">THAO TÁC</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredEnrolledUsers.map((u) => {
                    const p = u.profile || {};
                    const name = p.full_name || p.username || 'Học viên';
                    const email = p.email || `${p.username}@lms.edu.vn`;
                    const roleName = u.role === 'teacher' ? 'Teacher' : 'Student';
                    const groupName = p.class_name || p.class ? `Lớp ${p.class_name || p.class}` : 'No groups';
                    const isSelected = selectedEnrolledUserIds.includes(u.id);
                    const lastAccessText = formatLastAccess(u);
                    const avatarImgUrl = p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.username || name)}`;

                    return (
                      <tr
                        key={u.id}
                        className={`transition select-none ${
                          isSelected ? 'bg-blue-50/90 border-l-4 border-blue-600 shadow-2xs font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* CHỈ TÍCH CHECKBOX KHI NHẤP VÀO Ô CHECKBOX */}
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectEnrolledUser(u.id)}
                            className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 font-extrabold text-blue-800 flex items-center space-x-2.5">
                          <img
                            src={avatarImgUrl}
                            alt={name}
                            className="w-8 h-8 rounded-full border border-slate-300 object-cover bg-slate-100 shadow-2xs"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
                            }}
                          />
                          <span className={`font-extrabold ${isSelected ? 'text-blue-900 underline' : 'text-blue-700 hover:underline'}`}>
                            {name}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{email}</td>

                        {/* ROLES EDITABLE CHUẨN MOODLE (ẢNH 3) */}
                        <td className="p-3 font-bold text-slate-800 relative">
                          {editingRoleId === u.id ? (
                            <div className="bg-white border border-blue-400 rounded-xl p-2 shadow-lg space-y-1.5 z-10 w-36">
                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 border-b pb-1">
                                <span>Edit role</span>
                                <button onClick={() => setEditingRoleId(null)} className="text-slate-400 hover:text-slate-700">✕</button>
                              </div>
                              <button
                                onClick={() => handleUpdateRole(u, 'student')}
                                className={`w-full text-left px-2 py-1 rounded text-xs font-bold flex items-center justify-between ${
                                  u.role === 'student' ? 'bg-blue-100 text-blue-900' : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <span>Student</span>
                                {u.role === 'student' && <span>✓</span>}
                              </button>
                              <button
                                onClick={() => handleUpdateRole(u, 'teacher')}
                                className={`w-full text-left px-2 py-1 rounded text-xs font-bold flex items-center justify-between ${
                                  u.role === 'teacher' ? 'bg-purple-100 text-purple-900' : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <span>Teacher</span>
                                {u.role === 'teacher' && <span>✓</span>}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <span className="font-extrabold text-slate-900">{roleName}</span>
                              <button
                                type="button"
                                onClick={() => setEditingRoleId(u.id)}
                                className="p-1 text-slate-400 hover:text-blue-600 transition"
                                title="Click to edit role"
                              >
                                ✏️
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-slate-600 font-medium">{groupName}</td>
                        <td className="p-3 text-slate-600 text-[11px] font-semibold">{lastAccessText}</td>
                        
                        {/* STATUS CHUẨN MOODLE (ẢNH 4) */}
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-md text-[10px] uppercase flex items-center space-x-1 w-max">
                            <span>ACTIVE</span>
                            <button
                              type="button"
                              onClick={() => setDetailsModalUser({ ...u, name, email, groupName, enrolledAtFormatted: new Date(u.enrolled_at || Date.now()).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) })}
                              className="text-[10px] text-emerald-700 hover:text-emerald-950 font-bold ml-1 cursor-pointer"
                              title="Enrolment details"
                            >
                              ℹ️
                            </button>
                          </span>
                        </td>

                        {/* THAO TÁC ADMIN */}
                        {isTeacher && (
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                type="button"
                                onClick={() => setDetailsModalUser({ ...u, name, email, groupName, enrolledAtFormatted: new Date(u.enrolled_at || Date.now()).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) })}
                                className="p-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg transition font-bold"
                                title="Enrolment details"
                              >
                                ℹ️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(u.id, name)}
                                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                                title="Rút học sinh khỏi khóa học"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CẢNH BÁO CHI TIẾT ENROLMENT DETAILS (ẢNH 4) */}
      {detailsModalUser && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Enrolment details</h3>
              <button onClick={() => setDetailsModalUser(null)} className="text-slate-400 hover:text-slate-700 font-extrabold text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="font-extrabold text-slate-900">Full name</span>
                <span className="col-span-2 text-slate-700 font-semibold">{detailsModalUser.name}</span>
              </div>
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="font-extrabold text-slate-900">Course</span>
                <span className="col-span-2 text-slate-700 font-extrabold uppercase text-emerald-800">{courseTitle || 'ENGLISH 7 (GLOBAL SUCCESS)'}</span>
              </div>
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="font-extrabold text-slate-900">Enrolment method</span>
                <span className="col-span-2 text-slate-700 font-semibold flex items-center space-x-1">
                  <span>Manual enrolments</span>
                  <span>✏️</span>
                </span>
              </div>
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="font-extrabold text-slate-900">Status</span>
                <span className="col-span-2">
                  <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-extrabold rounded text-[10px]">Active</span>
                </span>
              </div>
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="font-extrabold text-slate-900">Enrolment starts</span>
                <span className="col-span-2 text-slate-600 font-medium">{detailsModalUser.enrolledAtFormatted}</span>
              </div>
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="font-extrabold text-slate-900">Enrolment created</span>
                <span className="col-span-2 text-slate-600 font-medium">{detailsModalUser.enrolledAtFormatted}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailsModalUser(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold rounded-xl text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP GHI DANH HỌC SINH VÀO KHÓA HỌC (ENROL USERS POPUP MODAL) */}
      {isEnrolPopupOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 border border-slate-200 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Enrol users - Chọn Học Sinh Thêm Vào Khóa</span>
              </h3>
              <button onClick={() => setIsEnrolPopupOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Nhấp chọn tên học sinh dưới đây (hàng sẽ <strong className="text-blue-700">sáng xanh</strong>) và bấm nút <strong className="text-blue-700">"Enrol selected users"</strong> để nạp vào khóa học:
            </p>

            <div className="border border-slate-200 rounded-2xl max-h-64 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
              {(allStudentsList || []).map((st) => {
                const isChecked = selectedUserIds.includes(st.id);
                const isAlreadyEnrolled = enrolledUserIdsSet.has(st.id);

                return (
                  <div
                    key={st.id}
                    onClick={() => toggleSelectUser(st.id)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition select-none ${
                      isChecked
                        ? 'bg-blue-100/90 border-l-4 border-blue-600 shadow-2xs font-extrabold text-blue-900'
                        : 'hover:bg-slate-100 text-slate-800 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectUser(st.id)}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <div>
                        <span className="font-extrabold text-xs block">{st.full_name || st.username}</span>
                        <span className="text-[10px] opacity-75 block">{st.email || `${st.username}@lms.edu.vn`}</span>
                      </div>
                    </div>

                    <div>
                      {isAlreadyEnrolled ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                          ✓ Đã trong khóa
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md">
                          + Chưa ghi danh
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-extrabold text-slate-700">
                Đã chọn: <strong className="text-blue-600">{selectedUserIds.length}</strong> học sinh
              </span>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEnrolPopupOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleEnrolSelectedUsers}
                  disabled={enrolling || selectedUserIds.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enrol selected users ({selectedUserIds.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
