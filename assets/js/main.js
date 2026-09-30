/* ==========================================================================
   Novela Solutions Africa: site behaviour
   ========================================================================== */

/*
 * FORM DELIVERY
 * By default, enquiries open the visitor's email app with the message
 * pre-filled and addressed to CONFIG.email (works with no backend).
 * To receive submissions directly instead, create a free form at
 * https://formspree.io (or similar) and paste its endpoint URL below.
 */
const CONFIG = {
  email: 'mduduzigwija@gmail.com',
  formEndpoint: '' // e.g. 'https://formspree.io/f/abcdwxyz'
};

document.documentElement.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

/* ---------- Footer year ---------- */
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

/* ---------- Live Cape Town clock ---------- */
(function clock() {
  const els = document.querySelectorAll('[data-clock]');
  if (!els.length) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Johannesburg', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const tick = () => { const t = fmt.format(new Date()); els.forEach(el => { el.textContent = t; }); };
  tick();
  setInterval(tick, 1000);
})();

/* ---------- Header border on scroll ---------- */
const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Full-screen menu ---------- */
(function menu() {
  const btn = document.querySelector('.menu-btn');
  const panel = document.getElementById('site-menu');
  if (!btn || !panel) return;
  const setOpen = open => {
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('locked', open);
    if (open) setTimeout(() => panel.querySelector('a')?.focus(), 50);
  };
  btn.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) { setOpen(false); btn.focus(); }
  });
})();

/* ---------- Wordmark: fit to width + letters stretch toward the pointer ---------- */
(function wordmark() {
  const mark = document.querySelector('.wordmark');
  if (!mark) return;
  const letters = [...mark.querySelectorAll('span')];

  function fit() {
    mark.style.fontSize = '100px';
    const natural = letters.reduce((w, l) => w + l.getBoundingClientRect().width, 0);
    const avail = mark.clientWidth;
    mark.style.fontSize = `${Math.floor((100 * avail / natural) * 0.985)}px`;
  }
  fit();
  document.fonts?.ready.then(fit);
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fit, 100); });

  if (reduceMotion || !finePointer) return;
  const hero = mark.closest('.hero') || mark;
  let raf = null, px = 0;
  hero.addEventListener('pointermove', e => {
    px = e.clientX;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const reach = mark.clientWidth * 0.32;
      letters.forEach(l => {
        const r = l.getBoundingClientRect();
        const d = Math.abs(px - (r.left + r.width / 2));
        const s = 1 + 0.2 * Math.max(0, 1 - d / reach);
        l.style.transform = `scaleY(${s.toFixed(3)})`;
      });
    });
  });
  hero.addEventListener('pointerleave', () => letters.forEach(l => { l.style.transform = ''; }));
})();

/* ---------- About portrait: orbit photo, tilt/parallax, typing code card ---------- */
(function portrait() {
  const fig = document.querySelector('[data-portrait]');
  if (!fig) return;
  const img = fig.querySelector('.portrait-photo');

  // Photo lives at assets/img/portrait.jpg (.jpeg/.png/.webp also work); the illustration shows until then.
  const candidates = ['portrait.jpg', 'portrait.jpeg', 'portrait.png', 'portrait.webp'];
  (function tryNext(i) {
    if (i >= candidates.length) return;
    const probe = new Image();
    probe.onload = () => { img.src = probe.src; img.hidden = false; fig.classList.add('has-photo'); };
    probe.onerror = () => tryNext(i + 1);
    probe.src = `assets/img/${candidates[i]}`;
  })(0);

  // Tap toggles full colour on touch screens (hover does it with a mouse).
  fig.addEventListener('click', () => fig.classList.toggle('color'));

  // Typing code card.
  const code = fig.querySelector('[data-typer]');
  const tokens = [
    ['k', 'const'], ['', ' dev = {\n  name: '], ['s', '"Mduduzi"'], ['', ',\n  city: '], ['s', '"Cape Town"'],
    ['', ',\n  builds: ['], ['s', '"web"'], ['', ', '], ['s', '"apps"'], ['', ', '], ['s', '"data"'],
    ['', '],\n  available: '], ['b', 'true'], ['', '\n};']
  ];
  let typing = false;
  function type() {
    if (typing) return;
    typing = true;
    code.textContent = '';
    if (reduceMotion) {
      tokens.forEach(([cls, text]) => { const s = document.createElement('span'); s.className = cls; s.textContent = text; code.appendChild(s); });
      typing = false;
      return;
    }
    let t = 0, c = 0, span = null;
    (function step() {
      if (t >= tokens.length) { typing = false; return; }
      const [cls, text] = tokens[t];
      if (!span) { span = document.createElement('span'); span.className = cls; code.appendChild(span); }
      span.textContent += text[c++];
      if (c >= text.length) { t++; c = 0; span = null; }
      setTimeout(step, text[c - 1] === '\n' ? 140 : 28 + Math.random() * 40);
    })();
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { type(); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(fig);
  } else type();
  fig.addEventListener('mouseenter', type);

  // Gentle 3D tilt + parallax between photo and code card.
  if (reduceMotion || !finePointer) return;
  fig.addEventListener('pointermove', e => {
    const r = fig.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    fig.style.setProperty('--rx', `${(x * 8).toFixed(2)}deg`);
    fig.style.setProperty('--ry', `${(-y * 8).toFixed(2)}deg`);
    fig.style.setProperty('--px', `${(x * 12).toFixed(1)}px`);
    fig.style.setProperty('--py', `${(y * 12).toFixed(1)}px`);
  });
  fig.addEventListener('pointerleave', () => ['--rx', '--ry', '--px', '--py'].forEach(v => fig.style.removeProperty(v)));
})();

/* ---------- Scroll reveal ---------- */
function observeReveals(root = document) {
  const els = root.querySelectorAll('.reveal:not(.in)');
  if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}

/* ---------- Count-up numbers ---------- */
(function countUp() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const run = el => {
    const end = Number(el.dataset.count), suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = end + suffix; return; }
    const start = performance.now(), dur = 1400;
    const step = now => {
      const p = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
  }), { threshold: 0.6 });
  els.forEach(el => io.observe(el));
})();

/* ---------- Services accordion ---------- */
document.querySelectorAll('.svc-row').forEach(row => {
  row.addEventListener('click', () => {
    const item = row.closest('.svc');
    const open = !item.classList.contains('open');
    item.classList.toggle('open', open);
    row.setAttribute('aria-expanded', String(open));
  });
});

/* ---------- Showreel play / pause + timecode ---------- */
(function reel() {
  const reelEl = document.querySelector('.reel');
  if (!reelEl) return;
  const btn = reelEl.querySelector('[data-reel-toggle]');
  const bar = reelEl.querySelector('.reel-progress i');
  const time = reelEl.querySelector('[data-reel-time]');
  const LENGTH = 30;
  let playing = !reduceMotion, elapsed = 0, last = performance.now();
  const icons = {
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5v14l12-7z"/></svg>'
  };
  const pad = n => String(Math.floor(n)).padStart(2, '0');
  function render() {
    bar.style.transform = `scaleX(${elapsed / LENGTH})`;
    time.textContent = `00:${pad(elapsed)} / 00:${LENGTH}`;
  }
  function setPlaying(p) {
    playing = p;
    reelEl.classList.toggle('paused', !p);
    btn.innerHTML = p ? icons.pause : icons.play;
    btn.setAttribute('aria-label', p ? 'Pause animation' : 'Play animation');
    last = performance.now();
  }
  function loop(now) {
    if (playing) { elapsed = (elapsed + (now - last) / 1000) % LENGTH; render(); }
    last = now;
    requestAnimationFrame(loop);
  }
  btn.addEventListener('click', () => setPlaying(!playing));
  setPlaying(playing);
  render();
  requestAnimationFrame(loop);
})();

/* ---------- Case study artwork ----------
   Flat geometric scenes, one per project. Elements with `hv-*` classes
   animate on hover (or when scrolled into view on touch screens). */
const C = { O: '#ff4c33', Y: '#d4f542', B: '#94bcee', G: '#d9d9d9', K: '#1d1a1a', W: '#ffffff', P: '#f3f3ef' };
const label = (x, y, s, fill, size = 20, anchor = 'middle') =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="Martian Mono, monospace" font-size="${size}" text-anchor="${anchor}" dominant-baseline="central" letter-spacing="1">${s}</text>`;

// Browser window whose page content scrolls on hover.
function browser({ x, y, w, h, id, scroll, content }) {
  const bar = 34;
  return `<defs><clipPath id="${id}"><path d="M${x} ${y + bar}H${x + w}V${y + h - 16}a16 16 0 0 1-16 16H${x + 16}a16 16 0 0 1-16-16Z"/></clipPath></defs>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${C.W}"/>
    <g clip-path="url(#${id})"><g class="hv-scroll" style="--scroll:${scroll}px">${content}</g></g>
    <rect x="${x}" y="${y + bar}" width="${w}" height="1.5" fill="${C.G}"/>
    <circle cx="${x + 22}" cy="${y + 17}" r="5" fill="${C.K}"/><circle cx="${x + 38}" cy="${y + 17}" r="5" fill="${C.G}"/><circle cx="${x + 54}" cy="${y + 17}" r="5" fill="${C.G}"/>
    <rect x="${x + w / 2 - 70}" y="${y + 10}" width="140" height="14" rx="7" fill="${C.P}"/>`;
}
const cursor = (x, y) =>
  `<g class="hv-cursor"><path transform="translate(${x} ${y})" d="M0 0V22L6 16.5L11 26L15 24.5L10 15H19Z" fill="${C.K}" stroke="${C.W}" stroke-width="1.6"/></g>`;

const ART = {
  // Lease register: windows light up, lease statuses flip to active, a key slides in.
  lease: () => {
    const wins = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++)
      wins.push(`<rect class="hv-win" style="--i:${(r * 3 + c) % 7}" x="${104 + c * 64}" y="${134 + r * 46}" width="44" height="30" rx="4" fill="${C.G}"/>`);
    const rows = [0, 1, 2, 3].map(i => {
      const y = 150 + i * 56;
      return `<rect x="380" y="${y}" width="110" height="12" rx="6" fill="${C.G}"/><rect x="380" y="${y + 20}" width="70" height="8" rx="4" fill="${C.G}"/>
        <rect class="hv-status" style="--i:${i}" x="520" y="${y - 2}" width="72" height="26" rx="13" fill="${i === 0 ? C.Y : C.O}"/>`;
    }).join('');
    return `<rect width="800" height="450" fill="${C.B}"/>
      <rect x="0" y="398" width="800" height="52" fill="${C.K}"/>
      <rect x="70" y="100" width="230" height="16" fill="${C.K}"/><rect x="80" y="112" width="210" height="288" fill="${C.K}"/>
      ${wins.join('')}
      <rect x="160" y="362" width="50" height="38" fill="${C.Y}"/>
      <rect x="350" y="70" width="270" height="310" rx="16" fill="${C.W}"/>
      ${label(380, 104, 'LEASE REGISTER', C.K, 15, 'start')}
      <rect x="380" y="124" width="210" height="2" fill="${C.G}"/>
      ${rows}
      <g class="hv-key">
        <circle cx="700" cy="300" r="30" fill="none" stroke="${C.K}" stroke-width="14"/>
        <rect x="590" y="295" width="82" height="11" fill="${C.K}"/>
        <rect x="598" y="305" width="11" height="16" fill="${C.K}"/><rect x="618" y="305" width="11" height="11" fill="${C.K}"/>
      </g>`;
  },
  // Leave app: days get booked one by one, then an approval stamp lands.
  leave: () => {
    const booked = { '1,1': 0, '1,2': 1, '1,3': 2, '1,4': 3, '2,1': 4, '2,2': 5 };
    const cells = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
      const i = booked[`${r},${c}`];
      cells.push(`<rect${i !== undefined ? ` class="hv-day" style="--i:${i}"` : ''} x="${124 + c * 54}" y="${150 + r * 56}" width="44" height="44" rx="8" fill="${C.P}"/>`);
    }
    return `<rect width="800" height="450" fill="${C.Y}"/>
      <rect x="100" y="60" width="420" height="340" rx="18" fill="${C.W}"/>
      <rect x="100" y="60" width="420" height="70" rx="18" fill="${C.K}"/><rect x="100" y="110" width="420" height="22" fill="${C.K}"/>
      ${label(130, 96, 'LEAVE', C.W, 18, 'start')}
      <circle cx="450" cy="96" r="7" fill="${C.O}"/><circle cx="474" cy="96" r="7" fill="${C.G}"/>
      ${cells.join('')}
      <g class="hv-stamp"><circle cx="490" cy="345" r="54" fill="${C.K}"/><path d="M464 345l18 18 34-36" fill="none" stroke="${C.W}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></g>
      <circle class="hv-rays" cx="660" cy="150" r="86" fill="none" stroke="${C.O}" stroke-width="12" stroke-dasharray="10 16"/>
      <circle cx="660" cy="150" r="58" fill="${C.O}"/>`;
  },
  // University application: the form scrolls, one application flows out to many universities.
  uni: () => {
    const fields = [0, 1, 2, 3, 4, 5].map(i => {
      const y = 176 + i * 62;
      return `<rect x="90" y="${y}" width="${[90, 120, 70, 110, 80, 130][i]}" height="9" rx="4.5" fill="${C.G}"/>
        <rect x="90" y="${y + 17}" width="350" height="28" rx="14" fill="${C.P}" stroke="${C.K}" stroke-width="1.5"/>`;
    }).join('');
    const content = `<rect x="90" y="118" width="190" height="20" rx="4" fill="${C.K}"/><rect x="90" y="146" width="250" height="10" rx="5" fill="${C.G}"/>
      ${fields}
      <rect x="90" y="552" width="18" height="18" rx="4" fill="${C.K}"/><rect x="118" y="556" width="200" height="10" rx="5" fill="${C.G}"/>
      <rect x="90" y="592" width="140" height="38" rx="19" fill="${C.K}"/>${label(160, 611, 'APPLY', C.W, 14)}`;
    const targets = [[110, -40.2, 178, C.Y, 'UNI A'], [225, 0, 136, C.B, 'UNI B'], [340, 40.2, 178, C.W, 'UNI C']];
    return `<rect width="800" height="450" fill="${C.O}"/>
      ${targets.map(([cy]) => `<path d="M480 225L640 ${cy}" stroke="${C.K}" stroke-width="2" stroke-dasharray="4 6"/>`).join('')}
      ${targets.map(([, a, len], i) => `<g transform="translate(480 225) rotate(${a})"><circle class="hv-slide" style="--len:${len}px;--i:${i}" r="7" fill="${C.K}"/></g>`).join('')}
      ${targets.map(([cy, , , fill, t]) => `<circle cx="660" cy="${cy}" r="46" fill="${fill}"/>${label(660, cy, t, C.K, 14)}`).join('')}
      ${browser({ x: 60, y: 60, w: 420, h: 330, id: 'clip-uni', scroll: -250, content })}
      ${cursor(330, 300)}
      <g class="hv-cap">
        <path d="M410 62L470 36L530 62L470 88Z" fill="${C.K}"/><rect x="444" y="72" width="52" height="24" rx="4" fill="${C.K}"/>
        <path d="M470 62L520 72V102" fill="none" stroke="${C.Y}" stroke-width="3"/><circle cx="520" cy="104" r="5" fill="${C.Y}"/>
      </g>`;
  },
  // Portfolio site: the page scrolls and the project cards fan out.
  folio: () => {
    const content = `<rect x="100" y="110" width="60" height="10" rx="5" fill="${C.K}"/>
      <rect x="360" y="111" width="24" height="8" rx="4" fill="${C.G}"/><rect x="392" y="111" width="24" height="8" rx="4" fill="${C.G}"/><rect x="424" y="111" width="24" height="8" rx="4" fill="${C.G}"/>
      <rect x="100" y="142" width="250" height="30" rx="4" fill="${C.K}"/><rect x="100" y="180" width="180" height="30" rx="4" fill="${C.K}"/>
      <rect x="100" y="224" width="150" height="10" rx="5" fill="${C.G}"/><rect x="100" y="246" width="90" height="26" rx="13" fill="${C.O}"/>
      <circle cx="420" cy="192" r="46" fill="${C.B}"/>
      <rect x="100" y="304" width="120" height="14" rx="4" fill="${C.K}"/>
      <rect x="100" y="330" width="180" height="96" rx="10" fill="${C.O}"/><rect x="290" y="330" width="180" height="96" rx="10" fill="${C.K}"/>
      <rect x="100" y="438" width="180" height="96" rx="10" fill="${C.B}"/><rect x="290" y="438" width="180" height="96" rx="10" fill="${C.G}"/>
      <rect x="70" y="556" width="430" height="70" fill="${C.K}"/>`;
    const card = (cls, fill) => `<g class="${cls}"><rect x="575" y="140" width="150" height="200" rx="14" fill="${C.W}"/>
      <rect x="587" y="152" width="126" height="100" rx="8" fill="${fill}"/><rect x="587" y="266" width="90" height="10" rx="5" fill="${C.K}"/><rect x="587" y="286" width="110" height="8" rx="4" fill="${C.G}"/></g>`;
    return `<rect width="800" height="450" fill="${C.Y}"/>
      ${card('hv-fan hv-fan1', C.K)}${card('hv-fan hv-fan2', C.B)}${card('hv-fan hv-fan3', C.O)}
      ${browser({ x: 70, y: 60, w: 430, h: 330, id: 'clip-folio', scroll: -240, content })}
      ${cursor(300, 260)}`;
  }
};

const CATS = {
  web: { label: 'Web', accent: C.O },
  system: { label: 'System', accent: C.B }
};

// Real projects only. `context` says where each was built; `tags` list only the tools actually used.
const PROJECTS = [
  { title: 'Lease Register: Property Tracker', desc: 'An internal app built for a property management team, letting property officers track the status of leases held for the departments they serve.', cat: 'system', context: 'Internal business tool', tags: ['Power Apps', 'Power Automate', 'Microsoft Lists'], art: 'lease' },
  { title: 'Leave Management App', desc: 'An app for submitting and tracking leave requests, backed by a SQL database on Supabase.', cat: 'system', context: 'Independent build', tags: ['Supabase', 'SQL'], art: 'leave' },
  { title: 'Unified University Application', desc: 'One application platform for all universities. Applicants capture their details once and apply to multiple institutions from a single place.', cat: 'web', context: 'Independent build', tags: [], art: 'uni' },
  { title: 'Personal Portfolio Site', desc: 'A personal portfolio website, designed and hand-coded from scratch to showcase projects and skills.', cat: 'web', context: 'Independent build', tags: ['HTML', 'CSS', 'JavaScript'], art: 'folio' }
];

function caseCard(p, i) {
  const cat = CATS[p.cat];
  const wide = i % 3 === 0;
  const light = i % 3 !== 1;
  return `<article class="case reveal${wide ? ' case--wide' : ''}${light ? ' case--light' : ''}" style="--accent:${cat.accent}">
    <div class="case-head"><span class="tag">${cat.label}</span><span class="mono">${p.context}</span></div>
    <div class="case-art" aria-hidden="true"><svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">${ART[p.art]()}</svg></div>
    <div class="case-foot">
      <h3>${p.title}</h3>
      <p>${p.desc}${p.tags.length ? `<span class="mono case-tags">${p.tags.join(' / ')}</span>` : ''}</p>
      <a class="pill" href="talk.html?service=${p.cat}" aria-label="Start a project like ${p.title}">Build similar →</a>
    </div>
  </article>`;
}

// On touch screens (no hover), play each artwork while it is on screen.
const liveObserver = !finePointer && 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('live', e.isIntersecting)), { threshold: 0.5 })
  : null;

(function cases() {
  const grid = document.querySelector('[data-cases]');
  if (!grid) return;

  function render(filter) {
    let list = PROJECTS;
    if (filter && filter !== 'all') list = list.filter(p => p.cat === filter);
    grid.innerHTML = list.map(caseCard).join('') || '<p class="empty-note">No projects in this category yet.</p>';
    observeReveals(grid);
    if (liveObserver) grid.querySelectorAll('.case').forEach(el => liveObserver.observe(el));
  }

  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      render(btn.dataset.filter);
    });
  });
  render('all');
})();

observeReveals();

/* ---------- Enquiry delivery ---------- */
async function sendEnquiry(subject, fields) {
  if (CONFIG.formEndpoint) {
    const res = await fetch(CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: subject, ...fields })
    });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return 'sent';
  }
  const body = Object.entries(fields).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
  window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return 'mailto';
}

function showStatus(el, type, msg) {
  if (!el) return;
  el.className = `form-status show ${type}`;
  el.textContent = msg;
}

/* ---------- Contact form ---------- */
(function contactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const d = Object.fromEntries(new FormData(form));
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const mode = await sendEnquiry(`Website enquiry from ${d['First name']} ${d['Last name']}`.trim(), d);
      if (mode === 'sent') {
        showStatus(status, 'ok', 'Thanks! Your message has been sent. I\'ll reply within 24 hours.');
        form.reset();
      } else {
        showStatus(status, 'ok', `Your email app should now open with your message ready. Just hit send. If nothing opens, email me at ${CONFIG.email}.`);
      }
    } catch {
      showStatus(status, 'err', `Sorry, something went wrong. Please email me directly at ${CONFIG.email}.`);
    } finally {
      btn.disabled = false;
    }
  });
})();

/* ---------- Project brief wizard ---------- */
(function wizard() {
  const form = document.getElementById('brief-form');
  if (!form) return;
  const steps = [...form.querySelectorAll('fieldset')];
  const fill = document.querySelector('.progress-fill');
  const labelEl = document.querySelector('.progress-label');
  const error = form.querySelector('.wizard-error');
  const progress = document.querySelector('.progress');
  const success = document.getElementById('brief-success');
  let current = 0;

  // Preselect service from ?service=web etc.
  const pre = new URLSearchParams(location.search).get('service');
  if (pre) { const r = form.querySelector(`input[name="Service"][value="${CSS.escape(pre)}"]`); if (r) r.checked = true; }

  function show(i) {
    steps.forEach((s, n) => s.classList.toggle('active', n === i));
    current = i;
    fill.style.width = `${((i + 1) / steps.length) * 100}%`;
    labelEl.textContent = `Step ${String(i + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
    error.textContent = '';
    if (i === steps.length - 1) buildSummary();
    const top = form.getBoundingClientRect().top + window.scrollY - 120;
    if (window.scrollY > top) window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function validate(i) {
    if (i === 0 && !form.querySelector('input[name="Service"]:checked')) {
      error.textContent = 'Please choose the option that best fits your project.';
      return false;
    }
    for (const input of steps[i].querySelectorAll('input, textarea, select')) {
      if (!input.checkValidity()) { input.reportValidity(); return false; }
    }
    return true;
  }

  function labelFor(name) {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.closest('.choice').querySelector('strong').textContent : 'Not given';
  }

  function buildSummary() {
    const dl = document.getElementById('brief-summary');
    if (!dl) return;
    const rows = [['Service', labelFor('Service')], ['Budget', labelFor('Budget')], ['Timeline', labelFor('Timeline')], ['Project', form.elements['Project name'].value || 'Not given']];
    dl.innerHTML = rows.map(([k]) => `<dt>${k}</dt><dd></dd>`).join('');
    dl.querySelectorAll('dd').forEach((dd, n) => { dd.textContent = rows[n][1]; });
  }

  form.addEventListener('click', e => {
    const btn = e.target.closest('[data-nav]');
    if (!btn) return;
    if (btn.dataset.nav === 'next') { if (validate(current)) show(Math.min(current + 1, steps.length - 1)); }
    else show(Math.max(current - 1, 0));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate(current)) return;
    // Pressing Enter on an earlier step advances instead of submitting.
    if (current < steps.length - 1) { show(current + 1); return; }
    const d = Object.fromEntries(new FormData(form));
    ['Service', 'Budget', 'Timeline'].forEach(k => { d[k] = labelFor(k); });
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const mode = await sendEnquiry(`Project brief: ${d['Project name'] || d.Service} (${d['First name']} ${d['Last name']})`, d);
      form.hidden = true; progress.hidden = true; success.hidden = false;
      success.querySelector('[data-msg]').textContent = mode === 'sent'
        ? 'I\'ve received your brief and will be in touch within 24 hours with a personalised proposal.'
        : `Your email app should now be open with your brief ready to send. Just hit send. If nothing opened, email me at ${CONFIG.email}.`;
      success.focus();
    } catch {
      error.textContent = `Sorry, something went wrong. Please email me directly at ${CONFIG.email}.`;
    } finally {
      btn.disabled = false;
    }
  });

  show(0);
})();
