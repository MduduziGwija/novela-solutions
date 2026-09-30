/* ==========================================================================
   Novela Solutions Africa — site behaviour
   ========================================================================== */

/*
 * FORM DELIVERY
 * By default, enquiries open the visitor's email app with the message
 * pre-filled and addressed to CONFIG.email (works with no backend).
 * To receive submissions directly instead, create a free form at
 * https://formspree.io (or similar) and paste its endpoint URL below.
 */
const CONFIG = {
  email: 'hello@novelasolutions.africa',
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

/* ---------- Case study artwork (flat geometric compositions) ---------- */
const C = { O: '#ff4c33', Y: '#d4f542', B: '#94bcee', G: '#d9d9d9', V: '#122d8b', K: '#1d1a1a', W: '#ffffff' };
const label = (x, y, s, fill, size = 20) =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="Martian Mono, monospace" font-size="${size}" font-weight="400" text-anchor="middle" dominant-baseline="central" letter-spacing="1">${s}</text>`;

const ART = {
  web: (t, v) => {
    const [bg, dot] = v % 2 ? [C.Y, C.O] : [C.O, C.Y];
    return `<rect width="800" height="450" fill="${bg}"/>
      <g class="s1"><rect x="90" y="70" width="470" height="320" rx="18" fill="${C.W}"/>
        <circle cx="120" cy="98" r="6" fill="${C.K}"/><circle cx="140" cy="98" r="6" fill="${C.G}"/><circle cx="160" cy="98" r="6" fill="${C.G}"/>
        <rect x="120" y="142" width="270" height="28" rx="14" fill="${C.K}"/><rect x="120" y="182" width="190" height="14" rx="7" fill="${C.G}"/>
        <rect x="120" y="214" width="112" height="34" rx="17" fill="${C.K}"/>
        <rect x="120" y="282" width="126" height="78" rx="12" fill="${C.G}"/><rect x="258" y="282" width="126" height="78" rx="12" fill="${C.G}"/><rect x="396" y="282" width="126" height="78" rx="12" fill="${C.G}"/></g>
      <g class="s2"><circle cx="610" cy="296" r="116" fill="${dot}"/>${label(610, 296, t, C.K, 24)}</g>
      <rect class="s3" x="630" y="72" width="76" height="76" rx="8" fill="${C.K}"/>`;
  },
  system: (t, v) => {
    const accent = v % 2 ? C.O : C.B;
    const nodes = [[140, 110], [290, 110], [140, 260], [290, 260], [140, 380], [440, 380]];
    return `<rect width="800" height="450" fill="${C.W}"/>
      <g class="s1" stroke="${C.K}" stroke-width="2">
        <path d="M140 110H290M140 110V380M290 110V260H140M290 260L560 225M140 380H440L560 225" fill="none"/>
        ${nodes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="30" fill="${C.G}" stroke="none"/>`).join('')}
      </g>
      <g class="s2"><circle cx="570" cy="225" r="126" fill="${accent}"/>${label(570, 225, t, C.K, 24)}</g>
      <circle class="s3" cx="720" cy="80" r="34" fill="${C.K}"/>`;
  },
  dashboard: (t, v) => {
    const hs = v % 2 ? [120, 190, 150, 250, 210, 300, 260] : [160, 110, 230, 180, 280, 220, 320];
    const fills = [C.G, C.Y, C.G, C.B, C.G, C.Y, C.W];
    return `<rect width="800" height="450" fill="${C.K}"/>
      <g class="s1">${hs.map((h, i) => `<rect x="${70 + i * 66}" y="${390 - h}" width="48" height="${h}" rx="6" fill="${fills[i]}"/>`).join('')}
        <rect x="60" y="398" width="470" height="2" fill="${C.G}"/></g>
      <g class="s2"><circle cx="640" cy="170" r="112" fill="${C.O}"/>${label(640, 170, t, C.K, 24)}</g>
      <rect class="s3" x="640" y="330" width="64" height="64" rx="8" fill="${C.Y}"/>`;
  },
  brand: (t) => `<rect width="800" height="450" fill="${C.B}"/>
      <circle class="s1" cx="300" cy="235" r="150" fill="${C.O}"/>
      <g class="s2"><circle cx="490" cy="205" r="108" fill="${C.Y}"/>${label(490, 205, t, C.K, 24)}</g>
      <rect class="s3" x="620" y="300" width="84" height="84" rx="10" fill="${C.K}"/>
      <circle cx="140" cy="90" r="30" fill="${C.W}"/>`
};

const CATS = {
  web: { label: 'Web design', accent: C.O },
  system: { label: 'System', accent: C.B },
  dashboard: { label: 'Dashboard', accent: C.Y },
  brand: { label: 'Branding', accent: '#fc74dd' }
};

const PROJECTS = [
  { title: 'Retail Pro — E-commerce Site', desc: 'Full online store for a Cape Town clothing brand, with product management, cart, and payments.', cat: 'web', tags: ['React', 'Stripe', 'SEO'], art: 'SHOP' },
  { title: 'HR Management System', desc: 'Custom HR platform for a mid-sized company — leave management, payroll reports, and staff portal.', cat: 'system', tags: ['Node.js', 'PostgreSQL'], art: 'HR' },
  { title: 'Sales Analytics Dashboard', desc: 'Real-time dashboard tracking 12 KPIs across regional branches with a live alert system.', cat: 'dashboard', tags: ['React', 'Chart.js'], art: '12 KPI' },
  { title: 'Law Firm Website', desc: 'Clean, authoritative website for a Johannesburg law firm with blog, team bios, and case enquiry form.', cat: 'web', tags: ['WordPress', 'SEO'], art: 'LAW' },
  { title: 'Inventory & POS System', desc: 'Point-of-sale and stock management system built for a multi-branch hardware store.', cat: 'system', tags: ['Python', 'Electron'], art: 'POS' },
  { title: 'Brand Identity — TechStartup', desc: 'Logo, colour palette, typography guide, and brand assets for a Nairobi startup.', cat: 'brand', tags: ['Figma', 'Illustrator'], art: 'ID' },
  { title: 'Logistics Tracking Dashboard', desc: 'Live map-based dashboard for a courier company to track drivers and deliveries in real time.', cat: 'dashboard', tags: ['Mapbox', 'Socket.io'], art: 'LIVE' },
  { title: 'Restaurant Booking Site', desc: 'Reservation system with online table booking, menu showcase, and kitchen-side order panel.', cat: 'web', tags: ['Next.js', 'Supabase'], art: 'BOOK' },
  { title: 'NGO Donor Portal', desc: 'Web platform for a non-profit to manage donors, track donations, and publish annual impact reports.', cat: 'system', tags: ['Vue.js', 'Firebase'], art: 'NGO' }
];

function caseCard(p, i, variant) {
  const cat = CATS[p.cat];
  const wide = i % 3 === 0;
  const light = i % 3 !== 1;
  return `<article class="case reveal${wide ? ' case--wide' : ''}${light ? ' case--light' : ''}" style="--accent:${cat.accent}">
    <div class="case-head"><span class="tag">${cat.label}</span><span class="mono">${p.tags.join(' / ')}</span></div>
    <div class="case-art" aria-hidden="true"><svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">${ART[p.cat](p.art, variant)}</svg></div>
    <div class="case-foot">
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <a class="pill" href="talk.html?service=${p.cat}" aria-label="Start a project like ${p.title}">Build similar →</a>
    </div>
  </article>`;
}

(function cases() {
  const grid = document.querySelector('[data-cases]');
  if (!grid) return;
  const featured = grid.dataset.cases === 'featured';
  const variantOf = p => PROJECTS.filter(q => q.cat === p.cat).indexOf(p);

  function render(filter) {
    let list = featured ? [PROJECTS[0], PROJECTS[2], PROJECTS[5]] : PROJECTS;
    if (filter && filter !== 'all') list = list.filter(p => p.cat === filter);
    grid.innerHTML = list.map((p, i) => caseCard(p, i, variantOf(p))).join('') || '<p class="empty-note">No projects in this category yet.</p>';
    observeReveals(grid);
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
        showStatus(status, 'ok', 'Thanks! Your message has been sent. We\'ll reply within 24 hours.');
        form.reset();
      } else {
        showStatus(status, 'ok', `Your email app should now open with your message ready — just hit send. If nothing opens, email us at ${CONFIG.email}.`);
      }
    } catch {
      showStatus(status, 'err', `Sorry, something went wrong. Please email us directly at ${CONFIG.email}.`);
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
    return checked ? checked.closest('.choice').querySelector('strong').textContent : '—';
  }

  function buildSummary() {
    const dl = document.getElementById('brief-summary');
    if (!dl) return;
    const rows = [['Service', labelFor('Service')], ['Budget', labelFor('Budget')], ['Timeline', labelFor('Timeline')], ['Project', form.elements['Project name'].value || '—']];
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
      const mode = await sendEnquiry(`Project brief: ${d['Project name'] || d.Service} — ${d['First name']} ${d['Last name']}`, d);
      form.hidden = true; progress.hidden = true; success.hidden = false;
      success.querySelector('[data-msg]').textContent = mode === 'sent'
        ? 'We\'ve received your brief and will be in touch within 24 hours with a personalised proposal.'
        : `Your email app should now be open with your brief ready to send — just hit send. If nothing opened, email us at ${CONFIG.email}.`;
      success.focus();
    } catch {
      error.textContent = `Sorry, something went wrong. Please email us directly at ${CONFIG.email}.`;
    } finally {
      btn.disabled = false;
    }
  });

  show(0);
})();
