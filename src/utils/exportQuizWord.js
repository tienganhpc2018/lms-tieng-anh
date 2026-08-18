/**
 * Utility Xuất Đề Thi Tiếng Anh ra File Word (.doc/.docx) Chuẩn Định Dạng In Giấy
 */
export function exportQuizToWord(questionsInput = [], activityTitle = 'BÀI KIỂM TRA TIẾNG ANH') {
  const safeQuestions = Array.isArray(questionsInput)
    ? questionsInput
    : questionsInput
    ? [questionsInput]
    : [];

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

  safeQuestions.forEach((q, qIdx) => {
    if (!q) return;
    const cObj = q.content || {};
    const parts = Array.isArray(cObj.parts) ? cObj.parts : [];

    if (parts.length > 0) {
      parts.forEach((p, pIdx) => {
        wordHtml += `<div class="part-title">${p.part_title || `PART ${pIdx + 1}`}</div>`;
        if (p.passage) {
          wordHtml += `<div class="passage">${String(p.passage).replace(/\n/g, '<br>')}</div>`;
        }

        (p.questions || []).forEach((cq, cIdx) => {
          const qNum = `${qIdx + 1}.${cIdx + 1}`;
          wordHtml += `<div class="question">${cq.question || ''}</div>`;

          if (Array.isArray(cq.options)) {
            wordHtml += `<div class="options">`;
            cq.options.forEach((opt, oIdx) => {
              const label = String.fromCharCode(65 + oIdx);
              const txt = typeof opt === 'object' ? opt.text : opt;
              wordHtml += `<span>${label}. ${txt || ''}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
              if (typeof opt === 'object' && opt.isCorrect) {
                answerKeys.push({ qNum, key: label });
              }
            });
            wordHtml += `</div>`;
          } else if (cq.correctAnswer) {
            answerKeys.push({ qNum, key: cq.correctAnswer });
          }
        });
      });
    } else {
      const qText = cObj.question || cObj.title || q.type || `Câu ${qIdx + 1}`;
      wordHtml += `<div class="question">Câu ${qIdx + 1}: ${qText}</div>`;
      if (cObj.passage) {
        wordHtml += `<div class="passage">${String(cObj.passage).replace(/\n/g, '<br>')}</div>`;
      }
    }
  });

  if (answerKeys.length > 0) {
    wordHtml += `
      <div class="answer-key">
        <div class="title" style="font-size: 14pt;">BẢNG ĐÁP ÁN CHÍNH THỨC</div>
        <table class="key-table">
          <tr>
            ${answerKeys.map((k) => `<th>${k.qNum}</th>`).join('')}
          </tr>
          <tr>
            ${answerKeys.map((k) => `<td><strong>${k.key}</strong></td>`).join('')}
          </tr>
        </table>
      </div>
    `;
  }

  wordHtml += `</body></html>`;

  const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${activityTitle.replace(/\s+/g, '_')}_De_Thi_Word.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
