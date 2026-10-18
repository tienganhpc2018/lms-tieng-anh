import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  UserPlus,
  GraduationCap,
  Sparkles,
  School,
  X,
  Award
} from 'lucide-react';
import { DEFAULT_CLASSES, DEFAULT_STUDENTS_8A1 } from '../examStorage';

const CLASSES_STORAGE_KEY = 'tienganh8_classes_v2';
const STUDENTS_STORAGE_KEY = 'tienganh8_students_v2';

export default function ClassesTab() {
  // 1. Quản lý danh sách lớp học bền vững
  const [classes, setClasses] = useState(() => {
    try {
      const saved = localStorage.getItem(CLASSES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    // Chuẩn hóa danh sách lớp ban đầu
    return DEFAULT_CLASSES.map((c) => ({
      id: c.id.toLowerCase(),
      name: c.name || `Lớp ${c.id.toUpperCase()}`,
      grade: c.grade || 'Khối 8',
      studentCount: c.count || c.studentCount || 35,
      year: c.year || '2025-2026',
      room: c.room || 'P. Ngoại Ngữ 1'
    }));
  });

  const [selectedClassId, setSelectedClassId] = useState(() => {
    return classes[0]?.id || '8a1';
  });

  // 2. Quản lý danh sách học sinh theo lớp
  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem(STUDENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    // Chuẩn hóa học sinh mẫu ban đầu
    return DEFAULT_STUDENTS_8A1.map((s) => ({
      ...s,
      classId: (s.classId || '8a1').toLowerCase(),
      gpa: s.avg || s.gpa || 8.5
    }));
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');

  // Modal State: Tạo lớp
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('Khối 8');
  const [newClassYear, setNewClassYear] = useState('2025-2026');
  const [newClassRoom, setNewClassRoom] = useState('P. Ngoại Ngữ 2');
  const [newClassCount, setNewClassCount] = useState(35);

  // Modal State: Thêm học sinh
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [studentGender, setStudentGender] = useState('Nam');
  const [studentGpa, setStudentGpa] = useState('8.5');
  const [studentAttendance, setStudentAttendance] = useState('100%');

  // Lưu classes vào localStorage khi thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
    } catch (e) {}
  }, [classes]);

  // Lưu students vào localStorage khi thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    } catch (e) {}
  }, [students]);

  const currentClass =
    classes.find((c) => c.id.toLowerCase() === selectedClassId.toLowerCase()) || classes[0] || {};

  // Lọc học sinh theo lớp đang chọn và từ khóa tìm kiếm
  const classStudents = students.filter(
    (s) => (s.classId || '').toLowerCase() === selectedClassId.toLowerCase()
  );

  const filteredStudents = classStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showNotify = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(''), 3500);
  };

  // Xử lý tạo lớp học mới
  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const formattedId = newClassName.trim().toLowerCase().replace(/\s+/g, '');
    if (classes.some((c) => c.id.toLowerCase() === formattedId)) {
      alert('Lớp học này đã tồn tại trong danh sách!');
      return;
    }

    const createdClass = {
      id: formattedId,
      name: newClassName.trim().startsWith('Lớp') ? newClassName.trim() : `Lớp ${newClassName.trim().toUpperCase()}`,
      grade: newClassGrade,
      studentCount: Number(newClassCount) || 35,
      room: newClassRoom || 'P. Ngoại Ngữ 1',
      year: newClassYear || '2025-2026'
    };

    const nextClasses = [...classes, createdClass];
    setClasses(nextClasses);
    setSelectedClassId(createdClass.id);
    setIsAddClassModalOpen(false);
    setNewClassName('');
    showNotify(`Đã tạo thành công ${createdClass.name} (${createdClass.year})!`);
  };

  // Xử lý xóa lớp học
  const handleDeleteClass = (classId, className) => {
    if (classes.length <= 1) {
      alert('Cần giữ lại ít nhất 1 lớp học trong hệ thống!');
      return;
    }
    if (window.confirm(`Thầy có chắc chắn muốn xóa ${className} khỏi hệ thống không?`)) {
      const nextClasses = classes.filter((c) => c.id !== classId);
      setClasses(nextClasses);
      setSelectedClassId(nextClasses[0].id);
      showNotify(`Đã xóa ${className}!`);
    }
  };

  // Mở modal thêm học sinh với mã học sinh tự sinh
  const handleOpenAddStudent = () => {
    const nextNum = classStudents.length + 1;
    const padNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    const autoCode = `HS${selectedClassId.toUpperCase()}${padNum}`;
    setStudentCode(autoCode);
    setStudentName('');
    setStudentGender('Nam');
    setStudentGpa('8.5');
    setStudentAttendance('100%');
    setIsAddStudentModalOpen(true);
  };

  // Xử lý thêm học sinh mới vào lớp đang chọn
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    const newStudent = {
      id: `hs_${selectedClassId}_${Date.now()}`,
      name: studentName.trim(),
      code: studentCode.trim() || `HS${Date.now().toString().slice(-4)}`,
      gender: studentGender,
      gpa: Number(studentGpa) || 8.0,
      avg: Number(studentGpa) || 8.0,
      attendance: studentAttendance || '100%',
      progress: Math.floor(Math.random() * 20 + 80),
      classId: selectedClassId.toLowerCase(),
      status: 'active'
    };

    const nextStudents = [...students, newStudent];
    setStudents(nextStudents);

    // Cập nhật sĩ số lớp học tương ứng
    setClasses((prev) =>
      prev.map((c) =>
        c.id.toLowerCase() === selectedClassId.toLowerCase()
          ? { ...c, studentCount: (c.studentCount || 0) + 1 }
          : c
      )
    );

    setIsAddStudentModalOpen(false);
    showNotify(`Đã thêm học sinh ${newStudent.name} (${newStudent.code}) vào ${currentClass.name}!`);
  };

  // Xử lý xóa học sinh
  const handleDeleteStudent = (studentId, studentNameToDelete) => {
    if (window.confirm(`Thầy có chắc muốn xóa học sinh "${studentNameToDelete}" khỏi lớp ${currentClass.name}?`)) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setClasses((prev) =>
        prev.map((c) =>
          c.id.toLowerCase() === selectedClassId.toLowerCase()
            ? { ...c, studentCount: Math.max(0, (c.studentCount || 1) - 1) }
            : c
        )
      );
      showNotify(`Đã xóa học sinh ${studentNameToDelete}!`);
    }
  };

  // Import Excel nhanh giả lập
  const handleImportExcel = () => {
    const importList = [
      {
        id: `hs_${selectedClassId}_${Date.now()}_1`,
        name: 'Đỗ Hoàng Quân',
        code: `HS${selectedClassId.toUpperCase()}${classStudents.length + 1}`,
        gender: 'Nam',
        gpa: 8.4,
        avg: 8.4,
        attendance: '98%',
        progress: 88,
        classId: selectedClassId.toLowerCase(),
        status: 'active'
      },
      {
        id: `hs_${selectedClassId}_${Date.now()}_2`,
        name: 'Vũ Thảo Vy',
        code: `HS${selectedClassId.toUpperCase()}${classStudents.length + 2}`,
        gender: 'Nữ',
        gpa: 9.3,
        avg: 9.3,
        attendance: '100%',
        progress: 96,
        classId: selectedClassId.toLowerCase(),
        status: 'active'
      }
    ];

    setStudents([...students, ...importList]);
    setClasses((prev) =>
      prev.map((c) =>
        c.id.toLowerCase() === selectedClassId.toLowerCase()
          ? { ...c, studentCount: (c.studentCount || 0) + importList.length }
          : c
      )
    );
    showNotify(`Đã import thành công ${importList.length} học sinh mới vào ${currentClass.name}!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Chọn lớp & Action buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              🏫
            </span>
            <h2 className="text-lg font-black text-slate-800">Quản Lý Lớp Học & Học Sinh Khối 8</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Năm học 2025 - 2026 • Chương trình GDPT 2018 (Tiếng Anh 8 Global Success)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleImportExcel}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
            title="Nhập danh sách học sinh từ file Excel hoặc CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={handleOpenAddStudent}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            title="Thêm học sinh mới vào lớp đang chọn"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Thêm Học Sinh</span>
          </button>

          <button
            onClick={() => setIsAddClassModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            title="Tạo lớp học mới"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Lớp Mới</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Grid: Danh sách các lớp (Thẻ bấm chuyển lớp trực quan) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {classes.map((cls) => {
          const isSelected = cls.id.toLowerCase() === selectedClassId.toLowerCase();
          const studentCountNumber = cls.studentCount || cls.count || 0;
          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between relative group ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                  {cls.year || '2025-2026'}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{cls.name}</h3>
                <div className="text-xs text-slate-600 mt-1 font-semibold">
                  <span className="font-extrabold text-emerald-800">{studentCountNumber}</span> học sinh • {cls.room || 'P. Ngoại Ngữ 1'}
                </div>
              </div>

              {/* Nút xóa lớp (hiện khi hover trên thẻ không chọn) */}
              {classes.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClass(cls.id, cls.name);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Xóa lớp học này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Danh sách học sinh của lớp đang chọn */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
              👨‍🎓
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm sm:text-base">
                Danh sách học sinh — {currentClass.name}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Sĩ số: <b className="text-emerald-700 font-bold">{classStudents.length} học sinh</b> • Giáo viên phụ trách: Thầy Nguyễn Văn Hải
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc mã định danh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-300 text-xs w-full sm:w-60 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleOpenAddStudent}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center space-x-1 shrink-0 shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Thêm HS</span>
            </button>
          </div>
        </div>

        {/* Table danh sách học sinh */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Mã HS</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Giới tính</th>
                <th className="py-3 px-4">Tiến độ bài học</th>
                <th className="py-3 px-4 text-center">ĐTB Kiểm tra</th>
                <th className="py-3 px-4 text-center">Chuyên cần</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st, idx) => (
                  <tr key={st.id || idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{st.code || st.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 text-sm block">{st.name}</span>
                      {st.name.includes('Minh Hằng') && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          ⭐ Tài khoản HS thử nghiệm
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{st.gender || 'Nam'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-2 rounded-full"
                            style={{ width: `${st.progress || 85}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-600">{st.progress || 85}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700 text-sm">
                      {st.gpa || st.avg || 8.0}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 font-semibold">
                      {st.attendance || '100%'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Đang học
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteStudent(st.id, st.name)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Xóa học sinh này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Chưa có học sinh nào trong lớp này. Thầy hãy bấm "+ Thêm Học Sinh" để nhập học sinh vào lớp!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL 1: THÊM LỚP HỌC MỚI
      ======================================================== */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-black text-slate-800 text-base flex items-center space-x-2">
                <School className="w-5 h-5 text-emerald-600" />
                <span>Tạo Lớp Học Mới</span>
              </h3>
              <button
                onClick={() => setIsAddClassModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên lớp học:</label>
                <input
                  type="text"
                  placeholder="VD: 8A5 hoặc 9A"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp:</label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Khối 6">Khối 6</option>
                    <option value="Khối 7">Khối 7</option>
                    <option value="Khối 8">Khối 8</option>
                    <option value="Khối 9">Khối 9</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Năm học:</label>
                  <input
                    type="text"
                    value={newClassYear}
                    onChange={(e) => setNewClassYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sĩ số dự kiến:</label>
                  <input
                    type="number"
                    value={newClassCount}
                    onChange={(e) => setNewClassCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phòng học:</label>
                  <input
                    type="text"
                    value={newClassRoom}
                    onChange={(e) => setNewClassRoom(e.target.value)}
                    placeholder="VD: P. Ngoại Ngữ 2"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Xác nhận tạo lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: THÊM HỌC SINH VÀO LỚP ĐANG CHỌN
      ======================================================== */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-black text-slate-800 text-base flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-teal-600" />
                  <span>Thêm Học Sinh Mới</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Thêm vào: <b className="text-teal-700">{currentClass.name}</b>
                </span>
              </div>
              <button
                onClick={() => setIsAddStudentModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh:</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Hoàng Long"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã định danh HS:</label>
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới tính:</label>
                  <select
                    value={studentGender}
                    onChange={(e) => setStudentGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Điểm TB ban đầu:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={studentGpa}
                    onChange={(e) => setStudentGpa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chuyên cần:</label>
                  <input
                    type="text"
                    value={studentAttendance}
                    onChange={(e) => setStudentAttendance(e.target.value)}
                    placeholder="VD: 100%"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-xs"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
