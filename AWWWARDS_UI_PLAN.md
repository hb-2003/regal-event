# Regal Events — Awwwards UI/UX Upgrade Plan

This document outlines the phased development plan to elevate the Regal Events Next.js 16 website to an Awwwards-winning "Site of the Day" standard. It focuses on immersive interactions, high-performance WebGL, and flawless animations.

## Phase 1: The Foundation & "Feel"
*The goal of this phase is to make the website feel physically different from a standard web page by implementing smooth scrolling, bespoke cursors, and cinematic loading.*

### 1.1 Smooth Scrolling (Lenis)
- **Uninstall:** Remove `locomotive-scroll` (legacy, hijacks scroll).
- **Install:** `@studio-freight/lenis` (or the newer `lenis` package).
- **Implementation:** Create a `SmoothScroll` provider component that wraps the `app/layout.tsx`. Integrate it with GSAP `ScrollTrigger` via `gsap.ticker` so scroll animations are perfectly synced with the smooth scroll frame rate.

### 1.2 Activate the "Agency Layer"
- **Cursor & Grain:** The CSS for the custom cursor and film grain already exists in `globals.css`, and a `CursorFollower.tsx` component is built.
- **Action:** Mount `CursorFollower` and a new `GrainOverlay` component globally inside `app/layout.tsx`.
- **Refinement:** Ensure the custom cursor reacts to hover states (e.g., expanding when hovering over links, buttons, and gallery images).

### 1.3 Cinematic Preloader
- **Concept:** A luxury loading screen that masks Next.js hydration.
- **Design:** A dark teal background with a gold `0%` to `100%` counter, followed by the Regal Events logo drawing itself via SVG path animation.
- **Implementation:** A global Client Component that blocks the initial render, animates out using GSAP (`yPercent: -100`), and triggers the homepage Hero animations *only* after the preloader finishes.

---

## Phase 2: Micro-Interactions & Typography
*The goal of this phase is to ensure every user input (mouse move, scroll) yields a satisfying, high-quality visual response.*

### 2.1 Split Text Reveal Animations
- **Current State:** Text currently fades up as blocks.
- **Upgrade:** Use `SplitType` (a free alternative to GSAP SplitText) to break headings into individual characters or words.
- **Implementation:** Create a `<TextReveal>` wrapper component. On scroll intersection, stagger the reveal of each character from the bottom up with a slight rotation (`y: 100%, rotate: 5deg`), giving a cinematic, editorial feel.

### 2.2 Magnetic Buttons
- **Concept:** Call-to-action buttons (like "Begin Your Journey") that physically pull toward the user's cursor when hovered.
- **Implementation:** Create a `<Magnetic>` wrapper component using GSAP `quickTo` for high-performance X/Y translation based on mouse proximity.

### 2.3 Image Parallax & Hover Distortions
- **Gallery Upgrade:** Instead of standard CSS scale on hover, use GSAP to create a slight parallax effect *within* the image container as the user scrolls.
- **Implementation:** Add `data-speed` attributes to gallery images to move them slightly faster or slower than the page scroll.

---

## Phase 3: Advanced WebGL & 3D (The "Awwwards" Factor)
*The goal of this phase is to replace basic particle effects with custom GLSL shaders and immersive 3D, which is practically a requirement for high Awwwards scores.*

### 3.1 React Three Fiber Migration
- **Current State:** Raw Three.js `WebGLRenderer` in a `useEffect`.
- **Upgrade:** Migrate to `@react-three/fiber` and `@react-three/drei` for declarative, React-friendly 3D rendering. This improves performance, lifecycle management, and code cleanliness.

### 3.2 Custom GLSL Shaders
- **Hero Section:** Replace the static background mosaic with an interactive WebGL fluid or ripple shader. When the user moves their mouse over the hero section, the background images warp and distort smoothly.
- **Implementation:** Write custom Vertex and Fragment shaders. Use `@react-three/drei`'s `shaderMaterial` to pass mouse coordinates and time uniforms to the GPU.

### 3.3 3D Assets (Optional but recommended)
- Introduce a rotating, glass-refractive 3D object (e.g., a diamond or elegant abstract shape) in the background of the hero or CTA sections, rendering with physical lighting.

---

## Phase 4: Seamless Navigation & Polish
*The goal of this phase is to eliminate jarring page loads, creating a Single Page Application (SPA) feel within the Next.js App Router.*

### 4.1 Page Transitions
- **Concept:** When a user clicks a link (e.g., from Home to Gallery), the page doesn't instantly snap. Instead, a transition layer hides the old page, the route changes in the background, and the layer reveals the new page.
- **Implementation:** Use `framer-motion`'s `AnimatePresence` combined with Next.js `template.tsx` files. Create a "curtain wipe" or "diagonal sweep" effect that fires on every route change.

### 4.2 Performance & Accessibility
- **Awwwards Tip:** Awwwards judges heavily penalize sites that are slow or inaccessible.
- **Action:** Ensure all WebGL contexts pause when not in the viewport.
- **Action:** Add `aria-labels` to all custom cursors, ensure the smooth scrolling can be disabled for users with `prefers-reduced-motion`, and maintain high Lighthouse contrast scores.

---

## Technical Stack Additions Required
To execute this plan, the following npm packages will need to be added:
```bash
npm install lenis split-type framer-motion @react-three/fiber @react-three/drei
```
