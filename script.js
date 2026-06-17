/* ===================================================================
   JARDIM JULIANA FC — interações
==================================================================== */
(function () {
  'use strict';

  /* ----- Ano dinâmico no rodapé ----- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- Header com fundo ao rolar ----- */
  var header = document.getElementById('header');
  function onScroll() {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- Menu mobile ----- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  function closeMenu() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }
  function openMenu() {
    nav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
  }

  toggle.addEventListener('click', function () {
    if (nav.classList.contains('open')) closeMenu();
    else openMenu();
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ----- Reveal no scroll (IntersectionObserver) ----- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ----- Manifesto do clube (ler mais / ler menos) ----- */
  var storyToggle = document.getElementById('clubStoryToggle');
  var storyMore = document.getElementById('clubStoryMore');
  if (storyToggle && storyMore) {
    storyToggle.addEventListener('click', function () {
      var open = storyMore.hasAttribute('hidden') === false;
      if (open) {
        storyMore.setAttribute('hidden', '');
        storyToggle.setAttribute('aria-expanded', 'false');
        storyToggle.textContent = 'Ler a história completa';
        storyToggle.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        storyMore.removeAttribute('hidden');
        storyToggle.setAttribute('aria-expanded', 'true');
        storyToggle.textContent = 'Ler menos';
      }
    });
  }

  /* ----- Galeria dinâmica (render + "ver mais") ----- */
  var grid = document.getElementById('galleryGrid');
  var moreBtn = document.getElementById('galleryMore');
  if (grid) {
    var total = parseInt(grid.getAttribute('data-count'), 10) || 0;
    var initial = parseInt(grid.getAttribute('data-initial'), 10) || 12;
    var shown = 0;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function addPhotos(upTo) {
      var frag = document.createDocumentFragment();
      for (var i = shown + 1; i <= upTo && i <= total; i++) {
        var src = 'img/galeria/' + pad(i) + '.webp';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gallery__item';
        btn.setAttribute('data-src', src);
        var img = document.createElement('img');
        img.src = src;
        img.loading = 'lazy';
        img.alt = 'Jardim Juliana FC — time, torcida e comunidade';
        btn.appendChild(img);
        frag.appendChild(btn);
      }
      grid.appendChild(frag);
      shown = Math.min(upTo, total);
      if (shown >= total && moreBtn) moreBtn.style.display = 'none';
    }

    addPhotos(initial);
    if (moreBtn) {
      if (total <= initial) moreBtn.style.display = 'none';
      moreBtn.addEventListener('click', function () { addPhotos(total); });
    }
  }

  /* ----- Lightbox da galeria ----- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lastFocused = null;

  function openLightbox(src, alt) {
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.addEventListener('click', function (e) {
    var item = e.target.closest ? e.target.closest('.gallery__item') : null;
    if (!item) return;
    var img = item.querySelector('img');
    openLightbox(item.getAttribute('data-src'), img ? img.alt : '');
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });

  /* ----- Carrossel do Píter ----- */
  var carousel = document.getElementById('piterCarousel');
  if (carousel) {
    var track = carousel.querySelector('.carousel__track');
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.carousel__slide'));
    var prevBtn = carousel.querySelector('.carousel__btn--prev');
    var nextBtn = carousel.querySelector('.carousel__btn--next');
    var dotsWrap = document.getElementById('piterDots');
    var index = 0;

    function update() {
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
          d.setAttribute('aria-selected', i === index ? 'true' : 'false');
        });
      }
    }
    function go(i) { index = (i + slides.length) % slides.length; update(); }

    // dots
    if (dotsWrap) {
      slides.forEach(function (s, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Foto ' + (i + 1));
        b.addEventListener('click', function () { go(i); });
        dotsWrap.appendChild(b);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { go(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(index + 1); });

    // clique para ampliar (lightbox) — ignorado logo após um deslize
    var suppressClick = false;
    slides.forEach(function (s) {
      var img = s.querySelector('img');
      if (img) img.addEventListener('click', function () {
        if (suppressClick) return;
        openLightbox(img.src, img.alt);
      });
    });

    // teclado quando o carrossel está focado
    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(index - 1); }
      else if (e.key === 'ArrowRight') { go(index + 1); }
    });

    // deslize (touch) no celular
    var startX = 0, dx = 0, dragging = false;
    track.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX; dx = 0; dragging = true;
    }, { passive: true });
    track.addEventListener('touchmove', function (e) {
      if (dragging) dx = e.touches[0].clientX - startX;
    }, { passive: true });
    track.addEventListener('touchend', function () {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(dx) > 45) {
        suppressClick = true;
        setTimeout(function () { suppressClick = false; }, 350);
        go(index + (dx < 0 ? 1 : -1));
      }
    });

    update();
  }
})();
