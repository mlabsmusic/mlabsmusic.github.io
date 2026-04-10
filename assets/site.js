(function setupSite() {
  const body = document.body;
  const header = document.querySelector('.site-header');

  requestAnimationFrame(() => {
    body.classList.add('is-entered');
  });

  if (header) {
    const updateHeader = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  const revealItems = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });

    for (const item of revealItems) observer.observe(item);
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
    trigger.addEventListener('click', () => openModal(contactModal));
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
    for (const modal of document.querySelectorAll('.modal-backdrop.is-open')) {
      closeModal(modal);
    }
  });

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
})();
