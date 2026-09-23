// BỘ TỔNG HỢP ÂM THANH WEB AUDIO API (KHÔNG DÙNG FILE MP3 NGOÀI, KHÔNG LO LỖI 404)
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// 1. Âm click chuột nảy nhẹ (300Hz -> 600Hz)
export const playClick = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
};

// 2. Hợp âm tinh tinh vui tươi 4 nốt (523Hz, 659Hz, 783Hz, 1046Hz) khi cộng sao hoặc thắng minigame
export const playCorrect = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
    });
  } catch (e) {}
};

// 3. Âm trầm cảnh báo (220Hz -> 150Hz sawtooth) khi trừ điểm nề nếp
export const playDeduct = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.28);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch (e) {}
};

// 4. Hợp âm kèn chiến thắng rộn rã khi xướng tên kèm pháo hoa Confetti
export const playWinner = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const fanfareNotes = [
      { f: 523.25, t: 0, d: 0.12 },
      { f: 659.25, t: 0.12, d: 0.12 },
      { f: 783.99, t: 0.24, d: 0.18 },
      { f: 1046.5, t: 0.45, d: 0.6 },
      { f: 1318.51, t: 0.45, d: 0.6 }, // hòa âm E6
    ];

    fanfareNotes.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, ctx.currentTime + item.t);

      gain.gain.setValueAtTime(0.22, ctx.currentTime + item.t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + item.t + item.d);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + item.t);
      osc.stop(ctx.currentTime + item.t + item.d);
    });
  } catch (e) {}
};

// 5. Tiếng tíc tắc đồng hồ đếm ngược
export const playTick = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(850, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch (e) {}
};

// 6. Tiếng quét radar dồn dập hồi hộp tăng dần tần số trong vòng quay ngẫu nhiên
export const playSuspenseSpin = (stepRatio = 0.5) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Tần số từ 250Hz tăng dần lên 900Hz theo tiến độ quay
    const baseFreq = 250 + stepRatio * 650;
    osc.type = 'square';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (e) {}
};

// 7. Tiếng chuông báo hết giờ thảo luận
export const playTimerAlarm = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const beeps = [0, 0.22, 0.44, 0.66];
    beeps.forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime + t);

      gain.gain.setValueAtTime(0.25, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.16);
    });
  } catch (e) {}
};

// 8. Tiếng tíc tắc cơ học khi bánh xe may mắn lướt qua nan quạt
export const playWheelTick = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.025);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.025);
  } catch (e) {}
};

// 9. Âm teng teng khôi phục điểm ngân vang khi hoàn tác giao dịch
export const playUndoRestore = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [440, 554.37, 659.25]; // A4, C#5, E5
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.07);

      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + i * 0.07 + 0.4);
    });
  } catch (e) {}
};

// 10. Âm thanh nhịp cơ học máy in mini kết hợp chuông hoàn tất
export const playPrintVoucher = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    // Chuỗi tiếng lách cách kéo giấy
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(300 + (i % 2) * 80, ctx.currentTime + i * 0.06);

      gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.04);
    }

    // Chuông ding xong ở cuối
    setTimeout(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1174.66, ctx.currentTime); // D6
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {}
    }, 320);
  } catch (e) {}
};

// 11. Âm thanh ma thuật ánh sáng khi mở hộp quà bí ẩn Gacha
export const playMysteryBoxOpen = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    // Rung kịch tính tần số thấp rồi vút cao
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.7);

    // Vang hợp âm lung linh sau 0.5s
    setTimeout(() => {
      const sparkleNotes = [659.25, 830.61, 987.77, 1318.51];
      sparkleNotes.forEach((freq, idx) => {
        const sOsc = ctx.createOscillator();
        const sGain = ctx.createGain();
        sOsc.type = 'triangle';
        sOsc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        sGain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
        sGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.45);

        sOsc.connect(sGain);
        sGain.connect(ctx.destination);
        sOsc.start(ctx.currentTime + idx * 0.08);
        sOsc.stop(ctx.currentTime + idx * 0.08 + 0.45);
      });
    }, 500);
  } catch (e) {}
};

// 12. Tiếng vịt kêu Quạc Quạc vui nhộn
export const playQuack = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(340, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
};

// 13. Còi xuất phát đua vịt
export const playRaceHorn = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.setValueAtTime(900, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
};

// 14. Tiếng vịt kêu cạc cạc dồn dập 3 tiếng vui nhộn khi về đích
export const playTripleQuack = () => {
  playQuack();
  setTimeout(playQuack, 150);
  setTimeout(playQuack, 320);
};

// 15. Tiếng sóng nước chảy róc rách nhẹ nhàng trong lúc đua
let waterNoiseNode = null;
let waterGainNode = null;

export const startRiverWaterSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (waterNoiseNode) return;

    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(520, ctx.currentTime);
    filter.Q.setValueAtTime(1.8, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.8, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(110, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.4);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
    waterNoiseNode = whiteNoise;
    waterGainNode = gain;
  } catch (e) {}
};

export const stopRiverWaterSound = () => {
  try {
    if (waterGainNode && audioCtx) {
      waterGainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      setTimeout(() => {
        if (waterNoiseNode) {
          try {
            waterNoiseNode.stop();
            waterNoiseNode.disconnect();
          } catch (err) {}
          waterNoiseNode = null;
          waterGainNode = null;
        }
      }, 350);
    } else if (waterNoiseNode) {
      try {
        waterNoiseNode.stop();
      } catch (err) {}
      waterNoiseNode = null;
      waterGainNode = null;
    }
  } catch (e) {}
};

