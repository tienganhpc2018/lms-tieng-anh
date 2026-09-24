/**
 * assessmentStorage.js
 * Quản lý lưu trữ LocalStorage, cấu hình, nhập / xuất Excel chuẩn Thông tư 22
 */

import { calculateTBM, classifyGrade, parseGrade } from './gradeCalculations';

export const ASSESSMENT_CONFIG_KEY = 'subject_evaluations_config';
export const DEFAULT_CONFIG = {
  schoolName: 'TRƯỜNG THCS CÁT MINH',
  academicYear: '2026-2027',
  txCount: 4, // 2, 3, 4 hoặc 5 cột điểm thường xuyên
  defaultSubject: 'Tiếng Anh',
  defaultSemester: 'HKI',
};

export const SUBJECT_OPTIONS = [
  'Tiếng Anh',
  'Ngữ Văn',
  'Toán',
  'Khoa Học Tự Nhiên',
  'Lịch Sử & Địa Lý',
  'Giáo Dục Công Dân',
  'Tin Học',
  'Công Nghệ',
  'Nghệ Thuật (Âm Nhạc - Mỹ Thuật)',
  'Giáo Dục Thể Chất',
  'Hoạt Động Trải Nghiệm - Hướng Nghiệp',
];

export const SEMESTER_OPTIONS = [
  { id: 'HKI', label: 'Học Kỳ I' },
  { id: 'HKII', label: 'Học Kỳ II' },
  { id: 'CN', label: 'Cả Năm' },
];

/**
 * Tải cấu hình sổ điểm
 */
export const loadAssessmentConfig = () => {
  try {
    const raw = localStorage.getItem(ASSESSMENT_CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Lỗi tải cấu hình sổ điểm:', e);
    return DEFAULT_CONFIG;
  }
};

/**
 * Lưu cấu hình sổ điểm
 */
export const saveAssessmentConfig = (config) => {
  try {
    localStorage.setItem(ASSESSMENT_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Lỗi lưu cấu hình sổ điểm:', e);
  }
};

/**
 * Tạo khóa lưu trữ cho bảng điểm cụ thể
 */
export const getEvaluationStorageKey = (classId, subject, semester) => {
  const safeClass = classId || 'noclass';
  const safeSub = (subject || 'tienganh').replace(/\s+/g, '_').toLowerCase();
  const safeSem = semester || 'HKI';
  return `subject_evaluations_${safeClass}_${safeSub}_${safeSem}`;
};

/**
 * Tải dữ liệu bảng điểm của một lớp, môn và học kỳ
 * @returns {Object} Map { [studentId]: { tx1, tx2, ..., gk, ck, comment, tbm } }
 */
export const loadEvaluations = (classId, subject, semester) => {
  if (!classId) return {};
  try {
    const key = getEvaluationStorageKey(classId, subject, semester);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Lỗi đọc bảng điểm:', e);
    return {};
  }
};

/**
 * Lưu dữ liệu bảng điểm của một lớp, môn và học kỳ
 */
export const saveEvaluations = (classId, subject, semester, data) => {
  if (!classId) return;
  try {
    const key = getEvaluationStorageKey(classId, subject, semester);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Lỗi lưu bảng điểm:', e);
  }
};

/**
 * Phân tích dữ liệu bảng điểm sao chép từ Excel / vnEdu / SMAS dán vào Textarea
 * Hỗ trợ nhận diện các cột phân tách bằng phím Tab hoặc dấu phẩy
 *
 * @param {string} rawText Văn bản dán từ Excel
 * @param {number} txCount Số cột TX
 * @param {Array} currentStudents Danh sách học sinh hiện tại của lớp
 * @returns {Array} Mảng các dòng dữ liệu nhận diện được [{ name, tx1, tx2, ..., gk, ck, studentId, matchScore }]
 */
export const parsePastedExcelGrades = (rawText, txCount = 4, currentStudents = []) => {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results = [];

  // Tạo map tên học sinh để ghép nối thông minh
  const studentMap = {};
  currentStudents.forEach((st) => {
    const cleanName = (st.full_name || st.name || '').trim().toLowerCase();
    studentMap[cleanName] = st;
  });

  lines.forEach((line, lineIndex) => {
    // Tách cột bằng Tab (\t) nếu có, nếu không thì tách dấu phẩy hoặc dấu chấm phẩy
    let cells = [];
    if (line.includes('\t')) {
      cells = line.split('\t').map((c) => c.trim());
    } else if (line.includes(';')) {
      cells = line.split(';').map((c) => c.trim());
    } else {
      cells = line.split(',').map((c) => c.trim());
    }

    // Bỏ qua dòng tiêu đề nếu chứa chữ "Họ và tên", "STT", "ĐĐG"
    const joinedLine = cells.join(' ').toLowerCase();
    if (
      joinedLine.includes('họ và tên') ||
      joinedLine.includes('tên học sinh') ||
      (joinedLine.includes('stt') && joinedLine.includes('tx'))
    ) {
      return;
    }

    // Tìm ô chứa tên học sinh (ô có chữ và không thuần là số)
    let studentName = '';
    let scoreCells = [];

    cells.forEach((cell) => {
      // Kiểm tra xem cell có phải là số điểm không (0 - 10)
      const parsedNum = parseGrade(cell);
      const isPureNumber = /^[0-9]+([.,][0-9]+)?$/.test(cell);

      if (isPureNumber && parsedNum !== null) {
        scoreCells.push(parsedNum);
      } else if (cell.length > 1 && !/^[0-9]+$/.test(cell) && !studentName) {
        // Tên học sinh thường là chuỗi chữ cái
        studentName = cell;
      }
    });

    // Nếu không tìm thấy tên riêng trong cell, thử ghép với học sinh theo STT thứ tự dòng
    let matchedStudent = null;
    if (studentName) {
      matchedStudent = studentMap[studentName.toLowerCase()] || null;
      if (!matchedStudent) {
        // Thử tìm theo họ tên gần đúng
        const found = currentStudents.find((st) => {
          const fn = (st.full_name || st.name || '').toLowerCase();
          return fn.includes(studentName.toLowerCase()) || studentName.toLowerCase().includes(fn);
        });
        if (found) matchedStudent = found;
      }
    }

    if (!matchedStudent && currentStudents[lineIndex]) {
      matchedStudent = currentStudents[lineIndex];
      if (!studentName) studentName = matchedStudent.full_name || matchedStudent.name;
    }

    // Đổ các điểm vào các cột TX1..TXn, GK, CK
    const gradeObj = {
      lineIndex,
      studentName: studentName || matchedStudent?.full_name || `Học sinh ${lineIndex + 1}`,
      studentId: matchedStudent?.id || null,
      matched: Boolean(matchedStudent),
      tx1: scoreCells[0] !== undefined ? scoreCells[0] : null,
      tx2: scoreCells[1] !== undefined ? scoreCells[1] : null,
      tx3: scoreCells[2] !== undefined ? scoreCells[2] : null,
      tx4: scoreCells[3] !== undefined ? scoreCells[3] : null,
      tx5: scoreCells[4] !== undefined ? scoreCells[4] : null,
      gk: scoreCells[txCount] !== undefined ? scoreCells[txCount] : null,
      ck: scoreCells[txCount + 1] !== undefined ? scoreCells[txCount + 1] : null,
    };

    results.push(gradeObj);
  });

  return results;
};

/**
 * Xuất bảng điểm ra file CSV UTF-8 BOM chuẩn Thông tư 22 (mở bằng Excel trên Windows hiển thị tiếng Việt hoàn hảo)
 */
export const exportEvaluationsToCSV = ({
  students = [],
  evaluationsMap = {},
  schoolName = 'TRƯỜNG THCS CÁT MINH',
  academicYear = '2026-2027',
  className = 'Lớp 7A6',
  subject = 'Tiếng Anh',
  semester = 'HKI',
  txCount = 4,
}) => {
  const semLabel = SEMESTER_OPTIONS.find((s) => s.id === semester)?.label || semester;

  // Header thông tin bảng điểm
  const lines = [];
  lines.push(`"${schoolName.toUpperCase()}"`);
  lines.push(`"BẢNG ĐIỂM ĐÁNH GIÁ MÔN HỌC CHUẨN THÔNG TƯ 22/2021/TT-BGDĐT"`);
  lines.push(`"Môn: ${subject} - Lớp: ${className} - ${semLabel} (Năm học: ${academicYear})"`);
  lines.push(''); // Dòng trống

  // Header các cột
  const headers = ['STT', 'Mã HS', 'Họ và tên'];
  for (let i = 1; i <= txCount; i++) {
    headers.push(`ĐĐG TX ${i}`);
  }
  headers.push('ĐĐG GK (Hệ số 2)', 'ĐĐG CK (Hệ số 3)', 'Điểm TBM', 'Xếp loại', 'Nhận xét của Giáo viên');

  lines.push(headers.map((h) => `"${h}"`).join(','));

  // Duyệt danh sách học sinh
  students.forEach((st, idx) => {
    const grades = evaluationsMap[st.id] || {};
    const tbm = calculateTBM(grades, txCount);
    const cls = classifyGrade(tbm);

    const row = [
      idx + 1,
      st.id || `HS${idx + 1}`,
      st.full_name || st.name || '',
    ];

    for (let i = 1; i <= txCount; i++) {
      const g = grades[`tx${i}`];
      row.push(g !== undefined && g !== null ? g : '');
    }

    row.push(grades.gk !== undefined && grades.gk !== null ? grades.gk : '');
    row.push(grades.ck !== undefined && grades.ck !== null ? grades.ck : '');
    row.push(tbm !== null ? tbm : '');
    row.push(cls.label);
    row.push((grades.comment || '').replace(/"/g, '""'));

    lines.push(row.map((val) => `"${val}"`).join(','));
  });

  // Ký tự UTF-8 BOM (\uFEFF) giúp Excel nhận diện mã UTF-8 không lỗi font tiếng Việt
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const safeFileName = `Bang_Diem_${subject}_${className}_${semester}_${academicYear}`.replace(/\s+/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `${safeFileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
