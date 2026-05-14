/* ============================================================
   SPACE SCENE · v2 · Planeta tipo Tierra + Drag a rotar
   Canvas 2D puro · sin librerías · 0 dependencias
   - Planeta con océanos azules, continentes simplificados, nubes y atmósfera
   - Click + drag (o touch) para rotar manualmente el planeta
   - Auto-rotación lenta cuando no se interactúa
   - Órbitas con datos REALES de Felix (Backend, n8n, Gemini, @felixBD04...)
   - Respeta prefers-reduced-motion
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('space-canvas');
  if (!canvas) return;

  const wrapper = canvas.closest('.hero__visual') || canvas.parentElement;
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const COLORS = {
    cyan: '#00F0FF', magenta: '#B026FF', yellow: '#FFE15C',
    green: '#00FF94', white: '#FFFFFF', deep: '#0A0E1A',
    ocean: '#1A4F8B', oceanDp: '#0C2A4F'
  };

  // Datos REALES de Felix orbitando
  const ORBITS = [
    { radius: 0.42, speed: 0.00040, tilt: 0.22, color: COLORS.cyan,
      labels: ['Backend', 'n8n', 'Gemini AI'], offset: 0 },
    { radius: 0.58, speed: -0.00028, tilt: -0.10, color: COLORS.magenta,
      labels: ['JavaScript', 'Python', 'Game Dev'], offset: Math.PI / 2 },
    { radius: 0.74, speed: 0.00020, tilt: 0.32, color: COLORS.yellow,
      labels: ['@felixBD04', 'Campus Lands', 'Colombia 🇨🇴'], offset: Math.PI / 1.4 }
  ];

  // Continentes simplificados (lat, lng en grados)
  const CONTINENTS = [
    // ÁFRICA + EUROPA
    [[[ 35,  -8], [ 55,   5], [ 60,  30], [ 45,  45], [ 30,  35],
      [ 12,  43], [  5,  40], [-15,  35], [-30,  20], [-35,  18],
      [-15,   0], [  5, -15], [ 18, -17], [ 30, -10]]],
    // ASIA
    [[[ 70,  30], [ 75,  90], [ 65, 140], [ 55, 155], [ 35, 140],
      [ 25, 120], [ 10, 105], [ 20,  80], [ 30,  70], [ 40,  60],
      [ 50,  45], [ 60,  40]]],
    // NORTEAMÉRICA
    [[[ 70,-160], [ 75,-100], [ 60, -70], [ 45, -60], [ 30, -85],
      [ 25,-105], [ 32,-115], [ 50,-125], [ 60,-145], [ 68,-155]]],
    // SUDAMÉRICA
    [[[ 12, -72], [  5, -50], [-10, -38], [-25, -45], [-40, -60],
      [-55, -68], [-50, -75], [-30, -72], [-10, -78], [  5, -78]]],
    // AUSTRALIA
    [[[-12, 130], [-15, 145], [-25, 153], [-37, 148], [-35, 138],
      [-32, 125], [-22, 115], [-15, 125]]]
  ];

  let W = 0, H = 0, cx = 0, cy = 0, scale = 1;
  let stars = [], codeParticles = [];
  let rotY = 0, rotX = 0.25, targetRotY = 0;
  let autoRotSpeed = 0.0015;
  let isDragging = false, lastDragX = 0, dragVelocity = 0;
  let mouseTiltX = 0, mouseTiltY = 0, tMouseTiltX = 0, tMouseTiltY = 0;
  let rafId = null, running = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    cx = W / 2; cy = H / 2;
    scale = Math.min(W, H) / 500;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    generateStars();
    generateCodeParticles();
  }

  function generateStars() {
    const count = Math.floor((W * H) / 1800);
    stars = [];
    for (let i = 0; i < count; i++) {
      const layer = Math.random() < 0.6 ? 0 : (Math.random() < 0.8 ? 1 : 2);
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: (0.3 + Math.random() * 1.1) * (layer + 1) * 0.7,
        layer, twinkleSeed: Math.random() * Math.PI * 2,
        color: Math.random() < 0.88 ? COLORS.white
          : (Math.random() < 0.5 ? COLORS.cyan : COLORS.magenta)
      });
    }
  }

  function generateCodeParticles() {
    const count = Math.max(6, Math.floor(W / 90));
    const chars = ['0', '1', '{', '}', '<', '>', '/', '$', '*'];
    codeParticles = [];
    for (let i = 0; i < count; i++) {
      codeParticles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        char: chars[Math.floor(Math.random() * chars.length)],
        opacity: 0.04 + Math.random() * 0.10,
        size: 8 + Math.random() * 6
      });
    }
  }

  function project(lat, lng, radius, planetX, planetY) {
    const latR = lat * Math.PI / 180;
    const lngR = (lng * Math.PI / 180) + rotY;
    const x3 = Math.cos(latR) * Math.sin(lngR);
    const y3 = Math.sin(latR);
    const z3 = Math.cos(latR) * Math.cos(lngR);
    const cosP = Math.cos(rotX), sinP = Math.sin(rotX);
    const y3p = y3 * cosP - z3 * sinP;
    const z3p = y3 * sinP + z3 * cosP;
    return { x: planetX + x3 * radius, y: planetY + y3p * radius, z: z3p, visible: z3p > -0.05 };
  }

  function drawNebula() {
    const g1 = ctx.createRadialGradient(cx * 0.6, cy * 0.4, 0, cx * 0.6, cy * 0.4, W * 0.7);
    g1.addColorStop(0, 'rgba(176, 38, 255, 0.12)');
    g1.addColorStop(0.4, 'rgba(176, 38, 255, 0.04)');
    g1.addColorStop(1, 'rgba(176, 38, 255, 0)');
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
    const g2 = ctx.createRadialGradient(cx * 1.4, cy * 1.5, 0, cx * 1.4, cy * 1.5, W * 0.6);
    g2.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
    g2.addColorStop(0.5, 'rgba(0, 240, 255, 0.03)');
    g2.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
  }

  function drawStars(t) {
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const px = mouseTiltX * (s.layer + 1) * 3;
      const py = mouseTiltY * (s.layer + 1) * 3;
      const twinkle = 0.5 + 0.5 * Math.sin(t * 0.001 + s.twinkleSeed);
      ctx.globalAlpha = (0.3 + 0.7 * twinkle) * (s.layer === 0 ? 0.5 : (s.layer === 1 ? 0.8 : 1));
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x + px, s.y + py, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawCodeParticles() {
    for (let i = 0; i < codeParticles.length; i++) {
      const p = codeParticles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = i % 2 === 0 ? COLORS.cyan : COLORS.magenta;
      ctx.font = `600 ${p.size}px "JetBrains Mono", monospace`;
      ctx.fillText(p.char, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawPlanet(t) {
    const radius = 75 * scale;
    const px = cx + mouseTiltX * 5;
    const py = cy + mouseTiltY * 5;

    // Atmósfera
    const atmoPulse = 1 + Math.sin(t * 0.0015) * 0.04;
    const atmoGrad = ctx.createRadialGradient(px, py, radius * 0.95, px, py, radius * 1.5 * atmoPulse);
    atmoGrad.addColorStop(0, 'rgba(0, 180, 255, 0.5)');
    atmoGrad.addColorStop(0.3, 'rgba(0, 240, 255, 0.18)');
    atmoGrad.addColorStop(0.7, 'rgba(176, 38, 255, 0.08)');
    atmoGrad.addColorStop(1, 'rgba(176, 38, 255, 0)');
    ctx.fillStyle = atmoGrad;
    ctx.beginPath();
    ctx.arc(px, py, radius * 1.5 * atmoPulse, 0, Math.PI * 2);
    ctx.fill();

    // Océano
    const oceanGrad = ctx.createRadialGradient(
      px - radius * 0.35, py - radius * 0.35, radius * 0.1, px, py, radius);
    oceanGrad.addColorStop(0, '#3A8FD8');
    oceanGrad.addColorStop(0.5, COLORS.ocean);
    oceanGrad.addColorStop(0.85, COLORS.oceanDp);
    oceanGrad.addColorStop(1, '#03162A');
    ctx.fillStyle = oceanGrad;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();

    // Clip al disco
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.clip();

    // Continentes
    CONTINENTS.forEach((continent) => {
      continent.forEach((polygon) => {
        const points = polygon.map(([lat, lng]) => project(lat, lng, radius, px, py));
        const anyVisible = points.some(p => p.visible);
        if (!anyVisible) return;
        const avgZ = points.reduce((s, p) => s + p.z, 0) / points.length;
        const lightness = Math.max(0.5, Math.min(1, 0.6 + avgZ * 0.4));
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          if (!p.visible) continue;
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        const r = Math.floor(58 * lightness + 20);
        const g = Math.floor(140 * lightness + 30);
        const b = Math.floor(90 * lightness + 20);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${r},${g},${b}, 0.8)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
    });

    // Nubes
    const cloudRot = rotY * 0.6 + t * 0.0001;
    const cloudPositions = [
      [ 30,  20], [ 25,  80], [ 15, 140], [-10, 200], [-20, 270], [-35, 330],
      [ 45, -40], [ 50, 100], [-25,  60], [ 10, -90], [-50, 180], [ 60,  20]
    ];
    cloudPositions.forEach(([lat, lng], i) => {
      const latR = lat * Math.PI / 180;
      const lngR = (lng * Math.PI / 180) + cloudRot;
      const x3 = Math.cos(latR) * Math.sin(lngR);
      const y3 = Math.sin(latR);
      const z3 = Math.cos(latR) * Math.cos(lngR);
      const cosP = Math.cos(rotX), sinP = Math.sin(rotX);
      const y3p = y3 * cosP - z3 * sinP;
      const z3p = y3 * sinP + z3 * cosP;
      if (z3p < 0) return;
      const cx2 = px + x3 * radius * 1.01;
      const cy2 = py + y3p * radius * 1.01;
      const size = (6 + (i % 3) * 2) * scale * (0.5 + z3p * 0.5);
      ctx.fillStyle = `rgba(255,255,255, ${0.4 * z3p})`;
      ctx.beginPath();
      ctx.ellipse(cx2, cy2, size, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Terminator (sombra día/noche)
    const termGrad = ctx.createLinearGradient(
      px - radius, py - radius,
      px + radius * 0.4, py + radius * 0.4);
    termGrad.addColorStop(0, 'rgba(0,0,0,0)');
    termGrad.addColorStop(0.55, 'rgba(0,0,0,0)');
    termGrad.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = termGrad;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);

    ctx.restore();

    // Borde brillante
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Highlight
    const hlGrad = ctx.createRadialGradient(
      px - radius * 0.4, py - radius * 0.4, 0,
      px - radius * 0.4, py - radius * 0.4, radius * 0.55);
    hlGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
    hlGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = hlGrad;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawOrbits(t) {
    const planetR = 75 * scale;
    const px = cx + mouseTiltX * 5;
    const py = cy + mouseTiltY * 5;
    ORBITS.forEach((orbit) => {
      const orbRadius = Math.min(W, H) * orbit.radius;
      const ry = orbRadius * Math.cos(orbit.tilt) * 0.32;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(orbit.tilt * 0.3);
      ctx.strokeStyle = orbit.color + '2B';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.ellipse(0, 0, orbRadius, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      const baseAngle = t * orbit.speed + orbit.offset;
      orbit.labels.forEach((label, i) => {
        const a = baseAngle + (i / orbit.labels.length) * Math.PI * 2;
        const ox = Math.cos(a) * orbRadius;
        const oy = Math.sin(a) * ry;
        const cos = Math.cos(orbit.tilt * 0.3);
        const sin = Math.sin(orbit.tilt * 0.3);
        const finalX = px + (ox * cos - oy * sin);
        const finalY = py + (ox * sin + oy * cos);
        const distFromCenter = Math.sqrt((finalX - px) ** 2 + (finalY - py) ** 2);
        const itemZ = Math.sin(a) * Math.sin(orbit.tilt * 0.3);
        if (distFromCenter < planetR * 0.95 && itemZ < 0) return;
        const depth = (oy + ry) / (ry * 2);
        const sizeMul = 0.65 + depth * 0.55;
        const alpha = 0.5 + depth * 0.5;
        ctx.shadowColor = orbit.color;
        ctx.shadowBlur = 10 * sizeMul;
        ctx.font = `700 ${10 * sizeMul}px "JetBrains Mono", monospace`;
        const metrics = ctx.measureText(label);
        const w = metrics.width + 14 * sizeMul;
        const h = 18 * sizeMul;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = COLORS.deep;
        roundRect(ctx, finalX - w / 2, finalY - h / 2, w, h, 4 * sizeMul);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = orbit.color;
        roundRect(ctx, finalX - w / 2, finalY - h / 2, w, h, 4 * sizeMul);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = orbit.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, finalX, finalY + 0.5);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
        ctx.globalAlpha = 1;
      });
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function render(t) {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    mouseTiltX += (tMouseTiltX - mouseTiltX) * 0.05;
    mouseTiltY += (tMouseTiltY - mouseTiltY) * 0.05;
    if (isDragging) {
      rotY += (targetRotY - rotY) * 0.4;
    } else {
      rotY += dragVelocity;
      dragVelocity *= 0.94;
      if (Math.abs(dragVelocity) < 0.0002) {
        dragVelocity = 0;
        rotY += autoRotSpeed;
      }
    }
    drawNebula();
    drawStars(t);
    drawCodeParticles();
    drawOrbits(t);
    drawPlanet(t);
    rafId = requestAnimationFrame(render);
  }

  function renderStatic() {
    ctx.clearRect(0, 0, W, H);
    drawNebula();
    drawStars(0);
    drawOrbits(0);
    drawPlanet(0);
  }

  function getPointerX(e) {
    if (e.touches && e.touches.length) return e.touches[0].clientX;
    return e.clientX;
  }

  function onPointerDown(e) {
    isDragging = true;
    lastDragX = getPointerX(e);
    targetRotY = rotY;
    dragVelocity = 0;
    wrapper && wrapper.classList.add('is-dragging');
    if (e.cancelable) e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const x = getPointerX(e);
    const dx = x - lastDragX;
    const radius = 75 * scale;
    const deltaRot = dx / radius;
    targetRotY += deltaRot;
    dragVelocity = deltaRot * 0.5;
    lastDragX = x;
    if (e.cancelable) e.preventDefault();
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    wrapper && wrapper.classList.remove('is-dragging');
  }

  function onMouseMoveGlobal(e) {
    if (isDragging) return;
    const rect = canvas.getBoundingClientRect();
    if (e.clientX < rect.left - 200 || e.clientX > rect.right + 200) {
      tMouseTiltX = 0; tMouseTiltY = 0; return;
    }
    tMouseTiltX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    tMouseTiltY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  function onMouseLeave() {
    if (!isDragging) { tMouseTiltX = 0; tMouseTiltY = 0; }
  }

  function onVisibility() {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(rafId);
    } else if (!reduced) {
      running = true;
      rafId = requestAnimationFrame(render);
    }
  }

  resize();
  window.addEventListener('resize', () => {
    clearTimeout(window.__spaceResizeTO);
    window.__spaceResizeTO = setTimeout(resize, 100);
  });
  canvas.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  window.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('touchend', onPointerUp);
  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', onMouseMoveGlobal, { passive: true });
    canvas.addEventListener('mouseleave', onMouseLeave);
  }
  document.addEventListener('visibilitychange', onVisibility);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !reduced && !running) {
          running = true;
          rafId = requestAnimationFrame(render);
        } else if (!entry.isIntersecting) {
          running = false;
          cancelAnimationFrame(rafId);
        }
      });
    }, { threshold: 0.05 });
    io.observe(canvas);
  }
  if (reduced) renderStatic();
  else { running = true; rafId = requestAnimationFrame(render); }
})();
