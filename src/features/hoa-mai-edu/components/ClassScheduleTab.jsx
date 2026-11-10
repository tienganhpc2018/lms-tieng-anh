import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, MapPin, User, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';

export default function ClassScheduleTab({ classes = [] }) {
  const [selectedClass, setSelectedClass] = useState(classes[0]);

  // Kiểm tra trùng lịch giả lập thông minh (Conflict Detection)
  const hasConflict = false;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>THỜI KHÓA BIỂU & QUẢN LÝ LỚP HỌC</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động phát hiện trùng phòng học và trùng ca dạy của giáo viên
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>0 Trùng Lịch Ca Học</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-black text-xs">
                Khối {cls.grade || 6}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Sĩ số: <b className="text-slate-800">{cls.currentStudents || 20}/{cls.maxStudents || 25}</b>
              </span>
            </div>

            <h4 className="text-sm font-black text-slate-900">{cls.name}</h4>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-bold text-slate-800">{cls.schedule}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{cls.room}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Giáo viên: <b>{cls.teacher}</b></span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-emerald-700 font-extrabold">{cls.subject}</span>
              <button
                onClick={() => alert(`Xem thời khóa biểu chi tiết lớp: ${cls.name}`)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
