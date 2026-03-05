# mlabsmusic.github.io

Primary website repository for **Mlabs Music**.

## Production structure

- Main website source: `mlabsmusic.github.io`
- Public domain: `https://www.mlabsmusic.com`
- DNS: `www` CNAME -> `mlabsmusic.github.io`

## Deployment

- GitHub Pages via GitHub Actions
- Automatic deploy on push to `main`

## Files

- `index.html`: landing page
- `CNAME`: custom domain (`www.mlabsmusic.com`)
- `.github/workflows/deploy-pages.yml`: deploy pipeline
