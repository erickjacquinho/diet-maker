---
name: anti-ai-slop-design
description: Bespoke UI design system, anti-slop visual tropes rejection, typography pairing, mineral dark palettes, and asymmetric layouts.
license: MIT
---

# Anti AI Slop Design Framework

Strict visual and UX rules to prevent bland, predictable, and generic "AI-generated" interface slop.

## The Anti-Slop Audit Checklist

Before delivering any user interface design, audit against the **Top 6 AI Design Tropes**:

| AI Slop Trope (REJECT) | Bespoke Solution (REQUIRE) |
|---|---|
| ❌ **Generic Hero**: Dark gray background with glowing purple/neon-blue radial gradient mesh and centered white text. | ✅ **Subject-Grounded Hero**: Unique layout matched strictly to brand context—asymmetric split, live interactive demo, or bold graphic focal point. |
| ❌ **Nested Card Inception**: Cards inside cards inside rounded container boxes (`rounded-2xl` inside `rounded-xl`). | ✅ **Flat / Borderless Rhythm**: Use generous whitespace, hairline dividers, or subtle surface contrast instead of infinite nested cards. |
| ❌ **Default Font Stack**: Inter or System UI font used for both headings and body text without character. | ✅ **Distinctive Pairing**: Pair an expressive display typeface (Geist, Space Grotesk, Playfair, Cabinet Grotesk, Instrument Serif) with a highly readable body font. |
| ❌ **Arbitrary Pill Badges**: Floating rounded pill badges with glitter icons (`✨ Magic AI Powered ✨`). | ✅ **Meaningful Indicators**: Use indicators only for real system status (e.g., `● Live`, `Active`, `v2.4`). |
| ❌ **Generic Floating Action Cards**: 3 generic pricing cards with "Popular" highlighted in electric blue gradient. | ✅ **High-Information Comparison**: Tables or asymmetrical feature lists with clear value hierarchy. |
| ❌ **Over-Decorated Buttons**: Heavy drop shadows + glow effects + gradient borders on every primary CTA. | ✅ **Disciplined CTA**: Clean solid primary button with crisp typography and subtle spring press feedback. |

---

## Palettes & Color Rules

- 🚫 **Forbidden Default Combo**: Deep Slate `#0f172a` + Neon Purple `#a855f7` + Cyan `#06b6d4`.
- ✅ **Bespoke Palette Strategy**: Limit core interface to 1 solid background, 1 high-contrast text color, 1 subtle border tint, and **1 single intentional accent color** derived from domain subject matter (e.g., Warm Ochre, Rich Forest Green, Deep Cobalt, Burnt Terracotta).

```css
/* Example: Bespoke Mineral Dark Palette */
:root {
  --bg-surface: #121417;
  --bg-subtle: #1a1d23;
  --border-hairline: rgba(255, 255, 255, 0.08);
  --text-primary: #f0f2f5;
  --text-secondary: #8c95a3;
  --accent-brand: #e06c3a; /* Burnt Amber Accent */
}
```

---

## Typography Hierarchy Rules

1. **Size Contrast**: Ensure a dramatic contrast ratio between H1 and Body (e.g., Display H1 at `3.5rem`, Body at `1rem`). Small font size differences feel timid and templated.
2. **Letter Spacing**: Tighten tracking on display headings (`tracking-tight` / `-0.02em`) and loosen tracking on small uppercase labels (`tracking-wider` / `0.05em`).

---

## Spatial & Layout Discipline

1. **Grid Asymmetry**: Avoid 3 perfectly identical column cards in every section. Vary column widths (e.g., 60% feature highlight + 40% side panel).
2. **Generous Breathing Room**: Increase vertical padding between major sections to `py-24` or `py-32` on desktop. Dense, squeezed layouts are a hallmark of template slop.
