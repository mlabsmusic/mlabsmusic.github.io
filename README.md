# mlabsmusic.github.io

Primary website repository for **Mlabs Music**: premium websites, portfolios, landing pages, and digital brand presence for DJs, producers, artists, and music projects.

## Production structure

- Main website source: `mlabsmusic.github.io`
- Public domain: `https://www.mlabsmusic.com`
- DNS: `www` CNAME -> `mlabsmusic.github.io`

## Deployment

- GitHub Pages via GitHub Actions
- Automatic deploy on push to `main`

## Files

- `index.html`: landing page
- `projects.html`: services redirect
- `about.html`: studio redirect
- `CNAME`: custom domain (`www.mlabsmusic.com`)
- `.github/workflows/deploy-pages.yml`: deploy pipeline
