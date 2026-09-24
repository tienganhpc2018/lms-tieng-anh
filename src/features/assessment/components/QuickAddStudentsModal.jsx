import React, { useState } from 'react';
import { X, UserPlus, Clipboard, Check, School } from 'lucide-react';
import { playClick, playCorrect } from '../../../utils/soundEffects';
import { parseStudentListText, saveStudents, saveClasses, loadClasses } from '../../behavior/behaviorStorage';

export default function QuickAddStudentsModal({
  isOpen,
  onClose,
  classId,
  className,
  onStudentsAdded,
}) {
  if (!isOpen) return null;

  const [rawText, setRawText] = useState('');
  const [newClassName, setNewClassName] = useState('7A6');

  const handleAdd = () => {
    if (!rawText.trim()) return;
    playCorrect();

    let targetClassId = classId;

    // Nếu hệ thống hoàn toàn chưa có lớp nào, tự tạo nhanh 1 lớp mới
    if (!targetClassId) {
      const existingClasses = loadClasses() || [];
      const newClassObj = {
        id: `class_${Date.now()}`,
        name: newClassName.trim().replace(/^lớp\s*/i, ''),
        school_year: '2026-2027',
        created_at: new Date().toISOString(),
      };
      existingClasses.push(newClassObj);
      saveClasses(existingClasses);
      targetClassId = newClassObj.id;
    }

    const parsed = parseStudentListText(rawText, 0);
    if (parsed.length > 0) {
      saveStudents(targetClassId, parsed);
      onStudentsAdded(targetClassId, parsed);
      onClose();
    }
  };

  const handleInsertSample = () => {
    playClick();
    const sample = `Nguyễn Văn An\nTrần Thị Bình\nLê Hoàng Cường\nPhạm Thị Dung\nĐặng Minh Đức\nVũ Thùy Linh\nBùi Quốc Nam\nHoàng Quỳnh Như`;
    setRawText(sample);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md text-xl">
              📝
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                Dán Danh Sách Học Sinh Thực Tế
              </h3>
              <p className="text-xs text-teal-200 font-semibold">
                Áp dụng cho {className || 'Lớp Mới'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!classId && (
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
                <School className="w-4 h-4 text-teal-600" />
                <span>Tên Lớp Học Mới:</span>
              </label>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="VD: 7A6"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm font-bold text-slate-800"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 uppercase">
                Danh Sách Họ Và Tên (Mỗi dòng 1 học sinh):
              </label>
              <button
                type="button"
                onClick={handleInsertSample}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
              >
                Điền mẫu nhanh
              </button>
            </div>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Copy từ file Excel hoặc Word dán vào đây:\n1. Nguyễn Văn An\n2. Trần Thị Bình\n3. Lê Hoàng Cường\n...`}
              className="w-full p-3.5 rounded-2xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-xs font-mono text-slate-800 bg-slate-50/50"
            />
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * Hệ thống tự động lọc bỏ số thứ tự ở đầu dòng, tự chuẩn hóa họ tên tiếng Việt và phân loại giới tính thông minh.
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!rawText.trim()}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Nạp Vào Bảng Điểm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
