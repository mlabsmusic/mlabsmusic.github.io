(function setupSite() {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');

  requestAnimationFrame(() => {
    body.classList.add('is-entered');
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
