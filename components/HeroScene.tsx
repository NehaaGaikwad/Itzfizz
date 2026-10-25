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

// The trail leading edge sits this far along the car (0 = rear, 1 = nose),
// so the paint always appears from underneath the car body.
const TRAIL_EDGE = 0.5;
// Fixed pixel width of the soft gradient feather at the trail leading edge.
const FEATHER_PX = 120;

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
          // Reduced motion: snap to finished state immediately.
          if ((ctx.conditions as { reduce?: boolean }).reduce) {
            gsap.set(car, { x: () => road.clientWidth - car.offsetWidth });
            gsap.set(trail, { "--tw": (road.clientWidth + FEATHER_PX) + "px" });
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

          // Give GSAP ownership of --tw (trail width in px).
          // The CSS mask-image reads this so the feather is always
          // FEATHER_PX wide, regardless of how far the trail has grown.
          gsap.set(trail, { "--tw": "0px" });

          const setTrailWidth = gsap.quickSetter(trail, "--tw", "px") as (v: number) => void;
          const tiltTo = gsap.quickTo(carBody, "rotation", { duration: 0.5, ease: "power3.out" });

          const sync = (self?: ScrollTrigger) => {
            const carX = gsap.getProperty(car, "x") as number;

            // --tw = pixel position where fully-opaque paint ends.
            // Solid green fills behind the car; gradient fades to transparent
            // right at the car's left edge â€” feather extends 250 px to the left.
            setTrailWidth(
              gsap.utils.clamp(0, roadWidth + FEATHER_PX, carX)
            );

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
            { x: () => road.clientWidth - car.offsetWidth * TRAIL_EDGE, duration: 1 },
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
            Paint trail: full-width div always present, revealed left-to-right
            by a CSS mask driven by --tw (px). Mask is fully opaque up to
            (--tw - 72px) then fades to transparent at --tw, giving a constant
            72 px soft feather at the leading edge at every scroll position.
          */}
          <div
            className="js-trail absolute inset-x-0 inset-y-[15%] bg-paint"
            style={{
              maskImage: "linear-gradient(to right, black calc(var(--tw, 0px) - 120px), transparent var(--tw, 0px))",
              WebkitMaskImage: "linear-gradient(to right, black calc(var(--tw, 0px) - 120px), transparent var(--tw, 0px))",
            } as React.CSSProperties}
          />

          {/* headline */}
          <h1
            className="absolute inset-0 flex items-center justify-center gap-[0.12em] pr-[clamp(8rem,22vw,18rem)] font-display text-[clamp(1.5rem,5.6vw,6.5rem)] font-bold leading-none [perspective:600px]"
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





