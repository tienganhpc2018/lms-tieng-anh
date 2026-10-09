import React, { useState, useEffect } from 'react';
import { X, Users, Edit3, CheckSquare, AlertCircle, Sparkles, PlusCircle } from 'lucide-react';

export default function MarbleStudentSourceModal({
  isOpen,
  onClose,
  classes = [],
  currentClassId = null,
  onSelectClassStudents,
  onSaveManualStudents,
  currentStudents = [],
}) {
  const [activeTab, setActiveTab] = useState('lms'); // 'lms' | 'manual' | 'select'

  // State cho nhập thủ công
  const [manualText, setManualText] = useState('');
  const [manualParsedList, setManualParsedList] = useState([]);
  const [duplicateNames, setDuplicateNames] = useState([]);

  // State cho chọn nhóm
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Đổ danh sách học sinh hiện tại vào tab chọn nhóm
      setSelectedStudentIds(currentStudents.map((s) => s.id));

      // Đổ tên mẫu vào ô nhập thủ công nếu đang trống
      if (!manualText && currentStudents.length > 0) {
        setManualText(currentStudents.map((s) => s.full_name).join('\n'));
      }
    }
  }, [isOpen, currentStudents]);

  // Phân tích văn bản nhập thủ công
  const handleParseManualText = (text) => {
    setManualText(text);
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const nameCounts = {};
    const duplicates = [];

    lines.forEach((name) => {
      nameCounts[name] = (nameCounts[name] || 0) + 1;
      if (nameCounts[name] === 2) {
        duplicates.push(name);
      }
    });

    setManualParsedList(lines);
    setDuplicateNames(duplicates);
  };

  // Xác nhận lưu nhập thủ công
  const handleConfirmManual = () => {
    if (manualParsedList.length === 0) {
      alert('Vui lòng nhập ít nhất 1 tên học sinh!');
      return;
    }

    const newStudentObjects = manualParsedList.map((name, idx) => ({
      id: `manual_${Date.now()}_${idx}`,
      code: `HS${String(idx + 1).padStart(2, '0')}`,
      full_name: name,
      status: 'Present',
    }));

    onSaveManualStudents(newStudentObjects);
    onClose();
  };

  // Xác nhận chọn nhóm
  const handleConfirmGroupSelection = () => {
    const selectedList = currentStudents.filter((s) => selectedStudentIds.includes(s.id));
    if (selectedList.length === 0) {
      alert('Vui lòng chọn ít nhất 1 học sinh tham gia cuộc đua!');
      return;
    }
    onSaveManualStudents(selectedList);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER MODAL */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 text-xl">
              ⚙️
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                CẤU HÌNH DANH SÁCH THAM GIA BI LĂN
              </h3>
              <p className="text-xs font-semibold text-slate-400">
                Chọn nguồn danh sách học sinh cho cuộc đua viên bi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* THỜI GIAN VÀ TAB ĐỔI NGUỒN */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('lms')}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'lms'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Nguồn 1: Chọn lớp LMS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Nguồn 2: Nhập thủ công</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('select')}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'select'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Nguồn 3: Chọn nhóm</span>
          </button>
        </div>

        {/* NỘI DUNG TỪNG TAB */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: NGUỒN TỪ LỚP LMS */}
          {activeTab === 'lms' && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-300">
                Chọn lớp học trong danh sách của thầy/cô để lấy dữ liệu học sinh chính thức:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {classes.map((cls) => {
                  const isCurrent = cls.id === currentClassId;
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => {
                        onSelectClassStudents(cls.id);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'bg-purple-900/30 border-purple-500 text-white ring-2 ring-purple-500/40'
                          : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-black text-sm text-purple-300">
                          🏛️ Lớp {cls.name}
                        </div>
                        <div className="text-xs font-semibold text-slate-400 mt-1">
                          Khối {cls.grade_level || 'THCS'}
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="text-xs font-black px-2.5 py-1 bg-purple-500 text-white rounded-full">
                          Đang chọn
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: NHẬP THỦ CÔNG */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-black text-purple-300">
                  DÁN HOẶC NHẬP TÊN HỌC SINH (MỖI TÊN 1 DÒNG):
                </label>
                <textarea
                  rows={8}
                  value={manualText}
                  onChange={(e) => handleParseManualText(e.target.value)}
                  placeholder={`Nguyễn Văn A\nTrần Thị B\nLê Văn C\n...`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 font-mono leading-relaxed"
                />
              </div>

              {/* THỐNG KÊ & CẢNH BÁO TÊN TRÙNG */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span>Tổng số tên hợp lệ: <strong className="text-purple-400">{manualParsedList.length} HS</strong></span>
                {duplicateNames.length > 0 && (
                  <span className="text-amber-400 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Có {duplicateNames.length} tên trùng nhau</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleConfirmManual}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-xl transition cursor-pointer"
              >
                ✓ XÁC NHẬN SỬ DỤNG DANH SÁCH THỦ CÔNG
              </button>
            </div>
          )}

          {/* TAB 3: CHỌN NHÓM THAM GIA */}
          {activeTab === 'select' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Đánh dấu học sinh sẽ tham gia lượt chơi bi lăn:</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds(currentStudents.map((s) => s.id))}
                    className="text-purple-400 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds([])}
                    className="text-slate-400 hover:underline cursor-pointer"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
                {currentStudents.map((st) => {
                  const isChecked = selectedStudentIds.includes(st.id);
                  return (
                    <label
                      key={st.id}
                      className={`flex items-center space-x-2.5 p-2.5 rounded-xl border transition cursor-pointer text-xs font-bold ${
                        isChecked
                          ? 'bg-purple-900/40 border-purple-500 text-white'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds((prev) => [...prev, st.id]);
                          } else {
                            setSelectedStudentIds((prev) => prev.filter((id) => id !== st.id));
                          }
                        }}
                        className="rounded border-slate-600 text-purple-600 focus:ring-purple-500 w-4 h-4"
                      />
                      <span className="truncate">{st.full_name}</span>
                    </label>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleConfirmGroupSelection}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-xl transition cursor-pointer"
              >
                ✓ BẮT ĐẦU VỚI {selectedStudentIds.length} HỌC SINH ĐÃ CHỌN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
