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

export function HeroScene() {
  const scrollRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const metricsRef = useRef<HTMLElement[]>([]);

  useLayoutEffect(() => {
    const { gsap } = getGsap();
    const scope = sceneRef.current;
    const scroll = scrollRef.current;
    const road = roadRef.current;
    const car = carRef.current;
    const trail = trailRef.current;
    const title = titleRef.current;

    if (!scope || !scroll || !road || !car || !trail || !title) return;

    const context = gsap.context(() => {
      const letters = title.querySelectorAll<HTMLElement>(".hero__letter");
      const metricCards = metricsRef.current.filter(Boolean);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set([letters, metricCards], { autoAlpha: 1, clearProps: "transform" });
        gsap.set(trail, { scaleX: 1 });
        return;
      }

      gsap.set(letters, { autoAlpha: 0 });
      gsap.set(metricCards, { autoAlpha: 0, y: 18 });
      gsap.set(trail, { scaleX: 0, transformOrigin: "left center" });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: scroll,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(trail, { scaleX: 1, duration: 1 }, 0)
        .to(car, { x: () => Math.max(0, road.clientWidth - car.clientWidth - 72), duration: 1, ease: "none" }, 0)
        .to(letters, { autoAlpha: 1, duration: 0.035, stagger: 0.045 }, 0.55)
        .to(metricCards, { autoAlpha: 1, y: 0, duration: 0.12, stagger: 0.16 }, 0.8);
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <main className="hero-scroll" ref={scrollRef}>
      <section className="hero" aria-labelledby="hero-title" ref={sceneRef}>
        <div className="hero__topline" aria-label="ITZFIZZ scroll experience"><span>ITZFIZZ</span><span>SCROLL TO DRIVE</span></div>
        <div className="hero__scene">
          <div className="metrics metrics--top">{metrics.slice(0, 2).map((metric, index) => <article className={`metric metric--${metric.position}`} key={metric.value} ref={(node) => { if (node) metricsRef.current[index] = node; }}><p className="metric__value">{metric.value}</p><p className="metric__copy">{metric.copy}</p></article>)}</div>
          <div className="road" aria-hidden="true" ref={roadRef}><div className="road__edge road__edge--top" /><div className="road__edge road__edge--bottom" /><div className="road__marks" /><div className="road__trail" ref={trailRef} /><div className="hero-car-motion" ref={carRef}><Image alt="" aria-hidden="true" className="hero-car" height={724} priority src="/images/glossy-red-supercar.png" width={2172} /></div></div>
          <h1 className="hero__title" id="hero-title" ref={titleRef}>{headline.map((character, index) => <span className={`hero__letter${character === " " ? " hero__letter--space" : ""}${index >= 8 ? " hero__letter--accent" : ""}`} key={`${character}-${index}`}>{character === " " ? " " : character}</span>)}</h1>
          <div className="metrics metrics--bottom">{metrics.slice(2).map((metric, index) => <article className={`metric metric--${metric.position}`} key={metric.value} ref={(node) => { if (node) metricsRef.current[index + 2] = node; }}><p className="metric__value">{metric.value}</p><p className="metric__copy">{metric.copy}</p></article>)}</div>
        </div>
        <p className="scroll-cue"><span className="scroll-cue__line" aria-hidden="true" />Scroll to drive</p>
      </section>
    </main>
  );
}
