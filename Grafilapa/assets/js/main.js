(function () {
  'use strict';

  /* ===== Year ===== */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ===== Sticky header scroll state ===== */
  var header = document.getElementById('header');
  function onScroll() {
    if (window.scrollY > 24) header.classList.add('header--scrolled');
    else header.classList.remove('header--scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ===== Mobile menu ===== */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  var backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  function openMenu() {
    nav.classList.add('is-open');
    backdrop.classList.add('is-open');
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
  }
  function closeMenu() {
    nav.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) closeMenu();
      else openMenu();
    });
  }
  backdrop.addEventListener('click', closeMenu);
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
  });

  /* ===== Scroll reveal (IntersectionObserver + prefers-reduced-motion) ===== */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ===== FAQ accordion (accessible) ===== */
  var faqBtns = document.querySelectorAll('.faq__q');
  faqBtns.forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      // close all
      faqBtns.forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        var p = document.getElementById(b.getAttribute('aria-controls'));
        if (p) p.style.maxHeight = null;
      });
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ===== Contact form -> WhatsApp ===== */
  var WA_NUMBER = '5541996829483';
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var nome = (document.getElementById('nome').value || '').trim();
      var tel = (document.getElementById('telefone').value || '').trim();
      var serv = (document.getElementById('servico').value || '').trim();
      var msg = (document.getElementById('mensagem').value || '').trim();

      var texto =
        'Olá! Gostaria de solicitar um orçamento.' + '\n\n' +
        'Nome: ' + nome + '\n' +
        'Telefone/WhatsApp: ' + tel + '\n' +
        'Serviço de interesse: ' + serv +
        (msg ? '\nMensagem: ' + msg : '');

      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(texto);
      window.open(url, '_blank', 'noopener');
    });
  }
})();

/* ===== FLOATING WHATSAPP: aparece apenas após sair do topo ===== */
(function () {
  var wa = document.querySelector('.wa-float');
  if (!wa) return;
  function update() {
    var trigger = Math.min(window.innerHeight * 0.9, 640);
    if (window.scrollY > trigger) { wa.classList.add('is-visible'); }
    else { wa.classList.remove('is-visible'); }
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();

/* ===== DEPOIMENTOS: renderiza a partir de assets/js/depoimentos.js ===== */
(function () {
  var secao = document.getElementById('depoimentos');
  var alvo = document.getElementById('testimonials');
  if (!secao || !alvo) return;
  var lista = (typeof DEPOIMENTOS !== 'undefined' && Array.isArray(DEPOIMENTOS)) ? DEPOIMENTOS : [];
  lista = lista.filter(function (d) { return d && d.texto && String(d.texto).trim(); });
  if (!lista.length) { secao.hidden = true; return; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  alvo.innerHTML = lista.map(function (d) {
    var n = Math.max(1, Math.min(5, parseInt(d.estrelas, 10) || 5));
    var estrelas = '★★★★★'.slice(0, n);
    var empresa = d.empresa ? '<span>' + esc(d.empresa) + '</span>' : '';
    return '<figure class="testimonial reveal">' +
      '<div class="stars" aria-label="' + n + ' de 5 estrelas">' + estrelas + '</div>' +
      '<blockquote>&ldquo;' + esc(d.texto) + '&rdquo;</blockquote>' +
      '<figcaption><strong>' + esc(d.nome || '') + '</strong>' + empresa + '</figcaption>' +
      '</figure>';
  }).join('');

  secao.hidden = false;

  // reativa a animacao de entrada nos cards recem-criados
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    alvo.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
  } else {
    alvo.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
