(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(() => root.classList.add('is-ready'));

  /* zigzag cut on the slip's bottom edge */
  const zig = document.getElementById('zigpath');
  if (zig) {
    let d = 'M0 0H440';
    for (let x = 440; x > 0; x -= 20) d += `L${x - 10} 14L${x - 20} 0`;
    zig.setAttribute('d', d + 'Z');
  }

  /* entrances: staggered, once, never hidden without script */
  const targets = document.querySelectorAll('.reveal, .wipe, .foot-mark');
  if (!reduce && 'IntersectionObserver' in window) {
    document.querySelectorAll('section, footer').forEach((sec) => {
      sec.querySelectorAll('.reveal').forEach((el, i) => el.style.setProperty('--d', `${i * 80}ms`));
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add('in'));
  }

  /* slow drift on the panorama */
  const pano = document.querySelector('.panorama img');
  if (pano && !reduce) {
    const box = pano.parentElement;
    pano.style.transform = 'scale(1.12)';
    const tick = () => {
      const r = box.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
      pano.style.transform = `translate3d(0, ${(p - 0.5) * -6}%, 0) scale(1.12)`;
    };
    addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true });
    tick();
  }

  /* the live thing: choose a cloth */
  const cloths = [
    { name: 'Navy barathea', desc: 'A close, dry weave that holds a sharp edge. The ground of the dark suit, for the office and for the evening.' },
    { name: 'Charcoal flannel', desc: 'Soft-faced and weighted, it drapes in a way hard cloths do not. For trousers and the three-piece.' },
    { name: 'Stone twill', desc: 'A lighter neutral with a visible diagonal rib. Carries a woman’s jacket and a man’s summer suit alike.' },
    { name: 'Bottle herringbone', desc: 'A deep green broken-line weave: quiet from across the room, rich up close.' },
  ];
  const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
  const weaves = [...document.querySelectorAll('[data-weave]')];
  const panel = document.getElementById('cloth-panel');
  const swatch = document.querySelector('.swatch');
  const select = (i, focus) => {
    tabs.forEach((t, n) => { t.setAttribute('aria-selected', n === i); t.tabIndex = n === i ? 0 : -1; });
    weaves.forEach((w, n) => w.toggleAttribute('hidden', n !== i));
    document.getElementById('cloth-name').textContent = cloths[i].name;
    document.getElementById('cloth-desc').textContent = cloths[i].desc;
    swatch.setAttribute('aria-label', `Cloth swatch: ${cloths[i].name.toLowerCase()}`);
    panel.setAttribute('aria-labelledby', `tab-${i}`);
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (k) { e.preventDefault(); select((i + k + tabs.length) % tabs.length, true); }
      if (e.key === 'Home') { e.preventDefault(); select(0, true); }
      if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
    });
  });
})();
