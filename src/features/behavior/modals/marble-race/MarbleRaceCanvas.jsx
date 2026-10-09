import React, { useRef, useEffect, useState } from 'react';
import {
  generateTrackLayout,
  checkPegCollision,
  checkWallCollision,
  checkMarbleCollision,
  draw3DMarble,
  MARBLE_COLORS,
} from './marblePhysics';
import { playClick, playWinner, playCorrect } from '../../../../utils/soundEffects';

export default function MarbleRaceCanvas({
  racerStudents = [],
  presetId = 'plinko',
  gateLocked = true,
  isPaused = false,
  soundEnabled = true,
  showLabels = true,
  onWinnerFound,
  onOvertake,
  onMarbleFinish,
  onUpdateMarbles,
  onTrackHeightReady,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // References cho loop vật lý
  const marblesRef = useRef([]);
  const trackRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);
  const winnerDeclaredRef = useRef(false);
  const finishCounterRef = useRef(0);

  // Khởi tạo danh sách viên bi từ học sinh
  const initMarbles = (trackLayout, canvasWidth) => {
    if (!trackLayout) return [];

    const count = racerStudents.length;
    const radius = Math.max(10, Math.min(16, Math.floor(canvasWidth / (count * 1.5 || 20))));
    const startY = trackLayout.startY - 35;
    const margin = trackLayout.margin + 20;
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
        x,
        y,
        vx: (Math.random() - 0.5) * 20,
        vy: 0,
        radius,
        color: colorObj,
        isFinished: false,
        finishRank: null,
        finishTime: null,
      };
    });

    marblesRef.current = marbles;
    winnerDeclaredRef.current = false;
    finishCounterRef.current = 0;
    return marbles;
  };

  // Resize canvas theo kích thước container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;

      // Nạp lại cấu trúc đường đua
      const layout = generateTrackLayout(presetId, width, height);
      trackRef.current = layout;
      if (onTrackHeightReady) onTrackHeightReady(height);

      initMarbles(layout, width);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [presetId, racerStudents]);

  // VÒNG LẶP MÔ PHỎNG VẬT LÝ 60 FPS
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

      const { startY, finishY, pegs, walls, boosters, funnels } = layout;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. VẼ NỀN ĐƯỜNG ĐUA LẬP TRÌNH (NEON GRID RAYS)
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Tường biên phát sáng nhẹ
      walls.forEach((w) => {
        ctx.beginPath();
        ctx.moveTo(w.x1, w.y1);
        ctx.lineTo(w.x2, w.y2);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#38BDF8';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0284C7';
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Tấm tăng tốc (Boosters)
      boosters.forEach((b) => {
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.label || 'TĂNG TỐC', b.x + b.w / 2, b.y + b.h / 2 + 3);
      });

      // Chốt va chạm (Pegs)
      pegs.forEach((peg) => {
        const pGrad = ctx.createRadialGradient(
          peg.x - 3,
          peg.y - 3,
          1,
          peg.x,
          peg.y,
          peg.radius
        );
        pGrad.addColorStop(0, '#E0F2FE');
        pGrad.addColorStop(1, peg.color || '#38BDF8');

        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
        ctx.fillStyle = pGrad;
        ctx.shadowBlur = 6;
        ctx.shadowColor = peg.color || '#38BDF8';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // CỔNG XUẤT PHÁT (STARTING GATE)
      ctx.save();
      if (gateLocked) {
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#EF4444';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#DC2626';
        ctx.beginPath();
        ctx.moveTo(layout.margin, startY);
        ctx.lineTo(canvas.width - layout.margin, startY);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔒 CỔNG XUẤT PHÁT ĐANG KHÓA', canvas.width / 2, startY - 12);
      } else {
        // Cổng mở nghiêng
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#22C55E';
        ctx.beginPath();
        ctx.moveTo(layout.margin, startY);
        ctx.lineTo(layout.margin + 40, startY - 30);
        ctx.moveTo(canvas.width - layout.margin, startY);
        ctx.lineTo(canvas.width - layout.margin - 40, startY - 30);
        ctx.stroke();
      }
      ctx.restore();

      // VẠCH ĐÍCH (FINISH LINE GATE)
      ctx.save();
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#FACC15';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#EAB308';
      ctx.beginPath();
      ctx.moveTo(layout.margin, finishY);
      ctx.lineTo(canvas.width - layout.margin, finishY);
      ctx.stroke();

      ctx.fillStyle = '#FACC15';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏁 VẠCH ĐÍCH (FINISH LINE)', canvas.width / 2, finishY + 22);
      ctx.restore();

      // 2. CẬP NHẬT MÔ PHỎNG VẬT LÝ CÁC VIÊN BI
      const marbles = marblesRef.current;
      const gravity = 800; // Gia tốc trọng trường px/s^2

      // Tìm viên bi đang dẫn đầu
      let leaderId = null;
      let maxY = -9999;
      marbles.forEach((m) => {
        if (!m.isFinished && m.y > maxY) {
          maxY = m.y;
          leaderId = m.id;
        }
      });

      marbles.forEach((m) => {
        if (m.isFinished) return;

        if (!gateLocked) {
          // Áp dụng gia tốc trọng trường
          m.vy += gravity * dt;
          m.vx *= 0.992; // Ma sát không khí
          m.vy *= 0.995;

          m.x += m.vx * dt;
          m.y += m.vy * dt;
        }

        // Khóa trên cổng nếu cổng đang đóng
        if (gateLocked && m.y + m.radius > startY - 4) {
          m.y = startY - 4 - m.radius;
          m.vy = 0;
        }

        // Va chạm với chốt pin
        pegs.forEach((peg) => {
          if (checkPegCollision(m, peg)) {
            if (soundEnabled && Math.random() < 0.15) {
              playClick();
            }
          }
        });

        // Va chạm với tường
        walls.forEach((wall) => {
          checkWallCollision(m, wall);
        });

        // Va chạm với tấm tăng tốc
        boosters.forEach((b) => {
          if (
            m.x >= b.x &&
            m.x <= b.x + b.w &&
            m.y >= b.y &&
            m.y <= b.y + b.h
          ) {
            m.vy += b.vy || 200;
          }
        });

        // KIỂM TRA VỀ ĐÍCH
        if (m.y >= finishY && !m.isFinished) {
          m.isFinished = true;
          finishCounterRef.current += 1;
          m.finishRank = finishCounterRef.current;
          m.finishTime = Date.now();

          if (onMarbleFinish) {
            onMarbleFinish(m, m.finishRank);
          }

          // NGƯỜI VỀ ĐÍCH ĐẦU TIÊN!
          if (!winnerDeclaredRef.current && m.finishRank === 1) {
            winnerDeclaredRef.current = true;
            if (onWinnerFound) {
              onWinnerFound(m);
            }
          }
        }
      });

      // VA CHẠM GIỮA CÁC VIÊN BI (MARBLE VS MARBLE)
      for (let i = 0; i < marbles.length; i++) {
        for (let j = i + 1; j < marbles.length; j++) {
          checkMarbleCollision(marbles[i], marbles[j]);
        }
      }

      // 3. VẼ TẤT CẢ VIÊN BI
      marbles.forEach((m) => {
        draw3DMarble(ctx, m, {
          showLabels,
          isLeader: m.id === leaderId,
        });
      });

      // Truyền dữ liệu về cho Bảng xếp hạng và Minimap
      if (onUpdateMarbles) {
        onUpdateMarbles([...marbles]);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gateLocked, isPaused, soundEnabled, showLabels]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-950">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
