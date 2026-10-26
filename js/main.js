// Formulár: demo režim nič neodosiela, ostrý režim posiela na endpoint zo site.json (data-endpoint).
(function () {
  document.querySelectorAll('form.formular').forEach(function (f) {
    var stav = f.querySelector('.formular-stav');
    f.addEventListener('submit', function (e) {
      var endpoint = f.getAttribute('data-endpoint');
      var demo = f.getAttribute('data-demo') === '1';
      e.preventDefault();
      if (f.querySelector('.past input').value) return;   // robot
      if (demo || !endpoint) {
        stav.textContent = 'Ukážka formulára: nič sa neodosiela. Po spustení webu príde správa na e-mail firmy.';
        return;
      }
      stav.textContent = 'Odosielam…';
      fetch(endpoint, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); f.reset(); stav.textContent = 'Ďakujeme, správa bola odoslaná.'; })
        .catch(function () { stav.textContent = 'Odoslanie sa nepodarilo. Napíšte nám, prosím, e-mailom.'; });
    });
  });
})();

// Menu na mobile
(function () {
  var b = document.querySelector('.burger'), m = document.getElementById('menu');
  if (!b || !m) return;
  b.addEventListener('click', function () {
    var o = m.classList.toggle('otvorene');
    b.setAttribute('aria-expanded', o ? 'true' : 'false');
  });
  m.addEventListener('click', function (e) {
    if (e.target.closest('a')) { m.classList.remove('otvorene'); b.setAttribute('aria-expanded', 'false'); }
  });
})();

// Hĺbkomer: ukazuje hĺbku vrstvy, v ktorej sa práve čitateľ nachádza (kóty sekcií data-hlbka, 0 → 2,5 m)
(function () {
  var h = document.querySelector('.hlbkomer');
  var vrstvy = Array.prototype.slice.call(document.querySelectorAll('[data-hlbka]'));
  if (!h || !vrstvy.length) return;
  var hodnota = h.querySelector('.hlbkomer-hodnota'), cakam = false, MAX = 2.5;
  function prepocitaj() {
    cakam = false;
    var stred = scrollY + innerHeight * 0.45, d = 0;
    var body = vrstvy.map(function (v) { return [v.getBoundingClientRect().top + scrollY, +v.dataset.hlbka]; });
    for (var i = 0; i < body.length; i++) {
      if (stred < body[i][0]) break;
      var dalsi = body[i + 1];
      if (!dalsi) { d = body[i][1]; break; }
      var t = Math.min(1, (stred - body[i][0]) / Math.max(1, dalsi[0] - body[i][0]));
      d = body[i][1] + (dalsi[1] - body[i][1]) * t;
    }
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 2) d = MAX;
    h.style.setProperty('--p', (d / MAX).toFixed(4));
    hodnota.textContent = d.toFixed(2).replace('.', ',') + ' m';
  }
  addEventListener('scroll', function () { if (!cakam) { cakam = true; requestAnimationFrame(prepocitaj); } }, { passive: true });
  addEventListener('resize', prepocitaj);
  prepocitaj();
})();

// Rez ryhou: šírka podľa lopaty (1 m = 128 px v SVG)
(function () {
  var skupina = document.querySelector('.rez-ryha');
  if (!skupina) return;
  var vykop = skupina.querySelector('.rez-vykop');
  var ks = document.querySelector('.ks-ciara'), kt = document.querySelector('.ks-text');
  var popis = document.querySelector('.rez-popis');
  var tlacidla = document.querySelectorAll('.lopaty button');
  function nastav(btn) {
    var cm = +btn.dataset.cm, plan = btn.dataset.plan === '1';
    tlacidla.forEach(function (x) { x.setAttribute('aria-checked', x === btn ? 'true' : 'false'); });
    var w = 128 * cm / 100;
    // planírovacia lopata: plytký široký záber, nie ryha
    skupina.style.transform = 'scale(' + (cm / 100) + ', ' + (plan ? 0.09 : 1) + ')';
    ks.setAttribute('x1', 320 - w / 2); ks.setAttribute('x2', 320 + w / 2);
    kt.textContent = cm + ' cm';
    popis.textContent = btn.dataset.popis;
  }
  tlacidla.forEach(function (b) { b.addEventListener('click', function () { nastav(b); }); });
  var vychodzi = document.querySelector('.lopaty button[aria-checked="true"]');
  if (vychodzi) nastav(vychodzi);
})();

// Galéria – lightbox
(function () {
  var d = document.querySelector('.lightbox');
  var polozky = Array.prototype.slice.call(document.querySelectorAll('.galeria-polozka'));
  if (!d || !polozky.length || typeof d.showModal !== 'function') return;
  var obr = d.querySelector('img'), txt = d.querySelector('.lightbox-popis'), i = 0;
  function ukaz(n) {
    i = (n + polozky.length) % polozky.length;
    var p = polozky[i], alt = p.querySelector('img').alt;
    obr.src = p.dataset.full; obr.alt = alt; txt.textContent = alt;
  }
  polozky.forEach(function (p, n) { p.addEventListener('click', function () { ukaz(n); d.showModal(); }); });
  d.querySelector('.lb-zavriet').addEventListener('click', function () { d.close(); });
  d.querySelector('.lb-pred').addEventListener('click', function () { ukaz(i - 1); });
  d.querySelector('.lb-dalsia').addEventListener('click', function () { ukaz(i + 1); });
  d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') ukaz(i - 1);
    if (e.key === 'ArrowRight') ukaz(i + 1);
  });
})();

// Galéria – zobraziť všetky
(function () {
  var b = document.querySelector('.galeria-viac');
  if (!b) return;
  b.addEventListener('click', function () {
    document.querySelectorAll('.galeria-dalsie').forEach(function (li) { li.hidden = false; });
    b.hidden = true;
  });
})();

// Jemné odhalenie sekcií
(function () {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ciele = document.querySelectorAll('.uvod-text, .uvod-prace, .ryha-hlava, .rez, .ryha-foto, .vyhoda, .galeria-hlava, .kontakt-info, .formular');
  var io = new IntersectionObserver(function (zaznamy) {
    zaznamy.forEach(function (z) { if (z.isIntersecting) { z.target.classList.add('viditelne'); io.unobserve(z.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  ciele.forEach(function (c) { c.classList.add('odhal'); io.observe(c); });
})();
