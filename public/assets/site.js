(function setupSite() {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');

  requestAnimationFrame(() => {
    body.classList.add('is-entered');
  });

  function shouldHandlePageTransition(link) {
    if (!(link instanceof HTMLAnchorElement)) return false;
    if (!link.href || link.target || link.hasAttribute('download')) return false;
    if (link.protocol === 'mailto:' || link.protocol === 'tel:') return false;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (url.pathname === window.location.pathname && url.hash) return false;
    return url.href !== window.location.href;
  }

  function markFocusedSection(target) {
    target.classList.remove('is-focus-section');
    void target.offsetWidth;
    target.classList.add('is-focus-section');
    window.setTimeout(() => target.classList.remove('is-focus-section'), 900);
  }

  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!(link instanceof HTMLAnchorElement)) return;

    const url = new URL(link.href, window.location.href);
    if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.hash) {
      const target = document.querySelector(url.hash);
      if (!target) return;
      event.preventDefault();
      closeNav();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      markFocusedSection(target);
      window.history.pushState({}, '', url.hash);
      return;
    }

    if (!shouldHandlePageTransition(link) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    closeNav();
    body.classList.add('is-leaving');
    window.setTimeout(() => {
      window.location.assign(link.href);
    }, 240);
  });

  if (header) {
    const updateHeader = () => {
      const headerScrolled = window.scrollY > 20;
      header.classList.toggle('is-scrolled', headerScrolled);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu');
  }

  if (nav && navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menu' : 'Abrir menu');
      body.classList.toggle('is-locked', isOpen);
    });

    for (const link of nav.querySelectorAll('.nav-links a, .button')) {
      link.addEventListener('click', closeNav);
    }
  }

  const revealItems = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window) {
    const revealInView = () => {
      for (const item of revealItems) {
        if (item.classList.contains('is-visible')) continue;
        const bounds = item.getBoundingClientRect();
        if (bounds.top <= window.innerHeight * 0.92) {
          item.classList.add('is-visible');
        }
      }
    };

    revealInView();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.01,
      rootMargin: '0px 0px -8% 0px',
    });

    for (const item of revealItems) observer.observe(item);
    window.addEventListener('load', revealInView, { once: true });
    window.setTimeout(() => {
      for (const item of revealItems) item.classList.add('is-visible');
    }, 650);
  } else {
    for (const item of revealItems) item.classList.add('is-visible');
  }

  function setupElasticGridScroll() {
    const grids = [...document.querySelectorAll('[data-elastic-grid]')];
    if (!grids.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    let previousScrollY = window.scrollY;
    let scrollVelocity = 0;
    let needsFrame = false;

    const states = grids.map((grid) => ({
      grid,
      columns: 1,
      items: [...grid.querySelectorAll('[data-elastic-item]')],
      itemStates: [],
    }));

    function getColumnCount(grid) {
      const rawColumns = window.getComputedStyle(grid).gridTemplateColumns;
      return Math.max(1, rawColumns.split(' ').filter(Boolean).length);
    }

    function measureGrid(state) {
      state.columns = getColumnCount(state.grid);
      const mid = (state.columns - 1) / 2;
      const maxDistance = state.columns % 2 === 1 ? Math.floor(state.columns / 2) : state.columns / 2;

      state.itemStates = state.items.map((item, index) => {
        const column = index % state.columns;
        const distance = Math.abs(column - mid);
        const centerPull = state.columns > 1 ? (maxDistance - distance + 1) / (maxDistance + 1) : 0;
        const side = mid ? (column - mid) / mid : 0;

        item.style.setProperty('--elastic-y', '0px');
        item.style.setProperty('--elastic-tilt', '0deg');

        return {
          item,
          current: 0,
          target: 0,
          side,
          strength: centerPull,
        };
      });
    }

    function isGridVisible(grid) {
      const bounds = grid.getBoundingClientRect();
      return bounds.top < window.innerHeight * 1.08 && bounds.bottom > -window.innerHeight * 0.08;
    }

    function updateTargets() {
      const nextScrollY = window.scrollY;
      scrollVelocity = nextScrollY - previousScrollY;
      previousScrollY = nextScrollY;

      for (const state of states) {
        const visible = isGridVisible(state.grid);
        for (const itemState of state.itemStates) {
          if (!visible || state.columns < 2) {
            itemState.target = 0;
            continue;
          }

          itemState.target = clamp(scrollVelocity * itemState.strength * 0.035, -42, 42);
        }
      }

      if (!needsFrame) {
        needsFrame = true;
        requestAnimationFrame(renderElasticGrid);
      }
    }

    function renderElasticGrid() {
      let stillMoving = false;

      for (const state of states) {
        for (const itemState of state.itemStates) {
          itemState.current += (itemState.target - itemState.current) * 0.16;
          itemState.target *= 0.82;

          if (Math.abs(itemState.current) < 0.08 && Math.abs(itemState.target) < 0.08) {
            itemState.current = 0;
            itemState.target = 0;
          } else {
            stillMoving = true;
          }

          const tilt = clamp(itemState.current * itemState.side * -0.025, -0.7, 0.7);
          itemState.item.style.setProperty('--elastic-y', `${itemState.current.toFixed(2)}px`);
          itemState.item.style.setProperty('--elastic-tilt', `${tilt.toFixed(3)}deg`);
        }
      }

      if (stillMoving) {
        requestAnimationFrame(renderElasticGrid);
      } else {
        needsFrame = false;
      }
    }

    for (const state of states) measureGrid(state);

    window.addEventListener('scroll', updateTargets, { passive: true });
    window.addEventListener('resize', () => {
      for (const state of states) measureGrid(state);
      updateTargets();
    }, { passive: true });
  }

  setupElasticGridScroll();

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('is-locked');
    const closeButton = modal.querySelector('.close, .shot-modal-close-icon');
    closeButton?.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.modal-backdrop.is-open')) {
      body.classList.remove('is-locked');
    }
  }

  const contactModal = document.getElementById('contactModal') || document.getElementById('reserveModal');
  for (const trigger of document.querySelectorAll('[data-contact-modal], #reserveDemoBtn')) {
    trigger.addEventListener('click', () => {
      const leadNeed = document.getElementById('leadNeed');
      if (leadNeed && trigger.dataset.pack) {
        leadNeed.value = trigger.dataset.pack;
      }
      openModal(contactModal);
    });
  }

  for (const modal of document.querySelectorAll('.modal-backdrop')) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });

    for (const close of modal.querySelectorAll('.close, .shot-modal-close-icon')) {
      close.addEventListener('click', () => closeModal(modal));
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeNav();
    for (const modal of document.querySelectorAll('.modal-backdrop.is-open')) {
      closeModal(modal);
    }
  });

  for (const form of document.querySelectorAll('[data-lead-form]')) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const lead = {
        id: `lead-${Date.now()}`,
        name: String(data.get('name') || '').trim(),
        email: String(data.get('email') || '').trim(),
        need: String(data.get('need') || '').trim(),
        note: String(data.get('note') || '').trim(),
        source: window.location.pathname,
        createdAt: new Date().toISOString(),
      };

      try {
        const leads = JSON.parse(localStorage.getItem('mlabs_sales_leads_v1') || '[]');
        leads.unshift(lead);
        localStorage.setItem('mlabs_sales_leads_v1', JSON.stringify(leads.slice(0, 40)));
      } catch {}

      const status = form.querySelector('[data-lead-status]');
      if (status) {
        status.textContent = lead.email
          ? `Lead guardado: ${lead.name || lead.email}. Siguiente paso: preparar demo ${lead.need || 'MLABS'}.`
          : 'Lead guardado. Siguiente paso: preparar demo MLABS.';
      }
      form.reset();
    });
  }

  const shotModal = document.getElementById('shotModal');
  const shotImage = document.getElementById('shotImage');
  const shotTitle = document.getElementById('shotTitle');
  const shotDescription = document.getElementById('shotDescription');

  for (const shot of document.querySelectorAll('[data-shot]')) {
    const openShot = () => {
      if (!shotModal || !shotImage) return;
      shotImage.src = shot.dataset.shot || '';
      shotImage.alt = shot.dataset.title || '';
      if (shotTitle) shotTitle.textContent = shot.dataset.title || '';
      if (shotDescription) shotDescription.textContent = shot.dataset.description || '';
      openModal(shotModal);
    };

    shot.addEventListener('click', openShot);
    shot.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openShot();
      }
    });
  }

  const canRegisterPwa = 'serviceWorker' in navigator && !['127.0.0.1', 'localhost'].includes(window.location.hostname);

  if (canRegisterPwa) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }, { once: true });
  }
})();
