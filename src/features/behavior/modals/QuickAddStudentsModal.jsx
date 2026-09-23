import React, { useState } from 'react';
import { X, UserPlus, FileText, Check } from 'lucide-react';
import { parseStudentListText } from '../behaviorStorage';
import { playClick, playCorrect } from '../../../utils/soundEffects';

export default function QuickAddStudentsModal({ isOpen, onClose, currentCount, onAddStudents }) {
  const [rawText, setRawText] = useState('');
  const [parsedList, setParsedList] = useState([]);

  if (!isOpen) return null;

  const handleTextChange = (e) => {
    const val = e.target.value;
    setRawText(val);
    const parsed = parseStudentListText(val, currentCount);
    setParsedList(parsed);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!parsedList.length) {
      alert('Vui lòng dán danh sách họ tên học sinh cần bổ sung!');
      return;
    }

    playCorrect();
    onAddStudents(parsedList);
    setRawText('');
    setParsedList([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-lg border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 my-auto max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Dán Bổ Sung Học Sinh</h3>
              <p className="text-xs text-slate-500 font-medium">
                Hiện có: {currentCount} HS • Mã tiếp theo: HS{String(currentCount + 1).padStart(2, '0')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 flex items-center space-x-1.5 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Dán danh sách bổ sung (mỗi bạn 1 dòng):</span>
            </label>
            <textarea
              rows={6}
              value={rawText}
              onChange={handleTextChange}
              placeholder={`Nguyễn Văn An\nTrần Thị Bích\nLê Hoàng Nam...`}
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden transition"
            />
            <span className="text-xs font-extrabold text-emerald-700 block text-right">
              Nhận diện: {parsedList.length} học sinh mới
            </span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                playClick();
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!parsedList.length}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Thêm {parsedList.length} Học Sinh</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
