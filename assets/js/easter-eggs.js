/* EASTER-EGGS.JS · Sorpresas escondidas */
(function () {
  'use strict';
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiPos = 0;
  document.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === KONAMI[konamiPos]) {
      konamiPos++;
      if (konamiPos === KONAMI.length) { activateKonami(); konamiPos = 0; }
    } else { konamiPos = key === KONAMI[0] ? 1 : 0; }
  });
  function activateKonami() {
    document.body.classList.toggle('konami-mode');
    showNotification(document.body.classList.contains('konami-mode') ? '🌈 VAPORWAVE MODE ACTIVATED' : '🔵 BACK TO NORMAL');
  }
  let buffer = '';
  const TRIGGER = 'sudo';
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-10);
    if (buffer.endsWith(TRIGGER)) { openMiniTerminal(); buffer = ''; }
  });
  const miniTerm = document.getElementById('mini-terminal');
  const miniTermBody = document.getElementById('mini-terminal-body');
  const miniTermInput = document.getElementById('mini-terminal-input');
  const miniTermClose = document.getElementById('mini-terminal-close');
  function openMiniTerminal() {
    if (!miniTerm) return;
    miniTerm.classList.add('is-open');
    miniTerm.setAttribute('aria-hidden', 'false');
    setTimeout(() => miniTermInput?.focus(), 400);
    addTerminalLine('Mini terminal abierta. Escribe <code>help</code>.', 'welcome');
  }
  function closeMiniTerminal() {
    if (!miniTerm) return;
    miniTerm.classList.remove('is-open');
    miniTerm.setAttribute('aria-hidden', 'true');
  }
  miniTermClose?.addEventListener('click', closeMiniTerminal);
  function addTerminalLine(content, type = 'out') {
    const line = document.createElement('div');
    line.className = 'mini-terminal__line';
    if (type === 'welcome') line.classList.add('mini-terminal__welcome');
    line.innerHTML = content;
    miniTermBody.appendChild(line);
    miniTermBody.scrollTop = miniTermBody.scrollHeight;
  }
  const commands = {
    help: () => `Comandos disponibles:<br><code>about</code> · sobre Juan Félix<br><code>skills</code> · tech stack<br><code>projects</code> · proyectos destacados<br><code>contact</code> · contacto<br><code>social</code> · redes<br><code>matrix</code> · toggle Matrix<br><code>theme</code> · cambiar tema<br><code>clear</code> · limpiar<br><code>exit</code> · cerrar`,
    about: () => `Juan Félix Ballesteros<br>Estudiante de desarrollo en Campus Lands<br>Backend &amp; automatización con IA<br>Colombia 🇨🇴`,
    skills: () => `Lenguajes: JavaScript, Python, HTML, CSS<br>Automatización: n8n<br>IA: Google Gemini, Google Workspace<br>Aprendiendo: PostgreSQL, IA aplicada`,
    projects: () => `1. <code>attendance-ai-system</code><br>2. <code>n8n-automation-portfolio</code><br>3. <code>lms-platform</code><br>→ github.com/felixBD04`,
    contact: () => `Visita <a href="https://github.com/felixBD04" target="_blank" style="color:var(--cyan)">github.com/felixBD04</a>`,
    social: () => `GitHub: <a href="https://github.com/felixBD04" target="_blank" style="color:var(--cyan)">@felixBD04</a>`,
    matrix: () => {
      const c = document.getElementById('matrix-canvas');
      if (c) { c.style.display = c.style.display === 'none' ? '' : 'none'; return c.style.display === 'none' ? 'Matrix desactivado.' : 'Matrix activado.'; }
      return 'Canvas no encontrado.';
    },
    theme: () => { activateKonami(); return 'Tema alternado.'; },
    clear: () => { miniTermBody.innerHTML = ''; return null; },
    exit: () => { closeMiniTerminal(); return null; },
  };
  miniTermInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = miniTermInput.value.trim().toLowerCase();
      if (!input) return;
      addTerminalLine(`<span style="color:var(--cyan)">felix@portafolio:~$</span> ${input}`);
      miniTermInput.value = '';
      if (commands[input]) { const result = commands[input](); if (result) addTerminalLine(result); }
      else { addTerminalLine(`<span style="color:var(--red, #FF3864)">comando no encontrado:</span> ${input}. Escribe <code>help</code>.`); }
    }
    if (e.key === 'Escape') closeMiniTerminal();
  });
  const heroTitle = document.querySelector('.hero__title');
  let clickCount = 0; let clickTimer = null;
  heroTitle?.addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
    if (clickCount === 5) {
      showNotification('🎉 ¡Encontraste el easter egg! Eres curioso, me caes bien.');
      clickCount = 0;
      heroTitle.style.transition = 'transform 1s cubic-bezier(0.65,0,0.35,1)';
      heroTitle.style.transform = 'rotate(360deg)';
      setTimeout(() => { heroTitle.style.transform = ''; }, 1000);
    }
  });
  function showNotification(text) {
    const existing = document.querySelector('.notify');
    if (existing) existing.remove();
    const notify = document.createElement('div');
    notify.className = 'notify';
    notify.textContent = text;
    notify.style.cssText = `position: fixed; top: 100px; left: 50%; transform: translateX(-50%) translateY(-30px); background: var(--bg-2); color: var(--cyan); padding: 1rem 1.5rem; border: 1px solid var(--cyan); font-family: var(--font-mono); font-size: 0.875rem; z-index: 1000; box-shadow: 0 0 30px var(--cyan-dim); opacity: 0; transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);`;
    document.body.appendChild(notify);
    requestAnimationFrame(() => { notify.style.opacity = '1'; notify.style.transform = 'translateX(-50%) translateY(0)'; });
    setTimeout(() => { notify.style.opacity = '0'; notify.style.transform = 'translateX(-50%) translateY(-30px)'; setTimeout(() => notify.remove(), 400); }, 3000);
  }
})();
