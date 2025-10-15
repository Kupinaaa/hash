# SHA‑256 Hash Generator (React + Tailwind)

A minimal, pretty hash generator built with React and Tailwind CSS. Enter a passphrase and optional salt; the app derives three deterministic outputs:

- 16-character (alnum only) — safe for strict password fields
- 24-character (Base64, trimmed) — may include + and /
- 64-character (hex) — standard SHA‑256 hex digest

All hashing runs locally in your browser using the Web Crypto API. No data is sent anywhere.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build

## Tech

- React + Vite
- Tailwind CSS via PostCSS

## Notes

- The 16-character value is derived from SHA‑256 bytes and mapped to a base‑62 alphabet to ensure only `[A-Za-z0-9]` characters.
- The 24-character value is a Base64 digest (padding removed) truncated to 24 characters.

## Deploy to GitHub Pages

This repo is configured for automatic GitHub Pages deploys from `main` using GitHub Actions.

1) Ensure repository visibility is set how you want (Public/Private with Pages allowed).
2) In GitHub, open Settings → Pages and set:
   - Source: “GitHub Actions”.
3) Push to `main` and the workflow will build and deploy `dist/` to Pages.

Details:
- Vite base path is set to `'/hash/'` in `vite.config.js:1` so assets resolve correctly at `https://<user>.github.io/hash/`.
- Workflow file: `.github/workflows/deploy.yml:1` builds with Node 20 and deploys with `actions/deploy-pages`.

Manual alternative (gh-pages branch):
- `npm install -D gh-pages`
- Add script: `"deploy": "vite build && gh-pages -d dist"`
- Run: `npm run deploy`
