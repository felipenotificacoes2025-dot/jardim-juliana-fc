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

  /* ----- Lightbox / Álbum ----- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var lightboxCounter = document.getElementById('lightboxCounter');
  var lastFocused = null;
  var album = [];
  var albumIdx = 0;

  function renderAlbum() {
    var item = album[albumIdx] || {};
    lightboxImg.src = item.src || '';
    lightboxImg.alt = item.alt || '';
    var multi = album.length > 1;
    lightboxPrev.hidden = !multi;
    lightboxNext.hidden = !multi;
    lightboxCounter.hidden = !multi;
    if (multi) lightboxCounter.textContent = (albumIdx + 1) + ' / ' + album.length;
  }
  function albumGo(i) {
    if (!album.length) return;
    albumIdx = (i + album.length) % album.length;
    renderAlbum();
  }
  // openLightbox aceita (src, alt) para 1 imagem OU (arrayDeItens, indiceInicial)
  function openLightbox(srcOrList, altOrIndex) {
    lastFocused = document.activeElement;
    if (Array.isArray(srcOrList)) {
      album = srcOrList;
      albumIdx = altOrIndex || 0;
    } else {
      album = [{ src: srcOrList, alt: altOrIndex || '' }];
      albumIdx = 0;
    }
    renderAlbum();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    album = [];
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  // abrir álbum de um projeto da comunidade
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-album-path]') : null;
    if (!btn) return;
    var path = btn.getAttribute('data-album-path');
    var count = parseInt(btn.getAttribute('data-album-count'), 10) || 0;
    var title = btn.getAttribute('data-album-title') || '';
    var items = [];
    for (var i = 1; i <= count; i++) {
      var nn = i < 10 ? '0' + i : '' + i;
      items.push({ src: path + nn + '.webp', alt: title + ' — foto ' + i });
    }
    if (items.length) openLightbox(items, 0);
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', function () { albumGo(albumIdx - 1); });
  lightboxNext.addEventListener('click', function () { albumGo(albumIdx + 1); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') albumGo(albumIdx - 1);
    else if (e.key === 'ArrowRight') albumGo(albumIdx + 1);
  });

  // deslize (touch) no álbum
  var lbX = 0, lbDx = 0, lbDrag = false;
  lightboxImg.addEventListener('touchstart', function (e) {
    lbX = e.touches[0].clientX; lbDx = 0; lbDrag = true;
  }, { passive: true });
  lightboxImg.addEventListener('touchmove', function (e) {
    if (lbDrag) lbDx = e.touches[0].clientX - lbX;
  }, { passive: true });
  lightboxImg.addEventListener('touchend', function () {
    if (lbDrag && Math.abs(lbDx) > 45) albumGo(albumIdx + (lbDx < 0 ? 1 : -1));
    lbDrag = false;
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
