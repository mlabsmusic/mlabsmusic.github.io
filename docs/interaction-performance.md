# Interaction performance — 20 October 2026

The marketing navigation now keeps its mobile panel laid out and animates only opacity and transform. Opening/closing takes 220–260 ms, reverses immediately on repeated taps, and does not animate height, blur, or page layout. The opaque menu removes the previous nested backdrop blur. Its hidden links are inert; Escape restores toggle focus, and outside interaction and desktop resize dismiss it. An early JS marker prevents the expanded fallback navigation from flashing before the module loads. Reduced motion disables the panel transition.

Explorer tab changes and widget minimize/expand coalesce ScrollTrigger measurement after the response animation instead of synchronously measuring the whole page inside the click handler. Re-selecting an active filter/tab does no work. Outgoing tweens are cancelled before replacing rows or switching panels. Portrait hovers animate scale without an animated saturation filter. Recorded audio GIFs switch to their still image while navigation or the image dialog is open, and while the tab is hidden, retaining the visitor’s explicit pause state.

## Runtime evidence

Chrome on this Mac, local Astro development build, mobile viewport 390 × 844; explorer at 1440 × 1000. Each observation lasts 15 seconds. Instrumentation records requestAnimationFrame timestamps and Long Tasks; interaction windows run from each real click until 550 ms after it. Automation and the local development environment may affect timings. These are small samples on one machine, not a guarantee for every device or a GPU presentation trace.

| Interaction | Clicks | Frame interval median | Interaction p95 | Worst interaction frame | Intervals > 1.5 × median | Long tasks ≥ 50 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile menu open/close | 12 | 8.3 ms | 9.2 ms | 9.4 ms | 0 / 430 | 0 |
| All twelve Platform tabs | 12 | 8.3 ms | 9.1 ms | 16.5 ms | 1 / 429 | 0 |
| Widget filters and minimize/expand | 11 | 8.3 ms | 9.2 ms | 9.4 ms | 0 / 403 | 0 |
| Rapid menu reversal over visible audio GIFs | 12 | 8.3 ms | 9.1 ms | 9.3 ms | 0 / 83 | 0 |

The observed scheduling cadence was approximately 120 Hz. No fixed 60 fps timer/cap was introduced. The browser, operating system, power state and display still determine the available refresh rate. One explorer interval spanned approximately two refreshes; do not describe every interaction as having zero dropped frames.

Functional checks: Escape/focus return, outside dismissal, resize from open mobile menu to accessible desktop navigation, all twelve tabs (one active panel), ArrowRight/End navigation, widget filters (three rows) and minimize/expand, GIF pause/resume and still-image substitution under the open menu. Browser console: no errors in the local checks. Production build and live deployment are verified separately.

## Repeating the measurement locally

Run the development server and append `?motion-audit` to a marketing page. Press “Medir interacciones (15 s)” and operate the actual controls. A visible JSON report appears after the sample. The observer has no external telemetry and is imported only when `import.meta.env.DEV` is true; it is excluded from the production build. Reload after code edits before measuring to avoid duplicate development HMR listeners.

Raw measurement files are saved in the task workspace under `work/web-launch-evidence/motion-*-local.json`.
