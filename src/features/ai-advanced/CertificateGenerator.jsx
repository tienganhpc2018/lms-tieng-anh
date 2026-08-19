import React, { useState } from 'react';
import { Award, Download, CheckCircle2, Sparkles, User, Calendar } from 'lucide-react';

export default function CertificateGenerator({ studentName = 'Nguyễn Minh Hoàng', courseTitle = 'Tiếng Anh 9 - Global Success' }) {
  const [issued, setIssued] = useState(false);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 font-sans select-none">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>ADV-07: CẤP BẰNG KHEN / CHỨNG CHỈ TỰ ĐỘNG (PDF CERTIFICATE)</span>
        </h3>

        <button
          onClick={() => setIssued(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
        >
          <Sparkles className="w-4 h-4" />
          <span>🚀 Xuất Bằng Khen</span>
        </button>
      </div>

      <div className="p-8 bg-gradient-to-br from-amber-500/10 via-amber-100/40 to-amber-50 border-4 border-double border-amber-400/80 rounded-3xl text-center space-y-4 relative overflow-hidden shadow-inner">
        <div className="w-16 h-16 mx-auto bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-lg font-extrabold text-2xl">
          👑
        </div>

        <div>
          <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest block">
            GIẤY CHỨNG NHẬN / BẰNG KHEN HOÀN THÀNH KHÓA HỌC
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {studentName}
          </h2>
        </div>

        <p className="text-xs text-slate-600 font-semibold max-w-md mx-auto leading-relaxed">
          Đã xuất sắc hoàn thành 100% chương trình học tập và đạt kết quả cao trong khóa học: <strong className="text-slate-900">{courseTitle}</strong>.
        </p>

        <div className="flex justify-center space-x-8 text-[11px] font-extrabold text-slate-500 border-t border-amber-300/50 pt-3 max-w-xs mx-auto">
          <span>Mã bằng: STDH-2026-X89</span>
          <span>•</span>
          <span>Ngày cấp: {new Date().toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {issued && (
        <div className="flex justify-end pt-2">
          <button
            onClick={() => alert('Đã tải xuống file Bằng Khen PDF chất lượng cao!')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Tải Xuất Bằng Khen PDF</span>
          </button>
        </div>
      )}
    </div>
  );
}
