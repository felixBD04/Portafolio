/* SCRAMBLE.JS · Efecto de texto que se descodifica letra por letra */
(function () {
  'use strict';
  const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#________';
  class TextScramble {
    constructor(el) {
      this.el = el; this.chars = SCRAMBLE_CHARS;
      this.update = this.update.bind(this);
    }
    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => (this.resolve = resolve));
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || ''; const to = newText[i] || '';
        const start = Math.floor(Math.random() * 30);
        const end = start + Math.floor(Math.random() * 30);
        this.queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }
    update() {
      let output = ''; let complete = 0;
      for (let i = 0; i < this.queue.length; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) { complete++; output += to; }
        else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) { char = this.randomChar(); this.queue[i].char = char; }
          output += `<span class="scramble-char">${char}</span>`;
        } else { output += from; }
      }
      this.el.innerHTML = output;
      if (complete === this.queue.length) { this.resolve(); }
      else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
    }
    randomChar() { return this.chars[Math.floor(Math.random() * this.chars.length)]; }
  }
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.querySelectorAll('[data-scramble]').forEach((el, i) => {
        const text = el.dataset.scramble;
        const scrambler = new TextScramble(el);
        setTimeout(() => scrambler.setText(text), i * 200);
      });
    }, 1000);
  });
  const style = document.createElement('style');
  style.textContent = `.scramble-char { color: var(--cyan); opacity: 0.7; }`;
  document.head.appendChild(style);
})();
