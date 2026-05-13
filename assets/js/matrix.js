/* MATRIX.JS · Efecto Matrix rain en canvas (optimizado y sutil) */
(function () {
  'use strict';
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }
  const ctx = canvas.getContext('2d', { alpha: true });
  let w, h, columns, drops;
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ01{}<>[]/*-+=#$%';
  const fontSize = 14;
  const STEP = 50;
  let lastTime = 0;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    columns = Math.floor(w / fontSize);
    drops = new Array(columns).fill(0).map(() => Math.random() * -100);
  }
  function draw(time) {
    if (time - lastTime < STEP) { requestAnimationFrame(draw); return; }
    lastTime = time;
    ctx.fillStyle = 'rgba(10, 14, 26, 0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = `${fontSize}px JetBrains Mono, monospace`;
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize; const y = drops[i] * fontSize;
      const isHead = Math.random() > 0.975;
      if (isHead) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
        ctx.shadowColor = '#00F0FF'; ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = Math.random() > 0.97 ? 'rgba(176, 38, 255, 0.5)' : 'rgba(0, 240, 255, 0.35)';
        ctx.shadowBlur = 0;
      }
      ctx.fillText(text, x, y);
      if (y > h && Math.random() > 0.975) { drops[i] = 0; }
      drops[i]++;
    }
    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }
  resize();
  window.addEventListener('resize', () => {
    clearTimeout(window._matrixResizeTimer);
    window._matrixResizeTimer = setTimeout(resize, 200);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) lastTime = 0; });
  requestAnimationFrame(draw);
})();
