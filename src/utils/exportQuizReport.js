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
      <title>KẾT QUẢ BÀI KÍỂM TRA - ${studentName}</title>
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
          border-b: 3px solid #1e3a8a;
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
          padding: 15px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
        }
        .info-label {
          font-weight: 500;
          color: #475569;
        }
        .info-value {
          font-weight: 700;
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
          font-weight: bold;
        }
        .badge-fail {
          display: inline-block;
          background-color: #ef4444;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        .feedback-section {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
        }
        .feedback-section h3 {
          color: #166534;
          margin-top: 0;
          font-size: 15px;
        }
        .feedback-content {
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-line;
          color: #1e293b;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-t: 1px solid #e2e8f0;
          padding-top: 15px;
        }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <button class="no-print" onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-bottom: 20px;">
        🖨️ In Báo Cáo PDF Bài Thi
      </button>

      <div class="header">
        <h1>KẾT QUẢ BÀI KÍỂM TRA ONLINE</h1>
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
          <span class="${isPassed ? 'badge-pass' : 'badge-fail'}">
            ${isPassed ? 'ĐÃ ĐẠT (PASSED)' : 'CHƯA ĐẠT (NEEDS IMPROVEMENT)'}
          </span>
        </div>
      </div>

      ${aiGradingFeedback ? `
      <div class="feedback-section">
        <h3>💬 LỜI PHÊ & NHẬN XẾT CHI TIẾT TỪ GIÁO VIÊN / AI:</h3>
        <div class="feedback-content">${aiGradingFeedback}</div>
      </div>
      ` : ''}

      <div class="footer">
        Hệ Thống Học Liệu Thông Minh LMS • Tiếng Anh PC • Báo cáo tự động
      </div>
    </body>
    </html>
  `;

  const printWin = window.open('', '_blank');
  printWin.document.write(htmlContent);
  printWin.document.close();
}

/**
 * Xuất File Excel Bảng Điểm Chuẩn Sổ Điểm Điện Tử VnEdu / Viettel Study
 */
export function exportVnEduExcelReport(submissions = [], activityTitle = 'Quiz') {
  let csvContent = '\uFEFF';
  csvContent += 'STT,Mã Học Sinh,Họ và Tên,Email,Điểm Số (Thang 10),Điểm Chữ,Xếp Loại Học Lực,Lời Phê & Nhận Xết Của Giáo Viên,Ngày Nộp Bài\n';

  submissions.forEach((sub, index) => {
    const name = sub.profiles?.full_name || 'Học Viên';
    const email = sub.profiles?.email || 'N/A';
    const studentId = sub.student_id ? sub.student_id.substring(0, 8).toUpperCase() : `HS${1000 + index}`;
    const scoreVal = sub.score !== undefined && sub.score !== null ? Number(sub.score) : 0;

    let scoreChar = 'F';
    let gradeRank = 'Yếu';
    if (scoreVal >= 9.0) { scoreChar = 'A+'; gradeRank = 'Xuất Sắc'; }
    else if (scoreVal >= 8.0) { scoreChar = 'A'; gradeRank = 'Giỏi'; }
    else if (scoreVal >= 6.5) { scoreChar = 'B'; gradeRank = 'Khá'; }
    else if (scoreVal >= 5.0) { scoreChar = 'C'; gradeRank = 'Trung Bình'; }

    const feedbackText = (sub.feedback || sub.answers_data?.aiGrading?.detailedFeedback || 'Đã hoàn thành bài thi').replace(/"/g, '""').replace(/\n/g, ' ');
    const submittedDate = sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('vi-VN') : '';

    csvContent += `"${index + 1}","${studentId}","${name}","${email}","${scoreVal}","${scoreChar}","${gradeRank}","${feedbackText}","${submittedDate}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `So_Diem_Dien_Tu_VnEdu_${activityTitle.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportClassExcelReport(submissions = [], activityTitle = 'Quiz') {
  exportVnEduExcelReport(submissions, activityTitle);
}
