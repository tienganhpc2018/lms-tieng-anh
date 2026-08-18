/**
 * Utility Xuất Phiếu Trả Lời Trắc Nghiệm Tô Tròn (OMR Bubble Sheet)
 * Chuẩn định dạng Kỳ thi THPT Quốc Gia (40 - 50 câu) dùng để in ra giấy cho học sinh tô chì 2B
 */
export function exportOmrSheet(title = 'BÀI KÍỂM TRA TIẾNG ANH', totalQuestions = 40) {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>PHIẾU TRẢ LỜI TRẮC NGHIỆM - ${title}</title>
      <style>
        body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.3; margin: 20px; color: #000; }
        .header { text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 5px; text-transform: uppercase; }
        .sub-header { text-align: center; font-size: 11pt; margin-bottom: 15px; font-weight: bold; }
        .box-container { display: flex; justify-content: space-between; border: 2px solid #000; padding: 10px; margin-bottom: 15px; }
        .info-group { line-height: 1.8; }
        .sbd-box { border: 1px solid #000; padding: 5px; width: 120px; text-align: center; font-weight: bold; }
        .instructions { background-color: #f1f5f9; border: 1px border border-slate-400; padding: 8px; font-size: 9.5pt; margin-bottom: 15px; }
        .grid-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .q-table { width: 100%; border-collapse: collapse; }
        .q-table td { padding: 4px 2px; border-bottom: 1px dashed #ccc; font-size: 10pt; }
        .q-num { font-weight: bold; width: 45px; }
        .bubble { display: inline-block; width: 16px; height: 16px; border: 1.5px solid #000; border-radius: 50%; text-align: center; line-height: 16px; font-size: 8pt; font-weight: bold; margin: 0 4px; }
        @media print {
          body { margin: 10mm; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <button class="no-print" onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-bottom: 20px;">
        🖨️ In Phiếu Tô Trắc Nghiệm Ra Giấy
      </button>

      <div class="header">PHIẾU TRẢ LỜI TRẮC NGHIỆM</div>
      <div class="sub-header">${title}</div>

      <div class="box-container">
        <div class="info-group">
          <div><strong>Họ và tên thí sinh:</strong> ....................................................................................</div>
          <div><strong>Ngày sinh:</strong> ...../...../.......... <strong>Lớp:</strong> ....................</div>
          <div><strong>Trường:</strong> ...........................................................................................</div>
        </div>
        <div class="sbd-box">
          SỐ BÁO DANH<br>
          [ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ]<br><br>
          MÃ ĐỀ THI<br>
          [ &nbsp; ][ &nbsp; ][ &nbsp; ]
        </div>
      </div>

      <div class="instructions">
        <strong>⚠️ HƯỚNG DẪN TÔ PHIẾU:</strong><br>
        1. Dùng bút chì 2B tô kín ô tròn đáp án được chọn: <span class="bubble" style="background:#000; color:#fff;">A</span><br>
        2. Không tô dấu tích (✓) hay đánh dấu gạch chéo (✗). Muốn đổi đáp án phải tẩy sạch ô cũ.
      </div>

      <div class="grid-container">
  `;

  const col1Qs = Math.ceil(totalQuestions / 2);

  // Cột 1
  html += `<div><table class="q-table">`;
  for (let i = 1; i <= col1Qs; i++) {
    html += `
      <tr>
        <td class="q-num">Câu ${i}</td>
        <td>
          <span class="bubble">A</span>
          <span class="bubble">B</span>
          <span class="bubble">C</span>
          <span class="bubble">D</span>
        </td>
      </tr>
    `;
  }
  html += `</table></div>`;

  // Cột 2
  html += `<div><table class="q-table">`;
  for (let i = col1Qs + 1; i <= totalQuestions; i++) {
    html += `
      <tr>
        <td class="q-num">Câu ${i}</td>
        <td>
          <span class="bubble">A</span>
          <span class="bubble">B</span>
          <span class="bubble">C</span>
          <span class="bubble">D</span>
        </td>
      </tr>
    `;
  }
  html += `</table></div>`;

  html += `
      </div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}
