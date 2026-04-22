# mlabsmusic.github.io

Primary website repository for **Mlabs Music**: premium websites, portfolios, landing pages, and digital brand presence for DJs, producers, artists, and music projects.

## Production structure

- Main website source: `mlabsmusic.github.io`
- Public domain: `https://www.mlabsmusic.com`
- DNS: `www` CNAME -> `mlabsmusic.github.io`
- Framework: Astro static build deployed to GitHub Pages
- Auth/data: Supabase Auth + Postgres with Row Level Security

## Deployment

- GitHub Pages via GitHub Actions
- Automatic deploy on push to `main`
- Required repository secrets:
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`

## Files

- `index.html`: landing page
- `src/pages/login.astro`: login/signup route
- `src/pages/apps.astro`: authenticated apps dashboard
- `src/pages/admin.astro`: admin route for user app access
- `supabase/schema.sql`: Supabase tables, seed apps, roles, and RLS policies
- `projects.html`: services redirect
- `about.html`: studio redirect
- `CNAME`: custom domain (`www.mlabsmusic.com`)
- `.github/workflows/deploy-pages.yml`: deploy pipeline

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Run `supabase/schema.sql` in the Supabase SQL editor, create your first account from `/login`, then promote it:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```
