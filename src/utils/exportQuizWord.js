/**
 * Utility Xuất Đề Thi Tiếng Anh ra File Word (.doc/.docx) Chuẩn Định Dạng In Giấy
 */
export function exportQuizToWord(questions = [], activityTitle = 'BÀI KÍỂM TRA TIẾNG ANH') {
  let wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${activityTitle}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; margin: 20px; }
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .header-table td { text-align: center; font-weight: bold; }
        .title { text-align: center; font-size: 16pt; font-weight: bold; margin: 15px 0; text-transform: uppercase; }
        .part-title { font-weight: bold; margin-top: 15px; margin-bottom: 5px; font-size: 13pt; }
        .passage { font-style: italic; background-color: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; margin: 10px 0; }
        .question { font-weight: bold; margin-top: 8px; }
        .options { margin-left: 20px; }
        .answer-key { margin-top: 40px; page-break-before: always; }
        .key-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .key-table th, .key-table td { border: 1px solid #000; padding: 5px; text-align: center; font-size: 11pt; }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td style="width: 50%;">SỞ GIÁO DỤC & ĐÀO TẠO<br>TRƯỜNG THPT CHUYÊN / CHUẨN</td>
          <td style="width: 50%;">KỲ THI ĐÁNH GIÁ NĂNG LỰC NGOẠI NGỮ<br>MÔN: TIẾNG ANH</td>
        </tr>
      </table>

      <div class="title">${activityTitle}</div>
      <p style="text-align: center; font-style: italic;">Thời gian làm bài: 45 phút (Không kể thời gian phát đề)</p>
      <hr style="border: 1px solid #000; margin-bottom: 20px;">

      <p><strong>Họ và tên học sinh:</strong> ......................................................................... <strong>Lớp:</strong> ....................</p>
  `;

  const answerKeys = [];

  questions.forEach((q, qIdx) => {
    const cObj = q.content || {};
    const parts = Array.isArray(cObj.parts) ? cObj.parts : [];

    if (parts.length > 0) {
      parts.forEach((p, pIdx) => {
        wordHtml += `<div class="part-title">${p.part_title || `PART ${pIdx + 1}`}</div>`;
        if (p.passage) {
          wordHtml += `<div class="passage">${p.passage.replace(/\n/g, '<br>')}</div>`;
        }

        (p.questions || []).forEach((cq, cIdx) => {
          const qNum = `${qIdx + 1}.${cIdx + 1}`;
          wordHtml += `<div class="question">${cq.question}</div>`;

          if (Array.isArray(cq.options)) {
            wordHtml += `<div class="options">`;
            cq.options.forEach((opt, oIdx) => {
              const label = String.fromCharCode(65 + oIdx);
              wordHtml += `<span>${label}. ${opt.text || opt}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
              if (opt.isCorrect) {
                answerKeys.push({ num: qNum, key: label, explanation: cq.explanation || p.explanation });
              }
            });
            wordHtml += `</div>`;
          }
        });
      });
    } else {
      wordHtml += `<div class="question">${qIdx + 1}. ${cObj.question || cObj.title || 'Câu hỏi'}</div>`;
      if (Array.isArray(cObj.options)) {
        wordHtml += `<div class="options">`;
        cObj.options.forEach((opt, oIdx) => {
          const label = String.fromCharCode(65 + oIdx);
          wordHtml += `<span>${label}. ${opt.text || opt}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
          if (opt.isCorrect) {
            answerKeys.push({ num: `${qIdx + 1}`, key: label, explanation: cObj.explanation });
          }
        });
        wordHtml += `</div>`;
      }
    }
  });

  // Trang Bảng Đáp Án & Hướng Dẫn Chấm ở cuối
  wordHtml += `
    <div class="answer-key">
      <h3 style="text-align: center; text-transform: uppercase;">BẢNG ĐÁP ÁN & HƯỚNG DẪN CHẤM CHI TIẾT</h3>
      <table class="key-table">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th>Câu số</th>
            <th>Đáp án đúng</th>
            <th>Hướng dẫn giải chi tiết</th>
          </tr>
        </thead>
        <tbody>
  `;

  answerKeys.forEach((item) => {
    wordHtml += `
      <tr>
        <td style="font-weight: bold;">${item.num}</td>
        <td style="font-weight: bold; color: #166534;">${item.key}</td>
        <td style="text-align: left;">${item.explanation || 'Đáp án chính xác theo đề thi.'}</td>
      </tr>
    `;
  });

  wordHtml += `
        </tbody>
      </table>
    </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${activityTitle.replace(/\s+/g, '_')}_De_In_Giay.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
