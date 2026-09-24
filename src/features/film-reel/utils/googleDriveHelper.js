/**
 * Bộ công cụ nhận diện và chuyển đổi link Google Drive sang link hiển thị ảnh trực tiếp
 * Hỗ trợ các định dạng:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - Mã ID Google Drive trần
 */

export const extractGoogleDriveFileId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Kiểm tra nếu người dùng paste trực tiếp File ID (25-50 ký tự chữ và số)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{25,50})/,
    /\/d\/([a-zA-Z0-9_-]{25,50})/,
    /[\?&]id=([a-zA-Z0-9_-]{25,50})/,
    /\/folders\/([a-zA-Z0-9_-]{25,50})/,
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Danh sách các định dạng URL dự phòng của Google Drive
 * Ưu tiên:
 * 1. drive.google.com/thumbnail?id=...&sz=w1200 (Thumbnail API công khai, ổn định nhất, không bị 403)
 * 2. lh3.googleusercontent.com/d/... (CDN stream của Google)
 * 3. drive.google.com/uc?export=view&id=... (Export view truyền thống)
 */
export const getGoogleDriveFallbackUrls = (url) => {
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) return [url];
  return [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`,
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
  ];
};

/**
 * Chuyển link Google Drive sang URL ảnh trực tiếp hiển thị tức thì
 */
export const formatDirectImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    // drive.google.com/thumbnail?id=...&sz=w1200 là URL nhúng ảnh web tốt nhất của Google, không bị chặn CORS/403
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
  }

  return trimmed;
};

/**
 * Kiểm tra xem một URL có phải là link Google Drive hay không
 */
export const isGoogleDriveUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return (
    url.includes('drive.google.com') ||
    url.includes('docs.google.com') ||
    url.includes('googleusercontent.com')
  );
};
