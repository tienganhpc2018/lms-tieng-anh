// UTIL HELPER TOÀN CỤC CHUẨN XÁC V57 TRÁNH MỌI LỖI REFERENCE ERROR TRONG TOÀN APP
export const isWhiteboardAct = (act) => {
  if (!act) return false;
  return act.type === 'whiteboard' || (act.title && String(act.title).includes('[WHITEBOARD]'));
};

export const isAudioRecordAct = (act) => {
  if (!act) return false;
  return act.type === 'audio_record' || act.type === 'audio' || (act.title && String(act.title).includes('[AUDIO_RECORD]'));
};

export const isInteractiveVideoAct = (act) => {
  if (!act) return false;
  return act.type === 'video' || act.type === 'interactive_video' || (act.title && String(act.title).includes('[INTERACTIVE_VIDEO]'));
};
