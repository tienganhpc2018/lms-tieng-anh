import React, { useState } from 'react';
import { 
  Users, Search, Filter, Phone, MessageSquare, Plus, 
  Trash2, Edit, FileText, Upload, Sparkles, Check 
} from 'lucide-react';
import { STUDENT_TAG_COLORS } from '../hoaMaiSeedData';

export default function StudentsManagerTab({
  trackingSheets = [],
  onUpdateSheet
}) {
  const [selectedSheetId, setSelectedSheetId] = useState(trackingSheets[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [batchText, setBatchText] = useState('');

  const currentSheet = trackingSheets.find((s) => s.id === selectedSheetId) || trackingSheets[0];

  // Lọc học sinh
  const filteredStudents = (currentSheet?.students || []).filter((st) =>
    st.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.phone?.includes(searchQuery)
  );

  // Xử lý nạp hàng loạt (Batch import từ danh sách copy Excel)
  const handleBatchImport = (e) => {
    e.preventDefault();
    if (!batchText.trim()) return;

    const lines = batchText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const newStudents = lines.map((line, idx) => {
      // Hỗ trợ định dạng "Họ và tên [tab hoặc phẩy] SĐT" hoặc chỉ "Họ và tên"
      const parts = line.split(/[\t,;]+/);
      const name = parts[0]?.trim() || line;
      const phone = parts[1]?.trim() || `0912${Math.floor(100000 + Math.random() * 900000)}`;

      const initialAtt = {};
      currentSheet.sessions.forEach((s) => {
        initialAtt[s.id] = true;
      });

      return {
        id: `hs-batch-${Date.now()}-${idx}`,
        name,
        phone,
        tagColor: 'default',
        attendance: initialAtt,
        isPaid: false
      };
    });

    onUpdateSheet({
      ...currentSheet,
      students: [...currentSheet.students, ...newStudents]
    });

    setBatchText('');
    setIsBatchImportOpen(false);
    alert(`Đã thêm thành công ${newStudents.length} học sinh vào ${currentSheet.className}!`);
  };

  return (
    <div className="space-y-4">
      {/* 1. THANH CHỌN LỚP & TÌM KIẾM */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học sinh, số điện thoại phụ huynh..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedSheetId}
            onChange={(e) => setSelectedSheetId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            {trackingSheets.map((sh) => (
              <option key={sh.id} value={sh.id}>
                {sh.className} ({sh.students.length} HS)
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsBatchImportOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-2xs transition flex items-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Nhập Hàng Loạt (Excel Copy)</span>
          </button>
        </div>
      </div>

      {/* 2. BẢNG DANH SÁCH HỌC SINH */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center w-10">STT</th>
                <th className="py-3 px-3">Họ Và Tên</th>
                <th className="py-3 px-3">Phân Loại Nhãn</th>
                <th className="py-3 px-3">Trường Học</th>
                <th className="py-3 px-3">SĐT Phụ Huynh</th>
                <th className="py-3 px-3 text-center">Liên Hệ Trực Tiếp</th>
                <th className="py-3 px-3 text-center">Trạng Thái HP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st, idx) => {
                const tag = STUDENT_TAG_COLORS[st.tagColor || 'default'] || STUDENT_TAG_COLORS.default;
                return (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{st.name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${tag.bg} ${tag.text} ${tag.border}`}>
                        {tag.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {st.school || 'THCS Bắc Giang'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                      {st.phone || '0988.xxx.xxx'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Nút Gọi */}
                        <a
                          href={`tel:${st.phone}`}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                          title="Gọi điện cho phụ huynh"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        {/* Nút Chat Zalo */}
                        <a
                          href={`https://zalo.me/${st.phone?.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg font-bold text-[10px] transition flex items-center space-x-1"
                          title="Nhắn tin Zalo phụ huynh"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Zalo</span>
                        </a>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        st.isPaid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {st.isPaid ? '✓ Đã nộp' : '⏳ Chưa nộp'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL BATCH IMPORT HỌC SINH */}
      {isBatchImportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-900 mb-2 flex items-center space-x-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              <span>Nhập Học Sinh Hàng Loạt (Batch Import)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Copy danh sách họ tên từ cột file Excel hoặc Notepad rồi dán vào ô bên dưới (mỗi học sinh một dòng). Hệ thống sẽ tự động bóc tách và nạp vào lớp <b>{currentSheet.className}</b>.
            </p>

            <form onSubmit={handleBatchImport} className="space-y-3 text-xs">
              <textarea
                rows={8}
                required
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder={`Diệu Linh\t0912345601\nEm Thoại\t0912345602\nTrúc Lâm\t0912345603\nNgọc Diệp\nMỹ Tình\nHồng Ánh`}
                className="w-full p-3 font-mono border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
              />

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBatchImportOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-xs"
                >
                  Xác Nhận Nạp Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
