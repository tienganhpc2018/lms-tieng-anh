import React, { useRef, useEffect } from 'react';
import {
  generateFullStageTrack,
  checkBumperCollision,
  checkWallCollision,
  checkMarbleCollision,
  MARBLE_COLORS,
  getStudentInitials,
} from './marblePhysics';
import { playClick } from '../../../../utils/soundEffects';

export default function MarbleRaceCanvas({
  racerStudents = [],
  gateLocked = true,
  isPaused = false,
  soundEnabled = true,
  onWinnerFound,
  onMarbleFinish,
  onUpdateMarbles,
  onCameraUpdate,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const marblesRef = useRef([]);
  const trackRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);
  const cameraYRef = useRef(0);
  const winnerDeclaredRef = useRef(false);
  const finishCounterRef = useRef(0);
  const lastReactUpdateRef = useRef(0);
  const startTimeRef = useRef(null);

  // Khởi tạo danh sách viên bi từ học sinh
  const initMarbles = (trackLayout, canvasWidth) => {
    if (!trackLayout) return [];

    const count = racerStudents.length;
    const radius = Math.max(12, Math.min(16, Math.floor(canvasWidth / 25)));
    const startY = trackLayout.startY + 20;
    const margin = trackLayout.margin + 30;
    const usableWidth = canvasWidth - margin * 2;
    const colCount = Math.min(8, count);
    const rowGap = radius * 2.4;
    const colGap = usableWidth / (colCount || 1);

    const marbles = racerStudents.map((st, idx) => {
      const row = Math.floor(idx / colCount);
      const col = idx % colCount;
      const x = margin + col * colGap + colGap / 2 + (Math.random() - 0.5) * 4;
      const y = startY - row * rowGap;
      const colorObj = MARBLE_COLORS[idx % MARBLE_COLORS.length];

      return {
        id: st.id || `m_${idx}`,
        number: idx + 1,
        studentName: st.full_name,
        initials: getStudentInitials(st.full_name),
        x,
        y,
        vx: (Math.random() - 0.5) * 30,
        vy: 0,
        radius,
        color: colorObj,
        isFinished: false,
        finishRank: null,
        finishTime: null,
      };
    });

    marblesRef.current = marbles;
    cameraYRef.current = 0;
    winnerDeclaredRef.current = false;
    finishCounterRef.current = 0;
    startTimeRef.current = null;
    return marbles;
  };

  // Resize canvas & khởi tạo track
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;

      const layout = generateFullStageTrack(width);
      trackRef.current = layout;
      initMarbles(layout, width);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [racerStudents]);

  // Reset khi khóa cổng lại
  useEffect(() => {
    if (gateLocked && trackRef.current && canvasRef.current) {
      initMarbles(trackRef.current, canvasRef.current.width);
    }
  }, [gateLocked]);

  // VÒNG LẶP MÔ PHỎNG VẬT LÝ NỘI BỘ 60 FPS
  useEffect(() => {
    lastTimeRef.current = performance.now();

    const loop = (currentTime) => {
      animFrameRef.current = requestAnimationFrame(loop);

      if (isPaused) {
        lastTimeRef.current = currentTime;
        return;
      }

      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.033);
      lastTimeRef.current = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const layout = trackRef.current;
      if (!layout) return;

      const { width, trackHeight, startY, finishY, margin, walls, bumpers, pegs, stages } = layout;
      const viewportH = canvas.height;

      if (!gateLocked && !startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const marbles = marblesRef.current;

      // 1. CẬP NHẬT MÔ PHỎNG VẬT LÝ
      const gravity = 820;

      // Tìm viên bi dẫn đầu để Camera cuộn theo
      let maxUnfinishedY = 0;
      marbles.forEach((m) => {
        if (!m.isFinished && m.y > maxUnfinishedY) {
          maxUnfinishedY = m.y;
        }
      });

      // Target camera Y mượt mà
      const targetCamY = Math.max(0, Math.min(trackHeight - viewportH, maxUnfinishedY - viewportH * 0.38));
      cameraYRef.current += (targetCamY - cameraYRef.current) * 0.08;
      const camY = cameraYRef.current;

      marbles.forEach((m) => {
        if (m.isFinished) return;

        if (!gateLocked) {
          m.vy += gravity * dt;
          m.vx *= 0.992;
          m.vy *= 0.996;

          m.x += m.vx * dt;
          m.y += m.vy * dt;
        } else if (m.y + m.radius > startY + 50) {
          m.y = startY + 50 - m.radius;
          m.vy = 0;
        }

        // Va chạm với đệm nảy pinball màu đỏ rực
        bumpers.forEach((b) => {
          if (checkBumperCollision(m, b)) {
            if (soundEnabled && Math.random() < 0.2) playClick();
          }
        });

        // Va chạm với tường
        walls.forEach((w) => checkWallCollision(m, w));

        // KIỂM TRA VỀ ĐÍCH
        if (m.y >= finishY && !m.isFinished) {
          m.isFinished = true;
          finishCounterRef.current += 1;
          m.finishRank = finishCounterRef.current;
          m.finishTime = Date.now() - (startTimeRef.current || Date.now());

          if (onMarbleFinish) onMarbleFinish(m, m.finishRank);

          if (!winnerDeclaredRef.current && m.finishRank === 1) {
            winnerDeclaredRef.current = true;
            if (onWinnerFound) onWinnerFound(m);
          }
        }
      });

      // Va chạm giữa các viên bi
      for (let i = 0; i < marbles.length; i++) {
        for (let j = i + 1; j < marbles.length; j++) {
          checkMarbleCollision(marbles[i], marbles[j]);
        }
      }

      // 2. VẼ GIAO DIỆN NỀN GIẤY KẺ Ô TẬP HỌC SINH (CHUẨN ẢNH 2, 3, 4)
      ctx.save();
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, width, viewportH);

      // Kẻ ô vuông tập vở nhẹ
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      const gridGap = 28;
      const startGridY = -(camY % gridGap);

      for (let gx = 0; gx < width; gx += gridGap) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, viewportH);
        ctx.stroke();
      }
      for (let gy = startGridY; gy < viewportH; gy += gridGap) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // DỊCH CHUYỂN CỌ VẼ THEO CAMERA Y
      ctx.translate(0, -camY);

      // Tường biên Navy Blue đậm (Chuẩn Ảnh 2, 3)
      walls.forEach((w) => {
        ctx.beginPath();
        ctx.moveTo(w.x1, w.y1);
        ctx.lineTo(w.x2, w.y2);
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#1E3A8A';
        ctx.lineCap = 'round';
        ctx.stroke();
      });

      // Đệm nảy Pinball đỏ với vòng tròn trắng bên trong (Chuẩn Ảnh 2, 3)
      bumpers.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#F43F5E';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#9F1239';
        ctx.stroke();

        // Vòng tròn trắng giữa đệm
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 0.5, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      });

      // Tiêu đề các chặng (Chặng 1, Chặng 2...)
      stages.forEach((stg) => {
        ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
        ctx.fillRect(width / 2 - 120, stg.y - 12, 240, 24);
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.strokeRect(width / 2 - 120, stg.y - 12, 240, 24);

        ctx.fillStyle = '#334155';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(stg.title, width / 2, stg.y + 4);
      });

      // VẠCH XUẤT PHÁT VÀ MỞ THANH GẠT
      if (gateLocked) {
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#EF4444';
        ctx.beginPath();
        ctx.moveTo(margin, startY + 45);
        ctx.lineTo(width - margin, startY + 45);
        ctx.stroke();
      }

      // VẠCH ĐÍCH CỜ CA-RÔ ĐEN TRẮNG & CHỮ "ĐÍCH" ĐỎ (CHUẨN ẢNH 4)
      const squareSize = 16;
      const finishBarW = width - margin * 2;
      const startBarX = margin;

      for (let bx = startBarX; bx < startBarX + finishBarW; bx += squareSize) {
        const isBlack = Math.floor(bx / squareSize) % 2 === 0;
        ctx.fillStyle = isBlack ? '#0F172A' : '#FFFFFF';
        ctx.fillRect(bx, finishY - 8, squareSize, 16);
      }
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.strokeRect(startBarX, finishY - 8, finishBarW, 16);

      // Chữ "ĐÍCH" màu đỏ rực hai bên vạch đích
      ctx.fillStyle = '#EF4444';
      ctx.font = 'black 20px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('ĐÍCH', startBarX - 15, finishY + 6);
      ctx.textAlign = 'left';
      ctx.fillText('ĐÍCH', startBarX + finishBarW + 15, finishY + 6);

      // VẼ CÁC VIÊN BI (MARBLES) VỚI BADGE VIẾT TẮT & TÊN NỔI (CHUẨN ẢNH 2, 3, 4)
      marbles.forEach((m) => {
        const { x, y, radius, color, number, initials, studentName } = m;

        // Thân viên bi
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color.main || '#3B82F6';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        // Chữ initials hoặc số áo giữa viên bi
        ctx.fillStyle = color.text || '#FFFFFF';
        ctx.font = `bold ${Math.round(radius * 0.9)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(number), x, y);

        // Nhãn tên nổi trên đầu viên bi (Background trắng bo tròn)
        if (studentName) {
          ctx.font = 'bold 11px sans-serif';
          const tW = ctx.measureText(studentName).width;
          const bgW = tW + 10;
          const bgH = 18;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x - bgW / 2, y - radius - 22, bgW, bgH, 6);
          else ctx.rect(x - bgW / 2, y - radius - 22, bgW, bgH);
          ctx.fill();
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#0F172A';
          ctx.fillText(studentName, x, y - radius - 13);
        }
      });

      ctx.restore();

      // THROTTLE REACT UPDATE CHO LEADERBOARD & MINIMAP (~5 FPS ĐỂ KHÔNG GIẬT)
      if (currentTime - lastReactUpdateRef.current > 180) {
        lastReactUpdateRef.current = currentTime;
        if (onUpdateMarbles) onUpdateMarbles([...marbles]);
        if (onCameraUpdate) {
          onCameraUpdate({
            cameraY: camY,
            viewportHeight: viewportH,
            trackHeight,
          });
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gateLocked, isPaused, soundEnabled]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-100">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
