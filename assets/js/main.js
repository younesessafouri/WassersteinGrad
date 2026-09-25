/* WassersteinGrad project page — progressive enhancement only.
   Everything below is optional: the page is complete without JS. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ nav */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Highlight the section currently in view */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var targets = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (targets.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* --------------------------------------------------------------- reveal */
  var revealables = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('in'); });
  } else {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(revealables, function (el) { revealer.observe(el); });
  }

  /* ------------------------------------------------- lead-time switching */
  /* Table 1, LLE_cos column (x10^3), lower is better. */
  var LLE_COS = {
    t1: [
      { name: 'BaseGrad',       v: 3.5, ours: false },
      { name: 'IntegratedGrad', v: 2.9, ours: false },
      { name: 'SmoothGrad',     v: 2.1, ours: false },
      { name: 'VarGrad',        v: 2.3, ours: false },
      { name: 'WG_Bary',        v: 0.1, ours: true  },
      { name: 'WG_Bary×Grad',   v: 3.6, ours: true  }
    ],
    t5: [
      { name: 'BaseGrad',       v: 4.2, ours: false },
      { name: 'IntegratedGrad', v: 6.3, ours: false },
      { name: 'SmoothGrad',     v: 2.6, ours: false },
      { name: 'VarGrad',        v: 3.0, ours: false },
      { name: 'WG_Bary',        v: 0.2, ours: true  },
      { name: 'WG_Bary×Grad',   v: 4.3, ours: true  }
    ]
  };

  var barsBody = document.getElementById('bars-body');

  function label(name) {
    return name
      .replace('WG_Bary×Grad', 'WG<sub>Bary×Grad</sub>')
      .replace('WG_Bary', 'WG<sub>Bary</sub>');
  }

  /* The markup is always written immediately, so the numbers are present
     whatever happens to the observer. Only the fill width waits for the
     section to scroll into view. */
  var barsVisible = false;

  function paintBars() {
    if (!barsBody) return;
    Array.prototype.forEach.call(barsBody.querySelectorAll('.bar-fill'), function (f) {
      f.style.width = f.dataset.w + '%';
    });
  }

  function renderBars(lead) {
    if (!barsBody) return;
    var rows = LLE_COS[lead];
    var max = rows.reduce(function (m, r) { return Math.max(m, r.v); }, 0);

    barsBody.innerHTML = rows.map(function (r) {
      return '<div class="bar-row' + (r.ours ? ' ours' : '') + '">' +
               '<span class="lbl">' + label(r.name) + '</span>' +
               '<span class="bar-track"><span class="bar-fill" data-w="' +
                 (r.v / max * 100).toFixed(1) + '"></span></span>' +
               '<span class="val">' + r.v.toFixed(1) + '</span>' +
             '</div>';
    }).join('');

    if (!barsVisible) return;
    if (reduceMotion) paintBars();
    else requestAnimationFrame(function () { requestAnimationFrame(paintBars); });
  }

  var barsSection = barsBody && barsBody.closest('.bars');
  function armBars(lead) {
    renderBars(lead);
    if (!barsSection || reduceMotion || !('IntersectionObserver' in window)) {
      barsVisible = true; paintBars(); return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      if (!entries[0].isIntersecting) return;
      barsVisible = true;
      requestAnimationFrame(paintBars);
      obs.disconnect();
    }, { threshold: 0.1 });
    io.observe(barsSection);
  }

  /* One lead time for the whole page: every t+1 / t+5 toggle, every
     lead-dependent image and the bar chart follow the same state. */
  var currentLead = 't1';
  var leadImgs = document.querySelectorAll('img[data-src-t1][data-src-t5]');
  var leadNotes = document.querySelectorAll('[data-lead-show]');
  var segButtons = document.querySelectorAll('.seg button[data-lead]');

  function setLead(lead) {
    if (lead === currentLead) return;
    currentLead = lead;

    Array.prototype.forEach.call(segButtons, function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lead === lead));
    });

    Array.prototype.forEach.call(leadNotes, function (el) {
      el.hidden = el.getAttribute('data-lead-show') !== lead;
    });

    Array.prototype.forEach.call(leadImgs, function (img) {
      var next = img.getAttribute('data-src-' + lead);
      var alt = img.getAttribute('data-alt-' + lead);
      if (img.getAttribute('src') === next) return;
      var swap = function () {
        img.src = next;
        if (alt) img.alt = alt;
      };
      if (reduceMotion) { swap(); return; }
      var pre = new Image();
      pre.onload = function () {
        img.style.opacity = '0';
        setTimeout(function () {
          swap();
          img.style.opacity = '1';
        }, 160);
      };
      pre.src = next;
    });

    renderBars(lead);
  }

  Array.prototype.forEach.call(segButtons, function (b) {
    b.addEventListener('click', function () { setLead(b.dataset.lead); });
  });

  armBars(currentLead);

  /* ---------------------------------------------------- comparison slider */
  var cmp = document.getElementById('compare');
  if (cmp) {
    var top = cmp.querySelector('[data-compare="top"]');
    var handle = cmp.querySelector('.compare-handle');
    var pos = 50;

    function setPos(p) {
      pos = Math.max(0, Math.min(100, p));
      top.style.clipPath = 'inset(0 0 0 ' + pos + '%)';
      handle.style.left = pos + '%';
      cmp.setAttribute('aria-valuenow', Math.round(pos));
      cmp.setAttribute('aria-valuetext', Math.round(pos) + '% WassersteinGrad');
    }

    function fromEvent(e) {
      var r = cmp.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      setPos(x / r.width * 100);
    }

    var dragging = false;
    var start = function (e) { dragging = true; fromEvent(e); };
    var move = function (e) {
      if (!dragging) return;
      if (e.cancelable && e.touches) e.preventDefault();
      fromEvent(e);
    };
    var end = function () { dragging = false; };

    cmp.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    cmp.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);

    cmp.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 10 : 3;
      if (e.key === 'ArrowLeft')       { setPos(pos - step); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { setPos(pos + step); e.preventDefault(); }
      else if (e.key === 'Home')       { setPos(0);   e.preventDefault(); }
      else if (e.key === 'End')        { setPos(100); e.preventDefault(); }
    });

    /* Start with the handle across the WG_Bary region over Brittany */
    setPos(32);
  }

  /* ------------------------------------------------ pressure-level explorer */
  /* 95% ellipses fitted to the panels of the altitude figure, in the
     457 x 366 pixel frame of the level-u-*.webp crops. rx is the minor
     semi-axis, rotated by `a` degrees (clockwise, image coordinates). */
  var LEVELS = {
    '250': { cx: 227.5, cy: 128.9, rx: 49.1, ry: 59.1, a: 57.4,
             label: '250 hPa', desc: 'a broad 95% ellipse over northern France' },
    '500': { cx: 228.0, cy: 128.3, rx: 43.6, ry: 59.4, a: 78.8,
             label: '500 hPa', desc: 'a slightly smaller, more elongated ellipse' },
    '850': { cx: 226.0, cy: 129.6, rx: 33.3, ry: 48.1, a: 74.2,
             label: '850 hPa', desc: 'a clearly smaller ellipse around the target' },
    '10m': { cx: 233.9, cy: 125.1, rx: 14.1, ry: 20.2, a: 61.0,
             label: '10 m', desc: 'a small ellipse close to the target' }
  };

  var stage = document.getElementById('level-stage');
  var ell = document.getElementById('level-ellipse');
  var levelBtns = Array.prototype.slice.call(document.querySelectorAll('.level-picker button[data-level]'));

  if (stage && ell && levelBtns.length) {
    var levelImgs = stage.querySelectorAll('img[data-level]');
    var shown = LEVELS['250'];
    var anim = null;

    var drawEllipse = function (e) {
      ell.setAttribute('cx', e.cx.toFixed(2));
      ell.setAttribute('cy', e.cy.toFixed(2));
      ell.setAttribute('rx', e.rx.toFixed(2));
      ell.setAttribute('ry', e.ry.toFixed(2));
      ell.setAttribute('transform',
        'rotate(' + e.a.toFixed(2) + ' ' + e.cx.toFixed(2) + ' ' + e.cy.toFixed(2) + ')');
    };

    var morphTo = function (target) {
      if (anim) cancelAnimationFrame(anim);
      var from = shown;
      if (reduceMotion) { shown = target; drawEllipse(target); return; }
      var t0 = null, dur = 520;
      var step = function (now) {
        if (t0 === null) t0 = now;
        var p = Math.min(1, (now - t0) / dur);
        var k = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        var cur = {};
        ['cx', 'cy', 'rx', 'ry', 'a'].forEach(function (key) {
          cur[key] = from[key] + (target[key] - from[key]) * k;
        });
        shown = cur;
        drawEllipse(cur);
        anim = p < 1 ? requestAnimationFrame(step) : null;
      };
      anim = requestAnimationFrame(step);
    };

    var selectLevel = function (id, focus) {
      var lv = LEVELS[id];
      if (!lv) return;
      levelBtns.forEach(function (b) {
        var on = b.dataset.level === id;
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      Array.prototype.forEach.call(levelImgs, function (img) {
        img.classList.toggle('is-on', img.dataset.level === id);
      });
      stage.setAttribute('aria-label',
        'Attribution map for zonal wind at ' + lv.label + ', with ' + lv.desc + '.');
      morphTo(lv);
    };

    levelBtns.forEach(function (b, i) {
      b.addEventListener('click', function () { selectLevel(b.dataset.level, false); });
      b.addEventListener('keydown', function (e) {
        var j = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = Math.min(levelBtns.length - 1, i + 1);
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = Math.max(0, i - 1);
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = levelBtns.length - 1;
        if (j === null) return;
        e.preventDefault();
        selectLevel(levelBtns[j].dataset.level, true);
      });
    });
  }

  /* ------------------------------------------------------------ copy bib */
  var copyBtn = document.getElementById('copy-bib');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var src = document.getElementById(copyBtn.dataset.target);
      if (!src) return;
      var text = src.textContent;

      var done = function (ok) {
        copyBtn.textContent = ok ? 'Copied' : 'Press ⌘C';
        copyBtn.classList.toggle('done', ok);
        setTimeout(function () {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('done');
        }, 2000);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); },
                                                 function () { done(false); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:absolute;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        document.body.removeChild(ta);
        done(ok);
      }
    });
  }
})();
