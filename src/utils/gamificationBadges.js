/**
 * Utility Tính Toán & Cấp Huy Hiệu Khen Thưởng Gamification
 */
export function calculateGamificationBadges({ score, totalMarks, correctCount, totalQuestions, timeTakenSeconds, timeLimitSeconds, aiWritingScore }) {
  const badges = [];

  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

  // 1. Huy hiệu Điểm Tuyệt Đối 100%
  if (percentage === 100) {
    badges.push({
      id: 'perfect_100',
      title: '🏆 HUYỀN THOẠI 100%',
      description: 'Trả lời chính xác 100% tất cả các câu hỏi trong đề thi!',
      bgGradient: 'from-amber-500 to-yellow-600',
      icon: '👑',
    });
  }

  // 2. Huy hiệu Thiện Xạ >= 80%
  if (percentage >= 80 && percentage < 100) {
    badges.push({
      id: 'sharp_shooter',
      title: '🎯 THIỆN XẠ TIẾNG ANH',
      description: 'Đạt từ 80% tổng số điểm trở lên!',
      bgGradient: 'from-blue-600 to-indigo-600',
      icon: '🎯',
    });
  }

  // 3. Huy hiệu Tốc Độ Ánh Sáng (Nộp bài nhanh < 50% thời gian)
  if (timeLimitSeconds > 0 && timeTakenSeconds < timeLimitSeconds * 0.5) {
    badges.push({
      id: 'speed_demon',
      title: '⚡ TỐC ĐỘ ÁNH SÁNG',
      description: 'Hoàn thành bài thi cực nhanh dưới 50% thời gian quy định!',
      bgGradient: 'from-teal-500 to-emerald-600',
      icon: '⚡',
    });
  }

  // 4. Huy hiệu Ngôi Sao Bài Luận C2
  if (aiWritingScore && aiWritingScore >= 8.5) {
    badges.push({
      id: 'essay_master',
      title: '✨ NGÔI SAO BÀI LUẬN C2',
      description: 'Được AI Agent đánh giá bài viết đạt từ 8.5/10 điểm trở lên!',
      bgGradient: 'from-purple-600 to-pink-600',
      icon: '✍️',
    });
  }

  // 5. Huy hiệu Chăm Chỉ Kiên Trì
  if (percentage >= 50 && percentage < 80) {
    badges.push({
      id: 'persistent_learner',
      title: '🌟 CHĂM CHỈ KIÊN TRÌ',
      description: 'Vượt qua bài kiểm tra thành công!',
      bgGradient: 'from-sky-500 to-blue-500',
      icon: '🌟',
    });
  }

  // 6. Fallback Huy hiệu Học Viên Tích Cực
  if (badges.length === 0) {
    badges.push({
      id: 'active_student',
      title: '🌱 HỌC VIÊN TÍCH CỰC',
      description: 'Đã hoàn thành bài kiểm tra trực tuyến!',
      bgGradient: 'from-slate-600 to-slate-800',
      icon: '🎓',
    });
  }

  return badges;
}
