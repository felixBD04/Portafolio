/* MAIN.JS · Lógica principal del portafolio */
(function () {
  'use strict';
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
      setTimeout(() => {
        loader.classList.add('is-hidden');
        document.body.style.overflow = '';
        initAnimations();
      }, 800);
    } else { initAnimations(); }
  });
  document.body.style.overflow = 'hidden';

  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.querySelector('.nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    document.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  const header = document.getElementById('header');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (!header) return;
    if (currentScroll <= 80) header.classList.remove('is-hidden');
    else if (currentScroll > lastScroll && currentScroll > 200) header.classList.add('is-hidden');
    else header.classList.remove('is-hidden');
    lastScroll = currentScroll;
  }, { passive: true });

  const hoverables = document.querySelectorAll('a, button, .stack__card, .project, .stat-card, input');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor--hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor--hover'));
  });

  function initAnimations() {
    if (typeof gsap === 'undefined') {
      console.warn('GSAP no está cargado.');
      document.querySelectorAll('.hero__tag, .hero__title-line, .hero__subtitle, .hero__meta, .hero__actions').forEach(el => el.style.opacity = '1');
      runStatsCountFallback();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTL
      .to('.hero__tag', { opacity: 1, y: 0, duration: 0.6 })
      .from('.hero__title-line', { opacity: 0, y: 80, duration: 0.9, stagger: 0.15, clearProps: 'opacity,transform' }, '-=0.3')
      .to('.hero__subtitle', { opacity: 1, duration: 0.7 }, '-=0.4')
      .to('.hero__meta', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
      .to('.hero__actions', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');

    gsap.utils.toArray('.section-header').forEach(header => {
      gsap.from(header, { scrollTrigger: { trigger: header, start: 'top 85%' }, opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' });
    });

    gsap.from('.about__paragraph', { scrollTrigger: { trigger: '.about', start: 'top 70%' }, opacity: 0, y: 30, duration: 0.8, stagger: 0.15, ease: 'power3.out' });
    gsap.from('.terminal', { scrollTrigger: { trigger: '.about', start: 'top 70%' }, opacity: 0, scale: 0.95, duration: 1, ease: 'power3.out' });
    gsap.from('.terminal__line', { scrollTrigger: { trigger: '.terminal', start: 'top 75%' }, opacity: 0, x: -10, duration: 0.3, stagger: 0.1, delay: 0.5 });

    gsap.utils.toArray('.stack__card').forEach((card, i) => {
      gsap.from(card, { scrollTrigger: { trigger: card, start: 'top 85%' }, opacity: 0, y: 40, duration: 0.7, delay: i * 0.1, ease: 'power3.out' });
    });
    gsap.utils.toArray('.stack__item-bar').forEach(bar => {
      ScrollTrigger.create({ trigger: bar, start: 'top 90%', onEnter: () => bar.classList.add('is-visible') });
    });

    gsap.utils.toArray('.project').forEach(project => {
      const content = project.querySelector('.project__content');
      const visual = project.querySelector('.project__visual');
      const isReverse = project.classList.contains('project--reverse');
      gsap.from(content, { scrollTrigger: { trigger: project, start: 'top 75%' }, opacity: 0, x: isReverse ? 60 : -60, duration: 0.9, ease: 'power3.out' });
      gsap.from(visual, { scrollTrigger: { trigger: project, start: 'top 75%' }, opacity: 0, x: isReverse ? -60 : 60, duration: 0.9, delay: 0.1, ease: 'power3.out' });
      gsap.to(project.querySelector('.project__visual-grid'), { scrollTrigger: { trigger: project, start: 'top bottom', end: 'bottom top', scrub: 1 }, y: -40 });
    });

    document.querySelectorAll('.stat-card__num').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => {
          const obj = { val: 0 };
          gsap.to(obj, { val: target, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = Math.floor(obj.val) + suffix; } });
        },
      });
    });
    gsap.from('.stat-card', { scrollTrigger: { trigger: '.stats__grid', start: 'top 80%' }, opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: 'power3.out' });
    gsap.from('.stats__img', { scrollTrigger: { trigger: '.stats__images', start: 'top 80%' }, opacity: 0, y: 30, duration: 0.8, stagger: 0.15, ease: 'power3.out' });
    gsap.from('.contact__lead', { scrollTrigger: { trigger: '.contact', start: 'top 70%' }, opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' });
    gsap.from('.contact-link', { scrollTrigger: { trigger: '.contact__links', start: 'top 80%' }, opacity: 0, x: -30, duration: 0.6, stagger: 0.1, ease: 'power3.out' });
    gsap.from('.footer__inner', { scrollTrigger: { trigger: '.footer', start: 'top 95%' }, opacity: 0, duration: 0.8, ease: 'power2.out' });

    const heroTitle = document.querySelector('.hero__title');
    if (heroTitle && window.matchMedia('(hover: hover)').matches) {
      document.querySelector('.hero').addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 20;
        const y = (clientY / window.innerHeight - 0.5) * 20;
        heroTitle.style.transform = `translate(${x}px, ${y}px)`;
      });
      document.querySelector('.hero').addEventListener('mouseleave', () => { heroTitle.style.transform = ''; });
    }
  }
  function runStatsCountFallback() {
    document.querySelectorAll('.stat-card__num').forEach(el => {
      el.textContent = el.dataset.count + (el.dataset.suffix || '');
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    });
  });

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  if (sections.length && navLinks.length) {
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 120;
      sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav__link[href="#${id}"]`);
        if (link) {
          if (scrollPos >= top && scrollPos < bottom) {
            navLinks.forEach(l => l.style.color = '');
            link.style.color = 'var(--cyan)';
          }
        }
      });
    }, { passive: true });
  }

  const styles = ['color: #00F0FF','font-size: 18px','font-weight: bold','text-shadow: 2px 2px 0 #B026FF','padding: 8px'].join(';');
  console.log('%c¡Hey, dev curioso! 👋', styles);
  console.log('%cPrueba el código Konami: ↑↑↓↓←→←→BA', 'color: #00FF94; font-family: monospace;');
  console.log('%cO escribe "sudo" en cualquier parte de la página.', 'color: #00FF94; font-family: monospace;');
  console.log('%c— Juan Félix (@felixBD04)', 'color: #B026FF; font-family: monospace;');
})();
