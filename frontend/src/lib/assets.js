// src/lib/assets.js — Assets Module
//
// Single source of truth for every file under `frontend/public/Assets/`.
// Components MUST import by semantic name from this module; raw `/Assets/...`
// URLs in component code are forbidden (enforced by an ESLint
// `no-restricted-syntax` rule — see task 1.12).
//
// Paths reference request-time URLs served by Create React App out of
// `public/`, so they resolve relative to the site root at runtime.
//
// The `width` and `height` values below are intrinsic pixel dimensions
// captured from the twelve physical files at intake time:
//   - Images: parsed directly from each JPEG's SOF marker.
//   - Videos: probed via `ffprobe -select_streams v:0 -show_entries
//     stream=width,height`.
// The property test in task 1.14 re-probes the physical files and asserts
// the numbers below still match, so this metadata stays honest.

// ---------------------------------------------------------------------------
// Named constants (Requirements 5.1–5.7)
// ---------------------------------------------------------------------------

export const HERO_CARD_IMAGE =
  "/Assets/WhatsApp Image 2026-05-12 at 17.07.49.jpeg";
export const HERO_POSTER_IMAGE =
  "/Assets/WhatsApp Image 2026-05-12 at 17.07.49 (1).jpeg";
export const HERO_AMBIENT_VIDEO =
  "/Assets/WhatsApp Video 2026-05-12 at 17.06.20.mp4";

export const ABOUT_COLLAGE_A =
  "/Assets/WhatsApp Image 2026-05-12 at 16.54.55.jpeg";
export const ABOUT_COLLAGE_B =
  "/Assets/WhatsApp Image 2026-05-12 at 16.54.55 (1).jpeg";
export const ABOUT_COLLAGE_C =
  "/Assets/WhatsApp Image 2026-05-12 at 16.54.56.jpeg";

export const VISION_NODE_1 =
  "/Assets/WhatsApp Image 2026-05-12 at 16.54.56 (1).jpeg";
export const VISION_NODE_2 =
  "/Assets/WhatsApp Image 2026-05-12 at 16.54.56 (2).jpeg";
export const VISION_NODE_3 =
  "/Assets/WhatsApp Image 2026-05-12 at 17.07.49 (2).jpeg";

export const BOOK_ACCENT_VIDEO =
  "/Assets/WhatsApp Video 2026-05-12 at 17.07.50.mp4";
export const RESULTS_TESTIMONIAL_VIDEO =
  "/Assets/WhatsApp Video 2026-05-12 at 17.07.52.mp4";

// ---------------------------------------------------------------------------
// Metadata default export (Requirement 5.8)
// ---------------------------------------------------------------------------

const assets = {
  HERO_CARD_IMAGE: {
    src: HERO_CARD_IMAGE,
    width: 720,
    height: 1280,
    type: "image/jpeg",
    altPlaceholder:
      "Portrait of a student seated against a terracotta wall",
  },
  HERO_POSTER_IMAGE: {
    src: HERO_POSTER_IMAGE,
    width: 720,
    height: 1280,
    type: "image/jpeg",
    altPlaceholder: "Ambient poster frame of the E1 hero atmosphere",
  },
  HERO_AMBIENT_VIDEO: {
    src: HERO_AMBIENT_VIDEO,
    width: 464,
    height: 832,
    type: "video/mp4",
    altPlaceholder: "Ambient background video loop for the E1 hero",
  },

  ABOUT_COLLAGE_A: {
    src: ABOUT_COLLAGE_A,
    width: 960,
    height: 1280,
    type: "image/jpeg",
    altPlaceholder: "Editorial collage frame A",
  },
  ABOUT_COLLAGE_B: {
    src: ABOUT_COLLAGE_B,
    width: 720,
    height: 1280,
    type: "image/jpeg",
    altPlaceholder: "Editorial collage frame B",
  },
  ABOUT_COLLAGE_C: {
    src: ABOUT_COLLAGE_C,
    width: 720,
    height: 1280,
    type: "image/jpeg",
    altPlaceholder: "Editorial collage frame C",
  },

  VISION_NODE_1: {
    src: VISION_NODE_1,
    width: 720,
    height: 1280,
    type: "image/jpeg",
    altPlaceholder: "Vision timeline node portrait 1",
  },
  VISION_NODE_2: {
    src: VISION_NODE_2,
    width: 720,
    height: 1280,
    type: "image/jpeg",
    altPlaceholder: "Vision timeline node portrait 2",
  },
  VISION_NODE_3: {
    src: VISION_NODE_3,
    width: 720,
    height: 1280,
    type: "image/jpeg",
    altPlaceholder: "Vision timeline node portrait 3",
  },

  BOOK_ACCENT_VIDEO: {
    src: BOOK_ACCENT_VIDEO,
    width: 1024,
    height: 576,
    type: "video/mp4",
    altPlaceholder: "Silent accent video above the Book form",
  },
  RESULTS_TESTIMONIAL_VIDEO: {
    src: RESULTS_TESTIMONIAL_VIDEO,
    width: 1024,
    height: 576,
    type: "video/mp4",
    altPlaceholder: "Student testimonial reel",
  },
};

export default assets;
