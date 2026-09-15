/**
 * Âm thanh chuông chào mừng nhẹ nhàng khi bắt đầu giờ học (Web Audio API Synthesizer)
 * Không cần file MP3 bên ngoài, hoạt động 100% offline, dung lượng 0KB, âm sắc chuông trong trẻo.
 */
let audioCtx = null;

export function playWelcomeChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    // Hợp âm 4 nốt Pentatonic trong trẻo: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const delays = [0, 0.12, 0.24, 0.38];

    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Dùng dạng sóng sine kết hợp tam giác để tạo độ trong và ngân vang
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delays[idx]);

      // Envelope âm lượng: Tăng nhẹ (Attack) và ngân dài (Decay)
      gain.gain.setValueAtTime(0.0001, now + delays[idx]);
      gain.gain.exponentialRampToValueAtTime(0.18, now + delays[idx] + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delays[idx] + 1.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + delays[idx]);
      osc.stop(now + delays[idx] + 1.8);
    });
  } catch (err) {
    console.warn('[AudioChime] Không thể phát âm thanh:', err);
  }
}
