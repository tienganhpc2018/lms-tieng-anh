import React from 'react';
import { UserCheck, Phone, Mail, CreditCard, DollarSign, Award, Calendar } from 'lucide-react';
import { formatVND } from './AttendanceGridTab';

export default function TeachersTab({ teachers = [] }) {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>ĐỘI NGŨ GIÁO VIÊN & BÁO CÁO THÙ LAO</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tính thù lao giảng dạy tự động dựa trên số ca dạy thực tế trong tháng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teachers.map((t) => {
          const totalPay = (t.sessionsThisMonth || 0) * (t.ratePerSession || 150000);
          return (
            <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">{t.name}</h4>
                  <div className="text-xs text-emerald-700 font-semibold mt-0.5">{t.subject}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-black flex items-center justify-center text-sm">
                  👨‍🏫
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-[11px]">{t.bankInfo}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Số ca dạy tháng này:</span>
                  <span className="font-black text-slate-800">{t.sessionsThisMonth} ca</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Đơn giá / ca:</span>
                  <span className="font-bold text-slate-700">{formatVND(t.ratePerSession)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="font-black text-emerald-950 uppercase text-[11px]">Thù lao dự kiến:</span>
                  <span className="font-black text-emerald-700 text-sm">{formatVND(totalPay)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
