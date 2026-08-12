/* ==========================================================================
   Radian Lab - Dynamic Canvas Engine
   Interactive Math Renderers for Radian Measure Concepts
   ========================================================================== */

const MathCanvas = (function() {
  'use strict';

  // Utility to handle HiDPI displays
  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width: rect.width, height: rect.height };
  }

  // Draw grid background on canvas
  function drawGrid(ctx, width, height) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const step = 20;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  /* ==========================================================================
     1. DEFINITION OF RADIAN & UNROLLING ARC ENGINE
     ========================================================================== */
  function renderDefinition(canvasId, params) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);

    const r = params.r || 120; // pixel radius scale
    const thetaRad = params.thetaRad || 1.0; // theta in radians
    const unrollProgress = params.unrollProgress || 0; // 0 to 1

    const cx = width * 0.35;
    const cy = height * 0.55;

    // Draw Main Circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill Angle Sector
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, -thetaRad, 0, false); // counter-clockwise in math (Canvas 0 is right, negative is up)
    ctx.closePath();
    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.fill();

    // Initial Radius OP (along positive x-axis)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r, cy);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Label Radius OP
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('r', cx + r / 2, cy + 18);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('O', cx - 18, cy + 18);
    ctx.fillText('P', cx + r + 8, cy + 5);

    // Terminal Radius OQ
    const qx = cx + r * Math.cos(-thetaRad);
    const qy = cy + r * Math.sin(-thetaRad);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(qx, qy);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillText('Q', qx + 8, qy - 5);

    // Highlight Arc PQ on circle (or animated unrolling)
    const currentArcAngle = thetaRad * (1 - unrollProgress);
    if (currentArcAngle > 0.001) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, -currentArcAngle, 0, false);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    // Angle Arc & Text
    const angleArcRadius = 35;
    ctx.beginPath();
    ctx.arc(cx, cy, angleArcRadius, -thetaRad, 0, false);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 13px Inter, sans-serif';
    const textAngle = -thetaRad / 2;
    ctx.fillText(`${thetaRad.toFixed(2)} rad`, cx + 45 * Math.cos(textAngle), cy + 45 * Math.sin(textAngle));

    // Baseline Ruler for Unrolling Arc
    const baselineY = height - 40;
    const baselineStartX = width * 0.08;
    const baselineEndX = width * 0.92;

    ctx.beginPath();
    ctx.moveTo(baselineStartX, baselineY);
    ctx.lineTo(baselineEndX, baselineY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tick marks for units of r on baseline
    ctx.font = '12px Fira Code, monospace';
    ctx.fillStyle = '#94a3b8';
    for (let mult = 0; mult <= 4; mult += 1) {
      const tx = baselineStartX + mult * r;
      if (tx <= baselineEndX) {
        ctx.beginPath();
        ctx.moveTo(tx, baselineY - 6);
        ctx.lineTo(tx, baselineY + 6);
        ctx.strokeStyle = mult === 1 ? '#6366f1' : 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();
        ctx.fillText(`${mult}r`, tx - 6, baselineY + 22);
      }
    }

    // Draw Unrolled Arc Line Segment
    const arcLengthPx = r * thetaRad;
    const unrolledLen = arcLengthPx * unrollProgress;
    if (unrollProgress > 0) {
      ctx.beginPath();
      ctx.moveTo(baselineStartX, baselineY);
      ctx.lineTo(baselineStartX + unrolledLen, baselineY);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Label on unrolled arc
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText(`s = ${thetaRad.toFixed(2)}r`, baselineStartX + unrolledLen / 2 - 25, baselineY - 12);
    }
  }

  /* ==========================================================================
     2. CONVERTER & QUADRANT ENGINE
     ========================================================================== */
  function renderQuadrant(canvasId, params) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.35;

    // Coordinate Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    
    // X Axis
    ctx.beginPath();
    ctx.moveTo(30, cy);
    ctx.lineTo(width - 30, cy);
    ctx.stroke();
    
    // Y Axis
    ctx.beginPath();
    ctx.moveTo(cx, 30);
    ctx.lineTo(cx, height - 30);
    ctx.stroke();

    // Unit Circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Quadrant Labels
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillText('QI', cx + r * 0.5, cy - r * 0.5);
    ctx.fillText('QII', cx - r * 0.65, cy - r * 0.5);
    ctx.fillText('QIII', cx - r * 0.7, cy + r * 0.6);
    ctx.fillText('QIV', cx + r * 0.5, cy + r * 0.6);

    // Angle theta
    const thetaRad = params.thetaRad || 0;
    const deg = (thetaRad * 180 / Math.PI).toFixed(1);

    // Terminal ray
    const tx = cx + r * 1.1 * Math.cos(-thetaRad);
    const ty = cy + r * 1.1 * Math.sin(-thetaRad);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Terminal point on circle
    const px = cx + r * Math.cos(-thetaRad);
    const py = cy + r * Math.sin(-thetaRad);
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();

    // Spiral for angle/coterminal loops
    ctx.beginPath();
    const loops = Math.abs(thetaRad) / (2 * Math.PI);
    const totalSteps = 100;
    for (let i = 0; i <= totalSteps; i++) {
      const t = i / totalSteps;
      const currentTheta = thetaRad * t;
      const currentR = 30 + (r * 0.3) * (currentTheta / (2 * Math.PI * Math.max(1, loops)));
      const sx = cx + Math.max(10, currentR) * Math.cos(-currentTheta);
      const sy = cy + Math.max(10, currentR) * Math.sin(-currentTheta);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Quadrant Special Angles Ticks
    const specialAngles = [
      { rad: 0, label: '0' },
      { rad: Math.PI / 6, label: 'π/6' },
      { rad: Math.PI / 4, label: 'π/4' },
      { rad: Math.PI / 3, label: 'π/3' },
      { rad: Math.PI / 2, label: 'π/2' },
      { rad: Math.PI, label: 'π' },
      { rad: 3 * Math.PI / 2, label: '3π/2' },
      { rad: 2 * Math.PI, label: '2π' }
    ];

    ctx.font = '12px Fira Code, monospace';
    specialAngles.forEach(sa => {
      const ax = cx + (r + 18) * Math.cos(-sa.rad);
      const ay = cy + (r + 18) * Math.sin(-sa.rad);
      ctx.fillStyle = Math.abs((thetaRad % (2 * Math.PI)) - sa.rad) < 0.05 ? '#10b981' : '#94a3b8';
      ctx.fillText(sa.label, ax - 10, ay + 4);
    });
  }

  /* ==========================================================================
     3. ARC LENGTH & SECTOR AREA LAB ENGINE
     ========================================================================== */
  function renderSectorLab(canvasId, params) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);

    const rVal = params.radius || 10;
    const thetaRad = params.thetaRad || Math.PI / 3;

    // Scale radius to canvas
    const rPx = Math.min(width, height) * 0.35 * (rVal / 15);
    const cx = width * 0.4;
    const cy = height * 0.55;

    // Sector Arc & Area Fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rPx, -thetaRad, 0, false);
    ctx.closePath();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Highlight Arc s
    ctx.beginPath();
    ctx.arc(cx, cy, rPx, -thetaRad, 0, false);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Radius Lines
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(`r = ${rVal}`, cx + rPx / 2 - 10, cy + 20);

    // Calculated outputs text overlay on right side
    const sVal = (rVal * thetaRad).toFixed(2);
    const areaVal = (0.5 * rVal * rVal * thetaRad).toFixed(2);

    const panelX = width * 0.72;
    const panelY = height * 0.2;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(panelX - 15, panelY - 15, width * 0.25, 160, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('即時計算數據 (Live Output)', panelX, panelY + 10);

    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 15px Fira Code, monospace';
    ctx.fillText(`弧長 s = rθ = ${sVal}`, panelX, panelY + 45);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 15px Fira Code, monospace';
    ctx.fillText(`面積 A = (1/2)r²θ = ${areaVal}`, panelX, panelY + 80);

    const circleFraction = (thetaRad / (2 * Math.PI) * 100).toFixed(1);
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText(`佔圓周比: ${circleFraction}%`, panelX, panelY + 115);
  }

  /* ==========================================================================
     4. GOTHIC ARCH & ERATOSTHENES ENGINE
     ========================================================================== */
  function renderGothicArch(canvasId, params) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);

    const mode = params.mode || 'gothic'; // 'gothic' or 'eratosthenes'

    if (mode === 'gothic') {
      const r = params.r || 150; // arc radius
      const span = params.span || 150; // width AB between O1 and O2

      const cx = width / 2;
      const cy = height * 0.75;

      const o1x = cx - span / 2;
      const o2x = cx + span / 2;

      // Draw Baseline O1 O2
      ctx.beginPath();
      ctx.moveTo(width * 0.1, cy);
      ctx.lineTo(width * 0.9, cy);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Centers O1, O2
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(o1x, cy, 5, 0, 2 * Math.PI);
      ctx.arc(o2x, cy, 5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText('O₁', o1x - 15, cy + 20);
      ctx.fillText('O₂', o2x + 5, cy + 20);

      // Gothic Arcs
      // Arc BC from O1 (radius r, from 0 to top intersection C)
      // Top intersection height: h = sqrt(r^2 - (span/2)^2)
      if (r >= span / 2) {
        const h = Math.sqrt(r * r - (span / 2) * (span / 2));
        const cxPeak = cx;
        const cyPeak = cy - h;

        // Angle for Arc BC
        const angleBC = Math.atan2(-h, span / 2);

        // Arc 1: centered at O1, from angle 0 to angleBC
        ctx.beginPath();
        ctx.arc(o1x, cy, r, angleBC, 0, false);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Arc 2: centered at O2, from Math.PI to Math.PI - angleBC
        ctx.beginPath();
        ctx.arc(o2x, cy, r, Math.PI, Math.PI - angleBC, true);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Fill Arch Area
        ctx.beginPath();
        ctx.moveTo(o1x + r, cy);
        ctx.arc(o1x, cy, r, 0, angleBC, true);
        ctx.arc(o2x, cy, r, Math.PI - angleBC, Math.PI, true);
        ctx.closePath();
        ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.fill();

        // Label Apex C
        ctx.fillStyle = '#ffffff';
        ctx.fillText('C (頂點)', cxPeak - 20, cyPeak - 12);
        ctx.beginPath();
        ctx.arc(cxPeak, cyPeak, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#10b981';
        ctx.fill();
      }
    } else if (mode === 'eratosthenes') {
      // Eratosthenes Earth Estimation Diagram
      const cx = width * 0.35;
      const cy = height * 0.55;
      const R = 110; // Earth radius in px

      // Earth Circle
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.fill();

      // Earth Center O
      ctx.fillStyle = '#ffffff';
      ctx.fillText('O (球心)', cx - 15, cy + 20);
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Point B (Syene, 0 deg zenith sun) -> top of earth
      const angleB = -Math.PI / 2; // top
      const angleA = angleB + 7.2 * Math.PI / 180; // 7.2 deg offset

      const bx = cx + R * Math.cos(angleB);
      const by = cy + R * Math.sin(angleB);

      const ax = cx + R * Math.cos(angleA);
      const ay = cy + R * Math.sin(angleA);

      // Points A & B
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('B (亞斯文)', bx - 25, by - 10);
      ctx.fillText('A (亞歷山大)', ax + 10, ay - 10);

      // Radial lines from center O to A and B
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(bx, by - 30);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ax + 30 * Math.cos(angleA), ay + 30 * Math.sin(angleA));
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();

      // Parallel Sun Rays
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      
      // Ray 1 at B
      ctx.beginPath();
      ctx.moveTo(bx, by - 70);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Ray 2 at A
      ctx.beginPath();
      ctx.moveTo(ax, ay - 70);
      ctx.lineTo(ax, ay);
      ctx.stroke();

      // Arc AB (s = 800 km)
      ctx.beginPath();
      ctx.arc(cx, cy, R, angleB, angleA, false);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText('s = 800 km', ax + 15, (ay + by) / 2);

      // Angle theta = 7.2 deg = pi/25 rad
      ctx.fillStyle = '#10b981';
      ctx.fillText('θ = 7.2° = π/25 rad', cx + 10, cy - 30);
    }
  }

  /* ==========================================================================
     5. TRIGONOMETRIC RATIOS IN RADIANS ENGINE
     ========================================================================== */
  function renderTrig(canvasId, params) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);

    const thetaRad = params.thetaRad || Math.PI / 4;

    const cx = width * 0.25;
    const cy = height * 0.5;
    const r = 90;

    // Unit Circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Axes
    ctx.beginPath();
    ctx.moveTo(cx - r - 20, cy);
    ctx.lineTo(cx + r + 20, cy);
    ctx.moveTo(cx, cy - r - 20);
    ctx.lineTo(cx, cy + r + 20);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    // Point P(cos theta, sin theta)
    const px = cx + r * Math.cos(-thetaRad);
    const py = cy + r * Math.sin(-thetaRad);

    // Radius line OP
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cosine projection line (horizontal)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, cy);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Sine projection line (vertical)
    ctx.beginPath();
    ctx.moveTo(px, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Point P
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // Sine Curve Plot on right side
    const waveStartX = width * 0.55;
    const waveWidth = width * 0.4;
    const waveCy = cy;

    ctx.beginPath();
    ctx.moveTo(waveStartX, waveCy);
    ctx.lineTo(waveStartX + waveWidth, waveCy);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    ctx.beginPath();
    for (let x = 0; x <= waveWidth; x++) {
      const rad = (x / waveWidth) * 2 * Math.PI;
      const y = waveCy - r * Math.sin(rad);
      if (x === 0) ctx.moveTo(waveStartX + x, y);
      else ctx.lineTo(waveStartX + x, y);
    }
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Current angle point on sine wave
    const currentWaveX = waveStartX + (thetaRad / (2 * Math.PI)) * waveWidth;
    const currentWaveY = waveCy - r * Math.sin(thetaRad);

    ctx.beginPath();
    ctx.arc(currentWaveX, currentWaveY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#10b981';
    ctx.fill();

    // Connecting dashed line
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(currentWaveX, currentWaveY);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.fillText(`cos(${thetaRad.toFixed(2)}) = ${Math.cos(thetaRad).toFixed(3)}`, cx + 10, cy + 20);
    
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(`sin(${thetaRad.toFixed(2)}) = ${Math.sin(thetaRad).toFixed(3)}`, px + 10, (cy + py) / 2);
  }

  return {
    renderDefinition,
    renderQuadrant,
    renderSectorLab,
    renderGothicArch,
    renderTrig
  };
})();
