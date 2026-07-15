# UI Design System (UI_DESIGN_SYSTEM.md)

## Overview
- **Core Aesthetic**: Terminal Noir & Developer Glassmorphism
- **Theme**: Monochromatic Dark Theme (`Dark theme only`)
- **Visual Grid**: High Information Density, Grid-Mesh Alignment, 1px Border Accents
- **Author**: Lakshay Soni (Lead Architect & Founder)
- **Last Updated**: July 2026
- **Status**: Visual Identity Specification (v0.9)

---

## 1. Brand Identity & Color Palette

The interface is built strictly on deep, eye-safe slate backgrounds, high-contrast text, and vibrant, focused terminal indicators. No unsolicited or flashing gradients.

```
[Background - Dark Canvas]   #0B0F19 (90% Weight)  - Solid, clean slate
[Backdrop Secondary]          #111827 (10% Weight)  - Deep card background
[Borders & Guidelines]        rgba(255,255,255,0.1) - Subdued dividing borders
[Primary Display Text]        #FFFFFF (100% Contrast) - Titles and highlights
[Secondary Metadata Text]     #9CA3AF (75% Contrast) - Biographies and helper copy
[Accent Cyan (Neon Blue)]     #1E90FF / #38BDF8     - Primary action indicators
[Accent Emerald (Validation)] #10B981               - System active/attended indicators
[Accent Red (Alert/Terminal)] #EF4444               - Administration / Warnings
```

---

## 2. Typography Hierarchy

We use a paired display-monospace layout optimized for technical readers.

1. **Display Typography (Headers / Large Banner Elements)**:
   - **Font-Family**: `Inter` (Sans-serif display variants)
   - **Characteristics**: Large tracking (`tracking-wide` / `tracking-widest`), font-weight 700-900, uppercase formatting.
2. **Body & Content Text**:
   - **Font-Family**: System Sans-Serif (`Inter`, `system-ui`)
   - **Characteristics**: Smooth leading (`leading-relaxed`), text size `12px` to `14px` for optimal reading flow.
3. **Intelligence Panels / Terminal Systems**:
   - **Font-Family**: `JetBrains Mono` or `SFMono-Regular`
   - **Characteristics**: Crisp layout rendering, monospace metrics, text size `11px` for terminal inputs, analytics grids, and verification hashes.

---

## 3. Layout, Spacing, and Grid Mesh

We bypass soft, bubbly layout elements in favor of sharp, technical boxes.
- **Root Grid Mesh**: An absolute full-screen pattern styled with background mesh gridlines simulating a virtual drafting board:
  - Configured via Tailwind custom backdrops inside `src/index.css`.
- **Card Radius**: Fixed to a sharp `rounded-sm` (4px) or subtle `rounded-xl` (12px) for interactive panels. No fully circular UI buttons.
- **Glassmorphism Spec**:
  - Backdrop filter: `blur(12px)`.
  - Border thickness: `1px`.
  - Border color: `rgba(255, 255, 255, 0.05)` or `rgba(255, 255, 255, 0.1)`.
  - Background fill: `rgba(17, 24, 39, 0.7)`.

---

## 4. Interaction, Micro-Animations, and Transitions

### Purposeful Motion
We avoid dizzying parallax scrolls. Motion is used exclusively to:
1. **Guide User Attention**: Staggered terminal line compilation.
2. **Confirm User Actions**: Instant soft-fade transition upon registration success.
3. **Context Entry**: Slide-in transitions (`Y-axis translation`) for overlay modals.

### Motion Configs
- **Menu/Card entry**:
  - `initial={{ opacity: 0, y: 15 }}`
  - `animate={{ opacity: 1, y: 0 }}`
  - `transition={{ duration: 0.3, ease: "easeOut" }}`
- **Hover States**:
  - Buttons: Smooth scale translation and background overlay shifts:
    `transition-all duration-200 hover:scale-[1.01] hover:bg-opacity-95`
  - Cards: Border glow amplification using drop-shadow overlays:
    `hover:border-neon-blue/30 hover:shadow-[0_0_20px_rgba(30,144,255,0.15)]`

---

## 5. Accessibility & Responsive Design Guidelines

### Touch & Contrast Rules
- **Contrast Ratios**: All text matches or exceeds WCAG AA contrast ratios (4.5:1). Monospace indicators are offset against pure black buffers for legibility.
- **Touch Target Density**: Target buttons (especially in member and event register panels) maintain a minimum density of `44px` height and padding, expanding to full-width configurations on mobile screen viewports.

### Responsive Breakpoints Grid

| Breakpoint | Layout Style | Content Adaptation |
|---|---|---|
| **Mobile (`<640px`)** | Single column grid stack | Sidebar collapsed to footer drawer; text sizes reduced by 15%; card padding optimized to `p-4`. |
| **Tablet (`768px - 1024px`)** | Dual column configuration | Split sidebar / Main display; card rows flow to grid grids of two columns. |
| **Desktop (`>1280px`)** | Expanded 12-column grid | Sidebar pinned layout; full widescreen margins; complete high-density dashboard panels rendered. |
