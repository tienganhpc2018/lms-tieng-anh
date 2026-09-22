// TIỆN ÍCH PHÁT BIỂU TUYÊN DƯƠNG BẰNG GIỌNG NÓI AI (WEB SPEECH API)
// Tự động phát âm thanh khi học sinh đổi điểm thưởng thành công

export const speakPraise = (studentName, type, valueGained) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Dừng câu đang đọc trước đó nếu có

    let message = '';
    if (type === 'kttx') {
      message = `Chúc mừng em ${studentName} đã xuất sắc quy đổi thành công ${valueGained} điểm kiểm tra thường xuyên! Cả lớp hãy cho một tràng pháo tay nào!`;
    } else {
      message = `Chúc mừng em ${studentName} đã nhận được ${valueGained} sao thưởng vào Cửa Hàng Quà Bốn Chấm Không! Cố gắng phát huy nhé!`;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.05; // Tốc độ đọc hào sảng, vừa phải
    utterance.pitch = 1.1; // Tông giọng vui tươi, phấn khởi

    // Tìm voice tiếng Việt nếu có trong danh sách giọng của thiết bị
    const voices = window.speechSynthesis.getVoices();
    const vietnameseVoice = voices.find((v) => v.lang === 'vi-VN' || v.lang === 'vi' || v.lang.startsWith('vi'));
    if (vietnameseVoice) {
      utterance.voice = vietnameseVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Không thể phát âm thanh giọng nói AI:', err);
  }
};
