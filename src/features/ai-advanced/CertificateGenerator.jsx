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

      <div className="p-8 bg-gradient-to-br from-amber-500/10 via-amber-100/40 to-amber-50 border-4 border-double border-amber-400/80 rounded-3xl text-center space-y-4 relative overflow-hidden shadow-inner select-none">
        {/* CHỨC NĂNG 3: WATERMARK CHÈN CHÌM CHỐNG LÀM GIẢ */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none transform -rotate-12">
          <span className="text-4xl sm:text-5xl font-black uppercase text-amber-900 tracking-widest border-4 border-amber-900 px-6 py-2 rounded-2xl">
            BẢN QUYỀN CHÍNH THỨC • THẦY NGUYỄN VĂN HẢI
          </span>
        </div>

        <div className="w-16 h-16 mx-auto bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-lg font-extrabold text-2xl relative z-10">
          👑
        </div>

        <div className="relative z-10">
          <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest block">
            GIẤY CHỨNG NHẬN / BẰNG KHEN HOÀN THÀNH KHÓA HỌC
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {studentName}
          </h2>
        </div>

        <p className="text-xs text-slate-600 font-semibold max-w-md mx-auto leading-relaxed relative z-10">
          Đã xuất sắc hoàn thành 100% chương trình học tập và đạt kết quả cao trong khóa học: <strong className="text-slate-900">{courseTitle}</strong>.
        </p>

        {/* DẤU MỘC ĐỎ / VÀNG CHỮ KÝ ĐIỆN TỬ GIÁO VIÊN */}
        <div className="flex justify-around items-end pt-4 border-t border-amber-300/50 max-w-md mx-auto relative z-10">
          <div className="text-left text-[10px] text-slate-500 font-extrabold">
            <span>Mã bằng: STDH-2026-X89</span>
            <br />
            <span>Ngày cấp: {new Date().toLocaleDateString('vi-VN')}</span>
          </div>

          <div className="text-center relative">
            {/* CON DẤU MỘC VÀNG THỦY ẤN */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-600 flex items-center justify-center text-[9px] font-black text-amber-800 uppercase rotate-6 bg-amber-200/50 mx-auto shadow-xs">
              <span className="leading-tight">
                ★ CHỨNG NHẬN ★<br />THẦY HẢI<br />LMS TIẾNG ANH
              </span>
            </div>
            <span className="text-xs font-extrabold text-slate-900 block mt-1">
              Giáo viên phụ trách: Nguyễn Văn Hải
            </span>
          </div>
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
