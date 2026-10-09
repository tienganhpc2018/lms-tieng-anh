// BỘ NGUYÊN LÝ VẬT LÝ VÀ ĐƯỜNG ĐUA CHO GAME VIÊN BI (MARBLE RACE)

// 24 MÀU VIÊN BI 3D RỰC RỠ VÀ BÓNG BẨY
export const MARBLE_COLORS = [
  { main: '#EF4444', light: '#FCA5A5', dark: '#991B1B', text: '#FFFFFF', name: 'Đỏ Ruby' },
  { main: '#3B82F6', light: '#93C5FD', dark: '#1E40AF', text: '#FFFFFF', name: 'Xanh Sapphire' },
  { main: '#10B981', light: '#6EE7B7', dark: '#065F46', text: '#FFFFFF', name: 'Xanh Lục Bảo' },
  { main: '#F59E0B', light: '#FDE68A', dark: '#92400E', text: '#FFFFFF', name: 'Vàng Hổ Phách' },
  { main: '#8B5CF6', light: '#C4B5FD', dark: '#5B21B6', text: '#FFFFFF', name: 'Tím Thạch Anh' },
  { main: '#EC4899', light: '#FBCFE8', dark: '#9D174D', text: '#FFFFFF', name: 'Hồng Ngọc' },
  { main: '#06B6D4', light: '#A5F3FC', dark: '#155E75', text: '#FFFFFF', name: 'Xanh Lam Bảo' },
  { main: '#F97316', light: '#FFEDD5', dark: '#9A3412', text: '#FFFFFF', name: 'Cam San Hô' },
  { main: '#14B8A6', light: '#99F6E4', dark: '#115E59', text: '#FFFFFF', name: 'Xanh Ngọc Bích' },
  { main: '#6366F1', light: '#C7D2FE', dark: '#3730A3', text: '#FFFFFF', name: 'Xanh Chàm' },
  { main: '#D946EF', light: '#F5D0FE', dark: '#86198F', text: '#FFFFFF', name: 'Tím Hoa Cà' },
  { main: '#84CC16', light: '#D9F99D', dark: '#3F6212', text: '#FFFFFF', name: 'Xanh Cốm' },
  { main: '#EAB308', light: '#FEF08A', dark: '#854D0E', text: '#FFFFFF', name: 'Vàng Kim' },
  { main: '#0284C7', light: '#BAE6FD', dark: '#075985', text: '#FFFFFF', name: 'Xanh Biển Dâng' },
  { main: '#A855F7', light: '#E9D5FF', dark: '#6B21A8', text: '#FFFFFF', name: 'Tím Hoàng Gia' },
  { main: '#F43F5E', light: '#FECDD3', dark: '#9F1239', text: '#FFFFFF', name: 'Đỏ Hoa Hồng' },
  { main: '#10B981', light: '#A7F3D0', dark: '#047857', text: '#FFFFFF', name: 'Xanh Lá Mạ' },
  { main: '#FB923C', light: '#FFEDD5', dark: '#C2410C', text: '#FFFFFF', name: 'Cam Rực Rỡ' },
  { main: '#38BDF8', light: '#E0F2FE', dark: '#0369A1', text: '#FFFFFF', name: 'Xanh Băng' },
  { main: '#C084FC', light: '#F3E8FF', dark: '#7E22CE', text: '#FFFFFF', name: 'Tím Phong Lan' },
  { main: '#FB7185', light: '#FFE4E6', dark: '#BE123C', text: '#FFFFFF', name: 'Hồng Đào' },
  { main: '#4ADE80', light: '#DCFCE7', dark: '#15803D', text: '#FFFFFF', name: 'Xanh Chuối' },
  { main: '#FACC15', light: '#FEF9C3', dark: '#A16207', text: '#FFFFFF', name: 'Vàng Nắng' },
  { main: '#818CF8', light: '#E0E7FF', dark: '#3730A3', text: '#FFFFFF', name: 'Xanh Lavender' },
];

// TẠO PRESET ĐƯỜNG ĐUA TRỰC QUAN
export const TRACK_PRESETS = [
  {
    id: 'plinko',
    name: '1. Thung Lũng Chốt Pin (Plinko)',
    desc: 'Đường đua nhiều hàng chốt va chạm nảy ngẫu nhiên, hồi hộp đỉnh cao',
    icon: '🔮',
  },
  {
    id: 'zigzag',
    name: '2. Đường Dốc Ziczac Sương Mù',
    desc: 'Các tầng dốc uốn lượn đổi hướng liên tục, thách thức kỹ năng',
    icon: '⚡',
  },
  {
    id: 'speedway',
    name: '3. Đường Đua Tốc Độ Tốc Hành',
    desc: 'Khu vực tăng tốc thần tốc, vượt mặt ngoạn mục phút chót',
    icon: '🚀',
  },
];

// NẠP CẤU TRÚC ĐƯỜNG ĐUA DỰA TRÊN KÍCH THƯỚC CANVAS (W x H)
export function generateTrackLayout(presetId, width, height) {
  const pegs = [];
  const walls = [];
  const boosters = [];
  const funnels = [];

  const startY = height * 0.12; // Cổng xuất phát
  const finishY = height * 0.88; // Vạch đích

  // Tường bao biên bên trái & phải
  const margin = Math.min(width * 0.08, 45);
  walls.push({ x1: margin, y1: startY, x2: margin, y2: finishY });
  walls.push({ x1: width - margin, y1: startY, x2: width - margin, y2: finishY });

  if (presetId === 'plinko') {
    // 1. PLINKO: 8 hàng chốt pin xếp so le
    const rows = 8;
    const rowGap = (finishY - startY - 120) / (rows + 1);

    for (let r = 1; r <= rows; r++) {
      const y = startY + 60 + r * rowGap;
      const isEven = r % 2 === 0;
      const cols = isEven ? 8 : 7;
      const startX = isEven ? margin + 35 : margin + 65;
      const colGap = (width - margin * 2 - (isEven ? 70 : 130)) / (cols - 1 || 1);

      for (let c = 0; c < cols; c++) {
        const x = startX + c * colGap;
        pegs.push({ x, y, radius: 10, color: '#38BDF8' });
      }
    }

    // Hai tấm tăng tốc ở gần cuối
    boosters.push({
      x: width * 0.3,
      y: height * 0.72,
      w: width * 0.15,
      h: 22,
      vy: 180,
      label: '🚀 TĂNG TỐC',
    });
    boosters.push({
      x: width * 0.7 - width * 0.15,
      y: height * 0.72,
      w: width * 0.15,
      h: 22,
      vy: 180,
      label: '🚀 TĂNG TỐC',
    });

    // Phễu gom ở vạch đích
    funnels.push({ x1: margin, y1: finishY - 40, x2: width * 0.2, y2: finishY });
    funnels.push({ x1: width - margin, y1: finishY - 40, x2: width * 0.8, y2: finishY });
  } else if (presetId === 'zigzag') {
    // 2. ZIGZAC: 4 dốc uốn lượn từ trái sang phải
    const rampCount = 4;
    const rampHeightGap = (finishY - startY - 80) / rampCount;

    for (let i = 0; i < rampCount; i++) {
      const y1 = startY + 60 + i * rampHeightGap;
      const y2 = y1 + rampHeightGap * 0.45;
      const isLeftToRight = i % 2 === 0;

      if (isLeftToRight) {
        walls.push({ x1: margin, y1, x2: width - margin - 80, y2 });
        // Chốt cản ở cuối dốc
        pegs.push({ x: width - margin - 60, y: y2 + 15, radius: 14, color: '#F43F5E' });
      } else {
        walls.push({ x1: margin + 80, y1, x2: width - margin, y2 });
        pegs.push({ x: margin + 60, y: y2 + 15, radius: 14, color: '#F43F5E' });
      }

      // Vài chốt pin trên dốc
      const midX = width / 2;
      pegs.push({ x: midX - 40, y: (y1 + y2) / 2, radius: 8, color: '#FACC15' });
      pegs.push({ x: midX + 40, y: (y1 + y2) / 2, radius: 8, color: '#FACC15' });
    }
  } else {
    // 3. SPEEDWAY: Đường đua tốc độ phân nhánh rồi hợp nhất
    const midY = (startY + finishY) / 2;

    // Tường chia nhánh ở giữa
    walls.push({ x1: width / 2, y1: startY + 100, x2: width / 2, y2: midY + 50 });

    // Hàng chốt hai bên
    for (let y = startY + 80; y < finishY - 100; y += 75) {
      pegs.push({ x: width * 0.28, y, radius: 9, color: '#A855F7' });
      pegs.push({ x: width * 0.72, y, radius: 9, color: '#A855F7' });
    }

    // Tăng tốc dồn dập
    boosters.push({
      x: width * 0.2,
      y: midY - 30,
      w: width * 0.2,
      h: 24,
      vy: 240,
      label: '🚀 TỐC ĐỘ',
    });
    boosters.push({
      x: width * 0.6,
      y: midY - 30,
      w: width * 0.2,
      h: 24,
      vy: 240,
      label: '🚀 TỐC ĐỘ',
    });
    boosters.push({
      x: width * 0.38,
      y: finishY - 90,
      w: width * 0.24,
      h: 24,
      vy: 260,
      label: '🔥 TĂNG TỐC CUỐI',
    });
  }

  return {
    startY,
    finishY,
    margin,
    pegs,
    walls,
    boosters,
    funnels,
  };
}

// XỬ LÝ VA CHẠM VIÊN BI VỚI CHỐT PIN (CIRCLE - CIRCLE)
export function checkPegCollision(marble, peg) {
  const dx = marble.x - peg.x;
  const dy = marble.y - peg.y;
  const distSq = dx * dx + dy * dy;
  const minDist = marble.radius + peg.radius;

  if (distSq < minDist * minDist) {
    const dist = Math.sqrt(distSq) || 1;
    const nx = dx / dist; // Vectơ pháp tuyến
    const ny = dy / dist;

    // Đẩy viên bi ra ngoài chốt pin
    const overlap = minDist - dist;
    marble.x += nx * overlap;
    marble.y += ny * overlap;

    // Phản xạ vận tốc theo pháp tuyến + nảy ngẫu nhiên nhẹ
    const dot = marble.vx * nx + marble.vy * ny;
    if (dot < 0) {
      const restitution = 0.78; // Độ nảy
      marble.vx -= (1 + restitution) * dot * nx;
      marble.vy -= (1 + restitution) * dot * ny;

      // Xung lực ngẫu nhiên giúp cuộc đua công bằng & kịch tính
      const randomImpulse = (Math.random() - 0.5) * 60;
      marble.vx += randomImpulse;
    }
    return true; // Có va chạm
  }
  return false;
}

// XỬ LÝ VA CHẠM VIÊN BI VỚI TƯỜNG (CIRCLE - LINE SEGMENT)
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

// XỬ LÝ VA CHẠM GIỮA HAI VIÊN BI (MARBLE - MARBLE ELASTIC COLLISION)
export function checkMarbleCollision(m1, m2) {
  const dx = m2.x - m1.x;
  const dy = m2.y - m1.y;
  const distSq = dx * dx + dy * dy;
  const minDist = m1.radius + m2.radius;

  if (distSq < minDist * minDist) {
    const dist = Math.sqrt(distSq) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    const overlap = 0.5 * (minDist - dist);
    m1.x -= nx * overlap;
    m1.y -= ny * overlap;
    m2.x += nx * overlap;
    m2.y += ny * overlap;

    const kx = m1.vx - m2.vx;
    const ky = m1.vy - m2.vy;
    const p = 2 * (nx * kx + ny * ky) / 2; // Khối lượng bằng nhau = 1

    if (p > 0) {
      m1.vx -= p * nx * 0.85;
      m1.vy -= p * ny * 0.85;
      m2.vx += p * nx * 0.85;
      m2.vy += p * ny * 0.85;
    }
    return true;
  }
  return false;
}

// VẼ VIÊN BI 3D BÓNG BẨY TRÊN CANVAS
export function draw3DMarble(ctx, marble, options = {}) {
  const { x, y, radius, color, number, studentName, isFinished, isLeader, showLabels = true } = marble;

  ctx.save();

  // 1. Bóng đổ dưới đáy viên bi
  ctx.beginPath();
  ctx.ellipse(x + 2, y + radius * 0.7, radius * 0.85, radius * 0.35, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fill();

  // 2. Thân viên bi 3D với Radial Gradient
  const grad = ctx.createRadialGradient(
    x - radius * 0.35,
    y - radius * 0.35,
    radius * 0.1,
    x,
    y,
    radius
  );
  grad.addColorStop(0, color.light || '#FFFFFF');
  grad.addColorStop(0.5, color.main || '#3B82F6');
  grad.addColorStop(1, color.dark || '#1E40AF');

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // 3. Đường viền phát sáng nhẹ hoặc highlight
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = isLeader ? '#FACC15' : 'rgba(255, 255, 255, 0.4)';
  ctx.stroke();

  // 4. Vệt phản quang ánh sáng specular
  ctx.beginPath();
  ctx.arc(x - radius * 0.35, y - radius * 0.35, radius * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fill();

  // 5. Số áo hiển thị giữa viên bi
  ctx.fillStyle = color.text || '#FFFFFF';
  ctx.font = `bold ${Math.max(10, Math.round(radius * 0.95))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 3;
  ctx.fillText(String(number), x, y + 0.5);

  // 6. Vương miện cho người dẫn đầu
  if (isLeader && !isFinished) {
    ctx.font = `${Math.round(radius * 1.1)}px sans-serif`;
    ctx.fillText('👑', x, y - radius - 10);
  }

  // 7. Nhãn tên học sinh nổi phía dưới
  if (showLabels && studentName) {
    const fontSize = Math.max(10, Math.min(12, Math.round(radius * 0.85)));
    ctx.font = `bold ${fontSize}px sans-serif`;

    const textMetrics = ctx.measureText(studentName);
    const textWidth = textMetrics.width;
    const paddingX = 6;
    const paddingY = 3;
    const rectW = textWidth + paddingX * 2;
    const rectH = fontSize + paddingY * 2;
    const rectX = x - rectW / 2;
    const rectY = y + radius + 4;

    // Background pill cho tên
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.fillStyle = isLeader ? '#FEF08A' : 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(rectX, rectY, rectW, rectH, 6);
    } else {
      ctx.rect(rectX, rectY, rectW, rectH);
    }
    ctx.fill();

    ctx.fillStyle = isLeader ? '#854D0E' : '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(studentName, x, rectY + rectH / 2);
  }

  ctx.restore();
}
