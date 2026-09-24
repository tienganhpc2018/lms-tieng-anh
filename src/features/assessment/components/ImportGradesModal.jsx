import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Check, AlertCircle, Eye, HelpCircle } from 'lucide-react';
import { playClick, playCorrect } from '../../../utils/soundEffects';
import { parsePastedExcelGrades } from '../utils/assessmentStorage';

export default function ImportGradesModal({
  isOpen,
  onClose,
  students = [],
  txCount = 4,
  onApplyImportedGrades,
}) {
  if (!isOpen) return null;

  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [hasPreviewed, setHasPreviewed] = useState(false);

  const handlePreview = () => {
    playClick();
    if (!rawText.trim()) return;
    const parsed = parsePastedExcelGrades(rawText, txCount, students);
    setParsedRows(parsed);
    setHasPreviewed(true);
  };

  const handleApply = () => {
    if (parsedRows.length === 0) return;
    playCorrect();

    // Chuyển đổi parsedRows thành định dạng map cập nhật cho evaluationsMap
    const updates = {};
    parsedRows.forEach((row) => {
      if (row.studentId) {
        updates[row.studentId] = {
          tx1: row.tx1,
          tx2: row.tx2,
          tx3: row.tx3,
          tx4: row.tx4,
          tx5: row.tx5,
          gk: row.gk,
          ck: row.ck,
        };
      }
    });

    onApplyImportedGrades(updates);
    onClose();
  };

  const handleInsertSample = () => {
    playClick();
    // Tạo chuỗi mẫu dựa trên danh sách học sinh hiện tại
    const sampleLines = students.slice(0, 5).map((st, idx) => {
      const name = st.full_name || st.name;
      return `${idx + 1}\t${name}\t8.0\t8.5\t7.5\t8.0\t8.5\t9.0`;
    });
    setRawText(sampleLines.join('\n'));
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md text-xl">
              📥
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                <span>Nhập Điểm Từ Excel / vnEdu / SMAS</span>
              </h3>
              <p className="text-xs text-teal-200 font-semibold">
                Sao chép vùng bảng điểm từ Excel rồi dán trực tiếp vào bên dưới
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
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Hướng dẫn thao tác */}
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 text-xs text-teal-900 flex items-start justify-between gap-3">
            <div className="flex items-start space-x-2">
              <span className="text-base leading-none">📋</span>
              <div className="space-y-1">
                <p className="font-extrabold text-teal-950">Cách thực hiện:</p>
                <p className="leading-relaxed">
                  1. Mở file Excel hoặc phần mềm vnEdu / SMAS.
                  <br />
                  2. Chọn và copy (Ctrl+C) các cột: <strong>Họ tên, TX1, TX2, TX3, TX4, GK, CK</strong>.
                  <br />
                  3. Dán (Ctrl+V) vào ô bên dưới, hệ thống sẽ tự động đối chiếu họ tên và tách điểm theo cột.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleInsertSample}
              className="text-[11px] font-black text-teal-700 bg-white px-3 py-1.5 rounded-xl border border-teal-300 hover:bg-teal-100 transition shrink-0 cursor-pointer shadow-2xs"
            >
              Dán Dữ Liệu Mẫu Thử
            </button>
          </div>

          {/* Ô nhập Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase flex items-center justify-between">
              <span>Vùng Dán Dữ Liệu:</span>
              <span className="text-slate-400 font-normal">Tự động nhận diện dấu Tab, dấu phẩy</span>
            </label>
            <textarea
              rows={hasPreviewed ? 4 : 7}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setHasPreviewed(false);
              }}
              placeholder={`Ví dụ dữ liệu từ Excel:\nNguyễn Văn An\t8.0\t8.5\t9.0\t8.0\t8.5\t9.0\nTrần Thị Bình\t7.0\t7.5\t8.0\t7.5\t8.0\t8.5`}
              className="w-full p-3.5 rounded-2xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-xs font-mono text-slate-800 bg-slate-50/50 resize-y"
            />
          </div>

          {/* Nút Xem Trước */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handlePreview}
              disabled={!rawText.trim()}
              className="px-4 py-2 rounded-xl text-xs font-black text-teal-800 bg-teal-100 hover:bg-teal-200 border border-teal-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem Trước Dữ Liệu Nhận Diện ({parsedRows.length > 0 ? parsedRows.length : 'Chưa quét'})</span>
            </button>
          </div>

          {/* Bảng Xem Trước (Preview Table) */}
          {hasPreviewed && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                  <span>Kết Quả Đối Chiếu ({parsedRows.length} dòng):</span>
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Khớp với lớp:{' '}
                  <strong className="text-teal-700">
                    {parsedRows.filter((r) => r.matched).length}/{parsedRows.length}
                  </strong>{' '}
                  học sinh
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2 text-center w-10">STT</th>
                      <th className="p-2">Học Sinh Nhận Diện</th>
                      <th className="p-2 text-center">Trạng Thái</th>
                      {Array.from({ length: txCount }).map((_, i) => (
                        <th key={i} className="p-2 text-center">
                          TX{i + 1}
                        </th>
                      ))}
                      <th className="p-2 text-center">GK</th>
                      <th className="p-2 text-center">CK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.matched ? 'hover:bg-teal-50/40' : 'bg-rose-50/50'}>
                        <td className="p-2 text-center text-slate-500 font-bold">{idx + 1}</td>
                        <td className="p-2 font-bold text-slate-900">{row.studentName}</td>
                        <td className="p-2 text-center">
                          {row.matched ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              ✓ Khớp lớp
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                              Chưa khớp
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-center font-bold text-slate-700">{row.tx1 ?? '-'}</td>
                        <td className="p-2 text-center font-bold text-slate-700">{row.tx2 ?? '-'}</td>
                        {txCount >= 3 && (
                          <td className="p-2 text-center font-bold text-slate-700">{row.tx3 ?? '-'}</td>
                        )}
                        {txCount >= 4 && (
                          <td className="p-2 text-center font-bold text-slate-700">{row.tx4 ?? '-'}</td>
                        )}
                        {txCount >= 5 && (
                          <td className="p-2 text-center font-bold text-slate-700">{row.tx5 ?? '-'}</td>
                        )}
                        <td className="p-2 text-center font-bold text-teal-800 bg-teal-50/50">
                          {row.gk ?? '-'}
                        </td>
                        <td className="p-2 text-center font-bold text-blue-800 bg-blue-50/50">
                          {row.ck ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={parsedRows.length === 0}
            className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Áp Dụng Vào Bảng Điểm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
