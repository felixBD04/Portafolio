/* I18N.JS · Toggle de idioma ES/EN */
(function () {
  'use strict';
  const translations = {
    en: {
      'nav.about': 'About', 'nav.stack': 'Stack', 'nav.projects': 'Projects', 'nav.contact': 'Contact',
      'hero.tag': 'Open to projects · Colombia',
      'hero.subtitle': 'Backend & automation with',
      'hero.highlight': 'Artificial Intelligence',
      'hero.role': 'Development student',
      'hero.cta1': 'See projects', 'hero.cta2': 'Contact me', 'hero.scroll': 'SCROLL',
      'about.title': 'About me',
      'about.p1': 'I build web tools that solve real problems — systems that connect <strong>frontend, AI and cloud services</strong>. I care more about a system working well internally than how it looks, though I take care of both.',
      'about.p2': "I don't come from the world of code yet, I'm on my way. I learn by building and publishing what I finish.",
      'about.fun': 'I enjoy solving problems that seem boring.',
      'stack.title': 'Tech Stack', 'stack.langs': 'Languages', 'stack.ai': 'Automation · AI',
      'stack.tools': 'Tools', 'stack.learning': 'Learning', 'stack.ai-applied': 'Applied AI',
      'projects.title': 'Projects', 'projects.viewRepo': 'View repository', 'projects.viewMore': 'View all repositories',
      'projects.p1.cat': 'Full-stack · AI · Automation',
      'projects.p1.desc': 'System that automates the validation of student absence justifications using <strong>Gemini AI</strong> for document analysis and <strong>n8n</strong> as workflow engine. Includes admin web panel, integration with Google Sheets/Drive/Gmail and Telegram alerts.',
      'projects.p2.cat': 'Automation · APIs',
      'projects.p2.desc': 'Collection of <strong>n8n</strong> workflows organized in three difficulty levels. Covers webhooks, integrations with external services and data handling.',
      'projects.p3.cat': 'Frontend · Modular architecture',
      'projects.p3.desc': 'Learning management platform built collaboratively. Separate panels for admin and users, code organized by modules.',
      'stats.title': 'GitHub stats', 'stats.repos': 'Public repositories', 'stats.featured': 'Featured projects',
      'stats.langs': 'Main languages', 'stats.coffee': 'Coffee in the system',
      'contact.title': "Let's talk",
      'contact.lead': 'Got a project in mind, a crazy idea, or just want to say hi?',
      'contact.lead2': 'Find me below.',
      'contact.emailHandle': 'Send me an email',
      'contact.linkedinHandle': "Let's connect professionally",
      'footer.built': 'Built with code and coffee',
      'footer.hint': 'psst… try the konami code ↑↑↓↓←→←→BA, or type "sudo" anywhere',
      'footer.status': 'online · ready to build',
    }
  };
  let currentLang = 'es';
  const originalTexts = new Map();
  function captureOriginals() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (!originalTexts.has(el)) originalTexts.set(el, el.innerHTML);
    });
  }
  function translate(lang) {
    if (lang === 'es') {
      originalTexts.forEach((html, el) => { el.innerHTML = html; });
    } else {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang] && translations[lang][key]) el.innerHTML = translations[lang][key];
      });
    }
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-toggle__option').forEach(opt => {
      opt.classList.toggle('lang-toggle__option--active', opt.dataset.lang === lang);
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    captureOriginals();
    document.querySelectorAll('.lang-toggle__option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = opt.dataset.lang;
        if (lang !== currentLang) translate(lang);
      });
    });
    const toggle = document.getElementById('lang-toggle');
    toggle?.addEventListener('click', (e) => {
      if (e.target.classList.contains('lang-toggle__option')) return;
      translate(currentLang === 'es' ? 'en' : 'es');
    });
  });
})();
