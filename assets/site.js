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
  const navigationEntry = performance.getEntriesByType?.('navigation')?.[0];
  const legacyNavigation = performance.navigation;
  const isLegacyReload = !!legacyNavigation && legacyNavigation.type === 1;
  const isReloadNavigation = navigationEntry?.type === 'reload' || isLegacyReload;
  let revealObserver = null;
  let navigating = false;

  function normalizeSingleLayout() {
    const wraps = [...document.querySelectorAll('.page-wrap')];
    if (wraps.length > 1) {
      for (let i = 0; i < wraps.length - 1; i += 1) {
        wraps[i].remove();
      }
    }

    const headers = [...document.querySelectorAll('.site-header')];
    if (headers.length > 1) {
      for (let i = 0; i < headers.length - 1; i += 1) {
        headers[i].remove();
      }
    }
  }

  function markEntered() {
    if (isReloadNavigation) {
      document.body.classList.add('no-entry-motion');
      document.body.classList.add('is-entered');
      return;
    }

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

    return url.pathname === '/' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
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
    document.body.classList.remove('menu-overlay-open');

    let toggle = header.querySelector('.menu-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'menu-toggle';
      const isSpanish = document.documentElement.lang?.toLowerCase().startsWith('es');
      toggle.setAttribute('aria-label', isSpanish ? 'Abrir menu' : 'Open menu');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<span></span><span></span><span></span>';
      header.insertBefore(toggle, menu);
    }

    let mobileCta = menu.querySelector('.menu-mobile-cta');
    if (!mobileCta && cta) {
      mobileCta = document.createElement('a');
      mobileCta.className = 'menu-mobile-cta';
      mobileCta.href = cta.getAttribute('href') || cta.href || '#';
      if (cta.target) mobileCta.target = cta.target;
      if (cta.rel) mobileCta.rel = cta.rel;
      mobileCta.textContent = (cta.textContent || '').trim() || 'Contact';
      menu.appendChild(mobileCta);
    }

    const menuLinks = [...menu.querySelectorAll('a')];
    menuLinks.forEach((link, index) => {
      link.style.setProperty('--menu-index', String(index));
    });

    let liquidIndicator = menu.querySelector('.menu-liquid-indicator');
    if (!liquidIndicator) {
      liquidIndicator = document.createElement('span');
      liquidIndicator.className = 'menu-liquid-indicator';
      liquidIndicator.setAttribute('aria-hidden', 'true');
      menu.prepend(liquidIndicator);
    }

    let indicatorTimer = null;
    let morphTimer = null;

    function clearIndicatorTimer() {
      if (!indicatorTimer) return;
      window.clearTimeout(indicatorTimer);
      indicatorTimer = null;
    }

    function clearMorphTimer() {
      if (!morphTimer) return;
      window.clearTimeout(morphTimer);
      morphTimer = null;
    }

    function triggerLiquidMorph() {
      clearMorphTimer();
      liquidIndicator.classList.remove('is-morphing');
      // Force reflow so repeated clicks retrigger the animation.
      void liquidIndicator.offsetWidth;
      liquidIndicator.classList.add('is-morphing');
      morphTimer = window.setTimeout(() => {
        liquidIndicator.classList.remove('is-morphing');
      }, 620);
    }

    function moveLiquidIndicator(target, instant = false) {
      if (!target || !menu.contains(target)) {
        menu.classList.remove('has-liquid-target');
        return;
      }

      const menuRect = menu.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      if (!menuRect.width || !targetRect.width) return;

      const x = targetRect.left - menuRect.left;
      const y = targetRect.top - menuRect.top;
      const width = targetRect.width;
      const height = targetRect.height;

      if (instant) {
        liquidIndicator.style.transition = 'none';
      } else {
        liquidIndicator.style.removeProperty('transition');
      }

      menu.style.setProperty('--liquid-x', `${x}px`);
      menu.style.setProperty('--liquid-y', `${y}px`);
      menu.style.setProperty('--liquid-w', `${width}px`);
      menu.style.setProperty('--liquid-h', `${height}px`);
      menu.classList.add('has-liquid-target');
      if (!instant) triggerLiquidMorph();

      if (instant) {
        requestAnimationFrame(() => {
          liquidIndicator.style.removeProperty('transition');
        });
      }
    }

    function getActiveMenuLink() {
      return menu.querySelector('a.is-active') || menuLinks[0] || null;
    }

    function refreshLiquidIndicator(instant = false) {
      if (window.innerWidth > 1120) {
        menu.classList.remove('has-liquid-target');
        return;
      }
      moveLiquidIndicator(getActiveMenuLink(), instant);
    }

    menu.__mlabsRefreshLiquidIndicator = refreshLiquidIndicator;

    function setMenuState(isOpen) {
      header.classList.toggle('menu-open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('menu-overlay-open', isOpen && window.innerWidth <= 1120);

      clearIndicatorTimer();
      if (isOpen && window.innerWidth <= 1120) {
        requestAnimationFrame(() => refreshLiquidIndicator(true));
        indicatorTimer = window.setTimeout(() => refreshLiquidIndicator(false), 60);
      } else {
        menu.classList.remove('has-liquid-target');
      }
    }

    function closeMenu() {
      setMenuState(false);
    }

    function openMenu() {
      setMenuState(true);
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
      moveLiquidIndicator(link);
      closeMenu();
    });

    menu.addEventListener('focusin', (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      moveLiquidIndicator(link);
    });

    menu.addEventListener('mouseover', (event) => {
      if (window.innerWidth > 1120) return;
      const link = event.target.closest('a');
      if (!link) return;
      moveLiquidIndicator(link);
    });

    menu.addEventListener('mouseleave', () => {
      if (window.innerWidth > 1120) return;
      refreshLiquidIndicator(false);
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
        document.body.classList.remove('menu-overlay-open');
        const currentMenu = currentHeader.querySelector('.menu');
        if (currentMenu) currentMenu.classList.remove('has-liquid-target');
        const currentToggle = currentHeader.querySelector('.menu-toggle');
        if (currentToggle) currentToggle.setAttribute('aria-expanded', 'false');
      });

      window.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        const currentHeader = document.querySelector('.site-header');
        if (!currentHeader || !currentHeader.classList.contains('menu-open')) return;
        currentHeader.classList.remove('menu-open');
        document.body.classList.remove('menu-overlay-open');
        const currentMenu = currentHeader.querySelector('.menu');
        if (currentMenu) currentMenu.classList.remove('has-liquid-target');
        const currentToggle = currentHeader.querySelector('.menu-toggle');
        if (currentToggle) currentToggle.setAttribute('aria-expanded', 'false');
      });

      window.addEventListener('resize', () => {
        const currentHeader = document.querySelector('.site-header');
        const currentMenu = currentHeader?.querySelector('.menu');

        if (window.innerWidth > 1120) {
          if (!currentHeader || !currentHeader.classList.contains('menu-open')) return;
          currentHeader.classList.remove('menu-open');
          document.body.classList.remove('menu-overlay-open');
          if (currentMenu) currentMenu.classList.remove('has-liquid-target');
          const currentToggle = currentHeader.querySelector('.menu-toggle');
          if (currentToggle) currentToggle.setAttribute('aria-expanded', 'false');
          return;
        }

        if (currentHeader?.classList.contains('menu-open') && currentMenu?.__mlabsRefreshLiquidIndicator) {
          currentMenu.__mlabsRefreshLiquidIndicator(true);
        }
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

    const isSpanish = document.documentElement.lang?.toLowerCase().startsWith('es');
    let prevButton = modal.querySelector('[data-shot-prev]');
    let nextButton = modal.querySelector('[data-shot-next]');
    if (!prevButton) {
      prevButton = document.createElement('button');
      prevButton.type = 'button';
      prevButton.className = 'shot-modal-nav prev';
      prevButton.setAttribute('data-shot-prev', '1');
      prevButton.setAttribute('aria-label', isSpanish ? 'Imagen anterior' : 'Previous image');
      prevButton.textContent = '<';
      modal.querySelector('.shot-modal-content')?.appendChild(prevButton);
    }
    if (!nextButton) {
      nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'shot-modal-nav next';
      nextButton.setAttribute('data-shot-next', '1');
      nextButton.setAttribute('aria-label', isSpanish ? 'Imagen siguiente' : 'Next image');
      nextButton.textContent = '>';
      modal.querySelector('.shot-modal-content')?.appendChild(nextButton);
    }

    let lastFocused = null;
    let currentIndex = -1;

    function getFigures() {
      return [...gallery.querySelectorAll('.shot')];
    }

    function setFigureByIndex(index) {
      const figures = getFigures();
      if (!figures.length) return;

      const total = figures.length;
      currentIndex = ((index % total) + total) % total;
      const figure = figures[currentIndex];
      if (!figure) return;

      const source = figure.getAttribute('data-shot');
      const label = figure.getAttribute('data-title') || 'MTOOLS Product Capture';
      const details = figure.getAttribute('data-description') || 'Product view from MTOOLS beta.';
      if (!source) return;

      image.classList.remove('is-visible');
      image.onload = () => image.classList.add('is-visible');
      image.src = source;
      image.alt = label;
      title.textContent = label;
      description.textContent = details;

      const disableNav = total < 2;
      prevButton.disabled = disableNav;
      nextButton.disabled = disableNav;
    }

    function stepFigure(direction) {
      if (currentIndex < 0) return;
      setFigureByIndex(currentIndex + direction);
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      image.classList.remove('is-visible');
      image.removeAttribute('src');
      image.removeAttribute('alt');
      title.textContent = '';
      description.textContent = '';
      currentIndex = -1;
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    function openModal(figure) {
      const figures = getFigures();
      const index = figures.indexOf(figure);
      if (index < 0) return;

      lastFocused = figure;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setFigureByIndex(index);
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
    prevButton.addEventListener('click', () => stepFigure(-1));
    nextButton.addEventListener('click', () => stepFigure(1));

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    window.addEventListener('keydown', (event) => {
      if (!modal.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        closeModal();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepFigure(-1);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepFigure(1);
      }
    });
  }

  function setupBetaCarousel() {
    const carousels = [...document.querySelectorAll('[data-beta-carousel]')];
    if (!carousels.length) return;

    carousels.forEach((carousel) => {
      if (carousel.dataset.bound === '1') return;
      carousel.dataset.bound = '1';

      const track = carousel.querySelector('[data-beta-track]');
      const prev = carousel.querySelector('[data-carousel-prev]');
      const next = carousel.querySelector('[data-carousel-next]');
      if (!track || !prev || !next) return;

      function getStep() {
        const card = track.querySelector('.shot');
        if (!card) return 320;
        const gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || '12');
        return card.getBoundingClientRect().width + gap;
      }

      function updateButtons() {
        const maxScroll = track.scrollWidth - track.clientWidth;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= (maxScroll - 2);
      }

      function scrollByStep(direction) {
        track.scrollBy({ left: getStep() * direction, behavior: 'smooth' });
      }

      prev.addEventListener('click', () => scrollByStep(-1));
      next.addEventListener('click', () => scrollByStep(1));
      track.addEventListener('scroll', updateButtons, { passive: true });
      window.addEventListener('resize', updateButtons);

      updateButtons();
    });
  }

  function setupAudienceTabs() {
    const tabGroups = [...document.querySelectorAll('[data-audience-tabs]')];
    if (!tabGroups.length) return;

    tabGroups.forEach((group) => {
      if (group.dataset.tabsBound === '1') return;
      group.dataset.tabsBound = '1';

      const tabList = group.querySelector('[role="tablist"]');
      const tabs = [...group.querySelectorAll('[role="tab"][data-tab-target]')];
      const panels = [...group.querySelectorAll('[data-tab-panel]')];
      if (!tabList || !tabs.length || !panels.length) return;

      function activateTab(targetId, shouldFocus = false) {
        if (!targetId) return;

        tabs.forEach((tab) => {
          const isActive = tab.dataset.tabTarget === targetId;
          tab.classList.toggle('is-active', isActive);
          tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
          tab.setAttribute('tabindex', isActive ? '0' : '-1');
          if (isActive && shouldFocus) tab.focus();
        });

        panels.forEach((panel) => {
          const isActive = panel.id === targetId;
          panel.classList.toggle('is-active', isActive);
          panel.hidden = !isActive;
        });
      }

      const initialTab = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true')
        || tabs.find((tab) => tab.classList.contains('is-active'))
        || tabs[0];

      activateTab(initialTab?.dataset.tabTarget || tabs[0]?.dataset.tabTarget || '', false);

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          activateTab(tab.dataset.tabTarget || '', false);
        });
      });

      tabList.addEventListener('keydown', (event) => {
        const activeElement = document.activeElement;
        if (!activeElement) return;
        const currentTab = activeElement.closest('[role="tab"]');
        if (!currentTab || !tabList.contains(currentTab)) return;

        const index = tabs.indexOf(currentTab);
        if (index < 0) return;

        let nextIndex = -1;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        const nextTab = tabs[nextIndex];
        if (!nextTab) return;
        activateTab(nextTab.dataset.tabTarget || '', true);
      });
    });
  }

  function initPageFeatures() {
    normalizeSingleLayout();
    setupHeaderOverlayState();
    setupResponsiveMenu();
    setupBetaCarousel();
    setupAudienceTabs();
    setupRevealOnScroll();
    setupReserveModal();
    setupGalleryModal();
  }

  async function swapPage(url, options = {}) {
    const { replaceHistory = false, fromPopstate = false } = options;
    if (navigating) return;
    navigating = true;

    document.body.classList.remove('no-entry-motion');
    document.body.classList.remove('is-entered');
    document.body.classList.add('is-leaving');

    try {
      const response = await fetch(url.href, { headers: { 'X-Requested-With': 'mlabs-spa' } });
      if (!response.ok) throw new Error(`Navigation failed: ${response.status}`);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const nextMain = doc.querySelector('.page-wrap');
      const currentMains = [...document.querySelectorAll('.page-wrap')];
      const currentMain = currentMains[currentMains.length - 1];
      if (!nextMain || !currentMain) throw new Error('Main container not found');

      if (currentMains.length > 1) {
        currentMains.slice(0, -1).forEach((el) => el.remove());
      }

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
      normalizeSingleLayout();

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
