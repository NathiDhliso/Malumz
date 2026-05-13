// GSAP runtime singleton: register plugins and ScrollTrigger defaults
// exactly once before any React rendering occurs. ES module imports are
// hoisted, but placing this first in source order also documents the
// contract that the runtime side effects run before React root rendering.
// Feature: e1-editorial-ui-overhaul
// Requirement: 3.6
import "@/lib/gsap";

import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
