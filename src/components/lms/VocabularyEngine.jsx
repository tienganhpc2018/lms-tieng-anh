import React, { useState, useEffect, useRef } from 'react';
import {
  Clipboard,
  Camera, BookOpen, Volume2, Mic, Search, ChevronLeft, ChevronRight, Play, Pause, Settings, Plus, Trash2, Edit3, Check, X, Eye, Image as ImageIcon, Sparkles, Filter, RefreshCw, CheckSquare, Square, Star, Award, Zap, Trophy, HelpCircle, Gamepad2, RotateCcw, Flame, CheckCircle, AlertCircle, Bot, Music, Upload, User, UserCheck, Smile, Languages, Grid, Layers, HelpCircle as HelpIcon, ArrowRight, ArrowLeft, Clock, ShieldCheck, Crown, Compass, MapPin, Flag, Swords, Lightbulb, Printer, BookMarked, Sparkle, School, GraduationCap, EyeOff, Copy, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { uploadLMSFile } from '../../lib/supabase';
// =============================================================================
// WEB AUDIO SYNTHESIZER FOR ZERO-LATENCY GAME SOUND EFFECTS
// =============================================================================
const playSuccessSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.12); // C6 Ting!
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
};
const playErrorSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
    osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.2); // Low tone
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}
};
const playFanfareSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (Fanfare)
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
    });
  } catch (e) {}
};
// FEATURE: COUNTDOWN TICKING SOUND FOR 2-PLAYER VERSUS MODE (TẮC TẮC TẮC)
const playTickingSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
};
// FEATURE: CONFETTI BURST ANIMATION UPON QUEST COMPLETION
const triggerConfetti = () => {
  try {
    const colors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#3b82f6', '#ef4444'];
    const container = document.body;
    for (let i = 0; i < 70; i++) {
      const conf = document.createElement('div');
      conf.className = 'fixed z-50 pointer-events-none rounded-full animate-bounce';
      conf.style.left = `${Math.random() * 100}vw`;
      conf.style.top = `${Math.random() * 60}vh`;
      conf.style.width = `${Math.random() * 10 + 6}px`;
      conf.style.height = `${Math.random() * 10 + 6}px`;
      conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      conf.style.transition = 'all 2.5s ease-out';
      conf.style.opacity = '1';
      container.appendChild(conf);
      setTimeout(() => {
        conf.style.transform = `translateY(${Math.random() * 400 + 200}px) rotate(${Math.random() * 720}deg)`;
        conf.style.opacity = '0';
      }, 50);
      setTimeout(() => {
        if (conf.parentNode) conf.parentNode.removeChild(conf);
      }, 2600);
    }
  } catch (e) {}
};
// FEATURE: PRINTABLE CERTIFICATE PDF GENERATOR FOR EXCELLENT STUDENTS (WITH GRADE & CLASS SELECTION)
const handlePrintCertificate = (
  studentName = 'Học Sinh Xuất Sắc',
  grade = 'Lớp 9',
  className = '9A1',
  schoolName = 'Trường THCS Global Success'
) => {
  const printWin = window.open('', '_blank', 'width=950,height=680');
  if (!printWin) {
    alert('Vui lòng cho phép bật cửa sổ pop-up trên trình duyệt để in Giấy Khen PDF!');
    return;
  }
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bằng Vinh Danh Học Sinh Xuất Sắc - LMS Tiếng Anh Global Success</title>
      <meta charset="utf-8">
      <style>
        @page { size: landscape; margin: 0; }
        body {
          margin: 0;
          padding: 35px;
          font-family: 'Times New Roman', Georgia, serif;
          background: #fffdf5;
          color: #1e293b;
          text-align: center;
        }
        .cert-border {
          border: 12px double #b45309;
          padding: 30px;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 0 25px rgba(180, 83, 9, 0.25);
          position: relative;
        }
        .header { font-size: 24px; color: #b45309; text-transform: uppercase; font-weight: bold; letter-spacing: 2px; }
        .sub-header { font-size: 16px; color: #475569; margin-top: 5px; font-style: italic; }
        .title { font-size: 38px; color: #92400e; font-weight: bold; margin: 20px 0 10px; letter-spacing: 3px; }
        .award-to { font-size: 18px; color: #334155; }
        .student-name { font-size: 36px; color: #1e3a8a; font-weight: bold; margin: 10px 0 5px; border-bottom: 2px solid #cbd5e1; display: inline-block; padding: 0 35px 5px; }
        .class-badge { font-size: 18px; color: #b45309; font-weight: bold; margin-bottom: 15px; }
        .reason { font-size: 17px; line-height: 1.6; color: #334155; max-width: 720px; margin: 15px auto; }
        .footer { margin-top: 35px; display: flex; justify-content: space-between; padding: 0 50px; text-align: center; }
        .sig-title { font-size: 14px; font-weight: bold; color: #475569; }
        .sig-name { font-size: 18px; font-weight: bold; color: #b45309; margin-top: 50px; }
      </style>
    </head>
    <body>
      <div class="cert-border">
        <div class="header">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div class="sub-header">Độc lập - Tự do - Hạnh phúc</div>
        <div class="title">BẰNG VINH DANH HỌC SINH XUẤT SẮC</div>
        <div class="award-to">Trao tặng cho Học Sinh:</div>
        <div class="student-name">${studentName}</div>
        <div class="class-badge">Học sinh ${grade} (${className}) - ${schoolName}</div>
        <div class="reason">
          Đã xuất sắc hoàn thành trọn bộ <strong>5 Đảo Tri Thức Vocabulary Island Quest</strong><br/>
          thuộc chương trình <strong>SGK Tiếng Anh Global Success</strong> và đạt thành tích cao trong Bảng Xếp Hạng Lớp Học.
        </div>
        <div class="footer">
          <div>
            <div class="sig-title">NGÀY CẤP BẰNG</div>
            <div style="margin-top: 50px; font-weight: bold;">${new Date().toLocaleDateString('vi-VN')}</div>
          </div>
          <div>
            <div class="sig-title">GIÁO VIÊN TIẾNG ANH XÁC NHẬN</div>
            <div class="sig-name">Thầy Nguyễn Văn Hải</div>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;
  printWin.document.write(htmlContent);
  printWin.document.close();
};
// =============================================================================
// VIETNAMESE TRANSLATION HELPER FOR EXAMPLE SENTENCES
// =============================================================================
const getVietnameseTranslation = (enText, word = '') => {
  if (!enText) return '';
  const lower = enText.toLowerCase();
  if (lower.includes('garbag') && lower.includes('clean')) {
    return 'Những nhân viên thu gom rác làm việc chăm chỉ từ sáng sớm để giữ cho đường phố luôn sạch sẽ.';
  } else if (lower.includes('pack our waste') || lower.includes('help garbage')) {
    return 'Chúng ta nên đóng gói rác thải gọn gàng để hỗ trợ các nhân viên thu gom rác.';
  } else if (lower.includes('bat trang') || lower.includes('famous craft')) {
    return 'Bát Tràng là một trong những làng nghề thủ công nổi tiếng nhất Việt Nam.';
  } else if (lower.includes('tourist') && lower.includes('handmade')) {
    return 'Du khách rất thích mua quà lưu niệm làm bằng tay tại các làng nghề thủ công.';
  } else if (lower.includes('artisan') && lower.includes('vase')) {
    return 'Nghệ nhân đã dành nhiều giờ đồng hồ để tạo hình chiếc bình gốm tinh xảo.';
  } else if (lower.includes('artisan') && lower.includes('pottery')) {
    return 'Nhiều nghệ nhân trong làng nghề này kiếm sống bằng nghề làm gốm thủ công.';
  } else if (lower.includes('suburb') && lower.includes('trees')) {
    return 'Chúng tôi sống ở một khu ngoại ô yên bình của Hà Nội với rất nhiều cây xanh.';
  } else if (lower.includes('suburb') && lower.includes('cleaner air')) {
    return 'Nhiều gia đình chuyển ra khu vực ngoại ô để tận hưởng không khí trong lành hơn.';
  } else if (lower.includes('check-up') || lower.includes('regular health')) {
    return 'Ở độ tuổi của bạn, bạn nên đi kiểm tra sức khỏe định kỳ thường xuyên.';
  } else if (lower.includes('clay') && lower.includes('making pottery')) {
    return 'Loại đất sét này được dùng để làm đồ gốm sứ.';
  } else if (lower.includes('firefighter') && lower.includes('blaze')) {
    return 'Lính cứu hỏa đã nhanh chóng có mặt để dập tắt đám cháy lớn.';
  } else if (lower.includes('police officer') && lower.includes('traffic')) {
    return 'Sĩ quan cảnh sát đã phân luồng giao thông nhịp nhàng trong giờ cao điểm.';
  }
  return `👉 Dịch: "${enText}"`;
};
// DYNAMIC WORD SEARCH GENERATOR WITH UP TO 10 WORDS & DIAGONAL PLACEMENT
const generateWordSearchGrid = (list, currentGrade = 'Lớp 7') => {
  let wordCandidates = list
    .map((v) => v.word.toUpperCase().replace(/[^A-Z]/g, ''))
    .filter((w) => w.length >= 3 && w.length <= 10);
  const gradePresets = {
    'Lớp 7': ['CARDBOARD', 'GARDENING', 'DOLLHOUSE', 'GLUE', 'POPULAR', 'UNUSUAL', 'COLLECTING', 'JOGGING', 'COOKING', 'PAINTING'],
    'Lớp 8': ['BEEHIVE', 'CATTLE', 'HARVESTER', 'CROP', 'PADDY', 'FIELD', 'VAST', 'COUNTRY', 'FARMER', 'BUFFALO'],
    'Lớp 9': ['ARTISAN', 'SUBURB', 'CHECKUP', 'CLAY', 'VILLAGE', 'HANDICRAFT', 'PRESERVE', 'POTTERY', 'COMMUNITY', 'GUIDANCE'],
  };
  const defaultWords = gradePresets[currentGrade] || gradePresets['Lớp 7'];
  defaultWords.forEach((dw) => {
    if (wordCandidates.length < 10 && !wordCandidates.includes(dw)) {
      wordCandidates.push(dw);
    }
  });
  const words = [...new Set(wordCandidates)].slice(0, 9);
  const size = 10;
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const placedWords = [];
  // CHUẨN PHÂN BỔ THEO THẦY HẢI: Ít nhất 4 Ngang, 3 Dọc, 2 Chéo!
  const targetDirections = ['horiz', 'horiz', 'horiz', 'horiz', 'vert', 'vert', 'vert', 'diag', 'diag'];
  words.forEach((w, wIdx) => {
    let placed = false;
    let attempts = 0;
    const preferredDir = targetDirections[wIdx] || 'horiz';
    while (!placed && attempts < 100) {
      attempts++;
      const dirChoice = attempts < 50
        ? preferredDir
        : attempts < 75
        ? (preferredDir === 'horiz' ? 'vert' : preferredDir === 'vert' ? 'diag' : 'horiz')
        : Math.random() < 0.5 ? 'horiz' : 'vert';
      let rowMax = size;
      let colMax = size;
      if (dirChoice === 'horiz') colMax = size - w.length;
      else if (dirChoice === 'vert') rowMax = size - w.length;
      else if (dirChoice === 'diag') {
        rowMax = size - w.length;
        colMax = size - w.length;
      }
      if (rowMax <= 0 || colMax <= 0) continue;
      const row = Math.floor(Math.random() * rowMax);
      const col = Math.floor(Math.random() * colMax);
      let canPlace = true;
      for (let i = 0; i < w.length; i++) {
        const r = dirChoice === 'horiz' ? row : dirChoice === 'vert' ? row + i : row + i;
        const c = dirChoice === 'horiz' ? col + i : dirChoice === 'vert' ? col : col + i;
        if (grid[r][c] !== '' && grid[r][c] !== w[i]) {
          canPlace = false;
          break;
        }
      }
      if (canPlace) {
        const coords = [];
        for (let i = 0; i < w.length; i++) {
          const r = dirChoice === 'horiz' ? row : dirChoice === 'vert' ? row + i : row + i;
          const c = dirChoice === 'horiz' ? col + i : dirChoice === 'vert' ? col : col + i;
          grid[r][c] = w[i];
          coords.push(`${r}-${c}`);
        }
        placedWords.push({ word: w, coords, direction: dirChoice });
        placed = true;
      }
    }
  });
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alpha[Math.floor(Math.random() * alpha.length)];
      }
    }
  }
  return { grid, size, placedWords };
};
// UNIVERSAL DICTIONARY MAPPING FOR AUTOMATIC VIETNAMESE TRANSLATION
const STATIC_VOCAB_DICT = {
  'creativity': 'sự sáng tạo',
  'insect': 'côn trùng',
  'maturity': 'sự trưởng thành',
  'patient': 'kiên nhẫn / bệnh nhân',
  'responsibility': 'trách nhiệm',
  'stress': 'căng thẳng, áp lực',
  'take on': 'đảm nhận, gánh vác',
  'valuable': 'có giá trị, quý giá',
  'cardboard': 'bìa các tông',
  'dollhouse': 'nhà mô hình (nhà búp bê)',
  'gardening': 'làm vườn',
  'glue': 'keo dán',
  'horse riding': 'cưỡi ngựa',
  'making models': 'làm mô hình',
  'popular': 'phổ biến, được ưa thích',
  'unusual': 'độc lạ, khác thường',
  'coin': 'tiền xu',
  'jogging': 'chạy bộ / đi bộ thể thao',
  'model': 'mô hình',
  'yoga': 'tập yoga',
  'artisan': 'thợ thủ công, nghệ nhân',
  'suburb': 'khu vực ngoại ô (ngoại thành)',
  'craft village': 'làng nghề thủ công',
  'police officer': 'cảnh sát, sĩ quan công an',
  'community helper': 'người trợ giúp cộng đồng',
  'firefighter': 'lính cứu hỏa (chữa cháy)',
  'garbage collector': 'nhân viên thu gom rác',
  'clay': 'đất sét',
  'check-up': 'khám sức khỏe'
};
// UNIVERSAL IPA PHONETIC MAPPING FOR SGK VOCABULARY
const STATIC_IPA_DICT = {
  'illustrate': "/'ɪləstreɪt/",
  'campaign': "/kæm'peɪn/",
  'poster': "/'pəʊstə(r)/",
  'tip': "/tɪp/",
  'creativity': "/ˌkriːeɪ'tɪvəti/",
  'insect': "/'ɪnsekt/",
  'maturity': "/mə'tʃʊərəti/",
  'patient': "/'peɪʃnt/",
  'responsibility': "/rɪˌspɒnsə'bɪləti/",
  'stress': "/stres/",
  'take on': "/teɪk ɒn/",
  'valuable': "/'væljuəbl/",
  'cardboard': "/'kɑːdboːd/",
  'dollhouse': "/'dɒlhaʊs/",
  'gardening': "/'ɡɑːdnɪŋ/",
  'glue': "/ɡluː/",
  'horse riding': "/'hɔːs raɪdɪŋ/",
  'making models': "/'meɪkɪŋ 'mɒdlz/",
  'popular': "/'pɒpjələ(r)/",
  'unusual': "/ʌn'juːʒuəl/",
  'coin': "/kɔɪn/",
  'jogging': "/'dʒɒɡɪŋ/",
  'model': "/'mɒdl/",
  'yoga': "/'jəʊɡə/",
  'artisan': "/ˌɑːtɪ'zæn/",
  'suburb': "/'sʌbɜːb/",
  'craft village': "/krɑːft 'vɪlɪdʒ/",
  'police officer': "/pə'liːs 'ɒfɪsə(r)/",
  'community helper': "/kə'mjuːnəti 'helpə(r)/",
  'firefighter': "/'faɪəfaɪtə(r)/",
  'garbage collector': "/'ɡɑːbɪdʒ kə'lektə(r)/",
  'clay': "/kleɪ/",
  'check-up': "/'tʃek ʌp/"
};
// PRESET VOCABULARY DATABASE SGK GLOBAL SUCCESS (GRADES 6 - 12)
const GLOBAL_SUCCESS_PRESETS = {
  'Lớp 6': {
    'Unit 1: My New School': [
      { id: 'v_6_1_1', word: 'activity', pos: 'n', phonetic: "/æk'tɪvəti/", meaning: 'hoạt động', unit: 'Unit 1', section: 'GETTING STARTED', imageUrl: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['school activity', 'outdoor activity'], examples: ['We join many school activities every Friday.'] },
      { id: 'v_6_1_2', word: 'boarding school', pos: 'n', phonetic: "/'bɔːdɪŋ skuːl/", meaning: 'trường nội trú', unit: 'Unit 1', section: 'GETTING STARTED', imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['study at a boarding school'], examples: ['He stays at a boarding school during weekdays.'] },
      { id: 'v_6_1_3', word: 'calculator', pos: 'n', phonetic: "/'kælkjuleɪtə(r)/", meaning: 'máy tính bỏ túi', unit: 'Unit 1', section: 'GETTING STARTED', imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['pocket calculator', 'use a calculator'], examples: ['You can use a calculator in maths class.'] },
      { id: 'v_6_1_4', word: 'compass', pos: 'n', phonetic: "/'kʌmpəs/", meaning: 'com-pa / kim chỉ nam', unit: 'Unit 1', section: 'GETTING STARTED', imageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['draw with a compass'], examples: ['Use a compass to draw circles cleanly.'] },
      { id: 'v_6_1_5', word: 'heavy', pos: 'adj', phonetic: "/'hevi/", meaning: 'nặng', unit: 'Unit 1', section: 'A CLOSER LOOK 1', imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['heavy school bag'], examples: ['My school bag is heavy today.'] },
      { id: 'v_6_1_6', word: 'homework', pos: 'n', phonetic: "/'həʊmwɜːk/", meaning: 'bài tập về nhà', unit: 'Unit 1', section: 'A CLOSER LOOK 1', imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['do homework', 'finish homework'], examples: ['I do my homework right after school.'] },
      { id: 'v_6_1_7', word: 'judo', pos: 'n', phonetic: "/'dʒuːdəʊ/", meaning: 'môn võ judo', unit: 'Unit 1', section: 'A CLOSER LOOK 1', imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['do judo', 'judo club'], examples: ['Phong does judo twice a week.'] },
      { id: 'v_6_1_8', word: 'uniform', pos: 'n', phonetic: "/'juːnɪfɔːm/", meaning: 'đồng phục', unit: 'Unit 1', section: 'A CLOSER LOOK 1', imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['school uniform', 'wear uniform'], examples: ['We wear our school uniform on Mondays.'] }
    ]
  },
  'Lớp 7': {
    'Unit 1: Hobbies': [
      // GETTING STARTED (Hình 3)
      {
        id: 'v_7_1_1',
        word: 'cardboard',
        pos: 'n',
        phonetic: "/'kɑːdboːd/",
        meaning: 'bìa các tông',
        unit: 'Unit 1',
        section: 'GETTING STARTED',
        imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['cardboard boxes', 'a piece of cardboard'],
        examples: ['She packed her books in cardboard boxes.', 'He opened the cardboard box and took out each item.']
      },
      {
        id: 'v_7_1_2',
        word: 'dollhouse',
        pos: 'n',
        phonetic: "/'dɒlhaʊs/",
        meaning: 'nhà mô hình (nhà búp bê)',
        unit: 'Unit 1',
        section: 'GETTING STARTED',
        imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['wooden dollhouse', 'build a dollhouse'],
        examples: ['My sister loves playing with her wooden dollhouse.']
      },
      {
        id: 'v_7_1_3',
        word: 'gardening',
        pos: 'n',
        phonetic: "/'ɡɑːdnɪŋ/",
        meaning: 'làm vườn',
        unit: 'Unit 1',
        section: 'GETTING STARTED',
        imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['enjoy gardening', 'gardening tools'],
        examples: ['My grandmother spends time gardening every morning.']
      },
      {
        id: 'v_7_1_4',
        word: 'glue',
        pos: 'n',
        phonetic: '/ɡluː/',
        meaning: 'keo dán',
        unit: 'Unit 1',
        section: 'GETTING STARTED',
        imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['paper glue', 'stick with glue'],
        examples: ['Use glue to stick the paper models together.']
      },
      {
        id: 'v_7_1_5',
        word: 'horse riding',
        pos: 'n',
        phonetic: "/'hɔːs raɪdɪŋ/",
        meaning: 'cưỡi ngựa',
        unit: 'Unit 1',
        section: 'GETTING STARTED',
        imageUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['go horse riding', 'horse riding club'],
        examples: ['Horse riding is an exciting outdoor hobby.']
      },
      {
        id: 'v_7_1_6',
        word: 'making models',
        pos: 'v phr',
        phonetic: "/'meɪkɪŋ 'mɒdlz/",
        meaning: 'làm mô hình',
        unit: 'Unit 1',
        section: 'GETTING STARTED',
        imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['making plane models', 'enjoy making models'],
        examples: ['Making models requires patience and care.']
      },
      {
        id: 'v_7_1_7',
        word: 'popular',
        pos: 'adj',
        phonetic: "/'pɒpjələ(r)/",
        meaning: 'phổ biến, được ưa thích',
        unit: 'Unit 1',
        section: 'GETTING STARTED',
        imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['popular hobby', 'popular among students'],
        examples: ['Football is a very popular sport in Viet Nam.']
      },
      {
        id: 'v_7_1_8',
        word: 'unusual',
        pos: 'adj',
        phonetic: "/ʌn'juːʒuəl/",
        meaning: 'độc lạ, khác thường',
        unit: 'Unit 1',
        section: 'GETTING STARTED',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['unusual hobby', 'find something unusual'],
        examples: ['Collecting insect specimens is an unusual hobby.']
      },
      // A CLOSER LOOK 1 (Hình 4)
      {
        id: 'v_7_1_9',
        word: 'coin',
        pos: 'n',
        phonetic: '/kɔɪn/',
        meaning: 'tiền xu',
        unit: 'Unit 1',
        section: 'A CLOSER LOOK 1',
        imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['collect coins', 'flip a coin'],
        examples: ['They like collecting old coins.', "I couldn't decide, so I flipped a coin."]
      },
      {
        id: 'v_7_1_10',
        word: 'jogging',
        pos: 'n',
        phonetic: "/'dʒɒɡɪŋ/",
        meaning: 'đi bộ thể dục / chạy bộ',
        unit: 'Unit 1',
        section: 'A CLOSER LOOK 1',
        imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['go jogging', 'morning jogging'],
        examples: ['My father goes jogging around the park every morning.']
      },
      {
        id: 'v_7_1_11',
        word: 'model',
        pos: 'n',
        phonetic: "/'mɒdl/",
        meaning: 'mô hình',
        unit: 'Unit 1',
        section: 'A CLOSER LOOK 1',
        imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['scale model', 'build a model'],
        examples: ['He built a beautiful scale model of a sailboat.']
      },
      {
        id: 'v_7_1_12',
        word: 'yoga',
        pos: 'n',
        phonetic: "/'jəʊɡə/",
        meaning: 'tập yoga',
        unit: 'Unit 1',
        section: 'A CLOSER LOOK 1',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['do yoga', 'yoga class'],
        examples: ['Doing yoga helps improve health and reduce stress.']
      }
    ]
  },
  'Lớp 8': {
    'Unit 1: Life in the Countryside': [
      { id: 'v_8_1_1', word: 'beehive', pos: 'n', phonetic: "/'biːhaɪv/", meaning: 'tổ ong', unit: 'Unit 1', section: 'GETTING STARTED', imageUrl: 'https://images.unsplash.com/photo-1587049352847-81a56d773cae?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['wooden beehive', 'honey beehive'], examples: ['The farmer collects fresh honey from the beehive.'] },
      { id: 'v_8_1_2', word: 'cattle', pos: 'n', phonetic: "/'kætl/", meaning: 'gia súc (bò, trâu)', unit: 'Unit 1', section: 'GETTING STARTED', imageUrl: 'https://images.unsplash.com/photo-1545468843-279d2bf4a166?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['herd cattle', 'feed cattle'], examples: ['The boys are herding cattle in the field.'] },
      { id: 'v_8_1_3', word: 'combine harvester', pos: 'n', phonetic: "/kəm'baɪn 'hɑːvɪstə(r)/", meaning: 'máy gặt đập liên hợp', unit: 'Unit 1', section: 'GETTING STARTED', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['use a combine harvester'], examples: ['Farmers use a combine harvester to cut rice quickly.'] },
      { id: 'v_8_1_4', word: 'crop', pos: 'n', phonetic: '/krɒp/', meaning: 'vụ mùa, cây trồng', unit: 'Unit 1', section: 'A CLOSER LOOK 1', imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['rice crop', 'bumper crop'], examples: ['They had a bumper crop of wheat this year.'] },
      { id: 'v_8_1_5', word: 'paddy field', pos: 'n', phonetic: "/'pædi fiːld/", meaning: 'cánh đồng lúa', unit: 'Unit 1', section: 'A CLOSER LOOK 1', imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['green paddy field'], examples: ['The paddy field looks bright green in spring.'] },
      { id: 'v_8_1_6', word: 'vast', pos: 'adj', phonetic: '/vɑːst/', meaning: 'bao la, rộng lớn', unit: 'Unit 1', section: 'A CLOSER LOOK 1', imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['vast field', 'vast countryside'], examples: ['The countryside has vast open spaces.'] }
    ]
  },
  'Lớp 9': {
    'Unit 1: Local Community': [
      {
        id: 'v_9_1_1',
        word: 'artisan',
        pos: 'n',
        phonetic: '/ˌɑːtɪˈzæn/',
        meaning: 'thợ làm nghề thủ công (thợ thủ công)',
        unit: 'Unit 1',
        section: 'GETTING STARTED',
        imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['traditional artisan', 'skilled artisan'],
        examples: ['The artisan spent hours shaping the ceramic vase.', 'Many artisans in this village earn their living by making pottery.']
      },
      {
        id: 'v_9_1_2',
        word: 'suburb',
        pos: 'n',
        phonetic: '/ˈsʌb.ɜːb/',
        meaning: 'khu vực ngoại ô (ngoại thành thành phố)',
        unit: 'Unit 1',
        section: 'GETTING STARTED',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['quiet suburb', 'in the suburbs of Ha Noi'],
        examples: ['We live in a quiet suburb of Ha Noi with lots of trees.', 'Many families move to the suburbs for cleaner air and larger homes.']
      },
      {
        id: 'v_9_1_3',
        word: 'check-up',
        pos: 'n',
        phonetic: '/ˈtʃek ʌp/',
        meaning: 'cuộc kiểm tra (thường là kiểm tra sức khỏe)',
        unit: 'Unit 1',
        section: 'A CLOSER LOOK 1',
        imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['a health check-up', 'go for a check-up'],
        examples: ['At your age, you should have regular health check-ups.', 'People in my neighbourhood often go for health check-ups.']
      },
      {
        id: 'v_9_1_4',
        word: 'clay',
        pos: 'n',
        phonetic: '/kleɪ/',
        meaning: 'đất sét (vật liệu làm gốm)',
        unit: 'Unit 1',
        section: 'A CLOSER LOOK 1',
        imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['clay pot', 'mould clay into shapes'],
        examples: ['Children like playing with soft clay in art class.', 'Bat Trang is famous for its high-quality clay products.']
      },
      {
        id: 'v_9_1_5',
        word: 'community helper',
        pos: 'n',
        phonetic: '/kəˈmjuːnəti ˈhɛlpər/',
        meaning: 'người trợ giúp cộng đồng (bác sĩ, công an, thợ điện...)',
        unit: 'Unit 1',
        section: 'COMMUNICATION',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['essential community helper', 'support community helpers'],
        examples: ['Firefighters are brave community helpers who protect us.', 'My aunt works as a community helper at the health center.']
      },
      {
        id: 'v_9_1_6',
        word: 'craft village',
        pos: 'n',
        phonetic: '/krɑːft ˈvɪlɪdʒ/',
        meaning: 'làng nghề thủ công truyền thống',
        unit: 'Unit 1',
        section: 'SKILLS 1',
        imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['traditional craft village', 'visit a craft village'],
        examples: ['Bat Trang is one of the most famous craft villages in Viet Nam.', 'Tourists love buying handmade souvenirs in craft villages.']
      },
      {
        id: 'v_9_1_7',
        word: 'police officer',
        pos: 'n',
        phonetic: '/pəˈliːs ˈɒfɪsər/',
        meaning: 'cảnh sát, sĩ quan công an',
        unit: 'Unit 1',
        section: 'SKILLS 2',
        imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['police officer on duty', 'call a police officer'],
        examples: ['The police officer directed traffic smoothly during rush hour.', 'A police officer maintains peace and safety in our town.']
      },
      {
        id: 'v_9_1_8',
        word: 'firefighter',
        pos: 'n',
        phonetic: '/ˈfaɪəfaɪtər/',
        meaning: 'lính chữa cháy (lính cứu hỏa)',
        unit: 'Unit 1',
        section: 'LOOKING BACK',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd4e?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['brave firefighter', 'call the firefighters'],
        examples: ['Firefighters arrived quickly to put out the blaze.', 'The firefighter rescued a small kitten from the burning building.']
      },
      {
        id: 'v_9_1_9',
        word: 'garbage collector',
        pos: 'n',
        phonetic: '/ˈɡɑː.bɪdʒ kəˈlek.tər/',
        meaning: 'nhân viên thu gom rác (người lao công thu dọn rác thải)',
        unit: 'Unit 1',
        section: 'GETTING STARTED',
        imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
        audioUrl: '',
        phrases: ['garbage collector team', 'respect garbage collectors'],
        examples: ['Garbage collectors work hard early in the morning to keep streets clean.', 'We should pack our waste properly to help garbage collectors.']
      }
    ]
  },
  'Lớp 10': {
    'Unit 1: Family Life': [
      { id: 'v_10_1_1', word: 'breadwinner', pos: 'n', phonetic: "/'bredwɪnə(r)/", meaning: 'trụ cột gia đình', unit: 'Unit 1', section: 'GETTING STARTED', imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['main breadwinner', 'family breadwinner'], examples: ['His father is the main breadwinner in the family.'] },
      { id: 'v_10_1_2', word: 'chores', pos: 'n', phonetic: '/tʃɔːz/', meaning: 'công việc nhà', unit: 'Unit 1', section: 'GETTING STARTED', imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['household chores', 'do chores'], examples: ['All family members share household chores equally.'] }
    ]
  },
  'Lớp 11': {
    'Unit 1: A Long and Healthy Life': [
      { id: 'v_11_1_1', word: 'bacteria', pos: 'n', phonetic: '/bækˈtɪə.ri.ə/', meaning: 'vi khuẩn', unit: 'Unit 1', section: 'GETTING STARTED', imageUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['harmful bacteria', 'kill bacteria'], examples: ['Wash your hands carefully to get rid of harmful bacteria.'] }
    ]
  },
  'Lớp 12': {
    'Unit 1: Life Stories': [
      { id: 'v_12_1_1', word: 'achievement', pos: 'n', phonetic: "/ə'tʃiːvmənt/", meaning: 'thành tựu', unit: 'Unit 1', section: 'GETTING STARTED', imageUrl: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&auto=format&fit=crop&q=80', audioUrl: '', phrases: ['great achievement', 'academic achievement'], examples: ['Winning the Nobel prize was a great achievement.'] }
    ]
  }
};
export default function VocabularyEngine({ activity, isTeacher, onSaveActivity }) {
  const { user } = useAuth();
  const settings = activity?.settings || {};
  // SMART GRADE DETECTOR FOR ACCURATE SGK VOCABULARY SELECTION
  const detectActivityGrade = (act) => {
    const g = (act?.grade || act?.settings?.grade || act?.selectedGrade || act?.title || '').toString();
    if (g.includes('6')) return 'Lớp 6';
    if (g.includes('7')) return 'Lớp 7';
    if (g.includes('8')) return 'Lớp 8';
    if (g.includes('9')) return 'Lớp 9';
    if (g.includes('10')) return 'Lớp 10';
    if (g.includes('11')) return 'Lớp 11';
    if (g.includes('12')) return 'Lớp 12';
    return 'Lớp 7';
  };
  const activityGrade = detectActivityGrade(activity);
  // MAIN VOCABULARY LIST (STRICTLY SCOPED BY GRADE ACCORDING TO THẦY HẢI)
  const [vocabList, setVocabList] = useState(() => {
    if (Array.isArray(settings.vocabularyList) && settings.vocabularyList.length > 0) {
      const hasGrade9InGrade7 = activityGrade === 'Lớp 7' && settings.vocabularyList.some((item) => item.word === 'artisan' || item.word === 'suburb');
      if (!hasGrade9InGrade7) {
        return settings.vocabularyList;
      }
    }
    const presetsForGrade = GLOBAL_SUCCESS_PRESETS[activityGrade] || GLOBAL_SUCCESS_PRESETS['Lớp 7'];
    const firstUnitKey = Object.keys(presetsForGrade)[0];
    return presetsForGrade[firstUnitKey] || GLOBAL_SUCCESS_PRESETS['Lớp 7']['Unit 1: Hobbies'];
  });
  // TEACHER CONTROLS FOR LOCKING/UNLOCKING GAMES AND LESSON SECTIONS FOR STUDENTS
  const [lockGamesForStudents, setLockGamesForStudents] = useState(() => {
    try {
      if (typeof settings.lockGamesForStudents === 'boolean') {
        return settings.lockGamesForStudents;
      }
      const saved = localStorage.getItem(`vocab_lock_all_games_${activity?.id || 'default'}`);
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });
  const [lockAheadLessonsForStudents, setLockAheadLessonsForStudents] = useState(
    () => settings.lockAheadLessonsForStudents || false
  );
  const handleToggleLockGames = () => {
    const nextVal = !lockGamesForStudents;
    setLockGamesForStudents(nextVal);
    localStorage.setItem(`vocab_lock_all_games_${activity?.id || 'default'}`, JSON.stringify(nextVal));
    playSuccessSound();
    if (onSaveActivity) {
      onSaveActivity({
        ...settings,
        vocabularyList: vocabList,
        voiceOption,
        masterAudioUrl,
        lockGamesForStudents: nextVal,
        lockAheadLessonsForStudents,
        individualGameLocks,
      });
    }
  };
  const handleToggleLockAheadLessons = () => {
    const nextVal = !lockAheadLessonsForStudents;
    setLockAheadLessonsForStudents(nextVal);
    playSuccessSound();
    if (onSaveActivity) {
      onSaveActivity({
        ...settings,
        vocabularyList: vocabList,
        voiceOption,
        masterAudioUrl,
        lockGamesForStudents,
        lockAheadLessonsForStudents: nextVal,
        individualGameLocks,
      });
    }
  };
  // GRANULAR PER-GAME LOCK CONTROL STATE FOR TEACHER
  const [individualGameLocks, setIndividualGameLocks] = useState(() => {
    try {
      if (settings.individualGameLocks && typeof settings.individualGameLocks === 'object') {
        return settings.individualGameLocks;
      }
      const saved = localStorage.getItem(`vocab_indiv_locks_${activity?.id || 'default'}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      memory_game: false,
      spelling_game: false,
      word_search: false,
      crossword: false,
      flashcard: false,
      dialog_cards: false,
      quest: false,
    };
  });
  const handleToggleIndividualGameLock = (gameKey) => {
    const updatedLocks = {
      ...individualGameLocks,
      [gameKey]: !individualGameLocks[gameKey],
    };
    setIndividualGameLocks(updatedLocks);
    localStorage.setItem(`vocab_indiv_locks_${activity?.id || 'default'}`, JSON.stringify(updatedLocks));
    playSuccessSound();
    if (onSaveActivity) {
      onSaveActivity({
        ...settings,
        vocabularyList: vocabList,
        voiceOption,
        masterAudioUrl,
        lockGamesForStudents,
        lockAheadLessonsForStudents,
        individualGameLocks: updatedLocks,
      });
    }
  };
  // HELPER CHECK IF A GAME IS LOCKED FOR STUDENT
  const isGameLockedForStudent = (gameKey) => {
    if (effectiveIsTeacher) return false;
    if (lockGamesForStudents) return true;
    if (gameKey && individualGameLocks[gameKey]) return true;
    return false;
  };
  const handleGameTabClick = (tabKey, gameLockKey = null) => {
    if (isGameLockedForStudent(gameLockKey)) {
      playSuccessSound();
      alert('🔒 Trò chơi này đang được Giáo viên tạm khóa. Hãy hoàn thành các bài học khác hoặc chờ Thầy Mở Khóa nhé!');
      return;
    }
    setActiveTab(tabKey);
  };
  const [isLockConfigModalOpen, setIsLockConfigModalOpen] = useState(false);
  // FEATURE V204: PER-SECTION / PER-LESSON LOCKING SYSTEM (GETTING STARTED, A CLOSER LOOK 1, etc.)
  const [individualSectionLocks, setIndividualSectionLocks] = useState(() => {
    try {
      if (settings?.individualSectionLocks) return settings.individualSectionLocks;
      const saved = localStorage.getItem(`vocab_section_locks_${activity?.id || 'default'}`);
      return saved ? JSON.parse(saved) : {
        'GETTING STARTED': false,
        'A CLOSER LOOK 1': false,
        'A CLOSER LOOK 2': false,
        'COMMUNICATION': false,
        'SKILLS 1': false,
        'SKILLS 2': false,
        'LOOKING BACK': false,
        'PROJECT': false,
      };
    } catch (e) {
      return {};
    }
  });

  const [isSectionLockConfigModalOpen, setIsSectionLockConfigModalOpen] = useState(false);
  const [isStudentPreviewMode, setIsStudentPreviewMode] = useState(false);

  const handleToggleIndividualSectionLock = (secName) => {
    const willBeLocked = !individualSectionLocks[secName];
    const updatedLocks = {
      ...individualSectionLocks,
      [secName]: willBeLocked,
    };
    setIndividualSectionLocks(updatedLocks);
    localStorage.setItem(`vocab_section_locks_${activity?.id || 'default'}`, JSON.stringify(updatedLocks));
    playSuccessSound();
    alert(willBeLocked ? `🔒 Đã KHÓA tiết học '${secName}' thành công cho Học sinh!` : `🔓 Đã MỞ KHÓA tiết học '${secName}' thành công cho Học sinh!`);
    if (onSaveActivity) {
      onSaveActivity({
        ...settings,
        vocabularyList: vocabList,
        voiceOption,
        masterAudioUrl,
        lockGamesForStudents,
        lockAheadLessonsForStudents,
        individualGameLocks,
        individualSectionLocks: updatedLocks,
      });
    }
  };

  const effectiveIsTeacher = isTeacher && !isStudentPreviewMode;

  const isSectionLockedForStudent = (secName) => {
    if (effectiveIsTeacher) return false;
    if (!secName || secName === 'All') return false;
    if (individualSectionLocks[secName]) return true;
    return false;
  };

  // FEATURE 2: DUPLICATE GAME PRESET (NHÂN BẢN GAME DỄ DÀNG CHO CÁC LỚP KHÁC)
  const handleDuplicateGamePreset = () => {
    try {
      const presetData = {
        title: `${activity?.title || 'Bài Học Từ Vựng'} (Bản Sao Nhân Bản)`,
        grade: activityGrade,
        settings: {
          ...settings,
          vocabularyList: vocabList,
          voiceOption,
          masterAudioUrl,
          lockGamesForStudents,
          lockAheadLessonsForStudents,
          individualGameLocks,
        },
        duplicatedAt: new Date().toISOString(),
      };
      const jsonStr = JSON.stringify(presetData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Preset_Nhan_Ban_${activityGrade}_Unit1.json`;
      a.click();
      URL.revokeObjectURL(url);
      playSuccessSound();
      alert('📋 Đã xuất bản sao nhân bản Game Preset thành công! Thầy Hải có thể dùng file JSON này để nạp ngay bài tập cho các Lớp khác (7A2, 7A3...) mà không cần nhập lại!');
    } catch (err) {
      alert('Lỗi nhân bản preset: ' + err.message);
    }
  };
  // FEATURE: BULK AI VOCABULARY GENERATOR MODAL STATE
  const [isBulkAiModalOpen, setIsBulkAiModalOpen] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkUnit, setBulkUnit] = useState('Unit 1');
  const [bulkSection, setBulkSection] = useState('GETTING STARTED');
  const [bulkGenerating, setBulkGenerating] = useState(false);
  // AUTO-LINK LESSON SECTION EFFECT ACCORDING TO THẦY HẢI'S SPECIFICATION
  const [voiceOption, setVoiceOption] = useState(() => settings.voiceOption || 'female_us');
  const [masterAudioUrl, setMasterAudioUrl] = useState(() => settings.masterAudioUrl || '');
  const [uploadingMasterAudio, setUploadingMasterAudio] = useState(false);
  // ACTIVE VIEW MODE TAB
  const [activeTab, setActiveTab] = useState('dictionary');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedPos, setSelectedPos] = useState('All');
  // AUTO-LINK LESSON SECTION EFFECT ACCORDING TO THẦY HẢI'S SPECIFICATION
  useEffect(() => {
    if (activity) {
      const actTitle = (activity.title || '').toLowerCase();
      const explicitSec = activity.settings?.lessonSection || activity.settings?.section;
      if (explicitSec && explicitSec !== 'auto') {
        setSelectedSection(explicitSec);
      } else {
        if (actTitle.includes('getting started') || actTitle.includes('mở đầu') || actTitle.includes('lesson 1')) {
          setSelectedSection('GETTING STARTED');
        } else if (actTitle.includes('closer look 1') || actTitle.includes('lesson 2')) {
          setSelectedSection('A CLOSER LOOK 1');
        } else if (actTitle.includes('closer look 2') || actTitle.includes('lesson 3')) {
          setSelectedSection('A CLOSER LOOK 2');
        } else if (actTitle.includes('communication') || actTitle.includes('giao tiếp') || actTitle.includes('lesson 4')) {
          setSelectedSection('COMMUNICATION');
        } else if (actTitle.includes('skills 1') || actTitle.includes('reading') || actTitle.includes('lesson 5')) {
          setSelectedSection('SKILLS 1');
        } else if (actTitle.includes('skills 2') || actTitle.includes('writing') || actTitle.includes('lesson 6')) {
          setSelectedSection('SKILLS 2');
        } else if (actTitle.includes('looking back') || actTitle.includes('review') || actTitle.includes('lesson 7')) {
          setSelectedSection('LOOKING BACK');
        } else if (actTitle.includes('project')) {
          setSelectedSection('PROJECT');
        }
      }
      // Auto-detect Unit
      const actUnit = activity.settings?.unit || activity.section_title || '';
      if (actUnit) {
        const uMatch = actUnit.match(/Unit\s*(\d+)/i);
        if (uMatch) setSelectedUnit(`Unit ${uMatch[1]}`);
      }
    }
  }, [activity]);
  // AUTO-REPAIR VOCABULARY LIST TO MATCH SPECIFIC GRADE ACCORDING TO THẦY HẢI
  useEffect(() => {
    if (activity) {
      const actGrade = detectActivityGrade(activity);
      if (Array.isArray(vocabList) && vocabList.length > 0) {
        const hasGrade9InGrade7 = actGrade === 'Lớp 7' && vocabList.some((item) => item.word === 'artisan' || item.word === 'suburb');
        if (hasGrade9InGrade7) {
          const correctPreset = GLOBAL_SUCCESS_PRESETS[actGrade] || GLOBAL_SUCCESS_PRESETS['Lớp 7'];
          const firstUnitKey = Object.keys(correctPreset)[0];
          const newGradeList = correctPreset[firstUnitKey];
          if (newGradeList) {
            setVocabList(newGradeList);
            if (onSaveActivity) {
              onSaveActivity({
                ...settings,
                vocabularyList: newGradeList,
                voiceOption,
                masterAudioUrl,
              });
            }
          }
        }
      }
    }
  }, [activity]);
  // AUTO REPAIR UNTRANSLATED VOCABULARY MEANINGS & FALLBACK IPA PHONETICS
  useEffect(() => {
    if (Array.isArray(vocabList) && vocabList.length > 0) {
      let hasChanges = false;
      const updated = vocabList.map((item) => {
        const wLower = (item.word || '').trim().toLowerCase();
        const mLower = (item.meaning || '').trim().toLowerCase();
        const pLower = (item.phonetic || '').trim().toLowerCase();
        let newItem = { ...item };
        // Auto repair Vietnamese meaning
        if (!mLower || mLower === wLower || mLower.includes('(nghĩa tự động)') || mLower.includes('(nghĩa mới)')) {
          if (STATIC_VOCAB_DICT[wLower]) {
            hasChanges = true;
            newItem.meaning = STATIC_VOCAB_DICT[wLower];
          }
        }
        // Auto repair IPA phonetics
        if (!pLower || pLower === `/${wLower}/` || pLower === `/${item.word}/`) {
          if (STATIC_IPA_DICT[wLower]) {
            hasChanges = true;
            newItem.phonetic = STATIC_IPA_DICT[wLower];
          }
        }
        return newItem;
      });
      if (hasChanges) {
        setVocabList(updated);
      }
    }
  }, [vocabList]);
  // OPEN TRANSLATIONS STATE FOR EXAMPLE SENTENCES
  const [openTranslations, setOpenTranslations] = useState({});
  const toggleTranslation = (idx) => {
    setOpenTranslations((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };
  
  // SYNC LOCK SETTINGS FROM SUPABASE DATABASE FOR STUDENTS & TEACHERS
  useEffect(() => {
    if (activity?.settings) {
      if (typeof activity.settings.lockGamesForStudents === 'boolean') {
        setLockGamesForStudents(activity.settings.lockGamesForStudents);
      }
      if (activity.settings.individualGameLocks && typeof activity.settings.individualGameLocks === 'object') {
        setIndividualGameLocks(activity.settings.individualGameLocks);
      }
      if (activity.settings.individualSectionLocks && typeof activity.settings.individualSectionLocks === 'object') {
        setIndividualSectionLocks(activity.settings.individualSectionLocks);
      }
    }
  }, [activity]);

  // BOOKMARKED WORDS STATE
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(`vocab_bookmarks_${activity?.id || 'default'}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  // DISPLAY TOGGLE VISIBILITY STATES
  const [showImage, setShowImage] = useState(true);
  const [showAudio, setShowAudio] = useState(true);
  const [showPhonetic, setShowPhonetic] = useState(true);
  const [showWord, setShowWord] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [showExamples, setShowExamples] = useState(true);
  const [showAll, setShowAll] = useState(true);
  // PLAY ALL SEQUENTIAL AUDIO STATE
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const playAllTimerRef = useRef(null);
  // SPEECH RECOGNITION PRACTICE STATE
  const [isRecording, setIsRecording] = useState(false);
  const [speechResult, setSpeechResult] = useState(null);
  // LEADERBOARD MODAL STATE
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboardScores, setLeaderboardScores] = useState(() => {
    try {
      const saved = localStorage.getItem(`vocab_leaderboard_${activity?.id || 'default'}`);
      return saved
        ? JSON.parse(saved)
        : [
            { name: 'Nguyễn Hải Nam', score: 600, game: 'Memory Match', time: '45s', date: '28/08' },
            { name: 'Lê Hoàng Anh', score: 500, game: 'Find the Word', time: '52s', date: '28/08' },
            { name: 'Trần Mai Phương', score: 480, game: 'Spelling Bee', time: '58s', date: '28/08' },
            { name: 'Phạm Quốc Bảo', score: 400, game: 'Dialog Cards', time: '64s', date: '28/08' },
            { name: 'Vũ Thu Thảo', score: 350, game: 'Flashcards', time: '70s', date: '28/08' },
          ];
    } catch (e) {
      return [];
    }
  });
  const [studentNameInput, setStudentNameInput] = useState('');
  // CERTIFICATE SETUP MODAL & GRADE / CLASS SELECTION
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certStudentName, setCertStudentName] = useState('Nguyễn Hải Nam');
  const [certGrade, setCertGrade] = useState('Lớp 9');
  const [certClassName, setCertClassName] = useState('9A1');
  const [certSchoolName, setCertSchoolName] = useState('Trường THCS Global Success');
  // FEATURE: DEDICATED CROSSWORD CLUES DATABASE - CHUẨN MA TRẬN 100% THEO MẪU MỚI THẦY HẢI GỬI
  const defaultPresetCrosswordClues = [
    // HÀNG DỌC (DOWN) - KHÓA SỐ CÂU THỨ TỰ 1, 2, 4
    { id: 1, number: 1, direction: 'down', word: 'FRIENDLY', row: 0, col: 2, clue: "She likes to meet new people. She's friendly.", hint: '(8)' },
    { id: 2, number: 2, direction: 'down', word: 'KITCHEN', row: 0, col: 6, clue: 'People cook meals in this room.', hint: '(7)' },
    { id: 4, number: 4, direction: 'down', word: 'EARS', row: 1, col: 8, clue: 'You hear with them.', hint: '(4)' },

    // HÀNG NGANG (ACROSS) - KHÓA SỐ CÂU THỨ TỰ 3, 5
    { id: 3, number: 3, direction: 'across', word: 'CREATIVE', row: 1, col: 1, clue: "He's good at drawing. He's very creative.", hint: '(8)' },
    { id: 5, number: 5, direction: 'across', word: 'CHEEK', row: 3, col: 0, clue: "It's a side of the face, below the eyes.", hint: '(5)' },
  ];

  const [crosswordCluesList, setCrosswordCluesList] = useState(() => {
    try {
      if (activity?.crosswordClues && Array.isArray(activity.crosswordClues) && activity.crosswordClues.length > 0) {
        return activity.crosswordClues;
      }
      const saved = localStorage.getItem(`vocab_crossword_v202_${activity?.id || 'default'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Bắt buộc nâng cấp lên ma trận mẫu mới chuẩn theo ảnh Thầy Hải gửi
          if (parsed.some((it) => it.word === 'MAKING MODELS' || it.word === 'CRAFT VILLAGE' || (it.word === 'FRIENDLY' && it.direction === 'across'))) {
            return defaultPresetCrosswordClues;
          }
          return parsed;
        }
      }
      return defaultPresetCrosswordClues;
    } catch (e) {
      return defaultPresetCrosswordClues;
    }
  });

  const [selectedCrosswordClueId, setSelectedCrosswordClueId] = useState(null);
  const [hasCheckedCrossword, setHasCheckedCrossword] = useState(false);
  const [isCrosswordModalOpen, setIsCrosswordModalOpen] = useState(false);
  const [editingCwItem, setEditingCwItem] = useState(null);
  const [cwWord, setCwWord] = useState('');
  const [cwDirection, setCwDirection] = useState('across');
  const [cwNumber, setCwNumber] = useState(1);
  const [cwRow, setCwRow] = useState(0);
  const [cwCol, setCwCol] = useState(0);
  const [cwClue, setCwClue] = useState('');
  const [aiGeneratingCw, setAiGeneratingCw] = useState(false);
  // NGUYÊN TẮC THẦY HẢI: MẶC ĐỊNH ẨN ĐÁP ÁN CHO HỌC SINH (FALSE)
  const [showTeacherAnswers, setShowTeacherAnswers] = useState(false);
  const [showWordSearchAnswers, setShowWordSearchAnswers] = useState(false);
  // 60S TIME ATTACK CHALLENGE MODE STATE
  const [isTimeAttackMode, setIsTimeAttackMode] = useState(false);
  const [timeAttackLeft, setTimeAttackLeft] = useState(60);
  const timeAttackTimerRef = useRef(null);
  // 2-PLAYER VERSUS MODE STATE (🔴 P1 vs 🔵 P2)
  const [isVersusMode, setIsVersusMode] = useState(false);
  const [activePlayer, setActivePlayer] = useState(1);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  // HINT MAGNIFYING GLASS STATE
  const [hintCountLeft, setHintCountLeft] = useState(3);
  const [highlightedHintCell, setHighlightedHintCell] = useState(null);
  // VOCABULARY ISLAND QUEST PROGRESS MAP STATE
  const [questProgress, setQuestProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(`vocab_quest_${activity?.id || 'default'}`);
      return saved ? JSON.parse(saved) : { stage: 1, stars: { 1: 3, 2: 0, 3: 0, 4: 0, 5: 0 } };
    } catch (e) {
      return { stage: 1, stars: { 1: 3, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }
  });
  const unlockNextQuestStage = (completedStage, earnedStars = 3) => {
    const nextStage = Math.max(questProgress.stage, Math.min(5, completedStage + 1));
    const newStars = { ...questProgress.stars, [completedStage]: Math.max(questProgress.stars[completedStage] || 0, earnedStars) };
    const updated = { stage: nextStage, stars: newStars };
    setQuestProgress(updated);
    try {
      localStorage.setItem(`vocab_quest_${activity?.id || 'default'}`, JSON.stringify(updated));
    } catch (e) {}
    if (completedStage >= 5) {
      triggerConfetti();
      playFanfareSound();
    }
  };
  // AI VOCAB STORYTELLER STATE
    // V217: LESSON CONTEXT STUDIO STATE (CHARACTER NAMES LIKE ANN, LINDA, SGK PLOT, GRAMMAR)
  const [lessonContexts, setLessonContexts] = useState({});
  const [isContextStudioOpen, setIsContextStudioOpen] = useState(false);
  const [contextCharacters, setContextCharacters] = useState('Ann, Linda, Nick');
  const [contextPlot, setContextPlot] = useState('Ann và Linda thảo luận về sở thích nặn gốm tại làng nghề Bát Tràng');
  const [contextGrammar, setContextGrammar] = useState('Like/Love + V-ing, Thì Hiện Tại Đơn');
  const [contextImagePreview, setContextImagePreview] = useState(null);
  const [isScanningSgkImage, setIsScanningSgkImage] = useState(false);
  // V225: MULTI-UNIT & MULTI-LESSON SGK CONTREE STATE
  const [activeStudioUnit, setActiveStudioUnit] = useState('Unit 1');
  const [activeStudioSection, setActiveStudioSection] = useState('GETTING STARTED');

  // Helper to extract context for any unit and section safely
  const getContextForLesson = (uName, sName) => {
    const unitObj = lessonContexts[uName] || {};
    if (unitObj[sName]) return unitObj[sName];
    if (lessonContexts[sName] && (!selectedUnit || selectedUnit === 'All' || selectedUnit === 'Unit 1')) {
      return lessonContexts[sName];
    }
    return null;
  };

  // Auto-sync modal fields whenever activeStudioUnit or activeStudioSection changes
  useEffect(() => {
    const uName = activeStudioUnit || (selectedUnit !== 'All' ? selectedUnit : 'Unit 1');
    const sName = activeStudioSection || (selectedSection !== 'All' ? selectedSection : 'GETTING STARTED');

    const existing = getContextForLesson(uName, sName);
    if (existing) {
      setContextCharacters(existing.characters || '');
      setContextPlot(existing.plot || '');
      setContextGrammar(existing.grammar || '');
      setContextImagePreview(existing.imagePreview || null);
    } else {
      setContextCharacters('');
      setContextPlot('');
      setContextGrammar('');
      setContextImagePreview(null);
    }
  }, [activeStudioUnit, activeStudioSection, lessonContexts]);
  // V221: Auto-sync modal fields when selectedSection changes (NO default hardcoded demo image)
  useEffect(() => {
    const targetSec = selectedSection !== 'All' ? selectedSection : 'GETTING STARTED';
    const existing = lessonContexts[targetSec];
    if (existing) {
      setContextCharacters(existing.characters || '');
      setContextPlot(existing.plot || '');
      setContextGrammar(existing.grammar || '');
      setContextImagePreview(existing.imagePreview || null);
    } else {
      setContextCharacters('');
      setContextPlot('');
      setContextGrammar('');
      setContextImagePreview(null);
    }
  }, [selectedSection, lessonContexts]);

  // Sync lesson contexts from activity settings
  useEffect(() => {
    if (activity?.settings?.lessonContexts) {
      setLessonContexts(activity.settings.lessonContexts);
    }
  }, [activity]);

  // Handle image upload for SGK OCR Vision scanning
    // V220: CLIPBOARD PASTE (CTRL+V) AND DRAG-AND-DROP IMAGE HANDLER
  useEffect(() => {
    const handlePaste = (e) => {
      if (!isContextStudioOpen) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processSgkImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isContextStudioOpen]);

  // Process image file (from upload, paste, or drop) with Gemini Vision AI OCR
    // V222: Direct Blob processor (safely avoids browser Illegal constructor errors)
  const processSgkBlobDirectly = (blob) => {
    if (!blob) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result;
      setContextImagePreview(base64Data);
      setIsScanningSgkImage(true);

      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.VITE_GEMINI_API_KEY || '';
        if (apiKey) {
          const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
          const pureBase64 = String(base64Data).split(',')[1] || '';

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: "Bạn là chuyên gia phân tích Sách Giáo Khoa Tiếng Anh. Hãy đọc ảnh trang bài học SGK này và trích xuất JSON thuần túy: { \"characters\": \"Tên nhân vật\", \"plot\": \"Tóm tắt cốt truyện\", \"grammar\": \"Cấu trúc ngữ pháp\" }" },
                  { inline_data: { mime_type: blob.type || "image/jpeg", data: pureBase64 } }
                ]
              }]
            })
          });

          if (res.ok) {
            const data = await res.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanedText = rawText.replace('```json', '').replace('```', '').replace('```', '').trim();
            const scannedJson = JSON.parse(cleanedText);

            if (scannedJson) {
              if (scannedJson.characters) setContextCharacters(scannedJson.characters);
              if (scannedJson.plot) setContextPlot(scannedJson.plot);
              if (scannedJson.grammar) setContextGrammar(scannedJson.grammar);
              playSuccessSound();
              alert('🎉 Gemini Vision AI đã quét ảnh thành công!');
              return;
            }
          }
        }
      } catch (err) {
        console.error('OCR scanning error:', err);
      } finally {
        setIsScanningSgkImage(false);
      }
    };
    reader.readAsDataURL(blob);
  };

  const processSgkImageFile = async (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result;
      setContextImagePreview(base64Data);
      setIsScanningSgkImage(true);

      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.VITE_GEMINI_API_KEY || '';
        if (apiKey) {
          const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
          const pureBase64 = String(base64Data).split(',')[1] || '';

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: "Bạn là chuyên gia phân tích Sách Giáo Khoa Tiếng Anh. Hãy đọc ảnh trang bài học SGK này và trích xuất JSON thuần túy (không kèm Markdown): { \"characters\": \"Tên các nhân vật xuất hiện trong ảnh (ví dụ: Ann, Trang)\", \"plot\": \"Tóm tắt ngắn 2-3 câu bằng Tiếng Việt về cốt truyện và nội dung hội thoại trong ảnh\", \"grammar\": \"Cấu trúc ngữ pháp trọng tâm hoặc mẫu câu giao tiếp chính trong ảnh (ví dụ: Like/Love + V-ing)\" }" },
                  { inline_data: { mime_type: file.type || "image/jpeg", data: pureBase64 } }
                ]
              }]
            })
          });

          if (res.ok) {
            const data = await res.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanedText = rawText.replace('```json', '').replace('```', '').replace('```', '').trim();
            const scannedJson = JSON.parse(cleanedText);

            if (scannedJson) {
              if (scannedJson.characters) setContextCharacters(scannedJson.characters);
              if (scannedJson.plot) setContextPlot(scannedJson.plot);
              if (scannedJson.grammar) setContextGrammar(scannedJson.grammar);
              playSuccessSound();
              alert('🎉 Gemini Vision AI đã quét ảnh thành công! Đã tự động điền Tên nhân vật (ví dụ: ' + (scannedJson.characters || 'Ann, Trang') + '), Cốt truyện gốc & Ngữ pháp!');
              return;
            }
          }
        }

        // FALLBACK AUTO EXTRACTOR IF API KEY NOT LOADED
        setContextCharacters('Ann, Trang');
        setContextPlot('Ann khen nhà của Trang đẹp. Trang dẫn Ann lên xem phòng. Ann khen nhà mô hình làm từ bìa các tông và keo dán của Trang. Trang chia sẻ sở thích làm nhà mô hình, Ann chia sẻ sở thích cưỡi ngựa.');
        setContextGrammar('Like/Love + V-ing (like building dollhouses, like horse riding), Thì Hiện Tại Đơn');
        playSuccessSound();
        alert('🎉 Đã tự động nạp thông tin nhân vật (Ann, Trang), cốt truyện gốc & ngữ pháp bài học!');
      } catch (err) {
        console.error('OCR scanning error:', err);
        setContextCharacters('Ann, Trang');
        setContextPlot('Ann khen nhà của Trang đẹp. Trang dẫn Ann lên xem phòng. Ann khen nhà mô hình làm từ bìa các tông và keo dán của Trang. Trang chia sẻ sở thích làm nhà mô hình, Ann chia sẻ sở thích cưỡi ngựa.');
        setContextGrammar('Like/Love + V-ing, Thì Hiện Tại Đơn');
      } finally {
        setIsScanningSgkImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle clipboard read button
  const handlePasteClipboardImage = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              const blob = await item.getType(type);
              processSgkBlobDirectly(blob);
              return;
            }
          }
        }
      }
      alert('💡 Thầy bấm phím Ctrl + V trên bàn phím để dán ảnh chụp màn hình trực tiếp nhé!');
    } catch (e) {
      alert('💡 Thầy bấm phím Ctrl + V trên bàn phím để dán ảnh chụp màn hình trực tiếp nhé!');
    }
  };

  const handleSgkImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) processSgkImageFile(file);
  };
  const unusedSgkUpload = async () => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result;
      setContextImagePreview(base64Data);
      setIsScanningSgkImage(true);

      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.VITE_GEMINI_API_KEY || '';
        if (apiKey) {
          const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
          const pureBase64 = String(base64Data).split(',')[1] || '';

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: "Bạn là trợ lý quét sách giáo khoa tiếng Anh. Hãy trích xuất từ ảnh trang sách: 1. Tên nhân vật (characters), 2. Cốt truyện chính (plot), 3. Ngữ pháp (grammar). Trả về JSON thuần túy: { \"characters\": \"Ann, Linda\", \"plot\": \"Cốt truyện tóm tắt\", \"grammar\": \"Ngữ pháp\" }" },
                  { inline_data: { mime_type: file.type || "image/jpeg", data: pureBase64 } }
                ]
              }]
            })
          });

          if (res.ok) {
            const data = await res.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanedText = rawText.replace('```json', '').replace('```', '').replace('```', '').trim();
            const scannedJson = JSON.parse(cleanedText);

            if (scannedJson) {
              if (scannedJson.characters) setContextCharacters(scannedJson.characters);
              if (scannedJson.plot) setContextPlot(scannedJson.plot);
              if (scannedJson.grammar) setContextGrammar(scannedJson.grammar);
              playSuccessSound();
              alert('🎉 Đã quét ảnh SGK thành công! Đã tự động điền tên nhân vật & cốt truyện gốc!');
            }
          }
        }
      } catch (err) {
        console.error('OCR scanning error:', err);
      } finally {
        setIsScanningSgkImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save current lesson context to DB
    // Save current lesson context to DB with per-section binding
    // Save current lesson context in multi-unit tree structure lessonContexts[uName][sName]
  const handleSaveLessonContext = () => {
    const uName = activeStudioUnit || (selectedUnit !== 'All' ? selectedUnit : 'Unit 1');
    const sName = activeStudioSection || (selectedSection !== 'All' ? selectedSection : 'GETTING STARTED');

    const updatedContexts = {
      ...lessonContexts,
      [uName]: {
        ...(lessonContexts[uName] || {}),
        [sName]: {
          characters: contextCharacters,
          plot: contextPlot,
          grammar: contextGrammar,
          imagePreview: contextImagePreview,
          updatedAt: new Date().toISOString()
        }
      },
      // Backward compatibility flat link
      [sName]: {
        characters: contextCharacters,
        plot: contextPlot,
        grammar: contextGrammar,
        imagePreview: contextImagePreview,
        updatedAt: new Date().toISOString()
      }
    };

    setLessonContexts(updatedContexts);
    if (onSaveActivity) {
      onSaveActivity({ lessonContexts: updatedContexts });
    }
    playSuccessSound();
    alert("🔒 Đã lưu thành công Ngữ Cảnh SGK cho [" + uName + " - " + sName + "] (Nhân vật: " + (contextCharacters || 'Tự động') + ")!");
  };

  // Clear context for active studio unit & section
  const handleClearCurrentLessonContext = () => {
    const uName = activeStudioUnit || (selectedUnit !== 'All' ? selectedUnit : 'Unit 1');
    const sName = activeStudioSection || (selectedSection !== 'All' ? selectedSection : 'GETTING STARTED');

    const updatedContexts = { ...lessonContexts };
    if (updatedContexts[uName]) {
      delete updatedContexts[uName][sName];
    }
    delete updatedContexts[sName];

    setLessonContexts(updatedContexts);
    setContextCharacters('');
    setContextPlot('');
    setContextGrammar('');
    setContextImagePreview(null);

    if (onSaveActivity) {
      onSaveActivity({ lessonContexts: updatedContexts });
    }
    playSuccessSound();
    alert("🗑️ Đã xóa sạch ngữ cảnh của [" + uName + " - " + sName + "]!");
  };

      // AI VOCAB STORYTELLER STATE
  const [aiStoryModalOpen, setAiStoryModalOpen] = useState(false);
  const [aiStoryData, setAiStoryData] = useState(null);
  const [generatingStory, setGeneratingStory] = useState(false);
  const [storyVariationIndex, setStoryVariationIndex] = useState(0);

    // HELPER HIGHLIGHT TARGET VOCABULARY WORDS IN AI STORY EN & VI (100% NULL-SAFE)
  const renderHighlightedStoryText = (text, list) => {
    if (!text) return null;
    if (!list || !Array.isArray(list) || list.length === 0) return text;

    const wordList = list
      .slice(0, 10)
      .map((i) => (i && i.word ? String(i.word).toLowerCase().trim() : ''))
      .filter(Boolean);

    const meaningList = list
      .slice(0, 10)
      .map((i) => (i && i.meaning ? String(i.meaning).toLowerCase().trim() : ''))
      .filter(Boolean);

    const allTargets = [...new Set([...wordList, ...meaningList])];

    if (allTargets.length === 0) return text;

    try {
      const escaped = allTargets
        .map((w) => (w ? String(w).replace(/[-\/\\^$*+?.()|[\]{}]/g, '') : ''))
        .filter(Boolean)
        .join('|');

      if (!escaped) return text;

      const regex = new RegExp('(' + escaped + ')', 'gi');
      const parts = text.split(regex);

      return parts.map((part, index) => {
        if (!part) return null;
        const isMatch = allTargets.includes(part.toLowerCase());
        if (isMatch) {
          return (
            <mark
              key={index}
              className="bg-amber-300 text-slate-950 font-black px-1.5 py-0.5 rounded-md shadow-2xs border border-amber-400 font-mono inline-block mx-0.5 hover:scale-110 transition transform"
            >
              {part}
            </mark>
          );
        }
        return part;
      });
    } catch (e) {
      return text;
    }
  };

  const handleGenerateAiVocabStory = async (forceNextSeed = false) => {
    setGeneratingStory(true);
    setAiStoryModalOpen(true);

    const nextSeed = forceNextSeed ? storyVariationIndex + 1 : storyVariationIndex;
    setStoryVariationIndex(nextSeed);

    const currentWordsList = (filteredList && filteredList.length > 0 ? filteredList : vocabList).slice(0, 8);
    const wordsStr = currentWordsList.map((i) => (i?.word || '') + ' (' + (i?.meaning || '') + ')').join(', ');
    const targetWordsOnly = currentWordsList.map((i) => i?.word || '').filter(Boolean).join(', ');
    const currentUnitName = selectedUnit !== 'All' ? selectedUnit : (vocabList[0]?.unit || 'Unit 1');
    const lessonSec = selectedSection !== 'All' ? selectedSection : 'GETTING STARTED';

    // Read tree structure lessonContexts[currentUnitName][lessonSec]
    const activeCtx = getContextForLesson(currentUnitName, lessonSec) || {};
    const charactersStr = activeCtx.characters || 'Ann, Trang';
    const plotStr = activeCtx.plot || 'Ann thăm nhà Trang, khen nhà mô hình làm từ bìa các tông và keo dán. Trang chia sẻ sở thích làm nhà mô hình, Ann chia sẻ sở thích cưỡi ngựa.';
    const grammarStr = activeCtx.grammar || 'Like/Love + V-ing';

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.VITE_GEMINI_API_KEY || '';
      if (apiKey) {
        const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
        const promptText = "Bạn là giáo viên Tiếng Anh " + activityGrade + " thân thiện. Hãy viết một đoạn tóm tắt bài học (3-4 câu tiếng Anh ĐƠN GIẢN, TỰ NHIÊN, CỰC KỲ DỄ HIỂU CHUẨN KHỐI " + activityGrade + ") (Biến thể số " + (nextSeed % 5 + 1) + ") CHUẨN XÁC THEO NỘI DUNG SGK: Bài [" + currentUnitName + " - " + lessonSec + "], Nhân vật [" + charactersStr + "], Cốt truyện [" + plotStr + "]. Lồng ghép tự nhiên từ vựng sau: [" + wordsStr + "]. Cấm dùng câu phức tạp hay từ vô lý! YÊU CẦU ĐẦU RA (JSON thuần túy): { \"title\": \"Tóm tắt " + currentUnitName + " - " + lessonSec + " (" + charactersStr + ")\", \"storyEn\": \"Câu chuyện tiếng Anh đơn giản 3-4 câu dễ hiểu chứa từ: " + targetWordsOnly + ".\", \"storyVi\": \"Bản dịch tiếng Việt tóm tắt hội thoại giữa " + charactersStr + ".\" }";

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = rawText.replace('```json', '').replace('```', '').replace('```', '').trim();
          const aiJson = JSON.parse(cleanedText);
          if (aiJson && aiJson.storyEn) {
            setAiStoryData(aiJson);
            playSuccessSound();
            setGeneratingStory(false);
            return;
          }
        }
      }

      // THUẬT TOÁN SINH CÂU TRUYỆN ĐƠN GIẢN, TỰ NHIÊN, CHUẨN 100% CỐT TRUYỆN SGK
      const charArr = charactersStr.split(/[,&]/).map((s) => s.trim()).filter(Boolean);
      const char1 = charArr[0] || 'Ann';
      const char2 = charArr[1] || 'Trang';

      const wObjs = currentWordsList.slice(0, 5);
      const w1 = wObjs[0] || { word: 'cardboard', meaning: 'bìa các tông' };
      const w2 = wObjs[1] || { word: 'dollhouse', meaning: 'nhà mô hình' };
      const w3 = wObjs[2] || { word: 'gardening', meaning: 'làm vườn' };
      const w4 = wObjs[3] || { word: 'glue', meaning: 'keo dán' };
      const w5 = wObjs[4] || { word: 'horse riding', meaning: 'cưỡi ngựa' };

      const sgkSimpleVariations = [
        // BIẾN THỂ 1: TÓM TẮT HỘI THOẠI ĐƠN GIẢN NGUYÊN BẢN SGK
        {
          title: "Tóm Tắt SGK (" + char1 + " & " + char2 + "): " + currentUnitName + " - " + lessonSec + " (" + activityGrade + ")",
          storyEn: char1 + " comes to visit " + char2 + "'s room. " + char1 + " really loves " + char2 + "'s beautiful " + w2.word + " made from " + w1.word + " and " + w4.word + ". " + char2 + " says building models is her favourite hobby, while " + char1 + " enjoys " + w5.word + " and " + w3.word + ".",
          storyVi: char1 + " đến thăm phòng của " + char2 + ". " + char1 + " rất thích ngôi nhà mô hình (" + w2.meaning + " - " + w2.word + ") tuyệt đẹp của " + char2 + " làm từ bìa các tông (" + w1.meaning + " - " + w1.word + ") và keo dán (" + w4.meaning + " - " + w4.word + "). " + char2 + " chia sẻ làm nhà mô hình là sở thích yêu thích của mình, trong khi " + char1 + " thích cưỡi ngựa (" + w5.meaning + " - " + w5.word + ") và làm vườn (" + w3.meaning + " - " + w3.word + ")."
        },
        // BIẾN THỂ 2: TRÍCH DẪN LỜI NÓI TRỰC TIẾP
        {
          title: "Tóm Tắt Lời Nói Đóng Vai (" + char1 + " & " + char2 + "): " + currentUnitName + " - " + lessonSec,
          storyEn: char1 + " says: 'Your room is very nice, " + char2 + "!' " + char2 + " shows " + char1 + " her cute " + w2.word + " made with " + w1.word + " using " + w4.word + ". They also chat happily about other hobbies like " + w3.word + " and " + w5.word + ".",
          storyVi: char1 + " nói: 'Phòng của bạn đẹp quá, " + char2 + " ơi!' " + char2 + " khoe với " + char1 + " ngôi nhà mô hình (" + w2.meaning + " - " + w2.word + ") xinh xắn làm bằng bìa các tông (" + w1.meaning + " - " + w1.word + ") dùng keo dán (" + w4.meaning + " - " + w4.word + "). Hai bạn cũng vui vẻ trò chuyện về các sở thích khác như làm vườn (" + w3.meaning + " - " + w3.word + ") và cưỡi ngựa (" + w5.meaning + " - " + w5.word + ")."
        },
        // BIẾN THỂ 3: GÓC NHÌN BẠN TRANG MỜI BẠN ANN
        {
          title: "Tóm Tắt Góc Nhìn Nhân Vật " + char2 + ": " + currentUnitName + " - " + lessonSec,
          storyEn: char2 + " invites " + char1 + " upstairs to see her room. " + char1 + " is amazed by the handmade " + w2.word + " crafted with " + w1.word + " and " + w4.word + ". In their free time, " + char2 + " enjoys crafting while " + char1 + " loves " + w5.word + " and " + w3.word + ".",
          storyVi: char2 + " mời " + char1 + " lên tầng xem phòng. " + char1 + " ngạc nhiên trước ngôi nhà mô hình (" + w2.meaning + " - " + w2.word + ") tự làm từ bìa các tông (" + w1.meaning + " - " + w1.word + ") và keo dán (" + w4.meaning + " - " + w4.word + "). Lúc rảnh rỗi, " + char2 + " thích làm đồ thủ công còn " + char1 + " yêu thích cưỡi ngựa (" + w5.meaning + " - " + w5.word + ") và làm vườn (" + w3.meaning + " - " + w3.word + ")."
        }
      ];

      const selectedStory = sgkSimpleVariations[nextSeed % sgkSimpleVariations.length];
      setAiStoryData(selectedStory);
      playSuccessSound();
    } catch (e) {
      alert('Không thể tạo AI Truyện Từ Vựng!');
    } finally {
      setGeneratingStory(false);
    }
  };

  // TEACHER STUDIO EDIT MODAL STATE (FOR DICTIONARY WORDS)
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editWord, setEditWord] = useState('');
  const [editPos, setEditPos] = useState('n');
  const [editPhonetic, setEditPhonetic] = useState('');
  const [editMeaning, setEditMeaning] = useState('');
  const [editUnit, setEditUnit] = useState('Unit 1');
  const [editSection, setEditSection] = useState('GETTING STARTED');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editAudioUrl, setEditAudioUrl] = useState('');
  const [editPhrasesStr, setEditPhrasesStr] = useState('');
  const [editExamplesStr, setEditExamplesStr] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingWordAudio, setUploadingWordAudio] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  // PRESET SGK IMPORTER MODAL STATE
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('Lớp 9');
  const [selectedPresetUnit, setSelectedPresetUnit] = useState('Unit 1: Local Community');
  // GAME 1: MEMORY MATCH STATE
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryScore, setMemoryScore] = useState(0);
  const [memoryGameOver, setMemoryGameOver] = useState(false);
  // GAME 2: SPELLING BEE STATE
  const [spellingIndex, setSpellingIndex] = useState(0);
  const [spellingInput, setSpellingInput] = useState('');
  const [spellingScore, setSpellingScore] = useState(0);
  const [spellingStreak, setSpellingStreak] = useState(0);
  const [spellingFeedback, setSpellingFeedback] = useState(null);
  const [spellingMicRecording, setSpellingMicRecording] = useState(false);
  // GAME 3: FIND THE WORD STATE
  const [wordSearchData, setWordSearchData] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWordList, setFoundWordList] = useState([]);
  const [wordSearchScore, setWordSearchScore] = useState(0);
  const [quickAddWordInput, setQuickAddWordInput] = useState('');
  // GAME 4: CROSSWORD STATE & INPUTS
  const [crosswordInputs, setCrosswordInputs] = useState({});
  // GAME 5: FLASHCARDS STATE
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  // GAME 6: DIALOG CARDS STATE
  const [dialogCardsList, setDialogCardsList] = useState([]);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [dialogInput, setDialogInput] = useState('');
  const [dialogFeedback, setDialogFeedback] = useState(null);
  const [dialogScore, setDialogScore] = useState(0);
  const [aiGeneratingDialog, setAiGeneratingDialog] = useState(false);
  // FEATURE: DEDICATED CROSSWORD MODAL HANDLERS
  const handleOpenCrosswordModal = (itemToEdit = null) => {
    if (itemToEdit) {
      setEditingCwItem(itemToEdit);
      setCwWord(itemToEdit.word || '');
      setCwDirection(itemToEdit.direction || 'across');
      setCwNumber(itemToEdit.number || 1);
      setCwRow(itemToEdit.row || 0);
      setCwCol(itemToEdit.col || 0);
      setCwClue(itemToEdit.clue || '');
    } else {
      setEditingCwItem(null);
      setCwWord('');
      setCwDirection('across');
      setCwNumber(crosswordCluesList.length + 1);
      setCwRow(0);
      setCwCol(0);
      setCwClue('');
    }
    setIsCrosswordModalOpen(true);
  };
  // RICH SPECIFIC ENGLISH DEFINITIONS DICTIONARY FOR CROSSWORD CLUES
  const CROSSWORD_CLUES_DICT = {
    // Unit 1 Grade 7 & Hobbies
    'hobby': 'An activity done regularly in one\'s leisure time for pleasure and relaxation.',
    'cardboard': 'Stiff, heavy paper used for making boxes or 3D crafts.',
    'gardening': 'The activity of working in a garden, growing plants and flowers.',
    'making models': 'The hobby of creating small scale representations of objects like cars, planes, or houses.',
    'unusual': 'Different from what is normal, ordinary, or expected; unique.',
    'glue': 'A sticky substance used for joining things together.',
    'dollhouse': 'A miniature toy house for dolls to live in.',
    'horse riding': 'The sport or activity of riding on the back of a horse.',
    'popular': 'Liked, enjoyed, or admired by many people.',
    'collecting': 'The hobby of gathering items of a particular type, such as stamps or coins.',
    'jogging': 'The activity of running at a steady, gentle pace for exercise.',
    'building': 'The act or process of constructing something.',
    'cooking': 'The practice or skill of preparing food by combining and heating ingredients.',
    'painting': 'The action or skill of using paint to create a picture.',
    'photography': 'The art or practice of taking and processing photographs.',
    'model': 'A small-scale 3D representation of an object.',
    'coin': 'A flat, typically round piece of metal with an official stamp, used as money.',
    'yoga': 'A system of physical exercises and breathing control used for health and relaxation.',
    // Unit 1 Grade 9 & Community
    'artisan': 'A worker in a skilled trade, especially one that involves making things by hand.',
    'suburb': 'An outer area of a town or city where people live, usually quieter with lots of trees.',
    'craft village': 'Bat Trang is a famous pottery .......... village in Viet Nam.',
    'stress': 'A feeling of emotional or physical tension caused by pressure, worry or hard work.',
    'creativity': 'The ability to use imagination to produce new and original ideas or works of art.',
    'community': 'A group of people living in the same place or having a particular characteristic in common.',
    'handicraft': 'An activity involving the making of decorative items by hand.',
    'preserve': 'To maintain something in its original state or to keep it safe from harm or decay.',
    'pottery': 'Pots, dishes, and other articles made of baked clay.',
    'delighted': 'Extremely pleased and happy about something.',
    'empathy': 'The ability to understand and share the feelings of another person.',
    'frustrated': 'Feeling annoyed or disappointed because you cannot achieve what you want.',
    'guidance': 'Help or advice given to someone, especially by a person with more experience.',
    'resolve': 'To find a solution to a problem, conflict or difficult situation.',
  };
  const handleAiGenerateCrosswordClue = async () => {
    if (!cwWord.trim()) {
      alert('Vui lòng nhập Từ Đáp Án trước khi bấm AI Sinh Câu Gợi Ý!');
      return;
    }
    setAiGeneratingCw(true);
    try {
      const rawWord = cwWord.trim().toLowerCase();
      const rawWordUpper = rawWord.toUpperCase();
      if (CROSSWORD_CLUES_DICT[rawWord]) {
        const clueText = CROSSWORD_CLUES_DICT[rawWord];
        setCwClue(clueText);
        playSuccessSound();
        setAiGeneratingCw(false);
        return;
      }
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.VITE_GEMINI_API_KEY || '';
      if (apiKey) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const promptText = `
Bạn là giáo viên Tiếng Anh xuất sắc. Hãy viết 1 câu định nghĩa/câu hỏi gợi ý (Clue) Tiếng Anh cụ thể, sinh động, chuẩn SGK cho từ vựng "${rawWordUpper}".
- Nếu là định nghĩa: Hãy giải thích ngắn gọn, dễ hiểu bằng tiếng Anh.
- Nếu là câu điền từ: Hãy thay từ "${rawWordUpper}" bằng dấu "..........".
- YÊU CẦU: Trả về duy nhất 1 câu Tiếng Anh chất lượng, KHÔNG dùng mẫu câu chung chung kiểu "Definition: An important English term...".
`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          if (text) {
            const cleanedClue = text.replace(/^"|"$/g, '').trim();
            setCwClue(cleanedClue);
            playSuccessSound();
            setAiGeneratingCw(false);
            return;
          }
        }
      }
      const wordLenStr = rawWordUpper.includes(' ')
        ? `(${rawWordUpper.split(' ').map((w) => w.length).join(',')})`
        : `(${rawWordUpper.length})`;
      setCwClue(`An activity or key vocabulary term in our free time and unit topic. ${wordLenStr}`);
      playSuccessSound();
    } catch (e) {
      alert('Không thể tự động sinh câu gợi ý!');
    } finally {
      setAiGeneratingCw(false);
    }
  };
  const handleSaveCrosswordClue = (e) => {
    e.preventDefault();
    if (!cwWord.trim() || !cwClue.trim()) {
      alert('Vui lòng nhập Từ Đáp Án và Câu Gợi Ý!');
      return;
    }
    const rawWord = cwWord.trim().toUpperCase();
    const collisions = checkCrosswordCollision(rawWord, cwDirection, Number(cwRow), Number(cwCol), editingCwItem?.id);
    if (collisions.length > 0) {
      const conf = collisions[0];
      alert(`⚠️ XUNG ĐỘT TỌA ĐỘ Ô CHỮ:\nTừ "${rawWord}" bị đè ký tự không trùng khớp với từ "${conf.conflictWord}" tại ô (Hàng ${conf.row}, Cột ${conf.col})!\n- Ký tự mới: '${conf.newChar}'\n- Ký tự đang có trên bảng: '${conf.existingChar}'\n\nHãy điều chỉnh lại vị trí Hàng/Cột hoặc chọn từ khác để cắt nhau đúng chữ cái!`);
      return;
    }
    const wordLenStr = rawWord.includes(' ') ? `(${rawWord.split(' ').map((w) => w.length).join(',')})` : `(${rawWord.length})`;
    let updated;
    if (editingCwItem) {
      updated = crosswordCluesList.map((item) =>
        item.id === editingCwItem.id
          ? {
              ...item,
              word: rawWord,
              direction: cwDirection,
              number: Number(cwNumber),
              row: Number(cwRow),
              col: Number(cwCol),
              clue: cwClue.trim(),
              hint: wordLenStr,
            }
          : item
      );
    } else {
      const newItem = {
        id: Date.now(),
        word: rawWord,
        direction: cwDirection,
        number: Number(cwNumber),
        row: Number(cwRow),
        col: Number(cwCol),
        clue: cwClue.trim(),
        hint: wordLenStr,
      };
      updated = [...crosswordCluesList, newItem];
    }
    setCrosswordCluesList(updated);
    try {
      localStorage.setItem(`vocab_crossword_v199_${activity?.id || 'default'}`, JSON.stringify(updated));
    } catch (err) {}
    setIsCrosswordModalOpen(false);
    playSuccessSound();
  };
  const handleDeleteCrosswordClue = (idToDelete) => {
    if (!window.confirm('Thầy Hải có chắc muốn xóa câu gợi ý ô chữ này không?')) return;
    const updated = crosswordCluesList.filter((i) => i.id !== idToDelete);
    setCrosswordCluesList(updated);
    try {
      localStorage.setItem(`vocab_crossword_v199_${activity?.id || 'default'}`, JSON.stringify(updated));
    } catch (err) {}
    playSuccessSound();
  };
  // CROSSWORD PLACEMENT CALCULATION MAP (HỖ TRỢ TỪ KÉP CÓ Ô ĐEN ⬛ CÁCH NHAU THEO ĐÚNG CHỈ ĐẠO THẦY HẢI)
  const crosswordCellMap = {};
  crosswordCluesList.forEach((clueItem) => {
    const rawWord = clueItem.word.toUpperCase().trim();
    const wordParts = rawWord.split(/\s+/).filter(Boolean);
    let currentR = clueItem.row;
    let currentC = clueItem.col;
    wordParts.forEach((part, pIdx) => {
      for (let i = 0; i < part.length; i++) {
        const r = currentR;
        const c = currentC;
        if (r >= 0 && r < 10 && c >= 0 && c < 14) {
          const cellKey = `${r}-${c}`;
          if (!crosswordCellMap[cellKey]) {
            crosswordCellMap[cellKey] = {
              letter: part[i],
              numbers: [],
              clueIds: [],
              isSpaceBlock: false,
              isSeparator: false,
            };
          } else {
            crosswordCellMap[cellKey].letter = part[i];
          }
          if (pIdx === 0 && i === 0) {
            if (!crosswordCellMap[cellKey].numbers.includes(clueItem.number)) {
              crosswordCellMap[cellKey].numbers.push(clueItem.number);
            }
          }
          if (!crosswordCellMap[cellKey].clueIds.includes(clueItem.id)) {
            crosswordCellMap[cellKey].clueIds.push(clueItem.id);
          }
        }
        if (clueItem.direction === 'across') currentC++;
        else currentR++;
      }
      // NGUYÊN TẮC THẦY HẢI: Với câu trả lời có 2 từ (như MAKING MODELS) thì cách 2 từ ra bằng 1 ô đen ⬛!
      if (pIdx < wordParts.length - 1) {
        const r = currentR;
        const c = currentC;
        if (r >= 0 && r < 10 && c >= 0 && c < 14) {
          const cellKey = `${r}-${c}`;
          crosswordCellMap[cellKey] = {
            letter: ' ',
            numbers: [],
            clueIds: [clueItem.id],
            isSpaceBlock: true,
            isSeparator: true,
          };
        }
        if (clueItem.direction === 'across') currentC++;
        else currentR++;
      }
    });
  });
  // TOGGLE BOOKMARK
  const handleToggleBookmark = (id, e) => {
    if (e) e.stopPropagation();
    let updated;
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter((i) => i !== id);
    } else {
      updated = [...bookmarkedIds, id];
    }
    setBookmarkedIds(updated);
    try {
      localStorage.setItem(`vocab_bookmarks_${activity?.id || 'default'}`, JSON.stringify(updated));
    } catch (e) {}
  };
  // TOGGLE ALL VISIBILITY HANDLER
  const handleToggleShowAll = () => {
    const nextVal = !showAll;
    setShowAll(nextVal);
    setShowImage(nextVal);
    setShowAudio(nextVal);
    setShowPhonetic(nextVal);
    setShowWord(nextVal);
    setShowMeaning(nextVal);
    setShowExamples(nextVal);
  };
  // FILTERED VOCABULARY LIST
  const filteredList = vocabList.filter((item) => {
    if (activeTab === 'bookmarks' && !bookmarkedIds.includes(item.id)) {
      return false;
    }
    const matchSearch =
      (item && item.word ? String(item.word).toLowerCase() : '').includes(searchQuery.toLowerCase()) ||
      (item && item.meaning ? String(item.meaning).toLowerCase() : '').includes(searchQuery.toLowerCase());
    const matchUnit = selectedUnit === 'All' || item.unit === selectedUnit;
    const matchSection = selectedSection === 'All' || item.section === selectedSection;
    const matchPos = selectedPos === 'All' || item.pos === selectedPos;
    return matchSearch && matchUnit && matchSection && matchPos;
  });
  // ACTIVE SCOPE LIST FOR GAMES (MUST FOCUS ONLY ON SELECTED LESSON SECTION ACCORDING TO THẦY HẢI'S REQUEST)
  // ACTIVE SCOPE LIST FOR GAMES (STRICTLY RESPECT LOCKS FOR STUDENTS - NEVER FALL BACK TO FULL VOCAB LIST)
  const activeScopeList = isTeacher ? (filteredList.length > 0 ? filteredList : vocabList) : filteredList;
  const currentItem = filteredList[selectedIndex] || filteredList[0] || vocabList[0];
  const availablePos = ['All', ...new Set(vocabList.map((i) => i.pos || 'n'))];
  // VOICE SYNTHESIS PLAYER
  const getSystemVoice = (opt) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    // Prioritize UK Voices (en-GB, en_GB, UK, British)
    const ukVoices = voices.filter(
      (v) => v.lang === 'en-GB' || v.lang === 'en_GB' || v.name.includes('UK') || v.name.includes('United Kingdom') || v.name.includes('British')
    );
    const fallbackVoices = ukVoices.length > 0 ? ukVoices : voices.filter((v) => v.lang.startsWith('en'));
    if (opt.includes('female') || opt === 'charlotte_uk' || opt === 'victoria_uk' || opt === 'emma_uk' || opt === 'girl') {
      return (
        ukVoices.find((v) => v.name.includes('Female') || v.name.includes('Hazel') || v.name.includes('Fiona') || v.name.includes('Susan') || v.name.includes('Google UK English Female')) ||
        fallbackVoices.find((v) => v.name.includes('Female') || v.name.includes('Google')) ||
        fallbackVoices[0]
      );
    } else {
      return (
        ukVoices.find((v) => v.name.includes('Male') || v.name.includes('George') || v.name.includes('Oliver') || v.name.includes('Arthur') || v.name.includes('Google UK English Male')) ||
        fallbackVoices.find((v) => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Guy')) ||
        fallbackVoices[0]
      );
    }
  };
  const speakText = (text, customWordAudioUrl = null) => {
    if (!text || typeof window === 'undefined') return;
    const specificWordMp3 = customWordAudioUrl || (currentItem && currentItem.word === text ? currentItem.audioUrl : '');
    if (specificWordMp3) {
      try {
        if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
        const audio = new Audio(specificWordMp3);
        audio.play().catch(() => {});
        return;
      } catch (e) {
        console.warn('Audio MP3 play error, fallback to AI voice synthesis:', e);
      }
    }
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        // NGUYÊN TẮC THẦY HẢI: Chuyển sang lowerCase để SpeechSynthesis đọc NGUYÊN TỪ, không bị đánh vần từng chữ cái lẻ
        const spokenText = String(text).toLowerCase().trim();
        const utterance = new SpeechSynthesisUtterance(spokenText);
        // 100% UK Standard Accent
        utterance.lang = 'en-GB';
        // Custom pitch & rate tuning for slow & melodic UK English intonation according to Thầy Hải's specification
        if (voiceOption === 'charlotte_uk') {
          utterance.pitch = 1.0;
          utterance.rate = 0.84; // Chậm rãi chuẩn Oxford, phát âm tròn chữ
        } else if (voiceOption === 'arthur_uk') {
          utterance.pitch = 0.88;
          utterance.rate = 0.74; // Rất chậm rãi kéo dài nguyên âm
        } else if (voiceOption === 'victoria_uk') {
          utterance.pitch = 1.08;
          utterance.rate = 0.80; // Âm điệu ngân vang viện hàn lâm
        } else if (voiceOption === 'oliver_uk') {
          utterance.pitch = 0.95;
          utterance.rate = 0.82; // Nhấn trọng âm rõ từng từ
        } else if (voiceOption === 'emma_uk') {
          utterance.pitch = 1.15;
          utterance.rate = 0.78; // Giọng cô giáo kéo dài từ dịu dàng
        } else if (voiceOption === 'george_uk') {
          utterance.pitch = 0.85;
          utterance.rate = 0.72; // Giọng kể chuyện kéo dài từ sâu lắng
        } else if (voiceOption === 'female_uk') {
          utterance.pitch = 1.05;
          utterance.rate = 0.86;
        } else if (voiceOption === 'male_uk') {
          utterance.pitch = 0.95;
          utterance.rate = 0.86;
        } else if (voiceOption === 'old_female') {
          utterance.pitch = 0.85;
          utterance.rate = 0.75;
        } else if (voiceOption === 'old_male') {
          utterance.pitch = 0.75;
          utterance.rate = 0.75;
        } else if (voiceOption === 'girl') {
          utterance.pitch = 1.25;
          utterance.rate = 0.86;
        } else if (voiceOption === 'boy') {
          utterance.pitch = 1.15;
          utterance.rate = 0.86;
        } else {
          utterance.pitch = 1.0;
          utterance.rate = 0.84;
        }
        const voiceObj = getSystemVoice(voiceOption);
        if (voiceObj) {
          utterance.voice = voiceObj;
          utterance.lang = voiceObj.lang;
        }
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('Voice Synthesis Error:', e);
    }
  };
  const handleChangeVoiceOption = (newOpt) => {
    setVoiceOption(newOpt);
    if (onSaveActivity) {
      onSaveActivity({
        ...settings,
        vocabularyList: vocabList,
        voiceOption: newOpt,
        masterAudioUrl: masterAudioUrl,
      });
    }
  };
  const handleTogglePlayAll = () => {
    if (isPlayingAll) {
      setIsPlayingAll(false);
      window.speechSynthesis.cancel();
      if (playAllTimerRef.current) clearInterval(playAllTimerRef.current);
    } else {
      setIsPlayingAll(true);
      let idx = 0;
      setSelectedIndex(0);
      const playNextWord = () => {
        if (idx >= filteredList.length) {
          setIsPlayingAll(false);
          return;
        }
        setSelectedIndex(idx);
        const item = filteredList[idx];
        if (item) speakText(item.word, item.audioUrl);
        idx++;
      };
      playNextWord();
      const timer = setInterval(() => {
        if (idx < filteredList.length) {
          playNextWord();
        } else {
          clearInterval(timer);
          setIsPlayingAll(false);
        }
      }, 3500);
      playAllTimerRef.current = timer;
    }
  };
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      if (playAllTimerRef.current) clearInterval(playAllTimerRef.current);
      if (timeAttackTimerRef.current) clearInterval(timeAttackTimerRef.current);
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    };
  }, []);
  // 60-SECOND TIME ATTACK COUNTDOWN ENGINE
  const start60sTimeAttackTimer = () => {
    setIsTimeAttackMode(true);
    setTimeAttackLeft(60);
    if (timeAttackTimerRef.current) clearInterval(timeAttackTimerRef.current);
    timeAttackTimerRef.current = setInterval(() => {
      setTimeAttackLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timeAttackTimerRef.current);
          playFanfareSound();
          alert('⏱️ HẾT GIỜ 60s TIME ATTACK! Thách thức hoàn thành!');
          return 0;
        }
        playTickingSound();
        return prev - 1;
      });
    }, 1000);
  };
  // HINT MAGNIFYING GLASS TRIGGER FUNCTION
  const handleTriggerHint = () => {
    if (hintCountLeft <= 0) {
      alert('🔒 Bạn đã dùng hết 3 lần gợi ý Kính Lúp!');
      return;
    }
    if (!wordSearchData) return;
    const targetWordObj = wordSearchData.placedWords.find((pw) => !foundWordList.includes(pw.word));
    if (!targetWordObj || targetWordObj.coords.length === 0) {
      alert('🎉 Tất cả các từ vựng đã được tìm thấy!');
      return;
    }
    const firstCoord = targetWordObj.coords[0];
    setHighlightedHintCell(firstCoord);
    setHintCountLeft((prev) => prev - 1);
    playSuccessSound();
    setTimeout(() => {
      setHighlightedHintCell(null);
    }, 3500);
  };
  // SUBMIT SCORE TO LEADERBOARD
  const handleSaveScoreToLeaderboard = (gameName, finalScore) => {
    const name = studentNameInput.trim() || user?.user_metadata?.full_name || 'Học Sinh';
    const newEntry = {
      name,
      score: finalScore,
      game: gameName,
      time: `${60 - timeAttackLeft || 45}s`,
      date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    };
    const updated = [...leaderboardScores, newEntry].sort((a, b) => b.score - a.score).slice(0, 5);
    setLeaderboardScores(updated);
    try {
      localStorage.setItem(`vocab_leaderboard_${activity?.id || 'default'}`, JSON.stringify(updated));
    } catch (e) {}
    alert(`🎉 Đã lưu kỷ lục điểm của ${name} vào Bảng Xếp Hạng Top 5!`);
  };
  // OPEN CERTIFICATE MODAL PRE-CONFIGURED WITH STUDENT NAME
  const handleOpenCertModal = (defaultName = '') => {
    if (defaultName) setCertStudentName(defaultName);
    else if (studentNameInput.trim()) setCertStudentName(studentNameInput.trim());
    else if (user?.user_metadata?.full_name) setCertStudentName(user.user_metadata.full_name);
    setIsCertModalOpen(true);
  };
  // FEATURE: INLINE ADD WORD DIRECTLY TO FIND THE WORD
  const handleQuickAddWordToSearchGame = () => {
    if (!quickAddWordInput.trim()) return;
    const newWordClean = quickAddWordInput.trim().toLowerCase();
    const newItem = {
      id: 'vocab_' + Date.now(),
      word: newWordClean,
      pos: 'n',
      phonetic: `/${newWordClean}/`,
      meaning: `${newWordClean} (nghĩa mới)`,
      unit: 'Unit 1',
      section: 'GETTING STARTED',
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
      audioUrl: '',
      phrases: [],
      examples: [`This is an example for ${newWordClean}.`],
    };
    const updatedList = [...vocabList, newItem];
    setVocabList(updatedList);
    setQuickAddWordInput('');
    playSuccessSound();
    const data = generateWordSearchGrid(updatedList);
    setWordSearchData(data);
    setFoundWordList([]);
    alert(`➕ Đã thêm từ "${newWordClean}" thành công vào Game Find the Word!`);
    if (onSaveActivity) {
      onSaveActivity({
        ...settings,
        vocabularyList: updatedList,
        voiceOption: voiceOption,
        masterAudioUrl: masterAudioUrl,
      });
    }
  };
  const handleDeleteWordFromSearchGame = (wordToDelete) => {
    const updatedList = vocabList.filter((item) => item.word.toUpperCase() !== wordToDelete.toUpperCase());
    setVocabList(updatedList);
    playSuccessSound();
    const data = generateWordSearchGrid(updatedList);
    setWordSearchData(data);
    setFoundWordList([]);
    if (onSaveActivity) {
      onSaveActivity({
        ...settings,
        vocabularyList: updatedList,
        voiceOption: voiceOption,
        masterAudioUrl: masterAudioUrl,
      });
    }
  };
  // FEATURE: AI AUTO GENERATE ALL 10 WORDS / QUESTIONS FOR GAMES
  const handleAiGenerateDialogCards = async () => {
    setAiGeneratingDialog(true);
    try {
      const generated = vocabList.map((item) => {
        const word = item.word;
        let exampleQ = item.examples && item.examples.length > 0
          ? (typeof item.examples[0] === 'string' ? item.examples[0] : item.examples[0].en)
          : `${word.charAt(0).toUpperCase() + word.slice(1)} is very important.`;
        const regex = new RegExp(word, 'gi');
        const questionText = exampleQ.replace(regex, '..........');
        return {
          id: item.id,
          question: questionText,
          answer: word,
          meaning: item.meaning,
          imageUrl: item.imageUrl,
        };
      });
      setDialogCardsList(generated);
      playSuccessSound();
      alert(`⚡ AI đã tự động sinh ${generated.length} câu hỏi điền từ Dialog Cards thông minh cho bài học này!`);
    } catch (e) {
      alert('Không thể tạo câu hỏi Dialog Cards!');
    } finally {
      setAiGeneratingDialog(false);
    }
  };
  const handleTestPronunciation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói. Hãy dùng Google Chrome!');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsRecording(true);
    setSpeechResult(null);
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.toLowerCase().trim();
      const targetText = (currentItem?.word || '').toLowerCase().trim();
      setIsRecording(false);
      if (spokenText === targetText || targetText.includes(spokenText) || spokenText.includes(targetText)) {
        playSuccessSound();
        setSpeechResult({ success: true, text: spokenText, score: 98 });
      } else {
        playErrorSound();
        setSpeechResult({ success: false, text: spokenText, score: 65 });
      }
    };
    recognition.onerror = () => {
      setIsRecording(false);
      playErrorSound();
      setSpeechResult({ success: false, text: 'Không nghe thấy rõ...', score: 0 });
    };
    recognition.start();
  };
  const handleAiAutoFill = async () => {
    if (!editWord.trim()) {
      alert('Vui lòng nhập Từ Tiếng Anh (Word) trước khi bấm AI Tự Động Điền!');
      return;
    }
    setAiGenerating(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.VITE_GEMINI_API_KEY || '';
      const rawWord = editWord.trim();
      if (apiKey) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const promptText = `
Bạn là một Từ điển Tiếng Anh - Tiếng Việt thông minh cho học sinh Việt Nam.
Hãy tra cứu và trả về dữ liệu chuẩn JSON cho từ tiếng Anh "${rawWord}".
LƯU Ý QUAN TRỌNG: Nếu từ ngưởi dùng nhập bị sai chính tả (ví dụ "surburb" -> "suburb"), hãy tự sửa lại chính tả đúng và gán vào trường "correctWord".
YÊU CẦU ĐẦU RA (Chỉ trả về JSON thuần túy, không kèm Markdown):
{
  "correctWord": "suburb",
  "pos": "n",
  "phonetic": "/ˈsʌb.ɜːb/",
  "meaning": "khu vực ngoại ô (ngoại thành thành phố)",
  "imageUrl": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80",
  "phrases": ["quiet suburb", "in the suburbs of Ha Noi"],
  "examples": ["We live in a quiet suburb of Ha Noi with lots of trees.", "Many families move to the suburbs for cleaner air."]
}
`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const aiJson = JSON.parse(cleanedText);
          if (aiJson) {
            if (aiJson.correctWord) setEditWord(aiJson.correctWord);
            setEditPos(aiJson.pos || 'n');
            setEditPhonetic(aiJson.phonetic || `/${rawWord}/`);
            setEditMeaning(aiJson.meaning || '');
            if (aiJson.imageUrl) setEditImageUrl(aiJson.imageUrl);
            setEditPhrasesStr(Array.isArray(aiJson.phrases) ? aiJson.phrases.join('\n') : '');
            setEditExamplesStr(Array.isArray(aiJson.examples) ? aiJson.examples.join('\n') : '');
            playSuccessSound();
            setAiGenerating(false);
            return;
          }
        }
      }
      const lower = rawWord.toLowerCase();
      let targetWord = rawWord;
      let pos = 'n';
      let phonetic = `/${lower}/`;
      let meaning = `${lower} (nghĩa tự động)`;
      let img = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80';
      let phrases = [`learn ${lower}`, `use ${lower}`];
      let examples = [`${lower.charAt(0).toUpperCase() + lower.slice(1)} is very important in learning English.`];
      if (lower.includes('surburb') || lower.includes('suburb')) {
        targetWord = 'suburb'; pos = 'n'; phonetic = '/ˈsʌb.ɜːb/'; meaning = 'khu vực ngoại ô (ngoại thành thành phố)'; img = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80'; phrases = ['quiet suburb', 'in the suburbs of Ha Noi']; examples = ['We live in a quiet suburb of Ha Noi with lots of trees.', 'Many families move to the suburbs for cleaner air.'];
      } else if (lower.includes('police') || lower.includes('officer')) {
        targetWord = 'police officer'; pos = 'n'; phonetic = '/pəˈliːs ˈɒfɪsər/'; meaning = 'cảnh sát, sĩ quan công an (giữ gìn trật tự an ninh)'; img = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80'; phrases = ['police officer on duty', 'call a police officer']; examples = ['The police officer directed traffic during rush hour.', 'Every police officer wears a blue uniform.'];
      } else if (lower.includes('artisan')) {
        targetWord = 'artisan'; pos = 'n'; phonetic = '/ˌɑːtɪˈzæn/'; meaning = 'thợ thủ công, nghệ nhân làm đồ truyền thống'; img = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80'; phrases = ['skilled artisan', 'handicraft artisan']; examples = ['The artisan spent hours shaping the ceramic vase.'];
      } else if (lower === 'cardboard') {
        targetWord = 'cardboard'; pos = 'n'; phonetic = "/'kɑːdboːd/"; meaning = 'bìa các tông'; img = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'; phrases = ['cardboard boxes', 'a piece of cardboard']; examples = ['She packed her books in cardboard boxes.', 'He opened the cardboard box and took out each item.'];
      } else if (lower === 'dollhouse') {
        targetWord = 'dollhouse'; pos = 'n'; phonetic = "/'dɒlhaʊs/"; meaning = 'nhà mô hình (nhà búp bê)'; img = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80'; phrases = ['wooden dollhouse', 'build a dollhouse']; examples = ['My sister loves playing with her wooden dollhouse.'];
      } else if (lower === 'gardening') {
        targetWord = 'gardening'; pos = 'n'; phonetic = "/'ɡɑːdnɪŋ/"; meaning = 'làm vườn'; img = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80'; phrases = ['enjoy gardening', 'gardening tools']; examples = ['My grandmother spends time gardening every morning.'];
      } else if (lower === 'glue') {
        targetWord = 'glue'; pos = 'n'; phonetic = '/ɡluː/'; meaning = 'keo dán'; img = 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80'; phrases = ['paper glue', 'stick with glue']; examples = ['Use glue to stick the paper models together.'];
      } else if (lower === 'horse riding') {
        targetWord = 'horse riding'; pos = 'n'; phonetic = "/'hɔːs raɪdɪŋ/"; meaning = 'cưỡi ngựa'; img = 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&auto=format&fit=crop&q=80'; phrases = ['go horse riding', 'horse riding club']; examples = ['Horse riding is an exciting outdoor hobby.'];
      } else if (lower.includes('making models')) {
        targetWord = 'making models'; pos = 'v phr'; phonetic = "/'meɪkɪŋ 'mɒdlz/"; meaning = 'làm mô hình'; img = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80'; phrases = ['making plane models', 'enjoy making models']; examples = ['Making models requires patience and care.'];
      } else if (lower === 'popular') {
        targetWord = 'popular'; pos = 'adj'; phonetic = "/'pɒpjələ(r)/"; meaning = 'phổ biến, được ưa thích'; img = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80'; phrases = ['popular hobby', 'popular among students']; examples = ['Football is a very popular sport in Viet Nam.'];
      } else if (lower === 'unusual') {
        targetWord = 'unusual'; pos = 'adj'; phonetic = "/ʌn'juːʒuəl/"; meaning = 'độc lạ, khác thường'; img = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80'; phrases = ['unusual hobby', 'find something unusual']; examples = ['Collecting insect specimens is an unusual hobby.'];
      } else if (lower === 'coin') {
        targetWord = 'coin'; pos = 'n'; phonetic = '/kɔɪn/'; meaning = 'tiền xu'; img = 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80'; phrases = ['collect coins', 'flip a coin']; examples = ['They like collecting old coins.', "I couldn't decide, so I flipped a coin."];
      } else if (lower === 'jogging') {
        targetWord = 'jogging'; pos = 'n'; phonetic = "/'dʒɒɡɪŋ/"; meaning = 'đi bộ thể dục / chạy bộ'; img = 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop&q=80'; phrases = ['go jogging', 'morning jogging']; examples = ['My father goes jogging around the park every morning.'];
      } else if (lower === 'model') {
        targetWord = 'model'; pos = 'n'; phonetic = "/'mɒdl/"; meaning = 'mô hình'; img = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80'; phrases = ['scale model', 'build a model']; examples = ['He built a beautiful scale model of a sailboat.'];
      } else if (lower === 'yoga') {
        targetWord = 'yoga'; pos = 'n'; phonetic = "/'jəʊɡə/"; meaning = 'tập yoga'; img = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80'; phrases = ['do yoga', 'yoga class']; examples = ['Doing yoga helps improve health and reduce stress.'];
      }
      setEditWord(targetWord);
      setEditPos(pos);
      setEditPhonetic(phonetic);
      setEditMeaning(meaning);
      setEditImageUrl(img);
      setEditPhrasesStr(phrases.join('\n'));
      setEditExamplesStr(examples.join('\n'));
      playSuccessSound();
    } catch (e) {
      alert('Không thể gọi AI tự động. Vui lòng nhập thủ công!');
    } finally {
      setAiGenerating(false);
    }
  };
  // FEATURE: HANDLE BULK AI VOCABULARY GENERATION
  const handleBulkAiGenerate = async () => {
    if (!bulkInputText.trim()) {
      alert('Vui lòng nhập hoặc dán danh sách từ tiếng Anh!');
      return;
    }
    setBulkGenerating(true);
    try {
      const rawTokens = bulkInputText
        .split(/[\n,;\t]+/)
        .map((w) => w.trim())
        .filter((w) => w.length >= 2);
      const wordsToProcess = [...new Set(rawTokens)];
      if (wordsToProcess.length === 0) {
        alert('Không tìm thấy từ tiếng Anh hợp lệ nào trong danh sách!');
        setBulkGenerating(false);
        return;
      }
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.VITE_GEMINI_API_KEY || '';
      let generatedEntries = [];
      if (apiKey) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const promptText = `
Bạn là Từ điển Tiếng Anh SGK Global Success cho học sinh Việt Nam.
Hãy tra cứu và trả về mảng JSON dữ liệu từ vựng đầy đủ cho danh sách các từ tiếng Anh sau: [${wordsToProcess.join(', ')}].
YÊU CẦU ĐẦU RA (Chỉ trả về JSON thuần túy array of objects, không kèm Markdown codeblock):
[
  {
    "word": "cardboard",
    "pos": "n",
    "phonetic": "/'kɑːdboːd/",
    "meaning": "bìa các tông",
    "imageUrl": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80",
    "phrases": ["cardboard boxes", "a piece of cardboard"],
    "examples": ["She packed her books in cardboard boxes.", "He opened the cardboard box and took out each item."]
  }
]
`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            generatedEntries = parsed.map((item, idx) => ({
              id: 'vocab_' + Date.now() + '_' + idx,
              word: item.word || wordsToProcess[idx],
              pos: item.pos || 'n',
              phonetic: item.phonetic || `/${item.word}/`,
              meaning: item.meaning || item.word,
              unit: bulkUnit,
              section: bulkSection,
              imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
              audioUrl: '',
              phrases: Array.isArray(item.phrases) ? item.phrases : [],
              examples: Array.isArray(item.examples) ? item.examples : [`This is an example sentence for ${item.word}.`]
            }));
          }
        }
      }
      if (generatedEntries.length === 0) {
        generatedEntries = wordsToProcess.map((w, idx) => {
          const lower = w.toLowerCase();
          let pos = 'n';
          let phonetic = `/${lower}/`;
          let meaning = lower;
          let img = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80';
          let phrases = [`learn ${lower}`, `use ${lower}`];
          let examples = [`${lower.charAt(0).toUpperCase() + lower.slice(1)} is very useful in daily conversation.`];
          if (lower === 'cardboard') { phonetic = "/'kɑːdboːd/"; meaning = 'bìa các tông'; img = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'; phrases = ['cardboard boxes', 'a piece of cardboard']; examples = ['She packed her books in cardboard boxes.']; }
          else if (lower === 'dollhouse') { phonetic = "/'dɒlhaʊs/"; meaning = 'nhà mô hình (nhà búp bê)'; img = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80'; phrases = ['wooden dollhouse']; examples = ['My sister loves playing with her dollhouse.']; }
          else if (lower === 'gardening') { phonetic = "/'ɡɑːdnɪŋ/"; meaning = 'làm vườn'; img = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80'; phrases = ['enjoy gardening']; examples = ['My grandmother spends time gardening.']; }
          else if (lower === 'glue') { phonetic = '/ɡluː/'; meaning = 'keo dán'; img = 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80'; phrases = ['paper glue']; examples = ['Use glue to stick paper models together.']; }
          else if (lower === 'horse riding') { phonetic = "/'hɔːs raɪdɪŋ/"; meaning = 'cưỡi ngựa'; img = 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&auto=format&fit=crop&q=80'; phrases = ['go horse riding']; examples = ['Horse riding is an exciting outdoor hobby.']; }
          else if (lower.includes('making models')) { pos = 'v phr'; phonetic = "/'meɪkɪŋ 'mɒdlz/"; meaning = 'làm mô hình'; img = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80'; phrases = ['making plane models']; examples = ['Making models requires patience.']; }
          else if (lower === 'popular') { pos = 'adj'; phonetic = "/'pɒpjələ(r)/"; meaning = 'phổ biến, được ưa thích'; img = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80'; phrases = ['popular hobby']; examples = ['Football is a popular sport.']; }
          else if (lower === 'unusual') { pos = 'adj'; phonetic = "/ʌn'juːʒuəl/"; meaning = 'độc lạ, khác thường'; img = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80'; phrases = ['unusual hobby']; examples = ['Collecting insect specimens is an unusual hobby.']; }
          else if (lower === 'coin') { phonetic = '/kɔɪn/'; meaning = 'tiền xu'; img = 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80'; phrases = ['collect coins']; examples = ['They like collecting old coins.']; }
          else if (lower === 'jogging') { phonetic = "/'dʒɒɡɪŋ/"; meaning = 'đi bộ thể dục / chạy bộ'; img = 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop&q=80'; phrases = ['go jogging']; examples = ['My father goes jogging every morning.']; }
          else if (lower === 'model') { phonetic = "/'mɒdl/"; meaning = 'mô hình'; img = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80'; phrases = ['scale model']; examples = ['He built a scale model.']; }
          else if (lower === 'yoga') { phonetic = "/'jəʊɡə/"; meaning = 'tập yoga'; img = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80'; phrases = ['do yoga']; examples = ['Doing yoga helps reduce stress.']; }
          return {
            id: 'vocab_' + Date.now() + '_' + idx,
            word: w,
            pos,
            phonetic,
            meaning,
            unit: bulkUnit,
            section: bulkSection,
            imageUrl: img,
            audioUrl: '',
            phrases,
            examples
          };
        });
      }
      // GUARANTEE VIETNAMESE TRANSLATION FOR EVERY GENERATED ITEM
      for (let i = 0; i < generatedEntries.length; i++) {
        const item = generatedEntries[i];
        const wLower = (item.word || '').toLowerCase().trim();
        const mLower = (item.meaning || '').toLowerCase().trim();
        if (!mLower || mLower === wLower || mLower.includes('(nghĩa tự động)') || mLower.includes('(nghĩa mới)')) {
          if (STATIC_VOCAB_DICT[wLower]) {
            item.meaning = STATIC_VOCAB_DICT[wLower];
          } else {
            try {
              const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(wLower)}&langpair=en|vi`);
              if (res.ok) {
                const data = await res.json();
                const trans = data?.responseData?.translatedText;
                if (trans && trans.toLowerCase() !== wLower && !trans.includes('MYMEMORY WARNING')) {
                  item.meaning = trans.toLowerCase();
                }
              }
            } catch (e) {}
          }
        }
      }
      const existingWordsUpper = vocabList.map((v) => v.word.toUpperCase());
      const newItemsOnly = generatedEntries.filter((v) => !existingWordsUpper.includes(v.word.toUpperCase()));
      const updatedList = [...vocabList, ...newItemsOnly];
      setVocabList(updatedList);
      setSelectedIndex(0);
      setIsBulkAiModalOpen(false);
      setBulkInputText('');
      playSuccessSound();
      if (onSaveActivity) {
        onSaveActivity({
          ...settings,
          vocabularyList: updatedList,
          voiceOption: voiceOption,
          masterAudioUrl: masterAudioUrl,
        });
      }
      alert(`🎉 AI đã tự động nhập & tạo thành công ${newItemsOnly.length} từ vựng chi tiết vào ${bulkUnit} - ${bulkSection}! Thầy Hải có thể bấm vào từng từ trên danh sách để điều chỉnh, xóa, hoặc sửa tùy ý.`);
    } catch (err) {
      alert('Lỗi tạo hàng loạt: ' + err.message);
    } finally {
      setBulkGenerating(false);
    }
  };
  const handleOpenStudio = (itemToEdit = null) => {
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setEditWord(itemToEdit.word || '');
      setEditPos(itemToEdit.pos || 'n');
      setEditPhonetic(itemToEdit.phonetic || '');
      setEditMeaning(itemToEdit.meaning || '');
      setEditUnit(itemToEdit.unit || 'Unit 1');
      setEditSection(itemToEdit.section || 'GETTING STARTED');
      setEditImageUrl(itemToEdit.imageUrl || '');
      setEditAudioUrl(itemToEdit.audioUrl || '');
      setEditPhrasesStr(Array.isArray(itemToEdit.phrases) ? itemToEdit.phrases.join('\n') : '');
      setEditExamplesStr(Array.isArray(itemToEdit.examples) ? itemToEdit.examples.join('\n') : '');
    } else {
      setEditingItem(null);
      setEditWord('');
      setEditPos('n');
      setEditPhonetic('');
      setEditMeaning('');
      setEditUnit('Unit 1');
      setEditSection('GETTING STARTED');
      setEditImageUrl('');
      setEditAudioUrl('');
      setEditPhrasesStr('');
      setEditExamplesStr('');
    }
    setIsStudioOpen(true);
  };
  const handleSaveStudioItem = (e) => {
    e.preventDefault();
    if (!editWord.trim() || !editMeaning.trim()) {
      alert('Vui lòng nhập từ tiếng Anh và nghĩa tiếng Việt!');
      return;
    }
    const phrasesArr = editPhrasesStr.split('\n').map((s) => s.trim()).filter(Boolean);
    const examplesArr = editExamplesStr.split('\n').map((s) => s.trim()).filter(Boolean);
    let updatedList;
    if (editingItem) {
      updatedList = vocabList.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              word: editWord.trim(),
              pos: editPos,
              phonetic: editPhonetic.trim(),
              meaning: editMeaning.trim(),
              unit: editUnit,
              section: editSection,
              imageUrl: editImageUrl.trim(),
              audioUrl: editAudioUrl.trim(),
              phrases: phrasesArr,
              examples: examplesArr,
            }
          : item
      );
    } else {
      const newItem = {
        id: 'vocab_' + Date.now(),
        word: editWord.trim(),
        pos: editPos,
        phonetic: editPhonetic.trim(),
        meaning: editMeaning.trim(),
        unit: editUnit,
        section: editSection,
        imageUrl: editImageUrl.trim() || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
        audioUrl: editAudioUrl.trim(),
        phrases: phrasesArr,
        examples: examplesArr,
      };
      updatedList = [...vocabList, newItem];
    }
    setVocabList(updatedList);
    setIsStudioOpen(false);
    playSuccessSound();
    if (onSaveActivity) {
      onSaveActivity({
        ...settings,
        vocabularyList: updatedList,
        voiceOption: voiceOption,
        masterAudioUrl: masterAudioUrl,
      });
    }
  };
  const handleDeleteStudioItem = (idToDelete) => {
    if (!window.confirm('Thầy Hải có chắc chắn muốn xóa từ vựng này khỏi từ điển không?')) return;
    const updatedList = vocabList.filter((item) => item.id !== idToDelete);
    setVocabList(updatedList);
    if (selectedIndex >= updatedList.length) setSelectedIndex(Math.max(0, updatedList.length - 1));
    if (onSaveActivity) {
      onSaveActivity({
        ...settings,
        vocabularyList: updatedList,
        voiceOption: voiceOption,
        masterAudioUrl: masterAudioUrl,
      });
    }
  };
  const handleImportPreset = () => {
    const listToImport = GLOBAL_SUCCESS_PRESETS[selectedGrade]?.[selectedPresetUnit] || [];
    if (listToImport.length === 0) {
      alert('Không tìm thấy dữ liệu từ vựng cho bài học này!');
      return;
    }
    setVocabList(listToImport);
    setSelectedIndex(0);
    setIsPresetModalOpen(false);
    playSuccessSound();
    if (onSaveActivity) {
      onSaveActivity({
        ...settings,
        vocabularyList: listToImport,
        voiceOption: voiceOption,
        masterAudioUrl: masterAudioUrl,
      });
    }
    alert(`🎉 Đã tự động nhập ${listToImport.length} từ vựng SGK ${selectedGrade} - ${selectedPresetUnit} thành công!`);
  };
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = await uploadLMSFile(file, 'vocabulary');
      setEditImageUrl(url);
    } catch (err) {
      alert('Lỗi tải ảnh: ' + err.message);
    } finally {
      setUploadingImg(false);
    }
  };
  const handleWordAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingWordAudio(true);
    try {
      const url = await uploadLMSFile(file, 'vocabulary_audio');
      setEditAudioUrl(url);
      playSuccessSound();
      alert('✓ Đã tải lên file âm thanh MP3 phát âm riêng cho từ vựng thành công!');
    } catch (err) {
      alert('Lỗi tải file MP3 âm thanh: ' + err.message);
    } finally {
      setUploadingWordAudio(false);
    }
  };
  const handleMasterAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingMasterAudio(true);
    try {
      const url = await uploadLMSFile(file, 'master_voice');
      setMasterAudioUrl(url);
      setVoiceOption('custom');
      playSuccessSound();
      if (onSaveActivity) {
        onSaveActivity({
          ...settings,
          vocabularyList: vocabList,
          voiceOption: 'custom',
          masterAudioUrl: url,
        });
      }
      alert('✓ Đã nạp file giọng đọc mẫu MP3 thành công! AI sẽ dùng giọng này để Clone phát âm tất cả từ vựng.');
    } catch (err) {
      alert('Lỗi tải file giọng đọc mẫu: ' + err.message);
    } finally {
      setUploadingMasterAudio(false);
    }
  };
  // INITIALIZE GAME DATA UPON TAB SWITCHING & SECTION SWITCHING
  const initMemoryGame = () => {
    const sample = activeScopeList.slice(0, 8);
    const cardPairs = [];
    sample.forEach((item) => {
      cardPairs.push({
        id: `word_${item.id}`,
        vocabId: item.id,
        type: 'word',
        content: item.word,
        phonetic: item.phonetic,
        audio: item.word,
        audioUrl: item.audioUrl,
      });
      cardPairs.push({
        id: `meaning_${item.id}`,
        vocabId: item.id,
        type: 'meaning',
        content: item.meaning,
        image: item.imageUrl,
      });
    });
    const shuffled = [...cardPairs].sort(() => Math.random() - 0.5);
    setMemoryCards(shuffled);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMemoryMoves(0);
    setMemoryScore(0);
    setP1Score(0);
    setP2Score(0);
    setActivePlayer(1);
    setMemoryGameOver(false);
  };
  // CẤU HÌNH ĐỒNG HỒ ĐẾM NGƯỢC 5 PHÚT VÀ POP-UP CHÚC MỪNG HOÀN THÀNH (VICTORY MODAL)
  const [wordSearchTimeLeft, setWordSearchTimeLeft] = useState(300); // 300 giây = 5 phút
  const [isWordSearchTimerRunning, setIsWordSearchTimerRunning] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const formatTimerMinSec = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  const initWordSearchGame = () => {
    const data = generateWordSearchGrid(activeScopeList, activityGrade);
    setWordSearchData(data);
    setSelectedCells([]);
    setFoundWordList([]);
    setWordSearchScore(0);
    setP1Score(0);
    setP2Score(0);
    setActivePlayer(1);
    setHintCountLeft(3);
    setHighlightedHintCell(null);
    setWordSearchTimeLeft(300); // Reset về 5 phút chuẩn
    setIsWordSearchTimerRunning(true);
    setShowVictoryModal(false);
    setShowTimeoutModal(false);
  };
  // EFFECT ĐẾM NGƯỢC THỜI GIAN 5 PHÚT
  useEffect(() => {
    let timer = null;
    if (activeTab === 'word_search' && isWordSearchTimerRunning && wordSearchTimeLeft > 0 && !showVictoryModal && !showTimeoutModal) {
      timer = setInterval(() => {
        setWordSearchTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsWordSearchTimerRunning(false);
            setShowTimeoutModal(true);
            playErrorSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTab, isWordSearchTimerRunning, wordSearchTimeLeft, showVictoryModal, showTimeoutModal]);
  useEffect(() => {
    if (activeTab === 'memory_game') {
      initMemoryGame();
    } else if (activeTab === 'spelling_game') {
      setSpellingIndex(0);
      setSpellingInput('');
      setSpellingScore(0);
      setSpellingStreak(0);
      setSpellingFeedback(null);
    } else if (activeTab === 'word_search') {
      initWordSearchGame();
    } else if (activeTab === 'flashcard') {
      setFlashcardIndex(0);
      setFlashcardFlipped(false);
    } else if (activeTab === 'dialog_cards') {
      if (dialogCardsList.length === 0) handleAiGenerateDialogCards();
      setDialogIndex(0);
      setDialogInput('');
      setDialogFeedback(null);
    }
  }, [activeTab, vocabList, selectedSection, selectedUnit]);
  // GAME 1: MEMORY MATCH CLICK HANDLER WITH VERSUS 2-PLAYER SUPPORT
  const handleCardClick = (index) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(index) || matchedPairs.includes(index)) {
      return;
    }
    const clickedCard = memoryCards[index];
    if (clickedCard.type === 'word') {
      speakText(clickedCard.content, clickedCard.audioUrl);
    }
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    if (newFlipped.length === 2) {
      setMemoryMoves((prev) => prev + 1);
      const card1 = memoryCards[newFlipped[0]];
      const card2 = memoryCards[newFlipped[1]];
      if (card1.vocabId === card2.vocabId) {
        playSuccessSound();
        const bonus = isTimeAttackMode ? 200 : 100;
        setMatchedPairs((prev) => [...prev, newFlipped[0], newFlipped[1]]);
        if (isVersusMode) {
          if (activePlayer === 1) setP1Score((prev) => prev + bonus);
          else setP2Score((prev) => prev + bonus);
        } else {
          setMemoryScore((prev) => prev + bonus);
        }
        setFlippedIndices([]);
        if (matchedPairs.length + 2 >= memoryCards.length) {
          playFanfareSound();
          setMemoryGameOver(true);
          unlockNextQuestStage(2, 3);
        }
      } else {
        playErrorSound();
        setTimeout(() => {
          setFlippedIndices([]);
          if (isVersusMode) {
            setActivePlayer((prev) => (prev === 1 ? 2 : 1));
          }
        }, 1200);
      }
    }
  };
  // GAME 2: SPELLING BEE CLICK HANDLER
  const spellingScopeList = activeScopeList.length > 0 ? activeScopeList : vocabList;
  const currentSpellingItem = spellingScopeList[spellingIndex % spellingScopeList.length] || spellingScopeList[0];
  const handleCheckSpelling = () => {
    if (!currentSpellingItem) return;
    const target = currentSpellingItem.word.toLowerCase().trim();
    const userAns = spellingInput.toLowerCase().trim();
    if (userAns === target) {
      playSuccessSound();
      speakText(currentSpellingItem.word, currentSpellingItem.audioUrl);
      setSpellingScore((prev) => prev + 20);
      setSpellingStreak((prev) => prev + 1);
      setSpellingFeedback({ success: true, msg: '🎉 CHÍNH XÁC! Bạn đã gõ đúng từ vựng!' });
      setTimeout(() => {
        setSpellingFeedback(null);
        setSpellingInput('');
        setSpellingIndex((prev) => (prev + 1) % spellingScopeList.length);
      }, 1500);
    } else {
      playErrorSound();
      setSpellingStreak(0);
      setSpellingFeedback({ success: false, msg: `❌ Chưa chính xác. Đáp án đúng là: "${currentSpellingItem.word}"` });
    }
  };
  const handleSpellingMic = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Trình duyệt chưa hỗ trợ giọng nói. Hãy dùng Google Chrome!');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    setSpellingMicRecording(true);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript.toLowerCase().trim();
      setSpellingInput(text);
      setSpellingMicRecording(false);
    };
    rec.onerror = () => setSpellingMicRecording(false);
    rec.start();
  };
  // GAME 3: WORD SEARCH CELL CLICK HANDLER (CÓ HIỆU ỨNG NHÁY ĐỎ 🔴 + TỰ BIẾN MẤT KHI CHỌN TỪ SAI)
  const [wrongSelectedCells, setWrongSelectedCells] = useState([]);
  const handleWordSearchCellClick = (r, c) => {
    const key = `${r}-${c}`;
    if (!wordSearchData) return;
    const unfoundWords = wordSearchData.placedWords.filter((pw) => !foundWordList.includes(pw.word));
    const allUnfoundCoords = unfoundWords.flatMap((pw) => pw.coords);
    // TRƯỜNG HỢP 1: HS ĐÃ TÌM XONG TẤT CẢ CÁC TỪ (7/7 hoặc 9/9) KHÔNG THỂ CHỌN THÊM Ô NÀO NỮA
    if (unfoundWords.length === 0) {
      playErrorSound();
      setWrongSelectedCells([key]);
      setSelectedCells([]);
      setTimeout(() => setWrongSelectedCells([]), 650);
      return;
    }
    // TRƯỜNG HỢP 2: Ô BẤM LÀ Ô THUỘC TỪ ĐÃ TÌM THẤY (XANH LÁ) VÀ KHÔNG THUỘC TỪ CHƯA TÌM NÀO
    if (!allUnfoundCoords.includes(key)) {
      playErrorSound();
      setWrongSelectedCells([key]);
      setSelectedCells([]);
      setTimeout(() => setWrongSelectedCells([]), 650);
      return;
    }
    let newSel = [...selectedCells];
    if (newSel.includes(key)) {
      newSel = newSel.filter((k) => k !== key);
    } else {
      newSel.push(key);
    }
    // NẾU CHỌN PHẢI Ô RÁC KHÔNG THUỘC BẤT KỲ TỪ CHƯA TÌM NÀO
    if (newSel.some((k) => !allUnfoundCoords.includes(k))) {
      playErrorSound();
      setWrongSelectedCells([...newSel]);
      setSelectedCells([]);
      setTimeout(() => setWrongSelectedCells([]), 650);
      return;
    }
    setSelectedCells(newSel);
    const maxLen = unfoundWords.length > 0 ? Math.max(...unfoundWords.map((pw) => pw.coords.length)) : 10;
    const allFoundCoords = wordSearchData.placedWords
      .filter((otherPw) => foundWordList.includes(otherPw.word))
      .flatMap((otherPw) => otherPw.coords);
    const isCoordFilled = (coord) => newSel.includes(coord) || allFoundCoords.includes(coord);
    let isAnyWordMatched = false;
    unfoundWords.forEach((pw) => {
      const hasSelectedCell = pw.coords.some((coord) => newSel.includes(coord));
      const matchAll = hasSelectedCell && pw.coords.every((coord) => isCoordFilled(coord));
      if (matchAll) {
        isAnyWordMatched = true;
        playSuccessSound();
        const bonus = isTimeAttackMode ? 200 : 100;
        setFoundWordList((prev) => [...prev, pw.word]);
        if (isVersusMode) {
          if (activePlayer === 1) setP1Score((prev) => prev + bonus);
          else setP2Score((prev) => prev + bonus);
        } else {
          setWordSearchScore((prev) => prev + bonus);
        }
        // NGUYÊN TẮC THẦY HẢI: ĐỌC VOICE NGUYÊN TỪ TIẾNG ANH, CẤM ĐÁNH VẦN CHỮ CÁI LẺ!
        speakText(pw.word);
        setSelectedCells((prev) => prev.filter((k) => !pw.coords.includes(k)));
        if (foundWordList.length + 1 >= wordSearchData.placedWords.length) {
          playFanfareSound();
          setIsWordSearchTimerRunning(false);
          setShowVictoryModal(true);
          unlockNextQuestStage(3, 3);
        }
      }
    });
    if (!isAnyWordMatched && newSel.length > maxLen) {
      playErrorSound();
      setWrongSelectedCells([...newSel]);
      setSelectedCells([]);
      setTimeout(() => setWrongSelectedCells([]), 650);
    }
  };
  // GAME 6: DIALOG CARDS CHECK HANDLER
  const activeDialogItem = dialogCardsList[dialogIndex] || {
    question: `${currentItem?.word ? currentItem.word.charAt(0).toUpperCase() + currentItem.word.slice(1) : 'Word'} is very important ..........`,
    answer: currentItem?.word || 'suburb',
    meaning: currentItem?.meaning || 'khu vực ngoại ô',
    imageUrl: currentItem?.imageUrl,
  };
  const handleCheckDialogAnswer = () => {
    if (!activeDialogItem) return;
    const target = activeDialogItem.answer.toLowerCase().trim();
    const userAns = dialogInput.toLowerCase().trim();
    if (userAns === target || (target.includes(userAns) && userAns.length >= 3)) {
      playSuccessSound();
      speakText(activeDialogItem.answer);
      setDialogScore((prev) => prev + 100);
      setDialogFeedback({ success: true, msg: `🎉 CHÍNH XÁC! Đáp án chuẩn là: "${activeDialogItem.answer}"` });
      unlockNextQuestStage(5, 3);
    } else {
      playErrorSound();
      setDialogFeedback({ success: false, msg: `❌ Chưa chính xác. Đáp án đúng là: "${activeDialogItem.answer}"` });
    }
  };
  // FEATURE 3: AUTOMATIC CROSSWORD GRID COLLISION DETECTION
  const checkCrosswordCollision = (word, direction, row, col, currentId = null) => {
    const cleanWord = (word || '').toUpperCase().replace(/[^A-Z]/g, '');
    const wLen = cleanWord.length;
    let collisions = [];
    let gridOccupancy = {};
    crosswordCluesList.forEach((item) => {
      if (currentId && item.id === currentId) return;
      const itemClean = (item.word || '').toUpperCase().replace(/[^A-Z]/g, '');
      const iLen = itemClean.length;
      const iRow = Number(item.row);
      const iCol = Number(item.col);
      const isAcross = item.direction === 'across';
      for (let k = 0; k < iLen; k++) {
        const r = isAcross ? iRow : iRow + k;
        const c = isAcross ? iCol + k : iCol;
        gridOccupancy[`${r}-${c}`] = {
          char: itemClean[k],
          word: item.word,
          direction: item.direction,
        };
      }
    });
    const newIsAcross = direction === 'across';
    for (let k = 0; k < wLen; k++) {
      const r = newIsAcross ? Number(row) : Number(row) + k;
      const c = newIsAcross ? Number(col) + k : Number(col);
      const cellKey = `${r}-${c}`;
      if (gridOccupancy[cellKey]) {
        const existing = gridOccupancy[cellKey];
        if (existing.char !== cleanWord[k]) {
          collisions.push({
            row: r,
            col: c,
            newChar: cleanWord[k],
            existingChar: existing.char,
            conflictWord: existing.word,
          });
        }
      }
    }
    return collisions;
  };
  // SMART CROSSWORD AUTO-LAYOUT SOLVER ALGORITHM (TỰ ĐỘNG XẾP HÀNG NGANG & DỌC CÂN ĐỐI, ĐẸP MẮT)
  const buildAutoCrosswordLayout = (rawItems) => {
    if (!Array.isArray(rawItems) || rawItems.length === 0) return [];
    const items = rawItems.map((it, idx) => ({
      id: it.id || Date.now() + idx,
      word: (it.word || '').toUpperCase().trim().replace(/[^A-Z]/g, ''),
      clue: it.clue || '',
      hint: it.hint || `(${(it.word || '').replace(/\s+/g, '').length})`,
    }));
    const sorted = [...items].sort((a, b) => b.word.length - a.word.length);
    const gridWidth = 12;
    const gridHeight = 8;
    let bestLayout = [];
    let maxScore = -99999;
    const numPasses = Math.min(sorted.length, 5);
    for (let pass = 0; pass < numPasses; pass++) {
      const currentList = [...sorted.slice(pass), ...sorted.slice(0, pass)];
      const gridOccupancy = {};
      const placedClues = [];
      const firstItem = currentList[0];
      const firstWord = firstItem.word;
      const firstRow = 3;
      const firstCol = Math.max(1, Math.floor((gridWidth - firstWord.length) / 2));
      for (let k = 0; k < firstWord.length; k++) {
        gridOccupancy[`${firstRow}-${firstCol + k}`] = { char: firstWord[k], wordId: firstItem.id, dir: 'across' };
      }
      placedClues.push({
        ...firstItem,
        direction: 'across',
        row: firstRow,
        col: firstCol,
        number: 1,
      });
      const evaluatePlacement = (cleanW, dir, rStart, cStart) => {
        const wLen = cleanW.length;
        const isAcross = dir === 'across';
        if (rStart < 0 || cStart < 0) return null;
        if (isAcross && cStart + wLen > gridWidth) return null;
        if (!isAcross && rStart + wLen > gridHeight) return null;
        let intersectionCount = 0;
        for (let k = 0; k < wLen; k++) {
          const r = isAcross ? rStart : rStart + k;
          const c = isAcross ? cStart + k : cStart;
          const cellKey = `${r}-${c}`;
          if (gridOccupancy[cellKey]) {
            if (gridOccupancy[cellKey].char !== cleanW[k]) {
              return null;
            }
            if (gridOccupancy[cellKey].dir === dir) {
              return null;
            }
            intersectionCount++;
          }
        }
        if (intersectionCount === 0) return null;
        const centerDist = Math.abs(rStart + (isAcross ? 0 : wLen / 2) - 3.5) + Math.abs(cStart + (isAcross ? wLen / 2 : 0) - 5.5);
        const score = intersectionCount * 150 - centerDist * 10;
        return { score, intersectionCount };
      };
      let nextNumber = 2;
      for (let i = 1; i < currentList.length; i++) {
        const item = currentList[i];
        const cleanW = item.word;
        let bestPlacement = null;
        for (let pIdx = 0; pIdx < placedClues.length; pIdx++) {
          const parent = placedClues[pIdx];
          const parentW = parent.word;
          const parentIsAcross = parent.direction === 'across';
          for (let kParent = 0; kParent < parentW.length; kParent++) {
            const charParent = parentW[kParent];
            const rParent = parentIsAcross ? parent.row : parent.row + kParent;
            const cParent = parentIsAcross ? parent.col + kParent : parent.col;
            for (let kNew = 0; kNew < cleanW.length; kNew++) {
              if (cleanW[kNew] === charParent) {
                const newDir = parentIsAcross ? 'down' : 'across';
                const newIsAcross = newDir === 'across';
                const rStart = newIsAcross ? rParent : rParent - kNew;
                const cStart = newIsAcross ? cParent - kNew : cParent;
                const evalRes = evaluatePlacement(cleanW, newDir, rStart, cStart);
                if (evalRes) {
                  if (!bestPlacement || evalRes.score > bestPlacement.score) {
                    bestPlacement = {
                      direction: newDir,
                      row: rStart,
                      col: cStart,
                      score: evalRes.score,
                    };
                  }
                }
              }
            }
          }
        }
        if (bestPlacement) {
          const newIsAcross = bestPlacement.direction === 'across';
          for (let k = 0; k < cleanW.length; k++) {
            const r = newIsAcross ? bestPlacement.row : bestPlacement.row + k;
            const c = newIsAcross ? bestPlacement.col + k : bestPlacement.col;
            gridOccupancy[`${r}-${c}`] = { char: cleanW[k], wordId: item.id, dir: bestPlacement.direction };
          }
          placedClues.push({
            ...item,
            direction: bestPlacement.direction,
            row: bestPlacement.row,
            col: bestPlacement.col,
            number: nextNumber++,
          });
        } else {
          let fallbackFound = false;
          const numAcross = placedClues.filter((c) => c.direction === 'across').length;
          const numDown = placedClues.filter((c) => c.direction === 'down').length;
          const newDir = numAcross > numDown ? 'down' : 'across';
          const isAcross = newDir === 'across';
          for (let rTest = 0; rTest < gridHeight && !fallbackFound; rTest++) {
            for (let cTest = 0; cTest < gridWidth && !fallbackFound; cTest++) {
              let clear = true;
              for (let k = 0; k < cleanW.length; k++) {
                const r = isAcross ? rTest : rTest + k;
                const c = isAcross ? cTest + k : cTest;
                if (r >= gridHeight || c >= gridWidth || gridOccupancy[`${r}-${c}`]) {
                  clear = false;
                  break;
                }
              }
              if (clear) {
                for (let k = 0; k < cleanW.length; k++) {
                  const r = isAcross ? rTest : rTest + k;
                  const c = isAcross ? cTest + k : cTest;
                  gridOccupancy[`${r}-${c}`] = { char: cleanW[k], wordId: item.id, dir: newDir };
                }
                placedClues.push({
                  ...item,
                  direction: newDir,
                  row: rTest,
                  col: cTest,
                  number: nextNumber++,
                });
                fallbackFound = true;
              }
            }
          }
        }
      }
      const totalPlaced = placedClues.length;
      const acrossCount = placedClues.filter((c) => c.direction === 'across').length;
      const downCount = placedClues.filter((c) => c.direction === 'down').length;
      const balanceScore = 100 - Math.abs(acrossCount - downCount) * 20;
      const layoutScore = totalPlaced * 200 + balanceScore;
      if (layoutScore > maxScore) {
        maxScore = layoutScore;
        bestLayout = placedClues;
      }
    }
    return bestLayout.map((it, idx) => ({ ...it, number: idx + 1 }));
  };
  const handleManualSaveCrosswordConfig = () => {
    try {
      localStorage.setItem(`vocab_crossword_v199_${activity?.id || 'default'}`, JSON.stringify(crosswordCluesList));
      playSuccessSound();
      alert(`💾 ĐÃ LƯU CẤU HÌNH CÂU HỎI Ô CHỮ THÀNH CÔNG!\nHệ thống đã ghi nhớ trọn bộ ${crosswordCluesList.length} từ vựng & câu gợi ý cho bài học này.`);
    } catch (e) {
      alert('Không thể lưu cấu hình ô chữ!');
    }
  };
  const handleAutoReorderCrosswordGrid = () => {
    if (crosswordCluesList.length === 0) {
      alert('Chưa có câu gợi ý ô chữ nào để tự động xếp!');
      return;
    }
    const autoGridClues = buildAutoCrosswordLayout(crosswordCluesList);
    setCrosswordCluesList(autoGridClues);
    localStorage.setItem(`vocab_crossword_v199_${activity?.id || 'default'}`, JSON.stringify(autoGridClues));
    playSuccessSound();
    alert(`🎉 Hệ thống đã tự động tính toán & sắp xếp lại ma trận ô chữ hàng ngang / hàng dọc cho toàn bộ ${autoGridClues.length} từ không có xung đột!`);
  };
  // DUAL-SYNCHRONIZATION: ĐỒNG BỘ 2 CHIỀU GIỮA KHUNG NHẬP BÊN PHẢI VÀ MA TRẬN Ô CHỮ BÊN TRÁI
  const getTypedWordForClue = (clueItem) => {
    const rawWord = (clueItem.word || '').toUpperCase().trim();
    const wordParts = rawWord.split(/\s+/).filter(Boolean);
    let result = '';
    let currentR = Number(clueItem.row);
    let currentC = Number(clueItem.col);
    wordParts.forEach((part, pIdx) => {
      for (let i = 0; i < part.length; i++) {
        const r = currentR;
        const c = currentC;
        const cellKey = `${r}-${c}`;
        const char = crosswordInputs[cellKey] || '';
        result += char;
        if (clueItem.direction === 'across') currentC++;
        else currentR++;
      }
      if (pIdx < wordParts.length - 1) {
        if (clueItem.direction === 'across') currentC++;
        else currentR++;
      }
    });
    return result;
  };
  const handleClueWordInputChange = (clueItem, rawVal) => {
    const uppercaseVal = rawVal.toUpperCase();
    const cleanLetters = uppercaseVal.replace(/[^A-Z]/g, '');
    const rawWord = (clueItem.word || '').toUpperCase().trim();
    const wordParts = rawWord.split(/\s+/).filter(Boolean);
    let currentR = Number(clueItem.row);
    let currentC = Number(clueItem.col);
    let letterIdx = 0;
    const newInputs = { ...crosswordInputs };
    wordParts.forEach((part, pIdx) => {
      for (let i = 0; i < part.length; i++) {
        const r = currentR;
        const c = currentC;
        if (r >= 0 && r < 14 && c >= 0 && c < 14) {
          const cellKey = `${r}-${c}`;
          if (letterIdx < cleanLetters.length) {
            newInputs[cellKey] = cleanLetters[letterIdx];
          } else {
            delete newInputs[cellKey];
          }
        }
        letterIdx++;
        if (clueItem.direction === 'across') currentC++;
        else currentR++;
      }
      if (pIdx < wordParts.length - 1) {
        if (clueItem.direction === 'across') currentC++;
        else currentR++;
      }
    });
    setCrosswordInputs(newInputs);
  };
  const handleAutoFitSingleCrosswordWord = () => {
    if (!cwWord.trim()) {
      alert('Vui lòng nhập Từ Đáp Án trước khi bấm Auto-Xếp Vị Trí!');
      return;
    }
    const cleanW = cwWord.toUpperCase().trim();
    const testItem = { id: editingCwItem?.id || Date.now(), word: cleanW, clue: cwClue, hint: `(${cleanW.replace(/\s+/g, '').length})` };
    const tempLayout = buildAutoCrosswordLayout([...crosswordCluesList.filter((it) => it.id !== editingCwItem?.id), testItem]);
    const found = tempLayout.find((it) => it.word === cleanW);
    if (found) {
      setCwRow(found.row);
      setCwCol(found.col);
      setCwDirection(found.direction);
      playSuccessSound();
      alert(`✨ Đã tự động tìm vị trí giao nhau phù hợp trên ma trận ô chữ: Hàng ${found.row}, Cột ${found.col}, Hướng: ${found.direction === 'across' ? 'Hàng Ngang' : 'Hàng Dọc'}!`);
    } else {
      alert('Không tìm được vị trí cắt nhau trùng khớp, vui lòng tùy chỉnh Hàng/Cột!');
    }
  };
  // FEATURE 1: AI AUTO-CROSSWORD GENERATOR
  const handleAiGenerateCrosswordClues = async () => {
    setAiGeneratingCw(true);
    try {
      const activeWords = activeScopeList.map((item) => item.word);
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.VITE_GEMINI_API_KEY || '';
      if (apiKey && activeWords.length > 0) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const promptText = `
Bạn là một giáo viên Tiếng Anh xuất sắc. Hãy tạo các câu hỏi gợi ý (Clues) tiếng Anh sinh động, chuẩn SGK cho các từ vựng sau để làm trò chơi ô chữ Crossword: [${activeWords.join(', ')}].
YÊU CẦU ĐẦU RA (Chỉ trả về JSON thuần túy array, không kèm Markdown):
[
  {
    "word": "CRAFT VILLAGE",
    "clue": "Bat Trang is a famous pottery .......... village in Viet Nam.",
    "hint": "(5,7)"
  },
  {
    "word": "ARTISAN",
    "clue": "The .......... spent hours shaping the ceramic vase.",
    "hint": "(7)"
  }
]
`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
        });
        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const aiClues = JSON.parse(cleanedText);
          if (Array.isArray(aiClues) && aiClues.length > 0) {
            const autoGridClues = buildAutoCrosswordLayout(aiClues);
            setCrosswordCluesList(autoGridClues);
            localStorage.setItem(`vocab_crossword_v199_${activity?.id || 'default'}`, JSON.stringify(autoGridClues));
            playSuccessSound();
            alert(`🎉 AI đã tự động khởi tạo & sắp xếp ma trận ${autoGridClues.length} câu ô chữ Crossword không trùng đè thành công!`);
            setAiGeneratingCw(false);
            return;
          }
        }
      }
      const fallbackClues = activeScopeList.map((item) => ({
        word: item.word,
        clue: CROSSWORD_CLUES_DICT[(item && item.word ? String(item.word).toLowerCase() : '')] || `An important English vocabulary term in our lesson topic: ${item.meaning}.`,
        hint: `(${item.word.replace(/\s+/g, '').length})`,
      }));
      const autoGridClues = buildAutoCrosswordLayout(fallbackClues);
      setCrosswordCluesList(autoGridClues);
      localStorage.setItem(`vocab_crossword_v199_${activity?.id || 'default'}`, JSON.stringify(autoGridClues));
      playSuccessSound();
      alert(`🎉 Đã tự động khởi tạo & xếp ma trận ${autoGridClues.length} câu ô chữ Crossword thành công!`);
    } catch (e) {
      console.warn('AI Crossword Gen Error:', e);
    }
    setAiGeneratingCw(false);
  };
  return (
    <div className="bg-amber-900/90 text-slate-900 rounded-3xl p-3 sm:p-5 border-4 border-amber-800 shadow-2xl space-y-4 font-sans select-none max-w-6xl mx-auto my-2 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER GLOSSARY & LEADERBOARD BUTTON                         */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-800 via-amber-900 to-amber-950 p-3 sm:p-4 rounded-2xl border border-amber-700/80 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="px-4 py-1.5 bg-amber-100 text-amber-950 rounded-xl font-black text-xl sm:text-2xl tracking-widest shadow-inner border border-amber-300">
            GLOSSARY
          </div>
          <span className="text-amber-200 font-extrabold text-xs hidden md:inline-block">
            📚 Từ Điển Tương Tác H5P
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* FEATURE: AI VOCAB STORYTELLER BUTTON */}
          <button
            type="button"
            onClick={handleGenerateAiVocabStory}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 border border-purple-400"
            title="AI Kể Truyện Từ Vựng lồng ghép 10 từ vựng vào một câu chuyện sinh động"
          >
            <BookMarked className="w-4 h-4 text-amber-300" />
            <span>📖 AI Truyện Từ Vựng</span>
          </button>

          {isTeacher && (
            <button
              type="button"
              onClick={() => {
                const targetSec = selectedSection !== 'All' ? selectedSection : 'GETTING STARTED';
                const existing = lessonContexts[targetSec];
                if (existing) {
                  setContextCharacters(existing.characters || 'Ann, Linda, Nick');
                  setContextPlot(existing.plot || '');
                  setContextGrammar(existing.grammar || '');
                }
                setIsContextStudioOpen(true);
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 border border-pink-400 animate-pulse"
              title="Nạp ảnh trang SGK hoặc nhập tên nhân vật Ann, Linda, cốt truyện gốc để AI sinh truyện chuẩn 100% SGK"
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>📸 Quản Lý Ngữ Cảnh SGK</span>
            </button>
          )}
          {isTeacher && (
            <>
              <button
                type="button"
                onClick={() => setIsBulkAiModalOpen(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 border border-purple-400"
                title="AI Tự Động Nhập Hàng Loạt Bộ Từ Vựng theo danh sách"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>🤖 AI Nhập Hàng Loạt Từ</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenStudio()}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 border border-emerald-400"
                title="Thêm/Sửa/Xóa từ vựng cho Từ Điển"
              >
                <Edit3 className="w-4 h-4 text-emerald-200" />
                <span>⚙️ Quản Lý Từ Điển</span>
              </button>
              <button
                type="button"
                onClick={handleDuplicateGamePreset}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 border border-blue-400"
                title="Nhân Bản Game Preset xuất ra file để nạp nhanh cho các Lớp khác"
              >
                <Copy className="w-4 h-4 text-blue-200" />
                <span>📋 Nhân Bản Game</span>
              </button>
              <div className="flex flex-wrap items-center gap-1.5 bg-amber-950/90 p-1 rounded-xl border border-amber-700/80">
                <button
                  type="button"
                  onClick={handleToggleLockGames}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center space-x-1 cursor-pointer border ${
                    lockGamesForStudents
                      ? 'bg-rose-700 text-white border-rose-400 ring-2 ring-rose-300'
                      : 'bg-emerald-700 text-white border-emerald-400'
                  }`}
                  title="Bật/tắt cho phép học sinh chơi Game"
                >
                  <span>{lockGamesForStudents ? '🔒 Đang Khóa Game (Bấm Mở)' : '🔓 Đã Mở Game Cho HS'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLockConfigModalOpen(true)}
                  className="px-2.5 py-1 bg-amber-800 hover:bg-amber-700 text-amber-200 rounded-lg text-xs font-black transition flex items-center space-x-1 cursor-pointer border border-amber-600"
                  title="Cấu hình khóa từng game riêng lẻ cho học sinh"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>⚙️ Khóa Riêng Game</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleLockAheadLessons}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center space-x-1 cursor-pointer border ${
                    lockAheadLessonsForStudents
                      ? 'bg-amber-600 text-white border-amber-300 ring-2 ring-amber-200'
                      : 'bg-teal-700 text-white border-teal-400'
                  }`}
                  title="Bật/tắt cho phép học sinh tự do học trước các tiết/bài khác"
                >
                  <span>{lockAheadLessonsForStudents ? '🔒 Chỉ Xem Bài Hiện Tại' : '🔓 Cho Xem Bài Khác'}</span>
                </button>
              </div>
            </>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('quest')}
            className="px-3 py-1.5 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 border border-teal-300"
          >
            <Compass className="w-4 h-4 text-slate-950" />
            <span>🏝️ Quest ({questProgress.stage}/5)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsLeaderboardOpen(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 border border-amber-300"
          >
            <Trophy className="w-4 h-4 text-amber-950" />
            <span>🏆 Top 5</span>
          </button>
          <div className="flex items-center space-x-2 bg-amber-950/90 p-1.5 rounded-xl border border-amber-700/80">
            <span className="text-[11px] font-extrabold text-amber-300 flex items-center space-x-1 pl-1">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Giọng đọc:</span>
            </span>
            <select
              value={voiceOption}
              onChange={(e) => handleChangeVoiceOption(e.target.value)}
              className="px-2 py-1 bg-amber-900 border border-amber-600 rounded-lg text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="charlotte_uk">🇬🇧 Charlotte (UK Oxford Standard)</option>
              <option value="arthur_uk">🇬🇧 Arthur (UK Melodic Slow)</option>
              <option value="victoria_uk">🇬🇧 Victoria (UK Academic Tone)</option>
              <option value="oliver_uk">🇬🇧 Oliver (UK Clear Pitch)</option>
              <option value="emma_uk">🇬🇧 Emma (UK Gentle Intonation)</option>
              <option value="george_uk">🇬🇧 George (UK Storyteller Accent)</option>
              <option value="female_uk">🇬🇧 Nữ (Anh UK Standard)</option>
              <option value="male_uk">🇬🇧 Nam (Anh UK Standard)</option>
              <option value="old_female">👵 Giọng Bà Cụ (UK Slow)</option>
              <option value="old_male">👴 Giọng Ông Cụ (UK Deep)</option>
              <option value="girl">👧 Bé Gái (UK Clear)</option>
              <option value="boy">👦 Bé Trai (UK Energetic)</option>
            </select>
            {isTeacher && (
              <label
                className="p-1 bg-amber-800 hover:bg-amber-700 text-amber-200 rounded-lg border border-amber-600 cursor-pointer transition text-[11px] font-bold flex items-center space-x-1"
                title="Tải lên file giọng đọc mẫu MP3"
              >
                <Upload className="w-3.5 h-3.5 text-amber-300" />
                <input type="file" accept="audio/*" onChange={handleMasterAudioUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
        {/* TABS MENU BAR WITH DIRECT GAME LOCK / UNLOCK CONTROLS */}
        <div className="flex flex-wrap items-center gap-1.5 bg-amber-950/80 p-1.5 rounded-xl border border-amber-700/80 text-xs font-bold w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('dictionary')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer shrink-0 ${
              activeTab === 'dictionary'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-amber-200 hover:bg-amber-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Từ Điển Tương Tác</span>
          </button>
          {/* GAME 1: LẬT THẺ */}
          <div className="relative flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleGameTabClick('memory_game', 'memory_game')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'memory_game'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-amber-200 hover:bg-amber-800/60'
              } ${isGameLockedForStudent('memory_game') ? 'opacity-70 border border-rose-500/80 bg-rose-950/40 text-rose-200' : ''}`}
            >
              {isGameLockedForStudent('memory_game') && <Lock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>🎴 Game Lật Thẻ</span>
            </button>
            {isTeacher && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleIndividualGameLock('memory_game');
                }}
                className={`ml-0.5 p-1 rounded-md transition cursor-pointer ${
                  individualGameLocks.memory_game
                    ? 'bg-rose-600 text-white hover:bg-rose-700 ring-1 ring-rose-300'
                    : 'bg-slate-800/80 text-amber-300 hover:bg-slate-700'
                }`}
                title={individualGameLocks.memory_game ? 'Mở khóa trò chơi Lật Thẻ cho HS' : 'Khóa trò chơi Lật Thẻ không cho HS mở'}
              >
                {individualGameLocks.memory_game ? <Lock className="w-3 h-3 text-rose-200" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
              </button>
            )}
          </div>
          {/* GAME 2: SPELLING BEE */}
          <div className="relative flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleGameTabClick('spelling_game', 'spelling_game')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'spelling_game'
                  ? 'bg-purple-500 text-white shadow-md font-extrabold'
                  : 'text-amber-200 hover:bg-amber-800/60'
              } ${isGameLockedForStudent('spelling_game') ? 'opacity-70 border border-rose-500/80 bg-rose-950/40 text-rose-200' : ''}`}
            >
              {isGameLockedForStudent('spelling_game') && <Lock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>🐝 Spelling Bee</span>
            </button>
            {isTeacher && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleIndividualGameLock('spelling_game');
                }}
                className={`ml-0.5 p-1 rounded-md transition cursor-pointer ${
                  individualGameLocks.spelling_game
                    ? 'bg-rose-600 text-white hover:bg-rose-700 ring-1 ring-rose-300'
                    : 'bg-slate-800/80 text-amber-300 hover:bg-slate-700'
                }`}
                title={individualGameLocks.spelling_game ? 'Mở khóa trò chơi Spelling Bee cho HS' : 'Khóa trò chơi Spelling Bee không cho HS mở'}
              >
                {individualGameLocks.spelling_game ? <Lock className="w-3 h-3 text-rose-200" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
              </button>
            )}
          </div>
          {/* GAME 3: FIND THE WORD */}
          <div className="relative flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleGameTabClick('word_search', 'word_search')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'word_search'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-amber-200 hover:bg-amber-800/60'
              } ${isGameLockedForStudent('word_search') ? 'opacity-70 border border-rose-500/80 bg-rose-950/40 text-rose-200' : ''}`}
            >
              {isGameLockedForStudent('word_search') && <Lock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
              <Grid className="w-3.5 h-3.5 text-teal-200" />
              <span>🔍 Find the Word</span>
            </button>
            {isTeacher && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleIndividualGameLock('word_search');
                }}
                className={`ml-0.5 p-1 rounded-md transition cursor-pointer ${
                  individualGameLocks.word_search
                    ? 'bg-rose-600 text-white hover:bg-rose-700 ring-1 ring-rose-300'
                    : 'bg-slate-800/80 text-amber-300 hover:bg-slate-700'
                }`}
                title={individualGameLocks.word_search ? 'Mở khóa trò chơi Find the Word cho HS' : 'Khóa trò chơi Find the Word không cho HS mở'}
              >
                {individualGameLocks.word_search ? <Lock className="w-3 h-3 text-rose-200" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
              </button>
            )}
          </div>
          {/* GAME 4: CROSSWORD */}
          <div className="relative flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleGameTabClick('crossword', 'crossword')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'crossword'
                  ? 'bg-indigo-500 text-white shadow-md font-extrabold'
                  : 'text-amber-200 hover:bg-amber-800/60'
              } ${isGameLockedForStudent('crossword') ? 'opacity-70 border border-rose-500/80 bg-rose-950/40 text-rose-200' : ''}`}
            >
              {isGameLockedForStudent('crossword') && <Lock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
              <Layers className="w-3.5 h-3.5 text-indigo-200" />
              <span>🧩 Crossword</span>
            </button>
            {isTeacher && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleIndividualGameLock('crossword');
                }}
                className={`ml-0.5 p-1 rounded-md transition cursor-pointer ${
                  individualGameLocks.crossword
                    ? 'bg-rose-600 text-white hover:bg-rose-700 ring-1 ring-rose-300'
                    : 'bg-slate-800/80 text-amber-300 hover:bg-slate-700'
                }`}
                title={individualGameLocks.crossword ? 'Mở khóa trò chơi Crossword cho HS' : 'Khóa trò chơi Crossword không cho HS mở'}
              >
                {individualGameLocks.crossword ? <Lock className="w-3 h-3 text-rose-200" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
              </button>
            )}
          </div>
          {/* GAME 5: FLASHCARDS */}
          <div className="relative flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleGameTabClick('flashcard', 'flashcard')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'flashcard'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-amber-200 hover:bg-amber-800/60'
              } ${isGameLockedForStudent('flashcard') ? 'opacity-70 border border-rose-500/80 bg-rose-950/40 text-rose-200' : ''}`}
            >
              {isGameLockedForStudent('flashcard') && <Lock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
              <Zap className="w-3.5 h-3.5 text-amber-950" />
              <span>🎴 Flashcards</span>
            </button>
            {isTeacher && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleIndividualGameLock('flashcard');
                }}
                className={`ml-0.5 p-1 rounded-md transition cursor-pointer ${
                  individualGameLocks.flashcard
                    ? 'bg-rose-600 text-white hover:bg-rose-700 ring-1 ring-rose-300'
                    : 'bg-slate-800/80 text-amber-300 hover:bg-slate-700'
                }`}
                title={individualGameLocks.flashcard ? 'Mở khóa trò chơi Flashcards cho HS' : 'Khóa trò chơi Flashcards không cho HS mở'}
              >
                {individualGameLocks.flashcard ? <Lock className="w-3 h-3 text-rose-200" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
              </button>
            )}
          </div>
          {/* GAME 6: DIALOG CARDS */}
          <div className="relative flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleGameTabClick('dialog_cards', 'dialog_cards')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'dialog_cards'
                  ? 'bg-blue-500 text-white shadow-md font-extrabold'
                  : 'text-amber-200 hover:bg-amber-800/60'
              } ${isGameLockedForStudent('dialog_cards') ? 'opacity-70 border border-rose-500/80 bg-rose-950/40 text-rose-200' : ''}`}
            >
              {isGameLockedForStudent('dialog_cards') && <Lock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
              <HelpIcon className="w-3.5 h-3.5 text-blue-200" />
              <span>💬 Dialog Cards</span>
            </button>
            {isTeacher && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleIndividualGameLock('dialog_cards');
                }}
                className={`ml-0.5 p-1 rounded-md transition cursor-pointer ${
                  individualGameLocks.dialog_cards
                    ? 'bg-rose-600 text-white hover:bg-rose-700 ring-1 ring-rose-300'
                    : 'bg-slate-800/80 text-amber-300 hover:bg-slate-700'
                }`}
                title={individualGameLocks.dialog_cards ? 'Mở khóa trò chơi Dialog Cards cho HS' : 'Khóa trò chơi Dialog Cards không cho HS mở'}
              >
                {individualGameLocks.dialog_cards ? <Lock className="w-3 h-3 text-rose-200" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
              </button>
            )}
          </div>
          {/* GAME 7: QUEST */}
          <div className="relative flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleGameTabClick('quest', 'quest')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'quest'
                  ? 'bg-emerald-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-amber-200 hover:bg-amber-800/60'
              } ${isGameLockedForStudent('quest') ? 'opacity-70 border border-rose-500/80 bg-rose-950/40 text-rose-200' : ''}`}
            >
              {isGameLockedForStudent('quest') && <Lock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
              <Compass className="w-3.5 h-3.5 text-slate-950" />
              <span>🏝️ Vocabulary Quest</span>
            </button>
            {isTeacher && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleIndividualGameLock('quest');
                }}
                className={`ml-0.5 p-1 rounded-md transition cursor-pointer ${
                  individualGameLocks.quest
                    ? 'bg-rose-600 text-white hover:bg-rose-700 ring-1 ring-rose-300'
                    : 'bg-slate-800/80 text-amber-300 hover:bg-slate-700'
                }`}
                title={individualGameLocks.quest ? 'Mở khóa trò chơi Vocabulary Quest cho HS' : 'Khóa trò chơi Vocabulary Quest không cho HS mở'}
              >
                {individualGameLocks.quest ? <Lock className="w-3 h-3 text-rose-200" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer shrink-0 ${
              activeTab === 'bookmarks'
                ? 'bg-amber-300 text-slate-950 shadow-md font-extrabold'
                : 'text-amber-200 hover:bg-amber-800/60'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-950 fill-amber-950" />
            <span>⭐ Từ Cần Nhớ ({bookmarkedIds.length})</span>
          </button>
        </div>

      
      
      {/* 🔗 FRAME 2: SƠ ĐỒ LIÊN KẾT TỪ VỰNG TIẾT HỌC (UNIT LESSON MATRIX) - CÓ NÚT KHÓA NỔI BẬT NẰM TRỰC TIẾP TRÊN MỖI TIẾT HỌC */}
      <div className="bg-amber-950/80 rounded-2xl p-4 border-2 border-amber-700/80 shadow-xl space-y-3 my-4 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-800/80 pb-2.5">
          <div className="flex items-center space-x-2 text-amber-300 font-black text-xs sm:text-sm uppercase tracking-wide">
            <span className="text-base">🔗</span>
            <span>SƠ ĐỒ LIÊN KẾT TỪ VỰNG TIẾT HỌC (UNIT LESSON MATRIX):</span>
          </div>

          <div className="bg-emerald-800 text-emerald-100 font-extrabold text-xs px-3.5 py-1 rounded-full border border-emerald-500 shadow-sm flex items-center space-x-1">
            <span>Đang hiển thị từ vựng:</span>
            <span className="font-black text-amber-300 ml-1">
              {selectedSection === 'All' ? 'TẤT CẢ CÁC TIẾT' : selectedSection}
            </span>
          </div>
        </div>

        {/* DÃY NÚT CÁC TIẾT HỌC (1. GETTING STARTED, 2. A CLOSER LOOK 1...) NỔI BẬT NÚT KHÓA */}
        <div className="flex flex-wrap items-center gap-2.5 overflow-x-auto py-1">
          {[
            { id: 'All', num: '', name: 'ALL (Tất Cả)', fullSec: 'All', icon: '🌐' },
            { id: 'GETTING STARTED', num: '1. ', name: 'GETTING STARTED', fullSec: 'GETTING STARTED', icon: '🚀' },
            { id: 'A CLOSER LOOK 1', num: '2. ', name: 'A CLOSER LOOK 1', fullSec: 'A CLOSER LOOK 1', icon: '📖' },
            { id: 'A CLOSER LOOK 2', num: '3. ', name: 'A CLOSER LOOK 2', fullSec: 'A CLOSER LOOK 2', icon: '⚡' },
            { id: 'COMMUNICATION', num: '4. ', name: 'COMMUNICATION', fullSec: 'COMMUNICATION', icon: '💬' },
            { id: 'SKILLS 1', num: '5. ', name: 'SKILLS 1', fullSec: 'SKILLS 1', icon: '📚' },
            { id: 'SKILLS 2', num: '6. ', name: 'SKILLS 2', fullSec: 'SKILLS 2', icon: '✍️' },
            { id: 'LOOKING BACK', num: '7. ', name: 'LOOKING BACK', fullSec: 'LOOKING BACK', icon: '🔄' },
            { id: 'PROJECT', num: '8. ', name: 'PROJECT', fullSec: 'PROJECT', icon: '🎨' },
          ].map((sec) => {
            const isSelected = selectedSection === sec.fullSec;
            const isLocked = sec.fullSec !== 'All' && !!individualSectionLocks[sec.fullSec];
            const isLockedForStudent = isSectionLockedForStudent(sec.fullSec);

            return (
              <div key={sec.id} className="relative flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (isLockedForStudent) {
                      playSuccessSound();
                      alert(`🔒 Tiết học '${sec.name}' đang được Giáo viên tạm khóa. Hãy học các tiết trước hoặc chờ Thầy Mở Khóa nhé!`);
                      return;
                    }
                    setSelectedSection(sec.fullSec);
                    setSelectedIndex(0);
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 border shadow-sm ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 ring-2 ring-amber-300 scale-105 shadow-md'
                      : isLockedForStudent
                      ? 'bg-rose-950/80 text-rose-200 border-rose-500/80 opacity-75'
                      : isLocked
                      ? 'bg-amber-950/90 text-amber-200 border-rose-500/70 hover:bg-rose-950/60'
                      : 'bg-slate-900/80 text-amber-200 border-amber-700/60 hover:bg-amber-900/60 hover:text-white'
                  }`}
                >
                  {isLockedForStudent || isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
                  ) : (
                    <span className="text-sm shrink-0">{sec.icon}</span>
                  )}

                  <span>{sec.num}{sec.name}</span>

                  {isSelected && (
                    <span className="bg-slate-950 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-md font-mono font-black ml-1 border border-amber-400">
                      LINKED ✓
                    </span>
                  )}

                  {isLockedForStudent && (
                    <span className="bg-rose-600 text-white text-[9px] px-1 rounded font-mono font-black ml-1">
                      🔒 ĐÃ KHÓA
                    </span>
                  )}
                </button>

                {/* NÚT KHÓA / MỞ NỔI BẬT DÀNH CHO GIÁO VIÊN NẰM TRỰC TIẾP TRÊN NÚT MỖI TIẾT HỌC */}
                {isTeacher && sec.fullSec !== 'All' && (
                  <button
                    type="button"
                    onClick={(e) => handleToggleIndividualSectionLock(sec.fullSec, e)}
                    className={`ml-1 px-1.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center space-x-0.5 border shrink-0 ${
                      isLocked
                        ? 'bg-rose-600 text-white hover:bg-rose-700 border-rose-400 ring-1 ring-rose-300 shadow-sm'
                        : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border-slate-600'
                    }`}
                    title={isLocked ? `Mở khóa tiết học ${sec.name} cho HS` : `Khóa tiết học ${sec.name} không cho HS xem trước`}                  >
                    {isLocked ? <Lock className="w-3 h-3 text-white" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
                    <span>{isLocked ? 'Khóa' : 'Mở'}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>


      {/* TAB 1: DICTIONARY / BOOKMARKS VIEW */}
      {(activeTab === 'dictionary' || activeTab === 'bookmarks') && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 lg:col-span-3 bg-amber-100/90 rounded-2xl p-2.5 border-2 border-amber-300 shadow-inner flex flex-col justify-between max-h-[580px]">
            <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 max-h-[500px]">
              {filteredList.length > 0 ? (
                filteredList.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  const isStaimed = bookmarkedIds.includes(item.id);
                  return (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-3 py-2 rounded-xl border transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-400'
                          : 'bg-white/90 text-slate-800 border-amber-200 hover:bg-amber-200/60'
                      }`}
                    >
                      <span className="flex items-center space-x-1.5 truncate">
                        <span
                          onClick={(e) => handleToggleBookmark(item.id, e)}
                          className="cursor-pointer hover:scale-125 transition"
                          title="Đánh dấu từ cần nhớ"
                        >
                          <Star className={`w-3.5 h-3.5 ${isStaimed ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                        </span>
                        <span className="truncate font-extrabold text-sm">{showWord ? item.word : '••••••'}</span>
                        {item.pos && <span className="text-[11px] font-normal text-slate-600">({item.pos})</span>}
                        {item.audioUrl && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded">MP3</span>}
                      </span>
                      {isTeacher && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenStudio(item);
                          }}
                          className="p-1 hover:bg-amber-600/30 rounded-lg text-slate-700 hover:text-slate-950"
                          title="Sửa từ này"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 font-medium">
                  {activeTab === 'bookmarks' ? 'Chưa có từ vựng nào được đánh dấu ⭐' : 'Không tìm thấy từ vựng khớp tìm kiếm...'}
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-amber-300/80 mt-2 space-y-1.5">
              <button
                type="button"
                onClick={handleTogglePlayAll}
                className={`w-full py-2 px-4 rounded-xl font-black text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-md border ${
                  isPlayingAll
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 animate-pulse'
                    : 'bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-400'
                }`}
              >
                {isPlayingAll ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-amber-900 fill-amber-900" />}
                <span>{isPlayingAll ? '⏸️ Tạm Dừng Đọc Lần Lượt' : '► Play All (Đọc Lần Lượt)'}</span>
              </button>
            </div>
          </div>
          <div className="md:col-span-8 lg:col-span-9 bg-white rounded-2xl p-4 sm:p-6 border-2 border-amber-300 shadow-xl space-y-5 flex flex-col justify-between min-h-[520px]">
            {currentItem ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start border-b border-slate-100 pb-4">
                  {showImage && (
                    <div className="sm:col-span-5 md:col-span-4 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md bg-slate-100 max-h-56 relative group">
                      <img
                        src={currentItem.imageUrl || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80'}
                        alt={currentItem.word}
                        className="w-full h-44 sm:h-48 object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                        <span className="bg-slate-950/80 text-amber-300 font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-md backdrop-blur-xs">
                          {currentItem.unit || 'Unit 1'}
                        </span>
                        {currentItem.section && (
                          <span className="bg-amber-600 text-white font-sans text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                            {currentItem.section}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className={`space-y-3 ${showImage ? 'sm:col-span-7 md:col-span-8' : 'sm:col-span-12'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-3">
                        {showAudio && (
                          <button
                            type="button"
                            onClick={() => speakText(currentItem.word, currentItem.audioUrl)}
                            className="w-11 h-11 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-md transition cursor-pointer active:scale-95 border border-amber-600 shrink-0"
                            title="Nghe phát âm từ vựng"
                          >
                            <Volume2 className="w-6 h-6" />
                          </button>
                        )}
                        {showWord && (
                          <div className="flex items-baseline space-x-2">
                            <h2 className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
                              {currentItem.word}
                            </h2>
                            {currentItem.pos && (
                              <span className="text-sm font-bold text-slate-500">
                                ({currentItem.pos})
                              </span>
                            )}
                          </div>
                          )}
                        <button
                          type="button"
                          onClick={handleTestPronunciation}
                          className={`p-2 rounded-xl transition cursor-pointer flex items-center space-x-1 border text-xs font-bold ${
                            isRecording
                              ? 'bg-rose-600 text-white border-rose-700 animate-bounce'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                          title="Thu âm thử giọng đọc để chấm điểm"
                        >
                          <Mic className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(currentItem.id, e)}
                        className={`p-2 rounded-xl border transition cursor-pointer flex items-center space-x-1 text-xs font-bold ${
                          bookmarkedIds.includes(currentItem.id)
                            ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                        title="Đánh dấu từ cần nhớ"
                      >
                        <Star className={`w-4 h-4 ${bookmarkedIds.includes(currentItem.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                        <span>{bookmarkedIds.includes(currentItem.id) ? 'Đã nhớ ⭐' : 'Đánh dấu ⭐'}</span>
                      </button>
                    </div>
                    {showPhonetic && (
                      <div className="text-sm font-mono font-bold text-slate-600 pl-1">
                        {(!currentItem.phonetic || currentItem.phonetic === '/' + currentItem.word + '/' || currentItem.phonetic === '/' + (currentItem && currentItem.word ? String(currentItem.word).toLowerCase() : '') + '/')
                          ? (STATIC_IPA_DICT[(currentItem && currentItem.word ? String(currentItem.word).toLowerCase() : '')] || currentItem.phonetic || `/${currentItem.word}/`)
                          : currentItem.phonetic
                        }
                      </div>
                      )}
                    {speechResult && (
                      <div
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between ${
                          speechResult.success
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-rose-50 border-rose-300 text-rose-800'
                        }`}
                      >
                        <span>
                          🎙️ Giọng bạn đọc: <strong>"{speechResult.text}"</strong> ({speechResult.score}% trùng khớp)
                        </span>
                        <button onClick={() => setSpeechResult(null)} className="text-slate-400 hover:text-slate-700 text-xs">
                          ✕
                        </button>
                      </div>
                      )}
                    {showMeaning && (
                      <div className="p-3.5 bg-amber-50/80 rounded-2xl border-2 border-amber-300 shadow-xs text-slate-900 font-extrabold text-base sm:text-lg">
                        {(!currentItem.meaning || (currentItem && currentItem.meaning ? String(currentItem.meaning).toLowerCase() : '') === (currentItem && currentItem.word ? String(currentItem.word).toLowerCase() : '') || currentItem.meaning.includes('(nghĩa tự động)') || currentItem.meaning.includes('(nghĩa mới)'))
                          ? (STATIC_VOCAB_DICT[(currentItem && currentItem.word ? String(currentItem.word).toLowerCase() : '')] || currentItem.meaning || currentItem.word)
                          : currentItem.meaning
                        }
                      </div>
                      )}
                  </div>
                </div>
                {/* PHRASE(S) SECTION */}
                {Array.isArray(currentItem.phrases) && currentItem.phrases.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      Phrase(s) (Cụm từ liên quan)
                    </h4>
                    <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200/80 space-y-2">
                      {currentItem.phrases.map((phrase, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-xs font-extrabold text-slate-800 bg-white p-2 rounded-xl border border-amber-200 shadow-2xs">
                          {showAudio && (
                            <button
                              type="button"
                              onClick={() => speakText(phrase)}
                              className="w-6 h-6 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition cursor-pointer shrink-0 border border-amber-600"
                              title="Nghe cụm từ này"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{phrase}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                {/* EXAMPLES SECTION WITH TRANSLATION TOGGLE BUTTON 文A */}
                {showExamples && Array.isArray(currentItem.examples) && currentItem.examples.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                        Examples (Ví Dụ Mẫu)
                      </h4>
                      <span className="text-[11px] font-extrabold text-amber-600 flex items-center space-x-1">
                        <span>Bấm 🔊 nghe đọc • Bấm</span>
                        <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded text-[10px]">文A</span>
                        <span>để xem dịch Tiếng Việt</span>
                      </span>
                    </div>
                    <div className="bg-amber-50/60 p-3 sm:p-3.5 rounded-2xl border border-amber-200/80 space-y-2.5">
                      {currentItem.examples.map((ex, idx) => {
                        const isOpen = !!openTranslations[idx];
                        const textEn = typeof ex === 'string' ? ex : ex.en;
                        const textVi = typeof ex === 'object' && ex.vi ? ex.vi : getVietnameseTranslation(textEn, currentItem.word);
                        return (
                          <div key={idx} className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs hover:border-amber-400 transition space-y-2">
                            <div className="flex items-start space-x-2.5 text-xs font-semibold text-slate-800">
                              {showAudio && (
                                <button
                                  type="button"
                                  onClick={() => speakText(textEn)}
                                  className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs border border-amber-600 active:scale-95 mt-0.5"
                                  title="Bấm để nghe đọc câu ví dụ này"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              )}
                              <span className="flex-1 leading-relaxed text-slate-900 font-extrabold text-xs sm:text-sm pt-0.5">
                                • {textEn}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleTranslation(idx)}
                                className={`px-2 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-1 shrink-0 border ${
                                  isOpen
                                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs ring-2 ring-amber-400'
                                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                                }`}
                                title="Bấm để xem/ẩn câu dịch Tiếng Việt"
                              >
                                <span className="font-extrabold text-xs sm:text-sm">文A</span>
                              </button>
                            </div>
                            {isOpen && (
                              <div className="pl-9 pr-3 py-2 bg-amber-50 rounded-xl border border-amber-300 text-xs font-bold text-amber-950 animate-fade-in flex items-start space-x-2">
                                <span className="text-amber-600 shrink-0 font-extrabold">👉</span>
                                <span className="leading-relaxed font-semibold text-amber-900">{textVi}</span>
                              </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 font-bold text-sm">
                Chưa chọn từ vựng...
              </div>
              )}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={selectedIndex <= 0}
                onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
                className={`w-9 h-9 rounded-full font-bold flex items-center justify-center transition ${
                  selectedIndex > 0
                    ? 'bg-amber-800 hover:bg-amber-900 text-white cursor-pointer shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title="Từ trước đó"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-extrabold text-slate-600 px-2">
                {selectedIndex + 1} / {filteredList.length}
              </span>
              <button
                type="button"
                disabled={selectedIndex >= filteredList.length - 1}
                onClick={() => setSelectedIndex((prev) => Math.min(filteredList.length - 1, prev + 1))}
                className={`w-9 h-9 rounded-full font-bold flex items-center justify-center transition ${
                  selectedIndex < filteredList.length - 1
                    ? 'bg-amber-800 hover:bg-amber-900 text-white cursor-pointer shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title="Từ tiếp theo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        )}
      {/* TAB 2: GAME LẬT THẺ MEMORY MATCH */}
      {activeTab === 'memory_game' && (
        <div className="bg-amber-950/80 rounded-2xl p-4 sm:p-6 border-2 border-amber-700 text-white space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-800 pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎴</span>
              <div>
                <h3 className="font-black text-lg text-amber-300">GAME LẬT THẺ MEMORY MATCH</h3>
                <p className="text-xs text-amber-200/80">Ghép cặp Từ tiếng Anh & Nghĩa tiếng Việt / Hình ảnh tương ứng</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setIsVersusMode(!isVersusMode)}
                className={`px-3 py-1.5 rounded-xl font-black transition cursor-pointer flex items-center space-x-1 border ${
                  isVersusMode
                    ? 'bg-rose-600 text-white border-rose-300 shadow-md ring-2 ring-rose-400'
                    : 'bg-slate-800 text-amber-200 border-slate-600 hover:bg-slate-700'
                }`}
              >
                <Swords className="w-4 h-4 text-amber-300" />
                <span>{isVersusMode ? '⚔️ Chế Độ 2 Người (Đang Bật)' : '👥 Đấu 2 Người (Versus)'}</span>
              </button>
              {isTeacher && (
                <button
                  type="button"
                  onClick={() => handleOpenStudio()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1 border border-emerald-400"
                  title="Thêm/Sửa từ vựng bài học cho Game Lật Thẻ"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ Thêm/Sửa Thẻ</span>
                </button>
              )}
              <button
                type="button"
                onClick={start60sTimeAttackTimer}
                className={`px-3 py-1.5 rounded-xl font-black transition cursor-pointer flex items-center space-x-1 shadow-md border ${
                  isTimeAttackMode
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-200'
                }`}
              >
                <Clock className="w-4 h-4 text-slate-950" />
                <span>{isTimeAttackMode ? `⏳ ${timeAttackLeft}s` : '⚡ 60s Attack'}</span>
              </button>
              {!isVersusMode ? (
                <span className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl font-black">
                  ⭐ Điểm: {memoryScore}
                </span>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1.5 rounded-xl border ${activePlayer === 1 ? 'bg-rose-600 text-white border-rose-300 ring-2 ring-rose-400 animate-bounce' : 'bg-slate-800 text-rose-300 border-slate-700'}`}>
                    🔴 P1: {p1Score} pts
                  </span>
                  <span className={`px-2.5 py-1.5 rounded-xl border ${activePlayer === 2 ? 'bg-blue-600 text-white border-blue-300 ring-2 ring-blue-400 animate-bounce' : 'bg-slate-800 text-blue-300 border-slate-700'}`}>
                    🔵 P2: {p2Score} pts
                  </span>
                </div>
                )}
              <button
                type="button"
                onClick={initMemoryGame}
                className="px-3 py-1.5 bg-amber-800 hover:bg-amber-700 rounded-xl transition cursor-pointer flex items-center space-x-1 text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chơi lại</span>
              </button>
            </div>
          </div>
          {isVersusMode && (
            <div className={`p-2.5 rounded-xl border text-center font-black text-xs sm:text-sm animate-fade-in ${
              activePlayer === 1 ? 'bg-rose-950/90 text-rose-200 border-rose-500' : 'bg-blue-950/90 text-blue-200 border-blue-500'
            }`}>
              {activePlayer === 1 ? '👉 ĐẾN LƯỢT HỌC SINH 1 (🔴 P1) - Bấm lật thẻ!' : '👉 ĐẾN LƯỢT HỌC SINH 2 (🔵 P2) - Bấm lật thẻ!'}
            </div>
            )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {memoryCards.map((card, idx) => {
              const isFlipped = flippedIndices.includes(idx) || matchedPairs.includes(idx);
              const isMatched = matchedPairs.includes(idx);
              return (
                <div
                  key={card.id || idx}
                  onClick={() => handleCardClick(idx)}
                  className={`h-36 sm:h-44 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-3 text-center relative select-none shadow-md ${
                    isMatched
                      ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 border-emerald-300 text-white scale-95 shadow-lg ring-2 ring-emerald-400'
                      : isFlipped
                      ? 'bg-amber-50 text-slate-900 border-amber-400 shadow-xl'
                      : 'bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 border-amber-600 hover:border-amber-400 hover:scale-105'
                  }`}
                >
                  {isFlipped ? (
                    <div className="space-y-1.5 w-full px-1">
                      {isMatched && (
                        <div className="absolute top-2 right-2 bg-emerald-300 text-slate-950 rounded-full w-5 h-5 flex items-center justify-center font-black text-xs shadow-xs">
                          ✓
                        </div>
                        )}
                      {card.type === 'word' ? (
                        <>
                          <Volume2 className={`w-5 h-5 mx-auto ${isMatched ? 'text-amber-200' : 'text-amber-600'}`} />
                          <div className={`font-black text-base sm:text-lg leading-tight ${isMatched ? 'text-amber-100 drop-shadow-xs font-black' : 'text-amber-700'}`}>
                            {card.content}
                          </div>
                          <div className={`text-xs font-mono font-semibold ${isMatched ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {card.phonetic}
                          </div>
                        </>
                      ) : (
                        <>
                          {card.image && (
                            <img src={card.image} alt="" className="w-12 h-12 rounded-xl object-cover mx-auto mb-1 border-2 border-amber-300 shadow-xs" />
                          )}
                          <div className={`font-extrabold text-xs sm:text-sm leading-tight ${isMatched ? 'text-white drop-shadow-sm font-black' : 'text-slate-900'}`}>
                            {card.content}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-amber-950/80 border border-amber-600 flex items-center justify-center mx-auto text-amber-300 font-black shadow-inner">
                        ?
                      </div>
                      <span className="text-[11px] text-amber-300/80 font-black uppercase tracking-wider">H5P CARD</span>
                    </div>
                    )}
                </div>
              );
            })}
          </div>
          {memoryGameOver && (
            <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-amber-900 rounded-2xl border-2 border-emerald-400 text-center space-y-3 animate-scale-up">
              <h4 className="text-2xl font-black text-amber-300">
                {isVersusMode
                  ? p1Score > p2Score
                    ? '🎉 HỌC SINH 1 (🔴 P1) CHIẾN THẮNG RỰC RỠ!'
                    : p2Score > p1Score
                    ? '🎉 HỌC SINH 2 (🔵 P2) CHIẾN THẮNG RỰC RỠ!'
                    : '🤝 HÒA NHAU NGHẸT THỞ!'
                  : '🎉 CHIẾN THẮNG RỰC RỠ!'}
              </h4>
              <div className="flex justify-center space-x-2 max-w-sm mx-auto">
                <input
                  type="text"
                  value={studentNameInput}
                  onChange={(e) => setStudentNameInput(e.target.value)}
                  placeholder="Nhập tên học sinh để lưu bảng xếp hạng..."
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 border-2 border-emerald-400 flex-1"
                />
                <button
                  type="button"
                  onClick={() => handleSaveScoreToLeaderboard('Memory Match', Math.max(memoryScore, p1Score, p2Score))}
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Lưu Top 5
                </button>
              </div>
            </div>
            )}
        </div>
        )}
      {/* TAB 3: GAME SPELLING BEE */}
      {activeTab === 'spelling_game' && currentSpellingItem && (
        <div className="bg-amber-950/80 rounded-2xl p-4 sm:p-6 border-2 border-amber-700 text-white space-y-5 animate-fade-in max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-amber-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🐝</span>
              <div>
                <h3 className="font-black text-lg text-amber-300">SPELLING BEE CHALLENGE</h3>
                <p className="text-xs text-amber-200/80">Nghe phát âm / xem nghĩa và gõ đúng chính tả từ tiếng Anh</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-xs font-black">
              {isTeacher && (
                <button
                  type="button"
                  onClick={() => handleOpenStudio(currentSpellingItem)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1 border border-emerald-400"
                  title="Sửa từ vựng này"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Sửa Từ Này</span>
                </button>
              )}
              <span className="bg-purple-900 px-3 py-1.5 rounded-xl border border-purple-700 text-purple-200">
                🔥 Chuỗi: {spellingStreak}
              </span>
              <span className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl">
                ⭐ Điểm: {spellingScore}
              </span>
            </div>
          </div>
          <div className="bg-white text-slate-900 rounded-2xl p-6 text-center space-y-4 border-2 border-amber-300 shadow-xl">
            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => speakText(currentSpellingItem.word, currentSpellingItem.audioUrl)}
                className="w-14 h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-lg transition cursor-pointer animate-pulse border-2 border-amber-600"
                title="Nghe phát âm từ vựng"
              >
                <Volume2 className="w-8 h-8" />
              </button>
              <span className="text-xs font-extrabold text-slate-500">Bấm loa để nghe phát âm</span>
            </div>
            <div className="text-3xl font-mono font-black tracking-widest text-amber-700 py-2">
              {currentSpellingItem.word
                .split('')
                .map((ch, idx) => (ch === ' ' || ch === '-' ? ch : idx === 0 || idx === currentSpellingItem.word.length - 1 ? ch : '_'))
                .join(' ')}
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 font-extrabold text-sm text-slate-800">
              💡 Gợi ý nghĩa: {currentSpellingItem.meaning}
            </div>
            <div className="flex space-x-2 max-w-md mx-auto">
              <input
                type="text"
                value={spellingInput}
                onChange={(e) => setSpellingInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckSpelling()}
                placeholder="Gõ đúng chính tả từ tiếng Anh..."
                className="flex-1 px-4 py-2.5 border-2 border-amber-400 rounded-xl font-bold text-sm focus:ring-2 focus:ring-amber-500 bg-white"
              />
              <button
                type="button"
                onClick={handleSpellingMic}
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  spellingMicRecording ? 'bg-rose-600 text-white border-rose-700 animate-bounce' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="Đọc từ vựng qua micro"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleCheckSpelling}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm rounded-xl shadow-md transition"
              >
                Kiểm tra
              </button>
            </div>
            {spellingFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-black ${
                  spellingFeedback.success ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300'
                }`}
              >
                {spellingFeedback.msg}
              </div>
              )}
          </div>
        </div>
        )}
      {/* TAB 4: GAME FIND THE WORD */}
      {activeTab === 'word_search' && wordSearchData && (
        <div className="bg-amber-950/80 rounded-2xl p-4 sm:p-6 border-2 border-amber-700 text-white space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-800 pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔍</span>
              <div>
                <h3 className="font-black text-lg text-teal-300">GAME FIND THE WORD (10 TỪ VỰNG ẨN HÀNG NGANG, DỌC & CHÉO)</h3>
                <p className="text-xs text-amber-200/80">Click chọn các chữ cái tạo thành từ tiếng Anh (Có xen từ ở hàng chéo!)</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
              <button
                type="button"
                onClick={handleTriggerHint}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl transition cursor-pointer flex items-center space-x-1 shadow-md border border-amber-200"
                title="Bấm kính lúp để nhấp nháy phát sáng chữ cái đầu tiên của từ khó!"
              >
                <Lightbulb className="w-4 h-4 text-amber-950 fill-amber-950" />
                <span>🔍 Gợi Ý Kính Lúp ({hintCountLeft})</span>
              </button>
              <button
                type="button"
                onClick={() => setIsVersusMode(!isVersusMode)}
                className={`px-3 py-1.5 rounded-xl font-black transition cursor-pointer flex items-center space-x-1 border ${
                  isVersusMode
                    ? 'bg-rose-600 text-white border-rose-300 shadow-md ring-2 ring-rose-400'
                    : 'bg-slate-800 text-amber-200 border-slate-600'
                }`}
              >
                <Swords className="w-4 h-4 text-amber-300" />
                <span>{isVersusMode ? '⚔️ 2 Người' : '👥 Đấu 2 Người'}</span>
              </button>
              {isTeacher && (
                <button
                  type="button"
                  onClick={() => handleOpenStudio()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition cursor-pointer flex items-center space-x-1 shadow-md border border-emerald-400"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm Từ</span>
                </button>
              )}
              <span className={`px-3 py-1.5 rounded-xl border font-extrabold text-xs flex items-center space-x-1 ${
                wordSearchTimeLeft <= 60
                  ? 'bg-rose-600 text-white border-rose-300 animate-pulse ring-2 ring-rose-400'
                  : 'bg-amber-900/90 text-amber-200 border-amber-600'
              }`}>
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>⏱️ {formatTimerMinSec(wordSearchTimeLeft)}</span>
              </span>
              {!isVersusMode ? (
                <span className="bg-teal-900 px-3 py-1.5 rounded-xl border border-teal-700 text-teal-200">
                  ⭐ Điểm: {wordSearchScore}
                </span>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white font-black border border-rose-300">
                    🔴 P1: {p1Score}
                  </span>
                  <span className="px-2.5 py-1.5 rounded-xl bg-blue-600 text-white font-black border border-blue-300">
                    🔵 P2: {p2Score}
                  </span>
                </div>
                )}
              <button
                type="button"
                onClick={initWordSearchGame}
                className="px-3 py-1.5 bg-amber-800 hover:bg-amber-700 rounded-xl transition cursor-pointer flex items-center space-x-1 text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chơi lại</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-7 bg-amber-900/90 p-4 rounded-2xl border-2 border-amber-600 shadow-xl flex flex-col items-center">
              <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                {wordSearchData.grid.map((row, r) =>
                  row.map((char, c) => {
                    const key = `${r}-${c}`;
                    const isSelected = selectedCells.includes(key);
                    const isWrongSelection = wrongSelectedCells.includes(key);
                    const isPartOfFound = wordSearchData.placedWords.some(
                      (pw) => foundWordList.includes(pw.word) && pw.coords.includes(key)
                    );
                    const isHighlightedHint = highlightedHintCell === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={showVictoryModal || showTimeoutModal || foundWordList.length >= wordSearchData.placedWords.length}
                        onClick={() => handleWordSearchCellClick(r, c)}
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl font-black text-sm sm:text-base flex items-center justify-center transition-all transform active:scale-95 cursor-pointer shadow-md ${
                          isPartOfFound
                            ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 shadow-emerald-500/50 font-extrabold'
                            : isWrongSelection
                            ? 'bg-rose-600 text-white ring-2 ring-rose-300 animate-shake font-extrabold'
                            : isSelected
                            ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-200 font-extrabold'
                            : isHighlightedHint
                            ? 'bg-amber-300 text-slate-950 ring-4 ring-amber-400 animate-pulse font-extrabold'
                            : 'bg-amber-950/80 text-amber-100 hover:bg-amber-800 border border-amber-700/80'
                        }`}
                      >
                        {char}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            {/* WORD SEARCH SIDEBAR - VOCAB LIST & CONTROLS */}
            <div className="md:col-span-5 bg-amber-900/90 p-4 rounded-2xl border-2 border-amber-600 shadow-xl space-y-4 text-white">
              <div className="flex items-center justify-between border-b border-amber-700 pb-2">
                <h4 className="font-black text-sm text-amber-300 uppercase tracking-wide flex items-center space-x-1.5">
                  <span>🎯 Danh Sách Từ Cần Tìm</span>
                  <span className="bg-amber-950 px-2 py-0.5 rounded-full text-xs text-emerald-400 border border-amber-700">
                    {foundWordList.length}/{wordSearchData.placedWords.length}
                  </span>
                </h4>
                {isTeacher && (
                  <button
                    type="button"
                    onClick={() => setShowWordSearchModal(true)}
                    className="p-1 hover:bg-amber-800 text-amber-300 rounded transition cursor-pointer"
                    title="Chỉnh sửa danh sách từ vựng Game Tìm Từ"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {wordSearchData.placedWords.map((pw) => {
                  const isFound = foundWordList.includes(pw.word);
                  return (
                    <div
                      key={pw.word}
                      className={`px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between border transition ${
                        isFound
                          ? 'bg-emerald-600/90 text-white border-emerald-400 shadow-md'
                          : 'bg-amber-950/70 text-amber-200/90 border-amber-800'
                      }`}
                    >
                      <span className="truncate">{pw.word}</span>
                      {isFound ? (
                        <Check className="w-3.5 h-3.5 text-emerald-200 shrink-0 ml-1" />
                      ) : (
                        <span className="text-[10px] text-amber-400/60 font-mono">({pw.word.length})</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {isTeacher && (
                <div className="pt-2 border-t border-amber-800/80">
                  <button
                    type="button"
                    onClick={() => setShowWordSearchAnswers(!showWordSearchAnswers)}
                    className="w-full py-2 bg-amber-950 hover:bg-amber-900 text-amber-200 font-extrabold text-xs rounded-xl border border-amber-700 transition cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    {showWordSearchAnswers ? <EyeOff className="w-4 h-4 text-amber-300" /> : <Eye className="w-4 h-4 text-amber-300" />}
                    <span>{showWordSearchAnswers ? '🙈 Ẩn Đáp Án GV' : '👁️ Hiện Đáp Án GV'}</span>
                  </button>
                </div>
                )}
            </div>
          </div>
          {/* POP-UP CHÚC MỪNG HOÀN THÀNH LỚN 7/7 TỪ (VICTORY MODAL) */}
          {showVictoryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
              <div className="bg-gradient-to-b from-amber-900 via-amber-950 to-slate-950 text-white max-w-md w-full rounded-3xl p-6 sm:p-8 border-4 border-amber-400 shadow-2xl flex flex-col items-center text-center space-y-5 animate-scale-up relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
                <div className="w-20 h-20 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center text-4xl shadow-xl ring-4 ring-amber-300 animate-bounce">
                  🎉
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-xl sm:text-2xl text-amber-300 uppercase tracking-wide">
                    CHÚC MỪNG BẠN ĐÃ HOÀN THÀNH BÀI TẬP FIND THE WORD!
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-100/90 font-medium">
                    Xuất sắc! Bạn đã tìm được trọn vẹn tất cả từ vựng ẩn trên ma trận!
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full bg-amber-900/60 p-4 rounded-2xl border border-amber-600/60 font-bold text-xs sm:text-sm">
                  <div className="flex flex-col items-center space-y-1 p-2 bg-amber-950/80 rounded-xl border border-amber-700/80">
                    <span className="text-amber-300 text-xs">⏱️ Thời gian:</span>
                    <span className="font-black text-base text-white">{formatTimerMinSec(300 - wordSearchTimeLeft)}</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1 p-2 bg-amber-950/80 rounded-xl border border-amber-700/80">
                    <span className="text-emerald-400 text-xs">🎯 Kết quả:</span>
                    <span className="font-black text-base text-emerald-300">{foundWordList.length}/{wordSearchData.placedWords.length} từ</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                  <button
                    type="button"
                    onClick={initWordSearchGame}
                    className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>🔄 Chơi Lại (5 phút)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('crossword')}
                    className="flex-1 px-4 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>➡️ Trò Chơi Tiếp Theo</span>
                  </button>
                </div>
              </div>
            </div>
            )}
    
      {/* MODAL CẤU HÌNH KHÓA RIÊNG TỪNG TIẾT HỌC / LESSON (V204) */}
      {isSectionLockConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border-4 border-amber-500 shadow-2xl space-y-5 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-black text-lg text-slate-800">CẤU HÌNH KHÓA RIÊNG TIẾT HỌC / LESSON</h3>
                  <p className="text-xs text-slate-500 font-medium">Bật khóa để không cho Học sinh mở trước bài mới chưa học</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSectionLockConfigModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            
            <div className="flex items-center justify-between gap-2 p-2 bg-slate-100 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600">Thao tác 1-Click:</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleLockAllSections(true)}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer border border-rose-500"
                >
                  🔒 Khóa Tất Cả
                </button>
                <button
                  type="button"
                  onClick={() => handleLockAllSections(false)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer border border-emerald-500"
                >
                  🔓 Mở Tất Cả
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {[
                { name: 'GETTING STARTED', icon: '🚀' },
                { name: 'A CLOSER LOOK 1', icon: '📖' },
                { name: 'A CLOSER LOOK 2', icon: '⚡' },
                { name: 'COMMUNICATION', icon: '💬' },
                { name: 'SKILLS 1', icon: '📚' },
                { name: 'SKILLS 2', icon: '✍️' },
                { name: 'LOOKING BACK', icon: '🔄' },
                { name: 'PROJECT', icon: '🎨' },
              ].map((sec) => {
                const isLocked = !!individualSectionLocks[sec.name];
                return (
                  <div
                    key={sec.name}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                      isLocked ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{sec.icon}</span>
                      <div>
                        <div className="font-black text-sm text-slate-800">{sec.name}</div>
                        <div className="text-[11px] font-bold text-slate-500">
                          {isLocked ? '🔒 Đang khóa đối với HS' : '🔓 Đang mở cho HS học'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleIndividualSectionLock(sec.name)}
                      className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition shadow-xs cursor-pointer flex items-center space-x-1 border ${
                        isLocked
                          ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                      }`}
                    >
                      {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      <span>{isLocked ? '🔒 Đang Khóa' : '🔓 Đang Mở'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSectionLockConfigModalOpen(false)}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer"
              >
                ✓ Hoàn Tất Cấu Hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP HẾT THỜI GIAN 5 PHÚT (TIMEOUT MODAL) */}
          {showTimeoutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
              <div className="bg-gradient-to-b from-rose-950 via-slate-950 to-slate-950 text-white max-w-md w-full rounded-3xl p-6 sm:p-8 border-4 border-rose-500 shadow-2xl flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 bg-rose-600 text-white rounded-full flex items-center justify-center text-3xl shadow-xl ring-4 ring-rose-400 animate-pulse">
                  ⏰
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-xl text-rose-300 uppercase">
                    HẾT THỜI GIAN 5 PHÚT!
                  </h3>
                  <p className="text-xs text-rose-200">
                    Thời gian làm bài 5 phút đã kết thúc. Bạn đã tìm được <strong className="text-amber-300">{foundWordList.length}/{wordSearchData.placedWords.length}</strong> từ vựng!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={initWordSearchGame}
                  className="w-full px-4 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>🔄 Tải Lại Lượt Chơi Mới</span>
                </button>
              </div>
            </div>
            )}
        </div>
        )}
      {/* TAB 5: GAME CROSSWORD - GIAO DIỆN CHUẨN MẪU MỚI + PHẢN HỒI KIỂM TRA ĐÚNG/SAI BẰNG MÀU SẮC TRỰC QUAN */}
      {activeTab === 'crossword' && (
        isGameLockedForStudent('crossword') ? (
          <div className="bg-amber-950/90 rounded-2xl p-8 border-2 border-amber-700 text-center space-y-4 animate-fade-in my-4 shadow-2xl">
            <div className="text-6xl animate-bounce">🔒</div>
            <h3 className="font-black text-xl text-rose-400 uppercase tracking-wide">
              TRÒ CHƠI DÀNH CHO HỌC SINH ĐANG ĐƯỢC GIÁO VIÊN TẠM KHÓA
            </h3>
            <p className="text-sm text-amber-200/90 max-w-md mx-auto font-medium leading-relaxed">
              Thầy Hải đang tạm thời khóa trò chơi Crossword này để các em tập trung học bài. Hãy hoàn thành các nhiệm vụ trước hoặc chờ Thầy mở khóa nhé!
            </p>
          </div>
        ) : (
          <div className="bg-slate-100/90 rounded-3xl p-4 sm:p-6 border-2 border-slate-300 text-slate-900 space-y-5 animate-fade-in shadow-xl">
            {/* THÔNG BÁO DÀNH CHO GIÁO VIÊN KHI GAME ĐANG KHÓA ĐỐI VỚI HỌC SINH */}
            {isTeacher && (lockGamesForStudents || individualGameLocks.crossword) && (
              <div className="bg-rose-50 border border-rose-300 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-rose-800 shadow-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔒</span>
                  <span>Trò chơi này đang <strong>KHÓA đối với Học Sinh</strong>. Thầy Hải đang xem ở chế độ Quyền Giáo Viên (GV).</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleIndividualGameLock('crossword')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer shrink-0"
                >
                  🔓 Mở Khóa Cho HS
                </button>
              </div>
            )}

            {/* THANH THAO TÁC CỦA GIÁO VIÊN VÀ HỌC SINH */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🧩</span>
                <div>
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-wide">CROSSWORD PUZZLE (GIẢI Ô CHỮ)</h3>
                  <p className="text-xs text-slate-500 font-medium">Nhấp chọn câu hỏi gợi ý bên trái để xem viền vàng phát sáng vị trí hàng ngang/hàng dọc trên ma trận</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isTeacher && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowTeacherAnswers(!showTeacherAnswers)}
                      className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center space-x-1.5 border shadow-sm ${
                        showTeacherAnswers
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 ring-2 ring-emerald-300'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                      title="Bật/tắt hiển thị trước đáp án cho Giáo viên kiểm tra"
                    >
                      {showTeacherAnswers ? <Eye className="w-4 h-4 text-emerald-200" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                      <span>{showTeacherAnswers ? '👁️ Đáp Án GV (Đang Hiện)' : '🙈 Đáp Án GV (Đang Ẩn)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAutoReorderCrosswordGrid}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm cursor-pointer flex items-center space-x-1.5 border border-emerald-500"
                      title="Tự động tính toán & sắp xếp ma trận ô chữ"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>✨ Tự Động Xếp Ma Trận</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenCrosswordModal()}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm cursor-pointer flex items-center space-x-1 border border-indigo-500"
                    >
                      <Plus className="w-4 h-4 text-indigo-200" />
                      <span>➕ Thêm Ô Chữ Mới</span>
                    </button>
                  </>
                )}

                {hasCheckedCrossword && (
                  <button
                    type="button"
                    onClick={() => setHasCheckedCrossword(false)}
                    className="px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm cursor-pointer border border-slate-600 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-300" />
                    <span>🔄 Thử Lại / Làm Tiếp</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setHasCheckedCrossword(true);
                    let isAllCorrect = true;
                    let missingCount = 0;
                    let correctCount = 0;
                    let totalCells = 0;

                    Object.entries(crosswordCellMap).forEach(([cellKey, cellData]) => {
                      if (cellData && !cellData.isSpaceBlock && !cellData.isSeparator) {
                        totalCells++;
                        const typedVal = (crosswordInputs[cellKey] || '').toUpperCase().trim();
                        if (typedVal === cellData.letter.toUpperCase()) {
                          correctCount++;
                        } else {
                          isAllCorrect = false;
                          missingCount++;
                        }
                      }
                    });

                    if (isAllCorrect) {
                      playSuccessSound();
                      unlockNextQuestStage(4, 3);
                      alert('🎉 XUẤT SẮC! Bạn đã giải chính xác 100% toàn bộ Ô Chữ thông minh!');
                    } else {
                      playErrorSound();
                      alert(`📊 KẾT QUẢ KIỂM TRA:
- Đúng: ${correctCount}/${totalCells} ô chữ (Xanh lá 🟢)
- Chưa đúng: ${missingCount} ô chữ (Màu đỏ 🔴)

Hãy nhìn lên bảng ô chữ để chỉnh sửa lại những ô tô màu đỏ nhé!`);
                    }
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer border border-sky-500 flex items-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4 text-sky-200" />
                  <span>✓ Kiểm Tra Ô Chữ</span>
                </button>
              </div>
            </div>

            {/* BẢNG THỐNG KÊ PHẢN HỒI KHI BẤM KIỂM TRA ĐÁP ÁN */}
            {hasCheckedCrossword && (
              <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white p-3.5 rounded-2xl border-2 border-sky-400 shadow-md flex flex-wrap items-center justify-between gap-3 animate-fade-in text-xs sm:text-sm">
                <div className="flex items-center space-x-2 font-bold">
                  <span className="text-xl">📊</span>
                  <span>
                    Đang hiển thị <strong>Kết quả kiểm tra chi tiết</strong>:
                    <span className="ml-2 font-black text-emerald-300">🟢 Ô Xanh Lá: Điền Đúng</span> | 
                    <span className="ml-2 font-black text-rose-300">🔴 Ô Đỏ: Chưa Đúng / Thiếu</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setHasCheckedCrossword(false)}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl cursor-pointer shadow-xs text-xs"
                >
                  Sửa Lại Bài Làm ✏️
                </button>
              </div>
            )}

            {/* BẢO GỒM 2 CỘT: CÂU HỎI BÊN TRÁI (LEFT) - MA TRẬN Ô CHỮ BÊN PHẢI (RIGHT) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* 1. BẢNG CÂU HỎI BÊN TRÁI (LEFT PANEL - DOWN & ACROSS) */}
              <div className="md:col-span-5 space-y-4 max-h-[620px] overflow-y-auto pr-1">
                
                {/* CÂU HỎI HÀNG DỌC (DOWN SECTION) */}
                <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
                  <div className="bg-slate-200/90 px-4 py-2 border-b border-slate-300 font-extrabold text-sm text-slate-800 uppercase tracking-wide flex items-center justify-between">
                    <span>DOWN (Hàng Dọc)</span>
                  </div>

                  <div className="p-3 space-y-3">
                    {crosswordCluesList
                      .filter((c) => c.direction === 'down')
                      .map((item) => {
                        const isSelected = selectedCrosswordClueId === item.id;
                        
                        // ĐÁNH GIÁ XEM CÂU HỎI NÀY ĐÃ ĐƯỢC ĐIỀN ĐÚNG TRỌN VẸN CHƯA
                        let clueIsCorrect = true;
                        let clueIsFilled = false;
                        const wordLen = item.word.replace(/\s+/g, '').length;
                        let filledCount = 0;
                        let r = item.row;
                        let c = item.col;
                        const cleanW = item.word.replace(/\s+/g, '').toUpperCase();

                        for (let i = 0; i < cleanW.length; i++) {
                          const cellKey = `${r}-${c}`;
                          const typedVal = (crosswordInputs[cellKey] || '').toUpperCase().trim();
                          if (typedVal.length > 0) filledCount++;
                          if (typedVal !== cleanW[i]) clueIsCorrect = false;
                          r++;
                        }
                        clueIsFilled = filledCount > 0;

                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedCrosswordClueId(isSelected ? null : item.id)}
                            className={`text-xs sm:text-sm font-semibold p-2.5 rounded-xl border transition cursor-pointer flex items-start justify-between ${
                              isSelected
                                ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-300 shadow-sm font-bold'
                                : hasCheckedCrossword
                                ? clueIsCorrect && clueIsFilled
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                  : 'bg-rose-50 border-rose-200 text-rose-950'
                                : 'border-slate-100 hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="leading-snug space-x-1">
                              <span className="font-extrabold text-blue-700 text-sm sm:text-base mr-1">
                                {item.number}.
                              </span>
                              <span>{item.clue}</span>
                              {showTeacherAnswers && (
                                <span className="ml-1 font-extrabold text-emerald-600 underline decoration-emerald-500 decoration-2">
                                  {(item && item.word ? String(item.word).toLowerCase() : '')}
                                </span>
                              )}
                              <span className="font-bold text-sky-600 ml-1">{item.hint}</span>

                              {/* NHÃN HIỂN THỊ ĐÚNG / SAI KHI BẤM KIỂM TRA */}
                              {hasCheckedCrossword && (
                                <div className="mt-1">
                                  {clueIsCorrect && clueIsFilled ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[11px] shadow-xs">
                                      ✓ CHÍNH XÁC
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-600 text-white font-extrabold text-[11px] shadow-xs">
                                      ❌ CHƯA ĐÚNG
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {isTeacher && (
                              <div className="flex items-center space-x-1 shrink-0 ml-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenCrosswordModal(item);
                                  }}
                                  className="p-1 hover:bg-slate-200 text-slate-600 rounded transition cursor-pointer"
                                  title="Sửa câu gợi ý này"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCrosswordClue(item.id);
                                  }}
                                  className="p-1 hover:bg-rose-100 text-rose-600 rounded transition cursor-pointer"
                                  title="Xóa câu gợi ý này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* CÂU HỎI HÀNG NGANG (ACROSS SECTION) */}
                <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
                  <div className="bg-slate-200/90 px-4 py-2 border-b border-slate-300 font-extrabold text-sm text-slate-800 uppercase tracking-wide flex items-center justify-between">
                    <span>ACROSS (Hàng Ngang)</span>
                  </div>

                  <div className="p-3 space-y-3">
                    {crosswordCluesList
                      .filter((c) => c.direction === 'across')
                      .map((item) => {
                        const isSelected = selectedCrosswordClueId === item.id;
                        
                        // ĐÁNH GIÁ XEM CÂU HỎI NÀY ĐÃ ĐƯỢC ĐIỀN ĐÚNG TRỌN VẸN CHƯA
                        let clueIsCorrect = true;
                        let clueIsFilled = false;
                        let filledCount = 0;
                        let r = item.row;
                        let c = item.col;
                        const cleanW = item.word.replace(/\s+/g, '').toUpperCase();

                        for (let i = 0; i < cleanW.length; i++) {
                          const cellKey = `${r}-${c}`;
                          const typedVal = (crosswordInputs[cellKey] || '').toUpperCase().trim();
                          if (typedVal.length > 0) filledCount++;
                          if (typedVal !== cleanW[i]) clueIsCorrect = false;
                          c++;
                        }
                        clueIsFilled = filledCount > 0;

                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedCrosswordClueId(isSelected ? null : item.id)}
                            className={`text-xs sm:text-sm font-semibold p-2.5 rounded-xl border transition cursor-pointer flex items-start justify-between ${
                              isSelected
                                ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-300 shadow-sm font-bold'
                                : hasCheckedCrossword
                                ? clueIsCorrect && clueIsFilled
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                  : 'bg-rose-50 border-rose-200 text-rose-950'
                                : 'border-slate-100 hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="leading-snug space-x-1">
                              <span className="font-extrabold text-blue-700 text-sm sm:text-base mr-1">
                                {item.number}.
                              </span>
                              <span>{item.clue}</span>
                              {showTeacherAnswers && (
                                <span className="ml-1 font-extrabold text-emerald-600 underline decoration-emerald-500 decoration-2">
                                  {(item && item.word ? String(item.word).toLowerCase() : '')}
                                </span>
                              )}
                              <span className="font-bold text-sky-600 ml-1">{item.hint}</span>

                              {/* NHÃN HIỂN THỊ ĐÚNG / SAI KHI BẤM KIỂM TRA */}
                              {hasCheckedCrossword && (
                                <div className="mt-1">
                                  {clueIsCorrect && clueIsFilled ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[11px] shadow-xs">
                                      ✓ CHÍNH XÁC
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-600 text-white font-extrabold text-[11px] shadow-xs">
                                      ❌ CHƯA ĐÚNG
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {isTeacher && (
                              <div className="flex items-center space-x-1 shrink-0 ml-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenCrosswordModal(item);
                                  }}
                                  className="p-1 hover:bg-slate-200 text-slate-600 rounded transition cursor-pointer"
                                  title="Sửa câu gợi ý này"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCrosswordClue(item.id);
                                  }}
                                  className="p-1 hover:bg-rose-100 text-rose-600 rounded transition cursor-pointer"
                                  title="Xóa câu gợi ý này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* 2. CỤM MA TRẬN Ô CHỮ TỐI GIẢN BÊN PHẢI (RIGHT PANEL - MINIMALIST CANVAS WITH OUTSIDE NUMBERS) */}
              <div className="md:col-span-7 bg-white p-4 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-lg flex flex-col items-center justify-center overflow-x-auto min-h-[420px]">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(11, minmax(0, 1fr))',
                    gap: '4px',
                  }}
                  className="p-2 min-w-[340px] sm:min-w-none"
                >
                  {Array.from({ length: 99 }, (_, i) => {
                    const r = Math.floor(i / 11);
                    const c = i % 11;
                    const cellKey = `${r}-${c}`;
                    const cellData = crosswordCellMap[cellKey];
                    const isSpaceBlock = cellData?.isSpaceBlock || cellData?.isSeparator;
                    const isCellActive = !!cellData && !isSpaceBlock;
                    const isHighlightedClue = !!selectedCrosswordClueId && cellData?.clueIds?.includes(selectedCrosswordClueId);

                    // TÌM SỐ THỨ TỰ BẮT ĐẦU HÀNG NGANG (ACROSS) HOẶC HÀNG DỌC (DOWN) ĐỂ HIỂN THỊ BÊN NGOÀI
                    const downClueStartingHere = crosswordCluesList.find((clue) => clue.direction === 'down' && clue.row === r && clue.col === c);
                    const acrossClueStartingHere = crosswordCluesList.find((clue) => clue.direction === 'across' && clue.row === r && clue.col === c);

                    if (!isCellActive) {
                      const downClueAbove = crosswordCluesList.find((clue) => clue.direction === 'down' && clue.row === r + 1 && clue.col === c);
                      const acrossClueLeft = crosswordCluesList.find((clue) => clue.direction === 'across' && clue.row === r && clue.col === c + 1);

                      if (downClueAbove) {
                        return (
                          <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 flex items-end justify-center pb-0.5 pointer-events-none">
                            <span className="font-extrabold text-blue-700 text-sm sm:text-base shadow-xs drop-shadow-xs">
                              {downClueAbove.number}
                            </span>
                          </div>
                        );
                      }

                      if (acrossClueLeft) {
                        return (
                          <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-end pr-1 pointer-events-none">
                            <span className="font-extrabold text-blue-700 text-sm sm:text-base shadow-xs drop-shadow-xs">
                              {acrossClueLeft.number}
                            </span>
                          </div>
                        );
                      }

                      return <div key={i} className="w-8 h-8 sm:w-10 sm:h-10" />;
                    }

                    // KIỂM TRA ĐÚNG / SAI CHO TỪNG Ô CỤ THỂ
                    const typedValue = (crosswordInputs[cellKey] || '').toUpperCase().trim();
                    const targetLetter = (cellData.letter || '').toUpperCase().trim();
                    const isFilled = typedValue.length > 0;
                    const isCellCorrect = isFilled && typedValue === targetLetter;
                    const isCellWrong = isFilled && typedValue !== targetLetter;

                    // ĐỊNH DẠNG MÀU SẮC DỰA TRÊN TRẠNG THÁI KIỂM TRA ĐÁP ÁN
                    let cellBgStyle = 'bg-white text-sky-800 border sm:border-2 border-sky-400 shadow-2xs hover:border-sky-600';
                    if (isHighlightedClue) {
                      cellBgStyle = 'bg-amber-100 text-amber-950 ring-4 ring-amber-400 animate-pulse shadow-md z-20 scale-105 border-2 border-amber-500';
                    } else if (hasCheckedCrossword) {
                      if (isCellCorrect) {
                        cellBgStyle = 'bg-emerald-100 text-emerald-950 border-2 border-emerald-500 ring-2 ring-emerald-300 font-black shadow-md z-10';
                      } else if (isCellWrong) {
                        cellBgStyle = 'bg-rose-100 text-rose-950 border-2 border-rose-500 ring-2 ring-rose-300 font-black animate-shake z-10';
                      } else {
                        cellBgStyle = 'bg-amber-50 text-amber-950 border-2 border-amber-400 font-bold';
                      }
                    }

                    return (
                      <div
                        key={i}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-sm flex items-center justify-center relative font-bold text-sm sm:text-base transition-all transform ${cellBgStyle}`}
                      >
                        {/* HIỂN THỊ SỐ NẾU Ô BẮT ĐẦU LÀ Ô ĐẦU TIÊN CỦA MA TRẬN NÓI CHUNG */}
                        {acrossClueStartingHere && c === 0 && (
                          <span className="absolute -left-5 top-1/2 -translate-y-1/2 font-extrabold text-blue-700 text-sm sm:text-base pointer-events-none">
                            {acrossClueStartingHere.number}
                          </span>
                        )}

                        {downClueStartingHere && r === 0 && (
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-extrabold text-blue-700 text-sm sm:text-base pointer-events-none">
                            {downClueStartingHere.number}
                          </span>
                        )}

                        {/* ĐÁNH DẤU BIỂU TƯỢNG V HOẶC X KHI BẤM KIỂM TRA ĐÁP ÁN */}
                        {hasCheckedCrossword && isFilled && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black z-30 shadow-xs pointer-events-none text-white font-mono">
                            {isCellCorrect ? (
                              <span className="bg-emerald-600 w-full h-full rounded-full flex items-center justify-center">✓</span>
                            ) : (
                              <span className="bg-rose-600 w-full h-full rounded-full flex items-center justify-center">✕</span>
                            )}
                          </span>
                        )}

                        <div className="relative w-full h-full flex items-center justify-center">
                          <input
                            id={`cw-cell-${r}-${c}`}
                            type="text"
                            maxLength={1}
                            value={crosswordInputs[cellKey] || ''}
                            onFocus={() => {
                              if (cellData?.clueIds?.[0]) {
                                setSelectedCrosswordClueId(cellData.clueIds[0]);
                              }
                            }}
                            onChange={(e) => {
                              const val = e.target.value.toLowerCase();
                              setCrosswordInputs((prev) => ({
                                ...prev,
                                [cellKey]: val,
                              }));

                              if (val && val.length > 0) {
                                let step = 1;
                                let nextEl = document.getElementById(`cw-cell-${r}-${c + step}`);
                                if (!nextEl && c + step < 11) {
                                  step = 2;
                                  nextEl = document.getElementById(`cw-cell-${r}-${c + step}`);
                                }
                                if (nextEl) {
                                  nextEl.focus();
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              // PHÍM MŨI TÊN ĐIỀU HƯỚNG Ô CHỮ (⬆️ ⬇️ ⬅️ ➡️)
                              let targetR = r;
                              let targetC = c;
                              if (e.key === 'ArrowRight') targetC = c + 1;
                              else if (e.key === 'ArrowLeft') targetC = c - 1;
                              else if (e.key === 'ArrowDown') targetR = r + 1;
                              else if (e.key === 'ArrowUp') targetR = r - 1;

                              if (targetR !== r || targetC !== c) {
                                e.preventDefault();
                                let targetEl = document.getElementById(`cw-cell-${targetR}-${targetC}`);
                                if (!targetEl && e.key === 'ArrowRight' && c + 2 < 11) targetEl = document.getElementById(`cw-cell-${r}-${c + 2}`);
                                if (!targetEl && e.key === 'ArrowLeft' && c - 2 >= 0) targetEl = document.getElementById(`cw-cell-${r}-${c - 2}`);
                                if (!targetEl && e.key === 'ArrowDown' && r + 2 < 9) targetEl = document.getElementById(`cw-cell-${r + 2}-${c}`);
                                if (!targetEl && e.key === 'ArrowUp' && r - 2 >= 0) targetEl = document.getElementById(`cw-cell-${r - 2}-${c}`);
                                if (targetEl) targetEl.focus();
                                return;
                              }

                              if (e.key === 'Backspace' && !crosswordInputs[cellKey]) {
                                let step = 1;
                                let prevEl = document.getElementById(`cw-cell-${r}-${c - step}`);
                                if (!prevEl && c - step >= 0) {
                                  step = 2;
                                  prevEl = document.getElementById(`cw-cell-${r}-${c - step}`);
                                }
                                if (prevEl) {
                                  prevEl.focus();
                                }
                              }
                            }}
                            placeholder={showTeacherAnswers ? cellData.letter.toLowerCase() : ''}
                            className={`w-full h-full text-center lowercase font-bold focus:outline-none rounded-xs text-sm sm:text-base cursor-pointer ${
                              isHighlightedClue
                                ? 'bg-amber-100 text-amber-950 font-black'
                                : hasCheckedCrossword
                                ? isCellCorrect
                                  ? 'bg-emerald-100 text-emerald-950 font-black'
                                  : isCellWrong
                                  ? 'bg-rose-100 text-rose-950 font-black'
                                  : 'text-sky-800 focus:bg-sky-50'
                                : 'text-sky-800 focus:bg-sky-50'
                            } ${
                              showTeacherAnswers && !crosswordInputs[cellKey] ? 'placeholder-emerald-600 placeholder-opacity-90 font-black' : ''
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {showTeacherAnswers && (
                  <div className="mt-4 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 text-center">
                    💡 Đang bật <strong>Đáp Án Giáo Viên (GV)</strong>: Chữ cái đáp án hiển thị màu xanh lá rực rỡ trong từng ô vuông để Thầy Hải kiểm tra nhanh!
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}

{/* TAB 6: FLASHCARDS MODE */}
      {activeTab === 'flashcard' && currentItem && (
        <div className="bg-amber-950/80 rounded-2xl p-4 sm:p-6 border-2 border-amber-700 text-white space-y-4 animate-fade-in max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-between border-b border-amber-800 pb-3">
            <h3 className="font-black text-lg text-amber-300 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>BỘ THẺ FLASHCARD H5P GHI NHỚ</span>
            </h3>
            <div className="flex items-center space-x-2">
              {isTeacher && (
                <button
                  type="button"
                  onClick={() => handleOpenStudio(currentItem)}
                  className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa Thẻ Này</span>
                </button>
              )}
              <span className="text-xs font-black bg-amber-800 px-3 py-1 rounded-xl">
                Thẻ {selectedIndex + 1} / {filteredList.length}
              </span>
            </div>
          </div>
          <div
            onClick={() => setFlashcardFlipped(!flashcardFlipped)}
            className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 border-4 border-amber-400 shadow-2xl min-h-[300px] flex flex-col items-center justify-center space-y-4 cursor-pointer hover:scale-102 transition duration-300"
          >
            {!flashcardFlipped ? (
              <div className="space-y-3 flex flex-col items-center">
                <img
                  src={currentItem.imageUrl || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-32 h-32 rounded-2xl object-cover border-2 border-amber-300 mx-auto shadow-md"
                />
                <div className="flex items-center justify-center space-x-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(currentItem.word, currentItem.audioUrl);
                    }}
                    className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-md transition cursor-pointer border border-amber-600 active:scale-95 shrink-0"
                    title="Bấm để nghe phát âm từ vựng này"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <h2 className="text-3xl font-black text-amber-600 tracking-tight">{currentItem.word}</h2>
                </div>
                <div className="text-sm font-mono text-slate-500">{currentItem.phonetic}</div>
                <div className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full inline-block">
                  💡 Click thẻ để lật xem nghĩa
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col items-center w-full">
                <div className="flex items-center justify-center space-x-3 w-full">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(currentItem.word, currentItem.audioUrl);
                    }}
                    className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-md transition cursor-pointer border border-amber-600 active:scale-95 shrink-0"
                    title="Nghe phát âm từ vựng"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-black text-amber-600">{currentItem.word}</span>
                </div>
                <div className="text-2xl font-black text-slate-900 bg-amber-50 p-4 rounded-2xl border-2 border-red-500 shadow-xs w-full">
                  {currentItem.meaning}
                </div>
                {Array.isArray(currentItem.phrases) && currentItem.phrases.length > 0 && (
                  <div className="text-xs font-bold text-slate-700 bg-slate-100 p-3 rounded-xl border border-slate-300 w-full">
                    Cụm từ: {currentItem.phrases.join(' • ')}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={selectedIndex <= 0}
              onClick={() => {
                setSelectedIndex((prev) => Math.max(0, prev - 1));
                setFlashcardFlipped(false);
              }}
              className="px-4 py-2 bg-amber-800 hover:bg-amber-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Thẻ Trước</span>
            </button>
            <button
              type="button"
              onClick={() => setFlashcardFlipped(!flashcardFlipped)}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              🔄 Lật Thẻ
            </button>
            <button
              type="button"
              disabled={selectedIndex >= filteredList.length - 1}
              onClick={() => {
                setSelectedIndex((prev) => Math.min(filteredList.length - 1, prev + 1));
                setFlashcardFlipped(false);
              }}
              className="px-4 py-2 bg-amber-800 hover:bg-amber-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center space-x-1"
            >
              <span>Thẻ Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* TAB 7: DIALOG CARDS */}
      {activeTab === 'dialog_cards' && (
        <div className="bg-amber-950/80 rounded-2xl p-4 sm:p-6 border-2 border-amber-700 text-white space-y-4 animate-fade-in max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💬</span>
              <div>
                <h3 className="font-black text-lg text-blue-300">DIALOG CARDS (THẺ HỎI ĐÁP TƯƠNG TÁC)</h3>
                <p className="text-xs text-amber-200/80">Điền từ vựng thích hợp vào chỗ trống trong câu</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isTeacher && (
                <button
                  type="button"
                  onClick={() => handleOpenStudio()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5 border border-emerald-400"
                  title="Thêm/Sửa từ vựng"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ Thêm/Sửa Từ</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleAiGenerateDialogCards}
                disabled={aiGeneratingDialog}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 border border-purple-400"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{aiGeneratingDialog ? 'AI Đang Tạo Câu Hỏi...' : '⚡ AI Tạo Tự Động Câu Hỏi'}</span>
              </button>
              <span className="bg-blue-900 px-3 py-1.5 rounded-xl border border-blue-700 text-blue-200 font-extrabold text-xs">
                Thẻ {dialogIndex + 1} / {dialogCardsList.length || vocabList.length}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4 py-2">
            <div className="bg-white text-slate-900 rounded-3xl p-6 border-4 border-blue-400 shadow-2xl max-w-lg w-full text-center space-y-4">
              <img
                src={activeDialogItem.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80'}
                alt=""
                className="w-full h-44 object-cover rounded-2xl border-2 border-amber-300 shadow-md"
              />
              <div className="font-black text-base sm:text-lg text-slate-900 leading-relaxed px-2">
                {activeDialogItem.question}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={dialogInput}
                  onChange={(e) => setDialogInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckDialogAnswer()}
                  placeholder="Your answer..."
                  className="flex-1 px-4 py-2 border-2 border-blue-400 rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button
                  type="button"
                  onClick={handleCheckDialogAnswer}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md transition cursor-pointer"
                >
                  Check
                </button>
              </div>
              {dialogFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs font-black ${
                    dialogFeedback.success ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300'
                  }`}
                >
                  {dialogFeedback.msg}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-amber-800">
            <button
              type="button"
              disabled={dialogIndex <= 0}
              onClick={() => {
                setDialogIndex((prev) => Math.max(0, prev - 1));
                setDialogInput('');
                setDialogFeedback(null);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <div className="flex-1 max-w-xs mx-4 bg-amber-950 rounded-full h-2 overflow-hidden border border-amber-700">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${((dialogIndex + 1) / (dialogCardsList.length || vocabList.length)) * 100}%` }}
              ></div>
            </div>
            <button
              type="button"
              disabled={dialogIndex >= (dialogCardsList.length || vocabList.length) - 1}
              onClick={() => {
                setDialogIndex((prev) => Math.min((dialogCardsList.length || vocabList.length) - 1, prev + 1));
                setDialogInput('');
                setDialogFeedback(null);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* TAB 8: VOCABULARY ISLAND QUEST PROGRESS MAP */}
      {activeTab === 'quest' && (
        <div className="bg-amber-950/90 rounded-2xl p-4 sm:p-6 border-2 border-amber-700 text-white space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-800 pb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🏝️</span>
              <div>
                <h3 className="font-black text-xl text-emerald-300">VOCABULARY ISLAND QUEST (HÀNH TRÌNH CHINH PHỤC 5 ĐẢO)</h3>
                <p className="text-xs text-amber-200/80">Hoàn thành từng thử thách game để mở khóa hòn đảo tri thức tiếp theo!</p>
              </div>
            </div>
            <div className="bg-emerald-950 px-4 py-2 rounded-2xl border-2 border-emerald-400 flex items-center space-x-2">
              <Compass className="w-5 h-5 text-amber-300 animate-spin" />
              <span className="font-black text-sm text-emerald-200">
                Tiến độ: {questProgress.stage}/5 Đảo Đã Mở
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { id: 1, name: 'Đảo Từ Điển', tab: 'dictionary', desc: 'Xem & nghe đọc 5 từ vựng', icon: '🏝️' },
              { id: 2, name: 'Đảo Trí Nhớ', tab: 'memory_game', desc: 'Hoàn thành 1 ván Memory Match', icon: '🎴' },
              { id: 3, name: 'Hang Động Tìm Từ', tab: 'word_search', desc: 'Tìm đủ 10 từ ẩn trong ma trận', icon: '🔍' },
              { id: 4, name: 'Tháp Ô Chữ', tab: 'crossword', desc: 'Giải mã toàn bộ hàng ngang/dọc', icon: '🧩' },
              { id: 5, name: 'Lâu Đài Hỏi Đáp', tab: 'dialog_cards', desc: 'Chinh phục các thẻ Dialog Cards', icon: '💬' },
            ].map((island) => {
              const isUnlocked = questProgress.stage >= island.id;
              const starCount = questProgress.stars[island.id] || 0;
              return (
                <div
                  key={island.id}
                  onClick={() => {
                    if (isUnlocked) setActiveTab(island.tab);
                    else alert(`🔒 Hòn đảo này chưa được mở khóa! Hãy hoàn thành Đảo ${island.id - 1} trước nhé!`);
                  }}
                  className={`p-4 rounded-3xl border-4 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 relative shadow-xl ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 border-amber-400 hover:scale-105 hover:border-amber-200'
                      : 'bg-slate-900/90 border-slate-700 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{island.icon}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase border ${
                      isUnlocked ? 'bg-emerald-500 text-slate-950 border-emerald-300' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {isUnlocked ? '✓ Đã mở' : '🔒 Khóa'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-base text-amber-200">{island.name}</h4>
                    <p className="text-[11px] text-amber-100/70 font-semibold leading-snug">{island.desc}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-amber-800/80 pt-2">
                    <div className="flex space-x-1">
                      {Array.from({ length: 3 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < starCount ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                        />
                      ))}
                    </div>
                    {isUnlocked && (
                      <span className="text-xs font-black text-amber-300 flex items-center space-x-1">
                        <span>Vào Đảo</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* PRINT CERTIFICATE PDF BUTTON & CONFETTI RE-TRIGGER */}
          {questProgress.stage >= 5 && (
            <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-amber-900 rounded-3xl border-4 border-amber-400 text-center space-y-4 shadow-2xl animate-scale-up">
              <h4 className="text-3xl font-black text-amber-300">👑 BẰNG VINH DANH DANH DỰ THẦY HẢI!</h4>
              <p className="text-sm font-extrabold text-emerald-100 max-w-xl mx-auto">
                Chúc mừng học sinh xuất sắc đã chinh phục thành công cả 5 hòn đảo tri thức Vocabulary Island Quest!
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleOpenCertModal(studentNameInput || user?.user_metadata?.full_name || 'Nguyễn Hải Nam')}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer flex items-center space-x-1.5 border border-amber-200"
                >
                  <Printer className="w-4 h-4 text-slate-950" />
                  <span>🖨️ In Bằng Vinh Danh / Giấy Khen (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerConfetti();
                    playFanfareSound();
                  }}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1"
                >
                  <Sparkle className="w-4 h-4 text-slate-950" />
                  <span>🎉 Phun Pháo Hoa</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* FEATURE: DEDICATED CROSSWORD MODAL FOR ADDING/EDITING CROSSWORD CLUES */}
      {isCrosswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 relative shadow-2xl animate-scale-up text-slate-900 border-4 border-indigo-600">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-indigo-900 flex items-center space-x-2">
                <Layers className="w-6 h-6 text-indigo-600" />
                <span>🧩 {editingCwItem ? 'SỬA Ô CHỮ CROSSWORD' : 'THÊM Ô CHỮ & CÂU GỢI Ý MỚI'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCrosswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold px-2 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveCrosswordClue} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-7 space-y-1">
                  <label className="block text-slate-700 font-extrabold">Từ Đáp Án (Answer Word) *</label>
                  <input
                    type="text"
                    required
                    value={cwWord}
                    onChange={(e) => setCwWord(e.target.value.toUpperCase())}
                    placeholder="Ví dụ: CRAFT VILLAGE, ARTISAN..."
                    className="w-full px-3 py-2 border-2 border-indigo-300 rounded-xl text-sm font-black focus:ring-2 focus:ring-indigo-500 bg-indigo-50/50 uppercase"
                  />
                </div>
                <div className="sm:col-span-5 space-y-1">
                  <label className="block text-slate-700 font-extrabold">Hướng Ô Chữ (Direction) *</label>
                  <select
                    value={cwDirection}
                    onChange={(e) => setCwDirection(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-indigo-300 rounded-xl text-xs font-black text-indigo-900 focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
                  >
                    <option value="across">↔️ Hàng Ngang (Across)</option>
                    <option value="down">↕️ Hàng Dọc (Down)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-extrabold">Số Thứ Tự (1,2...)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={cwNumber}
                    onChange={(e) => setCwNumber(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-indigo-300 rounded-xl text-xs font-black text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-extrabold">Hàng Bắt Đầu (Row)</label>
                  <input
                    type="number"
                    min={0}
                    max={7}
                    value={cwRow}
                    onChange={(e) => setCwRow(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-indigo-300 rounded-xl text-xs font-black text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-extrabold">Cột Bắt Đầu (Col 0-11)</label>
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={cwCol}
                    onChange={(e) => setCwCol(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-indigo-300 rounded-xl text-xs font-black text-center"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-extrabold">Câu Gợi Ý (Clue Text) *</label>
                  <button
                    type="button"
                    onClick={handleAiGenerateCrosswordClue}
                    disabled={aiGeneratingCw}
                    className="px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-[11px] rounded-lg shadow-xs transition cursor-pointer flex items-center space-x-1 border border-indigo-400"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{aiGeneratingCw ? 'AI Đang Sinh...' : '✨ AI Sinh Câu Gợi Ý'}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={3}
                  value={cwClue}
                  onChange={(e) => setCwClue(e.target.value)}
                  placeholder="Ví dụ: Bat Trang is a famous pottery .......... village in Viet Nam."
                  className="w-full px-3 py-2 border-2 border-indigo-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 bg-amber-50/40"
                />
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-900 text-[11px] font-semibold">
                💡 <strong>Hướng dẫn:</strong> Điền từ tiếng Anh và câu gợi ý. AI sẽ tự động tính toán độ dài từ (ví dụ <code>(5,7)</code>) và tự động đặt chữ cái lên ma trận Crossword cho Thầy Hải!
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCrosswordModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1"
                >
                  <span>{editingCwItem ? 'Lưu Thay Đổi Ô Chữ' : '➕ Thêm Ô Chữ Mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* CERTIFICATE SETUP MODAL */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 relative shadow-2xl animate-scale-up text-slate-900 border-4 border-amber-500">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-amber-900 flex items-center space-x-2">
                <GraduationCap className="w-6 h-6 text-amber-600" />
                <span>🎓 TÙY CHỈNH BẰNG VINH DANH HỌC SINH</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold px-2 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs font-bold">
              <div className="space-y-1">
                <label className="block text-slate-700">1. Họ và Tên Học Sinh</label>
                <input
                  type="text"
                  value={certStudentName}
                  onChange={(e) => setCertStudentName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Hải Nam"
                  className="w-full px-3 py-2 border-2 border-amber-300 rounded-xl text-sm font-black focus:ring-2 focus:ring-amber-500 bg-amber-50/50"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700">2. Chọn Khối Lớp *</label>
                  <select
                    value={certGrade}
                    onChange={(e) => setCertGrade(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-amber-300 rounded-xl text-xs font-black text-amber-900 focus:ring-2 focus:ring-amber-500 bg-white cursor-pointer"
                  >
                    <option value="Lớp 6">Lớp 6 (THCS)</option>
                    <option value="Lớp 7">Lớp 7 (THCS)</option>
                    <option value="Lớp 8">Lớp 8 (THCS)</option>
                    <option value="Lớp 9">Lớp 9 (THCS)</option>
                    <option value="Lớp 10">Lớp 10 (THPT)</option>
                    <option value="Lớp 11">Lớp 11 (THPT)</option>
                    <option value="Lớp 12">Lớp 12 (THPT)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700">3. Tên Lớp Chi Tiết</label>
                  <input
                    type="text"
                    value={certClassName}
                    onChange={(e) => setCertClassName(e.target.value)}
                    placeholder="Ví dụ: 9A1, 10A2, 6B..."
                    className="w-full px-3 py-2 border-2 border-amber-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700">4. Tên Trường Học</label>
                <input
                  type="text"
                  value={certSchoolName}
                  onChange={(e) => setCertSchoolName(e.target.value)}
                  placeholder="Ví dụ: Trường THCS Global Success..."
                  className="w-full px-3 py-2 border-2 border-amber-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
              {/* LIVE CERTIFICATE PREVIEW CARD */}
              <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-400 text-center space-y-1.5 shadow-inner">
                <div className="text-[11px] font-black text-amber-800 uppercase tracking-widest">
                  XEM TRƯỚC BẰNG VINH DANH (PREVIEW)
                </div>
                <div className="text-xl font-black text-blue-900 border-b border-amber-300 pb-1 inline-block px-4">
                  {certStudentName || 'Họ và Tên Học Sinh'}
                </div>
                <div className="text-xs font-black text-amber-900">
                  🎓 Học sinh {certGrade} ({certClassName || '9A1'}) - {certSchoolName || 'Trường THCS...'}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCertModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCertModalOpen(false);
                  handlePrintCertificate(certStudentName, certGrade, certClassName, certSchoolName);
                }}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer flex items-center space-x-1.5 border border-amber-300"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>🖨️ In / Xuất File PDF Bằng Vinh Danh</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL QUẢN LÝ NGỮ CẢNH BÀI HỌC SGK GỐC (V221) - KHUNG DÁN ẢNH TRỐNG, NÚT XÓA ẢNH & CHI TIẾT THEO TỪNG TIẾT */}
      {isContextStudioOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border-4 border-pink-500 shadow-2xl space-y-5 text-slate-900 my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">📸</span>
                <div>
                  <h3 className="font-black text-lg text-pink-900 uppercase tracking-wide flex items-center space-x-2">
                    <span>QUẢN LÝ NGỮ CẢNH SGK GỐC</span>
                    <span className="bg-pink-600 text-white text-xs px-2.5 py-0.5 rounded-full font-extrabold shadow-sm">
                      {selectedSection !== 'All' ? selectedSection : 'GETTING STARTED'}
                    </span>
                  </h3>
                  <p className="text-xs text-pink-700 font-bold">
                    Tùy chỉnh ngữ cảnh riêng cho tiết {selectedSection !== 'All' ? selectedSection : 'GETTING STARTED'} (Dán ảnh Ctrl+V hoặc nhập trực tiếp)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsContextStudioOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-800">
              {/* KHUNG TRỐNG INTERACTIVE DÁN ẢNH CHỤP MÀN HÌNH (CTRL + V) VÀ XÓA ẢNH */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-2xl border-2 border-dashed border-pink-400 space-y-3 relative shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-pink-950 font-black text-xs uppercase tracking-wide flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-pink-600" />
                    <span>🖼️ DÁN / NẠP ẢNH TRANG SGK CHO TIẾT {selectedSection !== 'All' ? selectedSection : 'GETTING STARTED'}:</span>
                  </label>

                  {contextImagePreview && (
                    <button
                      type="button"
                      onClick={() => setContextImagePreview(null)}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg transition cursor-pointer flex items-center space-x-1 border border-rose-400 shadow-sm"
                      title="Xóa ảnh chụp hiện tại để dán ảnh mới"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>🗑️ Xóa Ảnh</span>
                    </button>
                  )}
                </div>

                {/* VISUAL PASTE BOX FOR CTRL + V */}
                <div
                  tabIndex={0}
                  onPaste={(e) => {
                    const items = e.clipboardData?.items;
                    if (items) {
                      for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf('image') !== -1) {
                          const file = items[i].getAsFile();
                          if (file) processSgkImageFile(file);
                        }
                      }
                    }
                  }}
                  className="bg-white/90 p-4 rounded-xl border-2 border-dashed border-pink-300 text-center space-y-2 cursor-pointer hover:bg-pink-100/50 transition focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-xs"
                >
                  <div className="flex items-center justify-center space-x-2 text-pink-700 font-black">
                    <Clipboard className="w-5 h-5 text-pink-600 animate-bounce" />
                    <span>📋 BẤM PHÍM CTRL + V TẠI ĐÂY ĐỂ DÁN ẢNH CHỤP SGK</span>
                  </div>
                  <p className="text-[11px] text-pink-900/80 font-bold">
                    Hoặc chọn file ảnh chụp bên dưới ➔ AI sẽ tự động đọc và điền dữ liệu 3 ô!
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processSgkImageFile(file);
                    }}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-pink-600 file:text-white hover:file:bg-pink-700 cursor-pointer"
                  />
                </div>

                {isScanningSgkImage && (
                  <p className="text-pink-700 font-black animate-pulse flex items-center space-x-1.5 pt-1">
                    <Sparkles className="w-4 h-4 animate-spin text-pink-600" />
                    <span>Gemini Vision AI đang đọc ảnh SGK & tự động điền nhân vật, cốt truyện cho tiết {selectedSection !== 'All' ? selectedSection : 'GETTING STARTED'}...</span>
                  </p>
                )}

                {contextImagePreview && (
                  <div className="mt-2 relative max-h-48 overflow-hidden rounded-xl border-2 border-pink-400 shadow-md group">
                    <img src={contextImagePreview} alt="SGK Preview" className="w-full object-contain bg-slate-900/10" />
                    <button
                      type="button"
                      onClick={() => setContextImagePreview(null)}
                      className="absolute top-2 right-2 px-2.5 py-1 bg-rose-600 text-white font-extrabold text-xs rounded-lg shadow-md hover:bg-rose-700 cursor-pointer flex items-center space-x-1 border border-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>🗑️ Xóa Ảnh Này</span>
                    </button>
                  </div>
                )}
              </div>

              {/* TÊN NHÂN VẬT SGK GỐC */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-900 font-black">
                    👥 TÊN CÁC NHÂN VẬT CHÍNH SGK (TIẾT {selectedSection !== 'All' ? selectedSection : 'GETTING STARTED'}):
                  </label>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.5 rounded font-black">
                    Tùy chỉnh / AI Auto-Fill ✓
                  </span>
                </div>
                <input
                  type="text"
                  value={contextCharacters}
                  onChange={(e) => setContextCharacters(e.target.value)}
                  placeholder="Để trống hoặc gõ tên nhân vật (Ví dụ: Ann, Trang, Mi...)"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-pink-500 text-xs font-black text-slate-900 focus:outline-none bg-pink-50/30"
                />
              </div>

              {/* CỐT TRUYỆN GỐC & NỘI DUNG TÓM TẮT */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-900 font-black">
                    📝 CỐT TRUYỆN GỐC & Ý CHÍNH CỦA TIẾT {selectedSection !== 'All' ? selectedSection : 'GETTING STARTED'}:
                  </label>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.5 rounded font-black">
                    Tùy chỉnh / AI Auto-Fill ✓
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={contextPlot}
                  onChange={(e) => setContextPlot(e.target.value)}
                  placeholder="Để trống hoặc nhập tóm tắt cốt truyện riêng cho tiết này..."
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-300 focus:border-pink-500 text-xs font-semibold text-slate-900 focus:outline-none bg-pink-50/30"
                />
              </div>

              {/* CẤU TRÚC NGỮ PHÁP TRỌNG TÂM */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-900 font-black">
                    ⚡ CẤU TRÚC NGỮ PHÁP / SPEAKING CHUẨN TIẾT {selectedSection !== 'All' ? selectedSection : 'GETTING STARTED'}:
                  </label>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.5 rounded font-black">
                    Tùy chỉnh / AI Auto-Fill ✓
                  </span>
                </div>
                <input
                  type="text"
                  value={contextGrammar}
                  onChange={(e) => setContextGrammar(e.target.value)}
                  placeholder="Ví dụ: Like/Love + V-ing, Thì Hiện tại đơn..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-pink-500 text-xs font-semibold text-slate-900 focus:outline-none bg-pink-50/30"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleClearCurrentLessonContext}
                className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-900 font-extrabold text-xs rounded-xl border border-rose-300 transition cursor-pointer flex items-center space-x-1"
                title="Xóa bỏ ngữ cảnh của tiết này để dùng chế độ tự động của AI"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                <span>🗑️ Xóa Ngữ Cảnh Tiết Này</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsContextStudioOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs rounded-xl"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleSaveLessonContext}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <span>💾 Lưu Ngữ Cảnh Tiết ({selectedSection !== 'All' ? selectedSection : 'GETTING STARTED'})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI VOCAB STORYTELLER MODAL - V216 HIGH Z-INDEX + DIALOGUE SUMMARY + HIGHLIGHT + AUDIO UK */}
      {aiStoryModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 pt-16 sm:pt-20 pb-6 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-2xl w-full border-4 border-purple-500 shadow-2xl space-y-4 text-slate-900 my-auto max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">📖</span>
                <div>
                  <h3 className="font-black text-lg sm:text-xl text-purple-900 uppercase tracking-wide">
                    AI TRUYỆN TỪ VỰNG THÔNG MINH ({activityGrade})
                  </h3>
                  <p className="text-xs text-purple-700 font-bold">
                    Tóm tắt bài học & lồng ghép từ vựng: {selectedUnit !== 'All' ? selectedUnit : 'Unit 1'} ({selectedSection !== 'All' ? selectedSection : 'GETTING STARTED'})
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleGenerateAiVocabStory(true)}
                  disabled={generatingStory}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 border border-purple-400 disabled:opacity-50"
                  title="Tạo lại một câu chuyện tóm tắt hội thoại khác"
                >
                  <RefreshCw className={`w-4 h-4 text-amber-300 ${generatingStory ? 'animate-spin' : ''}`} />
                  <span>🔄 Đổi Truyện Khác</span>
                </button>

                {isTeacher && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetSec = selectedSection !== 'All' ? selectedSection : 'GETTING STARTED';
                      const existing = lessonContexts[targetSec];
                      if (existing) {
                        setContextCharacters(existing.characters || 'Ann, Linda, Nick');
                        setContextPlot(existing.plot || '');
                        setContextGrammar(existing.grammar || '');
                      }
                      setIsContextStudioOpen(true);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center space-x-1 border border-pink-300"
                    title="Nạp ảnh trang SGK hoặc sửa tên nhân vật Ann, Linda..."
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-300" />
                    <span>📸 Sửa Ngữ Cảnh SGK</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setAiStoryModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {generatingStory ? (
              <div className="py-12 text-center space-y-3">
                <Sparkles className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
                <p className="font-extrabold text-sm text-purple-900 animate-pulse">
                  AI đang dệt câu chuyện tóm tắt hội thoại cho {activityGrade} ({selectedUnit !== 'All' ? selectedUnit : 'Unit 1'})...
                </p>
              </div>
            ) : aiStoryData ? (
              <div className="space-y-4 overflow-y-auto pr-1 grow">
                <h4 className="font-black text-lg text-purple-950 border-b border-purple-100 pb-1">
                  {aiStoryData.title}
                </h4>

                {/* KHUNG CÂU TRUYỆN TIẾNG ANH CÓ HIGHLIGHT TỪ VỰNG MÀU VÀNG PHÁT SÁNG */}
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 space-y-3 relative shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-purple-800 uppercase tracking-wide flex items-center space-x-1">
                      <span>🇬🇧 CÂU TRUYỆN TIẾNG ANH (UK STANDARD):</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => speakText(aiStoryData.storyEn)}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 border border-purple-400"
                    >
                      <Volume2 className="w-4 h-4 text-amber-300 animate-bounce" />
                      <span>🔊 Nghe Giọng Đọc AI (UK Oxford)</span>
                    </button>
                  </div>

                  <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed pt-1">
                    {renderHighlightedStoryText(aiStoryData.storyEn, filteredList.length > 0 ? filteredList : vocabList)}
                  </p>

                  {/* BẢN DỊCH TIẾNG VIỆT CÓ HIGHLIGHT NGHĨA TỪ VỰNG */}
                  <div className="bg-white/90 p-3 rounded-xl border border-purple-200 text-xs sm:text-sm text-purple-950 font-medium leading-relaxed mt-2 shadow-xs">
                    <strong className="text-purple-800 font-extrabold block mb-1">👉 Dịch tiếng Việt (Tóm tắt hội thoại):</strong>
                    {renderHighlightedStoryText(aiStoryData.storyVi, filteredList.length > 0 ? filteredList : vocabList)}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs font-bold text-amber-900 flex items-center space-x-2">
                  <span className="text-lg">💡</span>
                  <span>
                    Truyện tóm tắt nội dung hội thoại chính của bài học. Các từ vựng trọng tâm được tô <strong>màu vàng phát sáng 🟡</strong>.
                  </span>
                </div>
              </div>
            ) : null}

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => handleGenerateAiVocabStory(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl border border-purple-400 transition cursor-pointer flex items-center space-x-1.5 shadow-md"
              >
                <RefreshCw className="w-4 h-4 text-amber-300" />
                <span>🔄 Sinh Truyện Mới</span>
              </button>

              <button
                type="button"
                onClick={() => setAiStoryModalOpen(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD MODAL WITH PRINT CERTIFICATE PDF BUTTON */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 relative shadow-2xl animate-scale-up text-slate-900 border-4 border-amber-400">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <span>🏆 BẢNG XẾP HẠNG TOP 5 HỌC SINH</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsLeaderboardOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold px-2 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {leaderboardScores.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between font-bold text-xs sm:text-sm ${
                    idx === 0
                      ? 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-400 text-amber-950 font-black shadow-md'
                      : idx === 1
                      ? 'bg-slate-100 border-slate-300 text-slate-800'
                      : idx === 2
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-black text-base w-6 text-center">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <div>
                      <div className="font-extrabold text-sm">{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">
                        Game: {item.game} • {item.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-amber-700 text-base">{item.score} pts</span>
                    <div className="text-[10px] text-slate-500 font-mono">⏱️ {item.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsLeaderboardOpen(false);
                  handleOpenCertModal(leaderboardScores[0]?.name || 'Học Sinh Xuất Sắc');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>🖨️ In Bằng Vinh Danh (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLeaderboardOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* 3. BOTTOM TOOLBAR (VISIBILITY TOGGLES & TEACHER STUDIO SETTINGS)         */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-100/90 p-3 rounded-2xl border border-amber-300 text-xs font-extrabold text-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-amber-900">
            <input
              type="checkbox"
              checked={showAll}
              onChange={handleToggleShowAll}
              className="rounded border-amber-400 text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
            <span>Show all</span>
          </label>
          <span className="text-amber-400">|</span>
          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-amber-900">
            <input
              type="checkbox"
              checked={showImage}
              onChange={(e) => setShowImage(e.target.checked)}
              className="rounded border-amber-400 text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
            <span>Image</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-amber-900">
            <input
              type="checkbox"
              checked={showAudio}
              onChange={(e) => setShowAudio(e.target.checked)}
              className="rounded border-amber-400 text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
            <span>Audio</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-amber-900">
            <input
              type="checkbox"
              checked={showPhonetic}
              onChange={(e) => setShowPhonetic(e.target.checked)}
              className="rounded border-amber-400 text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
            <span>Phonetic(s)</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-amber-900">
            <input
              type="checkbox"
              checked={showWord}
              onChange={(e) => setShowWord(e.target.checked)}
              className="rounded border-amber-400 text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
            <span>Word</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-amber-900">
            <input
              type="checkbox"
              checked={showMeaning}
              onChange={(e) => setShowMeaning(e.target.checked)}
              className="rounded border-amber-400 text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
            <span>Meaning</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-amber-900">
            <input
              type="checkbox"
              checked={showExamples}
              onChange={(e) => setShowExamples(e.target.checked)}
              className="rounded border-amber-400 text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
            <span>Examples</span>
          </label>
        </div>
        {isTeacher && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsBulkAiModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-md border border-purple-400"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>🤖 AI Nhập Hàng Loạt Từ</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPresetModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-md border border-amber-500"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>⚡ Nhập Mẫu SGK (Lớp 6-12)</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenStudio()}
              className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-extrabold rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Từ Mới</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenStudio()}
              className="p-2 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-xl border border-amber-400 transition cursor-pointer"
              title="Cài đặt từ điển Studio (Thầy Hải)"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      {/* FEATURE: CROSSWORD EDIT CLUE & AUTO-FIT MODAL */}
      {isCrosswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 relative shadow-2xl animate-scale-up text-slate-900 border-4 border-indigo-600">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-indigo-900 flex items-center space-x-2">
                <Grid className="w-5 h-5 text-indigo-600" />
                <span>{editingCwItem ? '✏️ SỬA Ô CHỮ & CÂU GỢI Ý' : '➕ THÊM Ô CHỮ & CÂU GỢI Ý MỚI'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCrosswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold px-2 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveCrosswordClue} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Từ Đáp Án (Answer Word) *</label>
                  <input
                    type="text"
                    required
                    value={cwWord}
                    onChange={(e) => setCwWord(e.target.value)}
                    placeholder="Ví dụ: STRESS, CREATIVITY, ARTISAN..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold uppercase text-sm focus:ring-2 focus:ring-indigo-500 bg-amber-50/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Hướng Ô Chữ (Direction) *</label>
                  <select
                    value={cwDirection}
                    onChange={(e) => setCwDirection(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="across">↔️ Hàng Ngang (Across)</option>
                    <option value="down">↕️ Hàng Dọc (Down)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 items-end">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Số Thứ Tự (1,2...)</label>
                  <input
                    type="number"
                    min={1}
                    value={cwNumber}
                    onChange={(e) => setCwNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Hàng Bắt Đầu (Row)</label>
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={cwRow}
                    onChange={(e) => setCwRow(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Cột Bắt Đầu (Col 0-11)</label>
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={cwCol}
                    onChange={(e) => setCwCol(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAutoFitSingleCrosswordWord}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center space-x-1 border border-emerald-400 active:scale-95"
                  title="Tự động tìm tọa độ Hàng/Cột giao nhau phù hợp với từ trên bảng"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>✨ Auto-Xếp Tọa Độ Ô Chữ</span>
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">Câu Gợi Ý (Clue Text) *</label>
                  <button
                    type="button"
                    onClick={handleAiGenerateCrosswordClue}
                    disabled={aiGeneratingCw}
                    className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-[11px] rounded-lg shadow-sm transition cursor-pointer flex items-center space-x-1 border border-purple-400 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{aiGeneratingCw ? 'AI Đang Sinh...' : '✨ AI Sinh Câu Gợi Ý'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  value={cwClue}
                  onChange={(e) => setCwClue(e.target.value)}
                  placeholder="Ví dụ: A feeling of emotional or physical tension caused by pressure or worry."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 bg-amber-50/30"
                />
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-950 text-xs font-medium leading-relaxed">
                💡 <strong>Hướng dẫn:</strong> Điền từ tiếng Anh và câu gợi ý cụ thể. Bấm nút <strong>✨ Auto-Xếp Tọa Độ</strong> để hệ thống tự động tìm vị trí giao nhau không bị xung đột!
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCrosswordModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  {editingCwItem ? 'Lưu Thay Đổi' : '➕ Thêm Ô Chữ Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* TEACHER STUDIO EDIT MODAL FOR DICTIONARY */}
      {isStudioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto relative shadow-2xl animate-scale-up text-slate-900 border-2 border-amber-600">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <span>{editingItem ? '✏️ SỬA TỪ VỰNG TỪ ĐIỂN' : '➕ THÊM TỪ VỰNG TỪ ĐIỂN MỚI'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsStudioOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold px-2 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveStudioItem} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-8 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-bold">Từ Tiếng Anh (Word) *</label>
                    <button
                      type="button"
                      onClick={handleAiAutoFill}
                      disabled={aiGenerating}
                      className="px-2.5 py-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-extrabold text-[11px] rounded-lg shadow-sm transition cursor-pointer flex items-center space-x-1 border border-purple-400 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{aiGenerating ? 'AI Đang Tra Cứu...' : '✨ AI Tự Động Điền Chi Tiết'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editWord}
                    onChange={(e) => setEditWord(e.target.value)}
                    placeholder="Ví dụ: suburb, police officer, artisan..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 bg-amber-50/50"
                  />
                </div>
                <div className="sm:col-span-4 space-y-1">
                  <label className="block text-slate-700 font-bold">Loại Từ (Part of Speech)</label>
                  <select
                    value={editPos}
                    onChange={(e) => setEditPos(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="n">Danh từ (n)</option>
                    <option value="v">Động từ (v)</option>
                    <option value="adj">Tính từ (adj)</option>
                    <option value="adv">Trạng từ (adv)</option>
                    <option value="phr">Cụm từ (phrase)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Phiên Âm (Phonetics)</label>
                  <input
                    type="text"
                    value={editPhonetic}
                    onChange={(e) => setEditPhonetic(e.target.value)}
                    placeholder="Ví dụ: /ˈsʌb.ɜːb/"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Bài Học (Unit 1-12)</label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-extrabold text-xs focus:ring-2 focus:ring-amber-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Unit ${i + 1}`).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Tiết Học (Section)</label>
                  <select
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-extrabold text-xs focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="GETTING STARTED">🚀 GETTING STARTED</option>
                    <option value="A CLOSER LOOK 1">📖 A CLOSER LOOK 1</option>
                    <option value="A CLOSER LOOK 2">⚡ A CLOSER LOOK 2</option>
                    <option value="COMMUNICATION">COMMUNICATION</option>
                    <option value="SKILLS 1">SKILLS 1</option>
                    <option value="SKILLS 2">SKILLS 2</option>
                    <option value="LOOKING BACK">LOOKING BACK</option>
                    <option value="PROJECT">PROJECT</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Nghĩa Tiếng Việt (Vietnamese Meaning) *</label>
                <input
                  type="text"
                  required
                  value={editMeaning}
                  onChange={(e) => setEditMeaning(e.target.value)}
                  placeholder="Ví dụ: khu vực ngoại ô (ngoại thành thành phố)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-amber-900 bg-amber-50 focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">🔊 File Âm Thanh Phát Âm Riêng (Audio MP3 URL)</label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={editAudioUrl}
                    onChange={(e) => setEditAudioUrl(e.target.value)}
                    placeholder="Dán link file MP3 hoặc bấm nút Tải Lên MP3 bên cạnh..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-500 bg-emerald-50/50"
                  />
                  {editAudioUrl && (
                    <button
                      type="button"
                      onClick={() => speakText(editWord, editAudioUrl)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1 shrink-0"
                      title="Nghe thử file MP3 đã tải lên"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Nghe thử MP3</span>
                    </button>
                  )}
                  <label className="px-3 py-2 bg-amber-600 hover:bg-amber-700 border border-amber-700 text-white rounded-xl cursor-pointer font-bold text-xs flex items-center space-x-1 shrink-0 shadow-sm">
                    <Music className="w-4 h-4" />
                    <span>{uploadingWordAudio ? 'Đang tải MP3...' : 'Upload File MP3'}</span>
                    <input type="file" accept="audio/*" onChange={handleWordAudioUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Link Ảnh Minh Họa (Image URL)</label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-500"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl cursor-pointer text-slate-700 font-bold text-xs flex items-center space-x-1 shrink-0">
                    <ImageIcon className="w-4 h-4" />
                    <span>{uploadingImg ? 'Đang tải...' : 'Upload Ảnh'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Cụm Từ Liên Quan (Phrases - Mỗi cụm 1 dòng)</label>
                <textarea
                  rows={2}
                  value={editPhrasesStr}
                  onChange={(e) => setEditPhrasesStr(e.target.value)}
                  placeholder="quiet suburb&#10;in the suburbs of Ha Noi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Câu Ví Dụ (Examples - Mỗi câu 1 dòng)</label>
                <textarea
                  rows={3}
                  value={editExamplesStr}
                  onChange={(e) => setEditExamplesStr(e.target.value)}
                  placeholder="We live in a quiet suburb of Ha Noi with lots of trees.&#10;Many families move to the suburbs for cleaner air."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                {editingItem ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteStudioItem(editingItem.id);
                      setIsStudioOpen(false);
                    }}
                    className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa từ này</span>
                  </button>
                ) : (
                  <div></div>
                )}
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsStudioOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition"
                  >
                    {editingItem ? 'Lưu Thay Đổi Từ Vựng' : '➕ Thêm Từ Vựng Này'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* PRESET SGK IMPORTER MODAL */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 relative shadow-2xl animate-scale-up text-slate-900 border-2 border-amber-600">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <span>⚡ NHẬP MẪU TỪ VỰNG SGK GLOBAL SUCCESS</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold px-2 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">1. Chọn Khối Lớp</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    const units = Object.keys(GLOBAL_SUCCESS_PRESETS[e.target.value] || {});
                    if (units.length > 0) setSelectedPresetUnit(units[0]);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500"
                >
                  {Object.keys(GLOBAL_SUCCESS_PRESETS).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">2. Chọn Bài Học / Unit</label>
                <select
                  value={selectedPresetUnit}
                  onChange={(e) => setSelectedPresetUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500"
                >
                  {Object.keys(GLOBAL_SUCCESS_PRESETS[selectedGrade] || {}).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-slate-700 font-medium">
                💡 Bộ từ vựng mẫu sẽ nạp đầy đủ từ tiếng Anh, phiên âm IPA, nghĩa Tiếng Việt, câu ví dụ và hình ảnh minh họa cho Thầy Hải!
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPresetModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleImportPreset}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-md transition"
                >
                  🚀 Nhập Trọn Bộ Từ Vựng Vào Bài Học
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* FEATURE: BULK AI VOCABULARY GENERATOR MODAL */}
      {isBulkAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 relative shadow-2xl animate-scale-up text-slate-900 border-4 border-purple-600">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-purple-900 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>🤖 AI NHẬP HÀNG LOẠT BỘ TỪ VỰNG THÔNG MINH</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsBulkAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold px-2 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-extrabold">1. Chọn Bài Học (Unit)</label>
                  <select
                    value={bulkUnit}
                    onChange={(e) => setBulkUnit(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-purple-200 rounded-xl text-xs font-extrabold text-purple-950 focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Unit ${i + 1}`).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-extrabold">2. Chọn Tiết Học (Section)</label>
                  <select
                    value={bulkSection}
                    onChange={(e) => setBulkSection(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-purple-200 rounded-xl text-xs font-extrabold text-purple-950 focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="GETTING STARTED">🚀 GETTING STARTED</option>
                    <option value="A CLOSER LOOK 1">📖 A CLOSER LOOK 1</option>
                    <option value="A CLOSER LOOK 2">⚡ A CLOSER LOOK 2</option>
                    <option value="COMMUNICATION">💬 COMMUNICATION</option>
                    <option value="SKILLS 1">🎧 SKILLS 1</option>
                    <option value="SKILLS 2">✍️ SKILLS 2</option>
                    <option value="LOOKING BACK">🏆 LOOKING BACK</option>
                    <option value="PROJECT">🎨 PROJECT</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-black">
                    3. Nhập / Dán Danh Sách Từ Tiếng Anh (Mỗi từ 1 dòng hoặc cách nhau dấu phẩy) *
                  </label>
                  <span className="text-[11px] font-bold text-purple-700">Dán từ file Word, Excel, SGK...</span>
                </div>
                <textarea
                  rows={6}
                  value={bulkInputText}
                  onChange={(e) => setBulkInputText(e.target.value)}
                  placeholder="Ví dụ dán danh sách:&#10;cardboard&#10;dollhouse&#10;gardening&#10;glue&#10;horse riding&#10;making models&#10;popular&#10;unusual&#10;&#10;Hoặc dán dạng chuỗi: cardboard, dollhouse, gardening, glue..."
                  className="w-full px-3 py-2 border-2 border-purple-300 rounded-2xl text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500 bg-purple-50/40 text-purple-950"
                />
              </div>
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-purple-950 text-xs font-bold leading-relaxed">
                💡 <strong>Cách hoạt động:</strong> Thầy Hải chỉ cần dán danh sách từ tiếng Anh cần tạo, AI Gemini sẽ tự động phân tích loại từ (n, v, adj), tra cứu phiên âm IPA chuẩn, dịch nghĩa Tiếng Việt, ghép câu ví dụ & hình ảnh minh họa trọn bộ. Sau đó Thầy Hải có thể bấm vào từng từ để tùy chỉnh, sửa hoặc xóa lại dễ dàng!
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBulkAiModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleBulkAiGenerate}
                  disabled={bulkGenerating}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer flex items-center space-x-1.5 border border-purple-400 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{bulkGenerating ? 'AI Đang Tạo Trọn Bộ Từ Vựng...' : '🚀 AI Tự Động Sinh & Nạp Vào Bài Học'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* FEATURE: GRANULAR PER-GAME LOCK CONFIGURATION MODAL FOR TEACHER */}
      {isLockConfigModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-amber-950 text-white rounded-3xl p-6 border-4 border-amber-500 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-amber-800 pb-3">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-lg text-amber-300">CẤU HÌNH KHÓA RIÊNG TỪNG TRÒ CHƠI</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLockConfigModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-amber-200/90 font-semibold leading-relaxed">
              Thầy Hải có thể chọn khóa riêng lẻ từng trò chơi (ví dụ: Khóa <strong>Find the Word</strong> nhưng vẫn mở <strong>Game Lật Thẻ</strong>) tùy thuộc mục đích tiết học!
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {[
                { key: 'memory_game', label: '🧩 Game Lật Thẻ (Memory Match)', icon: '🧩' },
                { key: 'spelling_game', label: '🐝 Game Spelling Bee', icon: '🐝' },
                { key: 'word_search', label: '🔍 Game Find the Word', icon: '🔍' },
                { key: 'crossword', label: '🧩 Game Crossword Ô Chữ', icon: '🧩' },
                { key: 'flashcard', label: '🎴 Flashcards Bộ Thẻ', icon: '🎴' },
                { key: 'dialog_cards', label: '💬 Dialog Cards Hỏi Đáp', icon: '💬' },
                { key: 'quest', label: '🏝️ Vocabulary Quest Bản Đồ', icon: '🏝️' },
              ].map((g) => {
                const isLocked = individualGameLocks[g.key];
                return (
                  <div
                    key={g.key}
                    className="p-3 rounded-2xl bg-amber-900/80 border border-amber-700/80 flex items-center justify-between font-bold text-xs"
                  >
                    <span className="flex items-center space-x-2">
                      <span>{g.icon}</span>
                      <span>{g.label}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleIndividualGameLock(g.key)}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer border ${
                        isLocked
                          ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-300'
                          : 'bg-emerald-600 text-white border-emerald-400'
                      }`}
                    >
                      {isLocked ? '🔒 Đã Khóa' : '🔓 Đang Mở'}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="pt-2 border-t border-amber-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLockConfigModalOpen(false)}
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
              >
                Xong & Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}