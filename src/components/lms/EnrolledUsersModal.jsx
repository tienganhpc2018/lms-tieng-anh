import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, UserPlus, Upload, Search, X, CheckCircle, Shield, GraduationCap, Lock, Trash2, CheckSquare, Filter } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function EnrolledUsersModal({ isOpen, onClose, courseId, isTeacher }) {
  const [users, setUsers] = useState([]);
  const [allStudentsList, setAllStudentsList] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolPopupOpen, setIsEnrolPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [letterFilter, setLetterFilter] = useState('All');
  const [enrolling, setEnrolling] = useState(false);

  const defaultClassList = [
    { id: 'st_1', username: 'antnh', full_name: 'Trịnh Nguyễn Hoài An', email: 'antnh@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_2', username: 'annt', full_name: 'Ngô Thái An', email: 'annt@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_3', username: 'annvk', full_name: 'Nguyễn Võ Khánh An', email: 'annvk@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_4', username: 'binhltt', full_name: 'Lê Thị Thanh Bình', email: 'binhltt@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_5', username: 'chaunnb', full_name: 'Nguyễn Ngọc Bảo Châu', email: 'chaunnb@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_6', username: 'chautp', full_name: 'Trịnh Phương Châu', email: 'chautp@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_7', username: 'cuongdm', full_name: 'Đỗ Minh Cường', email: 'cuongdm@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_8', username: 'datnt', full_name: 'Nguyễn Tiến Đạt', email: 'datnt@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_9', username: 'dattt', full_name: 'Trịnh Tiến Đạt', email: 'dattt@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_10', username: 'dungdh', full_name: 'Đinh Hùng Dũng', email: 'dungdh@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_11', username: 'duongvt', full_name: 'Vũ Thùy Dương', email: 'duongvt@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_12', username: 'hadnd', full_name: 'Đinh Nguyễn Đan Hà', email: 'hadnd@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_13', username: 'haidq', full_name: 'Đinh Quang Hải', email: 'haidq@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_14', username: 'hangltt', full_name: 'Lê Thị Thu Hằng', email: 'hangltt@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_15', username: 'hangndt', full_name: 'Nguyễn Đỗ Thúy Hằng', email: 'hangndt@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_16', username: 'hienntd', full_name: 'Nguyễn Thị Diệu Hiền', email: 'hienntd@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_17', username: 'hoangbv', full_name: 'Bùi Việt Hoàng', email: 'hoangbv@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_18', username: 'hoangtv', full_name: 'Trịnh Việt Hoàng', email: 'hoangtv@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_19', username: 'hannb', full_name: 'Nguyễn Bảo Hân', email: 'hannb@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_20', username: 'huyenthk', full_name: 'Trịnh Hoàng Khánh Huyền', email: 'huyenthk@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_21', username: 'khanhdh', full_name: 'Đinh Hùng Khánh', email: 'khanhdh@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_22', username: 'linhtnd', full_name: 'Trịnh Nguyễn Đan Linh', email: 'linhtnd@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_23', username: 'minhdt', full_name: 'Đinh Tuấn Minh', email: 'minhdt@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_24', username: 'namnn', full_name: 'Nguyễn Nhật Nam', email: 'namnn@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_25', username: 'nhantt', full_name: 'Trịnh Trọng Nhân', email: 'nhantt@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_26', username: 'nhatbd', full_name: 'Bùi Đăng Nhật', email: 'nhatbd@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_27', username: 'oanhdk', full_name: 'Đinh Kim Oanh', email: 'oanhdk@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_28', username: 'nhilty', full_name: 'Lê Thị Yến Nhi', email: 'nhilty@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_29', username: 'phuongth', full_name: 'Trịnh Hoàng Phương', email: 'phuongth@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_30', username: 'quannh', full_name: 'Nguyễn Hoàng Quân', email: 'quannh@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_31', username: 'sangdv', full_name: 'Đinh Văn Sang', email: 'sangdv@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_32', username: 'tienbm', full_name: 'Bùi Minh Tiến', email: 'tienbm@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_33', username: 'thaothp', full_name: 'Trịnh Hà Phương Thảo', email: 'thaothp@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_34', username: 'trungnh', full_name: 'Nguyễn Hoàng Trung', email: 'trungnh@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
    { id: 'st_35', username: 'hoangnm', full_name: 'Nguyễn Minh Hoàng', email: 'hoangnm@gmail.com', role: 'student', raw_password_hint: '123456', approved: true, suspended: false },
  ];

  const fetchEnrolledUsers = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('course_enrollments')
        .select('*, profile:user_id (*)')
        .eq('course_id', courseId)
        .order('enrolled_at', { ascending: false });

      let dbList = data || [];
      const savedCsvStudents = JSON.parse(localStorage.getItem('lms_csv_uploaded_students_v2') || '[]');

      const enrolledMap = {};
      dbList.forEach((u) => {
        const pName = (u.profile?.username || u.profile?.full_name || '').toLowerCase();
        if (pName) enrolledMap[pName] = u;
      });

      // Gộp defaultClassList
      defaultClassList.forEach((st, idx) => {
        const stName = (st.username || st.full_name || '').toLowerCase();
        if (stName && !enrolledMap[stName]) {
          enrolledMap[stName] = {
            id: 'enrol_def_' + idx,
            course_id: courseId,
            user_id: st.id,
            role: 'student',
            status: 'active',
            enrolled_at: new Date().toISOString(),
            profile: st,
          };
        }
      });

      // Gộp savedCsvStudents
      savedCsvStudents.forEach((st, idx) => {
        const stName = (st.username || st.full_name || '').toLowerCase();
        if (stName && !enrolledMap[stName]) {
          enrolledMap[stName] = {
            id: 'enrol_csv_' + idx,
            course_id: courseId,
            user_id: st.id,
            role: 'student',
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
      defaultClassList.forEach((st) => {
        map[st.username.toLowerCase()] = st;
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

  if (!isOpen) return null;

  // GHI DANH HÀNG LOẠT HỌC SINH ĐƯỢC CHỌN VÀO KHÓA HỌC (ENROL USERS)
  const handleEnrolSelectedUsers = async () => {
    if (selectedUserIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 học sinh để ghi danh vào khóa học!');
      return;
    }
    setEnrolling(true);

    try {
      const newEntries = selectedUserIds.map((uid) => ({
        course_id: courseId,
        user_id: uid,
        role: 'student',
        status: 'active',
      }));

      await supabase.from('course_enrollments').upsert(newEntries);
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

      await supabase.from('course_enrollments').upsert(newEntries, { onConflict: 'course_id,user_id' });
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
      await supabase.from('course_enrollments').delete().eq('id', enrollmentId);
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

  const alphabet = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const filteredEnrolledUsers = users.filter((u) => {
    const p = u.profile || {};
    const name = (p.full_name || p.username || '').toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || (p.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (letterFilter === 'All') return matchesSearch;
    return matchesSearch && name.toUpperCase().startsWith(letterFilter);
  });

  const enrolledUserIdsSet = new Set(users.map((u) => u.user_id));
  const availableStudentsToEnrol = allStudentsList.filter((s) => !enrolledUserIdsSet.has(s.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in font-sans select-none">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
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
                <button
                  type="button"
                  onClick={handleEnrolAllSchoolStudents}
                  disabled={enrolling}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 border border-emerald-400/40 cursor-pointer animate-pulse"
                  title="Đưa toàn bộ 34 em học sinh vừa tạo vào khóa học này"
                >
                  <UserPlus className="w-4 h-4 text-amber-300" />
                  <span>🚀 GHI DANH TẤT CẢ {allStudentsList.length} HỌC SINH VÀO KHÓA HỌC NÀY</span>
                </button>

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

        {/* BỘ LỌC TÌM KIẾM & CHỮ CÁI A-Z NGUYÊN BẢN CHUẨN MOODLE */}
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

            <div className="text-xs font-bold text-slate-600">
              Hiển thị: <strong className="text-emerald-700">{filteredEnrolledUsers.length}</strong> / {users.length} học sinh
            </div>
          </div>

          {/* LỌC THEO TÊN A-Z NGUYÊN BẢN MOODLE */}
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

        {/* CONTENT BODY BẢNG DANH SÁCH PARTICIPANTS CHUẨN MOODLE (ẢNH 4) */}
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
                    <th className="p-3">First name / Last name</th>
                    <th className="p-3">Email address</th>
                    <th className="p-3">Roles</th>
                    <th className="p-3">Status</th>
                    {isTeacher && <th className="p-3 text-right">Thao tác</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredEnrolledUsers.map((u) => {
                    const p = u.profile || {};
                    const name = p.full_name || p.username || 'Học viên';
                    const email = p.email || `${p.username}@lms.edu.vn`;
                    const roleName = u.role === 'teacher' ? 'Teacher' : 'Student';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-extrabold text-slate-900 flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs">
                            {name[0].toUpperCase()}
                          </div>
                          <span>{name}</span>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{email}</td>
                        <td className="p-3 font-bold text-slate-800">{roleName}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-md text-[10px] uppercase">
                            Active
                          </span>
                        </td>
                        {isTeacher && (
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveUser(u.id, name)}
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                              title="Xóa khỏi khóa học"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
              Đánh dấu tích chọn các học sinh dưới đây và bấm nút <strong className="text-blue-700">"Enrol selected users"</strong> để nạp các em vào khóa học này:
            </p>

            <div className="border border-slate-200 rounded-2xl max-h-64 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
              {availableStudentsToEnrol.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 font-bold">
                  Tất cả học sinh trong trường đã được thêm vào khóa học này!
                </div>
              ) : (
                availableStudentsToEnrol.map((st) => {
                  const isChecked = selectedUserIds.includes(st.id);
                  return (
                    <div
                      key={st.id}
                      onClick={() => toggleSelectUser(st.id)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition ${
                        isChecked ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs block">{st.full_name || st.username}</span>
                          <span className="text-[11px] text-slate-500 font-mono">@{st.username} • {st.email}</span>
                        </div>
                      </div>

                      {isChecked && <CheckCircle className="w-4 h-4 text-blue-600" />}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-bold text-slate-600">
                Đã chọn: <strong className="text-blue-700">{selectedUserIds.length}</strong> học sinh
              </span>

              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEnrolPopupOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleEnrolSelectedUsers}
                  disabled={enrolling || selectedUserIds.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition"
                >
                  {enrolling ? 'Đang Ghi Danh...' : `🚀 Enrol selected users (${selectedUserIds.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
