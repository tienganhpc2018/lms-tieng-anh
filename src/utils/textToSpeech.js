/**
 * Utility phát âm AI chuẩn giọng Anh-Mỹ (en-US) / Anh-Anh (en-GB)
 */
export function speakText(text, lang = 'en-US') {
  if (!('speechSynthesis' in window)) {
    alert('Trình duyệt của bạn chưa hỗ trợ phát âm âm thanh speechSynthesis.');
    return;
  }

  // Hủy các giọng đọc cũ đang chạy
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Tốc độ vừa phải cho học sinh dễ nghe
  utterance.pitch = 1.0;

  // Tìm giọng đọc tự nhiên chuẩn nếu có
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voices.find((v) => v.lang === lang || v.lang.includes(lang.replace('-', '_')));
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
