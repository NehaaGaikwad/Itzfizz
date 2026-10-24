# ITZFIZZ scroll hero

A responsive, scroll-driven Next.js hero built with React, Tailwind CSS, and GSAP ScrollTrigger.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Validate and build

```bash
npm run lint
npm run build
```

The production build is a static export in `out/`. For a project GitHub Pages deployment, set `NEXT_PUBLIC_BASE_PATH` to the repository path before building:

```bash
NEXT_PUBLIC_BASE_PATH=/your-repository-name npm run build
```

The included GitHub Actions workflow performs this automatically on pushes to `main`. In repository settings, select **GitHub Actions** as the GitHub Pages source.

## Asset note

`public/images/glossy-red-supercar.png` is the user-provided, authorized car asset. It is a transparent 2172 × 724 PNG and is intentionally kept in its supplied right-facing orientation.
