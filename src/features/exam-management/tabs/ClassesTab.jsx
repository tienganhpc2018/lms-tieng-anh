import React, { useState, useEffect, useRef } from 'react';
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
  Award,
  ClipboardList,
  Upload,
  FileText
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

  // Modal State: Thêm học sinh đơn lẻ
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [studentGender, setStudentGender] = useState('Nam');
  const [studentGpa, setStudentGpa] = useState('8.5');
  const [studentAttendance, setStudentAttendance] = useState('100%');

  // Modal State: Nhập hàng loạt (CSV / Dán tên)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState('paste'); // 'paste' | 'csv'
  const [pasteText, setPasteText] = useState('');
  const fileInputRef = useRef(null);

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

  // Mở modal thêm 1 học sinh
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

  // Xử lý thêm 1 học sinh mới vào lớp
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

  // Bóc tách danh sách từ dán văn bản (Mỗi dòng 1 tên hoặc Tên, Giới tính)
  const parsePastedNames = (text) => {
    if (!text || !text.trim()) return [];
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    return lines.map((line, idx) => {
      // Loại bỏ số thứ tự ở đầu dòng nếu có (vd: "1. Nguyễn Văn A" hoặc "1 - Nguyễn Văn A")
      const cleaned = line.replace(/^\d+[\.\-\,\s]\s*/, '').trim();
      const parts = cleaned.split(/[,;\t]/).map((p) => p.trim());
      const name = parts[0] || cleaned;
      const gender = parts[1] && ['Nữ', 'Nu', 'Female', 'F'].includes(parts[1]) ? 'Nữ' : 'Nam';
      return { name, gender };
    }).filter((item) => item.name.length > 0);
  };

  const recognizedPastedStudents = parsePastedNames(pasteText);

  // Xử lý nạp hàng loạt từ Dán danh sách
  const handleConfirmPasteBulk = () => {
    if (recognizedPastedStudents.length === 0) {
      alert('Vui lòng dán danh sách tên học sinh trước khi nhấn xác nhận!');
      return;
    }

    let startNum = classStudents.length + 1;
    const newStudentsList = recognizedPastedStudents.map((item, idx) => {
      const num = startNum + idx;
      const padNum = num < 10 ? `0${num}` : `${num}`;
      return {
        id: `hs_${selectedClassId}_${Date.now()}_${idx}`,
        name: item.name,
        code: `HS${selectedClassId.toUpperCase()}${padNum}`,
        gender: item.gender,
        gpa: Math.round((Math.random() * 2 + 7.5) * 10) / 10,
        avg: Math.round((Math.random() * 2 + 7.5) * 10) / 10,
        attendance: '100%',
        progress: Math.floor(Math.random() * 20 + 80),
        classId: selectedClassId.toLowerCase(),
        status: 'active'
      };
    });

    const nextStudents = [...students, ...newStudentsList];
    setStudents(nextStudents);

    // Cập nhật sĩ số lớp
    setClasses((prev) =>
      prev.map((c) =>
        c.id.toLowerCase() === selectedClassId.toLowerCase()
          ? { ...c, studentCount: (c.studentCount || 0) + newStudentsList.length }
          : c
      )
    );

    setIsBulkModalOpen(false);
    setPasteText('');
    showNotify(`Đã thêm thành công ${newStudentsList.length} học sinh vào ${currentClass.name}!`);
  };

  // Xử lý nạp từ file CSV / Text
  const handleUploadCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setPasteText(content);
        setBulkMode('paste');
        showNotify(`Đã đọc nội dung file ${file.name}, xem trước bên dưới và bấm xác nhận!`);
      }
    };
    reader.readAsText(file);
  };

  // Xóa 1 học sinh
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
          {/* Nút Nhập Hàng Loạt (CSV / Dán tên HS) */}
          <button
            onClick={() => {
              setPasteText('');
              setIsBulkModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-black transition flex items-center space-x-1.5 shadow-2xs"
            title="Thêm danh sách học sinh hàng loạt từ CSV hoặc dán tên trực tiếp"
          >
            <ClipboardList className="w-4 h-4 text-indigo-600" />
            <span>📋 Nhập hàng loạt (CSV / Dán tên)</span>
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
              onClick={() => {
                setPasteText('');
                setIsBulkModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold transition flex items-center space-x-1 shrink-0"
              title="Dán nhanh danh sách tên học sinh vào lớp"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Dán danh sách</span>
            </button>

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
                    Chưa có học sinh nào trong lớp này. Thầy hãy bấm "+ Thêm Học Sinh" hoặc "📋 Nhập hàng loạt" để nạp danh sách học sinh!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL 1: NHẬP HÀNG LOẠT (DÁN DANH SÁCH HOẶC TẢI CSV)
      ======================================================== */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                  <span>Nhập Học Sinh Hàng Loạt Vào {currentClass.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dán nhanh danh sách từ Word, Excel, Zalo hoặc tải lên file CSV/TXT
                </p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chế độ chọn */}
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={() => setBulkMode('paste')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  bulkMode === 'paste'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                1. Dán văn bản tên học sinh
              </button>
              <button
                type="button"
                onClick={() => setBulkMode('csv')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  bulkMode === 'csv'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                2. Tải lên file CSV / Excel (.csv)
              </button>
            </div>

            {/* Nội dung dán danh sách */}
            {bulkMode === 'paste' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    Dán danh sách học sinh vào ô bên dưới (mỗi học sinh 1 dòng):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPasteText(
                        `Nguyễn Hoàng Long, Nam\nTrần Thị Mai Anh, Nữ\nLê Tuấn Kiệt, Nam\nPhạm Ngọc Ánh, Nữ\nĐỗ Minh Triết, Nam\nHoàng Thảo My, Nữ`
                      );
                    }}
                    className="text-indigo-600 hover:underline font-bold"
                  >
                    Dán danh sách mẫu
                  </button>
                </div>

                <textarea
                  rows={7}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`Ví dụ:\nNguyễn Văn An\nTrần Thị Bích, Nữ\nLê Hoàng Long, Nam\nPhạm Thu Hà`}
                  className="w-full p-3 rounded-xl border border-slate-300 font-sans text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                ></textarea>

                {/* Preview số lượng học sinh nhận diện */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-700">Kết quả nhận diện: </span>
                    <span className="font-black text-indigo-700 text-sm">
                      {recognizedPastedStudents.length} học sinh
                    </span>
                  </div>
                  {recognizedPastedStudents.length > 0 && (
                    <span className="text-[11px] text-slate-500">
                      Mã HS tự sinh: HS{selectedClassId.toUpperCase()}{classStudents.length + 1} - HS{selectedClassId.toUpperCase()}{classStudents.length + recognizedPastedStudents.length}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* Nội dung tải file CSV */
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 transition text-center space-y-3 bg-slate-50/50">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto text-xl">
                  📁
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">Chọn file CSV hoặc TXT danh sách lớp</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hỗ trợ file danh sách xuất từ SMAS, VNEDU hoặc Excel lưu dưới dạng .csv
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadCSV}
                  accept=".csv,.txt"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
                >
                  Chọn file từ máy tính
                </button>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmPasteBulk}
                disabled={recognizedPastedStudents.length === 0}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md hover:shadow-lg transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Xác nhận thêm {recognizedPastedStudents.length} học sinh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: THÊM LỚP HỌC MỚI
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
          MODAL 3: THÊM 1 HỌC SINH VÀO LỚP ĐANG CHỌN
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
