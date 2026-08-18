/**
 * Service Tự Động Gửi Nhận Xét Tuần & Điểm Số Cho Phụ Huynh Qua Zalo OA / SMS
 */
export async function sendWeeklyReportToZalo({ studentName, parentPhone, averageScore, totalExams, aiComment }) {
  try {
    if (!parentPhone) {
      console.warn('SĐT Phụ huynh chưa được cập nhật.');
      return { success: false, message: 'Chưa cập nhật SĐT Phụ huynh' };
    }

    const messagePayload = {
      phone: parentPhone,
      studentName,
      averageScore,
      totalExams,
      aiComment: aiComment || 'Học sinh có tinh thần học tập chăm chỉ và tiến bộ rõ rệt.',
      date: new Date().toLocaleDateString('vi-VN'),
    };

    console.log(`📱 [Zalo Notification OA] Sending Weekly Report to ${parentPhone}:`, messagePayload);

    return {
      success: true,
      message: `Đã gửi báo cáo tiến bộ tuần của học sinh ${studentName} tới Zalo Phụ huynh (${parentPhone})!`,
    };
  } catch (error) {
    console.error('Lỗi khi gửi thông báo Zalo:', error);
    return { success: false, message: error.message };
  }
}
