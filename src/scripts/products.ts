import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

document.documentElement.classList.add('js');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileMenu = window.matchMedia('(max-width: 760px)');
// Coalesce geometry updates after the response animation, never inside a click.
const refreshAfterInteraction = gsap.delayedCall(.4, () => ScrollTrigger.refresh()).pause();
function scheduleRefresh() { refreshAfterInteraction.restart(true); }
const updateProofs = new Set<() => void>();
function updateRecordedProofs() { updateProofs.forEach(update => update()); }
function pageCovered() { return document.querySelector('.menu-toggle[aria-expanded="true"], .image-dialog[open]') !== null; }
gsap.registerPlugin(ScrollTrigger);

// Recorded GIFs animate only while visible and respect the user's motion preference.
document.querySelectorAll<HTMLElement>('[data-animated-proof]').forEach(figure => {
  const picture = figure.querySelector<HTMLImageElement>('[data-motion-src]');
  const control = figure.querySelector<HTMLButtonElement>('[data-motion-toggle]');
  if (!picture || !control || !('IntersectionObserver' in window)) return;
  let visible = false;
  let paused = false;
  function update() {
    const playing = visible && !paused && !reduced.matches && !document.hidden && !pageCovered();
    const source = playing ? picture!.dataset.motionSrc : picture!.dataset.stillSrc;
    if (source && picture!.getAttribute('src') !== source) picture!.src = source;
    control!.hidden = reduced.matches;
    control!.textContent = paused ? 'Reanudar animación' : 'Pausar animación';
  }
  updateProofs.add(update);
  control.addEventListener('click', () => { paused = !paused; update(); });
  reduced.addEventListener('change', update);
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }, { threshold: .05 });
  observer.observe(figure);
  update();
});

document.addEventListener('visibilitychange', updateRecordedProofs);

// Native scrolling remains in charge. Animation only follows its progress.
const motion = gsap.matchMedia();
motion.add({ desktop: '(min-width: 761px)', mobile: '(max-width: 760px)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
  if (context.conditions?.reduce) return;
  gsap.from('.hero-enter', { y: 20, opacity: 0, duration: .8, stagger: .075, ease: 'power3.out', clearProps: 'transform,opacity' });
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
    gsap.from(element, { y: 35, opacity: 0, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true }, clearProps: 'transform,opacity' });
  });
  if (document.querySelector('.hero-stage')) {
    const desktop = !!context.conditions?.desktop;
    const stage = gsap.timeline({ scrollTrigger: { trigger: '.hero-stage', start: 'top 88%', end: 'bottom 15%', scrub: .8 } });
    stage.fromTo('.hero-device', { scale: desktop ? .86 : .94, rotationX: desktop ? 8 : 0, y: desktop ? 0 : 10 }, { scale: 1, rotationX: 0, y: 0, ease: 'none' }, 0);
    stage.fromTo('.hero-widget', { y: desktop ? 75 : 25, x: desktop ? 30 : 0, rotation: desktop ? 3 : 0 }, { y: 0, x: 0, rotation: 0, ease: 'none' }, 0);
    stage.fromTo('.stage-halo', { opacity: .45 }, { opacity: 1, ease: 'none' }, 0);
  }
  gsap.utils.toArray<HTMLElement>('[data-route]').forEach(route => {
    gsap.from(route.querySelectorAll('div'), { y: 20, opacity: 0, duration: .65, stagger: .13, ease: 'power3.out', scrollTrigger: { trigger: route, start: 'top 88%', once: true } });
    gsap.from(route.querySelectorAll('i'), { scaleX: 0, duration: .5, stagger: .15, ease: 'power2.out', scrollTrigger: { trigger: route, start: 'top 84%', once: true } });
  });
});
// Restored page state must have correct measurements after images/fonts finish.
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
document.fonts?.ready.then(() => ScrollTrigger.refresh());

const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const menu = document.querySelector<HTMLElement>('#product-menu');
function setMenu(open: boolean) {
  open = open && mobileMenu.matches;
  menu?.classList.toggle('is-open', open);
  // Hidden links leave the tab order immediately, even during the closing fade.
  if (menu) menu.inert = mobileMenu.matches && !open;
  toggle?.setAttribute('aria-expanded', String(open));
  toggle?.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  updateRecordedProofs();
}
function closeMenu() { setMenu(false); }
closeMenu();
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
mobileMenu.addEventListener('change', closeMenu);
document.addEventListener('pointerdown', event => {
  if (toggle?.getAttribute('aria-expanded') === 'true' && event.target instanceof Node && !document.querySelector('.product-header')?.contains(event.target)) closeMenu();
});
document.addEventListener('focusin', event => {
  if (toggle?.getAttribute('aria-expanded') === 'true' && event.target instanceof Node && !document.querySelector('.product-header')?.contains(event.target)) closeMenu();
});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); } });

// One tab state drives screen, copy, selected state, focus and keyboard navigation.
document.querySelectorAll<HTMLElement>('[data-explorer]').forEach(explorer => {
  const tabs = Array.from(explorer.querySelectorAll<HTMLButtonElement>('[data-tool]'));
  const panels = Array.from(explorer.querySelectorAll<HTMLElement>('[data-tool-panel]'));
  function select(tab: HTMLButtonElement, focus = false) {
    if (tab.getAttribute('aria-selected') === 'true') { if (focus) tab.focus(); return; }
    tabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
    panels.forEach(panel => { const active = panel.id === tab.getAttribute('aria-controls'); gsap.killTweensOf(panel); if (!active || reduced.matches) gsap.set(panel, { clearProps: 'opacity,transform' }); panel.hidden = !active; if (active && !reduced.matches) gsap.fromTo(panel, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .35, ease: 'power2.out', clearProps: 'opacity,transform', overwrite: true }); });
    if (focus) tab.focus();
    scheduleRefresh();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']; if (!keys.includes(event.key)) return;
      event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(tabs[next], true);
    });
  });
});

const demoTracks: Record<string, { title: string; artist: string; bpm: string; key: string }[]> = {
  similar: [{ title:'Dale Don Dale', artist:'Don Omar', bpm:'101,7', key:'10A' }, { title:'Lo Que Pasó, Pasó', artist:'Daddy Yankee', bpm:'100,2', key:'2A' }, { title:'Ella Me Levantó', artist:'Daddy Yankee', bpm:'127,7', key:'8A' }],
  harmonic: [{ title:'Moscow Mule · Edit', artist:'Bad Bunny', bpm:'100', key:'4A' }, { title:'Playas a Cool Lagoon · Interlude', artist:'Yasiin Bey feat. Andy Flry', bpm:'103', key:'4A' }, { title:'Gasolina · Clean Short Edit', artist:'Daddy Yankee', bpm:'96', key:'4A' }],
  curveball: [{ title:'Hips Don’t Lie', artist:'Shakira ft. Wyclef Jean', bpm:'117', key:'3A' }, { title:'Mi Gente · Afro House Edit', artist:'J Balvin, Willy William', bpm:'123', key:'9A' }, { title:'To My Love · Intro', artist:'Bomba Estéreo', bpm:'100', key:'9B' }],
};
document.querySelectorAll<HTMLElement>('[data-widget]').forEach(widget => {
  const tabs = Array.from(widget.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const results = widget.querySelector<HTMLElement>('.widget-results');
  const collapse = widget.querySelector<HTMLButtonElement>('.widget-collapse');
  const body = widget.querySelector<HTMLElement>('#widget-body');
  const tablist = widget.querySelector<HTMLElement>('.widget-filters');
  if (results && tablist) { tablist.id = 'widget-criteria'; results.setAttribute('aria-labelledby', tablist.id); }
  function choose(tab: HTMLButtonElement, focus = false) {
    if (tab.getAttribute('aria-selected') === 'true') { if (focus) tab.focus(); return; }
    const tracks = demoTracks[tab.dataset.filter || 'similar'];
    if (!tracks || !results) return;
    tabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
    results.setAttribute('aria-label', `Sugerencias de ejemplo · ${tab.textContent}`);
    gsap.killTweensOf(results.children);
    results.replaceChildren(...tracks.map((track, index) => {
      const row = document.createElement('div'); row.className = 'demo-track';
      const position = document.createElement('span'); position.className = 'track-number'; position.textContent = `0${index + 1}`;
      const copy = document.createElement('div'); const title = document.createElement('strong'); title.textContent = track.title; const artist = document.createElement('span'); artist.textContent = track.artist; copy.append(title, artist);
      const meta = document.createElement('span'); meta.className = 'track-meta'; meta.append(`${track.bpm} `); const unit = document.createElement('small'); unit.textContent = 'BPM'; const key = document.createElement('b'); key.textContent = track.key; meta.append(unit, key);
      row.append(position, copy, meta); return row;
    }));
    if (!reduced.matches) gsap.fromTo(results.children, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .32, stagger: .055, ease: 'power2.out', clearProps: 'opacity,transform' });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => choose(tab));
    tab.addEventListener('keydown', event => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; choose(tabs[next], true); });
  });
  collapse?.addEventListener('click', () => { if (!body) return; const open = collapse.getAttribute('aria-expanded') !== 'true'; body.hidden = !open; widget.classList.toggle('is-collapsed', !open); collapse.setAttribute('aria-expanded', String(open)); collapse.setAttribute('aria-label', open ? 'Minimizar widget' : 'Expandir widget'); collapse.textContent = open ? '−' : '+'; scheduleRefresh(); });
});

const dialog = document.querySelector<HTMLDialogElement>('.image-dialog');
let opener: HTMLElement | null = null;
document.querySelectorAll<HTMLAnchorElement>('[data-zoom]').forEach(link => link.addEventListener('click', event => {
  if (!dialog || typeof dialog.showModal !== 'function' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); opener = link;
  const image = dialog.querySelector('img')!; const caption = link.dataset.caption || link.querySelector('img')?.alt || 'Vista de producto';
  image.src = link.href; image.alt = caption; dialog.querySelector('p')!.textContent = caption; dialog.showModal(); updateRecordedProofs();
}));
dialog?.querySelector('button')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
dialog?.addEventListener('close', () => { updateRecordedProofs(); opener?.focus(); });

if ('serviceWorker' in navigator && !['localhost', '127.0.0.1'].includes(location.hostname)) window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); }, { once: true });
