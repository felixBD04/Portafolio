/* ============================================================
   SPACE SCENE — Hero animado
   Canvas 2D puro · sin librerías · ~6KB minificado
   Planeta giratorio + 3 órbitas con tech-icons + estrellas + parallax mouse
   Respeta prefers-reduced-motion
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('space-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const COLORS = {
    cyan:    '#00F0FF',
    magenta: '#B026FF',
    white:   '#FFFFFF',
    accent:  '#FFE15C',
    deep:    '#0A0E1A'
  };

  let W = 0, H = 0, cx = 0, cy = 0, scale = 1;
  let stars = [];
  let codeParticles = [];
  let orbits = [];
  let mouseX = 0, mouseY = 0, tMouseX = 0, tMouseY = 0;
  let frame = 0;
  let rafId = null;
  let running = false;

  const SYMBOLS = ['{ }', '< />', 'n8n', 'AI', 'JS', '01', '/*', '=>', 'fn', 'API'];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    cx = W / 2;
    cy = H / 2;
    scale = Math.min(W, H) / 500;

    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    generateStars();
    generateOrbits();
    generateCodeParticles();
  }

  function generateStars() {
    const count = Math.floor((W * H) / 2200);
    stars = [];
    for (let i = 0; i < count; i++) {
      const layer = Math.random() < 0.6 ? 0 : (Math.random() < 0.8 ? 1 : 2);
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: (0.3 + Math.random() * 1.2) * (layer + 1) * 0.7,
        layer,
        twinkleSeed: Math.random() * Math.PI * 2,
        color: Math.random() < 0.85
          ? COLORS.white
          : (Math.random() < 0.5 ? COLORS.cyan : COLORS.magenta)
      });
    }
  }

  function generateOrbits() {
    const planetR = 60 * scale;
    orbits = [
      {
        r: planetR * 1.8,
        speed: 0.0008,
        tilt: 0.25,
        items: 3,
        symbols: ['{ }', 'JS', 'n8n'],
        color: COLORS.cyan,
        offset: 0
      },
      {
        r: planetR * 2.6,
        speed: -0.0005,
        tilt: -0.15,
        items: 4,
        symbols: ['AI', '< />', 'API', '=>'],
        color: COLORS.magenta,
        offset: Math.PI / 3
      },
      {
        r: planetR * 3.4,
        speed: 0.0003,
        tilt: 0.4,
        items: 5,
        symbols: ['01', '/*', 'fn', '{ }', '0x'],
        color: COLORS.cyan,
        offset: Math.PI / 1.5
      }
    ];
  }

  function generateCodeParticles() {
    const count = Math.max(8, Math.floor(W / 80));
    const chars = ['0', '1', '{', '}', '<', '>', '/', '=', '$', '*'];
    codeParticles = [];
    for (let i = 0; i < count; i++) {
      codeParticles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        char: chars[Math.floor(Math.random() * chars.length)],
        opacity: 0.05 + Math.random() * 0.15,
        size: 8 + Math.random() * 8
      });
    }
  }

  function drawNebula() {
    const grad1 = ctx.createRadialGradient(cx * 0.7, cy * 0.6, 0, cx * 0.7, cy * 0.6, W * 0.6);
    grad1.addColorStop(0, 'rgba(176, 38, 255, 0.10)');
    grad1.addColorStop(0.4, 'rgba(176, 38, 255, 0.04)');
    grad1.addColorStop(1, 'rgba(176, 38, 255, 0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, W, H);

    const grad2 = ctx.createRadialGradient(cx * 1.3, cy * 1.4, 0, cx * 1.3, cy * 1.4, W * 0.5);
    grad2.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
    grad2.addColorStop(0.5, 'rgba(0, 240, 255, 0.03)');
    grad2.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, W, H);
  }

  function drawStars(t) {
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const parallaxX = mouseX * (s.layer + 1) * 4;
      const parallaxY = mouseY * (s.layer + 1) * 4;
      const twinkle = 0.5 + 0.5 * Math.sin(t * 0.001 + s.twinkleSeed);
      ctx.globalAlpha = (0.3 + 0.7 * twinkle) * (s.layer === 0 ? 0.5 : (s.layer === 1 ? 0.8 : 1));
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x + parallaxX, s.y + parallaxY, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawCodeParticles() {
    ctx.font = '600 11px "JetBrains Mono", monospace';
    for (let i = 0; i < codeParticles.length; i++) {
      const p = codeParticles[i];
      p.x += p.vx;
      p.y += p.vy;
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
    const planetR = 60 * scale;
    const px = cx + mouseX * 8;
    const py = cy + mouseY * 8;

    const pulse = 1 + Math.sin(t * 0.0015) * 0.05;
    const atmoGrad = ctx.createRadialGradient(px, py, planetR * 0.9, px, py, planetR * 2.2 * pulse);
    atmoGrad.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
    atmoGrad.addColorStop(0.4, 'rgba(176, 38, 255, 0.18)');
    atmoGrad.addColorStop(1, 'rgba(176, 38, 255, 0)');
    ctx.fillStyle = atmoGrad;
    ctx.beginPath();
    ctx.arc(px, py, planetR * 2.2 * pulse, 0, Math.PI * 2);
    ctx.fill();

    const bodyGrad = ctx.createRadialGradient(
      px - planetR * 0.4, py - planetR * 0.4, planetR * 0.1,
      px, py, planetR
    );
    bodyGrad.addColorStop(0, '#1E3A8A');
    bodyGrad.addColorStop(0.4, '#0F1B47');
    bodyGrad.addColorStop(0.85, '#070B22');
    bodyGrad.addColorStop(1, '#03050F');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(px, py, planetR, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, planetR, 0, Math.PI * 2);
    ctx.clip();

    const rot = t * 0.0003;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
    ctx.lineWidth = 0.8;

    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI + rot;
      const radiusX = Math.abs(planetR * Math.cos(angle));
      ctx.beginPath();
      ctx.ellipse(px, py, radiusX, planetR, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(176, 38, 255, 0.18)';
    for (let i = 1; i < 6; i++) {
      const offset = ((i / 6) - 0.5) * 2 * planetR;
      const radiusY = Math.sqrt(planetR * planetR - offset * offset);
      ctx.beginPath();
      ctx.ellipse(px, py + offset, planetR, radiusY * 0.15, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = COLORS.accent;
    const cityCount = 6;
    for (let i = 0; i < cityCount; i++) {
      const a = (i / cityCount) * Math.PI * 2 + rot * 2;
      const cityX = px + Math.cos(a) * planetR * 0.6;
      const cityY = py + Math.sin(a * 1.7) * planetR * 0.5;
      const blink = 0.4 + 0.6 * Math.sin(t * 0.003 + i);
      ctx.globalAlpha = blink;
      ctx.beginPath();
      ctx.arc(cityX, cityY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    const hlGrad = ctx.createRadialGradient(
      px - planetR * 0.35, py - planetR * 0.35, 0,
      px - planetR * 0.35, py - planetR * 0.35, planetR * 0.7
    );
    hlGrad.addColorStop(0, 'rgba(0, 240, 255, 0.18)');
    hlGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = hlGrad;
    ctx.beginPath();
    ctx.arc(px, py, planetR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px, py, planetR, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawOrbits(t) {
    const px = cx + mouseX * 8;
    const py = cy + mouseY * 8;

    orbits.forEach((orbit) => {
      const ry = orbit.r * Math.cos(orbit.tilt) * 0.35;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(orbit.tilt * 0.4);
      ctx.strokeStyle = orbit.color + '33';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.ellipse(0, 0, orbit.r, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      const baseAngle = t * orbit.speed + orbit.offset;
      for (let i = 0; i < orbit.items; i++) {
        const a = baseAngle + (i / orbit.items) * Math.PI * 2;
        const ox = Math.cos(a) * orbit.r;
        const oy = Math.sin(a) * ry;

        const cos = Math.cos(orbit.tilt * 0.4);
        const sin = Math.sin(orbit.tilt * 0.4);
        const finalX = px + (ox * cos - oy * sin);
        const finalY = py + (ox * sin + oy * cos);

        const depth = (oy + ry) / (ry * 2);
        const sizeMul = 0.6 + depth * 0.7;
        const alpha = 0.4 + depth * 0.6;

        ctx.shadowColor = orbit.color;
        ctx.shadowBlur = 12 * sizeMul;

        const sym = orbit.symbols[i % orbit.symbols.length];
        ctx.font = `700 ${10 * sizeMul}px "JetBrains Mono", monospace`;
        const metrics = ctx.measureText(sym);
        const w = metrics.width + 12 * sizeMul;
        const h = 16 * sizeMul;

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
        ctx.fillText(sym, finalX, finalY + 0.5);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
        ctx.globalAlpha = 1;
      }
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

    mouseX += (tMouseX - mouseX) * 0.05;
    mouseY += (tMouseY - mouseY) * 0.05;

    drawNebula();
    drawStars(t);
    drawCodeParticles();
    drawOrbits(t);
    drawPlanet(t);

    frame++;
    rafId = requestAnimationFrame(render);
  }

  function renderStatic() {
    ctx.clearRect(0, 0, W, H);
    drawNebula();
    drawStars(0);
    drawOrbits(0);
    drawPlanet(0);
  }

  function onMouse(e) {
    const rect = canvas.getBoundingClientRect();
    tMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    tMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  function onLeave() {
    tMouseX = 0;
    tMouseY = 0;
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

  let inView = true;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        inView = entry.isIntersecting;
        if (inView && !reduced && !running) {
          running = true;
          rafId = requestAnimationFrame(render);
        } else if (!inView) {
          running = false;
          cancelAnimationFrame(rafId);
        }
      });
    }, { threshold: 0.05 });
    io.observe(canvas);
  }

  resize();
  window.addEventListener('resize', () => {
    clearTimeout(window.__spaceResizeTO);
    window.__spaceResizeTO = setTimeout(resize, 100);
  });

  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', onMouse, { passive: true });
    canvas.addEventListener('mouseleave', onLeave);
  }

  document.addEventListener('visibilitychange', onVisibility);

  if (reduced) {
    renderStatic();
  } else {
    running = true;
    rafId = requestAnimationFrame(render);
  }
})();
