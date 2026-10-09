import React, { useRef, useEffect } from 'react';
import {
  generateFullStageTrack,
  checkBumperCollision,
  checkPegCollision,
  checkSpinnerCollision,
  checkWallCollision,
  checkMarbleCollision,
  MARBLE_COLORS,
  getStudentInitials,
  formatRaceTime,
} from './marblePhysics';
import { playClick, playFunnelClack } from '../../../../utils/soundEffects';

export default function MarbleRaceCanvas({
  racerStudents = [],
  trackType = 'bottleneck',
  spinnerSpeedMode = 'normal',
  gateLocked = true,
  isPaused = false,
  soundEnabled = true,
  onWinnerFound,
  onMarbleFinish,
  onUpdateMarbles,
  onCameraUpdate,
  onLogEvent,
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

  const lastLeaderIdRef = useRef(null);
  const lastLogTimeRef = useRef(0);

  // Dùng Ref đồng bộ tức thì cho gateLocked & isPaused
  const gateLockedRef = useRef(gateLocked);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    gateLockedRef.current = gateLocked;
  }, [gateLocked]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Khởi tạo các viên bi trên vạch xuất phát
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
    lastLeaderIdRef.current = null;
    lastLogTimeRef.current = 0;
    return marbles;
  };

  const studentIdsKey = racerStudents.map((s) => s.id).join(',') + `_${trackType}`;

  // Resize canvas & nạp track (chỉ reset marbles nếu cổng đang khóa hoặc chưa khởi tạo)
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;

      const layout = generateFullStageTrack(width, trackType);
      trackRef.current = layout;
      if (gateLockedRef.current || !marblesRef.current || marblesRef.current.length === 0) {
        initMarbles(layout, width);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [studentIdsKey, trackType]);

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

      const { width, trackHeight, gateY, finishY, margin, walls, bumpers, pegs, spinners = [], stages } = layout;
      const viewportH = canvas.height;
      const isLocked = gateLockedRef.current;

      const marbles = marblesRef.current;

      // XỔ DỐC NHANH DỒN DẬP (THẢ MỖI 85ms MỘT VIÊN BI XUẤT PHÁT)
      if (!isLocked) {
        if (!startTimeRef.current) {
          startTimeRef.current = currentTime;
          nextReleaseIdxRef.current = 0;
          lastReleaseTimeRef.current = currentTime - 100;
        }

        const releaseIntervalMs = 85;
        if (
          nextReleaseIdxRef.current < marbles.length &&
          currentTime - lastReleaseTimeRef.current >= releaseIntervalMs
        ) {
          const mToRelease = marbles[nextReleaseIdxRef.current];
          if (mToRelease && !mToRelease.isReleased) {
            mToRelease.isReleased = true;
            mToRelease.x = width / 2 + (Math.random() - 0.5) * (width * 0.32);
            mToRelease.y = gateY + 5;
            mToRelease.vy = 240 + Math.random() * 60;
            mToRelease.vx = (Math.random() - 0.5) * 140;
            if (soundEnabled && Math.random() < 0.4) playClick();
          }
          nextReleaseIdxRef.current += 1;
          lastReleaseTimeRef.current = currentTime;
        }
      }

      // 1. CẬP NHẬT VẬT LÝ CÁC VIÊN BI (CHẶNG ĐẦU CHẬM RÃI - CHẶNG 5,6,7 TĂNG TỐC BỨT PHÁ)
      let maxReleasedY = 0;
      let leaderId = null;

      marbles.forEach((m) => {
        if (m.isReleased && !m.isFinished && m.y > maxReleasedY) {
          maxReleasedY = m.y;
          leaderId = m.id;
        }
      });

      // GHI LOG DIỄN BIẾN SỰ THAY ĐỔI THỨ HẠNG NỔI BẬT (LIVE RACE LOGS CHUẨN THẦY YÊU CẦU)
      if (
        leaderId &&
        leaderId !== lastLeaderIdRef.current &&
        currentTime - lastLogTimeRef.current > 1400
      ) {
        const leaderObj = marbles.find((m) => m.id === leaderId);
        if (leaderObj && leaderObj.y > gateY + 140 && !leaderObj.isFinished) {
          lastLeaderIdRef.current = leaderId;
          lastLogTimeRef.current = currentTime;

          const remainingMs = Math.max(0, 20000 - (currentTime - (startTimeRef.current || currentTime)));
          const timeStr = formatRaceTime(remainingMs);

          let logText = '';
          if (leaderObj.y >= finishY - 350) {
            logText = `🌀 [${leaderObj.studentName}] kẹt phễu Stage 7, bất ngờ vươn lên dẫn đầu!`;
          } else if (leaderObj.y >= finishY - 750) {
            logText = `⚡ [${leaderObj.studentName}] bứt phá rượt đuổi cực nhanh tại Chặng 5-6!`;
          } else {
            logText = `🔥 [${leaderObj.studentName}] bứt phá vươn lên Hạng 1!`;
          }

          if (onLogEvent) onLogEvent({ time: timeStr, text: logText });
        }
      }

      // Camera cuộn mượt theo viên bi dẫn đầu
      const targetCamY = Math.max(
        0,
        Math.min(trackHeight - viewportH, (maxReleasedY || gateY) - viewportH * 0.35)
      );
      cameraYRef.current += (targetCamY - cameraYRef.current) * 0.1;
      const camY = cameraYRef.current;

      // Hệ số tốc độ cánh quạt
      let spMult = 1.0;
      if (spinnerSpeedMode === 'slow') spMult = 0.45;
      if (spinnerSpeedMode === 'fast') spMult = 1.85;

      marbles.forEach((m) => {
        if (!m.isReleased || m.isFinished) return;

        // Chặng 1-4: Trọng trường 850 px/s^2 (Trượt chậm dễ đọc tên). Chặng 5-7 (y >= finishY - 750): Trọng trường 1850 px/s^2 (Tăng tốc thần tốc!)
        const isLowerStage = m.y >= finishY - 750;
        const currentGravity = isLowerStage ? 1850 : 850;

        m.vy += currentGravity * dt;
        if (isLowerStage) m.vy += 420 * dt; // Bứt tốc thần tốc ở chặng 5,6,7!

        m.vx *= 0.992;
        m.vy *= 0.998;

        if (m.vy < 50) m.vy = 50;

        // Xoáy hỗn loạn phễu cổ chai Stage 7 (Vortex Swirl Chaos - Chuẩn kịch tính 100%)
        if (m.y >= finishY - 320 && m.y < finishY - 50) {
          const centerDx = width / 2 - m.x;
          m.vx += centerDx * 2.8 * dt; // Hút bi xoáy vào giữa phễu

          // Xoáy chao đảo ngẫu nhiên khiến thứ hạng đảo lộn liên tục
          m.vx += (Math.random() - 0.5) * 160 * dt;
          m.vy += (Math.random() - 0.5) * 120 * dt;
        }

        m.x += m.vx * dt;
        m.y += m.vy * dt;

        // Va chạm đệm nảy Pinball
        bumpers.forEach((b) => {
          if (checkBumperCollision(m, b)) {
            if (soundEnabled && Math.random() < 0.3) playClick();
          }
        });

        // Va chạm chốt Plinko
        pegs.forEach((p) => {
          if (checkPegCollision(m, p)) {
            if (soundEnabled && Math.random() < 0.25) playClick();
          }
        });

        // Va chạm Cánh quạt xoay 4 cánh (+) tại Stage 4 & Stage 7 phễu cổ chai
        spinners.forEach((sp) => {
          const effectiveSpinner = { ...sp, speed: (sp.speed || 2.5) * spMult };
          if (checkSpinnerCollision(m, effectiveSpinner)) {
            if (soundEnabled) playFunnelClack();
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
          if (checkMarbleCollision(marbles[i], marbles[j])) {
            if (soundEnabled && marbles[i].y >= finishY - 400 && Math.random() < 0.15) {
              playFunnelClack(); // Tiếng lốc cốc giòn giã khi bi dồn cục kẹt phễu Stage 7!
            }
          }
        }
      }

      // 2. VẼ NỀN GIẤY KẺ Ô TẬP HỌC SINH (CHUẨN ẢNH THẦY GỬI)
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

      // Tường biên Navy Blue (Chuẩn ẢNH THẦY GỬI)
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

      // Chốt cản Plinko
      pegs.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#64748B';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#334155';
        ctx.stroke();
      });

      // Cánh quạt xoay 4 cánh (+) tại Stage 4 & Stage 7 Phễu cổ chai (Chuẩn 100% Ảnh Thầy gửi!)
      spinners.forEach((sp) => {
        const effectiveSpeed = (sp.speed || 2.5) * spMult;
        sp.angle = (sp.angle || 0) + effectiveSpeed * dt;

        ctx.save();
        ctx.translate(sp.x, sp.y);

        // 4 cánh quạt (+)
        for (let i = 0; i < (sp.numBlades || 4); i++) {
          const bAngle = sp.angle + (i * Math.PI * 2) / (sp.numBlades || 4);
          const bx = Math.cos(bAngle) * sp.radius;
          const by = Math.sin(bAngle) * sp.radius;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(bx, by);
          ctx.lineWidth = 14;
          ctx.strokeStyle = sp.color || '#F97316';
          ctx.lineCap = 'round';
          ctx.stroke();

          ctx.lineWidth = 3;
          ctx.strokeStyle = '#FFFFFF';
          ctx.stroke();
        }

        // Tâm trục quay tròn
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#0F172A';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#F97316';
        ctx.stroke();

        ctx.restore();
      });

      // Tiêu đề các chặng
      stages.forEach((stg) => {
        ctx.fillStyle = 'rgba(241, 245, 249, 0.92)';
        ctx.fillRect(width / 2 - 140, stg.y - 12, 280, 24);
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.strokeRect(width / 2 - 140, stg.y - 12, 280, 24);

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
  }, [spinnerSpeedMode]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-100">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
