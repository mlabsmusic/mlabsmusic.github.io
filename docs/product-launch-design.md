# MLABS Music · Product launch

North star: make the actual DJ software the main visual, with the clarity and pacing of a premium product launch.
User: DJs evaluating preparation, recommendations and audio routing. Primary action: explore one of the two products, then request a demo by email.
Direction already chosen by the user: Apple-like product presentation. One direction, no approval detour. Original MLABS identity and Instrument Sans retained.

References reviewed: Cola Skill's oil-ui and its public visual-language, media, motion and scroll-narrative guides. Oil Motion was evaluated and is unnecessary: this project uses UI state, native screenshots and programmatic animation, not generated video. No third-party skills, paid accounts or generation services installed.

Structure: a light product-led homepage, separate Platform and DJ Copilot pages, an interactive tool explorer, an explicit example widget, an audio-route explainer and FAQ. Existing private routes and web projects remain accessible.
Type: Instrument Sans, display 64–112px desktop / 44–58px mobile; body 17–20px. Local font, not a new external font request.
Palette: near-white #f6f8f8, ink #102326, MLABS teal #397f89. The dark Copilot stage reflects a DJ booth, with the actual light widget as its focal point.
Motion: GSAP + ScrollTrigger, one product stack that opens with scroll, staggered tool reveals, immediate tab/screen changes, and a route that connects visually as the user scrolls. Hover/press feedback is quiet and short. Native scrolling, no scroll hijack. Reduced-motion mode disables movement and pinning; text and interactions remain available.
Assets: real native application captures. Interactive widget data is a labelled demonstration, never a real browser connection to Rekordbox. Product remains in development; no invented reviews, performance claims, release downloads, analysis algorithms or acoustic dBA guarantees.
Verification: desktop and narrow mobile, keyboard controls, reduced motion, overflow, loaded images, internal links, no-JS readable content, local production build and final GitHub Pages deployment.

Additional evidence: real Rekordbox playback captured through the native M Channel application source, with live matrix and limiter meters. Two silent videos preserve the original screenshot timing; they contain no music recording. The limiter example shows digital signal reduction, never acoustic room measurements. Original user scene restored after capturing a separate demo scene.
Mac guide: five ordered setup steps, real audio preferences screenshots, stereo-pair explanation, optional virtual-input permissions and troubleshooting. Physical controller headphone isolation was not tested and is not claimed. Instrument Sans license is shipped next to the font.

Visual review: two isolated screenshot reviews, 7/10. Improved the product's first-screen presence, balanced the 12 tool tabs, removed redundant copy and added readable recorded limiter values. Follow-up actual viewport captures show both homepage screenshots; long screenshot capture omitted offscreen image rasterization despite successful image loads, so full-page screenshots are not the sole proof of those regions. A remaining design opportunity is a dedicated close-up product walkthrough video; the current captured proof is real and manually playable.
Validation: native-browser checks cover tabs, keyboard selection, zoom, widget filters/minimization, mobile menu, four public product routes at 320px, intermediate menu widths, video decoding and three top-of-page reloads. Production build passes. Reduced motion is implemented and inspected in code; the OS preference was not changed. Existing CLI smoke suite was updated but not executed; browser checks are recorded separately. Backend and private routes were not changed.
