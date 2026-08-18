/**
 * Utility Xuất Báo Cáo Kết Quả Bài Thi Quiz
 * 1. In / Tải Báo Cáo PDF Bài Thi Học Sinh (HTML Print PDF)
 * 2. Xuất Bảng Điểm Cả Lớp Ra File Excel / CSV (.csv UTF-8 BOM)
 */

export function exportStudentPdfReport({ studentName, activityTitle, score, totalMarks, correctCount, totalQuestions, timeTakenStr, submittedAt, aiGradingFeedback }) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Vui lòng cho phép mở Pop-up trình duyệt để tải/in file PDF báo cáo!');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>BÁO CÁO KẾT QUẢ BÀI THI - ${studentName}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
    .header { text-align: center; border-b: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }
    .header h1 { color: #1e3a8a; margin: 0; font-size: 22px; text-transform: uppercase; }
    .header p { color: #64748b; font-size: 13px; margin-top: 5px; }
    .info-box { display: flex; flex-wrap: wrap; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 25px; }
    .info-item { width: 50%; margin-bottom: 10px; font-size: 13px; }
    .info-item strong { color: #0f172a; }
    .score-card { background: #eff6ff; border: 2px solid #3b82f6; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 25px; }
    .score-number { font-size: 32px; font-weight: 800; color: #1d4ed8; margin: 5px 0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .passed { background: #dcfce7; color: #15803d; }
    .failed { background: #ffe4e6; color: #be123c; }
    .feedback-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 15px; font-size: 13px; margin-top: 20px; }
    .feedback-title { font-weight: bold; color: #166534; margin-bottom: 8px; font-size: 14px; }
    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-t: 1px solid #e2e8f0; padding-top: 15px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
      🖨️ In / Lưu Dạng File PDF
    </button>
  </div>

  <div class="header">
    <h1>KẾT QUẢ BÀI KÍỂM TRA ONLINE</h1>
    <p>Hệ Thống Quản Lý Học Liệu & Đánh Giá Năng Lực Tiếng Anh LMS</p>
  </div>

  <div class="info-box">
    <div class="info-item"><strong>Họ và Tên Học Sinh:</strong> ${studentName}</div>
    <div class="info-item"><strong>Tên Bài Thi:</strong> ${activityTitle || 'Bài Thi Kiểm Tra'}</div>
    <div class="info-item"><strong>Thời Gian Làm Bài:</strong> ${timeTakenStr}</div>
    <div class="info-item"><strong>Ngày Nộp Bài:</strong> ${submittedAt ? new Date(submittedAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN')}</div>
  </div>

  <div class="score-card">
    <div style="font-size: 12px; text-transform: uppercase; color: #475569; font-weight: bold;">ĐIỂM SỐ ĐẠT ĐƯỢC</div>
    <div class="score-number">${score} / ${totalMarks} ĐIỂM</div>
    <div style="font-size: 13px; color: #334155; margin-bottom: 10px;">Trả lời đúng: <strong>${correctCount} / ${totalQuestions}</strong> câu hỏi</div>
    <span class="badge ${score >= totalMarks * 0.5 ? 'passed' : 'failed'}">
      ${score >= totalMarks * 0.5 ? 'VƯỢT QUA KỲ THI 🎉' : 'CHƯA ĐẠT KẾT QUẢ ⚠️'}
    </span>
  </div>

  ${aiGradingFeedback ? `
  <div class="feedback-box">
    <div class="feedback-title">🤖 ĐÁNH GIÁ VÀ NHẬN XÉT CHI TIẾT TỪ AI / GIÁO VIÊN:</div>
    <p style="white-space: pre-line; leading: 1.6;">${aiGradingFeedback}</p>
  </div>
  ` : ''}

  <div class="footer">
    Báo cáo tự động được xuất từ Hệ Thống LMS Học Liệu Thông Minh • Tiếng Anh PC • Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Xuất danh sách kết quả bài làm cả lớp ra file Excel (CSV UTF-8 BOM)
 */
export function exportClassExcelReport(submissionsList, activityTitle = 'Diem_Bai_Thi') {
  if (!submissionsList || submissionsList.length === 0) {
    alert('Không có dữ liệu bài nộp để xuất file Excel!');
    return;
  }

  // Header CSV
  const headers = ['STT', 'Họ và Tên Học Sinh', 'Email', 'Điểm Số', 'Trạng Thái', 'Thời Gian Nộp'];
  const rows = submissionsList.map((sub, idx) => [
    idx + 1,
    `"${sub.profiles?.full_name || 'Học Viên'}"`,
    `"${sub.profiles?.email || 'N/A'}"`,
    sub.score || 0,
    `"${sub.status === 'graded' ? 'Đã chấm điểm' : 'Chờ chấm bài'}"`,
    `"${new Date(sub.submitted_at || Date.now()).toLocaleString('vi-VN')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bang_Diem_${activityTitle.replace(/\s+/g, '_')}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
