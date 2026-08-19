import React, { useState } from 'react';
import { Award, Download, Sparkles } from 'lucide-react';

export default function CertificateGenerator({ studentName = 'Nguyễn Minh Hoàng', courseTitle = 'Tiếng Anh 9 - Global Success' }) {
  const [issued, setIssued] = useState(false);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 font-sans select-none">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>ADV-07: GIẤY CHỨNG NHẬN HỌC SINH (CERTIFICATE)</span>
        </h3>

        <button
          onClick={() => setIssued(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
        >
          <Sparkles className="w-4 h-4" />
          <span>🚀 Xuất Giấy Chứng Nhận</span>
        </button>
      </div>

      {/* KHUNG GIẤY CHỨNG NHẬN NHỎ GỌN VỪA VẶN IN A4 (ẢNH 1) */}
      <div className="max-w-xl mx-auto p-6 bg-gradient-to-br from-amber-500/10 via-amber-50 to-amber-100/30 border-4 border-double border-amber-400 rounded-3xl text-center space-y-3 relative overflow-hidden shadow-sm">
        
        {/* LOGO TRÒN TRUNG TÂM HOA MAI (ẢNH 1) */}
        <div className="w-16 h-16 mx-auto bg-amber-500 text-slate-950 rounded-full border-2 border-amber-300 flex flex-col items-center justify-center shadow-md leading-none p-1">
          <span className="text-[9px] font-black tracking-tighter uppercase text-slate-950">TRUNG TÂM</span>
          <span className="text-xs font-black uppercase text-amber-950 mt-0.5">HOA MAI</span>
        </div>

        {/* TIÊU ĐỀ: CHỈ GIỮ TỪ GIẤY CHỨNG NHẬN */}
        <div>
          <h1 className="text-lg font-black text-amber-900 tracking-widest uppercase">
            GIẤY CHỨNG NHẬN
          </h1>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            {studentName}
          </h2>
        </div>

        <p className="text-xs text-slate-700 font-semibold max-w-sm mx-auto leading-relaxed">
          Đã xuất sắc đạt thành tích học tập cao trong chương trình môn học: <strong className="text-slate-900">{courseTitle}</strong>.
        </p>

        {/* DẤU MỘC VÀNG CHÍNH THỨC (ẢNH 1) */}
        <div className="flex justify-between items-end pt-3 border-t border-amber-300/60 max-w-sm mx-auto text-left">
          <div className="text-[10px] text-slate-500 font-extrabold space-y-0.5">
            <div>Mã số: HM-2026-X89</div>
            <div>Ngày cấp: {new Date().toLocaleDateString('vi-VN')}</div>
          </div>

          <div className="text-center relative">
            {/* CON DẤU MỘC VÀNG DỊU MẮT */}
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-600 flex items-center justify-center text-[8px] font-black text-amber-900 uppercase rotate-6 bg-amber-200/70 mx-auto shadow-2xs">
              <span className="leading-tight text-center">
                ★ CHỨNG NHẬN ★<br />THẦY HẢI<br />LMS TIẾNG ANH
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-slate-900 block mt-1">
              GV: Nguyễn Văn Hải
            </span>
          </div>
        </div>
      </div>

      {issued && (
        <div className="flex justify-end pt-1">
          <button
            onClick={() => alert('Đã tải xuống file Giấy Chứng Nhận PDF vừa vặn khổ A4!')}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Tải Xuất Giấy Chứng Nhận (A4 PDF)</span>
          </button>
        </div>
      )}
    </div>
  );
}
