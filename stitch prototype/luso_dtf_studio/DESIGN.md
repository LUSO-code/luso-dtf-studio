---
name: Luminous Industrial
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394e'
  surface-container-lowest: '#060d20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3e'
  surface-container-highest: '#2d3449'
  on-surface: '#dbe2fd'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#dbe2fd'
  inverse-on-surface: '#283044'
  outline: '#948f9a'
  outline-variant: '#49454f'
  surface-tint: '#d0bcff'
  primary: '#e9ddff'
  on-primary: '#37265e'
  primary-container: '#d0bcff'
  on-primary-container: '#594983'
  inverse-primary: '#665590'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d4'
  on-secondary-container: '#00424e'
  tertiary: '#ffd9db'
  on-tertiary: '#522126'
  tertiary-container: '#ffb2b7'
  on-tertiary-container: '#7b4147'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#210f48'
  on-primary-fixed-variant: '#4d3d76'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#370c12'
  on-tertiary-fixed-variant: '#6d363b'
  background: '#0b1326'
  on-background: '#dbe2fd'
  surface-variant: '#2d3449'
  surface-glass: rgba(11, 19, 38, 0.6)
  outline-glow: rgba(255, 255, 255, 0.2)
  accent-cyan: '#00e5ff'
  deep-violet: '#1e0b4a'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  panel-padding: 1.5rem
  container-margin: 2rem
  element-gap: 1rem
  topbar-height: 72px
  sidebar-width: 280px
  gutter: 1.5rem
---

## Brand & Style

The brand identity is a fusion of high-precision industrial utility and futuristic digital aesthetics. It targets professional production environments, evoking a sense of "Luz Líquida" (Liquid Light) through the use of vibrant, high-fidelity colors against a deep, technical backdrop.

The design style is **Hybrid Neumorphic Glassmorphism**. It combines the soft, extruded tactile surfaces of Neumorphism (for interactive elements and inputs) with the semi-transparent, frosted-glass layers of Glassmorphism (for structural panels and containers). This creates a interface that feels both physically rooted and digitally ethereal. The presence of animated background shaders provides constant, subtle motion, suggesting a dynamic, always-active production state.

## Colors

The palette is anchored in a "Deep Space" neutral base, using varying shades of midnight navy and slate to create structural depth. 

- **Primary (Electric Violet):** Used for brand identity, active navigation states, and primary calls to action.
- **Secondary (Cyber Cyan):** Used for status indicators, supplemental actions, and technical highlights.
- **Tertiary (Rose Quartz):** Reserved for alerts, urgent notifications, or distinct categorization.

The interaction model utilizes "Glow-States." Interactive elements don't just change color; they emit a soft ambient glow (drop shadows with high spread and low opacity) in their respective primary or secondary hues. Glass surfaces use a 25px backdrop blur with a white-tinted top-and-left border to simulate physical thickness.

## Typography

The system uses a dual-font approach. **Plus Jakarta Sans** is the display face, providing a friendly yet geometric character for headlines and hero text. It should always be used with tighter tracking and heavier weights to maintain its "tech" presence.

**Inter** serves as the workhorse for all functional data, body copy, and UI labels. It ensures maximum legibility in data-heavy screens. For labels, use uppercase with generous letter spacing (0.05em) to differentiate metadata from interactive text.

## Layout & Spacing

The layout follows a **Hybrid Floating Panel** model. Instead of standard edge-to-edge containers, the UI consists of "islands" of content floating over a dynamic background.

- **Sidebar:** Fixed width of 280px, floating with a 1rem margin from the viewport edges.
- **Topbar:** Floating horizontally between the sidebar and the right edge, maintaining consistent vertical alignment with the sidebar top.
- **Main Canvas:** A centered fluid area with a max-width of 1280px (7xl), using a responsive grid (1 col mobile, 2 col tablet, 3-4 col desktop).
- **Margins:** Large 2rem outer margins create breathing room around the primary interface "islands," reinforcing the floating glass aesthetic.

## Elevation & Depth

Elevation is defined by two distinct physics models:

1.  **Neumorphic (Interactive):** Small components like buttons, icon backgrounds, and inputs use a dual-shadow technique. `neu-raised` uses a light highlight (white/3%) on the top-left and a deep shadow (black/60%) on the bottom-right. `neu-pressed` inverts these for a "pushed-in" effect.
2.  **Glassmorphic (Structural):** Large panels (Sidebar, Topbar, Cards) use `backdrop-blur-[25px]` and a 1px top/left "specular highlight" border. These surfaces should appear to float significantly higher than the background, utilizing a large, soft `0_20px_40px_rgba(0,0,0,0.3)` shadow to create separation.

Hierarchy is further established through **Ambient Glows**. High-priority cards (like active production jobs) feature a blurred background blob of the primary or secondary color behind the panel to draw the eye.

## Shapes

The shape language is rounded and modern, avoiding sharp industrial corners in favor of a "software-first" feel. 

- **Primary Containers:** 1.5rem (xl) for main panels and large cards.
- **Interactive Elements:** 0.75rem (lg) for buttons, inputs, and list items.
- **Avatars/Special Actions:** Full circle (full) for user profiles or floating action triggers.

All borders on glass elements should be restricted to the top and left sides to simulate a light source coming from the upper-left, reinforcing the 3D tactile theme.

## Components

### Buttons
- **Primary:** Neumorphic raised base with a slight primary color tint. On hover, the ambient glow intensifies.
- **Glass Action:** Transparent base with a secondary color border and backdrop blur. Used for "Open" or "View All" actions within cards.

### Input Fields
- Always use the `neu-pressed` style to indicate a "well" that can be filled. 
- The cursor (caret) should use the secondary color (#4cd7f6) to stand out against the dark base.

### Cards (Glass Bento)
- Structural containers for data. They must include the `backdrop-blur` and the top-left highlight border. 
- Content within cards is organized using "Chips" (rounded-full) for metadata like dimensions or unit counts.

### Navigation Links
- Inactive: Dimmed text (`on-surface-variant`) with no shadow.
- Active: Primary color text, a soft `primary/40` outer glow, and a `neu-pressed` background simulation.

### Status Indicators
- Small circular pips using secondary (cyan) for active or tertiary (rose) for urgent/warning, always accompanied by a glow matching the color.