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

  const nextReleaseIdxRef = useRef(0);
  const lastReleaseTimeRef = useRef(0);

  // Dùng Ref đồng bộ tức thì cho gateLocked & isPaused để không bị lệch closure state trong 60 FPS loop
  const gateLockedRef = useRef(gateLocked);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    gateLockedRef.current = gateLocked;
  }, [gateLocked]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Khởi tạo 30 viên bi trên vạch xuất phát
  const initMarbles = (trackLayout, canvasWidth) => {
    if (!trackLayout) return [];

    const count = racerStudents.length;
    const radius = 13;
    const gateY = trackLayout.gateY || 180;
    const margin = trackLayout.margin + 30;
    const usableWidth = canvasWidth - margin * 2;
    const colCount = Math.min(8, count);
    const rowGap = radius * 3.2;
    const colGap = usableWidth / (colCount || 1);

    const marbles = racerStudents.map((st, idx) => {
      const row = Math.floor(idx / colCount);
      const col = idx % colCount;

      const xOffset = row % 2 === 1 ? colGap * 0.25 : 0;
      const startX = margin + col * colGap + colGap / 2 + xOffset;
      const startY = gateY - radius - 20 - row * rowGap;
      const colorObj = MARBLE_COLORS[idx % MARBLE_COLORS.length];

      return {
        id: st.id || `m_${idx}`,
        number: idx + 1,
        studentName: st.full_name,
        initials: getStudentInitials(st.full_name),
        row,
        startX,
        startY,
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        radius,
        color: colorObj,
        isReleased: false,
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
    nextReleaseIdxRef.current = 0;
    lastReleaseTimeRef.current = 0;
    return marbles;
  };

  const studentIdsKey = racerStudents.map((s) => s.id).join(',');

  // Resize canvas & nạp track (chỉ reset marbles nếu cổng đang khóa hoặc chưa khởi tạo)
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
      if (gateLockedRef.current || !marblesRef.current || marblesRef.current.length === 0) {
        initMarbles(layout, width);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [studentIdsKey]);

  // Reset khi khóa cổng lại
  useEffect(() => {
    if (gateLocked && trackRef.current && canvasRef.current) {
      initMarbles(trackRef.current, canvasRef.current.width);
    }
  }, [gateLocked]);

  // VÒNG LẶP MÔ PHỎNG VẬT LÝ NỘI BỘ 60 FPS XỔ DỐC LẦN LƯỢT TỪNG VIÊN BI
  useEffect(() => {
    lastTimeRef.current = performance.now();

    const loop = (currentTime) => {
      animFrameRef.current = requestAnimationFrame(loop);

      if (isPausedRef.current) {
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

      const { width, trackHeight, gateY, finishY, margin, walls, bumpers, pegs, stages } = layout;
      const viewportH = canvas.height;
      const isLocked = gateLockedRef.current;

      const marbles = marblesRef.current;

      // XỔ DỐC LẦN LƯỢT TỪNG VIÊN BI (THẢ MỖI 160ms MỘT VIÊN BI XUẤT PHÁT)
      if (!isLocked) {
        if (!startTimeRef.current) {
          startTimeRef.current = currentTime;
          nextReleaseIdxRef.current = 0;
          lastReleaseTimeRef.current = currentTime - 200;
        }

        const releaseIntervalMs = 160;
        if (
          nextReleaseIdxRef.current < marbles.length &&
          currentTime - lastReleaseTimeRef.current >= releaseIntervalMs
        ) {
          const mToRelease = marbles[nextReleaseIdxRef.current];
          if (mToRelease && !mToRelease.isReleased) {
            mToRelease.isReleased = true;
            mToRelease.x = width / 2 + (Math.random() - 0.5) * (width * 0.2);
            mToRelease.y = gateY + 5;
            mToRelease.vy = 280 + Math.random() * 80;
            mToRelease.vx = (Math.random() - 0.5) * 80;
            if (soundEnabled && Math.random() < 0.4) playClick();
          }
          nextReleaseIdxRef.current += 1;
          lastReleaseTimeRef.current = currentTime;
        }
      }

      // 1. CẬP NHẬT VẬT LÝ CÁC VIÊN BI ĐÃ THẢ (TRỌNG TRƯỜNG 1400 px/s^2 RƠI DỒN DẬP)
      const gravity = 1400;

      // Tìm vị trí viên bi dẫn đầu trong số các viên đã được thả & chưa về đích
      let maxReleasedY = 0;
      let leaderId = null;

      marbles.forEach((m) => {
        if (m.isReleased && !m.isFinished && m.y > maxReleasedY) {
          maxReleasedY = m.y;
          leaderId = m.id;
        }
      });

      // Camera cuộn mượt theo viên bi dẫn đầu trên các tầng dốc
      const targetCamY = Math.max(
        0,
        Math.min(trackHeight - viewportH, (maxReleasedY || gateY) - viewportH * 0.35)
      );
      cameraYRef.current += (targetCamY - cameraYRef.current) * 0.1;
      const camY = cameraYRef.current;

      marbles.forEach((m) => {
        if (!m.isReleased || m.isFinished) return;

        m.vy += gravity * dt;
        m.vx *= 0.992;
        m.vy *= 0.998;

        if (m.vy < 60) m.vy = 60;

        m.x += m.vx * dt;
        m.y += m.vy * dt;

        // Va chạm đệm nảy pinball
        bumpers.forEach((b) => {
          if (checkBumperCollision(m, b)) {
            if (soundEnabled && Math.random() < 0.25) playClick();
          }
        });

        // Va chạm tường & dốc trượt
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

      // Va chạm bi - bi giữa các viên đã được thả
      for (let i = 0; i < marbles.length; i++) {
        if (!marbles[i].isReleased || marbles[i].isFinished) continue;
        for (let j = i + 1; j < marbles.length; j++) {
          if (!marbles[j].isReleased || marbles[j].isFinished) continue;
          checkMarbleCollision(marbles[i], marbles[j]);
        }
      }

      // 2. VẼ NỀN GIẤY KẺ Ô TẬP HỌC SINH (CHUẨN ẢNH 2, 3, 4, 6)
      ctx.save();
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, width, viewportH);

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

      // DỊCH CHUYỂN TOÀN BỘ CỌ VẼ THEO CAMERA Y
      ctx.translate(0, -camY);

      // Tường biên Navy Blue (Chuẩn ẢNH 2, 3, 6)
      walls.forEach((w) => {
        ctx.beginPath();
        ctx.moveTo(w.x1, w.y1);
        ctx.lineTo(w.x2, w.y2);
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#1E3A8A';
        ctx.lineCap = 'round';
        ctx.stroke();
      });

      // Bánh đệm nảy Pinball màu đỏ rực
      bumpers.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#F43F5E';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#9F1239';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 0.5, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      });

      // Tiêu đề các chặng
      stages.forEach((stg) => {
        ctx.fillStyle = 'rgba(241, 245, 249, 0.92)';
        ctx.fillRect(width / 2 - 130, stg.y - 12, 260, 24);
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.strokeRect(width / 2 - 130, stg.y - 12, 260, 24);

        ctx.fillStyle = '#334155';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(stg.title, width / 2, stg.y + 4);
      });

      // VẠCH THANH GẠT XUẤT PHÁT MÀU ĐỎ (KHI KHÓA CỔNG)
      if (isLocked) {
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#EF4444';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(margin, gateY);
        ctx.lineTo(width - margin, gateY);
        ctx.stroke();
      }

      // VẠCH ĐÍCH CỜ CA-RÔ ĐEN TRẮNG & CHỮ "ĐÍCH" ĐỎ
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

      ctx.fillStyle = '#EF4444';
      ctx.font = 'black 20px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('ĐÍCH', startBarX - 15, finishY + 6);
      ctx.textAlign = 'left';
      ctx.fillText('ĐÍCH', startBarX + finishBarW + 15, finishY + 6);

      // VẼ CÁC VIÊN BI (VIÊN CHỜ XUẤT PHÁT VÀ VIÊN ĐANG XỔ DỐC)
      marbles.forEach((m) => {
        const { x, y, radius, color, number, studentName, id, isReleased } = m;
        const isLeader = id === leaderId;

        // Vòng hào quang phát sáng vàng nổi bật cho viên bi dẫn đầu trên dốc
        if (isLeader && isReleased && !isLocked) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#FACC15';
          ctx.stroke();
        }

        // Thân viên bi
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color.main || '#3B82F6';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = isLeader && isReleased ? '#FACC15' : '#FFFFFF';
        ctx.stroke();

        // Số áo giữa viên bi
        ctx.fillStyle = color.text || '#FFFFFF';
        ctx.font = `bold ${Math.round(radius * 0.9)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(number), x, y);

        // Nhãn tên nổi trên đầu viên bi
        if (studentName) {
          ctx.font = 'bold 11px sans-serif';
          const tW = ctx.measureText(studentName).width;
          const bgW = tW + 10;
          const bgH = 18;

          ctx.fillStyle = isLeader && isReleased ? '#FEF08A' : 'rgba(255, 255, 255, 0.92)';
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x - bgW / 2, y - radius - 22, bgW, bgH, 6);
          else ctx.rect(x - bgW / 2, y - radius - 22, bgW, bgH);
          ctx.fill();
          ctx.strokeStyle = isLeader && isReleased ? '#EAB308' : '#CBD5E1';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = isLeader && isReleased ? '#854D0E' : '#0F172A';
          ctx.fillText(studentName, x, y - radius - 13);
        }
      });

      ctx.restore();

      // CẬP NHẬT DỮ LIỆU ĐẾN LEADERBOARD & MINIMAP (~5 FPS)
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
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-100">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
