---
name: Clinical Wellness Editorial
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#3f4949'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#6f7979'
  outline-variant: '#bec8c8'
  surface-tint: '#1a686b'
  primary: '#00494b'
  on-primary: '#ffffff'
  primary-container: '#0f6265'
  on-primary-container: '#95dbde'
  inverse-primary: '#8cd2d5'
  secondary: '#b90538'
  on-secondary: '#ffffff'
  secondary-container: '#dc2c4f'
  on-secondary-container: '#fffbff'
  tertiary: '#5d3900'
  on-tertiary: '#ffffff'
  tertiary-container: '#7d4e00'
  on-tertiary-container: '#ffc47d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a8eff2'
  primary-fixed-dim: '#8cd2d5'
  on-primary-fixed: '#002021'
  on-primary-fixed-variant: '#004f52'
  secondary-fixed: '#ffdadb'
  secondary-fixed-dim: '#ffb2b7'
  on-secondary-fixed: '#40000d'
  on-secondary-fixed-variant: '#92002a'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 52px
    fontWeight: '800'
    lineHeight: 60px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-eyebrow:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  container-max-width: 1240px
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
---

## Brand & Style

This design system establishes a high-trust, editorial healthcare and wellness experience. Designed for evidence-first wellness consumers, researchers, and proactive health shoppers, the visual atmosphere balances medical credibility with an uplifting, approachable lifestyle sensibility.

The aesthetic fuses **Corporate/Modern clarity** with **tactile editorial warmth**. It moves away from cold, sterile clinical interfaces by pairing deep authoritative teals with energizing coral and blush accents. Clean typography, generous white space, soft surface layers, and structured clinical trust markers make dense nutritional and pharmacological data feel readable, transparent, and actionable.

## Colors

The palette balances authoritative deep teal with vibrant coral-pink accents and warm, tinted neutrals:

- **Primary (`#0F6265` / `#115E59`)**: Anchors scientific authority, brand navigation, core call-to-action blocks, and clinical table headers.
- **Secondary (`#F43F5E` / `#FF5E6C`)**: Drives high-conversion conversion points, emphasis typography, alert badges, and primary interactive buttons.
- **Tertiary (`#F59E0B`)**: Reserved for consumer ratings, star reviews, and key editorial highlights.
- **Neutral Palette**: Base text sits on deep slate (`#1E293B`), supported by subdued secondary text (`#64748B`) and hairline border tones (`#E2E8F0`).
- **Tinted Tonal Surfaces**: Page hero backdrops and card wrappers feature delicate blush (`#FFF1F2`), soft petal rose (`#FFE4E6`), and fresh mint tints (`#F0FDFA`) to prevent clinical fatigue.

## Typography

The type hierarchy relies on **Plus Jakarta Sans** throughout all interfaces. Its open counters, crisp geometric anatomy, and humanist curves deliver effortless readability across lengthy medical reviews, technical ingredient labels, and compact comparison matrices.

- **Hero & Display Headers**: Employs bold letter weights (`700` and `800`) with tight letter spacing for impactful editorial statements. Dual-color headlines (deep teal flowing into coral) are standard for primary landing and hero sections.
- **Micro-labels & Eyebrows**: Formatted in uppercase with `0.08em` tracking and `700` weight, used over section titles and product pill badges.
- **Body & Editorial Content**: Set with relaxed line heights (`1.6` to `1.65`) on dark slate (`#1E293B`) to maximize legibility and minimize cognitive strain during prolonged reading.

## Layout & Spacing

The system uses a flexible 12-column grid bound to a maximum width of `1240px`, supported by a clean 4px / 8px spacing rhythm:

- **Desktop (1024px+)**: 12 columns with `24px` gutters and dynamic auto margins. Two-column editorial layouts prioritize a 7:5 or 8:4 split between clinical content and sticky conversion modules.
- **Tablet (768px - 1023px)**: 8 columns with `20px` gutters; sidebar conversion tools collapse below the primary hero summary.
- **Mobile (<768px)**: 4 columns with `16px` margins and full-width card reflows. Sticky buy/discount cards dock to the bottom screen edge with safe-area padding.
- **Vertical Rhythm**: Content blocks utilize standard spacing tokens (`space-xl` for intra-component gaps; `space-2xl` to `space-3xl` for sectional transitions) to maintain an uncrowded, breathable reading experience.

## Elevation & Depth

Depth is established primarily through **ambient tinted shadows** and **crisp surface layering**:

- **Canvas & Section Ground**: Base pages utilize ultra-soft radial gradients transitioning from off-white (`#FCFDFD`) into muted blush (`#FFF1F2`) or tinted seafoam (`#F0FDFA`).
- **Cards & Clinical Containers**: Pure white (`#FFFFFF`) surfaces layered above tinted backgrounds, bound by subtle low-contrast boundaries (`1px solid #E2E8F0` or `#F1F5F9`).
- **Ambient Card Shadows**: Elevated cards use subtle, multi-stop drop shadows tinted with slate and primary teal: `0 4px 20px -2px rgba(15, 98, 101, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)`.
- **Conversion & Action Layer**: Interactive triggers and sticky discount cards utilize a focused lift on hover: `0 12px 28px -4px rgba(244, 63, 94, 0.22)`.

## Shapes

The interface features a **Rounded** shape philosophy (level 2) combined with specialized full-pill geometries:

- **Standard Cards & Containers**: Feature `1rem` (`rounded-lg`) to `1.5rem` (`rounded-xl`) corner radiuses, softening analytical data blocks and clinical guides.
- **Pill Badges & Filter Chips**: Full round `9999px` corner radius across all status markers, category tags, and primary CTAs.
- **Product Visual Mask**: Dedicated product focus circular frames or smooth arched shapes (`rounded-full` or large organic border-radius) wrapped with soft accent borders to frame supplement bottles cleanly.

## Components

### Buttons
- **Primary Conversion CTA**: Full pill shape (`rounded-full`), vibrant coral background (`#F43F5E`), white bold text, inner padding `14px 28px`. Elevated by a soft coral glow shadow; shifts slightly darker (`#E11D48`) on hover.
- **Clinical Action / Secondary CTA**: Deep teal background (`#0F6265`) or outline teal border with filled teal text. Used for analytical links, label guides, and primary purchase links.
- **Tertiary / Subtle**: White or pale background with slate text and light gray outline (`#E2E8F0`), rounding `rounded-lg` or pill.

### Badges & Category Chips
- **Eyebrow Pills**: Uppercase text (`label-eyebrow`), soft rose background (`#FFE4E6`), coral text (`#E11D48`), horizontal padding `12px`, vertical padding `4px`.
- **Category Filter Chips**: Pill-shaped with neutral border (`#E2E8F0`), background `#FFFFFF`, subtle text (`#475569`). Active state transitions to `#0F6265` with white typography.
- **Trust Badges**: "Best Seller" or "Evidence-First" floating pill badges placed directly over product imagery in deep teal (`#0F6265`) with crisp white lettering.

### Trust Markers & Bullet Highlights
- Bullet lists utilize custom round marker icons (`#F43F5E` filled circles) or clinical outline checks (`#0F6265` shield/check icons) paired with medium slate body copy for quick scanning.

### Structured Ingredient Comparison Tables
- **Header**: Deep teal (`#0F6265`) solid background, white all-caps bold typography (`11px`, `tracking: 0.05em`).
- **Rows**: Alternating white and clean off-white rows with thin horizontal dividers (`#E2E8F0`).
- **Cell Content**: Bold primary ingredient name in column 1, functional role in column 2, and actionable clinical label notes in column 3.
- **Wrapper**: Encapsulated in a `rounded-xl` card with hidden overflow to curve the header corners seamlessly.

### Sticky Product Discount Card
- Compact high-contrast module. Features circular or pill-framed product photography, bold headline, star rating block (`#F59E0B` stars with numeric review score), instant discount callout button (`GET YOUR 70% DISCOUNT`), and inline security trust markers (guarantee shield, fast dispatch, secure checkout).

### Input Fields & Search Bars
- Rounded pill search bars (`rounded-full`) with subtle borders (`#CBD5E1`), light background, inset clinical search icon, and focused ring highlight in primary teal (`rgba(15, 98, 101, 0.2)`).