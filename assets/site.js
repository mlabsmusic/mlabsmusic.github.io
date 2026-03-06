(function setupMeshBackground() {
  const canvas = document.getElementById('meshBackground');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const particles = [];
  const seed = 64;

  function makeParticle(index) {
    const base = index / seed;
    return {
      x: Math.random(),
      y: Math.random(),
      vx: (Math.sin(base * 90) * 0.35) + ((Math.random() - 0.5) * 0.2),
      vy: (Math.cos(base * 110) * 0.35) + ((Math.random() - 0.5) * 0.2),
      r: 1 + Math.random() * 1.8,
      color: {
        r: 115 + Math.floor(Math.random() * 65),
        g: 200 + Math.floor(Math.random() * 45),
        b: 245 + Math.floor(Math.random() * 10)
      }
    };
  }

  for (let i = 0; i < seed; i += 1) {
    particles.push(makeParticle(i));
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawBackground(width, height) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgb(5,13,31)');
    gradient.addColorStop(0.5, 'rgb(6,18,42)');
    gradient.addColorStop(1, 'rgb(4,11,24)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const glowA = ctx.createRadialGradient(width * 0.13, height * 0.2, 0, width * 0.13, height * 0.2, 260);
    glowA.addColorStop(0, 'rgba(122,230,255,0.16)');
    glowA.addColorStop(1, 'rgba(122,230,255,0)');
    ctx.fillStyle = glowA;
    ctx.beginPath();
    ctx.arc(width * 0.13, height * 0.2, 260, 0, Math.PI * 2);
    ctx.fill();

    const glowB = ctx.createRadialGradient(width * 0.84, height * 0.82, 0, width * 0.84, height * 0.82, 320);
    glowB.addColorStop(0, 'rgba(72,142,255,0.17)');
    glowB.addColorStop(1, 'rgba(72,142,255,0)');
    ctx.fillStyle = glowB;
    ctx.beginPath();
    ctx.arc(width * 0.84, height * 0.82, 320, 0, Math.PI * 2);
    ctx.fill();
  }

  function reflected(value, velocity, t) {
    const travel = value + (velocity * t);
    const period = 2;
    let wrapped = travel % period;
    if (wrapped < 0) wrapped += period;
    return wrapped > 1 ? (2 - wrapped) : wrapped;
  }

  function drawFrame(timeSeconds) {
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;

    drawBackground(width, height);

    const motion = prefersReducedMotion ? 0 : timeSeconds;
    const linkDistance = Math.min(220, Math.max(140, width * 0.13));
    const points = [];

    for (const p of particles) {
      const x = reflected(p.x, p.vx * 0.015, motion) * width;
      const y = reflected(p.y, p.vy * 0.015, motion) * height;
      points.push({ x, y, r: p.r, color: p.color });
    }

    for (let i = 0; i < points.length; i += 1) {
      const from = points[i];
      for (let j = i + 1; j < points.length; j += 1) {
        const to = points[j];
        const dx = from.x - to.x;
        const dy = from.y - to.y;
        const distance = Math.sqrt((dx * dx) + (dy * dy));
        if (distance > linkDistance) continue;
        const opacity = Math.max(0, 1 - (distance / linkDistance));
        ctx.strokeStyle = `rgba(178,216,255,${0.01 + (opacity * 0.13)})`;
        ctx.lineWidth = 0.32 + (opacity * 0.7);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    }

    for (const p of points) {
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      glow.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},0.22)`);
      glow.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},0.9)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  resize();
  drawFrame(0);

  if (!prefersReducedMotion) {
    let last = 0;
    function animate(ts) {
      if (ts - last >= 1000 / 20) {
        drawFrame(ts / 1000);
        last = ts;
      }
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    drawFrame(performance.now() / 1000);
  });
})();

(function setupApp() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let revealObserver = null;
  let navigating = false;

  function markEntered() {
    requestAnimationFrame(() => {
      document.body.classList.add('is-entered');
    });
  }

  function shouldHandleAsClientNav(link, event) {
    if (!link) return false;
    if (event.defaultPrevented) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.target && link.target !== '_self') return false;
    if (link.hasAttribute('download')) return false;

    const href = link.getAttribute('href') || '';
    if (!href || href.startsWith('#')) return false;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return false;

    return url.pathname === '/' || url.pathname.endsWith('.html');
  }

  function setupHeaderOverlayState() {
    function refresh() {
      const header = document.querySelector('.site-header');
      if (!header) return;
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    }

    if (!window.__mlabsHeaderBound) {
      window.__mlabsHeaderBound = true;
      window.addEventListener('scroll', refresh, { passive: true });
      window.addEventListener('resize', refresh);
    }

    refresh();
  }

  function setupResponsiveMenu() {
    const header = document.querySelector('.site-header');
    const menu = header?.querySelector('.menu');
    const cta = header?.querySelector('.menu-cta');
    if (!header || !menu) return;

    if (header.dataset.menuBound === '1') return;
    header.dataset.menuBound = '1';

    let toggle = header.querySelector('.menu-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'menu-toggle';
      toggle.setAttribute('aria-label', 'Abrir menu');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<span></span><span></span><span></span>';
      header.insertBefore(toggle, menu);
    }

    function closeMenu() {
      header.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
      header.classList.add('menu-open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', () => {
      if (header.classList.contains('menu-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menu.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      closeMenu();
    });

    if (cta) {
      cta.addEventListener('click', closeMenu);
    }

    if (!window.__mlabsMenuGlobalBound) {
      window.__mlabsMenuGlobalBound = true;

      document.addEventListener('click', (event) => {
        const currentHeader = document.querySelector('.site-header');
        if (!currentHeader || !currentHeader.classList.contains('menu-open')) return;
        if (currentHeader.contains(event.target)) return;
        currentHeader.classList.remove('menu-open');
        const currentToggle = currentHeader.querySelector('.menu-toggle');
        if (currentToggle) currentToggle.setAttribute('aria-expanded', 'false');
      });

      window.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        const currentHeader = document.querySelector('.site-header');
        if (!currentHeader || !currentHeader.classList.contains('menu-open')) return;
        currentHeader.classList.remove('menu-open');
        const currentToggle = currentHeader.querySelector('.menu-toggle');
        if (currentToggle) currentToggle.setAttribute('aria-expanded', 'false');
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth <= 1120) return;
        const currentHeader = document.querySelector('.site-header');
        if (!currentHeader || !currentHeader.classList.contains('menu-open')) return;
        currentHeader.classList.remove('menu-open');
        const currentToggle = currentHeader.querySelector('.menu-toggle');
        if (currentToggle) currentToggle.setAttribute('aria-expanded', 'false');
      });
    }
  }

  function setupRevealOnScroll() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    for (const item of items) {
      if (item.classList.contains('site-header')) {
        item.classList.add('is-visible');
      }
    }

    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    items.forEach((item) => revealObserver.observe(item));
  }

  function setupReserveModal() {
    const modal = document.getElementById('reserveModal');
    const openButton = document.getElementById('reserveDemoBtn');
    const closeButton = document.getElementById('closeReserveModal');
    if (!modal || !openButton || !closeButton) return;
    if (modal.dataset.bound === '1') return;
    modal.dataset.bound = '1';

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function openModal() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    openButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal();
    });
  }

  function setupGalleryModal() {
    const gallery = document.getElementById('betaGallery');
    const modal = document.getElementById('shotModal');
    const image = document.getElementById('shotImage');
    const title = document.getElementById('shotTitle');
    const description = document.getElementById('shotDescription');
    const closeButton = document.getElementById('closeShotModalIcon');

    if (!gallery || !modal || !image || !title || !description || !closeButton) return;
    if (gallery.dataset.bound === '1') return;
    gallery.dataset.bound = '1';

    let lastFocused = null;

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      image.classList.remove('is-visible');
      image.removeAttribute('src');
      image.removeAttribute('alt');
      title.textContent = '';
      description.textContent = '';
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    function openModal(figure) {
      const source = figure.getAttribute('data-shot');
      const label = figure.getAttribute('data-title') || 'MTOOLS Product Capture';
      const details = figure.getAttribute('data-description') || 'Product view from MTOOLS beta.';
      if (!source) return;

      lastFocused = figure;
      image.classList.remove('is-visible');
      image.onload = () => image.classList.add('is-visible');
      image.src = source;
      image.alt = label;
      title.textContent = label;
      description.textContent = details;

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    }

    gallery.addEventListener('click', (event) => {
      const figure = event.target.closest('.shot');
      if (!figure || !gallery.contains(figure)) return;
      openModal(figure);
    });

    gallery.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const figure = event.target.closest('.shot');
      if (!figure || !gallery.contains(figure)) return;
      event.preventDefault();
      openModal(figure);
    });

    closeButton.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal();
    });
  }

  function initPageFeatures() {
    setupHeaderOverlayState();
    setupResponsiveMenu();
    setupRevealOnScroll();
    setupReserveModal();
    setupGalleryModal();
  }

  async function swapPage(url, options = {}) {
    const { replaceHistory = false, fromPopstate = false } = options;
    if (navigating) return;
    navigating = true;

    document.body.classList.remove('is-entered');
    document.body.classList.add('is-leaving');

    try {
      const response = await fetch(url.href, { headers: { 'X-Requested-With': 'mlabs-spa' } });
      if (!response.ok) throw new Error(`Navigation failed: ${response.status}`);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const nextMain = doc.querySelector('.page-wrap');
      const currentMain = document.querySelector('.page-wrap');
      if (!nextMain || !currentMain) throw new Error('Main container not found');

      currentMain.replaceWith(nextMain);
      document.title = doc.title || document.title;
      document.body.className = (doc.body?.className || '').trim();

      if (!fromPopstate) {
        const nextUrl = `${url.pathname}${url.search}${url.hash}`;
        if (replaceHistory) {
          history.replaceState({}, '', nextUrl);
        } else {
          history.pushState({}, '', nextUrl);
        }
      }

      if (url.hash) {
        const target = document.querySelector(url.hash);
        if (target) {
          target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        }
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }

      initPageFeatures();

      requestAnimationFrame(() => {
        document.body.classList.remove('is-leaving');
        requestAnimationFrame(() => document.body.classList.add('is-entered'));
      });
    } catch (_error) {
      window.location.href = url.href;
    } finally {
      navigating = false;
    }
  }

  function setupClientNavigation() {
    if (window.__mlabsNavBound) return;
    window.__mlabsNavBound = true;

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!shouldHandleAsClientNav(link, event)) return;

      const url = new URL(link.href, window.location.href);

      if (url.pathname === window.location.pathname && url.hash) {
        event.preventDefault();
        const target = document.querySelector(url.hash);
        if (target) {
          target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
          history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
        }
        return;
      }

      if (url.href === window.location.href) return;

      event.preventDefault();
      swapPage(url);
    });

    window.addEventListener('popstate', () => {
      const url = new URL(window.location.href);
      swapPage(url, { fromPopstate: true });
    });
  }

  setupClientNavigation();
  initPageFeatures();
  markEntered();
})();
