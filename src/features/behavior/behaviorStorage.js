// HỆ THỐNG LƯU TRỮ VÀ QUẢN LÝ DỮ LIỆU SỔ NỀ NẾP 4.0 (LOCALSTORAGE CHUẨN)

export const STORAGE_KEYS = {
  CLASSES: 'user_created_classes',
  SELECTED_CLASS_ID: 'selected_class_id',
  STUDENTS_PREFIX: 'behavior_students_',
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

// 6. Lưu danh sách học sinh của một lớp cụ thể
export const saveStudents = (classId, students) => {
  if (!classId) return;
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS_PREFIX + classId, JSON.stringify(students));
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

// 15. Quy đổi điểm cộng nề nếp sang Điểm KTTX hoặc Sao Cửa Hàng
export const convertStudentPoints = (classId, studentId, type = 'kttx', pointsToConvert = 10) => {
  if (!classId || !studentId) return null;
  const students = loadStudents(classId);
  let updatedStudent = null;

  const updatedStudents = students.map((s) => {
    if (s.id === studentId) {
      const currentPlus = s.plus_points || 0;
      if (currentPlus < pointsToConvert) return s; // Không đủ điểm đổi

      const remainingPlus = currentPlus - pointsToConvert;
      const historyItem = {
        id: `conv_${Date.now()}`,
        date: new Date().toISOString(),
        pointsConverted: pointsToConvert,
        type, // 'kttx' | 'stars'
      };

      if (type === 'kttx') {
        // Cứ 10 điểm cộng nề nếp = 1 điểm KTTX
        const bonusGained = Math.floor(pointsToConvert / 10);
        historyItem.valueGained = bonusGained;
        historyItem.label = `+${bonusGained} điểm Kiểm tra Thường xuyên`;

        updatedStudent = {
          ...s,
          plus_points: remainingPlus,
          kttx_bonus: (s.kttx_bonus || 0) + bonusGained,
          conversion_history: [historyItem, ...(s.conversion_history || [])],
        };
      } else {
        // Cứ 10 điểm cộng nề nếp = 10 Sao Đổi Quà (Cửa Hàng Quà 4.0 / Túi Mù)
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
