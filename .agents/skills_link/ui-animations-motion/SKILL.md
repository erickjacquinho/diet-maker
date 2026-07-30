---
name: ui-animations-motion
description: Smooth UI animations, spring physics presets, Framer Motion layoutId, GPU acceleration, and CSS view transitions.
license: MIT
---

# UI Animations & Motion Engineering

High-performance, purposeful motion design for modern web applications. Motion must feel physical, responsive, and natural—never arbitrary, sluggish, or distracting.

## Core Motion Principles

1. **Intention Over Decoration**: Every animation must communicate state change, spatial continuity, or focus guidance. If removing the animation makes the app faster to use without reducing clarity, omit it.
2. **Spring Physics Default**: Prefer spring physics (`stiffness`, `damping`, `mass`) over linear or easing durational curves (`ease-in-out`). Physical springs adapt gracefully to dynamic interruption.
3. **GPU-Accelerated Properties**: Only animate composite-only properties: `transform` (`translate3d`, `scale`, `rotate`) and `opacity`. Never animate `width`, `height`, `margin`, `padding`, or `top`/`left` directly unless using Framer Motion layout projection (`layout` / `layoutId`).
4. **Respect Reduced Motion**: Always respect user accessibility preferences via `prefers-reduced-motion`.

---

## Technical Stack & Patterns

### 1. Framer Motion / Motion (React)

#### Spring Configuration Standards
- **Snappy UI (Buttons, Toggles, Cards)**: `stiffness: 400`, `damping: 30`, `mass: 0.8`
- **Gentle Overlays (Modals, Slide-overs)**: `stiffness: 250`, `damping: 25`, `mass: 1`
- **Playful / Bouncy (Badges, Notifications)**: `stiffness: 500`, `damping: 15`

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Presets
export const SNAP_SPRING = { type: 'spring', stiffness: 400, damping: 30 };
export const GENTLE_SPRING = { type: 'spring', stiffness: 250, damping: 25 };

// Modal / Dialog Enter & Exit
export function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={GENTLE_SPRING}
          className="modal-container"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

#### Shared Layout Transitions (`layoutId`)
Use `layoutId` for smooth morphing between items (e.g., active navigation tabs, expanded card views).

```tsx
export function ActiveTabIndicator({ activeId, tabs }) {
  return (
    <nav className="relative flex gap-2">
      {tabs.map((tab) => (
        <button key={tab.id} className="relative px-4 py-2 text-sm font-medium">
          {tab.label}
          {activeId === tab.id && (
            <motion.div
              layoutId="active-tab-pill"
              className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      ))}
    </nav>
  );
}
```

---

### 2. Micro-Interactions & Hover Physics

```tsx
// Micro Button Press Feedback
export function InteractiveButton({ children, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      onClick={onClick}
      className="px-4 py-2 bg-primary text-white rounded-md shadow-sm"
    >
      {children}
    </motion.button>
  );
}
```

---

### 3. CSS View Transitions API (Page/Route Transitions)

For native browser morphing between page states:

```css
/* Next.js or SPA View Transition CSS */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 220ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
```

```typescript
// Helper to wrap state updates in view transitions
export function navigateWithTransition(updateFn: () => void) {
  if (!document.startViewTransition) {
    updateFn();
    return;
  }
  document.startViewTransition(() => {
    updateFn();
  });
}
```

---

## Performance & Optimization Rules

1. **`will-change` Usage**: Use `will-change: transform, opacity` sparingly and remove when idle. Framer Motion handles GPU layering automatically.
2. **Layout Projection**: Avoid layout shifts in long lists. Wrap list items in `AnimatePresence` with `mode="popLayout"` to prevent height collapse during item removal.
3. **Stagger Sequences**: Keep stagger delays under `0.04s` per element to prevent slow, draggy animations.
