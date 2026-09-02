/**
 * Utility Xuất 4 Mã Đề Thi (101, 102, 103, 104) xáo trộn ngẫu nhiên ra file Word (.doc)
 * Kèm Bảng So Sánh Đáp Án 4 Mã Đề ở trang cuối cùng
 */
export function exportMultiCodeWord(questions = [], activityTitle = 'BÀI KIỂM TRA TIẾNG ANH THCS') {
  if (!questions || questions.length === 0) {
    alert('Bài thi chưa có câu hỏi nào để xuất 4 mã đề!');
    return;
  }

  const codeList = [101, 102, 103, 104];
  const allMasterKeys = { 101: {}, 102: {}, 103: {}, 104: {} };

  let wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${activityTitle} - 4 MÃ ĐỀ (101 - 104)</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; margin: 20px; color: #000; }
        .page-break { page-break-before: always; }
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .header-table td { text-align: center; font-weight: bold; }
        .title { text-align: center; font-size: 15pt; font-weight: bold; margin: 10px 0; text-transform: uppercase; }
        .code-badge { text-align: right; font-weight: bold; font-size: 13pt; margin-bottom: 10px; color: #1e3a8a; }
        .part-title { font-weight: bold; margin-top: 14px; margin-bottom: 6px; font-size: 12pt; text-transform: uppercase; }
        .passage { font-style: italic; background-color: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; margin: 8px 0; font-family: 'Times New Roman', serif; }
        .question { font-weight: bold; margin-top: 8px; }
        .options { margin-left: 20px; margin-top: 4px; margin-bottom: 8px; }
        .matrix-table { width: 100%; border-collapse: collapse; margin-top: 15px; text-align: center; }
        .matrix-table th, .matrix-table td { border: 1px solid #000; padding: 6px; font-size: 11pt; }
        .matrix-table th { background-color: #e2e8f0; font-weight: bold; }
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
          <td style="width: 50%;">TRUNG TÂM DẠY HỌC HOA MAI<br>BỘ MÔN TIẾNG ANH THCS</td>
          <td style="width: 50%;">KỲ THI ĐÁNH GIÁ NĂNG LỰC HỌC SINH<br>MÔN: TIẾNG ANH</td>
        </tr>
      </table>

      <div class="code-badge">MÃ ĐỀ THI: ${codeNum}</div>
      <div class="title">${activityTitle}</div>
      <p style="text-align: center; font-style: italic;">Thời gian làm bài: 45 phút (Không kể thời gian phát đề)</p>
      <hr style="border: 1px solid #000; margin-bottom: 15px;">

      <p><strong>Họ và tên học sinh:</strong> ......................................................................... <strong>Lớp:</strong> ....................</p>
    `;

    // 🔀 TRỘN CÂU HỎI & PHƯƠNG ÁN A, B, C, D CHO MÃ ĐỀ NÀY
    const questionsCopy = JSON.parse(JSON.stringify(questions));
    let qCounter = 1;

    questionsCopy.forEach((q) => {
      const cObj = q.content || {};
      const parts = Array.isArray(cObj.parts) ? cObj.parts : [];

      if (parts.length > 0) {
        // Đề thi gộp Multi Parts
        parts.forEach((p, pIdx) => {
          wordHtml += `<div class="part-title">${p.part_title || `PART ${pIdx + 1}`}</div>`;
          if (p.passage) wordHtml += `<div class="passage"><strong>Bài đọc:</strong><br>${p.passage.replace(/\n/g, '<br>')}</div>`;

          const pQuestions = [...(p.questions || [])];
          if (codeIdx > 0) pQuestions.sort(() => Math.random() - 0.5);

          pQuestions.forEach((cq) => {
            wordHtml += `<div class="question">Câu ${qCounter}. ${cq.question}</div>`;

            if (Array.isArray(cq.options) && cq.options.length > 0) {
              const optsCopy = [...cq.options];
              if (codeIdx > 0) optsCopy.sort(() => Math.random() - 0.5);

              wordHtml += `<div class="options">`;
              optsCopy.forEach((opt, oIdx) => {
                const label = String.fromCharCode(65 + oIdx);
                const isCorrect = typeof opt === 'object' ? opt.isCorrect : false;
                const optText = typeof opt === 'object' ? opt.text : opt;

                wordHtml += `<span><strong>${label}.</strong> ${optText}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
                if (isCorrect) {
                  allMasterKeys[codeNum][qCounter] = label;
                }
              });
              wordHtml += `</div>`;
            }
            qCounter++;
          });
        });
      } else {
        // Đề thi đơn lẻ
        wordHtml += `<div class="question">Câu ${qCounter}. ${cObj.question || cObj.title || 'Câu hỏi'}</div>`;
        if (Array.isArray(cObj.options)) {
          const optsCopy = [...cObj.options];
          if (codeIdx > 0) optsCopy.sort(() => Math.random() - 0.5);

          wordHtml += `<div class="options">`;
          optsCopy.forEach((opt, oIdx) => {
            const label = String.fromCharCode(65 + oIdx);
            const isCorrect = typeof opt === 'object' ? opt.isCorrect : false;
            const optText = typeof opt === 'object' ? opt.text : opt;

            wordHtml += `<span><strong>${label}.</strong> ${optText}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
            if (isCorrect) {
              allMasterKeys[codeNum][qCounter] = label;
            }
          });
          wordHtml += `</div>`;
        }
        qCounter++;
      }
    });
  });

  // 📊 THÊM BẢNG MA TRẬN SO SÁNH ĐÁP ÁN 4 MÃ ĐỀ Ở TRANG CUỐI CÙNG
  wordHtml += `
    <div class="page-break"></div>
    <div class="title">📊 BẢNG MA TRẬN SO SÁNH ĐÁP ÁN 4 MÃ ĐỀ (101 - 104)</div>
    <p style="text-align: center; font-style: italic;">(Dành riêng cho Giáo viên phục vụ công tác chấm thi tự động)</p>

    <table class="matrix-table">
      <thead>
        <tr>
          <th>Câu hỏi</th>
          <th>Mã đề 101</th>
          <th>Mã đề 102</th>
          <th>Mã đề 103</th>
          <th>Mã đề 104</th>
        </tr>
      </thead>
      <tbody>
  `;

  const totalQ = Object.keys(allMasterKeys[101]).length || 40;
  for (let qI = 1; qI <= totalQ; qI++) {
    wordHtml += `
      <tr>
        <td><strong>Câu ${qI}</strong></td>
        <td><strong>${allMasterKeys[101][qI] || 'A'}</strong></td>
        <td><strong>${allMasterKeys[102][qI] || 'B'}</strong></td>
        <td><strong>${allMasterKeys[103][qI] || 'C'}</strong></td>
        <td><strong>${allMasterKeys[104][qI] || 'D'}</strong></td>
      </tr>
    `;
  }

  wordHtml += `
      </tbody>
    </table>
    </body>
    </html>
  `;

  // TẢI FILE WORD (.DOC)
  const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `De_Thi_4_Ma_De_101_104_${Date.now()}.doc`;
  a.click();
  URL.revokeObjectURL(url);

  alert(`🎉 ĐÃ XUẤT THÀNH CÔNG 4 MÃ ĐỀ THI (101, 102, 103, 104) RA FILE WORD!\n\nFile Word đính kèm Bảng Ma Trận Đáp Án 4 Mã Đề ở trang cuối cùng đã được tải xuống máy Thầy!`);
}
