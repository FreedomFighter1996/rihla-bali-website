(function () {
  var PHONE = '447902163328';
  var MSG = {
    ar: 'مرحباً رحلة بالي، أرغب بالتخطيط لرحلة إلى بالي.\nالتواريخ: \nعدد المسافرين: \nنوع الرحلة (عائلة / زوجين / أصدقاء): ',
    en: 'Hello Rihla Bali, I would like to plan a trip to Bali.\nDates: \nNumber of travellers: \nTrip type (family / couple / friends): '
  };
  var root = document.documentElement;
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-en]'));
  nodes.forEach(function (n) { n.setAttribute('data-ar', n.innerHTML); });

  function setWa(lang) {
    var href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(MSG[lang]);
    document.querySelectorAll('a.wa').forEach(function (a) {
      a.href = href; a.target = '_blank'; a.rel = 'noopener';
    });
  }

  function setLang(lang) {
    nodes.forEach(function (n) { n.innerHTML = n.getAttribute(lang === 'en' ? 'data-en' : 'data-ar'); });
    root.lang = lang;
    root.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.title = lang === 'en' ? 'Rihla Bali | All of Bali’s wow, designed around you' : 'رحلة بالي | Rihla Bali';
    setWa(lang);
    try { localStorage.setItem('rb-lang', lang); } catch (e) {}
  }

  if (/[?&]shot/.test(location.search)) root.classList.add('shot');
  var saved = 'ar';
  try { saved = localStorage.getItem('rb-lang') || 'ar'; } catch (e) {}
  if (/[?&]lang=en/.test(location.search)) saved = 'en';
  setLang(saved);

  document.getElementById('lang').addEventListener('click', function () {
    setLang(root.lang === 'en' ? 'ar' : 'en');
  });

  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('solid', window.scrollY > 60); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // animated counters
  function runCount(el) {
    var to = parseFloat(el.getAttribute('data-to')), dec = +(el.getAttribute('data-dec') || 0), t0 = null;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1600, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec); if (p < 1) requestAnimationFrame(step); }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || root.classList.contains('shot')) { el.textContent = to.toFixed(dec); return; }
    requestAnimationFrame(step);
  }
  var counts = document.querySelectorAll('.count');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } }); }, { threshold: 0.6 });
    counts.forEach(function (c) { co.observe(c); });
  } else counts.forEach(runCount);

  // scroll-driven trip map: the star flies to the active day
  var PTS = window.TRIP_PTS || [], star = document.getElementById('trip-star'), label = document.getElementById('trip-label');
  var AR = '١٢٣٤٥٦٧';
  function setDay(i) {
    if (!star || !PTS[i]) return;
    star.style.transform = 'translate(' + PTS[i][0] + 'px,' + (PTS[i][1] - 5) + 'px)';
    document.querySelectorAll('.pin').forEach(function (p) { p.classList.toggle('on', +p.getAttribute('data-i') <= i); });
    document.querySelectorAll('.route .seg').forEach(function (s) { s.classList.toggle('done', +s.getAttribute('data-i') <= i); });
    document.querySelectorAll('.tday').forEach(function (d) { d.classList.toggle('active', +d.getAttribute('data-i') === i); });
    if (label) label.textContent = root.lang === 'en' ? 'Day ' + (i + 1) : 'اليوم ' + AR[i];
  }
  setDay(0);
  var days = Array.prototype.slice.call(document.querySelectorAll('.tday')), cur = -1, ticking = false;
  function pick() {
    ticking = false;
    var mid = window.innerHeight / 2, best = 0, bd = 1e9;
    days.forEach(function (d, k) { var r = d.getBoundingClientRect(), c = r.top + r.height / 2, dd = Math.abs(c - mid); if (dd < bd) { bd = dd; best = k; } });
    if (best !== cur) { cur = best; setDay(best); }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(pick); } }, { passive: true });
  window.addEventListener('resize', pick);
  pick();
})();
