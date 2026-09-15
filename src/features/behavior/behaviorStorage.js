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
