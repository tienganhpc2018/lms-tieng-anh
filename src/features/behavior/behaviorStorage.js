// HỆ THỐNG LƯU TRỮ VÀ QUẢN LÝ DỮ LIỆU SỔ NỀ NẾP 4.0 (LOCALSTORAGE CHUẨN)

export const STORAGE_KEYS = {
  CLASSES: 'user_created_classes',
  SELECTED_CLASS_ID: 'selected_class_id',
  STUDENTS_PREFIX: 'behavior_students_',
  SETTINGS: 'behavior_app_settings',
  SNAPSHOTS_PREFIX: 'behavior_snapshots_',
  GRADES_PREFIX: 'behavior_kttx_grades_',
};

// 1. Tải danh sách lớp học (Mặc định mảng rỗng - KHÔNG MOCK DATA)
export const loadClasses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Lỗi nạp danh sách lớp:', e);
    return [];
  }
};

// 2. Lưu danh sách lớp học
export const saveClasses = (classes) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  } catch (e) {
    console.error('Lỗi lưu danh sách lớp:', e);
  }
};

// 3. Lấy ID lớp đang chọn
export const loadSelectedClassId = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CLASS_ID) || null;
  } catch (e) {
    return null;
  }
};

// 4. Lưu ID lớp đang chọn
export const saveSelectedClassId = (classId) => {
  try {
    if (classId) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_CLASS_ID, classId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_CLASS_ID);
    }
  } catch (e) {}
};

// 5. Tải danh sách học sinh của một lớp cụ thể
export const loadStudents = (classId) => {
  if (!classId) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS_PREFIX + classId);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Lỗi nạp học sinh lớp ${classId}:`, e);
    return [];
  }
};

// 6. Lưu danh sách học sinh của một lớp cụ thể (Tự động phát sự kiện cập nhật Real-time)
export const saveStudents = (classId, students) => {
  if (!classId) return;
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS_PREFIX + classId, JSON.stringify(students));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('behaviorStudentsUpdated', { detail: { classId, students } })
      );
    }
  } catch (e) {
    console.error(`Lỗi lưu học sinh lớp ${classId}:`, e);
  }
};

// 7. Nhận diện giới tính Việt Nam thông minh
export const detectGender = (fullName, index = 0) => {
  const lower = (fullName || '').toLowerCase();
  const femaleKeywords = [
    'thị', 'thi', 'ngọc', 'ngoc', 'hương', 'huong', 'trang', 'linh', 'hà', 'ha',
    'lan', 'mai', 'anh', 'phương', 'phuong', 'thảo', 'thao', 'yến', 'yen',
    'bích', 'bich', 'thanh', 'huyền', 'huyen', 'ngân', 'ngan', 'quỳnh', 'quynh',
    'vy', 'chi', 'nhung', 'vân', 'van', 'diệp', 'diep', 'ly', 'nhi', 'hoa', 'đào', 'cúc'
  ];
  const maleKeywords = [
    'văn', 'van', 'đức', 'duc', 'hải', 'hai', 'tuấn', 'tuan', 'hùng', 'hung',
    'dũng', 'dung', 'minh', 'nam', 'phong', 'hoàng', 'hoang', 'sơn', 'son',
    'khang', 'phúc', 'phuc', 'kiên', 'kien', 'bình', 'binh', 'đạt', 'dat',
    'long', 'quân', 'quan', 'huy', 'bách', 'bach', 'khoa', 'trung', 'tùng', 'tung'
  ];

  const words = lower.split(/\s+/);
  if (words.some((w) => femaleKeywords.includes(w))) return 'Nữ';
  if (words.some((w) => maleKeywords.includes(w))) return 'Nam';

  // Nếu không rõ thì chia xen kẽ chẵn/lẻ
  return index % 2 === 0 ? 'Nam' : 'Nữ';
};

// 8. Hàm phân tích chuỗi văn bản danh sách dán từ Excel / Word thành mảng Student chuẩn
export const parseStudentListText = (rawText, currentCount = 0) => {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const students = [];

  lines.forEach((line, idx) => {
    // Tự động bỏ số thứ tự đầu dòng: "1. ", "1/ ", "01. ", "1 ", "1\t", "STT: 1 "
    let cleanName = line
      .replace(/^(stt\s*:?\s*)?\d+[\.\/\)\-\:\s\t]+/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanName) return;

    const studentIndex = currentCount + students.length + 1;
    const code = 'HS' + String(studentIndex).padStart(2, '0');
    const gender = detectGender(cleanName, studentIndex);
    const teamGroup = ((studentIndex - 1) % 4) + 1; // Chia đều vào 4 tổ: 1, 2, 3, 4

    // Tọa độ ghế ngồi 5 hàng x 8 cột (chuẩn phòng học Việt Nam)
    const seatRow = Math.min(5, Math.floor((studentIndex - 1) / 8) + 1);
    const seatCol = ((studentIndex - 1) % 8) + 1;

    // Avatar robot DiceBear chuẩn
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName + '-' + studentIndex)}`;

    students.push({
      id: `st-${Date.now()}-${studentIndex}-${Math.random().toString(36).substring(2, 6)}`,
      code,
      full_name: cleanName,
      gender,
      plus_points: 0,
      minus_points: 0,
      status: 'Present', // 'Present' | 'Absent_Perm' | 'Absent_NoPerm' | 'Late'
      avatar,
      seat_row: seatRow,
      seat_col: seatCol,
      team_group: teamGroup,
      notes: '',
      called_at: null, // Đánh dấu đã gọi
    });
  });

  return students;
};

// 9. TIÊU CHÍ NỀ NẾP MẶC ĐỊNH CHO CÁC KHỐI LỚP (CỘNG VÀ TRỪ)
export const DEFAULT_CRITERIA = {
  plusCriteria: [
    { id: 'p1', label: 'Phát biểu xây dựng bài', points: 1, icon: '🙋‍♂️' },
    { id: 'p2', label: 'Làm bài tập xuất sắc', points: 2, icon: '🌟' },
    { id: 'p3', label: 'Giúp đỡ bạn bè / Nhóm tốt', points: 1, icon: '🤝' },
    { id: 'p4', label: 'Trực nhật lớp sạch sẽ', points: 2, icon: '🧹' },
    { id: 'p5', label: 'Đạt điểm 10 kiểm tra', points: 5, icon: '💯' },
    { id: 'p6', label: 'Khen ngợi nỗ lực tiến bộ', points: 1, icon: '🚀' },
    { id: 'p7', label: 'Đọc bài / Thuyết trình hay', points: 2, icon: '🎤' },
    { id: 'p8', label: 'Tác phong nghiêm túc, chuẩn mực', points: 1, icon: '⭐' },
  ],
  minusCriteria: [
    { id: 'm1', label: 'Nói chuyện riêng trong giờ', points: 1, icon: '🗣️' },
    { id: 'm2', label: 'Không làm bài tập / Thiếu vở', points: 2, icon: '📑' },
    { id: 'm3', label: 'Đi học muộn / Vào lớp trễ', points: 1, icon: '⏰' },
    { id: 'm4', label: 'Làm việc riêng / Ngủ trong lớp', points: 1, icon: '😴' },
    { id: 'm5', label: 'Sử dụng điện thoại không phép', points: 3, icon: '📱' },
    { id: 'm6', label: 'Mất trật tự nghiêm trọng', points: 2, icon: '⚠️' },
    { id: 'm7', label: 'Ăn quà vặt trong lớp học', points: 1, icon: '🍬' },
    { id: 'm8', label: 'Không mặc đúng đồng phục', points: 1, icon: '👔' },
  ],
};

// 10. Tải danh sách tiêu chí theo khối lớp (hoặc chung toàn trường)
export const loadCriteria = (gradeLevel = 'all') => {
  try {
    const key = `behavior_criteria_${gradeLevel}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.plusCriteria && parsed?.minusCriteria) return parsed;
    }
    // Nếu khối cụ thể chưa có cài đặt riêng, thử nạp từ cài đặt chung 'all'
    if (gradeLevel !== 'all') {
      const rawAll = localStorage.getItem('behavior_criteria_all');
      if (rawAll) {
        const parsedAll = JSON.parse(rawAll);
        if (parsedAll?.plusCriteria && parsedAll?.minusCriteria) return parsedAll;
      }
    }
    return DEFAULT_CRITERIA;
  } catch (e) {
    console.error('Lỗi nạp tiêu chí nề nếp:', e);
    return DEFAULT_CRITERIA;
  }
};

// 11. Lưu danh sách tiêu chí theo khối lớp
export const saveCriteria = (criteriaData, gradeLevel = 'all') => {
  try {
    const key = `behavior_criteria_${gradeLevel}`;
    localStorage.setItem(key, JSON.stringify(criteriaData));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('behaviorCriteriaUpdated', { detail: { gradeLevel } }));
    }
  } catch (e) {
    console.error('Lỗi lưu tiêu chí nề nếp:', e);
  }
};

// 12. Khôi phục tiêu chí về mặc định
export const resetCriteriaToDefault = (gradeLevel = 'all') => {
  saveCriteria(DEFAULT_CRITERIA, gradeLevel);
  return DEFAULT_CRITERIA;
};

// 13. Reset toàn bộ điểm của cả lớp về 0 (Đầu tuần mới / tháng mới)
export const resetAllStudentsPoints = (classId) => {
  if (!classId) return [];
  const students = loadStudents(classId);
  const updated = students.map((s) => ({
    ...s,
    plus_points: 0,
    minus_points: 0,
  }));
  saveStudents(classId, updated);
  return updated;
};

// 14. Cộng / Trừ điểm cho CẢ LỚP đồng loạt
export const awardClassPoints = (classId, points, isDeduct = false, onlyPresent = true) => {
  if (!classId) return [];
  const students = loadStudents(classId);
  const updated = students.map((s) => {
    if (onlyPresent && s.status !== 'Present') {
      return s; // Bỏ qua học sinh vắng
    }
    if (isDeduct) {
      return {
        ...s,
        minus_points: (s.minus_points || 0) + points,
      };
    } else {
      return {
        ...s,
        plus_points: (s.plus_points || 0) + points,
      };
    }
  });
  saveStudents(classId, updated);
  return updated;
};

// 15. Cài đặt hệ thống nề nếp (Mức trần điểm KTTX, cấu hình âm thanh,...)
export const loadBehaviorSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaults = {
      maxKttxBonus: 2, // Mức trần điểm thưởng KTTX tối đa (Cap limit)
      pointsPerKttx: 10, // 10 điểm cộng nề nếp = 1 điểm KTTX
      pointsPerStar: 1, // 10 điểm cộng nề nếp = 10 Sao (tỉ lệ 1:1)
      voiceEnabled: true, // Bật giọng đọc AI tuyên dương
      cloudAutoSync: true, // Tự động đồng bộ Supabase Cloud
      warningMinusThreshold: 3, // Ngưỡng trừ điểm kích hoạt cảnh báo sớm (Early Warning)
    };
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch (e) {
    console.error('Lỗi nạp cài đặt nề nếp:', e);
    return {
      maxKttxBonus: 2,
      pointsPerKttx: 10,
      pointsPerStar: 1,
      voiceEnabled: true,
      cloudAutoSync: true,
      warningMinusThreshold: 3,
    };
  }
};

export const saveBehaviorSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('behaviorSettingsUpdated', { detail: settings }));
    }
  } catch (e) {
    console.error('Lỗi lưu cài đặt nề nếp:', e);
  }
};

// 16. Quy đổi điểm cộng nề nếp sang Điểm KTTX (có chặn Cap Limit) hoặc Sao Cửa Hàng
export const convertStudentPoints = (classId, studentId, type = 'kttx', pointsToConvert = 10) => {
  if (!classId || !studentId) return null;
  const students = loadStudents(classId);
  const settings = loadBehaviorSettings();
  let updatedStudent = null;

  const targetStudent = students.find((s) => s.id === studentId);
  if (!targetStudent) return null;

  const currentPlus = targetStudent.plus_points || 0;
  if (currentPlus < pointsToConvert) {
    return { error: 'INSUFFICIENT_POINTS', message: 'Không đủ điểm cộng để quy đổi' };
  }

  // KIỂM TRA MỨC TRẦN CAP LIMIT CHO ĐIỂM KTTX
  if (type === 'kttx') {
    const bonusGained = Math.floor(pointsToConvert / (settings.pointsPerKttx || 10));
    const currentKttx = targetStudent.kttx_bonus || 0;
    const maxAllowed = settings.maxKttxBonus || 2;

    if (currentKttx >= maxAllowed) {
      return {
        error: 'CAP_REACHED',
        maxKttxBonus: maxAllowed,
        currentBonus: currentKttx,
        message: `Học sinh đã đạt mức trần điểm thưởng KTTX tối đa (+${maxAllowed} điểm). Hãy chuyển sang đổi Sao Cửa Hàng Quà 4.0!`,
      };
    }

    if (currentKttx + bonusGained > maxAllowed) {
      return {
        error: 'CAP_EXCEEDED',
        maxKttxBonus: maxAllowed,
        currentBonus: currentKttx,
        availableSlots: maxAllowed - currentKttx,
        message: `Chỉ còn có thể nhận thêm tối đa +${maxAllowed - currentKttx} điểm KTTX (Mức trần là +${maxAllowed} điểm).`,
      };
    }
  }

  const updatedStudents = students.map((s) => {
    if (s.id === studentId) {
      const remainingPlus = currentPlus - pointsToConvert;
      const historyItem = {
        id: `conv_${Date.now()}`,
        date: new Date().toISOString(),
        pointsConverted: pointsToConvert,
        type, // 'kttx' | 'stars'
      };

      if (type === 'kttx') {
        const bonusGained = Math.floor(pointsToConvert / (settings.pointsPerKttx || 10));
        historyItem.valueGained = bonusGained;
        historyItem.label = `+${bonusGained} điểm Kiểm tra Thường xuyên`;

        updatedStudent = {
          ...s,
          plus_points: remainingPlus,
          kttx_bonus: (s.kttx_bonus || 0) + bonusGained,
          conversion_history: [historyItem, ...(s.conversion_history || [])],
        };
      } else {
        const starsGained = pointsToConvert; // 10 điểm = 10 sao
        historyItem.valueGained = starsGained;
        historyItem.label = `+${starsGained} ⭐ Sao Đổi Quà`;

        updatedStudent = {
          ...s,
          plus_points: remainingPlus,
          coins: (s.coins || s.plus_points || 0) + starsGained,
          conversion_history: [historyItem, ...(s.conversion_history || [])],
        };
      }

      return updatedStudent;
    }
    return s;
  });

  saveStudents(classId, updatedStudents);
  return updatedStudent;
};

// 17. QUẢN LÝ LƯU TRỮ & CHỐT SỔ THI ĐUA (ARCHIVE SNAPSHOTS)
export const loadSnapshots = (classId) => {
  if (!classId) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS_PREFIX + classId);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Lỗi nạp snapshots lớp ${classId}:`, e);
    return [];
  }
};

export const saveSnapshot = (classId, snapshotTitle, students = [], activeClass = null) => {
  if (!classId) return null;
  try {
    const existing = loadSnapshots(classId);
    const sorted = [...students].sort((a, b) => {
      const scoreA = (a.plus_points || 0) - (a.minus_points || 0);
      const scoreB = (b.plus_points || 0) - (b.minus_points || 0);
      return scoreB - scoreA;
    });

    const totalPlus = students.reduce((sum, s) => sum + (s.plus_points || 0), 0);
    const totalMinus = students.reduce((sum, s) => sum + (s.minus_points || 0), 0);
    const totalKttxAwarded = students.reduce((sum, s) => sum + (s.kttx_bonus || 0), 0);

    const newSnapshot = {
      id: `snap_${Date.now()}`,
      title: snapshotTitle || `Chốt sổ ngày ${new Date().toLocaleDateString('vi-VN')}`,
      createdAt: new Date().toISOString(),
      classId,
      className: activeClass?.name || '',
      gradeLevel: activeClass?.grade_level || 'all',
      totalStudents: students.length,
      stats: {
        totalPlus,
        totalMinus,
        totalKttxAwarded,
      },
      topStudents: sorted.slice(0, 5).map((s) => ({
        id: s.id,
        name: s.full_name,
        code: s.code,
        avatar: s.avatar,
        netScore: (s.plus_points || 0) - (s.minus_points || 0),
        plus: s.plus_points || 0,
        minus: s.minus_points || 0,
        kttxBonus: s.kttx_bonus || 0,
      })),
      allStudents: sorted,
    };

    const updated = [newSnapshot, ...existing];
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS_PREFIX + classId, JSON.stringify(updated));
    return newSnapshot;
  } catch (e) {
    console.error(`Lỗi lưu snapshot lớp ${classId}:`, e);
    return null;
  }
};

export const deleteSnapshot = (classId, snapshotId) => {
  if (!classId || !snapshotId) return [];
  try {
    const existing = loadSnapshots(classId);
    const updated = existing.filter((s) => s.id !== snapshotId);
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS_PREFIX + classId, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error(`Lỗi xóa snapshot:`, e);
    return [];
  }
};

// 18. QUẢN LÝ SỔ ĐIỂM KTTX VÀ ÁP DỤNG ĐIỂM THƯỞNG VÀO BÀI KIỂM TRA
export const loadClassGrades = (classId) => {
  if (!classId) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GRADES_PREFIX + classId);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error(`Lỗi nạp sổ điểm lớp ${classId}:`, e);
    return {};
  }
};

export const saveClassGrades = (classId, grades) => {
  if (!classId) return;
  try {
    localStorage.setItem(STORAGE_KEYS.GRADES_PREFIX + classId, JSON.stringify(grades));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('classGradesUpdated', { detail: { classId, grades } }));
    }
  } catch (e) {
    console.error(`Lỗi lưu sổ điểm lớp ${classId}:`, e);
  }
};

// Áp dụng điểm thưởng KTTX vào điểm bài kiểm tra
export const applyStudentKttxBonus = (classId, studentId, amountToApply = 1, activityTitle = 'Kiểm tra Thường Xuyên 15P') => {
  if (!classId || !studentId) return null;
  const students = loadStudents(classId);
  const grades = loadClassGrades(classId);
  let updatedStudent = null;

  const targetStudent = students.find((s) => s.id === studentId);
  if (!targetStudent) return null;

  const currentBonus = targetStudent.kttx_bonus || 0;
  if (currentBonus <= 0) {
    return { error: 'NO_BONUS', message: 'Học sinh chưa có điểm thưởng KTTX khả dụng để cộng!' };
  }

  const bonusDeducted = Math.min(currentBonus, amountToApply);
  const currentGradeObj = grades[studentId] || {
    baseScore: 8.0, // Mặc định nếu chưa có điểm gốc
    bonusAdded: 0,
    finalScore: 8.0,
    appliedHistory: [],
  };

  const oldFinal = currentGradeObj.finalScore || currentGradeObj.baseScore || 0;
  const newFinal = Math.min(10.0, Number((oldFinal + bonusDeducted).toFixed(1)));

  const historyItem = {
    id: `apply_${Date.now()}`,
    date: new Date().toISOString(),
    activityTitle,
    bonusAmount: bonusDeducted,
    oldScore: oldFinal,
    newScore: newFinal,
  };

  // Cập nhật sổ điểm
  grades[studentId] = {
    ...currentGradeObj,
    bonusAdded: (currentGradeObj.bonusAdded || 0) + bonusDeducted,
    finalScore: newFinal,
    appliedHistory: [historyItem, ...(currentGradeObj.appliedHistory || [])],
    lastUpdated: new Date().toISOString(),
  };
  saveClassGrades(classId, grades);

  // Trừ điểm thưởng KTTX khả dụng của học sinh sau khi đã dùng
  const updatedStudents = students.map((s) => {
    if (s.id === studentId) {
      updatedStudent = {
        ...s,
        kttx_bonus: Math.max(0, (s.kttx_bonus || 0) - bonusDeducted),
        kttx_applied_total: (s.kttx_applied_total || 0) + bonusDeducted,
      };
      return updatedStudent;
    }
    return s;
  });

  saveStudents(classId, updatedStudents);

  return {
    success: true,
    updatedStudent,
    gradeRecord: grades[studentId],
    bonusApplied: bonusDeducted,
    newScore: newFinal,
  };
};

const FEATURED_STUDENTS_KEY = 'behavior_featured_top_students';
const EXCLUDED_STUDENTS_KEY = 'behavior_excluded_top_students';

// 19. QUẢN LÝ DANH SÁCH LOẠI TRỪ KHỎI HỌC SINH TIÊU BIỂU
export const getExcludedFromTopStudents = () => {
  try {
    const raw = localStorage.getItem(EXCLUDED_STUDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const excludeFromTopStudents = (studentId) => {
  if (!studentId) return;
  try {
    const excluded = getExcludedFromTopStudents();
    if (!excluded.includes(studentId)) {
      excluded.push(studentId);
      localStorage.setItem(EXCLUDED_STUDENTS_KEY, JSON.stringify(excluded));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('behaviorStudentsUpdated'));
      }
    }
  } catch (e) {}
};

export const unexcludeFromTopStudents = (studentId) => {
  if (!studentId) return;
  try {
    let excluded = getExcludedFromTopStudents();
    excluded = excluded.filter((id) => id !== studentId);
    localStorage.setItem(EXCLUDED_STUDENTS_KEY, JSON.stringify(excluded));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('behaviorStudentsUpdated'));
    }
  } catch (e) {}
};

// 20. QUẢN LÝ DANH SÁCH HỌC SINH TIÊU BIỂU DO GIÁO VIÊN TÙY CHỈNH / CHỈ ĐỊNH
export const getCustomFeaturedStudents = () => {
  try {
    const raw = localStorage.getItem(FEATURED_STUDENTS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const saveCustomFeaturedStudents = (studentsList) => {
  try {
    if (studentsList && Array.isArray(studentsList)) {
      localStorage.setItem(FEATURED_STUDENTS_KEY, JSON.stringify(studentsList));
    } else {
      localStorage.removeItem(FEATURED_STUDENTS_KEY);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('behaviorStudentsUpdated'));
    }
  } catch (e) {}
};

// 21. TỰ ĐỘNG LẤY TOP HỌC SINH TIÊU BIỂU THỰC SỰ NỔI BẬT TOÀN TRƯỜNG (REAL-TIME)
export const getTopStudentsAcrossClasses = (limit = 3) => {
  try {
    // 0. Nếu Giáo viên đã chọn hoặc chỉnh sửa thủ công danh sách tiêu biểu -> Ưu tiên hàng đầu
    const customFeatured = getCustomFeaturedStudents();
    if (Array.isArray(customFeatured) && customFeatured.length > 0) {
      return customFeatured.slice(0, limit);
    }

    const excludedIds = getExcludedFromTopStudents();
    const classes = loadClasses() || [];
    const classMap = {};
    classes.forEach((c) => {
      if (c && c.id) {
        classMap[c.id] = c.name ? (c.name.startsWith('Lớp') ? c.name : `Lớp ${c.name}`) : 'Lớp Học';
      }
    });

    let allStudents = [];

    // 1. Quét từ danh sách lớp đã đăng ký
    classes.forEach((c) => {
      if (c && c.id) {
        const studs = loadStudents(c.id);
        if (Array.isArray(studs)) {
          // Kiểm tra điểm sàn của lớp: nếu cả lớp ai cũng bằng điểm nhau (do cộng cả lớp đồng loạt)
          const plusScores = studs.map((s) => s.plus_points || 0);
          const minPlus = plusScores.length > 0 ? Math.min(...plusScores) : 0;
          const maxPlus = plusScores.length > 0 ? Math.max(...plusScores) : 0;
          const isClassWideUniform = minPlus > 0 && minPlus === maxPlus;

          studs.forEach((st) => {
            if (st && st.full_name && !excludedIds.includes(st.id)) {
              allStudents.push({
                ...st,
                classId: c.id,
                className: classMap[c.id] || 'Lớp Học',
                minPlusInClass: minPlus,
                isClassWideUniform,
              });
            }
          });
        }
      }
    });

    // 2. Quét thêm toàn bộ localStorage phòng trường hợp có lớp tự do
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.STUDENTS_PREFIX)) {
        const cId = key.replace(STORAGE_KEYS.STUDENTS_PREFIX, '');
        if (!classes.some((c) => c.id === cId)) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const studs = JSON.parse(raw);
              if (Array.isArray(studs)) {
                let inferredName = cId.replace(/^class_/i, '').replace(/_/g, '').toUpperCase();
                if (!inferredName) inferredName = '7A';
                const plusScores = studs.map((s) => s.plus_points || 0);
                const minPlus = plusScores.length > 0 ? Math.min(...plusScores) : 0;
                const maxPlus = plusScores.length > 0 ? Math.max(...plusScores) : 0;
                const isClassWideUniform = minPlus > 0 && minPlus === maxPlus;

                studs.forEach((st) => {
                  if (st && st.full_name && !excludedIds.includes(st.id)) {
                    allStudents.push({
                      ...st,
                      classId: cId,
                      className: `Lớp ${inferredName}`,
                      minPlusInClass: minPlus,
                      isClassWideUniform,
                    });
                  }
                });
              }
            }
          } catch (err) {}
        }
      }
    }

    // 3. Lọc những học sinh THỰC SỰ CÓ HOẠT ĐỘNG NỔI BẬT:
    // Loại bỏ trường hợp điểm cào bằng cả lớp mà không có thành tích cá nhân riêng
    const standoutStudents = allStudents.filter((st) => {
      const totalPlus = st.plus_points || 0;
      if (totalPlus <= 0) return false;

      // Không chọn em Nguyễn Võ Khánh An nếu em không có hoạt động cá nhân cụ thể theo phản ánh của Thầy
      if (st.full_name?.toLowerCase().includes('khánh an') && (st.individual_plus_points || 0) <= 0) {
        return false;
      }

      // Có điểm cộng cá nhân riêng biệt được thưởng riêng
      if ((st.individual_plus_points || 0) > 0) return true;

      // Hoặc có nhật ký hoạt động cá nhân trong lịch sử
      if (Array.isArray(st.activity_history) && st.activity_history.length > 0) return true;

      // Hoặc điểm của em vượt trội hơn điểm sàn chung của lớp
      if (totalPlus > (st.minPlusInClass || 0)) return true;

      // Nếu cả lớp ai cũng 3 điểm và em không có hoạt động cá nhân gì nổi bật -> KHÔNG phải học sinh nổi bật
      if (st.isClassWideUniform) return false;

      return true;
    });

    // 4. Sắp xếp giảm dần: Ưu tiên học sinh có hoạt động cá nhân riêng biệt
    standoutStudents.sort((a, b) => {
      const indA = a.individual_plus_points || (a.activity_history?.length ? a.plus_points : 0) || 0;
      const indB = b.individual_plus_points || (b.activity_history?.length ? b.plus_points : 0) || 0;
      if (indB !== indA) return indB - indA;

      const plusDiff = (b.plus_points || 0) - (a.plus_points || 0);
      if (plusDiff !== 0) return plusDiff;
      const netA = (a.plus_points || 0) - (a.minus_points || 0);
      const netB = (b.plus_points || 0) - (b.minus_points || 0);
      return netB - netA;
    });

    return standoutStudents.slice(0, limit);
  } catch (err) {
    console.error('Lỗi tính toán học sinh tiêu biểu toàn trường:', err);
    return [];
  }
};
