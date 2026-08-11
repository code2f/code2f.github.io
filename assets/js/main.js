/* ==========================================================================
   معمار | MEMAR — main.js
   Vanilla JS, keine Abhängigkeiten. Jedes Modul prüft selbst, ob seine
   Elemente auf der aktuellen Seite existieren.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     1. Header — Hintergrund ab Scroll-Position
     ------------------------------------------------------------------ */
  function initHeader() {
    var header = $('.header');
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------
     2. Mobile-Navigation
     ------------------------------------------------------------------ */
  function initNav() {
    var burger = $('.burger');
    var nav    = $('.nav');
    var header = $('.header');
    if (!burger || !nav) return;

    var close = function () {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
      if (header) header.classList.remove('has-open-nav');
    };

    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
      if (header) header.classList.toggle('has-open-nav', open);
    });

    // Beim Klick auf einen Link schließen
    $$('.nav a').forEach(function (a) {
      a.addEventListener('click', close);
    });

    // Escape schließt
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        close();
        burger.focus();
      }
    });

    // Beim Wechsel auf Desktop zurücksetzen
    window.matchMedia('(min-width: 981px)').addEventListener('change', function (e) {
      if (e.matches) close();
    });
  }

  /* ------------------------------------------------------------------
     3. Aktiven Navigationslink markieren
     ------------------------------------------------------------------ */
  function initActiveLink() {
    var file = window.location.pathname.split('/').pop() || 'index.html';

    $$('.nav__link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (href === file) link.classList.add('is-active');
    });
  }

  /* ------------------------------------------------------------------
     4. Scroll-Reveal
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });

    items.forEach(function (el, i) {
      // Gestaffelte Verzögerung innerhalb derselben Gruppe
      var delay = parseInt(el.getAttribute('data-reveal-delay') || '', 10);
      if (isNaN(delay)) delay = (i % 4) * 90;
      el.style.setProperty('--reveal-delay', delay + 'ms');
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     5. Zahlen hochzählen
     ------------------------------------------------------------------ */
  function initCounters() {
    var counters = $$('[data-count]');
    if (!counters.length) return;

    var run = function (el) {
      var target   = parseFloat(el.getAttribute('data-count'));
      var suffix   = el.getAttribute('data-suffix') || '';
      var duration = 1600;

      if (reducedMotion || isNaN(target)) {
        el.textContent = (isNaN(target) ? el.textContent : target) + suffix;
        return;
      }

      var start = null;
      var tick = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(run);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     6. Projektfilter
     ------------------------------------------------------------------ */
  function initFilter() {
    var bar = $('.filters');
    if (!bar) return;

    var buttons = $$('.filter', bar);
    var items   = $$('.project');
    var empty   = $('.projects__empty');

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;

      var cat = btn.getAttribute('data-filter');

      buttons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });

      var shown = 0;
      items.forEach(function (item) {
        var match = cat === 'all' || item.getAttribute('data-category') === cat;
        item.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });

      if (empty) empty.hidden = shown > 0;

      // Lightbox-Reihenfolge an sichtbare Elemente anpassen
      document.dispatchEvent(new CustomEvent('gallery:changed'));
    });
  }

  /* ------------------------------------------------------------------
     7. Lightbox
     ------------------------------------------------------------------ */
  function initLightbox() {
    var box = $('.lightbox');
    if (!box || !$$('.project').length) return;

    var imgEl   = $('.lightbox__figure img', box);
    var titleEl = $('.lightbox__caption strong', box);
    var metaEl  = $('.lightbox__caption span', box);
    var closeBtn = $('.lightbox__close', box);

    var visible = [];
    var index   = 0;
    var lastFocused = null;

    var collect = function () {
      visible = $$('.project').filter(function (p) { return !p.classList.contains('is-hidden'); });
    };
    collect();
    document.addEventListener('gallery:changed', collect);

    var render = function () {
      var item = visible[index];
      if (!item) return;
      var img = $('img', item);
      imgEl.src = img.getAttribute('src');
      imgEl.alt = img.getAttribute('alt') || '';
      titleEl.textContent = item.getAttribute('data-title') || '';
      metaEl.textContent  = item.getAttribute('data-meta') || '';
    };

    var open = function (item) {
      collect();
      index = visible.indexOf(item);
      if (index < 0) index = 0;
      lastFocused = document.activeElement;
      render();
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      closeBtn.focus();
    };

    var close = function () {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      if (lastFocused) lastFocused.focus();
    };

    var step = function (dir) {
      if (!visible.length) return;
      index = (index + dir + visible.length) % visible.length;
      render();
    };

    $$('.project').forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        open(item);
      });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(item);
        }
      });
    });

    closeBtn.addEventListener('click', close);
    $('.lightbox__prev', box).addEventListener('click', function () { step(-1); });
    $('.lightbox__next', box).addEventListener('click', function () { step(1); });

    // Klick auf den Hintergrund schließt
    box.addEventListener('click', function (e) {
      if (e.target === box) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape')     close();
      // RTL: Pfeil links = vorwärts, Pfeil rechts = rückwärts
      if (e.key === 'ArrowLeft')  step(1);
      if (e.key === 'ArrowRight') step(-1);
    });
  }

  /* ------------------------------------------------------------------
     8. Kontaktformular — Validierung (clientseitig)
     ------------------------------------------------------------------ */
  function initForm() {
    var form = $('.form');
    if (!form) return;

    var status = $('.form__status');

    var messages = {
      valueMissing: 'هذا الحقل مطلوب.',
      typeMismatch: 'الرجاء إدخال قيمة صحيحة.',
      tooShort: 'النص قصير جداً.',
      patternMismatch: 'التنسيق غير صحيح.'
    };

    var errorFor = function (input) {
      var v = input.validity;
      if (v.valueMissing)    return messages.valueMissing;
      if (v.typeMismatch)    return input.type === 'email'
                                    ? 'الرجاء إدخال بريد إلكتروني صحيح.'
                                    : messages.typeMismatch;
      if (v.tooShort)        return 'الرجاء إدخال ' + input.minLength + ' أحرف على الأقل.';
      if (v.patternMismatch) return input.getAttribute('data-error') || messages.patternMismatch;
      return '';
    };

    var validate = function (input) {
      var field = input.closest('.field');
      if (!field) return true;

      var slot = $('.field__error', field);
      var msg  = input.checkValidity() ? '' : errorFor(input);

      field.classList.toggle('has-error', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (slot) slot.textContent = msg;

      return !msg;
    };

    var inputs = $$('input, select, textarea', form);

    inputs.forEach(function (input) {
      input.addEventListener('blur', function () { validate(input); });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('has-error')) validate(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var ok = true;
      var firstBad = null;

      inputs.forEach(function (input) {
        if (!validate(input) && ok) { ok = false; firstBad = input; }
      });

      if (!ok) {
        if (status) {
          status.hidden = false;
          status.className = 'form__status form__status--err';
          status.textContent = 'الرجاء تصحيح الحقول المميّزة بالأحمر.';
        }
        if (firstBad) firstBad.focus();
        return;
      }

      // Kein Backend angebunden — Demo-Bestätigung.
      // Zum Scharfschalten: hier fetch() auf den eigenen Endpunkt setzen.
      var btn = $('button[type="submit"]', form);
      if (btn) { btn.disabled = true; btn.textContent = 'جارٍ الإرسال…'; }

      window.setTimeout(function () {
        if (status) {
          status.hidden = false;
          status.className = 'form__status form__status--ok';
          status.textContent = 'شكراً لك! تم استلام رسالتك، وسنتواصل معك خلال يوم عمل واحد.';
        }
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = 'إرسال الطلب'; }
      }, 900);
    });
  }

  /* ------------------------------------------------------------------
     8b. Projektindex — Bildvorschau folgt dem Cursor
     ------------------------------------------------------------------ */
  function initIndexPreview() {
    var list = $('.index');
    var preview = $('.index__preview');
    if (!list || !preview) return;

    // Nur für echte Zeigegeräte; auf Touch übernimmt die Miniatur in der Zeile
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var img = $('img', preview);
    var tag = $('.index__tag', preview);
    var raf = null;
    var cx = 0, cy = 0;

    var place = function () {
      raf = null;
      var w = preview.offsetWidth;
      var h = preview.offsetHeight;
      // RTL: Vorschau bevorzugt links vom Cursor, sonst rechts ausweichen
      var px = cx - w - 32;
      if (px < 12) px = cx + 32;
      px = Math.min(px, window.innerWidth - w - 12);
      var py = Math.min(Math.max(cy - h / 2, 12), window.innerHeight - h - 12);
      preview.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0)';
    };

    list.addEventListener('mousemove', function (e) {
      cx = e.clientX;
      cy = e.clientY;
      if (!raf) raf = requestAnimationFrame(place);
    });

    $$('.index__row', list).forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        var src = row.getAttribute('data-img');
        if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
        img.setAttribute('alt', row.getAttribute('data-alt') || '');
        // Nummer aus der Zeile übernehmen — kein zusätzliches Attribut nötig
        var num = $('.index__num', row);
        if (tag) tag.textContent = num ? num.textContent.trim() : '';
        preview.classList.add('is-on');
      });
    });

    list.addEventListener('mouseleave', function () {
      preview.classList.remove('is-on');
    });
  }

  /* ------------------------------------------------------------------
     9. Nach-oben-Button
     ------------------------------------------------------------------ */
  function initToTop() {
    var btn = $('.to-top');
    if (!btn) return;

    var onScroll = function () {
      btn.classList.toggle('is-visible', window.scrollY > 600);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
     9b. Fortschrittslinie in der Kopfzeile
     ------------------------------------------------------------------ */
  function initProgress() {
    var bar = $('.scroll-progress');
    if (!bar || reducedMotion) return;

    var raf = null;
    var update = function () {
      raf = null;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.setProperty('--progress', Math.min(1, Math.max(0, p)).toFixed(4));
    };

    update();
    window.addEventListener('scroll', function () {
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ------------------------------------------------------------------
     9c. Scroll-Tiefe: Bilder wandern minimal gegen die Scrollrichtung
     ------------------------------------------------------------------ */
  function initParallax() {
    if (reducedMotion) return;
    // Nur wo ein Rahmen das Bild beschneidet — sonst würde es überlaufen
    var items = $$('.hero__frame img, .project__media img');
    if (!items.length) return;

    var AMOUNT = 26;   // Maximalversatz in px
    var raf = null;

    var update = function () {
      raf = null;
      var vh = window.innerHeight;
      items.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;      // außerhalb: überspringen
        var mid = r.top + r.height / 2;
        var p = (mid - vh / 2) / vh;                        // etwa -1 … 1
        el.style.setProperty('--py', (-p * AMOUNT).toFixed(1) + 'px');
      });
    };

    update();
    window.addEventListener('scroll', function () {
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ------------------------------------------------------------------
     10. Jahreszahl im Footer
     ------------------------------------------------------------------ */
  function initYear() {
    $$('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ------------------------------------------------------------------
     Start
     ------------------------------------------------------------------ */
  function init() {
    initHeader();
    initNav();
    initActiveLink();
    initReveal();
    initCounters();
    initFilter();
    initLightbox();
    initIndexPreview();
    initForm();
    initToTop();
    initProgress();
    initParallax();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
