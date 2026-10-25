"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Car from "./Car";
import { stats } from "../lib/stats";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HEADLINE = "WELCOME ITZFIZZ";
const GHOST = "rgba(241, 239, 233, 0.16)"; // unlit letter on dark asphalt
const INK = "#0b0b0c"; // lit letter on the painted trail

// The trail's leading edge sits this far along the car (0 = rear, 1 = nose),
// so the paint always appears from underneath the car body.
const TRAIL_EDGE = 0.5;

export function HeroScene() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const road = q(".js-road")[0] as HTMLElement;
      const car = q(".js-car")[0] as HTMLElement;
      const carBody = q(".js-car-body")[0] as HTMLElement;
      const trail = q(".js-trail")[0] as HTMLElement;
      const letters = q(".js-letter") as HTMLElement[];
      const cards = q(".js-stat") as HTMLElement[];
      const fills = q(".js-stat-fill") as HTMLElement[];
      const cardText = q(".js-stat-text") as HTMLElement[];

      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          // Reduced motion: show the finished state, no movement.
          if ((ctx.conditions as { reduce?: boolean }).reduce) {
            gsap.set(car, { x: () => road.clientWidth - car.offsetWidth });
            gsap.set(trail, { scaleX: 1 });
            gsap.set(letters, { color: INK });
            gsap.set(fills, { scaleY: 1 });
            gsap.set(cardText, { color: INK });
            return;
          }

          // ---------------------------------------------------------------
          // 1. Intro: time-based, plays once on load
          // ---------------------------------------------------------------
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from(q(".js-fade"), { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.1 })
            .from(
              letters,
              { autoAlpha: 0, yPercent: 60, rotateX: -70, duration: 1.1, stagger: 0.05 },
              0.2
            )
            .from(carBody, { xPercent: -140, duration: 1.4, ease: "expo.out" }, 0.35)
            .from(cards, { autoAlpha: 0, y: 40, duration: 1, stagger: 0.14 }, 0.7);

          // ---------------------------------------------------------------
          // 2. Scroll: progress-based, scrubbed with smoothing
          // ---------------------------------------------------------------
          // Layout values are measured only on refresh (load/resize), never
          // inside the scroll handler, so scrolling triggers no reflow.
          let roadWidth = 1;
          let carWidth = 0;
          let letterCenters: number[] = [];
          const lit = letters.map(() => false);

          const measure = () => {
            roadWidth = road.clientWidth;
            carWidth = car.offsetWidth;
            const roadLeft = road.getBoundingClientRect().left;
            letterCenters = letters.map((el) => {
              const r = el.getBoundingClientRect();
              return r.left - roadLeft + r.width / 2;
            });
          };
          measure();

          const setTrail = gsap.quickSetter(trail, "scaleX") as (v: number) => void;
          const tiltTo = gsap.quickTo(carBody, "rotation", { duration: 0.5, ease: "power3.out" });

          const sync = (self?: ScrollTrigger) => {
            const edge = gsap.getProperty(car, "x") as number + carWidth * TRAIL_EDGE;
            setTrail(gsap.utils.clamp(0, 1, edge / roadWidth));

            // Light up each letter once the paint reaches its centre.
            letterCenters.forEach((center, i) => {
              const on = edge >= center;
              if (on === lit[i]) return;
              lit[i] = on;
              gsap.to(letters[i], { color: on ? INK : GHOST, duration: 0.35, overwrite: "auto" });
              if (on) {
                gsap.fromTo(
                  letters[i],
                  { scale: 1.25 },
                  { scale: 1, duration: 0.6, ease: "back.out(3)", overwrite: "auto" }
                );
              }
            });

            // Lean the car slightly into the direction of travel.
            if (self) tiltTo(gsap.utils.clamp(-3, 3, self.getVelocity() / 600));
          };

          let tl: gsap.core.Timeline;
          tl = gsap.timeline({
            defaults: { ease: "none" },
            // Runs after the timeline has rendered, so the trail and letters
            // read the car's position for this exact frame.
            onUpdate: function (this: gsap.core.Timeline) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sync((this as any).scrollTrigger ?? undefined);
            },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => "+=" + window.innerHeight * 2.2,
              pin: true,
              scrub: 1.2, // seconds of easing lag between scroll and animation
              invalidateOnRefresh: true,
              onRefresh: (self) => {
                measure();
                sync(self);
              },
              onScrubComplete: () => tiltTo(0),
            },
          });

          // Car drives across the full road: it starts with the trail edge at 0
          // (no paint visible) and ends with the trail edge at the road's end.
          tl.fromTo(
            car,
            { x: () => -car.offsetWidth * TRAIL_EDGE },
            { x: () => road.clientWidth - car.offsetWidth * TRAIL_EDGE, duration: 1 },
            0
          );
          tl.to(q(".js-hint"), { autoAlpha: 0, duration: 0.08 }, 0);

          // Each metric card fills with its colour as the car passes.
          cards.forEach((_, i) => {
            const at = 0.2 + i * 0.18;
            tl.fromTo(
              fills[i],
              { scaleY: 0 },
              { scaleY: 1, duration: 0.14, ease: "power2.out" },
              at
            );
            tl.to(cardText[i], { color: INK, duration: 0.08 }, at + 0.03);
          });

          sync();
        }
      );
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative flex h-svh flex-col overflow-hidden bg-ink"
      aria-label="Welcome to Itzfizz"
    >
      {/* top bar */}
      <header className="flex items-center justify-between px-5 pt-6 sm:px-10">
        <span className="js-fade font-display text-lg font-bold tracking-[0.2em] text-chalk">ITZFIZZ</span>
        <span className="js-fade text-xs uppercase tracking-[0.35em] text-chalk/40">
          Impact report · 2026
        </span>
      </header>

      {/* road */}
      <div className="flex flex-1 flex-col justify-center gap-4">
        <div className="js-road relative h-[clamp(6rem,min(24vh,30vw),14rem)] w-full overflow-hidden bg-asphalt">
          <div className="lane absolute inset-x-0 top-[7%] h-[3px]" />
          <div className="lane absolute inset-x-0 bottom-[7%] h-[3px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />

          {/* paint trail: same height as the car body, scaled with transform (never width) */}
          <div className="js-trail absolute inset-x-0 inset-y-[15%] origin-left scale-x-0 bg-paint will-change-transform" />

          {/* headline */}
          <h1
            className="absolute inset-0 flex items-center justify-center gap-[0.12em] font-display text-[clamp(1.5rem,5.6vw,6.5rem)] font-bold leading-none [perspective:600px]"
            aria-label="Welcome Itzfizz"
          >
            {HEADLINE.split("").map((ch, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={ch === " " ? "w-[0.5em]" : "js-letter inline-block"}
                style={ch === " " ? undefined : { color: GHOST }}
              >
                {ch === " " ? "\u00a0" : ch}
              </span>
            ))}
          </h1>

          {/* car: outer element is scroll-driven, inner handles intro + tilt */}
          <div className="js-car absolute inset-y-0 left-0 z-10 flex items-center will-change-transform">
            <div className="js-car-body h-[86%]">
              <Car className="h-full w-auto drop-shadow-2xl" />
            </div>
          </div>
        </div>

        <p className="js-hint text-center text-[10px] uppercase tracking-[0.4em] text-chalk/40">
          <span className="js-fade inline-block animate-nudge">Scroll to drive ↓</span>
        </p>
      </div>

      {/* metrics */}
      <ul className="grid grid-cols-2 gap-3 px-5 pb-6 sm:gap-4 sm:px-10 lg:grid-cols-4">
        {stats.map((s) => (
          <li
            key={s.value + s.label}
            className="js-stat relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6"
          >
            <div
              className="js-stat-fill absolute inset-0 origin-bottom scale-y-0"
              style={{ background: s.accent }}
            />
            <div className="js-stat-text relative text-chalk">
              <p className="font-display text-3xl font-bold sm:text-5xl">{s.value}</p>
              <p className="mt-1 text-xs leading-snug text-chalk/70 sm:text-sm">{s.label}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
