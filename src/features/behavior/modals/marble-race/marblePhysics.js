// BỘ NGUYÊN LÝ VẬT LÝ VÀ ĐƯỜNG ĐUA TỐC ĐỘ 20 GIÂY VỀ ĐÍCH (ẢNH 6)

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

// FORMAT THỜI GIAN ĐẾM NGƯỢC GIÂY/PHẦN MƯỜI GIÂY (CHUẨN ẢNH 00:20,0 -> 00:00,0)
export function formatRaceTime(totalMs = 0) {
  const totalSec = Math.max(0, totalMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = Math.floor(totalSec % 60);
  const tenths = Math.floor((totalSec % 1) * 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${tenths}`;
}

// CẤU TRÚC ĐƯỜNG ĐUA TỐC ĐỘ 20 GIÂY CHUẨN 8 TẦNG DỐC (CHUẨN ẢNH 6)
export function generateFullStageTrack(width = 800) {
  const trackHeight = 2300;
  const startY = 120;
  const gateY = startY + 40;
  const finishY = 2080;
  const margin = Math.min(width * 0.08, 45);

  const walls = [];
  const bumpers = [];
  const pegs = [];
  const stages = [];

  // Tường biên đứng hai bên
  walls.push({ x1: margin, y1: startY - 100, x2: margin, y2: finishY, type: 'vertical' });
  walls.push({ x1: width - margin, y1: startY - 100, x2: width - margin, y2: finishY, type: 'vertical' });

  // --- CỔNG XUẤT PHÁT VÀ PHỄU ĐỔ BAN ĐẦU ---
  stages.push({ y: startY + 20, title: 'Vạch Xuất Phát & Phễu gom bi' });

  const funnelTopY = gateY + 30;
  walls.push({ x1: margin, y1: funnelTopY, x2: width * 0.35, y2: funnelTopY + 100, type: 'slanted' });
  walls.push({ x1: width - margin, y1: funnelTopY, x2: width * 0.65, y2: funnelTopY + 100, type: 'slanted' });

  // CHẶNG 2: 6 BÁNH ĐỆM NẢY PINBALL MÀU ĐỎ
  const bCenterY = funnelTopY + 230;
  bumpers.push({ x: width * 0.25, y: bCenterY - 30, radius: 34, color: '#F43F5E' });
  bumpers.push({ x: width * 0.5, y: bCenterY - 50, radius: 38, color: '#F43F5E' });
  bumpers.push({ x: width * 0.75, y: bCenterY - 30, radius: 34, color: '#F43F5E' });

  bumpers.push({ x: width * 0.35, y: bCenterY + 80, radius: 36, color: '#F43F5E' });
  bumpers.push({ x: width * 0.65, y: bCenterY + 80, radius: 36, color: '#F43F5E' });

  // --- CHUỖI 8 THANH DỐC NGHIÊNG TỐC ĐỘ (CHUẨN ẢNH 6) ---
  let currY = funnelTopY + 420;
  const rampGap = 160;
  const dropGapWidth = 95;

  const rampTitles = [
    'Chặng 1 • Dốc zíc-zắc thác trượt',
    'Chặng 2 • Dốc tốc độ bứt phá',
    'Chặng 3 • Đệm nảy Pinball & Dốc số 3',
    'Chặng 4 • Cánh quạt tử thần',
    'Chặng 5 • Dốc xoắn ốc số 5',
    'Chặng 6 • Dốc về đích thần tốc',
  ];

  for (let i = 0; i < 8; i++) {
    const isLeftToRight = i % 2 === 0;
    const y1 = currY;
    const y2 = currY + 70;

    stages.push({ y: currY - 12, title: rampTitles[i] || `Chặng ${i + 1}` });

    if (isLeftToRight) {
      walls.push({
        x1: margin,
        y1: y1,
        x2: width - margin - dropGapWidth,
        y2: y2,
        type: 'slanted',
      });
      walls.push({
        x1: width - margin - dropGapWidth - 20,
        y1: y2 - 20,
        x2: width - margin - dropGapWidth,
        y2: y2,
        type: 'slanted',
      });
    } else {
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
        y2: y2 - 20,
        type: 'slanted',
      });
    }

    if (i === 2 || i === 5) {
      const bX = isLeftToRight ? width * 0.45 : width * 0.55;
      bumpers.push({ x: bX, y: (y1 + y2) / 2 - 35, radius: 30, color: '#F43F5E' });
    }

    currY += rampGap;
  }

  // --- CHẶNG CUỐI: PHỄU CỔ CHAI & VẠCH ĐÍCH (CHUẨN ẢNH 4, 6) ---
  stages.push({ y: finishY - 250, title: 'Chặng Cuối • Vạch Đích' });
  walls.push({ x1: margin, y1: finishY - 300, x2: width * 0.42, y2: finishY - 110, type: 'slanted' });
  walls.push({ x1: width - margin, y1: finishY - 300, x2: width * 0.58, y2: finishY - 110, type: 'slanted' });

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

    const bounceForce = 420;
    marble.vx = nx * bounceForce + (Math.random() - 0.5) * 80;
    marble.vy = Math.abs(ny * bounceForce) + 160;

    return true;
  }
  return false;
}

export function checkWallCollision(marble, wall) {
  let { x1, y1, x2, y2, type } = wall;

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

    const overlap = marble.radius - dist;
    marble.x += nx * overlap;
    marble.y += ny * overlap;

    if (type === 'vertical') {
      marble.vx = -marble.vx * 0.75 + (Math.random() - 0.5) * 20;
    } else {
      // Vận tốc trượt dốc thần tốc (vSlope >= 380px/s) giúp bi cán đích chuẩn trong 20s
      const len = Math.sqrt(lenSq) || 1;
      const tx = dx / len;
      const ty = dy / len;

      let vSlope = marble.vx * tx + marble.vy * ty;
      if (vSlope < 380) vSlope = 380;

      marble.vx = vSlope * tx + (Math.random() - 0.5) * 30;
      marble.vy = Math.max(160, vSlope * ty);
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
