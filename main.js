/* Goodbye, Eri · fan blog. One rAF scroll loop + IntersectionObserver, no libraries. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lang = localStorage.getItem('ge-lang') === 'en' ? 'en' : 'id';
  const t = (id, en) => (lang === 'en' ? en : id);

  /* ---------- boot ---------- */
  $$('.title-jp').forEach(h => $$('i', h).forEach((c, i) => c.style.setProperty('--i', i)));
  requestAnimationFrame(() => body.classList.add('booted'));
  $('#startRec').addEventListener('click', () => $('#info').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));

  /* ---------- language ---------- */
  function applyLang() {
    document.documentElement.lang = lang;
    $$('[data-en]').forEach(el => {
      if (el.dataset.id === undefined) el.dataset.id = el.innerHTML;
      el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.id;
    });
    $$('[data-en-alt]').forEach(el => {
      if (el.dataset.idAlt === undefined) el.dataset.idAlt = el.alt;
      el.alt = lang === 'en' ? el.dataset.enAlt : el.dataset.idAlt;
    });
    $('#lang').textContent = lang === 'en' ? 'EN / ID' : 'ID / EN';
    $$('.tl-clip').forEach(c => { $('span', c).textContent = c._label(); });
    renderReel();
    renderCam();
    lastArc = null;
  }
  $('#lang').addEventListener('click', () => {
    lang = lang === 'en' ? 'id' : 'en';
    localStorage.setItem('ge-lang', lang);
    applyLang();
    tick();
  });

  /* ---------- handheld sway ---------- */
  const sway = $('#sway');
  sway.addEventListener('click', () => {
    const on = sway.getAttribute('aria-pressed') !== 'true';
    sway.setAttribute('aria-pressed', on);
    body.classList.toggle('sway', on && !reduce);
  });

  /* ---------- edit timeline ---------- */
  const scenes = $$('main > section[data-arc]');
  const track = $('#tlTrack');
  const head = $('#tlHead');
  const clips = scenes.map(sec => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tl-clip';
    b._label = () => `${sec.dataset.arc} ${lang === 'en' ? sec.dataset.enLabel : sec.dataset.label}`;
    b.innerHTML = '<span></span>';
    b.setAttribute('aria-label', sec.dataset.label);
    b.addEventListener('click', () => sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));
    track.appendChild(b);
    return b;
  });

  /* ---------- HUD ---------- */
  const tc = $('#tc'), batt = $('#batt'), battPct = $('#battPct'), hudArc = $('#hudArc'), iso = $('#iso');
  const pull = $('#pull');
  const navLinks = $$('.bar-nav a');
  const isoBy = { '00': 400, '01': 400, '02': 800, '03': 1600, '04': 200, '05': 3200, '06': 640, '07': 6400, '08': 3200, '09': 100 };
  const pad = n => String(n).padStart(2, '0');
  let lastArc = null, vh = innerHeight, maxScroll = 1, offsets = [];

  function measure() {
    vh = innerHeight;
    maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
    offsets = scenes.map(s => ({ top: s.offsetTop, h: s.offsetHeight }));
    const total = offsets.reduce((a, o) => a + o.h, 0);
    clips.forEach((c, i) => c.style.setProperty('--w', (offsets[i].h / total * 100).toFixed(2)));
  }

  function tick() {
    const y = scrollY;
    const p = Math.min(1, Math.max(0, y / maxScroll));
    // a 24-minute short at 24fps
    const f = Math.floor(p * 24 * 60 * 24);
    tc.textContent = `00:${pad(Math.floor(f / 1440))}:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`;
    const level = Math.max(.03, 1 - p * .97);
    batt.style.setProperty('--batt', level.toFixed(3));
    battPct.textContent = Math.round(level * 100) + '%';
    batt.parentElement.classList.toggle('low', level < .15);

    // playhead + per-clip fill
    const w = track.clientWidth;
    head.style.setProperty('--x', (p * w).toFixed(1) + 'px');
    const mid = y + vh * .45;
    let cur = 0;
    offsets.forEach((o, i) => {
      if (mid >= o.top) cur = i;
      const fill = Math.min(1, Math.max(0, (mid - o.top) / o.h));
      clips[i].style.setProperty('--fill', fill.toFixed(3));
    });
    if (cur !== lastArc) {
      lastArc = cur;
      const s = scenes[cur];
      const story = /^\d+$/.test(s.dataset.arc);
      hudArc.textContent = `${story ? 'CUT' : 'REEL'} ${s.dataset.arc} · ${lang === 'en' ? s.dataset.enLabel : s.dataset.label}`;
      iso.textContent = isoBy[s.dataset.arc] || 400;
      clips.forEach((c, i) => c.classList.toggle('on', i === cur));
      const navId = story && s.id !== 'boot' ? 'spoiler' : s.id;
      navLinks.forEach(a => a.classList.toggle('on', a.hash === '#' + navId));
    }

    // pull back into the theater
    if (pull) {
      const r = (y - pull.offsetTop - pull.offsetParent.offsetTop + vh * .2) / (pull.offsetHeight - vh);
      pull.style.setProperty('--p', Math.min(1, Math.max(0, r)).toFixed(3));
    }
  }

  let queued = false;
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; tick(); }); }
  }, { passive: true });
  addEventListener('resize', () => { measure(); tick(); });
  addEventListener('load', () => { measure(); tick(); });

  /* ---------- focus-pull reveal ---------- */
  $$('.page').forEach(pg => $$('.panel', pg).forEach((p, i) => p.style.setProperty('--i', i % 6)));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  $$('.panel').forEach(p => io.observe(p));
  ['.infobox', '.info-copy', '.stat', '.char', '.loc', '.cam-lab', '.still', '.gate-inner', '.theme', '.fact', '.run li', '.read']
    .forEach(sel => $$(sel).forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--i', i % 6); io.observe(el); }));

  /* ---------- stat counters ---------- */
  const countIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const el = e.target, end = parseFloat(el.dataset.count), dec = String(el.dataset.count).includes('.') ? 1 : 0;
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = reduce ? 0 : 1100;
    const step = now => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1;
      el.textContent = pre + (end * (1 - Math.pow(1 - k, 3))).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- cast: FILM / RAW ---------- */
  $$('.raw-toggle').forEach(btn => btn.addEventListener('click', () => {
    const card = btn.closest('.char'), on = !card.classList.contains('raw');
    card.classList.toggle('raw', on);
    btn.setAttribute('aria-pressed', on);
  }));

  /* ---------- camera lab ---------- */
  const camPage = $('#camPage'), camNote = $('#camNote');
  const camNotes = {
    stable: ['Hampir setiap halaman memakai susunan panel lebar yang sama, seperti layar ponsel yang dipegang mendatar. Ritmenya tenang dan konsisten, seperti rekaman yang terus berjalan.', 'Nearly every page uses the same stack of wide panels, like a phone held sideways. The rhythm is calm and constant, like footage that never stops rolling.'],
    shake: ['Gambar sedikit bergoyang untuk mengingatkan bahwa ada tangan yang memegang kamera. Kita melihat lewat mata Yuta, bukan mata narator yang netral.', 'Frames wobble slightly to remind you a hand is holding the camera. We see through Yuta, not a neutral narrator.'],
    blur: ['Fokus yang lepas lalu kembali, seperti kamera ponsel yang mencari subjek. Fujimoto memakainya di momen yang terlalu berat untuk dilihat jelas.', 'Focus drifts and snaps back, like a phone camera hunting for its subject. Fujimoto uses it for moments too heavy to see clearly.'],
    glitch: ['Panel yang rusak atau pecah piksel. Teori pembaca: ini potongan yang dibuang Yuta. Baca hanya panel-panel ini, dan kamu melihat film yang tak pernah ingin ia buat.', 'Warped, pixelated panels. Reader theory: these are shots Yuta cut. Read only these and you see the film he never meant to make.'],
  };
  function renderCam() { camNote.textContent = t(...camNotes[camPage.dataset.mode]); }
  $$('.cam-modes button').forEach(b => b.addEventListener('click', () => {
    $$('.cam-modes button').forEach(x => x.setAttribute('aria-checked', x === b));
    camPage.dataset.mode = b.dataset.mode;
    renderCam();
  }));

  /* ---------- gallery lightbox ---------- */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  $$('.still').forEach(s => s.addEventListener('click', () => {
    const img = $('img', s);
    lbImg.src = img.src; lbImg.alt = img.alt;
    lbCap.textContent = lang === 'en' ? s.dataset.enCap : s.dataset.cap;
    lb.showModal();
  }));
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });

  /* ---------- fun facts ---------- */
  $$('.fact').forEach(f => f.addEventListener('click', () => f.classList.toggle('open')));

  /* ---------- explosions ---------- */
  const flash = $('#flash');
  function kaboom() {
    if (reduce) return;
    flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
    body.classList.remove('shake'); void body.offsetWidth; body.classList.add('shake');
    setTimeout(() => body.classList.remove('shake'), 600);
  }
  const hosp = $('#boomHospital');
  new IntersectionObserver((es, ob) => es.forEach(e => {
    if (e.intersectionRatio > .7) {
      hosp.classList.add('boom'); kaboom();
      clips[scenes.indexOf($('#a2'))].classList.add('boom');
      ob.disconnect();
    }
  }), { threshold: [.7] }).observe(hosp);

  /* ---------- reticle (pointer only) ---------- */
  const ret = $('#reticle');
  if (matchMedia('(pointer: fine)').matches) {
    body.classList.add('has-pointer');
    addEventListener('pointermove', e => {
      ret.style.setProperty('--mx', e.clientX + 'px');
      ret.style.setProperty('--my', e.clientY + 'px');
      ret.classList.toggle('lock', !!e.target.closest('.panel, .finale-stage'));
    }, { passive: true });
  }

  /* ---------- projector ---------- */
  const genres = [['Laga', 'Action'], ['Horor', 'Horror'], ['Romansa', 'Romance'], ['Fiksi ilmiah', 'Sci-fi'], ['Dokumenter', 'Documentary'], ['Animasi', 'Animation'], ['Vampir', 'Vampires'], ['Film bisu', 'Silent film'], ['Komedi', 'Comedy'], ['Ledakan', 'Explosions']];
  let reel = 1, gi = 0;
  const reelNo = $('#reelNo'), reelGenre = $('#reelGenre'), reelBox = $('.reel-screen');
  function renderReel() {
    reelNo.textContent = 'FILM #' + String(reel).padStart(3, '0');
    reelGenre.textContent = t(...genres[gi]);
  }
  $('#reelNext').addEventListener('click', () => {
    reel += 1 + Math.floor(Math.random() * 9);
    gi = (gi + 1) % genres.length;
    renderReel();
    reelBox.classList.remove('flick'); void reelBox.offsetWidth; reelBox.classList.add('flick');
  });

  /* ---------- viewfinder: Eri photo reel, user snaps while in focus ---------- */
  const vf = $('#viewfinder'), reelEl = $('#vfReel'), strip = $('#strip'), vfCount = $('#vfCount');
  const eriShots = [
    ['assets/eri-roof.webp', '50% 22%'], ['assets/cast-eri.webp', '30% 35%'], ['assets/cast-eri-film.webp', '50% 45%'],
    ['assets/cover.webp', '50% 30%'], ['assets/cover-en.webp', '50% 34%'],
  ];
  const HUNT = 2200;
  const vfImgs = eriShots.map(([src, pos]) => {
    const im = new Image();
    im.alt = ''; im.decoding = 'async'; im.loading = 'lazy'; im.src = src; im.style.objectPosition = pos;
    reelEl.appendChild(im);
    return im;
  });
  vf.style.setProperty('--hunt', HUNT + 'ms');
  let vfi = 0, vfStart = 0, vfTimer = 0, shots = 0;
  function showEri(i) {
    vfImgs[vfi].classList.remove('on');
    vfi = i % vfImgs.length;
    const im = vfImgs[vfi];
    void im.offsetWidth; im.classList.add('on');
    vfStart = performance.now();
    vfCount.textContent = `ERI · ${vfi + 1}/${vfImgs.length}`;
  }
  const isSharp = () => { const k = ((performance.now() - vfStart) % HUNT) / HUNT; return k > .3 && k < .7; };
  function loop() {
    vf.classList.toggle('sharp-now', isSharp());
    if (performance.now() - vfStart >= HUNT) showEri(vfi + 1);
    vfTimer = requestAnimationFrame(loop);
  }
  new IntersectionObserver(([e]) => {
    vf.classList.toggle('live', e.isIntersecting && !reduce);
    cancelAnimationFrame(vfTimer);
    if (e.isIntersecting && !reduce) { showEri(vfi); loop(); }
  }, { threshold: .2 }).observe(vf);
  showEri(0);
  function shoot() {
    const sharp = reduce || isSharp(), [src, pos] = eriShots[vfi];
    vf.classList.remove('snap'); void vf.offsetWidth; vf.classList.add('snap');
    $('.strip-empty', strip)?.remove();
    const s = document.createElement('span');
    s.className = 'shot' + (sharp ? ' sharp' : '');
    s.style.backgroundImage = `url(${src})`;
    s.style.backgroundPosition = pos;
    if (!sharp) s.style.filter = 'blur(2px)';
    s.innerHTML = `<em>${sharp ? 'OK' : 'NG'} ${String(++shots).padStart(2, '0')}</em>`;
    strip.appendChild(s);
    if (strip.children.length > 14) strip.firstElementChild.remove();
    strip.scrollLeft = strip.scrollWidth;
  }
  vf.addEventListener('click', shoot);

  /* ---------- notebook ---------- */
  const pages = $$('.nb-page');
  let nb = 0;
  $('#nbNext').addEventListener('click', () => {
    pages[nb].classList.remove('is-on');
    nb = (nb + 1) % pages.length;
    pages[nb].classList.add('is-on');
  });

  /* ---------- finale ---------- */
  const stage = $('#stage'), debris = $('#debris');
  for (let i = 0; i < 26; i++) {
    const d = document.createElement('i');
    const ang = Math.random() * Math.PI * 2, dist = 160 + Math.random() * 420;
    d.style.cssText = `--s:${6 + Math.random() * 18}px;--dx:${(Math.cos(ang) * dist).toFixed(0)}px;--dy:${(Math.sin(ang) * dist * .7 - 120).toFixed(0)}px;--rot:${(Math.random() * 720 - 360).toFixed(0)}deg`;
    debris.appendChild(d);
  }
  $$('.end-opt').forEach(btn => btn.addEventListener('click', () => {
    if (btn.dataset.end !== 'boom') { btn.classList.add('cut'); return; }
    stage.classList.add('boom');
    clips[scenes.indexOf($('#a9'))].classList.add('boom');
    kaboom();
    setTimeout(kaboom, 260);
    setTimeout(() => $('.goodbye .btn-mini').focus({ preventScroll: true }), 2800);
  }));
  $('#replay').addEventListener('click', () => {
    stage.classList.remove('boom');
    $$('.end-opt').forEach(b => b.classList.remove('cut'));
    scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  applyLang();
  measure();
  tick();
})();
