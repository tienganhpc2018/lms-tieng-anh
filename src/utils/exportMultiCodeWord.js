/**
 * Utility Xuất 4 Mã Đề Thi (101, 102, 103, 104) xáo trộn ngẫu nhiên ra file Word (.doc)
 * Kèm Bảng So Sánh Đáp Án 4 Mã Đề ở trang cuối cùng
 */
export function exportMultiCodeWord(questions = [], activityTitle = 'BÀI KIỂM TRA TIẾNG ANH') {
  const codeList = [101, 102, 103, 104];
  const allMasterKeys = {};

  let wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${activityTitle} - 4 MÃ ĐỀ</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; margin: 20px; }
        .page-break { page-break-before: always; }
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .header-table td { text-align: center; font-weight: bold; }
        .title { text-align: center; font-size: 15pt; font-weight: bold; margin: 10px 0; text-transform: uppercase; }
        .code-badge { text-align: right; font-weight: bold; font-size: 13pt; margin-bottom: 10px; }
        .part-title { font-weight: bold; margin-top: 12px; margin-bottom: 4px; font-size: 12pt; }
        .passage { font-style: italic; background-color: #f8fafc; padding: 8px; border: 1px solid #cbd5e1; margin: 8px 0; }
        .question { font-weight: bold; margin-top: 6px; }
        .options { margin-left: 20px; }
        .matrix-table { width: 100%; border-collapse: collapse; margin-top: 15px; text-align: center; }
        .matrix-table th, .matrix-table td { border: 1px solid #000; padding: 4px; font-size: 10pt; }
      </style>
    </head>
    <body>
  `;

  codeList.forEach((codeNum, codeIdx) => {
    if (codeIdx > 0) {
      wordHtml += `<div class="page-break"></div>`;
    }

    wordHtml += `
      <table class="header-table">
        <tr>
          <td style="width: 50%;">SỞ GIÁO DỤC & ĐÀO TẠO<br>TRƯỜNG THPT CHUYÊN / CHUẨN</td>
          <td style="width: 50%;">KỲ THI ĐÁNH GIÁ NĂNG LỰC NGOẠI NGỮ<br>MÔN: TIẾNG ANH</td>
        </tr>
      </table>

      <div class="code-badge">MÃ ĐỀ THI: ${codeNum}</div>
      <div class="title">${activityTitle}</div>
      <p style="text-align: center; font-style: italic;">Thời gian làm bài: 45 phút (Không kể thời gian phát đề)</p>
      <hr style="border: 1px solid #000; margin-bottom: 15px;">

      <p><strong>Họ và tên học sinh:</strong> ......................................................................... <strong>Lớp:</strong> ....................</p>
    `;

    // Shuffle câu hỏi & đáp án cho mã đề này
    const shuffledQuestions = [...questions].sort(() => (codeIdx === 0 ? 0 : Math.random() - 0.5));
    const masterKeysForCode = [];

    shuffledQuestions.forEach((q, qIdx) => {
      const cObj = q.content || {};
      const parts = Array.isArray(cObj.parts) ? cObj.parts : [];

      if (parts.length > 0) {
        parts.forEach((p, pIdx) => {
          wordHtml += `<div class="part-title">${p.part_title || `PART ${pIdx + 1}`}</div>`;
          if (p.passage) wordHtml += `<div class="passage">${p.passage.replace(/\n/g, '<br>')}</div>`;

          (p.questions || []).forEach((cq, cIdx) => {
            const qNum = `${qIdx + 1}.${cIdx + 1}`;
            wordHtml += `<div class="question">${qNum}. ${cq.question}</div>`;

            if (Array.isArray(cq.options)) {
              const optsCopy = [...cq.options];
              if (codeIdx > 0) optsCopy.sort(() => Math.random() - 0.5);

              wordHtml += `<div class="options">`;
              optsCopy.forEach((opt, oIdx) => {
                const label = String.fromCharCode(65 + oIdx);
                wordHtml += `<span>${label}. ${opt.text || opt}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
                if (opt.isCorrect) {
                  masterKeysForCode.push({ qNum: qIdx + 1, key: label });
                }
              });
              wordHtml += `</div>`;
            }
          });
        });
      } else {
        wordHtml += `<div class="question">${qIdx + 1}. ${cObj.question || cObj.title || 'Câu hỏi'}</div>`;
        if (Array.isArray(cObj.options)) {
          const optsCopy = [...cObj.options];
          if (codeIdx > 0) optsCopy.sort(() => Math.random() - 0.5);

          wordHtml += `<div class="options">`;
          optsCopy.forEach((opt, oIdx) => {
            const label = String.fromCharCode(65 + oIdx);
            wordHtml += `<span>${label}. ${opt.text || opt}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
            if (opt.isCorrect) {
              masterKeysForCode.push({ qNum: qIdx + 1, key: label });
            }
          });
          wordHtml += `</div>`;
        }
      }
    });

    allMasterKeys[codeNum] = masterKeysForCode;
  });

  // Trang Bảng So Sánh Đáp Án 4 Mã Đề ở cuối cùng
  wordHtml += `
    <div class="page-break"></div>
    <h3 style="text-align: center; text-transform: uppercase;">BẢNG SO SÁNH ĐÁP ÁN 4 MÃ ĐỀ THI (101 - 104)</h3>
    <table class="matrix-table">
      <thead>
        <tr style="background-color: #e2e8f0; font-weight: bold;">
          <th>Câu</th>
          <th>Mã đề 101</th>
          <th>Mã đề 102</th>
          <th>Mã đề 103</th>
          <th>Mã đề 104</th>
        </tr>
      </thead>
      <tbody>
  `;

  const totalQs = allMasterKeys[101]?.length || 10;
  for (let i = 0; i < totalQs; i++) {
    wordHtml += `
      <tr>
        <td style="font-weight: bold;">Câu ${i + 1}</td>
        <td style="font-weight: bold; color: #166534;">${allMasterKeys[101]?.[i]?.key || 'A'}</td>
        <td style="font-weight: bold; color: #1e3a8a;">${allMasterKeys[102]?.[i]?.key || 'B'}</td>
        <td style="font-weight: bold; color: #9a3412;">${allMasterKeys[103]?.[i]?.key || 'C'}</td>
        <td style="font-weight: bold; color: #701a75;">${allMasterKeys[104]?.[i]?.key || 'D'}</td>
      </tr>
    `;
  }

  wordHtml += `
      </tbody>
    </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${activityTitle.replace(/\s+/g, '_')}_4_Ma_De_101_104.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
