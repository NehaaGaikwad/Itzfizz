# Milestone 0 — Reference audit and scope lock

## Product statement

Build a single-screen, scroll-controlled ITZFIZZ automotive hero. The car is
the progress indicator: as the visitor scrolls, it travels left to right across
the road, leaves a green trail, activates the spaced headline, and reveals four
impact metrics. It must not autoplay once scroll interaction starts.

The percentages and descriptions below are reference/concept content, not
verified business claims.

## Observed reference contract

Source inspected: `https://paraschaturvedi.github.io/car-scroll-animation/`
and its documented recreation. The visible reference content is:

- Headline: `W E L C O M E ITZFIZZ`
- Metrics: `58% Increase in pick up point use`; `23% Decreased in customer
  phone calls`; `27% Increase in pick up point use`; `40% Decreased in
  customer phone calls`.

The documented interaction and layout establish the following states.

| State | Scroll progress | Expected scene |
| --- | --- | --- |
| Initial | 0.00 | One complete viewport: road band and car visible; headline and metrics are hidden or deliberately subdued. |
| Early journey | 0.15–0.35 | The car starts driving left to right; green trail grows from the left; early letters and first metric activate. |
| Mid journey | 0.35–0.70 | Car crosses the centre of the band; middle headline letters activate; remaining metrics appear in sequence. |
| Final | 0.70–1.00 | Car reaches a measured endpoint that clears the final letters; full trail, headline, and all metrics are settled. |

## Interaction rules

1. The pinned hero uses one normalized scroll timeline. Car position, trail,
   letters, and metrics derive from it.
2. The car and trail use transform-based animation (`translate` / `scaleX`),
   never timer-driven movement.
3. A letter becomes active when the car's leading edge reaches it. A metric
   fades/slides in when the car reaches its assigned column.
4. Upward scrolling must deterministically restore every earlier state.
5. Letter and metric positions are measured after font load and refreshed on
   resize—not read continuously in the scroll hot path.
6. The final car position is derived from the live track geometry, preserving
   visibility across desktop, tablet, and mobile.

## Visual direction and implementation choices

- **Composition:** a `100svh` pinned stage, with two metric cards above and
  two below a central road band.
- **Typography:** confident, widely tracked editorial headline; high-contrast,
  legible metric text.
- **Palette:** near-black/ink base, neutral road, off-white text, and a single
  green accent used as progress—not general decoration.
- **Car:** a local inline, top-view SVG. Its body, wheels/details, shadow, and
  highlight layers remain independently controllable.
- **Enhancement boundary:** refined spacing, restrained depth, and subtle
  entrance settling are allowed; neon/glass effects, video backgrounds,
  autoplay, cursor gimmicks, and unrelated looping motion are excluded.

## Accessibility and resilience baseline

- The split visual headline will retain a single coherent accessible name.
- Decorative SVG parts will be hidden from assistive technology.
- `prefers-reduced-motion` will show a fully readable static state.
- Responsive layouts will preserve content before animation and avoid clipped
  cards or horizontal overflow.

## Acceptance checklist for later milestones

- [ ] At 1440×900, 1280×720, tablet, and mobile sizes, the initial hero reads
  as a deliberate, complete composition.
- [ ] Scroll progress exclusively controls the car; stopping scroll stops it.
- [ ] Trail, letters, and metrics stay synchronized with that same progress.
- [ ] Reverse scroll, resize, reload, and pinned-section release behave cleanly.
- [ ] Production build completes without console errors or broken local assets.
- [ ] GitHub Pages static export can deploy the final `out/` directory.

## Scope decision

The build will use Next.js App Router, TypeScript, Tailwind CSS, GSAP,
ScrollTrigger, and a local inline SVG car. GitHub Pages static export and its
workflow belong to Milestone 9, after the interactive experience is complete.
