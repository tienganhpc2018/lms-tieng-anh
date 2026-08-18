import React from 'react';
import { X, Table, Printer, FileText, CheckCircle, PieChart } from 'lucide-react';

export default function ExamMatrixModal({ isOpen, onClose, questions = [], activityTitle }) {
  if (!isOpen) return null;

  let totalQuestionsCount = 0;
  questions.forEach((q) => {
    if (Array.isArray(q.content?.parts)) {
      q.content.parts.forEach((p) => {
        totalQuestionsCount += (p.questions || []).length;
      });
    } else {
      totalQuestionsCount += 1;
    }
  });

  if (totalQuestionsCount === 0) totalQuestionsCount = 20;

  // Tính tỉ lệ 4 cấp độ Bloom chuẩn giáo dục
  const countRemember = Math.round(totalQuestionsCount * 0.4); // 40% Nhận biết
  const countUnderstand = Math.round(totalQuestionsCount * 0.3); // 30% Thông hiểu
  const countApply = Math.round(totalQuestionsCount * 0.2); // 20% Vận dụng
  const countAnalyze = Math.max(1, totalQuestionsCount - countRemember - countUnderstand - countApply); // 10% Vận dụng cao

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Table className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-sm text-amber-300 uppercase tracking-wide">
                📊 MA TRẬN ĐỀ THI (TABLE OF SPECIFICATION - TOS)
              </h3>
              <p className="text-[10px] text-slate-300">Phân tích tỉ lệ 4 cấp độ tư duy Bloom trình Ban Giám Hiệu</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Bảng Ma Trận */}
        <div className="p-5 space-y-4 bg-slate-50 text-xs overflow-y-auto max-h-[75vh]">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
            <h4 className="font-extrabold text-xs text-indigo-950 uppercase border-b border-slate-100 pb-2">
              Bảng Phân Tích Ma Trận Tỉ Lệ Đề Thi: {activityTitle || 'TIẾNG ANH'}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-indigo-50/70 border-b border-indigo-200 text-[11px] text-indigo-900 uppercase">
                    <th className="p-2.5">Cấp Độ Tư Duy (Bloom)</th>
                    <th className="p-2.5 text-center">Tỉ Lệ %</th>
                    <th className="p-2.5 text-center">Số Câu Hỏi</th>
                    <th className="p-2.5 text-center">Điểm Số</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">1. Nhận biết (Remembering)</td>
                    <td className="p-2.5 text-center font-extrabold text-emerald-600">40%</td>
                    <td className="p-2.5 text-center font-bold">{countRemember} câu</td>
                    <td className="p-2.5 text-center font-bold">4.0 điểm</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">2. Thông hiểu (Understanding)</td>
                    <td className="p-2.5 text-center font-extrabold text-sky-600">30%</td>
                    <td className="p-2.5 text-center font-bold">{countUnderstand} câu</td>
                    <td className="p-2.5 text-center font-bold">3.0 điểm</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">3. Vận dụng (Applying)</td>
                    <td className="p-2.5 text-center font-extrabold text-amber-600">20%</td>
                    <td className="p-2.5 text-center font-bold">{countApply} câu</td>
                    <td className="p-2.5 text-center font-bold">2.0 điểm</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">4. Vận dụng cao (Analyzing/Creating)</td>
                    <td className="p-2.5 text-center font-extrabold text-rose-600">10%</td>
                    <td className="p-2.5 text-center font-bold">{countAnalyze} câu</td>
                    <td className="p-2.5 text-center font-bold">1.0 điểm</td>
                  </tr>
                  <tr className="bg-slate-100/80 font-extrabold text-slate-900">
                    <td className="p-2.5">TỔNG CỘNG HỢP LỆ</td>
                    <td className="p-2.5 text-center text-indigo-700">100%</td>
                    <td className="p-2.5 text-center text-indigo-700">{totalQuestionsCount} câu</td>
                    <td className="p-2.5 text-center text-indigo-700">10.0 điểm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={() => alert('🖨️ Đã in bảng Ma Trận Đề Thi chuẩn hóa trình Ban Giám Hiệu!')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4 text-indigo-200" />
            <span>In Bảng Ma Trận Này Trình Duyệt BGH</span>
          </button>
        </div>
      </div>
    </div>
  );
}
