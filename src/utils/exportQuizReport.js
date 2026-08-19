/**
 * Utility Xuất Báo Cáo PDF Bài Thi Học Sinh & Excel Sổ Điểm Điện Tử VnEdu / Viettel Study
 */

export function exportStudentPdfReport({
  studentName = 'Học Viên',
  activityTitle = 'Bài Thi Quiz',
  score = 0,
  totalMarks = 10,
  correctCount = 0,
  totalQuestions = 0,
  timeTakenStr = '0 phút 0 giây',
  submittedAt = null,
  aiGradingFeedback = '',
}) {
  const formattedDate = submittedAt ? new Date(submittedAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN');
  const isPassed = score >= totalMarks * 0.5;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8">
      <title>KẾT QUẢ BÀI KIỂM TRA - ${studentName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');
        body {
          font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 30px;
          color: #1e293b;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #1e3a8a;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }
        .header h1 {
          color: #1e3a8a;
          font-size: 24px;
          margin: 0 0 5px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .header p {
          color: #64748b;
          font-size: 13px;
          margin: 0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 25px;
          background-color: #f8fafc;
          padding: 18px 24px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .info-label {
          font-weight: 500;
          color: #475569;
          white-space: nowrap;
        }
        .info-value {
          font-weight: 800;
          color: #0f172a;
        }
        .score-box {
          text-align: center;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 25px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .score-box .score-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.9;
        }
        .score-box .score-num {
          font-size: 42px;
          font-weight: 900;
          margin: 5px 0;
        }
        .badge-pass {
          display: inline-block;
          background-color: #22c55e;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }
        .badge-fail {
          display: inline-block;
          background-color: #ef4444;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }
        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 20px 0 10px 0;
          border-left: 4px solid #3b82f6;
          padding-left: 10px;
        }
        .feedback-box {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 15px;
          font-size: 13px;
          line-height: 1.6;
          color: #166534;
          white-space: pre-line;
          margin-bottom: 25px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
          font-size: 11px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>KẾT QUẢ BÀI KIỂM TRA ONLINE</h1>
        <p>Hệ Thống Quản Lý Học Liệu & Đánh Giá Năng Lực Tiếng Anh LMS</p>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Họ và Tên Học Sinh:</span>
          <span class="info-value">${studentName}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Tên Bài Thi:</span>
          <span class="info-value">${activityTitle}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Thời Gian Làm Bài:</span>
          <span class="info-value">${timeTakenStr}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Ngày Nộp Bài:</span>
          <span class="info-value">${formattedDate}</span>
        </div>
      </div>

      <div class="score-box">
        <div class="score-title">TỔNG ĐIỂM ĐẠT ĐƯỢC</div>
        <div class="score-num">${score} / ${totalMarks} ĐIỂM</div>
        <div>
          ${
            isPassed
              ? `<span class="badge-pass">ĐẠT YÊU CẦU (PASSED)</span>`
              : `<span class="badge-fail">CHƯA ĐẠT (NEEDS IMPROVEMENT)</span>`
          }
        </div>
      </div>

      ${
        aiGradingFeedback
          ? `
        <div class="section-title">🤖 LỜI PHÊ & NHẬN XÉT CỦA GIÁO VIÊN AI:</div>
        <div class="feedback-box">${aiGradingFeedback}</div>
      `
          : ''
      }

      <div class="footer">
        Hệ Thống Học Liệu Thông Minh LMS • Tiếng Anh PC • Báo cáo tự động
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
