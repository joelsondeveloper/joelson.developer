# joelson.developer

A retro, VHS-inspired **cinematic personal portfolio**. This repository currently
holds the **project foundation** — Next.js (App Router), React, TypeScript,
Tailwind CSS v4 and GSAP (with ScrollTrigger) — prepared to receive the first
cinematic scene.

> The experience begins soon.

## Tech stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS v4** for styling (design tokens defined as CSS variables)
- **GSAP** (+ ScrollTrigger) for animation, bridged to React via `src/hooks/use-gsap.ts`

## Getting started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Project structure

```
src/
  app/            # App Router entry (layout, page, globals.css)
  components/     # layout / ui / scenes
  hooks/          # React hooks (GSAP bridge, prefers-reduced-motion)
  lib/            # site metadata, GSAP setup
  styles/         # additional global styles
  types/          # shared TypeScript types
public/
  images/  videos/  fonts/
```

## License

MIT — see [LICENSE](./LICENSE).
