/* WITHYBED — what every page needs: the menu, smooth scroll, the reveal on
   scroll, and clips that only load when they are near the screen. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // GSAP and Lenis. ScrollTrigger was tried and dropped: it writes a style="" attribute
  // while it measures, which a strict style-src 'self' refuses and reports on every refresh.
  var haveLibs = !!window.Lenis;

  // if the animation libraries did not arrive, show everything as it is
  if (!haveLibs) root.classList.remove('motion');
  var motion = root.classList.contains('motion') && !reduce;
  window.WBmotion = motion;
  window.WBlenis = null;

  /* ---- a solid backing behind the bar once the page has scrolled ---- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      root.classList.toggle('scrolled', window.scrollY > 40);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- smooth scroll: Lenis keeps native scroll, sticky and anchors working ---- */
  var lenis = null;
  if (motion) {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
    window.WBlenis = lenis;
    var loop = function (t) { lenis.raf(t); window.requestAnimationFrame(loop); };
    window.requestAnimationFrame(loop);
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href') === '#') return;
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -64 });
      history.replaceState(null, '', a.getAttribute('href'));
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  /* ---- the menu is a modal dialog: focus is trapped and Escape closes it, natively ---- */
  var menu = document.querySelector('[data-menu]');
  var opener = document.querySelector('[data-menu-open]');
  if (menu && opener && typeof menu.showModal === 'function') {
    opener.addEventListener('click', function () {
      menu.showModal();
      if (lenis) lenis.stop();
    });
    menu.querySelector('[data-menu-close]').addEventListener('click', function () { menu.close(); });
    menu.addEventListener('close', function () {
      if (lenis) lenis.start();
      opener.focus();
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) menu.close();
    });
  } else if (opener) {
    opener.hidden = true;
  }

  /* ---- reveal on scroll: one quiet fade, nothing that moves far ---- */
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  if (rv.length) {
    if (!motion || !('IntersectionObserver' in window)) {
      rv.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      rv.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- the hero photograph drifts a little as you leave it ---- */
  var heroMedia = document.querySelector('.hero__media');
  if (motion && heroMedia) {
    // the individual `translate` property, so it never fights GSAP's own transform on the same element
    var drift = function () {
      var y = Math.min(window.scrollY, window.innerHeight);
      heroMedia.style.translate = '0 ' + Math.round(y * 0.1) + 'px';
    };
    window.addEventListener('scroll', drift, { passive: true });
    drift();
  }

  /* ---- a clip's poster is fetched only when its band is about to scroll in, so it never competes with the hero ---- */
  var posterOf = [].slice.call(document.querySelectorAll('video.clip[data-poster]'));
  if (posterOf.length) {
    var setPoster = function (v) { v.setAttribute('poster', v.getAttribute('data-poster')); v.removeAttribute('data-poster'); };
    if ('IntersectionObserver' in window) {
      var pio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { setPoster(e.target); pio.unobserve(e.target); } }); }, { rootMargin: '700px 0px 700px 0px' });
      posterOf.forEach(function (v) { pio.observe(v); });
    } else { posterOf.forEach(setPoster); }
  }

  /* ---- clips: load only near the screen, never on a phone, never when asked to save data ---- */
  var clips = [].slice.call(document.querySelectorAll('video.clip[data-src]'));
  var phone = window.matchMedia('(max-width: 760px)').matches;
  var conn = navigator.connection || {};
  var thrifty = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  if (clips.length && !reduce && !phone && !thrifty && 'IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.getAttribute('src')) { v.setAttribute('src', v.getAttribute('data-src')); v.load(); }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (v.getAttribute('src')) {
          v.pause();
        }
      });
    }, { rootMargin: '300px 0px 300px 0px', threshold: 0.01 });
    clips.forEach(function (v) { vio.observe(v); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clips.forEach(function (v) { v.pause(); });
    });
  }
})();
