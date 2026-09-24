import React, { useRef } from 'react';
import { Sparkles, UserPlus, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { calculateTBM, classifyGrade, calculateClassStatistics } from '../utils/gradeCalculations';
import { generateSingleStudentComment } from '../utils/aiCommentGenerator';
import { playClick, playCorrect } from '../../../utils/soundEffects';
import { getStudentAvatarPreset } from '../../home/studentAvatarHelper';

export default function AssessmentTable({
  students = [],
  evaluationsMap = {},
  txCount = 4,
  subject = 'Tiếng Anh',
  semester = 'HKI',
  isCompactView = false,
  onUpdateGrade,
  onUpdateComment,
  onOpenQuickAddStudents,
  onEditStudent,
}) {
  const inputRefs = useRef({});

  // 1. KIỂM TRA MÀN HÌNH TRỐNG KHI LỚP CHƯA CÓ HỌC SINH (CLEAN SLATE PRINCIPLE)
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center shadow-xs">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 bg-teal-50 text-teal-700 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-inner border border-teal-200/80">
            📋
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-black text-slate-900">
              Lớp Học Chưa Có Danh Sách Học Sinh
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Để đảm bảo nguyên tắc <strong>Không Dùng Dữ Liệu Mẫu Giả Mạo</strong>, Thầy/Cô vui lòng dán danh sách học sinh thực tế của lớp để bắt đầu tính điểm và đánh giá.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenQuickAddStudents}
              className="px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <UserPlus className="w-5 h-5" />
              <span>+ DÁN DANH SÁCH HỌC SINH VÀO LỚP</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Danh sách các cột điểm có thể nhập bằng bàn phím
  // ['tx1', 'tx2', ..., 'gk', 'ck']
  const gradeColumns = [];
  for (let i = 1; i <= txCount; i++) {
    gradeColumns.push(`tx${i}`);
  }
  gradeColumns.push('gk', 'ck');

  // Xử lý điều hướng bàn phím kiểu Excel (ArrowDown, Enter, ArrowUp)
  const handleKeyDown = (e, rowIndex, colIndex) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextRow = rowIndex + 1;
      const targetRef = inputRefs.current[`${nextRow}_${colIndex}`];
      if (targetRef) {
        targetRef.focus();
        targetRef.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevRow = rowIndex - 1;
      const targetRef = inputRefs.current[`${prevRow}_${colIndex}`];
      if (targetRef) {
        targetRef.focus();
        targetRef.select();
      }
    }
  };

  // Sinh nhận xét AI nhanh cho 1 học sinh
  const handleGenerateSingleComment = (student, tbm, index) => {
    playCorrect();
    const comment = generateSingleStudentComment({
      tbm,
      studentName: student.full_name || student.name || '',
      subject,
      style: 'standard',
      seed: index + Date.now(),
    });
    onUpdateComment(student.id, comment);
  };

  // Thống kê tổng hợp ở chân bảng
  const stats = calculateClassStatistics(students, evaluationsMap, txCount);

  // Kích thước ô đệm theo chế độ Compact
  const paddingClass = isCompactView ? 'py-1.5 px-2' : 'py-2.5 px-3';
  const inputClass = isCompactView ? 'py-1 px-1.5 text-xs' : 'py-1.5 px-2 text-sm';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden select-text">
      {/* KHUNG BẢNG ĐIỂM CHUẨN THÔNG TƯ 22 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1020px]">
          {/* HEADER BẢNG ĐIỂM (TÔNG MÀU XANH MÒNG KÉT TEAL ĐẬM #0f766e) */}
          <thead className="bg-[#0f766e] text-white uppercase text-[11px] font-black tracking-wider">
            <tr>
              <th className="p-3 text-center w-12 border-r border-teal-700/60" rowSpan="2">
                STT
              </th>
              <th className="p-3 min-w-[240px] sm:min-w-[260px] border-r border-teal-700/60" rowSpan="2">
                Họ và Tên Học Sinh
              </th>
              <th
                className="p-2.5 text-center border-b border-r border-teal-700/60 bg-teal-800/90"
                colSpan={txCount}
              >
                ĐĐG Thường Xuyên (TX - Hệ số 1)
              </th>
              <th className="p-2.5 text-center w-20 border-r border-teal-700/60" rowSpan="2">
                ĐĐG GK
                <span className="block text-[9px] font-medium opacity-80 lowercase">(hệ số 2)</span>
              </th>
              <th className="p-2.5 text-center w-20 border-r border-teal-700/60" rowSpan="2">
                ĐĐG CK
                <span className="block text-[9px] font-medium opacity-80 lowercase">(hệ số 3)</span>
              </th>
              <th className="p-2.5 text-center w-16 border-r border-teal-700/60" rowSpan="2">
                TBM
              </th>
              <th className="p-2.5 text-center w-24 border-r border-teal-700/60" rowSpan="2">
                Xếp Loại
              </th>
              <th className="p-3 min-w-[280px]" rowSpan="2">
                Nhận Xét Của Giáo Viên ({semester})
              </th>
            </tr>
            <tr className="bg-teal-900/60 text-center text-[10px]">
              {Array.from({ length: txCount }).map((_, i) => (
                <th key={i} className="p-1.5 w-14 border-r border-teal-700/50">
                  TX{i + 1}
                </th>
              ))}
            </tr>
          </thead>

          {/* DỮ LIỆU ĐIỂM CỦA HỌC SINH */}
          <tbody className="divide-y divide-slate-200 text-xs font-medium text-slate-800">
            {students.map((student, rowIndex) => {
              const studentGrades = evaluationsMap[student.id] || {};
              const tbm = calculateTBM(studentGrades, txCount);
              const classification = classifyGrade(tbm);
              const avatarUrl = getStudentAvatarPreset(student, rowIndex);

              return (
                <tr
                  key={student.id}
                  className="hover:bg-teal-50/40 transition-colors group"
                >
                  {/* STT */}
                  <td className={`${paddingClass} text-center font-bold text-slate-400 border-r border-slate-100`}>
                    {rowIndex + 1}
                  </td>

                  {/* Họ và tên + Avatar + Nút Sửa */}
                  <td className={`${paddingClass} min-w-[240px] sm:min-w-[260px] border-r border-slate-100`}>
                    <div
                      onClick={() => onEditStudent && onEditStudent(student)}
                      title="Bấm để sửa Giới tính hoặc Thay ảnh Avatar từ máy tính"
                      className="flex items-center space-x-2.5 cursor-pointer group/name p-1 -m-1 rounded-xl hover:bg-teal-100/50 transition"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={avatarUrl}
                          alt=""
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-emerald-400 shrink-0 shadow-2xs group-hover/name:scale-105 transition"
                          onError={(e) => {
                            e.currentTarget.src = '/images/avatars/student_male_1.jpg';
                          }}
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white text-[8px] flex items-center justify-center font-bold text-white shadow-2xs ${
                            student.gender === 'Nam' ? 'bg-blue-600' : 'bg-pink-600'
                          }`}
                        >
                          {student.gender === 'Nam' ? '♂' : '♀'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="font-black text-slate-900 group-hover/name:text-teal-900 transition whitespace-nowrap text-xs sm:text-[13px]">
                            {student.full_name || student.name}
                          </span>
                          <span className="opacity-0 group-hover/name:opacity-100 text-[10px] text-teal-700 bg-white px-1 py-0.2 rounded border border-teal-300 font-bold transition">
                            ✏️ Sửa
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {student.id ? `ID: ${String(student.id).slice(-4)}` : ''} •{' '}
                          <span className={student.gender === 'Nam' ? 'text-blue-600 font-bold' : 'text-pink-600 font-bold'}>
                            {student.gender || 'Nam'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Các cột điểm thường xuyên TX1..TXn */}
                  {Array.from({ length: txCount }).map((_, colI) => {
                    const colKey = `tx${colI + 1}`;
                    const globalColIndex = colI;
                    const val = studentGrades[colKey] !== undefined && studentGrades[colKey] !== null
                      ? studentGrades[colKey]
                      : '';

                    return (
                      <td key={colKey} className={`${paddingClass} text-center border-r border-slate-100 p-1`}>
                        <input
                          type="text"
                          inputMode="decimal"
                          ref={(el) => {
                            inputRefs.current[`${rowIndex}_${globalColIndex}`] = el;
                          }}
                          value={val}
                          onChange={(e) => onUpdateGrade(student.id, colKey, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, globalColIndex)}
                          className={`w-full text-center font-black rounded-lg border border-transparent hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 outline-none transition ${inputClass} ${
                            val !== '' ? 'text-slate-900 bg-slate-50/60' : 'bg-transparent text-slate-400'
                          }`}
                          placeholder="-"
                        />
                      </td>
                    );
                  })}

                  {/* Cột ĐĐG Giữa Kỳ (GK) */}
                  <td className={`${paddingClass} text-center border-r border-slate-100 p-1 bg-teal-50/20`}>
                    <input
                      type="text"
                      inputMode="decimal"
                      ref={(el) => {
                        inputRefs.current[`${rowIndex}_${txCount}`] = el;
                      }}
                      value={studentGrades.gk !== undefined && studentGrades.gk !== null ? studentGrades.gk : ''}
                      onChange={(e) => onUpdateGrade(student.id, 'gk', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, txCount)}
                      className={`w-full text-center font-black rounded-lg border border-transparent hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 outline-none transition text-teal-900 bg-teal-50/50 ${inputClass}`}
                      placeholder="-"
                    />
                  </td>

                  {/* Cột ĐĐG Cuối Kỳ (CK) */}
                  <td className={`${paddingClass} text-center border-r border-slate-100 p-1 bg-blue-50/20`}>
                    <input
                      type="text"
                      inputMode="decimal"
                      ref={(el) => {
                        inputRefs.current[`${rowIndex}_${txCount + 1}`] = el;
                      }}
                      value={studentGrades.ck !== undefined && studentGrades.ck !== null ? studentGrades.ck : ''}
                      onChange={(e) => onUpdateGrade(student.id, 'ck', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, txCount + 1)}
                      className={`w-full text-center font-black rounded-lg border border-transparent hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 outline-none transition text-blue-900 bg-blue-50/50 ${inputClass}`}
                      placeholder="-"
                    />
                  </td>

                  {/* Điểm Trung Bình Môn (TBM) Tự Động */}
                  <td className={`${paddingClass} text-center border-r border-slate-100 font-black text-sm`}>
                    {tbm !== null ? (
                      <span className={classification.textColor}>{tbm}</span>
                    ) : (
                      <span className="text-slate-300 font-normal">-</span>
                    )}
                  </td>

                  {/* Xếp Loại Học Lực Chuẩn TT22 */}
                  <td className={`${paddingClass} text-center border-r border-slate-100`}>
                    {tbm !== null ? (
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black border shadow-2xs ${classification.badgeColor}`}
                        title={classification.fullLabel}
                      >
                        {classification.label}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-[11px]">-</span>
                    )}
                  </td>

                  {/* Ô Nhập Nhận Xét & Nút "✨ AI" 1 Chạm */}
                  <td className={`${paddingClass} p-1.5`}>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        value={studentGrades.comment || ''}
                        onChange={(e) => onUpdateComment(student.id, e.target.value)}
                        placeholder="Nhập nhận xét hoặc bấm nút ✨ AI..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 outline-none text-xs text-slate-800 transition bg-slate-50/40"
                      />
                      <button
                        type="button"
                        onClick={() => handleGenerateSingleComment(student, tbm, rowIndex)}
                        title="AI tự sinh lời nhận xét chuẩn xác dựa trên điểm số em này"
                        className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-black transition flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                      >
                        <Sparkles className="w-3 h-3 text-amber-700" />
                        <span>✨ AI</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER THỐNG KÊ TỔNG KẾT THEO THÔNG TƯ 22 (SUMMARY FOOTER) */}
      <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Thống kê sĩ số */}
        <div className="flex items-center space-x-3 text-xs text-slate-700">
          <span className="font-bold">
            Sĩ số: <strong className="text-slate-950 font-black text-sm">{stats.total}</strong> học sinh
          </span>
          <span className="text-slate-300">|</span>
          <span>
            Đã có TBM:{' '}
            <strong className="text-teal-800 font-black">{stats.gradedCount}</strong>/{stats.total}
          </span>
          {stats.averageTbm !== null && (
            <>
              <span className="text-slate-300">|</span>
              <span>
                ĐTB Chung Cả Lớp: <strong className="text-teal-900 font-black text-sm">{stats.averageTbm}</strong>
              </span>
            </>
          )}
        </div>

        {/* Tỷ lệ phân loại học lực T, K, Đ, CĐ */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-1 text-xs">
          <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold flex items-center gap-1">
            <span>Tốt:</span>
            <strong>
              {stats.tot.count} ({stats.tot.percent}%)
            </strong>
          </span>

          <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 border border-blue-300 font-extrabold flex items-center gap-1">
            <span>Khá:</span>
            <strong>
              {stats.kha.count} ({stats.kha.percent}%)
            </strong>
          </span>

          <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 font-extrabold flex items-center gap-1">
            <span>Đạt:</span>
            <strong>
              {stats.dat.count} ({stats.dat.percent}%)
            </strong>
          </span>

          <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 font-extrabold flex items-center gap-1">
            <span>Chưa đạt:</span>
            <strong>
              {stats.chuaDat.count} ({stats.chuaDat.percent}%)
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
