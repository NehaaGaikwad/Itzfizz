"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { getGsap } from "../lib/gsap";

const metrics = [
  { value: "58%", copy: "Increase in pick up point use", position: "top-left" },
  { value: "23%", copy: "Decreased in customer phone calls", position: "top-right" },
  { value: "27%", copy: "Increase in pick up point use", position: "bottom-left" },
  { value: "40%", copy: "Decreased in customer phone calls", position: "bottom-right" },
];

const headline = "WELCOME ITZFIZZ".split("");
const carImageSrc = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/glossy-red-supercar.png`;

export function HeroScene() {
  const scrollRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const metricsRef = useRef<HTMLElement[]>([]);

  useLayoutEffect(() => {
    const { gsap, ScrollTrigger } = getGsap();
    const scope = sceneRef.current;
    const scroll = scrollRef.current;
    const road = roadRef.current;
    const car = carRef.current;
    const trail = trailRef.current;
    const title = titleRef.current;
    const refreshScrollTrigger = () => ScrollTrigger.refresh();

    if (!scope || !scroll || !road || !car || !trail || !title) return;

    const context = gsap.context(() => {
      const letters = title.querySelectorAll<HTMLElement>(".hero__letter");
      const metricCards = metricsRef.current.filter(Boolean);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set([letters, metricCards], { autoAlpha: 1, clearProps: "transform" });
        gsap.set(trail, { scaleX: 1, transformOrigin: "left center" });
        return;
      }

      gsap.set(letters, { autoAlpha: 0, y: 12 });
      gsap.set(metricCards, { autoAlpha: 0, y: 18 });
      gsap.set(trail, { scaleX: 0, transformOrigin: "left center" });

      gsap
        .timeline({ delay: 0.12 })
        .to(letters, { autoAlpha: 1, duration: 0.42, ease: "power2.out", stagger: 0.035, y: 0 })
        .to(metricCards, { autoAlpha: 1, duration: 0.38, ease: "power2.out", stagger: 0.12, y: 0 }, "-=0.12");

      gsap.timeline({
        scrollTrigger: {
          end: "bottom bottom",
          invalidateOnRefresh: true,
          scrub: 0.35,
          start: "top top",
          trigger: scroll,
        },
      })
        .to(trail, { duration: 1, ease: "none", scaleX: 1 }, 0)
        .to(
          car,
          {
            duration: 1,
            ease: "none",
            x: () => Math.max(0, road.clientWidth - car.clientWidth - 72),
          },
          0,
        );

      window.addEventListener("load", refreshScrollTrigger, { once: true });
    }, scope);

    return () => {
      window.removeEventListener("load", refreshScrollTrigger);
      context.revert();
    };
  }, []);

  return (
    <main className="hero-scroll" ref={scrollRef}>
      <section className="hero" aria-labelledby="hero-title" ref={sceneRef}>
        <div className="hero__topline" aria-label="ITZFIZZ scroll experience">
          <span>ITZFIZZ</span>
          <span>Scroll to drive</span>
        </div>

        <div className="hero__scene">
          <div className="metrics metrics--top">
            {metrics.slice(0, 2).map((metric, index) => (
              <article className={`metric metric--${metric.position}`} key={metric.value} ref={(node) => { if (node) metricsRef.current[index] = node; }}>
                <p className="metric__value">{metric.value}</p>
                <p className="metric__copy">{metric.copy}</p>
              </article>
            ))}
          </div>

          <div className="road" aria-hidden="true" ref={roadRef}>
            <div className="road__edge road__edge--top" />
            <div className="road__edge road__edge--bottom" />
            <div className="road__marks" />
            <div className="road__trail" ref={trailRef} />
            <div className="hero-car-motion" ref={carRef}>
              <Image alt="" aria-hidden="true" className="hero-car" height={724} priority src={carImageSrc} width={2172} />
            </div>
          </div>

          <h1 aria-label="Welcome ITZFIZZ" className="hero__title" id="hero-title" ref={titleRef}>
            {headline.map((character, index) => (
              <span aria-hidden="true" className={`hero__letter${character === " " ? " hero__letter--space" : ""}${index >= 8 ? " hero__letter--accent" : ""}`} key={`${character}-${index}`}>
                {character === " " ? "\u00a0" : character}
              </span>
            ))}
          </h1>

          <div className="metrics metrics--bottom">
            {metrics.slice(2).map((metric, index) => (
              <article className={`metric metric--${metric.position}`} key={metric.value} ref={(node) => { if (node) metricsRef.current[index + 2] = node; }}>
                <p className="metric__value">{metric.value}</p>
                <p className="metric__copy">{metric.copy}</p>
              </article>
            ))}
          </div>
        </div>

        <p className="scroll-cue"><span className="scroll-cue__line" aria-hidden="true" />Scroll to drive</p>
      </section>
    </main>
  );
}
