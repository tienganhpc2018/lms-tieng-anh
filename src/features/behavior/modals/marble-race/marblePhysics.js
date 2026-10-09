// BỘ NGUYÊN LÝ VẬT LÝ VÀ CẤU TRÚC ĐƯỜNG ĐUA CHUẨN CÁC THANH DỐC TRƯỢT ZICZAC (ẢNH 5)

export const MARBLE_COLORS = [
  { main: '#EF4444', light: '#FCA5A5', dark: '#991B1B', text: '#FFFFFF', name: 'Đỏ' },
  { main: '#3B82F6', light: '#93C5FD', dark: '#1E40AF', text: '#FFFFFF', name: 'Xanh Lam' },
  { main: '#10B981', light: '#6EE7B7', dark: '#065F46', text: '#FFFFFF', name: 'Xanh Lá' },
  { main: '#F59E0B', light: '#FDE68A', dark: '#92400E', text: '#FFFFFF', name: 'Vàng Cam' },
  { main: '#8B5CF6', light: '#C4B5FD', dark: '#5B21B6', text: '#FFFFFF', name: 'Tím' },
  { main: '#EC4899', light: '#FBCFE8', dark: '#9D174D', text: '#FFFFFF', name: 'Hồng' },
  { main: '#06B6D4', light: '#A5F3FC', dark: '#155E75', text: '#FFFFFF', name: 'Xanh Ngọc' },
  { main: '#F97316', light: '#FFEDD5', dark: '#9A3412', text: '#FFFFFF', name: 'Cam' },
  { main: '#14B8A6', light: '#99F6E4', dark: '#115E59', text: '#FFFFFF', name: 'Xanh Băng' },
  { main: '#6366F1', light: '#C7D2FE', dark: '#3730A3', text: '#FFFFFF', name: 'Chàm' },
  { main: '#D946EF', light: '#F5D0FE', dark: '#86198F', text: '#FFFFFF', name: 'Tím Sen' },
  { main: '#84CC16', light: '#D9F99D', dark: '#3F6212', text: '#FFFFFF', name: 'Xanh Cốm' },
];

export function getStudentInitials(fullName = '') {
  if (!fullName) return 'HS';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  const first = parts[0][0] || '';
  const last = parts[parts.length - 1][0] || '';
  return (first + last).toUpperCase();
}

export function formatRaceTime(totalMs = 0) {
  const totalSec = Math.max(0, totalMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = Math.floor(totalSec % 60);
  const tenths = Math.floor((totalSec % 1) * 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${tenths}`;
}

// CẤU TRÚC ĐƯỜNG ĐUA CHUẨN CÁC THANH DỐC NGHIÊNG ĐAN XEN TRÁI - PHẢI (CHUẨN ẢNH 5)
export function generateFullStageTrack(width = 800) {
  const trackHeight = 3100;
  const startY = 140;
  const gateY = startY + 40;
  const finishY = 2900;
  const margin = Math.min(width * 0.08, 45);

  const walls = [];
  const bumpers = [];
  const pegs = [];
  const stages = [];

  // Tường biên đứng hai bên trái & phải
  walls.push({ x1: margin, y1: startY - 100, x2: margin, y2: finishY, type: 'vertical' });
  walls.push({ x1: width - margin, y1: startY - 100, x2: width - margin, y2: finishY, type: 'vertical' });

  // --- CỔNG XUẤT PHÁT VÀ PHỄU ĐỔ BAN ĐẦU ---
  stages.push({ y: startY + 20, title: 'Vạch Xuất Phát & Phễu gom bi' });

  const funnelTopY = gateY + 30;
  walls.push({ x1: margin, y1: funnelTopY, x2: width * 0.35, y2: funnelTopY + 110, type: 'slanted' });
  walls.push({ x1: width - margin, y1: funnelTopY, x2: width * 0.65, y2: funnelTopY + 110, type: 'slanted' });

  // --- CHUỖI 14 THANH DỐC NGHIÊNG ĐAN XEN CẤP NĂNG NƯỢNG (CHUẨN ẢNH 5) ---
  let currY = funnelTopY + 160;
  const rampGap = 165; // Khoảng cách giữa các tầng dốc
  const dropGapWidth = 100; // Khe hở ở đầu dốc để bi rơi xuống dốc bên dưới

  const rampTitles = [
    'Chặng 1 • Dốc tăng tốc số 1',
    'Chặng 2 • Dốc lượn sóng số 2',
    'Chặng 3 • Đệm nảy Pinball & Dốc số 3',
    'Chặng 4 • Cánh quạt tử thần & Dốc số 4',
    'Chặng 5 • Dốc xoắn ốc số 5',
    'Chặng 6 • Thách thức bứt phá số 6',
    'Chặng 7 • Dốc tốc độ số 7',
    'Chặng 8 • Dốc đảo hướng số 8',
    'Chặng 9 • Dốc vượt mặt số 9',
    'Chặng 10 • Dốc về đích số 10',
  ];

  for (let i = 0; i < 12; i++) {
    const isLeftToRight = i % 2 === 0;
    const y1 = currY;
    const y2 = currY + 80;

    if (i % 2 === 0 && i < rampTitles.length * 2) {
      stages.push({ y: currY - 15, title: rampTitles[Math.floor(i / 2)] || `Chặng ${i + 1}` });
    }

    if (isLeftToRight) {
      // Dốc nghiêng từ TRÁI sang PHẢI (để hở góc phải 100px)
      walls.push({
        x1: margin,
        y1: y1,
        x2: width - margin - dropGapWidth,
        y2: y2,
        type: 'slanted',
      });
      // Gờ chặn nhẹ ở mép dốc để bi lộn rơi đẹp mắt
      walls.push({
        x1: width - margin - dropGapWidth - 20,
        y1: y2 - 25,
        x2: width - margin - dropGapWidth,
        y2: y2,
        type: 'slanted',
      });
    } else {
      // Dốc nghiêng từ PHẢI sang TRÁI (để hở góc trái 100px)
      walls.push({
        x1: margin + dropGapWidth,
        y1: y2,
        x2: width - margin,
        y2: y1,
        type: 'slanted',
      });
      walls.push({
        x1: margin + dropGapWidth,
        y1: y2,
        x2: margin + dropGapWidth + 20,
        y2: y2 - 25,
        type: 'slanted',
      });
    }

    // Đặt vài đệm nảy pinball hoặc chốt pin trên các tầng dốc ngẫu nhiên
    if (i === 2 || i === 5 || i === 8) {
      const bX = isLeftToRight ? width * 0.4 : width * 0.6;
      bumpers.push({ x: bX, y: (y1 + y2) / 2 - 40, radius: 32, color: '#F43F5E' });
    }

    currY += rampGap;
  }

  // --- CHẶNG CUỐI: PHỄU CỔ CHAI & VẠCH ĐÍCH (CHUẨN ẢNH 4 & 5) ---
  stages.push({ y: finishY - 300, title: 'Chặng Cuối • Phễu cổ chai & Vạch Đích' });
  walls.push({ x1: margin, y1: finishY - 360, x2: width * 0.42, y2: finishY - 140, type: 'slanted' });
  walls.push({ x1: width - margin, y1: finishY - 360, x2: width * 0.58, y2: finishY - 140, type: 'slanted' });

  return {
    width,
    trackHeight,
    startY,
    gateY,
    finishY,
    margin,
    walls,
    bumpers,
    pegs,
    stages,
  };
}

export function checkBumperCollision(marble, bumper) {
  const dx = marble.x - bumper.x;
  const dy = marble.y - bumper.y;
  const distSq = dx * dx + dy * dy;
  const minDist = marble.radius + bumper.radius;

  if (distSq < minDist * minDist) {
    const dist = Math.sqrt(distSq) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    const overlap = minDist - dist;
    marble.x += nx * overlap;
    marble.y += ny * overlap;

    const bounceForce = 360;
    marble.vx = nx * bounceForce + (Math.random() - 0.5) * 80;
    marble.vy = Math.abs(ny * bounceForce) + 140;

    return true;
  }
  return false;
}

// THUẬT TOÁN XỬ LÝ VA CHẠM CÁC THANH DỐC NGHIÊNG (SLOPE RAMP PHYSICS - CHUẨN ẢNH 5)
export function checkWallCollision(marble, wall) {
  let { x1, y1, x2, y2, type } = wall;

  // Đặt hướng slope vector d luôn theo chiều dốc rơi (từ điểm cao hơn -> điểm thấp hơn)
  if (y1 > y2) {
    [x1, x2] = [x2, x1];
    [y1, y2] = [y2, y1];
  }

  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return false;

  let t = ((marble.x - x1) * dx + (marble.y - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;

  const distX = marble.x - closestX;
  const distY = marble.y - closestY;
  const distSq = distX * distX + distY * distY;

  if (distSq < marble.radius * marble.radius) {
    const dist = Math.sqrt(distSq) || 1;
    let nx = distX / dist;
    let ny = distY / dist;

    // Đẩy viên bi ra ngoài mặt dốc thanh chắn
    const overlap = marble.radius - dist;
    marble.x += nx * overlap;
    marble.y += ny * overlap;

    if (type === 'vertical') {
      // Tường đứng hai bên biên
      marble.vx = -marble.vx * 0.75 + (Math.random() - 0.5) * 20;
    } else {
      // Thanh dốc nghiêng (Slanted Ramp) -> Trượt cuồn cuộn dọc thanh chắn (Chuẩn Ảnh 5)
      const len = Math.sqrt(lenSq) || 1;
      const tx = dx / len;
      const ty = dy / len;

      let vSlope = marble.vx * tx + marble.vy * ty;
      if (vSlope < 180) vSlope = 180; // Vận tốc trượt dọc thanh dốc luôn > 180px/s!

      marble.vx = vSlope * tx + (Math.random() - 0.5) * 20;
      marble.vy = Math.max(120, vSlope * ty);
    }
    return true;
  }
  return false;
}

export function checkMarbleCollision(m1, m2) {
  const dx = m2.x - m1.x;
  const dy = m2.y - m1.y;
  const distSq = dx * dx + dy * dy;
  const minDist = m1.radius + m2.radius;

  if (distSq < minDist * minDist) {
    const dist = Math.sqrt(distSq) || 1;
    let nx = dx / dist;
    let ny = dy / dist;

    const overlap = 0.2 * (minDist - dist);

    if (m1.y < m2.y && ny < 0) ny = 0;
    if (m2.y < m1.y && ny > 0) ny = 0;

    m1.x -= nx * overlap;
    m1.y -= ny * overlap;
    m2.x += nx * overlap;
    m2.y += ny * overlap;

    const kx = m1.vx - m2.vx;
    const ky = m1.vy - m2.vy;
    const p = nx * kx + ny * ky;

    if (p > 0) {
      m1.vx -= p * nx * 0.5;
      m1.vy -= p * ny * 0.5;
      m2.vx += p * nx * 0.5;
      m2.vy += p * ny * 0.5;
    }
    return true;
  }
  return false;
}
