/**
 * Helper nhận diện giới tính và cấp Avatar học sinh Việt Nam áo trắng khăn quàng đỏ
 */

export const AVATAR_PRESETS = {
  female: [
    '/images/avatars/student_female_1.jpg',
    '/images/avatars/student_female_2.jpg',
  ],
  male: [
    '/images/avatars/student_male_1.jpg',
    '/images/avatars/student_male_2.jpg',
  ],
};

// Từ khoá đặc trưng nhận diện giới tính theo họ tên người Việt Nam
const MALE_KEYWORDS = [
  'văn', 'nam', 'hải', 'đạt', 'thành', 'tuấn', 'huy', 'đức', 'hoàng', 'khang',
  'minh', 'quang', 'khôi', 'dũng', 'phong', 'thắng', 'quân', 'long', 'hùng',
  'kiệt', 'phúc', 'thịnh', 'sơn', 'tùng', 'bách', 'trung', 'nghĩa', 'khoa',
  'bảo', 'trọng', 'hào', 'triết', 'tiến', 'hưng', 'nguyên', 'việt', 'bình',
  'nhật', 'trí', 'lâm', 'dương', 'lộc', 'đăng'
];

const FEMALE_KEYWORDS = [
  'thị', 'lan', 'hương', 'mai', 'linh', 'vy', 'nhi', 'chi', 'trang',
  'thảo', 'ngọc', 'hà', 'ngân', 'như', 'trâm', 'phương', 'diệp', 'yến',
  'quỳnh', 'dung', 'loan', 'tuyết', 'oanh', 'thư', 'châu', 'huyền', 'hân',
  'na', 'mi', 'ly', 'nga', 'tâm', 'trúc', 'tiên'
];

/**
 * Phân tích và dự đoán giới tính từ họ tên học sinh Việt Nam
 * @param {string} fullName Họ và tên
 * @returns {'male' | 'female'}
 */
export const detectGenderFromName = (fullName = '') => {
  if (!fullName) return 'female';
  const lower = fullName.toLowerCase().trim();
  const words = lower.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'female';

  // 1. Kiểm tra từ đệm trực tiếp (Thị -> Nữ, Văn -> Nam)
  if (words.includes('thị')) return 'female';
  if (words.includes('văn')) return 'male';

  // 2. Kiểm tra tên gọi chính (từ cuối cùng)
  const firstName = words[words.length - 1];
  if (MALE_KEYWORDS.includes(firstName)) return 'male';
  if (FEMALE_KEYWORDS.includes(firstName)) return 'female';

  // 3. Kiểm tra các từ đệm phía trước
  for (let i = words.length - 2; i >= 0; i--) {
    const w = words[i];
    if (MALE_KEYWORDS.includes(w)) return 'male';
    if (FEMALE_KEYWORDS.includes(w)) return 'female';
  }

  // Mặc định nữ hoặc nam theo quy ước
  return 'female';
};

/**
 * Lấy đường dẫn Avatar phù hợp nhất cho học sinh
 * @param {object} student Đối tượng học sinh
 * @param {number} index Thứ tự chỉ số
 * @returns {string} URL Avatar
 */
export const getStudentAvatarPreset = (student = {}, index = 0) => {
  // Nếu học sinh đã có ảnh đại diện tải lên thật (không phải robot bottts/dicebear mặc định)
  if (
    student.avatar &&
    (student.avatar.startsWith('http') || student.avatar.startsWith('data:')) &&
    !student.avatar.includes('bottts') &&
    !student.avatar.includes('dicebear') &&
    !student.avatar.includes('unsplash')
  ) {
    return student.avatar;
  }

  const name = student.full_name || student.name || '';
  const rawGender = (student.gender || '').toLowerCase();
  let gender = 'female';

  if (rawGender === 'nam' || rawGender === 'male') {
    gender = 'male';
  } else if (rawGender === 'nữ' || rawGender === 'female') {
    gender = 'female';
  } else {
    gender = detectGenderFromName(name);
  }

  const pool = gender === 'male' ? AVATAR_PRESETS.male : AVATAR_PRESETS.female;
  return pool[Math.abs(index) % pool.length];
};
