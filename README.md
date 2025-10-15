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
