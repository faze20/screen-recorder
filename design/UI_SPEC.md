# UI Specification

Based on `stitch_editor_light_minimal`

## 1. Colors

**Primary**
- Primary Green: `#13ec80` (Brand color, accents, active states)
- Primary/20: `rgba(19, 236, 128, 0.2)` (Subtle backgrounds)

**Backgrounds**
- Background Light: `#f6f8f7` (App background)
- Background Dark: `#102219` (Dark mode background)
- Surface Light: `#ffffff` (Cards, panels, headers)
- Surface Dark: `#1a3326` (Panels in dark mode)
- Surface Darker: `#0c1a13` (Canvas background)

**Text**
- Text Primary (Light Mode): `#11221a`
- Text Primary (Dark Mode): `#ffffff`
- Text Secondary: Gray-500 / Gray-400
- Text Muted: Gray-400

**Borders**
- Border Light: Gray-200
- Border Dark: `#234836`

**Timeline / Editor Specific**
- Track Background: `#234836` (with 30% opacity)
- Track Waveform: `#2a5544`

## 2. Typography

**Font Family**
- `Spline Sans` (Google Fonts)
- Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

**Sizes**
- H1 (Header Title): `text-sm font-bold` (Compact UI)
- Section Headers: `text-base font-bold`
- Body: `text-sm`
- Labels: `text-[10px] uppercase font-bold tracking-wider`
- Monospace (Timecodes, Values): `font-mono`

## 3. Spacing & Radius

**Border Radius**
- Default: `1rem` (Rounded-xl equivalent in Tailwind, but defined as 1rem in spec)
- Large: `2rem`
- Extra Large: `3rem`
- Full: `9999px` (Buttons, Pills)

**Spacing Scale**
- Compact layout.
- Padding standard: `p-4`, `p-5`, `p-6`
- Gaps: `gap-2`, `gap-3`, `gap-4`

## 4. Components

### Buttons
- **Primary Action (Export)**:
  - Bg: `#13ec80`
  - Text: `#11221a`
  - Radius: Full
  - Font: Bold, text-sm
  - Shadow: `shadow-[0_0_15px_rgba(19,236,128,0.3)]`
  - Hover: Shadow increase

- **Secondary Action (Save, Undo)**:
  - Bg: Gray-100 / `#1c3a2f` (Dark)
  - Text: Gray-900 / White
  - Radius: Full
  - Hover: Gray-200 / `#2a5544`

- **Icon Buttons**:
  - Circular, size-8 or size-9
  - Minimal styling

### Inputs
- **Text/Number Inputs**:
  - Bg: Gray-50 / `#0c1a13`
  - Border: Gray-200 / `#234836`
  - Radius: Rounded (0.25rem - 0.5rem)
  - Focus: Ring Primary

- **Sliders (Range)**:
  - Track: Gray-200 / `#234836`
  - Thumb: Primary Color (Accent)

### Cards / Panels
- Bg: White / `#152b21`
- Border: 1px solid Gray-200 / `#234836`

### Timeline
- **Tracks**: Rounded-lg containers
- **Playhead**: Primary color line with diamond handle top
- **Ruler**: Monospace, text-xs, Gray-400

### Icons
- Material Symbols Outlined (Google Fonts)

## 5. Layout Structure
- **Header**: Top bar, fixed height.
- **Main**: Flex container.
  - **Left/Center**: Canvas + Timeline (Vertical split).
  - **Right**: Inspector Sidebar (Fixed width, e.g., 320px / 20rem).
