/* CURSOR.JS · Cursor personalizado con lag suave */
(function () {
  'use strict';
  if (!window.matchMedia('(hover: hover)').matches) {
    document.querySelector('.cursor')?.remove();
    return;
  }
  const cursor = document.querySelector('.cursor');
  if (!cursor) return;
  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  cursor.style.opacity = '0';
  cursor.style.transition = 'opacity 300ms';
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX, dotY = mouseY, ringX = mouseX, ringY = mouseY;
  let visible = false;
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (!visible) { cursor.style.opacity = '1'; visible = true; }
  });
  function loop() {
    dotX += (mouseX - dotX) * 0.5;
    dotY += (mouseY - dotY) * 0.5;
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    dot.style.left = dotX + 'px'; dot.style.top = dotY + 'px';
    ring.style.left = ringX + 'px'; ring.style.top = ringY + 'px';
    requestAnimationFrame(loop);
  }
  loop();
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { if (visible) cursor.style.opacity = '1'; });
})();
