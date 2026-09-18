// =============================================================================
// TRANSLATION SERVICE: DỊCH THUẬT ANH - VIỆT CHUẨN SÁCH GIÁO KHOA TIẾNG ANH
// Hỗ trợ dịch đa tầng: Google Translate GTX -> MyMemory API -> Cache thông minh
// =============================================================================

// BỘ ĐỆM CACHE IN-MEMORY & LOCALSTORAGE TRÁNH GỌI TRÙNG LẶP
const memoryCache = new Map();

// DANH SÁCH CÁC CÂU DỊCH GIẢ/MOCK BỊ LỖI CŨ CẦN NHẬN DIỆN VÀ THAY THẾ NGAY
const KNOWN_MOCK_TRANSLATIONS = [
  'làm vườn mang lại nhiều lợi ích cho sức khỏe và sự thư thái tâm hồn',
  'các loài côn trùng nhỏ đóng vai trò quan trọng trong hệ sinh thái',
  'rèn luyện tính kiên nhẫn giúp bạn vượt qua mọi khó khăn',
  'trách nhiệm giúp mỗi người trưởng thành hơn trong cuộc sống',
  'sự trưởng thành thể hiện qua thái độ sống tích cực và ứng xử',
  'sự sáng tạo rất hữu ích trong giao tiếp hàng ngày',
  'làm nhà mô hình là sở thích được nhiều bạn học sinh yêu thích',
  'dùng keo dán để gắn kết các chi tiết của sản phẩm thủ công',
  'cưỡi ngựa là một môn thể thao rất thú vị và rèn luyện thể lực tốt'
];

/**
 * Kiểm tra xem bản dịch hiện tại có phải là bản dịch giả (mock), lỗi lặp từ, hoặc chưa dịch không
 */
export const isBadOrMockTranslation = (viText, enText = '') => {
  if (!viText || typeof viText !== 'string') return true;
  const cleanVi = viText.toLowerCase().replace(/['"“”„«»]/g, '').trim();
  const cleanEn = (enText || '').toLowerCase().replace(/['"“”„«»]/g, '').trim();

  // 1. Kiểm tra nếu bản dịch bị gán câu mock cố định
  if (KNOWN_MOCK_TRANSLATIONS.some(mock => cleanVi.includes(mock))) {
    // Chỉ là mock nếu câu tiếng Anh không thực sự nói về câu triết lý đó
    if (cleanEn && !cleanEn.includes('peace of mind') && !cleanEn.includes('ecosystem') && !cleanEn.includes('overcome difficulty')) {
      return true;
    }
  }

  // 2. Kiểm tra nếu bản dịch chỉ là lặp lại nguyên văn tiếng Anh (ví dụ Dịch: "doing things, making things...")
  const strippedVi = cleanVi.replace(/^dịch:\s*/i, '').trim();
  if (cleanEn && strippedVi === cleanEn) {
    return true;
  }

  // 3. Kiểm tra nếu bản dịch chứa chủ yếu từ tiếng Anh không dịch được
  if (strippedVi.startsWith('doing things, making things') || strippedVi.startsWith('it has something for everyone')) {
    return true;
  }

  // 4. Nếu bản dịch quá ngắn hoặc trống
  if (strippedVi.length < 2) return true;

  return false;
};

/**
 * Làm sạch văn bản tiếng Việt dịch được, loại bỏ các tiền tố dư thừa như Dịch: ""
 */
export const cleanVietnameseText = (rawVi) => {
  if (!rawVi || typeof rawVi !== 'string') return '';
  let cleaned = rawVi.trim();

  // Gỡ bỏ tiền tố Dịch: hoặc Dịch thuật:
  cleaned = cleaned.replace(/^(dịch|bản dịch|nghĩa|vi):\s*/i, '');

  // Gỡ bỏ dấu ngoặc kép bọc ngoài
  cleaned = cleaned.replace(/^["'“”„«»]+|["'“”„«»]+$/g, '').trim();

  // Viết hoa chữ cái đầu câu
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
};

/**
 * Dịch một câu tiếng Anh sang tiếng Việt với độ chính xác cao
 */
export const fetchAccurateTranslation = async (textEn) => {
  if (!textEn || typeof textEn !== 'string' || !textEn.trim()) return '';
  const trimmed = textEn.trim();

  // 1. Kiểm tra cache trong RAM
  if (memoryCache.has(trimmed)) {
    return memoryCache.get(trimmed);
  }

  // 2. Kiểm tra cache trong LocalStorage
  try {
    const localKey = 'lms_trans_' + trimmed.slice(0, 60).replace(/[^a-zA-Z0-9]/g, '_');
    const saved = localStorage.getItem(localKey);
    if (saved) {
      memoryCache.set(trimmed, saved);
      return saved;
    }
  } catch (e) {
    // Ignore localStorage error
  }

  let finalTranslation = '';

  // TẦNG 1: GOOGLE TRANSLATE GTX API (Nhanh, chuẩn ngữ cảnh, hoàn toàn miễn phí)
  try {
    const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=" + encodeURIComponent(trimmed);
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const translated = data?.[0]?.map((item) => item[0]).join('').trim();
      if (translated && translated.toLowerCase() !== trimmed.toLowerCase()) {
        finalTranslation = cleanVietnameseText(translated);
      }
    }
  } catch (err) {
    console.warn('Google Translate API error, attempting fallback:', err);
  }

  // TẦNG 2: MYMEMORY TRANSLATION API (Dự phòng trường hợp Google bị mạng chặn)
  if (!finalTranslation) {
    try {
      const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|vi`;
      const res = await fetch(mmUrl);
      if (res.ok) {
        const data = await res.json();
        const mmTrans = data?.responseData?.translatedText;
        if (mmTrans && mmTrans.toLowerCase() !== trimmed.toLowerCase() && !mmTrans.includes('MYMEMORY WARNING')) {
          finalTranslation = cleanVietnameseText(mmTrans);
        }
      }
    } catch (mmErr) {
      console.warn('MyMemory API error:', mmErr);
    }
  }

  // LƯU KẾT QUẢ VÀO CACHE NẾU THÀNH CÔNG
  if (finalTranslation) {
    memoryCache.set(trimmed, finalTranslation);
    try {
      const localKey = 'lms_trans_' + trimmed.slice(0, 60).replace(/[^a-zA-Z0-9]/g, '_');
      localStorage.setItem(localKey, finalTranslation);
    } catch (e) {
      // Ignore localStorage quote limits
    }
    return finalTranslation;
  }

  return '';
};

/**
 * Dịch đồng loạt danh sách câu của bài đọc / bài thoại
 * @param {Array} lines - Mảng các câu thoại [{ speaker, text, vi, ... }]
 * @param {Function} onProgress - Callback thông báo tiến độ (optional)
 * @returns {Promise<Array>} Mảng các câu đã được cập nhật bản dịch chuẩn
 */
export const translateLinesBatch = async (lines, onProgress = null) => {
  if (!Array.isArray(lines) || lines.length === 0) return [];

  const updatedLines = [];
  const batchSize = 4; // Dịch song song từng cụm 4 câu để đảm bảo tốc độ và không bị nghẽn mạng

  for (let i = 0; i < lines.length; i += batchSize) {
    const chunk = lines.slice(i, i + batchSize);
    const chunkPromises = chunk.map(async (line, cIdx) => {
      const textEn = line.text || '';
      
      // Nếu câu đã có bản dịch và không phải là bản dịch giả/mock thì giữ lại
      if (line.vi && !isBadOrMockTranslation(line.vi, textEn)) {
        return {
          ...line,
          vi: cleanVietnameseText(line.vi)
        };
      }

      // Ngược lại, tiến hành dịch lại chuẩn xác
      const accurateVi = await fetchAccurateTranslation(textEn);
      return {
        ...line,
        vi: accurateVi || cleanVietnameseText(line.vi) || textEn
      };
    });

    const resolvedChunk = await Promise.all(chunkPromises);
    updatedLines.push(...resolvedChunk);

    if (onProgress) {
      onProgress(Math.min(100, Math.round(((i + chunk.length) / lines.length) * 100)));
    }
  }

  return updatedLines;
};
