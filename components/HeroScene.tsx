"use client";

import Image from "next/image";
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { stats } from "../lib/stats";

const carImageSrc = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/glossy-red-supercar.png`;

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HEADLINE = "WELCOME ITZFIZZ";
const GHOST = "transparent"; // invisible until car sweeps past
const INK = "#0b0b0c";        // lit letter on the painted trail

// The source PNG has transparent padding. These are the measured bounds of
// the actual car body within its 2172px-wide image.
const CAR_BODY_LEFT_RATIO = 330 / 2172;
const CAR_BODY_WIDTH_RATIO = (1767 - 330) / 2172;
const END_VISIBLE_CAR_RATIO = 0.5;

// At the end, only the rear 50% of the visible vehicle remains inside the
// road. The front/nose is clipped beyond the road's right edge.
const END_CAR_OFFSET_RATIO =
  CAR_BODY_LEFT_RATIO + CAR_BODY_WIDTH_RATIO * (1 - END_VISIBLE_CAR_RATIO);

// The trail leading edge sits around the car's midpoint at the start.
const TRAIL_EDGE = 0.5;
// Extend the solid trail underneath the car's transparent rear padding.
// This deliberately replaces the dynamic gradient feather, which produced a
// dark seam and flicker while the scroll position changed.
const FEATHER_PX = 80;

export function HeroScene() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const road = q(".js-road")[0] as HTMLElement;
      const car = q(".js-car")[0] as HTMLElement;
      const carBody = q(".js-car-body")[0] as HTMLElement;
      const trailSolid = q(".js-trail-solid")[0] as HTMLElement;
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
          // Reduced motion: snap to finished state immediately.
          if ((ctx.conditions as { reduce?: boolean }).reduce) {
            gsap.set(car, { x: () => road.clientWidth - car.offsetWidth * END_CAR_OFFSET_RATIO });
            gsap.set(trailSolid, { autoAlpha: 1, width: road.clientWidth + FEATHER_PX });
            gsap.set(letters, { color: INK });
            gsap.set(fills, { scaleY: 1 });
            gsap.set(cards, { autoAlpha: 1, y: 0 });
            gsap.set(cardText, { color: INK });
            return;
          }

          // Intro: only topline + car slide-in. Letters & cards appear on scroll.
          gsap.set(cards, { autoAlpha: 0, y: 24 }); // hidden until car passes
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from(q(".js-fade"), { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.1 })
            .from(carBody, { xPercent: -140, duration: 1.4, ease: "expo.out" }, 0.35);

          // ---------------------------------------------------------------
          // 2. Scroll: progress-based, scrubbed with smoothing
          // ---------------------------------------------------------------
          let roadWidth = 1;
          let letterCenters: number[] = [];
          const lit = letters.map(() => false);

          const measure = () => {
            roadWidth = road.clientWidth;
            const roadLeft = road.getBoundingClientRect().left;
            letterCenters = letters.map((el) => {
              const r = el.getBoundingClientRect();
              return r.left - roadLeft + r.width / 2;
            });
          };
          measure();

          // Start hidden; the element keeps a minimum width equal to the
          // feather, making its fixed-pixel gradient valid at every point.
          gsap.set(trailSolid, { autoAlpha: 0, width: FEATHER_PX });

          const setTrailWidth = gsap.quickSetter(trailSolid, "width", "px") as (v: number) => void;
          const setTrailOpacity = gsap.quickSetter(trailSolid, "opacity") as (v: number) => void;
          const tiltTo = gsap.quickTo(carBody, "rotation", { duration: 0.5, ease: "power3.out" });

          const sync = (self?: ScrollTrigger) => {
            const carX = gsap.getProperty(car, "x") as number;

            // The solid section grows with the car. The final FEATHER_PX is
            // always the same size, so the gradient looks uniform throughout.
            const solidTrailEnd = gsap.utils.clamp(0, roadWidth, carX + FEATHER_PX);
            setTrailWidth(solidTrailEnd + FEATHER_PX);
            setTrailOpacity(solidTrailEnd > 0 ? 1 : 0);

            // Letters only reveal AFTER the car has passed them.
            letterCenters.forEach((center, i) => {
              const on = carX >= center;
              if (on === lit[i]) return;
              lit[i] = on;
              gsap.to(letters[i], { color: on ? INK : GHOST, duration: 0.3, overwrite: "auto" });
              if (on) {
                gsap.fromTo(
                  letters[i],
                  { scale: 1.25 },
                  { scale: 1, duration: 0.55, ease: "back.out(3)", overwrite: "auto" }
                );
              }
            });

            if (self) tiltTo(gsap.utils.clamp(-3, 3, self.getVelocity() / 600));
          };

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            onUpdate: function (this: gsap.core.Timeline) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sync((this as any).scrollTrigger ?? undefined);
            },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => "+=" + window.innerHeight * 2.2,
              pin: true,
              scrub: 1.2,
              invalidateOnRefresh: true,
              onRefresh: (self) => {
                measure();
                sync(self);
              },
              onScrubComplete: () => tiltTo(0),
            },
          });

          tl.fromTo(
            car,
            { x: () => -car.offsetWidth * TRAIL_EDGE },
            { x: () => road.clientWidth - car.offsetWidth * END_CAR_OFFSET_RATIO, duration: 1 },
            0
          );
          tl.to(q(".js-hint"), { autoAlpha: 0, duration: 0.08 }, 0);

          cards.forEach((card, i) => {
            const at = 0.2 + i * 0.2;
            tl.to(card, { autoAlpha: 1, y: 0, duration: 0.1, ease: "power2.out" }, at - 0.04);
            tl.fromTo(fills[i], { scaleY: 0 }, { scaleY: 1, duration: 0.14, ease: "power2.out" }, at);
            tl.to(cardText[i], { color: "#111311", duration: 0.08 }, at + 0.03);
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
          Neha Gaikwad
        </span>
      </header>

      {/* scene: 2 cards road 2 cards */}
      <div className="flex flex-1 flex-col justify-center gap-6 px-5 sm:px-10">

        {/* top 2 stat cards */}
        <ul className="flex justify-center gap-16 sm:gap-32 md:gap-48 lg:gap-64 w-full">
          {stats.slice(0, 2).map((s) => (
            <li
              key={s.value + s.label}
              className="js-stat relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 w-44 sm:w-48 shrink-0"
            >
              <div className="js-stat-fill absolute inset-0 origin-bottom scale-y-0" style={{ background: s.accent }} />
              <div className="js-stat-text relative" style={{ color: "#111311" }}>
                <p className="font-display text-4xl font-bold leading-tight">{s.value}</p>
                <p className="mt-1 text-sm leading-snug opacity-80">{s.label}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* road */}
        <div className="js-road relative h-[clamp(6rem,min(22vh,28vw),13rem)] w-full overflow-hidden bg-asphalt">
          <div className="absolute inset-x-0 top-[7%] h-[2px] bg-white" />
          <div className="absolute inset-x-0 bottom-[7%] h-[2px] bg-white" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />

          {/*
            Paint trail: a single animated layer with a fixed 80px gradient at
            its leading edge. It cannot scale wider as the trail grows.
          */}
          <div
            className="js-trail-solid pointer-events-none absolute inset-y-[15%] left-0 z-[1] w-0"
            style={{
              backgroundImage:
                `linear-gradient(to right, #c8f04a 0%, #c8f04a calc(100% - ${FEATHER_PX}px), rgba(200, 240, 74, 0) 100%)`,
            }}
          />

          {/* headline */}
          <h1
            className="absolute inset-0 z-[2] flex items-center justify-center gap-[0.12em] px-[clamp(0.75rem,3vw,3rem)] font-display text-[clamp(1.35rem,4.7vw,5.5rem)] font-bold leading-none whitespace-nowrap [perspective:600px]"
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

          {/* car */}
          <div className="js-car absolute inset-y-0 left-0 z-10 flex items-center will-change-transform">
            <div className="js-car-body h-[86%]">
              <Image
                alt=""
                aria-hidden="true"
                src={carImageSrc}
                height={724}
                width={2172}
                priority
                onLoad={() => ScrollTrigger.refresh()}
                className="h-full w-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* bottom 2 stat cards */}
        <ul className="flex justify-center gap-16 sm:gap-32 md:gap-48 lg:gap-64 w-full">
          {stats.slice(2).map((s) => (
            <li
              key={s.value + s.label}
              className="js-stat relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 w-44 sm:w-48 shrink-0"
            >
              <div className="js-stat-fill absolute inset-0 origin-bottom scale-y-0" style={{ background: s.accent }} />
              <div className="js-stat-text relative" style={{ color: "#111311" }}>
                <p className="font-display text-4xl font-bold leading-tight">{s.value}</p>
                <p className="mt-1 text-sm leading-snug opacity-80">{s.label}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* scroll hint */}
        <p className="js-hint text-center text-[10px] uppercase tracking-[0.4em] text-chalk/40">
          <span className="js-fade inline-block animate-nudge">Scroll to drive down</span>
        </p>

      </div>

    </section>
  );
}





