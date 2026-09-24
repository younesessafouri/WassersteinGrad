/* WassersteinGrad project page — progressive enhancement only.
   Every figure, number and equation is in the HTML; this file adds motion
   and the few controls. */

/*<shapes>*/
/* One-dimensional schematics (sections 01 and 03). Not model output.
   Every copy is the same profile, shifted and slightly rescaled, so the
   copies form a location–scale family. For such a family the 1-D Wasserstein
   barycenter is exact and closed-form: average the quantile functions, which
   means averaging the shifts and the scales. The pointwise mean is the plain
   average of the densities. */
var WGShapes = (function () {
  var TAU = Math.PI * 2;
  var SHIFT = [-1, -0.64, -0.33, -0.08, 0.15, 0.4, 0.66, 0.84];     /* mean 0 */
  var SCALE = [0.05, -0.06, 0.025, -0.02, 0.06, -0.04, 0.01, -0.025];  /* mean 0 */
  var CENTRE = 0.48;
  var SAMPLES = 121;

  function gauss(t, m, s) { var z = (t - m) / s; return Math.exp(-0.5 * z * z) / (s * Math.sqrt(TAU)); }
  /* the explanation's profile: a main lobe with a shoulder */
  function profile(t) { return 0.72 * gauss(t, 0, 0.05) + 0.28 * gauss(t, 0.085, 0.028); }
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }

  function xs() { var a = []; for (var k = 0; k < SAMPLES; k++) a.push(k / (SAMPLES - 1)); return a; }
  function copy(i, spread, x) { var w = 1 + SCALE[i]; return profile((x - CENTRE - spread * SHIFT[i]) / w) / w; }
  function pointwise(spread, x) { var s = 0; for (var i = 0; i < SHIFT.length; i++) s += copy(i, spread, x); return s / SHIFT.length; }
  function barycenter(spread, x) {
    var d = spread * mean(SHIFT), w = 1 + mean(SCALE);
    return profile((x - CENTRE - d) / w) / w;
  }
  /* deterministic high-frequency noise for the "values change" panel */
  function noise(i, x) {
    var f = [13, 19, 26, 33, 41], s = 0;
    for (var k = 0; k < f.length; k++) s += Math.sin(TAU * f[k] * x + 1.7 * (i + 1) * (k + 2) + i * i * 0.37);
    return s / f.length;
  }
  /* copies come in near-antithetic pairs, as an idealised "noise that averages out" */
  function noisy(i, x) {
    var sign = i % 2 ? -0.85 : 1, j = i >> 1;
    return profile(x - CENTRE) * (1 + 0.5 * sign * noise(j, x)) + 0.12 * sign * noise(j + 4, x);
  }

  var PEAK = (function () { var m = 0, a = xs(); for (var k = 0; k < a.length; k++) m = Math.max(m, profile(a[k] - CENTRE)); return m; })();

  /* polyline in a W×H box: baseline at H - pad, the profile's peak at top */
  function path(fn, W, H, top, pad) {
    var a = xs(), base = H - pad, out = '';
    for (var k = 0; k < a.length; k++) {
      var y = base - fn(a[k]) / PEAK * (base - top);
      out += (k ? 'L' : 'M') + Math.round(a[k] * W) + ' ' + y.toFixed(1);
    }
    return out;
  }
  function peakOf(fn) { var m = 0, a = xs(); for (var k = 0; k < a.length; k++) m = Math.max(m, fn(a[k])); return m / PEAK; }

  return {
    count: SHIFT.length, path: path, peakOf: peakOf,
    copy: copy, pointwise: pointwise, barycenter: barycenter, noisy: noisy,
    profile: function (x) { return profile(x - CENTRE); }
  };
})();
/*</shapes>*/

(function () {
  'use strict';
  if (typeof document === 'undefined') return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var each = function (sel, fn, root) { Array.prototype.forEach.call((root || document).querySelectorAll(sel), fn); };

  function onceInView(el, fn, margin) {
    if (!el) return;
    if (!hasIO) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); fn(); }
    }, { rootMargin: margin || '0px 0px -15% 0px' });
    io.observe(el);
  }

  /* ------------------------------------------------------------ reveal */
  each('[data-reveal]', function (el) {
    if (reduce) { el.classList.add('is-in'); return; }
    onceInView(el, function () { el.classList.add('is-in'); });
  });

  /* ------------------------------------------------------ nav + spy */
  var nav = document.querySelector('.nav');
  if (nav) {
    var stuck = function () { nav.classList.toggle('is-stuck', window.scrollY > 24); };
    stuck();
    window.addEventListener('scroll', stuck, { passive: true });
  }
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (navLinks.length && hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) {
      var t = document.querySelector(a.getAttribute('href'));
      if (t) spy.observe(t);
    });
  }

  /* ------------------------------------- lead time, one state per page */
  var lead = 't1';
  function setLead(next) {
    if (next === lead) return;
    lead = next;
    each('[data-lead]', function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lead') === next)); });
    each('[data-lead-text]', function (el) { el.textContent = el.getAttribute('data-lead-text-' + next) || ''; });
    each('img[data-src-' + next + ']', function (img) {
      var src = img.getAttribute('data-src-' + next);
      if (img.getAttribute('src') === src) return;
      if (reduce) { img.src = src; return; }
      var pre = new Image();
      pre.onload = function () {
        img.classList.add('is-swapping');
        setTimeout(function () { img.src = src; img.classList.remove('is-swapping'); }, 180);
      };
      pre.src = src;
    });
  }
  each('[data-lead]', function (b) {
    b.addEventListener('click', function () { setLead(b.getAttribute('data-lead')); });
    b.addEventListener('pointerenter', function () {
      each('img[data-src-' + b.getAttribute('data-lead') + ']', function (img) {
        (new Image()).src = img.getAttribute('data-src-' + b.getAttribute('data-lead'));
      });
    }, { once: true });
  });

  /* --------------------------------------- compare: wipe between maps */
  each('[data-compare]', function (box) {
    var range = box.querySelector('input[type=range]');
    if (!range) return;
    var touched = false;
    function set(v) {
      box.style.setProperty('--pos', v + '%');
      range.value = v;
      range.setAttribute('aria-valuetext', Math.round(100 - v) + '% WassersteinGrad');
    }
    range.addEventListener('input', function () { touched = true; set(+range.value); });
    box.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      touched = true;
      var r = box.getBoundingClientRect();
      set(Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)));
    });
    set(50);
    /* one slow sweep shows what the widget does */
    if (!reduce) {
      onceInView(box, function () {
        var t0 = null;
        function step(ts) {
          if (touched) return;
          if (t0 === null) t0 = ts;
          var k = Math.min(1, (ts - t0) / 2400);
          var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          set(90 - 40 * e);
          if (k < 1) requestAnimationFrame(step);
        }
        set(90);
        requestAnimationFrame(step);
      }, '0px 0px -30% 0px');
    }
  });

  /* ------------------------- 03 · pointwise vs Wasserstein, in one dimension */
  var demo = document.querySelector('[data-demo]');
  if (demo && typeof WGShapes !== 'undefined') {
    var svg = demo.querySelector('svg');
    var vb = svg.viewBox.baseVal;
    var W = vb.width, H = vb.height, TOP = 18, PAD = 14;
    var copies = demo.querySelectorAll('[data-demo-copy]');
    var meanPath = demo.querySelector('[data-demo-mean]');
    var baryPath = demo.querySelector('[data-demo-bary]');
    var baryFill = demo.querySelector('[data-demo-bary-fill]');
    var slider = demo.querySelector('input[type=range]');
    var outMean = demo.querySelector('[data-demo-out-mean]');
    var outBary = demo.querySelector('[data-demo-out-bary]');
    var MAX = 0.22;
    var demoTouched = false;

    var draw = function (v) {
      var s = v / 100 * MAX;
      for (var i = 0; i < copies.length; i++) {
        copies[i].setAttribute('d', WGShapes.path(function (x) { return WGShapes.copy(i, s, x); }, W, H, TOP, PAD));
      }
      var bary = WGShapes.path(function (x) { return WGShapes.barycenter(s, x); }, W, H, TOP, PAD);
      meanPath.setAttribute('d', WGShapes.path(function (x) { return WGShapes.pointwise(s, x); }, W, H, TOP, PAD));
      baryPath.setAttribute('d', bary);
      baryFill.setAttribute('d', bary + 'L' + W + ' ' + (H - PAD) + 'L0 ' + (H - PAD) + 'Z');
      var pm = WGShapes.peakOf(function (x) { return WGShapes.pointwise(s, x); });
      var pb = WGShapes.peakOf(function (x) { return WGShapes.barycenter(s, x); });
      outMean.textContent = Math.round(pm * 100) + ' %';
      outBary.textContent = Math.round(pb * 100) + ' %';
      slider.setAttribute('aria-valuetext', Math.round(v) + ' percent apart; pointwise mean keeps ' + Math.round(pm * 100) + ' percent of the peak, Wasserstein barycenter ' + Math.round(pb * 100) + ' percent');
    };
    slider.addEventListener('input', function () { demoTouched = true; draw(+slider.value); });
    draw(+slider.value);

    /* start with the copies in place, then pull them apart once */
    if (!reduce) {
      var target = +slider.value;
      slider.value = 0; draw(0);
      onceInView(demo, function () {
        var t0 = null;
        function step(ts) {
          if (demoTouched) return;
          if (t0 === null) t0 = ts;
          var k = Math.min(1, (ts - t0) / 2600);
          var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          slider.value = target * e; draw(target * e);
          if (k < 1) requestAnimationFrame(step);
        }
        setTimeout(function () { requestAnimationFrame(step); }, 500);
      }, '0px 0px -35% 0px');
    }
  }

  /* ------------------------------------------ 05 · dumbbell chart hover */
  var chart = document.querySelector('[data-chart]');
  if (chart) {
    var tip = chart.querySelector('.chart-tip');
    var show = function (row, evt) {
      var r = tip.parentNode.getBoundingClientRect();
      var name = row.getAttribute('data-name'), a = row.getAttribute('data-t1'), b = row.getAttribute('data-t5');
      tip.textContent = '';
      var h = document.createElement('p'); h.className = 'tip-h'; h.textContent = name; tip.appendChild(h);
      [['t + 1', a, 'k1'], ['t + 5', b, 'k5']].forEach(function (d) {
        var p = document.createElement('p');
        var k = document.createElement('i'); k.className = d[2];
        var v = document.createElement('b'); v.textContent = d[1];
        p.appendChild(k); p.appendChild(v); p.appendChild(document.createTextNode(' ' + d[0]));
        tip.appendChild(p);
      });
      var box = row.getBoundingClientRect();
      var x = evt && evt.clientX ? evt.clientX - r.left : box.right - r.left - 40;
      tip.style.left = Math.min(r.width - 150, Math.max(0, x + 14)) + 'px';
      tip.style.top = (box.top - r.top - 8) + 'px';
      tip.hidden = false;
      each('.dumbbell-row', function (g) { g.classList.toggle('is-dim', g !== row); }, chart);
    };
    var hide = function () {
      tip.hidden = true;
      each('.dumbbell-row', function (g) { g.classList.remove('is-dim'); }, chart);
    };
    each('.dumbbell-row', function (row) {
      row.addEventListener('pointermove', function (e) { show(row, e); });
      row.addEventListener('pointerleave', hide);
      row.addEventListener('focus', function () { show(row); });
      row.addEventListener('blur', hide);
    }, chart);
  }

  /* ------------------------------------------------------ copy BibTeX */
  each('[data-copy]', function (btn) {
    var src = document.getElementById(btn.getAttribute('data-copy'));
    if (!src) return;
    var label = btn.textContent;
    function done(ok) {
      btn.textContent = ok ? 'Copied ✓' : 'Select and copy';
      setTimeout(function () { btn.textContent = label; }, 1800);
    }
    btn.addEventListener('click', function () {
      var text = src.textContent.trim();
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback(text)); });
      } else { done(fallback(text)); }
    });
  });
  function fallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
})();
