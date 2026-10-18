import React, { useState } from 'react';
import { Users, Plus, Upload, Search, Edit2, Trash2, CheckCircle, Award, FileSpreadsheet, Download } from 'lucide-react';
import { DEFAULT_CLASSES, DEFAULT_STUDENTS_8A1 } from '../examStorage';

export default function ClassesTab() {
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [selectedClassId, setSelectedClassId] = useState('8A1');
  const [students, setStudents] = useState(DEFAULT_STUDENTS_8A1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassCount, setNewClassCount] = useState(35);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const newClass = {
      id: newClassName.trim().toUpperCase().replace(/\s+/g, ''),
      name: `Lớp ${newClassName.trim().toUpperCase()}`,
      studentCount: Number(newClassCount) || 35,
      room: 'P. Ngoại Ngữ 2',
      year: '2024 - 2025'
    };
    setClasses([...classes, newClass]);
    setSelectedClassId(newClass.id);
    setIsAddClassModalOpen(false);
    setNewClassName('');
  };

  const handleImportExcel = () => {
    // Giả lập nhập Excel nhanh
    setImportSuccessMsg(`Đã import thành công 5 học sinh mới vào danh sách ${currentClass.name}!`);
    const mockNewStudents = [
      { id: 'HS8-009', name: 'Đỗ Hoàng Quân', progress: 80, gpa: 8.4, attendance: '98%', status: 'active' },
      { id: 'HS8-010', name: 'Vũ Thảo Vy', progress: 95, gpa: 9.3, attendance: '100%', status: 'active' }
    ];
    setStudents([...students, ...mockNewStudents]);
    setTimeout(() => setImportSuccessMsg(''), 4000);
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
            Năm học 2024 - 2025 • Chương trình GDPT 2018 (Tiếng Anh 8 Global Success)
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleImportExcel}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
            title="Nhập danh sách học sinh từ file Excel hoặc CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={() => setIsAddClassModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Lớp Mới</span>
          </button>
        </div>
      </div>

      {importSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{importSuccessMsg}</span>
        </div>
      )}

      {/* Grid: Danh sách các lớp (Thẻ bấm chuyển lớp) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {classes.map((cls) => {
          const isSelected = cls.id === selectedClassId;
          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                  {cls.year || '2024-2025'}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{cls.name}</h3>
                <div className="text-xs text-slate-600 mt-0.5 font-medium">
                  {cls.studentCount} học sinh • {cls.room}
                </div>
              </div>
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
                Sĩ số: {currentClass.studentCount} học sinh • Giáo viên chủ nhiệm & bộ môn: Thầy Nguyễn Văn Hải
              </span>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã định danh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-300 text-xs w-full sm:w-64 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Table danh sách */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Mã HS</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Tiến độ bài học</th>
                <th className="py-3 px-4 text-center">ĐTB Kiểm tra</th>
                <th className="py-3 px-4 text-center">Chuyên cần</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.map((st, idx) => (
                <tr key={st.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">{st.id}</td>
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-slate-900 text-sm block">{st.name}</span>
                    {st.name.includes('Minh Hằng') && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        ⭐ Tài khoản HS thử nghiệm
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${st.progress}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-600">{st.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700 text-sm">
                    {st.gpa}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 font-semibold">
                    {st.attendance}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Đang học
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Lớp Mới */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-black text-slate-800 text-base mb-3">Thêm Lớp Học Mới</h3>
            <form onSubmit={handleAddClass} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tên lớp:</label>
                <input
                  type="text"
                  placeholder="VD: 8A5"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Sĩ số học sinh:</label>
                <input
                  type="number"
                  value={newClassCount}
                  onChange={(e) => setNewClassCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                >
                  Thêm Lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
