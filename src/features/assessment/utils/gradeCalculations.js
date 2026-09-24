/**
 * gradeCalculations.js
 * Bộ công thức tính toán điểm và xếp loại học lực môn học chuẩn Thông tư 22/2021/TT-BGDĐT
 */

/**
 * Chuẩn hóa giá trị điểm nhập vào từ người dùng (chuyển dấu phẩy thành dấu chấm, ép kiểu số)
 * @param {string|number} rawValue
 * @returns {number|null} Điểm số hợp lệ từ 0 đến 10 hoặc null nếu trống/không hợp lệ
 */
export const parseGrade = (rawValue) => {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return null;
  }
  const cleanStr = String(rawValue).trim().replace(',', '.');
  if (cleanStr === '') return null;
  const num = parseFloat(cleanStr);
  if (isNaN(num)) return null;
  if (num < 0 || num > 10) return null;
  // Làm tròn tối đa 1 chữ số thập phân
  return Math.round(num * 10) / 10;
};

/**
 * Định dạng điểm hiển thị ra màn hình (Ví dụ: 8 -> "8.0" hoặc "8", 7.5 -> "7.5")
 * @param {number|null} score
 * @returns {string}
 */
export const formatGrade = (score) => {
  if (score === null || score === undefined || isNaN(score)) return '';
  return score.toString();
};

/**
 * Tính điểm Trung bình môn (TBM) theo Thông tư 22/2021/TT-BGDĐT:
 * TBM = [Tổng điểm TX + (Điểm GK * 2) + (Điểm CK * 3)] / (Số cột TX có điểm + 2 + 3)
 * Điểm TBM được làm tròn đến 1 chữ số thập phân.
 *
 * @param {Object} studentGrades Đối tượng điểm { tx1, tx2, tx3, tx4, tx5, gk, ck }
 * @param {number} txCount Số cột TX được cấu hình (mặc định 4)
 * @returns {number|null} Điểm TBM làm tròn 1 chữ số thập phân hoặc null nếu chưa đủ điểm
 */
export const calculateTBM = (studentGrades = {}, txCount = 4) => {
  if (!studentGrades) return null;

  // 1. Thu thập điểm TX
  const txScores = [];
  for (let i = 1; i <= txCount; i++) {
    const val = parseGrade(studentGrades[`tx${i}`]);
    if (val !== null) {
      txScores.push(val);
    }
  }

  const gk = parseGrade(studentGrades.gk);
  const ck = parseGrade(studentGrades.ck);

  // Nếu chưa có bất kỳ cột điểm nào thì chưa tính TBM
  if (txScores.length === 0 && gk === null && ck === null) {
    return null;
  }

  // Điều kiện để tính điểm TBM chính thức thường yêu cầu có ít nhất 1 bài TX, có điểm GK và CK
  // Để thuận tiện cho giáo viên theo dõi tiến độ, nếu có ít nhất GK hoặc CK hoặc TX ta tính điểm theo trọng số hiện có:
  let totalScore = 0;
  let totalCoefficient = 0;

  // TX hệ số 1
  txScores.forEach((score) => {
    totalScore += score;
    totalCoefficient += 1;
  });

  // GK hệ số 2
  if (gk !== null) {
    totalScore += gk * 2;
    totalCoefficient += 2;
  }

  // CK hệ số 3
  if (ck !== null) {
    totalScore += ck * 3;
    totalCoefficient += 3;
  }

  if (totalCoefficient === 0) return null;

  const rawTbm = totalScore / totalCoefficient;
  // Làm tròn đến 1 chữ số thập phân chuẩn Thông tư 22 (7.84 -> 7.8, 7.85 -> 7.9)
  return Math.round(rawTbm * 10) / 10;
};

/**
 * Xếp loại học lực môn học theo Thông tư 22/2021/TT-BGDĐT
 * @param {number|null} tbm Điểm trung bình môn
 * @returns {Object} Thông tin xếp loại { code, label, fullLabel, badgeColor, textColor, borderColor, bgLight }
 */
export const classifyGrade = (tbm) => {
  if (tbm === null || tbm === undefined || isNaN(tbm)) {
    return {
      code: 'NONE',
      label: 'Chưa đủ',
      fullLabel: 'Chưa xếp loại',
      badgeColor: 'bg-slate-100 text-slate-500 border-slate-200',
      textColor: 'text-slate-500',
      badgeBg: 'bg-slate-100',
      rank: 0,
    };
  }

  if (tbm >= 8.0) {
    return {
      code: 'T',
      label: 'Tốt',
      fullLabel: 'Mức Tốt',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-500',
      rank: 4,
    };
  }

  if (tbm >= 6.5) {
    return {
      code: 'K',
      label: 'Khá',
      fullLabel: 'Mức Khá',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      textColor: 'text-blue-700',
      badgeBg: 'bg-blue-500',
      rank: 3,
    };
  }

  if (tbm >= 5.0) {
    return {
      code: 'D',
      label: 'Đạt',
      fullLabel: 'Mức Đạt',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      textColor: 'text-amber-700',
      badgeBg: 'bg-amber-500',
      rank: 2,
    };
  }

  return {
    code: 'CD',
    label: 'Chưa đạt',
    fullLabel: 'Mức Chưa đạt',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    textColor: 'text-rose-700',
    badgeBg: 'bg-rose-500',
    rank: 1,
  };
};

/**
 * Thống kê toàn lớp học theo Thông tư 22
 * @param {Array} students Danh sách học sinh
 * @param {Object} evaluationsMap Bảng điểm của lớp { [studentId]: { tx1, tx2, ... } }
 * @param {number} txCount Số cột TX
 * @returns {Object} Thống kê số lượng và tỷ lệ % từng loại
 */
export const calculateClassStatistics = (students = [], evaluationsMap = {}, txCount = 4) => {
  const total = students.length;
  let countT = 0;
  let countK = 0;
  let countD = 0;
  let countCD = 0;
  let countNone = 0;

  let sumTbm = 0;
  let tbmCount = 0;

  students.forEach((st) => {
    const grades = evaluationsMap[st.id] || {};
    const tbm = calculateTBM(grades, txCount);
    if (tbm !== null) {
      sumTbm += tbm;
      tbmCount++;
      const cls = classifyGrade(tbm);
      if (cls.code === 'T') countT++;
      else if (cls.code === 'K') countK++;
      else if (cls.code === 'D') countD++;
      else if (cls.code === 'CD') countCD++;
    } else {
      countNone++;
    }
  });

  const getPercent = (count) => (total > 0 ? Math.round((count / total) * 1000) / 10 : 0);

  return {
    total,
    gradedCount: tbmCount,
    averageTbm: tbmCount > 0 ? Math.round((sumTbm / tbmCount) * 10) / 10 : null,
    tot: { count: countT, percent: getPercent(countT) },
    kha: { count: countK, percent: getPercent(countK) },
    dat: { count: countD, percent: getPercent(countD) },
    chuaDat: { count: countCD, percent: getPercent(countCD) },
    chuaXepLoai: { count: countNone, percent: getPercent(countNone) },
  };
};
