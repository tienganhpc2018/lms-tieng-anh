/**
 * aiCommentGenerator.js
 * Động cơ AI tự sinh lời nhận xét sư phạm môn học chuẩn mực theo Thông tư 22/2021/TT-BGDĐT
 * Đặc biệt tối ưu chuyên sâu cho môn Tiếng Anh và hỗ trợ các môn học phổ thông.
 */

import { classifyGrade } from './gradeCalculations';

// 1. NGÂN HÀNG NHẬN XÉT SƯ PHẠM CHUYÊN SÂU MÔN TIẾNG ANH
const ENGLISH_COMMENT_BANK = {
  // Mức Tốt (TBM >= 8.0)
  T: {
    standard: [
      'Nắm rất vững ngữ pháp và vốn từ vựng phong phú, phát âm chuẩn, phản xạ giao tiếp tự tin và trôi chảy.',
      'Kỹ năng Đọc hiểu và Viết câu xuất sắc. Tích cực tham gia phát biểu xây dựng bài trong giờ học tiếng Anh.',
      'Tiếp thu bài nhanh, phát âm chuẩn xác, làm bài tập đầy đủ và đạt kết quả cao trong các bài kiểm tra.',
      'Có năng khiếu tiếng Anh tốt, vốn từ vựng đa dạng, tích cực tương tác và hỗ trợ các bạn trong nhóm.',
      'Khả năng nghe hiểu và giao tiếp rất tốt, làm chủ các cấu trúc ngữ pháp nâng cao, rất đáng khen ngợi.',
    ],
    short: [
      'Học giỏi tiếng Anh, phát âm chuẩn, giao tiếp tự tin.',
      'Vốn từ vựng phong phú, ngữ pháp vững, tiếp thu bài rất nhanh.',
      'Kỹ năng Đọc - Viết xuất sắc, tích cực phát biểu xây dựng bài.',
      'Phát âm tốt, phản xạ nhanh, làm bài kiểm tra đạt kết quả cao.',
      'Chăm ngoan, tiếp thu bài tốt, năng nổ trong các hoạt động học tập.',
    ],
    detailed: [
      'Phát âm chuẩn xác, ngữ điệu tự nhiên. Kỹ năng Nghe - Nói lưu loát, kỹ năng Đọc - Viết bài luận ngắn mạch lạc, ngữ pháp vững vàng.',
      'Khả năng Đọc hiểu văn bản tiếng Anh nhanh và chính xác. Kỹ năng Nghe phản xạ tốt, vốn từ vựng phong phú và vận dụng linh hoạt.',
      'Nắm vững toàn diện 4 kỹ năng Nghe - Nói - Đọc - Viết. Tự tin thuyết trình tiếng Anh trước lớp và làm chủ tốt các chủ điểm ngữ pháp.',
    ],
  },

  // Mức Khá (6.5 <= TBM < 8.0)
  K: {
    standard: [
      'Nắm chắc kiến thức trọng tâm bài học, đọc - viết tốt. Cần tự tin hơn nữa khi thực hành kỹ năng nói.',
      'Có ý thức học tập chăm chỉ, vốn từ vựng khá, ngữ pháp cơ bản vững vàng. Phát huy thêm phản xạ nghe hiểu.',
      'Hiểu bài và làm bài tập đầy đủ, phát âm tương đối chuẩn. Cần tích cực giơ tay phát biểu nhiều hơn trong giờ học.',
      'Tiếp thu bài tốt, có tiến bộ rõ rệt trong kỹ năng Đọc hiểu. Cần rèn luyện thêm cách viết câu phức và từ nối.',
      'Có tinh thần học tập nghiêm túc, hoàn thành tốt các nhiệm vụ học tập. Cần mở rộng thêm vốn từ vựng theo chủ đề.',
    ],
    short: [
      'Nắm chắc bài, học lực khá, cần tự tin hơn khi giao tiếp nói.',
      'Ngữ pháp cơ bản tốt, chăm chỉ, cần rèn thêm kỹ năng nghe.',
      'Tiếp thu bài khá tốt, làm bài đầy đủ, phát huy tính tích cực.',
      'Đọc - viết tốt, cần luyện thêm phát âm và phản xạ giao tiếp.',
      'Có tiến bộ trong học tập, duy trì và phát huy tính tự giác.',
    ],
    detailed: [
      'Kỹ năng Đọc hiểu và làm bài tập ngữ pháp tốt. Kỹ năng Nghe hiểu đạt yêu cầu, cần dành thêm thời gian luyện phát âm và giao tiếp nói.',
      'Nắm được các thì cơ bản và cấu trúc câu thông dụng. Kỹ năng Viết khá, cần chú ý ngữ điệu và phản xạ khi nghe người bản xứ.',
      'Có nền tảng từ vựng khá, hiểu nội dung bài khóa nhanh. Cần chủ động luyện nói theo cặp/nhóm để tăng độ trôi chảy.',
    ],
  },

  // Mức Đạt (5.0 <= TBM < 6.5)
  D: {
    standard: [
      'Có cố gắng trong học tập, nắm được từ vựng và ngữ pháp cơ bản. Cần dành thêm thời gian luyện kỹ năng nghe.',
      'Nắm được các mẫu câu giao tiếp thông dụng. Cần tập trung hơn để cải thiện kỹ năng Đọc hiểu văn bản.',
      'Hoàn thành bài tập ở mức cơ bản, có ý thức học tập. Cần củng cố thêm các cấu trúc ngữ pháp trọng tâm.',
      'Có tiến bộ so với đầu năm học, cần chăm chỉ học thuộc từ mới mỗi ngày và mạnh dạn hỏi thầy cô khi chưa hiểu.',
      'Nắm được kiến thức nền tảng, cần chú ý hơn về chính tả và cách chia động từ trong câu.',
    ],
    short: [
      'Đạt chuẩn kiến thức cơ bản, cần rèn thêm kỹ năng nghe - nói.',
      'Có cố gắng trong học tập, cần ôn tập kỹ từ vựng và ngữ pháp.',
      'Nắm được bài ở mức trung bình, cần tập trung hơn trong giờ học.',
      'Hoàn thành bài tập, cần rèn luyện thêm kỹ năng đọc hiểu.',
      'Có tiến bộ, cần tích cực tự giác ôn luyện bài học ở nhà.',
    ],
    detailed: [
      'Đạt yêu cầu kiến thức tối thiểu theo chuẩn chương trình. Đọc hiểu được các đoạn văn ngắn, cần luyện nghe nhiều hơn để cải thiện phát âm.',
      'Biết vận dụng các mẫu câu quen thuộc vào giao tiếp đơn giản. Cần củng cố quy tắc chia thì và cấu trúc câu cơ bản.',
      'Có cố gắng trong giờ học nhưng phản xạ còn chậm. Cần tăng cường luyện nghe từ vựng qua audio/video bổ trợ.',
    ],
  },

  // Mức Chưa đạt (TBM < 5.0)
  CD: {
    standard: [
      'Cần tập trung hơn trong giờ học, ôn tập lại các cấu trúc ngữ pháp cơ bản và củng cố vốn từ vựng.',
      'Kỹ năng Đọc và Nghe còn hạn chế. Cần tăng cường làm bài tập về nhà và tự giác hỏi thầy cô khi chưa hiểu bài.',
      'Chưa nắm vững các thì cơ bản và từ vựng trọng tâm. Cần có kế hoạch tự học nghiêm túc và đều đặn hơn.',
      'Còn thụ động trong giờ học tiếng Anh. Cần bổ sung kiến thức hổng và tích cực tham gia các hoạt động trên lớp.',
      'Kết quả kiểm tra chưa đạt yêu cầu. Cần nỗ lực nhiều hơn, ôn luyện từ vựng mỗi ngày để theo kịp chương trình.',
    ],
    short: [
      'Chưa nắm chắc kiến thức cơ bản, cần nỗ lực ôn tập nhiều hơn.',
      'Vốn từ vựng còn yếu, cần chăm chỉ làm bài tập về nhà.',
      'Cần tập trung nghe giảng, tích cực ôn luyện ngữ pháp căn bản.',
      'Kỹ năng Nghe - Đọc còn hạn chế, cần phụ đạo thêm kiến thức.',
      'Chưa đạt chuẩn yêu cầu, cần cố gắng và tự giác học tập hơn.',
    ],
    detailed: [
      'Chưa đạt chuẩn kiến thức kỹ năng môn học. Gặp khó khăn khi nghe hiểu và nhớ từ vựng, cần được giáo viên hướng dẫn kèm cặp thêm.',
      'Chưa nắm được các quy tắc ngữ pháp căn bản và cách đặt câu. Cần ôn tập lại bảng chữ cái, phát âm và từ vựng cơ bản.',
      'Cần dành thêm thời gian tự học ở nhà, xem lại các bài giảng và làm bài tập rèn luyện đều đặn mỗi ngày.',
    ],
  },
};

// 2. NGÂN HÀNG NHẬN XÉT CHUNG CHO CÁC MÔN HỌC KHÁC (Toán, Văn, KHTN, Sử Địa...)
const GENERAL_COMMENT_BANK = {
  T: {
    standard: [
      'Nắm rất vững kiến thức trọng tâm môn học, tư duy logic nhanh nhạy, làm bài kiểm tra đạt kết quả xuất sắc.',
      'Tiếp thu bài nhanh, chăm chỉ, tích cực phát biểu xây dựng bài và luôn gương mẫu trong học tập.',
      'Vận dụng kiến thức linh hoạt vào giải quyết bài tập, có phương pháp tự học khoa học và hiệu quả.',
    ],
    short: [
      'Học lực tốt, tư duy nhanh nhạy, chăm ngoan.',
      'Nắm chắc kiến thức, tích cực phát biểu xây dựng bài.',
      'Làm bài kiểm tra đạt kết quả cao, rất đáng khen ngợi.',
    ],
    detailed: [
      'Khả năng tư duy logic và tiếp thu kiến thức xuất sắc. Nắm vững lý thuyết và vận dụng tốt vào giải quyết các bài tập nâng cao, luôn tích cực hỗ trợ bạn bè.',
    ],
  },
  K: {
    standard: [
      'Nắm chắc kiến thức cơ bản, làm bài tập đầy đủ, cần rèn luyện thêm tính cẩn thận và phát huy khả năng tự học.',
      'Có ý thức học tập tốt, tiếp thu bài khá nhanh, cần tự tin phát biểu xây dựng bài nhiều hơn.',
      'Có nhiều tiến bộ trong môn học, bài làm trình bày rõ ràng, cần rèn thêm các dạng bài tập vận dụng.',
    ],
    short: [
      'Học lực khá, nắm chắc bài, cần phát biểu nhiều hơn.',
      'Chăm chỉ, làm bài đầy đủ, tiếp tục phát huy.',
      'Tiếp thu bài khá tốt, rèn luyện thêm tính cẩn thận.',
    ],
    detailed: [
      'Nắm vững kiến thức trọng tâm của môn học. Kỹ năng vận dụng làm bài tập đạt kết quả khá tốt, cần rèn thêm tư duy phân tích các câu hỏi tổng hợp.',
    ],
  },
  D: {
    standard: [
      'Đạt chuẩn kiến thức cơ bản của môn học, có cố gắng trong học tập, cần chú ý nghe giảng và ôn bài kỹ hơn.',
      'Hoàn thành các nhiệm vụ học tập ở mức cơ bản, cần tăng cường làm bài tập để củng cố kiến thức.',
      'Có tiến bộ trong quá trình học, cần rèn luyện thêm tính tự giác và cẩn thận trong khi làm bài kiểm tra.',
    ],
    short: [
      'Đạt chuẩn kiến thức cơ bản, cần cố gắng hơn.',
      'Có ý thức học tập, cần chăm chỉ ôn luyện bài cũ.',
      'Cần tập trung chú ý nghe giảng để cải thiện kết quả.',
    ],
    detailed: [
      'Nắm được các khái niệm và kỹ năng cơ bản theo chuẩn kiến thức. Cần dành thêm thời gian ôn tập lý thuyết và luyện tập làm bài để hiểu bài sâu hơn.',
    ],
  },
  CD: {
    standard: [
      'Chưa nắm vững kiến thức trọng tâm, kết quả kiểm tra còn thấp, cần có kế hoạch ôn tập nghiêm túc.',
      'Cần tập trung chú ý hơn trong giờ học, hoàn thành bài tập về nhà đầy đủ và chủ động hỏi thầy cô khi chưa hiểu.',
      'Còn hổng nhiều kiến thức cơ bản, cần nỗ lực và cố gắng nhiều hơn để theo kịp chương trình học.',
    ],
    short: [
      'Chưa đạt yêu cầu môn học, cần nỗ lực nhiều hơn.',
      'Cần tập trung nghe giảng và làm bài tập đầy đủ.',
      'Hổng kiến thức cơ bản, cần được bổ trợ thêm.',
    ],
    detailed: [
      'Chưa đạt chuẩn kiến thức tối thiểu của môn học. Còn lúng túng khi giải quyết bài tập cơ bản, cần có phương pháp học tập phù hợp và sự kèm cặp của gia đình, thầy cô.',
    ],
  },
};

/**
 * Sinh một lời nhận xét sư phạm duy nhất cho học sinh
 * @param {Object} params
 * @param {number|null} params.tbm Điểm trung bình môn
 * @param {string} params.studentName Tên học sinh
 * @param {string} params.subject Môn học ('Tiếng Anh', 'Toán'...)
 * @param {string} params.style Phong cách nhận xét ('standard' | 'short' | 'detailed')
 * @param {number} [params.seed] Số ngẫu nhiên để các học sinh khác nhau nhận câu khác nhau
 * @returns {string} Lời nhận xét sư phạm
 */
export const generateSingleStudentComment = ({
  tbm,
  studentName = '',
  subject = 'Tiếng Anh',
  style = 'standard',
  seed = 0,
}) => {
  const classification = classifyGrade(tbm);
  const code = classification.code === 'NONE' ? 'D' : classification.code;

  // Chọn ngân hàng nhận xét phù hợp môn học
  const isEnglish = (subject || '').toLowerCase().includes('tiếng anh') || (subject || '').toLowerCase().includes('anh');
  const bank = isEnglish ? ENGLISH_COMMENT_BANK : GENERAL_COMMENT_BANK;

  const styleBank = bank[code]?.[style] || bank[code]?.standard || bank.D.standard;
  const index = Math.abs(seed) % styleBank.length;
  let comment = styleBank[index];

  // Nếu muốn câu văn tự nhiên hơn có thể kết hợp nhẹ tên học sinh với phong cách detailed
  if (style === 'detailed' && studentName) {
    const parts = studentName.trim().split(/\s+/);
    const firstName = parts[parts.length - 1];
    if (firstName && !comment.startsWith('Em')) {
      comment = `Em ${firstName}: ` + comment;
    }
  }

  return comment;
};

/**
 * Sinh lời nhận xét hàng loạt cho danh sách học sinh
 * @param {Object} params
 * @param {Array} params.students Danh sách học sinh
 * @param {Object} params.evaluationsMap Bảng điểm hiện tại { [studentId]: { tx1, tx2, ..., comment } }
 * @param {number} params.txCount Số cột TX
 * @param {string} params.subject Môn học
 * @param {string} params.style Phong cách nhận xét ('standard' | 'short' | 'detailed')
 * @param {string} params.scope Phạm vi ('all' | 'only_empty')
 * @returns {Object} evaluationsMap đã được cập nhật nhận xét
 */
export const generateBatchComments = ({
  students = [],
  evaluationsMap = {},
  txCount = 4,
  subject = 'Tiếng Anh',
  style = 'standard',
  scope = 'all',
}) => {
  const updatedMap = { ...evaluationsMap };

  students.forEach((st, idx) => {
    const currentData = updatedMap[st.id] || {};
    const hasComment = Boolean(currentData.comment && currentData.comment.trim());

    // Nếu chọn chỉ sinh cho học sinh chưa có nhận xét mà em này đã có -> bỏ qua
    if (scope === 'only_empty' && hasComment) {
      return;
    }

    // Tính TBM
    const tbm = currentData.tbm !== undefined && currentData.tbm !== null
      ? currentData.tbm
      : null;

    const newComment = generateSingleStudentComment({
      tbm,
      studentName: st.full_name || st.name || '',
      subject,
      style,
      seed: idx + (st.id ? String(st.id).charCodeAt(0) : 0),
    });

    updatedMap[st.id] = {
      ...currentData,
      comment: newComment,
    };
  });

  return updatedMap;
};
