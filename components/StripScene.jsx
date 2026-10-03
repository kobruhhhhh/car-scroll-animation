"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import StatCard from "./StatCard";

gsap.registerPlugin(ScrollTrigger);

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Overlap ratio that keeps the car rear sitting on the green edge at every viewport size.
const CAR_GAP_RATIO = 0.17;
// Final green boundary measured from the reference frame, applied as a responsive fraction of the strip width.
const GREEN_END_FRACTION = 0.8026;
// Send the car beyond the viewport at 100% so only its rear remains visible.
const CAR_VISIBLE_AT_END = 0.3;

// Pre-applied hidden state so the cards never flash before GSAP initialises (no display:none, which GSAP cannot animate).
const CARD_HIDDEN = { opacity: 0, transform: "translateY(20px) scale(0.97)" };
const CARD_REVEAL_DURATION = 0.15;

// Reveal slots are ordered YELLOW -> BLUE -> BLACK -> ORANGE along the same scroll timeline as the car.

const TOP_CARDS = [
  {
    value: "58%",
    label: "Increase in pick up point use",
    tone: "lime",
    revealAt: 0.15,
    className: "w-[calc(50vw-24px)] md:h-[153px] md:w-[289px]",
  },
  {
    value: "27%",
    label: "Increase in pick up point use",
    tone: "charcoal",
    revealAt: 0.45,
    className: "w-[calc(50vw-24px)] md:h-[150px] md:w-[263px]",
  },
];

const BOTTOM_CARDS = [
  {
    value: "23%",
    label: "Decreased in customer phone calls",
    tone: "sky",
    revealAt: 0.25,
    className: "w-[calc(50vw-24px)] md:h-[150px] md:w-[310px]",
  },
  {
    value: "40%",
    label: "Decreased in customer phone calls",
    tone: "blaze",
    revealAt: 0.65,
    className: "w-[calc(50vw-24px)] md:h-[150px] md:w-[310px]",
  },
];

export default function StripScene() {
  const sectionRef = useRef(null);
  const stripRef = useRef(null);
  const greenRef = useRef(null);
  const carRef = useRef(null);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const strip = stripRef.current;
      const car = carRef.current;
      const green = greenRef.current;

      // All positions derive from measured strip/car widths so the animation holds at any viewport.
      const gapPx = () => car.offsetWidth * CAR_GAP_RATIO;
      const boundaryEndX = () =>
        strip.clientWidth * GREEN_END_FRACTION - gapPx();
      const carMidX = () => boundaryEndX() / 2;
      const carEndX = () =>
        strip.clientWidth - car.offsetWidth * CAR_VISIBLE_AT_END;
      const greenStart = () => gapPx() / strip.clientWidth;
      const greenMid = () => (carMidX() + gapPx()) / strip.clientWidth;
      const greenEnd = () => (carEndX() + gapPx()) / strip.clientWidth;

      // Pin the section so the scrollbar scrubs a fixed scene instead of scrolling it out of view.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        // Scrub ties timeline progress directly to scroll position: no timers, fully reversible.
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () =>
            "+=" + Math.max(1000, Math.round(window.innerHeight * 1.5)),
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Car movement is driven purely by scroll progress, so scrolling up replays it backwards exactly.
      tl.fromTo(car, { x: 0 }, { x: carMidX, duration: 0.5 }, 0)
        .fromTo(
          car,
          { x: carMidX },
          { x: carEndX, duration: 0.5, immediateRender: false },
          0.5
        )
        // Green edge always leads the car rear by the gap, so no black road is exposed behind the car.
        .fromTo(
          green,
          { scaleX: greenStart },
          { scaleX: greenMid, duration: 0.5 },
          0
        )
        .fromTo(
          green,
          { scaleX: greenMid },
          { scaleX: greenEnd, duration: 0.5, immediateRender: false },
          0.5
        );

      const cards = sectionRef.current.querySelectorAll("[data-stat-card]");
      cards.forEach((card) => {
        const at = Number(card.dataset.revealAt);
        if (Number.isNaN(at)) return;
        tl.to(
          card,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: CARD_REVEAL_DURATION,
            ease: "power2.out",
          },
          at
        );
      });
    }, sectionRef);

    // Re-measure after web fonts load, since the headline width affects layout.
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    // Revert the GSAP context on unmount to prevent duplicate ScrollTriggers in React Strict Mode.
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen w-full bg-page">
      <div className="flex h-full flex-col justify-center gap-[clamp(36px,min(7.5vw,15.5vh),142px)]">
        <div className="flex justify-center gap-[clamp(12px,6.2vw,119px)] px-4 md:justify-end md:pr-[10.86%]">
          {TOP_CARDS.map((card) => (
            <StatCard key={card.value} {...card} style={CARD_HIDDEN} />
          ))}
        </div>

        {/* The black road is a fixed base layer; only the green panel scales over it. */}
        {/* vw-based clamps keep strip height and headline size proportional across viewports. */}
        <div
          ref={stripRef}
          data-strip="true"
          className="relative h-[clamp(44px,10.5vw,200px)] w-full overflow-hidden bg-road"
        >
          <div
            ref={greenRef}
            data-green="true"
            aria-hidden="true"
            className="absolute inset-y-0 left-0 z-0 w-full origin-left bg-fizz will-change-transform"
            style={{ transform: "scaleX(0.034)" }}
          />

          {/* The headline stays static; the moving green panel reveals its dark text through color contrast. */}
          <h1 className="absolute left-[5%] top-1/2 z-10 -translate-y-1/2 whitespace-nowrap text-[clamp(24px,6.93vw,260px)] font-bold leading-none text-road">
            WELCOME ITZFIZZ
          </h1>

          {/* Height-based sizing keeps the car proportional and inside the strip at every viewport. */}
          <img
            ref={carRef}
            data-car="true"
            src="/car.png"
            alt=""
            width={3981}
            height={1901}
            draggable={false}
            aria-hidden="true"
            className="absolute left-0 top-[4.5%] z-20 h-[91%] w-auto max-w-none select-none will-change-transform"
          />
        </div>

        <div className="flex justify-center gap-[clamp(12px,6.2vw,119px)] px-4 md:justify-end md:pr-[13.38%]">
          {BOTTOM_CARDS.map((card) => (
            <StatCard key={card.value} {...card} style={CARD_HIDDEN} />
          ))}
        </div>
      </div>
    </section>
  );
}
