import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import assets, { HERO_CARD_IMAGE } from "@/lib/assets";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ST } from "@/lib/motion";

// Keep ScrollTrigger from being tree-shaken.
void ScrollTrigger;

/**
 * `<StoryBridge>` — editorial image + narrative block between the
 * Marquee ribbon and the TrainerConnector diagram.
 *
 * Places the HERO_CARD_IMAGE (school gate portrait) alongside a short
 * narrative paragraph so the photo tells a story in context rather than
 * floating disconnected in the hero. The layout is a two-column split
 * on desktop (image left, text right) and stacked on mobile.
 *
 * Motion: the image and text fade/slide in on scroll via ScrollTrigger.
 * Reduced-motion: instant opacity.
 *
 * @returns {JSX.Element}
 */
export const StoryBridge = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);

  useGSAP(
    () => {
      const imageEl = imageRef.current;
      const textEl = textRef.current;
      if (!imageEl || !textEl) return;

      gsap.set([imageEl, textEl], { opacity: 0, y: 40 });

      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: ST.trainerConnectorStart || "top 60%",
          toggleActions: "play none none reverse",
        },
      })
        .to(imageEl, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        })
        .to(
          textEl,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.5",
        );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="w-full px-6 md:px-16 py-20 md:py-32 bg-e1-bg"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        {/* Image — the school gate portrait, now in narrative context */}
        <div ref={imageRef} className="flex justify-center">
          <img
            src={HERO_CARD_IMAGE}
            width={assets.HERO_CARD_IMAGE.width}
            height={assets.HERO_CARD_IMAGE.height}
            alt={assets.HERO_CARD_IMAGE.altPlaceholder}
            loading="lazy"
            className="w-full max-w-sm rounded-xl shadow-2xl ring-1 ring-white/10 object-cover"
          />
        </div>

        {/* Narrative text */}
        <div ref={textRef} className="space-y-6">
          <h2 className="font-display text-e1-text text-3xl md:text-4xl leading-tight">
            It starts at the school gate.
          </h2>
          <p className="font-sans text-e1-text-muted text-base md:text-lg leading-relaxed">
            Before the framework, before the circles — there's a man showing up.
            Standing where no one stood for him. The work begins long before
            anyone calls it a programme.
          </p>
          <p className="font-sans text-e1-text-muted text-base md:text-lg leading-relaxed">
            This is what rebuilding looks like: one gate, one morning, one
            decision to be present.
          </p>
        </div>
      </div>
    </section>
  );
};

export default StoryBridge;
