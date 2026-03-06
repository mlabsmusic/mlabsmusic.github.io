(function setupMeshBackground() {
  const canvas = document.getElementById('meshBackground');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seedValue = 0xF017A8A5D15EA5En;
  const seeds = [];
  const colors = [];
  const maxSeedCount = 56;

  class SeededRandom {
    constructor(seed) {
      this.state = seed === 0n ? 0xBADC0FFEE0DDF00Dn : seed;
    }
    next() {
      this.state ^= this.state >> 12n;
      this.state ^= this.state << 25n;
      this.state ^= this.state >> 27n;
      return (this.state * 0x2545F4914F6CDD1Dn) & ((1n << 64n) - 1n);
    }
    float() {
      const n = this.next() >> 11n;
      return Number(n) / 9007199254740991;
    }
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function reflectedPosition(start, velocity, time, limit) {
    if (limit <= 0) return 0;
    const period = limit * 2;
    let value = (start + velocity * time) % period;
    if (value < 0) value += period;
    if (value > limit) value = period - value;
    return value;
  }

  function makeSeeds() {
    const rng = new SeededRandom(seedValue);
    for (let i = 0; i < maxSeedCount; i += 1) {
      const colorMix = rng.float();
      const warm = colorMix;
      const cool = 1 - colorMix;
      colors.push({
        r: Math.round((0.33 + (0.18 * warm)) * 255),
        g: Math.round((0.84 + (0.12 * cool)) * 255),
        b: Math.round((0.9 + (0.09 * warm)) * 255)
      });
      seeds.push({
        xFactor: rng.float(),
        yFactor: rng.float(),
        velocityX: lerp(-34, 34, rng.float()),
        velocityY: lerp(-30, 30, rng.float()),
        size: lerp(1.1, 2.5, rng.float())
      });
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(nowMs) {
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;
    const time = prefersReducedMotion ? 0 : nowMs / 1000;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgb(8,20,44)');
    gradient.addColorStop(0.55, 'rgb(7,24,52)');
    gradient.addColorStop(1, 'rgb(6,17,38)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const topGlow = { x: width * 0.2, y: height * 0.23 };
    const bottomGlow = { x: width * 0.78, y: height * 0.78 };

    const glowA = ctx.createRadialGradient(topGlow.x, topGlow.y, 0, topGlow.x, topGlow.y, 220);
    glowA.addColorStop(0, 'rgba(135,217,247,0.2)');
    glowA.addColorStop(1, 'rgba(135,217,247,0)');
    ctx.fillStyle = glowA;
    ctx.beginPath();
    ctx.arc(topGlow.x, topGlow.y, 220, 0, Math.PI * 2);
    ctx.fill();

    const glowB = ctx.createRadialGradient(bottomGlow.x, bottomGlow.y, 0, bottomGlow.x, bottomGlow.y, 260);
    glowB.addColorStop(0, 'rgba(117,230,194,0.16)');
    glowB.addColorStop(1, 'rgba(117,230,194,0)');
    ctx.fillStyle = glowB;
    ctx.beginPath();
    ctx.arc(bottomGlow.x, bottomGlow.y, 260, 0, Math.PI * 2);
    ctx.fill();

    const targetCount = Math.floor((width + height) / 62);
    const particleCount = Math.max(22, Math.min(seeds.length, targetCount));
    const linkRadius = (width / 16) + (height / 9);
    const linkRadiusSquared = linkRadius * linkRadius;

    const points = [];
    for (let i = 0; i < particleCount; i += 1) {
      const seed = seeds[i];
      const x = reflectedPosition(seed.xFactor * width, seed.velocityX, time, width);
      const y = reflectedPosition(seed.yFactor * height, seed.velocityY, time, height);
      points.push({ x, y, size: seed.size, color: colors[i] });
    }

    for (let i = 0; i < points.length; i += 1) {
      const from = points[i];
      for (let j = i + 1; j < points.length; j += 1) {
        const to = points[j];
        const dx = from.x - to.x;
        const dy = from.y - to.y;
        const distanceSquared = (dx * dx) + (dy * dy);
        if (distanceSquared > linkRadiusSquared) continue;
        const distance = Math.sqrt(distanceSquared);
        const opacity = Math.max(0, 1 - (distance / linkRadius));
        if (opacity <= 0) continue;
        ctx.strokeStyle = `rgba(255,255,255,${0.015 + opacity * 0.13})`;
        ctx.lineWidth = 0.34 + opacity * 0.78;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    }

    for (const p of points) {
      const glowRadius = p.size * 2.6;
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
      glow.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},0.22)`);
      glow.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},0.9)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  makeSeeds();
  resize();
  draw(0);

  let lastFrame = 0;
  function loop(ts) {
    if (prefersReducedMotion) return;
    if (ts - lastFrame >= 1000 / 12) {
      draw(ts);
      lastFrame = ts;
    }
    requestAnimationFrame(loop);
  }

  if (!prefersReducedMotion) requestAnimationFrame(loop);
  window.addEventListener('resize', () => {
    resize();
    draw(performance.now());
  });
})();

(function setupReserveModal() {
  const modal = document.getElementById('reserveModal');
  const openBtn = document.getElementById('reserveDemoBtn');
  const closeBtn = document.getElementById('closeReserveModal');
  if (!modal || !openBtn || !closeBtn) return;

  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
})();

(function setupGalleryModal() {
  const gallery = document.getElementById('betaGallery');
  const modal = document.getElementById('shotModal');
  const image = document.getElementById('shotImage');
  const title = document.getElementById('shotTitle');
  const description = document.getElementById('shotDescription');
  const closeBtn = document.getElementById('closeShotModalIcon');

  if (!gallery || !modal || !image || !title || !description || !closeBtn) return;

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    image.src = '';
    image.alt = '';
    title.textContent = '';
    description.textContent = '';
  }

  gallery.addEventListener('click', (event) => {
    const figure = event.target.closest('.shot');
    if (!figure) return;
    const src = figure.getAttribute('data-shot');
    const imageTitle = figure.getAttribute('data-title') || 'Captura MTOOLS';
    const imageDescription = figure.getAttribute('data-description') || 'Vista de producto MTOOLS.';

    image.src = src;
    image.alt = imageTitle;
    title.textContent = imageTitle;
    description.textContent = imageDescription;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
})();
