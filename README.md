# Umvat Minigames

A neal.fun-style site: a colorful grid of small browser minigames.
Built with Vite + React + TypeScript + React Router.

## Scripts

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build -> dist/
npm run preview  # serve the production build
```

## Adding a minigame

1. Create `src/games/<slug>/index.tsx` with a default-exported React component
   (copy `src/games/click-speed` as a template).
2. Register it in `src/games/registry.ts` with `component: () => import("./<slug>")`.

It's then live at `/play/<slug>`, lazy-loaded in its own chunk. Entries without a
`component` show as "Coming soon" cards.

Use `useLocalStorage` (`src/hooks`) for high scores. Rename the site in `src/site.ts`.

## Deploying

`dist/` is a static SPA. `public/_redirects` handles client-side routing on
Cloudflare Pages / Netlify. For other hosts, rewrite all routes to `index.html`.
