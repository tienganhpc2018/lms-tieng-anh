// BỘ NGUYÊN LÝ VẬT LÝ VÀ CẤU TRÚC ĐƯỜNG ĐUA CHUẨN 7 CHẶNG (ẢNH 2, 3, 4)

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

export function generateFullStageTrack(width = 800) {
  const trackHeight = 2700;
  const startY = 140;
  const gateY = startY + 40;
  const finishY = 2500;
  const margin = Math.min(width * 0.08, 45);

  const walls = [];
  const bumpers = [];
  const pegs = [];
  const stages = [];

  // Tường biên trái & phải
  walls.push({ x1: margin, y1: startY - 100, x2: margin, y2: finishY });
  walls.push({ x1: width - margin, y1: startY - 100, x2: width - margin, y2: finishY });

  // --- CHẶNG 1: PHỄU XUẤT PHÁT (ĐẶT DƯỚI VẠCH CỔNG GẠT) ---
  stages.push({ y: startY + 20, title: 'Chặng 1 • Phễu Xuất Phát & Đệm nảy Pinball' });

  const funnelTopY = gateY + 30;
  walls.push({ x1: margin, y1: funnelTopY, x2: width * 0.36, y2: funnelTopY + 120 });
  walls.push({ x1: width - margin, y1: funnelTopY, x2: width * 0.64, y2: funnelTopY + 120 });

  // CHẶNG 2: 8 BÁNH ĐỆM NẢY PINBALL MÀU ĐỎ (CHUẨN ẢNH 2, 3)
  const bCenterY = funnelTopY + 280;
  bumpers.push({ x: width * 0.22, y: bCenterY - 40, radius: 36, color: '#F43F5E' });
  bumpers.push({ x: width * 0.5, y: bCenterY - 70, radius: 42, color: '#F43F5E' });
  bumpers.push({ x: width * 0.78, y: bCenterY - 40, radius: 36, color: '#F43F5E' });

  bumpers.push({ x: width * 0.32, y: bCenterY + 90, radius: 38, color: '#F43F5E' });
  bumpers.push({ x: width * 0.68, y: bCenterY + 90, radius: 38, color: '#F43F5E' });

  bumpers.push({ x: width * 0.2, y: bCenterY + 220, radius: 35, color: '#F43F5E' });
  bumpers.push({ x: width * 0.5, y: bCenterY + 240, radius: 42, color: '#F43F5E' });
  bumpers.push({ x: width * 0.8, y: bCenterY + 220, radius: 35, color: '#F43F5E' });

  // --- CHẶNG 3: NGÃ BA PHÂN NHÁNH & ĐẢO HƯỚNG ---
  stages.push({ y: startY + 700, title: 'Chặng 2 • Ngã ba phân nhánh & Đảo hướng' });
  walls.push({ x1: margin, y1: startY + 680, x2: width * 0.38, y2: startY + 800 });
  walls.push({ x1: width - margin, y1: startY + 680, x2: width * 0.62, y2: startY + 800 });

  walls.push({ x1: width * 0.5, y1: startY + 830, x2: width * 0.3, y2: startY + 950 });
  walls.push({ x1: width * 0.5, y1: startY + 830, x2: width * 0.7, y2: startY + 950 });

  // --- CHẶNG 4 & 5: CÁC TẦNG DỐC ZICZAC NGHIÊNG ---
  stages.push({ y: startY + 1050, title: 'Chặng 3 • Đường dốc Ziczac tăng tốc' });
  const rampY1 = startY + 1020;
  const rampY2 = startY + 1200;
  const rampY3 = startY + 1380;
  const rampY4 = startY + 1560;

  walls.push({ x1: margin, y1: rampY1, x2: width - margin - 90, y2: rampY1 + 75 });
  walls.push({ x1: margin + 90, y1: rampY2, x2: width - margin, y2: rampY2 + 75 });
  walls.push({ x1: margin, y1: rampY3, x2: width - margin - 90, y2: rampY3 + 75 });
  walls.push({ x1: margin + 90, y1: rampY4, x2: width - margin, y2: rampY4 + 75 });

  for (let py = rampY1 + 100; py <= rampY4 + 100; py += 120) {
    pegs.push({ x: width * 0.3, y: py, radius: 10, color: '#0284C7' });
    pegs.push({ x: width * 0.7, y: py, radius: 10, color: '#0284C7' });
  }

  // --- CHẶNG 6: KHU VỰC THỬ THÁCH BỨT PHÁ ---
  stages.push({ y: startY + 1780, title: 'Chặng 6 • Khu vực bứt phá & Vượt mặt' });
  bumpers.push({ x: width * 0.35, y: startY + 1820, radius: 36, color: '#F43F5E' });
  bumpers.push({ x: width * 0.65, y: startY + 1820, radius: 36, color: '#F43F5E' });

  // --- CHẶNG 7: PHỄU CỔ CHAI & VẠCH ĐÍCH (CHUẨN ẢNH 4) ---
  stages.push({ y: finishY - 320, title: 'Chặng 7 • Phễu cổ chai & Chốt chặn' });
  walls.push({ x1: margin, y1: finishY - 380, x2: width * 0.42, y2: finishY - 140 });
  walls.push({ x1: width - margin, y1: finishY - 380, x2: width * 0.58, y2: finishY - 140 });

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
    marble.vy = Math.abs(ny * bounceForce) + 60; // Luôn nảy hướng xuống dưới!

    return true;
  }
  return false;
}

export function checkWallCollision(marble, wall) {
  const { x1, y1, x2, y2 } = wall;
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
    const nx = distX / dist;
    const ny = distY / dist;

    const overlap = marble.radius - dist;
    marble.x += nx * overlap;
    marble.y += ny * overlap;

    const dot = marble.vx * nx + marble.vy * ny;
    if (dot < 0) {
      const restitution = 0.7;
      marble.vx -= (1 + restitution) * dot * nx;
      marble.vy -= (1 + restitution) * dot * ny;
    }
    return true;
  }
  return false;
}

// XỬ LÝ VA CHẠM GIỮA CÁC VIÊN BI (GIẢM ĐỒNG THỜI ĐẨY ĐỀU TRÁNH KẸT)
export function checkMarbleCollision(m1, m2) {
  const dx = m2.x - m1.x;
  const dy = m2.y - m1.y;
  const distSq = dx * dx + dy * dy;
  const minDist = m1.radius + m2.radius;

  if (distSq < minDist * minDist) {
    const dist = Math.sqrt(distSq) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    // Giảm tỷ lệ đẩy vị trí xuống 0.25 để không bị đẩy ngược lên trên
    const overlap = 0.25 * (minDist - dist);
    m1.x -= nx * overlap;
    m1.y -= ny * overlap;
    m2.x += nx * overlap;
    m2.y += ny * overlap;

    const kx = m1.vx - m2.vx;
    const ky = m1.vy - m2.vy;
    const p = nx * kx + ny * ky;

    if (p > 0) {
      m1.vx -= p * nx * 0.65;
      m1.vy -= p * ny * 0.65;
      m2.vx += p * nx * 0.65;
      m2.vy += p * ny * 0.65;
    }
    return true;
  }
  return false;
}
