// BỘ NGUYÊN LÝ VẬT LÝ VÀ ĐƯỜNG ĐUA 3 MẪU BẢN ĐỒ KỊCH TÍNH (CHUẨN THẦY YÊU CẦU)

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

// FORMAT THỜI GIAN ĐẾM NGƯỢC GIÂY/PHẦN MƯỜI GIÂY
export function formatRaceTime(totalMs = 0) {
  const totalSec = Math.max(0, totalMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = Math.floor(totalSec % 60);
  const tenths = Math.floor((totalSec % 1) * 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${tenths}`;
}

// CẤU TRÚC ĐƯỜNG ĐUA VỚI 3 MẪU BẢN ĐỒ (bottleneck: PHỄU CỔ CHAI, pinball: THÁP PINBALL, zigzag: THÁC TRƯỢT ZÍCZẮC)
export function generateFullStageTrack(width = 800, trackType = 'bottleneck') {
  const trackHeight = 2400;
  const startY = 120;
  const gateY = startY + 40;
  const finishY = 2180;
  const margin = Math.min(width * 0.08, 45);

  const walls = [];
  const bumpers = [];
  const pegs = [];
  const spinners = [];
  const stages = [];

  // Tường biên đứng hai bên
  walls.push({ x1: margin, y1: startY - 100, x2: margin, y2: finishY, type: 'vertical' });
  walls.push({ x1: width - margin, y1: startY - 100, x2: width - margin, y2: finishY, type: 'vertical' });

  stages.push({ y: startY + 20, title: 'Vạch Xuất Phát & Phễu gom bi' });
  const funnelTopY = gateY + 30;

  if (trackType === 'pinball') {
    // --- MẪU 2: THÁP ĐỆM PINBALL NỔI BẬT (15+ BÁNH ĐỆM ĐỎ) ---
    walls.push({ x1: margin, y1: funnelTopY, x2: width * 0.35, y2: funnelTopY + 90, type: 'slanted' });
    walls.push({ x1: width - margin, y1: funnelTopY, x2: width * 0.65, y2: funnelTopY + 90, type: 'slanted' });

    let pY = funnelTopY + 180;

    for (let r = 0; r < 5; r++) {
      stages.push({ y: pY + r * 280 - 30, title: `Chặng ${r + 1} • Tầng Pinball Đa Hướng ${r + 1}` });
      if (r % 2 === 0) {
        bumpers.push({ x: width * 0.22, y: pY + r * 280, radius: 36, color: '#F43F5E' });
        bumpers.push({ x: width * 0.50, y: pY + r * 280 - 20, radius: 40, color: '#F43F5E' });
        bumpers.push({ x: width * 0.78, y: pY + r * 280, radius: 36, color: '#F43F5E' });
      } else {
        bumpers.push({ x: width * 0.35, y: pY + r * 280, radius: 38, color: '#F43F5E' });
        bumpers.push({ x: width * 0.65, y: pY + r * 280, radius: 38, color: '#F43F5E' });
      }
      const isLeft = r % 2 === 0;
      if (isLeft) {
        walls.push({ x1: margin, y1: pY + r * 280 + 90, x2: width * 0.7, y2: pY + r * 280 + 170, type: 'slanted' });
      } else {
        walls.push({ x1: width * 0.3, y1: pY + r * 280 + 170, x2: width - margin, y2: pY + r * 280 + 90, type: 'slanted' });
      }
    }

    const bottleneckY = finishY - 145;
    stages.push({ y: finishY - 320, title: 'Chặng 7 • Phễu cổ chai & Chốt chặn' });
    walls.push({ x1: margin, y1: finishY - 320, x2: width * 0.40, y2: bottleneckY, type: 'slanted' });
    walls.push({ x1: width - margin, y1: finishY - 320, x2: width * 0.60, y2: bottleneckY, type: 'slanted' });
    walls.push({ x1: width * 0.40, y1: bottleneckY, x2: width * 0.43, y2: finishY - 40, type: 'slanted' });
    walls.push({ x1: width * 0.60, y1: bottleneckY, x2: width * 0.57, y2: finishY - 40, type: 'slanted' });

    spinners.push({
      x: width * 0.5,
      y: bottleneckY + 10,
      radius: 42,
      angle: 0,
      speed: 2.8,
      numBlades: 4,
      color: '#F97316',
    });
  } else if (trackType === 'zigzag') {
    // --- MẪU 3: THÁC TRƯỢT ZÍC ZẮC THẦN TỐC (7 TẦNG DỐC LIÊN HOÀN) ---
    walls.push({ x1: margin, y1: funnelTopY, x2: width * 0.35, y2: funnelTopY + 90, type: 'slanted' });
    walls.push({ x1: width - margin, y1: funnelTopY, x2: width * 0.65, y2: funnelTopY + 90, type: 'slanted' });

    let currY = funnelTopY + 170;
    const rampGap = 200;
    const dropGapWidth = 110;

    for (let i = 0; i < 6; i++) {
      const isLeftToRight = i % 2 === 0;
      const y1 = currY;
      const y2 = currY + 85;

      stages.push({ y: currY - 12, title: `Chặng ${i + 1} • Dốc Zíc Zắc Thác Trượt ${i + 1}` });

      if (isLeftToRight) {
        walls.push({ x1: margin, y1: y1, x2: width - margin - dropGapWidth, y2: y2, type: 'slanted' });
        walls.push({ x1: width - margin - dropGapWidth - 20, y1: y2 - 20, x2: width - margin - dropGapWidth, y2: y2, type: 'slanted' });
      } else {
        walls.push({ x1: margin + dropGapWidth, y1: y2, x2: width - margin, y2: y1, type: 'slanted' });
        walls.push({ x1: margin + dropGapWidth, y1: y2, x2: margin + dropGapWidth + 20, y2: y2 - 20, type: 'slanted' });
      }

      if (i % 2 === 1) {
        const bX = isLeftToRight ? width * 0.45 : width * 0.55;
        bumpers.push({ x: bX, y: (y1 + y2) / 2 - 35, radius: 32, color: '#F43F5E' });
      }

      currY += rampGap;
    }

    const bottleneckY = finishY - 145;
    stages.push({ y: finishY - 320, title: 'Chặng 7 • Phễu cổ chai & Chốt chặn' });
    walls.push({ x1: margin, y1: finishY - 320, x2: width * 0.40, y2: bottleneckY, type: 'slanted' });
    walls.push({ x1: width - margin, y1: finishY - 320, x2: width * 0.60, y2: bottleneckY, type: 'slanted' });
    walls.push({ x1: width * 0.40, y1: bottleneckY, x2: width * 0.43, y2: finishY - 40, type: 'slanted' });
    walls.push({ x1: width * 0.60, y1: bottleneckY, x2: width * 0.57, y2: finishY - 40, type: 'slanted' });

    spinners.push({
      x: width * 0.5,
      y: bottleneckY + 10,
      radius: 42,
      angle: 0,
      speed: 2.8,
      numBlades: 4,
      color: '#F97316',
    });
  } else {
    // --- MẪU 1: PHỄU CỔ CHAI & CÁNH QUẠT (CHUẨN 100% ẢNH THẦY GỬI) ---
    walls.push({ x1: margin, y1: funnelTopY, x2: width * 0.35, y2: funnelTopY + 90, type: 'slanted' });
    walls.push({ x1: width - margin, y1: funnelTopY, x2: width * 0.65, y2: funnelTopY + 90, type: 'slanted' });

    const bCenterY = funnelTopY + 220;
    stages.push({ y: bCenterY - 60, title: 'Chặng 1 • Đệm nảy Pinball & Phân nhánh' });
    bumpers.push({ x: width * 0.25, y: bCenterY - 30, radius: 34, color: '#F43F5E' });
    bumpers.push({ x: width * 0.5, y: bCenterY - 50, radius: 38, color: '#F43F5E' });
    bumpers.push({ x: width * 0.75, y: bCenterY - 30, radius: 34, color: '#F43F5E' });
    bumpers.push({ x: width * 0.35, y: bCenterY + 80, radius: 36, color: '#F43F5E' });
    bumpers.push({ x: width * 0.65, y: bCenterY + 80, radius: 36, color: '#F43F5E' });

    let currY = funnelTopY + 410;
    const rampGap = 160;
    const dropGapWidth = 100;

    const rampTitles = [
      'Chặng 2 • Dốc tốc độ bứt phá',
      'Chặng 3 • Tháp đệm nảy đảo chiều',
      'Chặng 4 • Cánh quạt tử thần',
      'Chặng 5 • Dốc xoắn ốc bứt tốc',
      'Chặng 6 • Rừng chốt cản Plinko',
    ];

    for (let i = 0; i < 5; i++) {
      const isLeftToRight = i % 2 === 0;
      const y1 = currY;
      const y2 = currY + 75;

      stages.push({ y: currY - 12, title: rampTitles[i] || `Chặng ${i + 2}` });

      if (isLeftToRight) {
        walls.push({ x1: margin, y1: y1, x2: width - margin - dropGapWidth, y2: y2, type: 'slanted' });
        walls.push({ x1: width - margin - dropGapWidth - 20, y1: y2 - 20, x2: width - margin - dropGapWidth, y2: y2, type: 'slanted' });
      } else {
        walls.push({ x1: margin + dropGapWidth, y1: y2, x2: width - margin, y2: y1, type: 'slanted' });
        walls.push({ x1: margin + dropGapWidth, y1: y2, x2: margin + dropGapWidth + 20, y2: y2 - 20, type: 'slanted' });
      }

      if (i === 1 || i === 3) {
        const bX = isLeftToRight ? width * 0.45 : width * 0.55;
        bumpers.push({ x: bX, y: (y1 + y2) / 2 - 35, radius: 30, color: '#F43F5E' });
      }

      if (i === 4) {
        for (let px = margin + 40; px < width - margin - 40; px += 45) {
          pegs.push({ x: px, y: y1 + 30, radius: 8 });
          pegs.push({ x: px + 22, y: y1 + 65, radius: 8 });
        }
      }

      currY += rampGap;
    }

    spinners.push({
      x: width * 0.5,
      y: funnelTopY + 730,
      radius: 36,
      angle: 0,
      speed: 2.2,
      numBlades: 4,
      color: '#F97316',
    });

    const bottleneckY = finishY - 145;
    stages.push({ y: finishY - 320, title: 'Chặng 7 • Phễu cổ chai & Chốt chặn' });
    walls.push({ x1: margin, y1: finishY - 320, x2: width * 0.40, y2: bottleneckY, type: 'slanted' });
    walls.push({ x1: width - margin, y1: finishY - 320, x2: width * 0.60, y2: bottleneckY, type: 'slanted' });
    walls.push({ x1: width * 0.40, y1: bottleneckY, x2: width * 0.43, y2: finishY - 40, type: 'slanted' });
    walls.push({ x1: width * 0.60, y1: bottleneckY, x2: width * 0.57, y2: finishY - 40, type: 'slanted' });

    spinners.push({
      x: width * 0.5,
      y: bottleneckY + 10,
      radius: 42,
      angle: 0,
      speed: 2.8,
      numBlades: 4,
      color: '#F97316',
    });
  }

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
    spinners,
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

    const bounceForce = 440;
    marble.vx = nx * bounceForce + (Math.random() - 0.5) * 120;
    marble.vy = Math.abs(ny * bounceForce) + 160;

    return true;
  }
  return false;
}

export function checkPegCollision(marble, peg) {
  const dx = marble.x - peg.x;
  const dy = marble.y - peg.y;
  const distSq = dx * dx + dy * dy;
  const minDist = marble.radius + peg.radius;

  if (distSq < minDist * minDist) {
    const dist = Math.sqrt(distSq) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    const overlap = minDist - dist;
    marble.x += nx * overlap;
    marble.y += ny * overlap;

    const bounce = 300;
    marble.vx = nx * bounce + (Math.random() - 0.5) * 120;
    marble.vy = Math.abs(ny * bounce) + 120;
    return true;
  }
  return false;
}

export function checkSpinnerCollision(marble, spinner) {
  const { x: cx, y: cy, radius, angle, speed = 2.8, numBlades = 4 } = spinner;
  const vSpin = speed * radius;

  for (let i = 0; i < numBlades; i++) {
    const bladeAngle = angle + (i * Math.PI * 2) / numBlades;
    const bx = cx + Math.cos(bladeAngle) * radius;
    const by = cy + Math.sin(bladeAngle) * radius;

    const dx = bx - cx;
    const dy = by - cy;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) continue;

    let t = ((marble.x - cx) * dx + (marble.y - cy) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const closestX = cx + t * dx;
    const closestY = cy + t * dy;

    const distX = marble.x - closestX;
    const distY = marble.y - closestY;
    const distSq = distX * distX + distY * distY;

    if (distSq < marble.radius * marble.radius) {
      const dist = Math.sqrt(distSq) || 1;
      const nx = distX / dist;
      const ny = distY / dist;

      const overlap = marble.radius - dist;
      marble.x += nx * overlap;
      marble.y += ny * overlap;

      const tangX = -Math.sin(bladeAngle);
      const tangY = Math.cos(bladeAngle);

      const bounce = 260;
      marble.vx = nx * bounce + tangX * vSpin * 0.8 + (Math.random() - 0.5) * 90;
      marble.vy = Math.abs(ny * bounce) + Math.max(100, tangY * vSpin * 0.8);

      return true;
    }
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
      marble.vx = -marble.vx * 0.75 + (Math.random() - 0.5) * 30;
    } else {
      const len = Math.sqrt(lenSq) || 1;
      const tx = dx / len;
      const ty = dy / len;

      let vSlope = marble.vx * tx + marble.vy * ty;
      if (vSlope < 300) vSlope = 300;

      marble.vx = vSlope * tx + (Math.random() - 0.5) * 40;
      marble.vy = Math.max(140, vSlope * ty);
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

    const overlap = 0.25 * (minDist - dist);

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
