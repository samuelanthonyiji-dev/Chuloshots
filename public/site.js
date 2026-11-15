// Chuloshots page behaviour: reveals, scroll motion, video player, form
(function () {
  var root = document.documentElement;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function pad(n) { return String(n).padStart(2, '0'); }
  function tcode(frames) { var s = Math.floor(frames / 24); return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60) + ':' + pad(frames % 24); }

  // Reveal on scroll
  if (!still && 'IntersectionObserver' in window) {
    root.classList.add('anim');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal], [data-reveal-self], .tools-poster').forEach(function (el) { io.observe(el); });
    // Safety net: never leave on-screen content hidden
    setTimeout(function () { document.querySelectorAll('[data-reveal], [data-reveal-self]').forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); }); }, 2500);
  }

  // Scroll-linked motion: growing photo frames, parallax, belief orb, playhead
  var photos = [].slice.call(document.querySelectorAll('[data-scale]'));
  var orb = document.querySelector('[data-orb]');
  var ph = document.getElementById('ph'), nav = document.querySelector('.nav'), idle;
  var ticking = false;
  // Tools poster: draw a line from every skill circle to the laptop screen
  var tp = document.querySelector('.tools-poster'), svgNS = 'http://www.w3.org/2000/svg';
  function drawLinks() {
    if (!tp || !tp.offsetParent) return;
    var P = tp.getBoundingClientRect(), C = document.getElementById('toolsCut').getBoundingClientRect();
    if (!C.width) return;
    var hx = C.left + C.width * 0.83 - P.left, hy = C.top + C.height * 0.38 - P.top;
    tp.style.setProperty('--hx', hx + 'px'); tp.style.setProperty('--hy', hy + 'px');
    var svg = tp.querySelector('.links'), bubs = tp.querySelectorAll('.bub');
    svg.setAttribute('viewBox', '0 0 ' + P.width + ' ' + P.height);
    if (svg.childNodes.length !== bubs.length) {
      svg.textContent = '';
      bubs.forEach(function (b) { var l = document.createElementNS(svgNS, 'line'); if (b.dataset.dash === '1') l.setAttribute('class', 'dash'); svg.appendChild(l); });
    }
    bubs.forEach(function (b, i) {
      var l = svg.childNodes[i];
      var bx = P.width * parseFloat(b.style.left) / 100, by = P.height * parseFloat(b.style.top) / 100;
      l.setAttribute('x1', bx); l.setAttribute('y1', by); l.setAttribute('x2', hx); l.setAttribute('y2', hy);
    });
  }
  var toolsImg = document.getElementById('toolsCut');
  if (toolsImg && !toolsImg.complete) toolsImg.addEventListener('load', function () { drawLinks(); });

  function frame() {
    ticking = false;
    drawLinks();
    var vh = innerHeight;
    if (!still) {
      photos.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var t = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.8)));
        el.style.setProperty('--s', (0.94 + 0.06 * t).toFixed(4));
        var c = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
        el.style.setProperty('--tx', (c * 6).toFixed(2) + '%');
      });
      if (orb) {
        var rb = orb.parentNode.getBoundingClientRect();
        var tb = Math.min(1, Math.max(0, (vh - rb.top) / (vh + rb.height)));
        orb.style.setProperty('--s', (0.8 + 0.4 * tb).toFixed(4));
      }
    }
    var max = document.documentElement.scrollHeight - vh;
    var p = max > 0 ? scrollY / max : 0;
    if (nav) nav.style.setProperty('--p', p.toFixed(4));
    if (ph) ph.textContent = tcode(Math.round(p * 300 * 24));
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    document.body.classList.add('scrolling'); clearTimeout(idle);
    idle = setTimeout(function () { document.body.classList.remove('scrolling'); }, 700);
  }, { passive: true });
  addEventListener('resize', frame);
  frame();

  // Running timecode on the hero frame
  var tc = document.getElementById('tc'), f = 0;
  if (tc && !still) setInterval(function () { f++; tc.textContent = tcode(f); }, 1000 / 24);


  // Video player: a video only loads when someone picks it from a folder
  var player = document.getElementById('player'), pv = document.getElementById('pVideo'), lastBtn = null;
  function openPlayer(btn) {
    lastBtn = btn;
    document.getElementById('pTitle').textContent = btn.dataset.title;
    document.getElementById('pMeta').textContent = btn.dataset.meta;
    pv.src = btn.dataset.src;
    player.hidden = false; document.body.classList.add('locked');
    var pr = pv.play(); if (pr && pr.catch) pr.catch(function () {});
    document.getElementById('pClose').focus();
  }
  function closePlayer() {
    if (!player || player.hidden) return;
    pv.pause(); pv.removeAttribute('src'); pv.load();
    player.hidden = true; document.body.classList.remove('locked');
    if (lastBtn) lastBtn.focus();
  }
  if (player) {
    document.querySelectorAll('.vrow').forEach(function (b) { b.addEventListener('click', function () { openPlayer(b); }); });
    document.getElementById('pClose').addEventListener('click', closePlayer);
    player.addEventListener('click', function (e) { if (e.target === player) closePlayer(); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') closePlayer(); });
    addEventListener('pagehide', closePlayer);
  }
  // The work section's folders (React) call this to play a video in the player
  window.chuloPlay = function (v) {
    if (!player) return;
    openPlayer({ dataset: { src: v.src, title: v.title, meta: v.meta }, focus: function () {} });
  };
  if (window.ResizeObserver && tp) new ResizeObserver(function () { drawLinks(); }).observe(tp);

  // Package buttons pre-select the package
  document.querySelectorAll('[data-plan]').forEach(function (a) {
    a.addEventListener('click', function () { var f = document.getElementById('f-plan'); if (f) f.value = a.dataset.plan; });
  });

  // Brief form sends to WhatsApp
  var brief = document.getElementById('brief');
  if (brief) brief.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(e.target), note = document.getElementById('formNote');
    if (!d.get('name') || !d.get('email')) { note.textContent = 'Add your name and email so Chuloshots can reply.'; return; }
    var body = 'Name: ' + d.get('name') + '\nEmail: ' + d.get('email') + '\nVideo: ' + d.get('type') + '\nPackage: ' + d.get('plan') + '\n\n' + d.get('message');
    window.open('https://wa.me/2348139590267?text=' + encodeURIComponent('Hi Chuloshots, new edit brief:\n\n' + body), '_blank', 'noopener');
    note.textContent = 'WhatsApp should open with your brief. If it doesn\'t, message +234 813 959 0267 directly.';
  });

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
