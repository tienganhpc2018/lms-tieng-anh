/**
 * Utility nén dung lượng ảnh tự động trên Trình duyệt (Browser Canvas API)
 * Tối ưu hóa dung lượng ảnh chụp bài tập và khoảnh khắc phim chống tràn LocalStorage
 */

/**
 * Nén trực tiếp chuỗi Base64 DataURL
 * @param {string} dataUrl - Chuỗi data:image
 * @param {number} maxDim - Kích thước chiều dài nhất tối đa (mặc định 800px)
 * @param {number} quality - Chất lượng nén 0.1 - 1.0 (mặc định 0.65)
 * @param {number} minSizeThreshold - Chỉ nén nếu chuỗi dài hơn ngưỡng này (mặc định 40KB)
 */
export async function compressDataUrl(dataUrl, maxDim = 800, quality = 0.65, minSizeThreshold = 40000) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  // Nếu ảnh đã rất nhẹ (< 40KB) và không cần ép nén sâu thì giữ nguyên
  if (dataUrl.length < minSizeThreshold) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Tính kích thước thu nhỏ theo tỷ lệ
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext('2d');
      // Tạo nền trắng tránh trường hợp ảnh PNG trong suốt bị biến thành nền đen khi convert JPEG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        const compressed = canvas.toDataURL('image/jpeg', quality);
        // Đảm bảo kết quả nén thực sự nhỏ hơn ảnh gốc
        if (compressed.length < dataUrl.length) {
          resolve(compressed);
        } else {
          resolve(dataUrl);
        }
      } catch (err) {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Nén thích ứng đa cấp độ (Multi-stage Adaptive Compression)
 * Dùng khi cần nén sâu để giải phóng bộ nhớ lưu trữ
 */
export async function compressDataUrlMultiStage(dataUrl, stage = 1) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  if (stage === 1) {
    // Cấp 1 (Chuẩn web): Rõ nét, kích thước cân bằng (~40-60KB/ảnh)
    return compressDataUrl(dataUrl, 800, 0.65, 30000);
  } else if (stage === 2) {
    // Cấp 2 (Nén sâu): Khi bộ nhớ gần đầy (~20-30KB/ảnh)
    return compressDataUrl(dataUrl, 600, 0.50, 10000);
  } else {
    // Cấp 3 (Nén khẩn cấp): Đảm bảo 100% không bao giờ tràn quota (~10-15KB/ảnh)
    return compressDataUrl(dataUrl, 450, 0.40, 2000);
  }
}

/**
 * Nén ảnh từ File/Blob sang JPEG chuẩn web
 */
export async function compressImage(file, maxWidth = 900, maxHeight = 900, quality = 0.65) {
  if (!file || !(file instanceof Blob) || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const maxDim = Math.max(maxWidth, maxHeight);
      compressDataUrl(event.target.result, maxDim, quality, 10000)
        .then(resolve)
        .catch(() => resolve(event.target.result));
    };
    reader.onerror = (err) => reject(err);
  });
}
