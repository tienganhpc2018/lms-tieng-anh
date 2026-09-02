import fs from 'fs';
import path from 'path';

const BACKUP_DIR = 'd:/web-app/lms-hoc-lieu/backups/GOLDEN_BACKUP_2026_08_24_12H11';
const TARGET_DIR = 'd:/web-app/lms-hoc-lieu';

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

console.log('🚨 Đang khôi phục toàn bộ App về mốc chuẩn Golden Backup 12:11 ngày 24/8/2026...');
copyRecursiveSync(BACKUP_DIR, TARGET_DIR);
console.log('🎉 Khôi phục hoàn tất 100%! Toàn bộ App đã trở về trạng thái ổn định nhất.');
