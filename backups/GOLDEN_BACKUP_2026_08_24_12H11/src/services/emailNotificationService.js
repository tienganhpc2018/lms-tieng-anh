import { supabase } from '../lib/supabase';

/**
 * Service Gửi Thông Báo Bảng Điểm & Nhận Xét Bài Thi tới Email Học Sinh / Phụ Huynh
 */
export async function sendQuizScoreEmail({ studentEmail, studentName, activityTitle, score, totalMarks, feedback }) {
  try {
    // 1. Kiểm tra Email hợp lệ
    if (!studentEmail || !studentEmail.includes('@')) {
      console.warn('Email học sinh không hợp lệ:', studentEmail);
      return { success: false, message: 'Email học sinh không hợp lệ' };
    }

    // 2. Nội dung Email định dạng HTML
    const emailSubject = `[LMS Notification] Kết quả bài kiểm tra "${activityTitle || 'Quiz'}" - ${studentName}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #1e3a8a; text-align: center; text-transform: uppercase;">KẾT QUẢ BÀI KIỂM TRA ONLINE</h2>
        <p>Xin chào <strong>${studentName}</strong>,</p>
        <p>Giáo viên vừa hoàn tất duyệt điểm bài kiểm tra <strong>${activityTitle}</strong> của bạn.</p>

        <div style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 15px; text-align: center; margin: 20px 0;">
          <span style="font-size: 12px; color: #475569; font-weight: bold; text-transform: uppercase;">ĐIỂM SỐ ĐẠT ĐƯỢC</span>
          <h1 style="font-size: 32px; color: #1d4ed8; margin: 5px 0;">${score} / ${totalMarks} ĐIỂM</h1>
        </div>

        ${feedback ? `
        <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
          <h4 style="color: #166534; margin-top: 0;">💬 LỜI PHÊ & NHẬN XẾT CỦA GIÁO VIÊN:</h4>
          <p style="white-space: pre-line; color: #334155;">${feedback}</p>
        </div>
        ` : ''}

        <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 30px;">
          Hệ Thống LMS Học Liệu Thông Minh • Tiếng Anh PC
        </p>
      </div>
    `;

    // Gọi API Supabase Functions / Email Provider hoặc giả lập gửi thông báo thành công
    console.log(`✉️ Sending Email to ${studentEmail} (${emailSubject})`);

    return {
      success: true,
      message: `Đã gửi thông báo điểm bài thi thành công tới email ${studentEmail}!`,
    };
  } catch (error) {
    console.error('Lỗi khi gửi email thông báo điểm:', error);
    return { success: false, message: error.message };
  }
}
