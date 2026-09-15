import React, { useState } from 'react';
import { X, School, Users, FileText, Check, ArrowRightLeft } from 'lucide-react';
import { parseStudentListText } from '../behaviorStorage';
import { playClick, playCorrect } from '../../../utils/soundEffects';

export default function AddClassModal4({ isOpen, onClose, onSaveClass }) {
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState(7);
  const [academicYear, setAcademicYear] = useState('2026 - 2027');
  const [rawText, setRawText] = useState('');
  const [parsedList, setParsedList] = useState([]);

  if (!isOpen) return null;

  const handleTextChange = (e) => {
    const val = e.target.value;
    setRawText(val);
    const parsed = parseStudentListText(val, 0);
    setParsedList(parsed);
  };

  const toggleGender = (index) => {
    playClick();
    const updated = [...parsedList];
    updated[index].gender = updated[index].gender === 'Nam' ? 'Nữ' : 'Nam';
    setParsedList(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên lớp (ví dụ: 7A6)!');
      return;
    }

    playCorrect();
    const newClass = {
      id: `class-${Date.now()}`,
      name: name.trim().toUpperCase(),
      full_name: `Lớp ${name.trim().toUpperCase()} - Khối ${gradeLevel}`,
      grade_level: Number(gradeLevel),
      academic_year: academicYear.trim(),
    };

    onSaveClass(newClass, parsedList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-lg">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Tạo Lớp Học Mới 4.0</h2>
              <p className="text-xs text-slate-500 font-semibold">
                Khởi tạo lớp sạch & dán danh sách học sinh từ Word/Excel
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSave} className="space-y-4 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                Tên Lớp (VD: 7A6) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="7A6"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-black text-sm text-slate-900 focus:bg-white focus:border-purple-600 outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                Khối Lớp
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 focus:bg-white focus:border-purple-600 outline-hidden transition cursor-pointer"
              >
                {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>
                    Khối {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                Năm Học
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026 - 2027"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 focus:bg-white focus:border-purple-600 outline-hidden transition"
              />
            </div>
          </div>

          {/* DÁN DANH SÁCH HỌC SINH */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 flex items-center space-x-1.5 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Dán Danh Sách Họ Tên Học Sinh (Từ Word / Excel):</span>
              </label>
              <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Đã nhận diện: {parsedList.length} HS
              </span>
            </div>

            <textarea
              rows={6}
              value={rawText}
              onChange={handleTextChange}
              placeholder={`Dán danh sách vào đây (mỗi học sinh 1 dòng). Hệ thống tự loại bỏ số thứ tự đầu dòng:\n1. Nguyễn Võ Khánh An\n2. Lê Thị Thanh Bình\n3. Ngô Thái An\n...`}
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-xs text-slate-900 focus:bg-white focus:border-purple-600 outline-hidden transition"
            />
            <p className="text-[11px] text-slate-500 font-medium">
              💡 <em>Mẹo:</em> Copy nguyên cột Họ và Tên trong Excel rồi dán thẳng vào ô trên. Thầy/Cô cũng có thể bỏ trống và dán bổ sung sau.
            </p>
          </div>

          {/* XEM TRƯỚC HỌC SINH ĐÃ PARSE */}
          {parsedList.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Xem Trước & Kiểm Tra Giới Tính:
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  (Bấm vào nhãn Nam/Nữ để đảo nhanh)
                </span>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                {parsedList.slice(0, 50).map((st, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 px-2 hover:bg-white rounded-lg transition"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-slate-400 w-8">{st.code}</span>
                      <span className="font-bold text-slate-900">{st.full_name}</span>
                      <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                        Tổ {st.team_group}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleGender(idx)}
                      className={`px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center space-x-1 cursor-pointer transition ${
                        st.gender === 'Nam'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                      }`}
                    >
                      <span>{st.gender}</span>
                      <ArrowRightLeft className="w-3 h-3 opacity-60" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                playClick();
                onClose();
              }}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg transition cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Lưu & Bắt Đầu Quản Lý Lớp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
