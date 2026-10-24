const metrics = [
  { value: "58%", copy: "Increase in pick up point use", position: "top-left" },
  { value: "23%", copy: "Decreased in customer phone calls", position: "top-right" },
  { value: "27%", copy: "Increase in pick up point use", position: "bottom-left" },
  { value: "40%", copy: "Decreased in customer phone calls", position: "bottom-right" },
];

export default function Home() {
  return (
    <main className="hero" aria-labelledby="hero-title">
      <div className="hero__topline" aria-label="ITZFIZZ scroll experience">
        <span>ITZFIZZ</span>
        <span>SCROLL TO DRIVE</span>
      </div>

      <section className="hero__scene">
        <div className="metrics metrics--top">
          {metrics.slice(0, 2).map((metric) => (
            <article className={`metric metric--${metric.position}`} key={metric.value}>
              <p className="metric__value">{metric.value}</p>
              <p className="metric__copy">{metric.copy}</p>
            </article>
          ))}
        </div>

        <div className="road" aria-hidden="true">
          <div className="road__edge road__edge--top" />
          <div className="road__edge road__edge--bottom" />
          <div className="road__marks" />
          <div className="car-placeholder">
            <span className="car-placeholder__glass" />
            <span className="car-placeholder__light car-placeholder__light--left" />
            <span className="car-placeholder__light car-placeholder__light--right" />
          </div>
        </div>

        <h1 className="hero__title" id="hero-title">
          <span>WELCOME</span>
          <span className="hero__title-accent">ITZFIZZ</span>
        </h1>

        <div className="metrics metrics--bottom">
          {metrics.slice(2).map((metric) => (
            <article className={`metric metric--${metric.position}`} key={metric.value}>
              <p className="metric__value">{metric.value}</p>
              <p className="metric__copy">{metric.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="scroll-cue">
        <span className="scroll-cue__line" aria-hidden="true" />
        Scroll to begin
      </p>
    </main>
  );
}
