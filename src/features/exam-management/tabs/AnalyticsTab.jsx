import React, { useState } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Users, Award, Download, ArrowUpRight } from 'lucide-react';
import { loadClassesList } from '../examStorage';

export default function AnalyticsTab({ submissions = [] }) {
  const currentClasses = loadClassesList();
  const [selectedClass, setSelectedClass] = useState('ALL');

  // Phổ điểm mẫu dựa trên học sinh khối 8
  const scoreStats = {
    excellent: 38, // 8.0 - 10 (Giỏi)
    good: 55,      // 6.5 - 7.9 (Khá)
    average: 42,   // 5.0 - 6.4 (Trung bình)
    belowAvg: 11   // < 5.0 (Yếu)
  };
  const total = scoreStats.excellent + scoreStats.good + scoreStats.average + scoreStats.belowAvg;

  // Câu hỏi học sinh hay làm sai nhất
  const difficultQuestions = [
    {
      num: 'Question 11',
      part: 'Language Focus',
      prompt: 'Trọng âm từ có 2 âm tiết (câu danh từ vs động từ)',
      failRate: '68%',
      reason: 'Học sinh nhầm lẫn giữa danh từ "present" (/ˈprez.ənt/) và động từ "present" (/prɪˈzent/).'
    },
    {
      num: 'Question 21',
      part: 'Reading Cloze',
      prompt: 'Từ nối chỉ nguyên nhân kết quả (Although vs However)',
      failRate: '54%',
      reason: 'Quên vị trí dấu phẩy sau "However" và cấu trúc câu ghép.'
    },
    {
      num: 'Question 37',
      part: 'Writing Transformation',
      prompt: 'Viết lại câu dùng cấu trúc "fond of + V-ing"',
      failRate: '48%',
      reason: 'Quên chia động từ "is" hoặc viết thiếu giới từ "of".'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
              📊
            </span>
            <h2 className="text-lg font-black text-slate-800">Thống Kê & Phân Tích Kết Quả Kiểm Tra</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Báo cáo ma trận điểm số, phổ điểm thi đua và phân tích các câu hỏi học sinh hay mắc lỗi
          </p>
        </div>

        <button
          onClick={() => alert('Xuất báo cáo PDF / Excel thành công!')}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Xuất Báo Cáo Điểm</span>
        </button>
      </div>

      {/* Phổ Điểm 4 Mức Độ */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-slate-800 text-sm flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Phổ điểm toàn khối 8 (146 Học sinh)</span>
          </h3>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Điểm Trung Bình: 7.28
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
            <div className="text-[11px] font-bold text-emerald-800 uppercase">Loại Giỏi (8.0 - 10)</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{scoreStats.excellent} HS</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
              {Math.round((scoreStats.excellent / total) * 100)}% toàn khối
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
            <div className="text-[11px] font-bold text-blue-800 uppercase">Loại Khá (6.5 - 7.9)</div>
            <div className="text-2xl font-black text-blue-700 mt-1">{scoreStats.good} HS</div>
            <div className="text-[11px] text-blue-600 font-bold mt-0.5">
              {Math.round((scoreStats.good / total) * 100)}% toàn khối
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
            <div className="text-[11px] font-bold text-amber-800 uppercase">Trung Bình (5.0 - 6.4)</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{scoreStats.average} HS</div>
            <div className="text-[11px] text-amber-600 font-bold mt-0.5">
              {Math.round((scoreStats.average / total) * 100)}% toàn khối
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-center">
            <div className="text-[11px] font-bold text-rose-800 uppercase">Dưới TB (&lt; 5.0)</div>
            <div className="text-2xl font-black text-rose-700 mt-1">{scoreStats.belowAvg} HS</div>
            <div className="text-[11px] text-rose-600 font-bold mt-0.5">
              {Math.round((scoreStats.belowAvg / total) * 100)}% toàn khối
            </div>
          </div>
        </div>

        {/* Thanh Progress Bar trực quan */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100">
          <div style={{ width: `${(scoreStats.excellent / total) * 100}%` }} className="bg-emerald-500" title="Giỏi"></div>
          <div style={{ width: `${(scoreStats.good / total) * 100}%` }} className="bg-blue-500" title="Khá"></div>
          <div style={{ width: `${(scoreStats.average / total) * 100}%` }} className="bg-amber-400" title="Trung bình"></div>
          <div style={{ width: `${(scoreStats.belowAvg / total) * 100}%` }} className="bg-rose-500" title="Dưới TB"></div>
        </div>
      </div>

      {/* Grid: Xếp hạng lớp & Phân tích câu hỏi khó */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bảng Xếp Hạng Các Lớp (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-black text-slate-800 text-sm flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Bảng xếp hạng thi đua các lớp</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            {currentClasses.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                Chưa có lớp học nào trong hệ thống.
              </div>
            ) : (
              currentClasses.map((cls, idx) => {
                const gpaList = [7.85, 7.42, 7.15, 6.95, 7.6, 7.3];
                const gpa = gpaList[idx % gpaList.length];
                return (
                  <div key={cls.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-extrabold text-slate-900">{cls.name}</div>
                        <div className="text-[11px] text-slate-500">{cls.studentCount || cls.count || 0} Học sinh</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-700 text-sm">{gpa}đ</div>
                      <div className="text-[10px] text-slate-400">ĐTB lớp</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Phân Tích Câu Hỏi Khó Nhất (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-black text-slate-800 text-sm flex items-center space-x-2 pb-2 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Phân tích các câu hỏi học sinh sai nhiều nhất</span>
          </h3>

          <div className="space-y-3 text-xs">
            {difficultQuestions.map((q, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-rose-900">{q.num} • {q.part}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-black text-[10px]">
                    Tỉ lệ sai: {q.failRate}
                  </span>
                </div>
                <div className="font-semibold text-slate-800">{q.prompt}</div>
                <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-rose-100">
                  💡 <b>Thầy lưu ý sửa bài:</b> {q.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
