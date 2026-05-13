import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";

import NotchedSection from "@/components/NotchedSection";
import MagneticButton from "@/components/MagneticButton";
import assets, {
  HERO_AMBIENT_VIDEO,
  HERO_POSTER_IMAGE,
} from "@/lib/assets";
import { prefersReducedMotion, isSaveData } from "@/lib/motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Reference `ScrollTrigger` so bundlers keep the registration side-effects
// performed in `@/lib/gsap`.
void ScrollTrigger;

/**
 * `<HeroSection>` — the HomePage hero atmosphere.
 *
 * Renders the ambient video/poster background with a parallax decorative
 * element, a headline, subtitle, dual CTAs ("Buy the Book" + "Join a Circle"),
 * and a visible "I Need Help" crisis button.
 *
 * The parallax effect is retained from the E1 editorial overhaul. The
 * foreground content is animated via a GSAP timeline (opacity + yPercent).
 *
 * Feature: conversion-focused-simplification
 *
 * @param {object} props
 * @param {string} [props.headline="Rebuilding what apartheid destroyed."]
 * @param {string} [props.subtitle="Through the Six Trainers framework."]
 * @param {string} [props.primaryCtaLabel="Buy the Book"]
 * @param {string} [props.primaryCtaHref="/book"]
 * @param {string} [props.secondaryCtaLabel="Join a Circle"]
 * @param {string} [props.secondaryCtaHref="/join"]
 * @param {boolean} [props.showCrisisButton=true]
 * @returns {JSX.Element}
 * @see Requirements 4.1, 4.2, 4.3, 4.10, 4.11, 9.2, 11.1, 12.1
 */
export const HeroSection = ({
  headline = "Unearthing the Roots of Recourse.",
  subtitle = "A Six Trainers framework for men who are ready to rebuild.",
  primaryCtaLabel = "Buy the Book",
  primaryCtaHref = "/book",
  secondaryCtaLabel = "Join a Circle",
  secondaryCtaHref = "/join",
  showCrisisButton = true,
}) => {
  // Sample motion / save-data preference once at mount. Re-probing on every
  // render would risk a mid-session background swap, which is out of scope.
  const [useStaticPoster] = useState(
    () => prefersReducedMotion() || isSaveData(),
  );

  // Requirement 35.1: when the ambient video fails to load, swap to the
  // poster JPEG at the same dimensions. The flag is idempotent — once set,
  // subsequent error events are no-ops.
  const [videoError, setVideoError] = useState(false);
  const handleVideoError = useCallback(() => {
    setVideoError(true);
  }, []);

  const sectionRef = useRef(null);
  const parallaxRef = useRef(null);
  const foregroundRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);

  const navigate = useNavigate();

  useGSAP(
    () => {
      const headlineEl = headlineRef.current;
      const subtitleEl = subtitleRef.current;
      const ctaEl = ctaRef.current;
      if (!headlineEl || !subtitleEl || !ctaEl) return undefined;

      gsap.set(headlineEl, { transformPerspective: 600 });

      // Full animation timeline — always plays regardless of OS motion settings.
      const tl = gsap.timeline();

      tl.from(headlineEl, {
        opacity: 0,
        duration: 1,
        ease: "expo.out",
      });

      tl.from(
        subtitleEl,
        {
          opacity: 0,
          yPercent: 40,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.3",
      ).from(
        ctaEl,
        {
          opacity: 0,
          yPercent: 40,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.3",
      );
    },
    { scope: foregroundRef, dependencies: [headline, subtitle, primaryCtaLabel, secondaryCtaLabel] },
  );

  // Parallax animation for the decorative background element.
  // Always plays regardless of reduced-motion preference.
  // Requirements 6.1, 6.3
  useGSAP(
    () => {
      const section = sectionRef.current;
      const parallaxEl = parallaxRef.current;
      if (!section || !parallaxEl) return undefined;

      gsap.to(parallaxEl, {
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <div ref={sectionRef} className="relative">
    <NotchedSection
      tone="charcoal"
      className="relative min-h-[90vh] overflow-hidden"
    >
      {/* Parallax decorative background element (Requirements 6.1, 6.3, 6.4).
          A large blurred circle that translates at a slower rate than the
          page scroll, creating depth. Sized with viewport units so it
          never overflows small mobile viewports. */}
      <div
        ref={parallaxRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(600px,80vw)] h-[min(600px,80vw)] rounded-full bg-e1-primary/10 blur-3xl pointer-events-none will-change-transform"
        aria-hidden="true"
      />

      {/* Background media layer (Requirements 15.1, 15.3, 15.4, 15.5, 15.6). */}
      <div className="absolute inset-0 w-full h-full">
        {useStaticPoster || videoError ? (
          <img
            src={HERO_POSTER_IMAGE}
            width={assets.HERO_POSTER_IMAGE.width}
            height={assets.HERO_POSTER_IMAGE.height}
            loading="eager"
            alt={assets.HERO_POSTER_IMAGE.altPlaceholder}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={HERO_AMBIENT_VIDEO}
            width={assets.HERO_AMBIENT_VIDEO.width}
            height={assets.HERO_AMBIENT_VIDEO.height}
            poster={HERO_POSTER_IMAGE}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            onError={handleVideoError}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/*
        Charcoal wash overlay (Requirement 15.2). The 75 % opacity `e1-bg`
        layer brings the net video opacity down to ~ 25 %, leaving headroom
        for legible foreground typography while preserving the ambient feel.
      */}
      <div
        className="absolute inset-0 w-full h-full bg-e1-bg opacity-75 pointer-events-none"
        aria-hidden="true"
      />

      {/*
        Foreground content slot with dual CTAs and crisis button.
        Reading order: headline → subtitle → primary CTA → secondary CTA → crisis button.
      */}
      <div
        ref={foregroundRef}
        className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-8 py-24 text-center"
      >
        <h1
          ref={headlineRef}
          className="font-display text-e1-text text-5xl md:text-7xl lg:text-8xl leading-none"
          aria-label={headline}
        >
          {headline}
        </h1>
        <p
          ref={subtitleRef}
          className="mt-6 font-sans text-e1-text-muted text-lg md:text-xl uppercase tracking-wider"
        >
          {subtitle}
        </p>
        <div ref={ctaRef} className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
          <MagneticButton
            className="font-sans uppercase text-sm tracking-wider px-8 py-4 border border-e1-primary text-e1-primary hover:bg-e1-primary hover:text-e1-text transition-colors"
            onClick={() => navigate(primaryCtaHref)}
            aria-label={primaryCtaLabel}
          >
            {primaryCtaLabel}
          </MagneticButton>
          <MagneticButton
            className="font-sans uppercase text-sm tracking-wider px-8 py-4 border border-e1-text-muted text-e1-text-muted hover:bg-e1-text-muted hover:text-e1-bg transition-colors"
            onClick={() => navigate(secondaryCtaHref)}
            aria-label={secondaryCtaLabel}
          >
            {secondaryCtaLabel}
          </MagneticButton>
        </div>
        {showCrisisButton && (
          <div className="mt-8">
            <MagneticButton
              className="font-sans text-sm tracking-wider px-6 py-3 border border-e1-text-muted/40 text-e1-text-muted hover:border-e1-primary hover:text-e1-primary transition-colors rounded"
              onClick={() => navigate('/safety')}
              aria-label="Our Standards"
            >
              Our Standards
            </MagneticButton>
          </div>
        )}
      </div>
    </NotchedSection>
    </div>
  );
};

export default HeroSection;
