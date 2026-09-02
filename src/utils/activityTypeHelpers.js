// UTIL HELPER TOÀN CỤC CHUẨN XÁC V95 LÀM SẠCH 100% TIÊU ĐỀ KHÔNG ĐỂ LẶP LẠI TAG DÀI DÒNG
export const getCleanTitle = (title) => {
  if (!title) return '';
  return String(title)
    .replace(/\[(WORKSHEET|AUDIO_RECORD|DICTATION|WHITEBOARD|INTERACTIVE_VIDEO|VOCABULARY|GLOSSARY|PAGE|IFRAME)\]/gi, '')
    .trim();
};

// CHUYỂN ĐỔI BẤT KỲ LOẠI HOẠT ĐỘNG MỚI NÀO VỀ 1 TRONG 6 LOẠI HỢP LỆ THEO CONSTRAINT BẢNG SUPABASE
export const getValidDbType = (typeStr) => {
  if (!typeStr) return 'assignment';
  const VALID_DB_TYPES = ['quiz', 'assignment', 'whiteboard', 'iframe', 'page', 'video'];
  if (VALID_DB_TYPES.includes(typeStr)) {
    return typeStr;
  }
  if (typeStr === 'interactive_video') return 'video';
  return 'assignment';
};

export const isVocabularyAct = (act) => {
  if (!act) return false;
  return (
    act.type === 'vocabulary' ||
    act.type === 'glossary' ||
    act.settings?.customType === 'vocabulary' ||
    (act.title && String(act.title).includes('[VOCABULARY]')) ||
    Boolean(act.settings && Array.isArray(act.settings.vocabularyList))
  );
};

export const isWhiteboardAct = (act) => {
  if (!act) return false;
  return (
    act.type === 'whiteboard' ||
    act.settings?.customType === 'whiteboard' ||
    (act.title && String(act.title).includes('[WHITEBOARD]')) ||
    Boolean(act.settings && (act.settings.whiteboardData || act.settings.canvasData))
  );
};

export const isAudioRecordAct = (act) => {
  if (!act) return false;
  return (
    act.type === 'audio_record' ||
    act.type === 'audio' ||
    act.settings?.customType === 'audio_record' ||
    (act.title && String(act.title).includes('[AUDIO_RECORD]')) ||
    Boolean(act.settings && (act.settings.taskDescription || act.settings.audio_url))
  );
};

export const isInteractiveVideoAct = (act) => {
  if (!act) return false;
  return (
    act.type === 'video' ||
    act.type === 'interactive_video' ||
    act.settings?.customType === 'interactive_video' ||
    (act.title && String(act.title).includes('[INTERACTIVE_VIDEO]')) ||
    Boolean(act.settings && act.settings.waypoints)
  );
};

export const isDictationAct = (act) => {
  if (!act) return false;
  return (
    act.type === 'dictation' ||
    act.settings?.customType === 'dictation' ||
    (act.title && String(act.title).includes('[DICTATION]')) ||
    Boolean(act.settings && act.settings.samples)
  );
};

export const isWorksheetAct = (act) => {
  if (!act) return false;
  return (
    act.type === 'worksheet' ||
    act.settings?.customType === 'worksheet' ||
    (act.title && String(act.title).includes('[WORKSHEET]')) ||
    Boolean(act.settings && Array.isArray(act.settings.tasks) && act.settings.tasks.length > 0)
  );
};
