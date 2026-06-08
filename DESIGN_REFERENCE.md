# AnySoul Design Reference

This document summarizes the design language, component patterns, and implementation guidance for future AI-assisted changes to this project.

## Product Feel

AnySoul combines a soft premium SaaS interface with playful fan/community and media-culture details. The base UI is calm, rounded, warm, and approachable. Feature areas can become more expressive through animated handwriting, image-heavy cards, cinematic posters, game dashboards, or the retro VHS player, but the foundation remains clean and tactile.

Use this mental model when extending the site:

- Marketing pages should feel emotional, polished, generous, and highly visual.
- Dashboard/workspace pages should feel compact, panelized, and data-dense.
- Media/gallery pages should feel collectible, discoverable, and card-driven.
- VHS/player interactions should remain intentionally retro and separate from the main SaaS language.

## Core Tokens

Primary tokens are defined in `src/index.css`.

### Colors

- Background: `#fbfaf8`, exposed as `bg-background`.
- Foreground: `#0a0a0a`, exposed as `text-foreground`.
- Card: `#ffffff`, exposed as `bg-card`.
- Primary olive green: `#869e71`, exposed as `bg-primary`, `text-primary`, `border-primary`.
- Dark-mode primary: `#abc378`.
- Muted surfaces: `#f4f4f5`, exposed as `bg-muted`.
- Muted text: `#71717a`, exposed as `text-muted-foreground`.
- Border: `#e4e4e7`, exposed as `border-border`.
- Dark background: `#09090b`.
- Dark muted/border: `#27272a`.

Frequently used direct accent colors:

- Bright brand lime: `#a4c639`.
- Soft lime CTA: `#abc378`.
- Chat bubble lime: `#cfdb7d`.
- Pink highlight: `#ea4c89`.
- Heart/accent pink: `#f9a8d4`.
- Online green: `#27c93f`.
- Warning/orange status: `#ffbd2e`, `#ff5f56`, `#f97316`.

Prefer semantic Tailwind tokens for normal UI. Use hard-coded accents only for brand moments, illustrations, media cards, or status details.

### Radius

The base radius is `1.5rem`. The interface relies heavily on large rounded forms:

- Small controls: `rounded-md`, `rounded-lg`.
- Standard cards/panels: `rounded-xl`, `rounded-2xl`.
- Hero and marketing cards: `rounded-3xl`, `rounded-[2rem]`, `rounded-[2.5rem]`.
- Navigation and CTA buttons: `rounded-full`.

Avoid sharp corners unless representing a screen, terminal, or intentionally mechanical retro object.

### Typography

The global font stack is system UI: Apple/SF, Segoe UI, Roboto, Helvetica Neue, sans-serif.

Use these patterns:

- Marketing H1: `text-5xl md:text-7xl font-bold tracking-tight leading-tight`.
- Section heading: `text-4xl md:text-5xl font-bold tracking-tight`.
- Section subtitle: `text-lg text-muted-foreground max-w-2xl mx-auto`.
- Card title: `text-lg font-semibold`.
- Body copy: `text-[15px] leading-relaxed text-muted-foreground`.
- Interface labels: `text-xs`, `text-[10px]`, `font-medium`, often with muted color.
- Workspace/data text: use `font-mono`, tabular counters, tiny chips, and dense spacing.

## Layout Principles

### Global Page Shell

Standard pages use:

- `min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 font-sans`.
- `overflow-x-hidden transition-colors duration-300`.
- Fixed header and top padding on main content, usually `pt-16` or `pt-24`.
- Content constrained with `max-w-7xl mx-auto px-4`.

The workspace route is special:

- It uses `h-screen`, `overflow-hidden`, and no visible header.
- It is a desktop-first dashboard with nested scroll panes.
- Do not apply marketing page spacing or oversized headings inside workspace panels.

### Section Spacing

Home/marketing sections commonly use generous vertical spacing:

- `py-32 md:py-48` for major sections.
- `mb-20` for section heading blocks.
- `gap-6` for bento/card grids.

### Responsive Behavior

Design mobile-first, then expand at `md` and `lg`:

- Stack content on mobile.
- Use `md:flex-row` or `md:grid-cols-*` for desktop.
- Keep horizontal marquees and media strips masked or scrollable.
- Use masonry with CSS columns for discovery/gallery views.
- Treat `Workspace.tsx` as desktop-first unless explicitly redesigning it for mobile.

## Component Language

### Header

Reference: `src/components/Header.tsx`.

The header is a fixed, centered, pill-shaped navigation system.

Behavior:

- At top: transparent, borderless, wide.
- On scroll: condenses into a frosted card with `bg-card/95`, `backdrop-blur-md`, `border-border`, and `shadow-sm`.
- Desktop navigation uses pill buttons with icon + label.
- Mobile navigation keeps compact icon buttons and the workspace CTA.
- The small dropdown “leg” exposes theme, language, and VHS player controls.

Guidance:

- Preserve the fixed pill silhouette.
- Keep nav buttons rounded, compact, and bold.
- Use the lime workspace CTA as the strongest nav action.
- Avoid adding wide dropdown menus unless they retain the soft/frosted geometry.

### Hero

Reference: `src/components/Hero.tsx`.

The hero combines staged motion, animated SVG handwriting, a playful brand logo feel, and a large product mock browser.

Patterns:

- Delayed entrance sequence: badge, H1, highlighted script/text, subtitle, browser mockup.
- Animated SVG strokes and dots create the handwritten identity.
- Mock browser uses macOS traffic-light dots, soft borders, and nested product panels.
- Product preview is more important than generic illustration.

Guidance:

- Keep hero copy centered and emotionally expressive.
- Use large bold typography with tight tracking.
- Include one memorable visual motif rather than generic SaaS gradients.
- Use product UI mockups with real panel structures, not placeholder blocks.

### Cards And Panels

Common card traits:

- `bg-card` or `bg-white dark:bg-[#222]`.
- `border border-border` or `border-border/40`.
- `rounded-xl` to `rounded-[2rem]`.
- `shadow-sm` with subtle hover elevation.
- Hover lift: `hover:-translate-y-1`, `hover:shadow-md`, `hover:border-primary/50`.
- Inner media regions often have `overflow-hidden` and image zoom on hover.

Marketing cards can be larger, airier, and more decorative. Workspace cards should be compact, flat, and information-dense.

### Follow Cursor Cards

Reference: `src/components/FollowCursorCard.tsx` and `src/components/FeaturesBento.tsx`.

These cards use a custom cursor bubble and heavier tactile border. They are best for bento features and scenario cards.

Guidance:

- Use for discovery or showcase content.
- Avoid in dense admin tables or workspace panels.
- Keep children simple enough that the cursor interaction remains noticeable.

### Bento Feature Grid

Reference: `src/components/FeaturesBento.tsx`.

Pattern:

- `grid grid-cols-1 md:grid-cols-3 gap-6`.
- Some cards span multiple columns with `md:col-span-2`.
- Visual region on top: fixed height around `h-[280px]`.
- Text region below: `p-8`, icon + title, muted description.
- Entrances use `motion` with staggered children.

Guidance:

- Each feature needs a compact visual metaphor, not just an icon.
- Use primary green sparingly to identify active or important elements.
- Keep descriptions short and muted.

### Marquees

References: `src/index.css`, `src/components/ScenariosMarquee.tsx`, `src/components/MarqueeSection.tsx`.

Pattern:

- CSS animation tokens: `animate-marquee`, `animate-marquee-reverse`.
- Duplicate content arrays for seamless scrolling.
- Use horizontal rows, edge gradient masks, and pause-on-hover where appropriate.

Guidance:

- Marquees should imply abundance and social proof.
- Keep card contents scannable.
- Do not use marquee for critical information users must read.

### Pricing

Reference: `src/components/Pricing.tsx`.

Pricing uses large rounded cards, clear hierarchy, feature lists, and one highlighted plan. Use soft borders and primary-color emphasis rather than aggressive contrast.

Guidance:

- Make the recommended plan visually stronger with primary tint, border, or shadow.
- Keep CTAs pill-shaped.
- Use check icons and short feature lines.

### FAQ Accordion

Reference: `src/components/FAQSection.tsx`.

Pattern:

- Rounded stacked items.
- Disclosure with `AnimatePresence` and height/opacity animation.
- Plus/minus or chevron state indicator.

Guidance:

- Keep animation soft and quick.
- Answers should use muted text and comfortable line height.

### Modals

References: `src/components/AuthModal.tsx`, `src/components/vhs/VHSModal.tsx`.

Common modal pattern:

- Fixed full-screen overlay.
- `bg-background/80 backdrop-blur-sm`.
- Centered rounded card.
- Scale + opacity motion on open/close.
- Body scroll lock if modal content can exceed viewport.

Auth modal style:

- Soft SaaS card, compact fields, rounded controls, fake verification feedback.

VHS modal style:

- Full custom retro experience with CRT, tapes, scanlines, and physical insertion animation.

Guidance:

- Use the common modal shell for normal product actions.
- Only use VHS/CRT effects inside the VHS feature or intentionally themed experiences.

## Page Patterns

### Home Landing Page

References:

- `src/components/Hero.tsx`
- `src/components/GrowWithYouSection.tsx`
- `src/components/FeaturesBento.tsx`
- `src/components/ScenariosMarquee.tsx`
- `src/components/Pricing.tsx`
- `src/components/MarqueeSection.tsx`
- `src/components/FAQSection.tsx`

Structure:

- Emotional hero.
- Product mockup.
- Growth/steps section.
- Bento feature proof.
- Scenario/social marquee.
- Pricing.
- Additional marquee/social proof.
- FAQ.

Guidance:

- Keep sections visually distinct but aligned by palette, radius, and typography.
- Use motion to reveal content, not to distract.
- Combine interface screenshots/mockups with playful decorative elements.

### Plaza/Gallery

References: `src/pages/Plaza.tsx`, `src/components/SoulImageCard.tsx`.

Pattern:

- Discovery page with search, sort controls, category tabs, and tag chips.
- Masonry layout using CSS columns: `columns-1 sm:columns-2 md:columns-3 xl:columns-4`.
- Cards use `break-inside-avoid`.
- Image cards include metadata, tags, and hover states.

Guidance:

- Use masonry for variable-height visual content.
- Add lightweight metadata rows and badges.
- Use overlays sparingly so images remain primary.
- Ensure translation keys exist for any new labels.

### Screenings

Reference: `src/pages/Screenings.tsx`.

Pattern:

- Film-event dashboard with pastel bento stats.
- Pill filters and tabbed sections.
- Poster/roadmap cards with ratings and metadata.
- Side profile card and nomination modal.
- Typewriter/status effects communicate AI activity.

Guidance:

- Use cinematic imagery and poster proportions.
- Keep filters pill-shaped and compact.
- Use pastel metric cards for summary data.

### Gaming

Reference: `src/pages/Gaming.tsx`.

Pattern:

- Gaming dashboard and homepage hybrid.
- Carousel hero with progress indicators.
- Category cards, recent plays, profile/sidebar, explore masonry, detail modal.
- More media-heavy and slightly darker in mood than normal marketing pages.

Guidance:

- Use image backdrops, gradients, and hover-visible controls.
- Keep card radii and typography consistent with the rest of the site.
- Make carousel controls visible on hover, not permanently dominant.

### Workspace

Reference: `src/pages/Workspace.tsx`.

Pattern:

- Desktop-first control center.
- Left vertical pill rail.
- Split panels, nested scroll areas, compact task/event rows.
- Status dots, chips, progress bars, view switchers, media controls.
- Uses `font-mono` and tiny labels more often than marketing pages.

Guidance:

- Add new workspace UI as compact panels with thin borders.
- Prefer `rounded-xl`, `shadow-sm`, and `bg-card`.
- Use `text-xs` and `text-[10px]` for dense metadata.
- Avoid full-page scrolling if the panel design expects nested scroll.
- Do not introduce large marketing headings into workspace content.

### Changelog

Reference: `src/pages/Changelog.tsx`.

Pattern:

- Horizontal roadmap/timeline with scroll controls.
- Vertical update log with date/version column and content column.
- Modal for viewing more roadmap items.

Guidance:

- Use timeline lines and alternating cards for roadmap storytelling.
- Keep update cards readable and chronological.

### About

Reference: `src/pages/About.tsx`.

Pattern:

- Static informational page.
- Clean cards with large faint background icons.
- Colored icon blocks and concise explanatory text.

Guidance:

- Best reference for non-interactive content pages.
- Keep layout calm, spacious, and legible.

### VHS Player

References:

- `src/components/vhs/VHSModal.tsx`
- `src/components/vhs/CRTPlayer.tsx`
- `src/components/vhs/TapeShelf.tsx`
- `src/components/vhs/ScreenEffects.tsx`
- `src/components/vhs/TapeCard.tsx`
- `src/components/vhs/HorizontalCassette.tsx`
- `src/components/vhs/BlackCassette.tsx`

Pattern:

- Retro skeuomorphic subsystem.
- CRT scanlines/noise.
- Tape shelf and physical insertion animation.
- Darker, more theatrical visual language.

Guidance:

- Keep VHS visuals isolated to player-related features.
- Use physical metaphors and tactile motion.
- Avoid mixing scanlines/noise into normal SaaS content.

## Motion Guidelines

The project uses `motion/react` heavily.

Common motion patterns:

- Entrance: opacity + y offset, sometimes blur.
- Hover: lift, scale, shadow, border-color shift.
- Disclosure: `AnimatePresence` height/opacity transitions.
- Modals: scale + opacity spring.
- Auto-advance: 5-second step/carousel changes with progress indicators.
- SVG drawing: path length animation for the hero handwriting.

Recommended timings:

- Microinteractions: `duration-200` to `duration-300`.
- Section entrances: 0.4s to 0.6s.
- Spring cards: stiffness around 100, damping around 20.
- Staggered children: 0.1s to 0.15s.

Motion should make the UI feel alive and soft. Avoid aggressive bouncing, long delays for important actions, or constant motion near dense text.

## Iconography And Imagery

The project uses `lucide-react` for most icons. Icons are usually thin and small:

- Standard nav/control icon: `size-4` or `size-5`.
- Feature icon: `size-5`, sometimes `size-16` for visual areas.
- Stroke width: usually `1`, `1.5`, or `2`.

Imagery patterns:

- Dicebear avatars for users/settings.
- Remote placeholder/media images for plaza, games, and screenings.
- Product mock UI and custom SVG illustrations for brand moments.

Guidance:

- Keep icons simple and line-based.
- Use imagery heavily in media sections.
- Use custom SVG only for distinctive brand moments, not generic decoration.

## State And Persistence

Theme and language live in `src/contexts/ThemeLanguageContext.tsx`. Several page settings use `src/hooks/useLocalStorage.ts`.

Guidance:

- Use existing theme/language context for labels and toggles.
- Persist user-facing tab/filter/view choices when they are likely to be revisited.
- Verify translation keys when adding UI copy.

## Implementation Rules For Future AI

- Prefer Tailwind utility classes directly; this codebase favors inline class composition over abstracted design components.
- Use `cn` from `src/lib/utils.ts` for conditional classes.
- Reuse semantic theme tokens before hard-coded colors.
- Preserve large radii, soft borders, and subtle shadows.
- Use `motion/react` for meaningful entrances, modals, tabs, and hover interactions.
- Use `AnimatePresence` for accordions, modals, and tab content that enters/exits.
- Keep marketing pages spacious and expressive.
- Keep workspace pages compact and panelized.
- Keep gallery/media pages card-driven and image-forward.
- Avoid introducing a different UI library unless explicitly requested.
- Avoid changing the global design tokens unless the redesign is intentional.
- Avoid overusing gradients; the site relies more on soft surfaces, borders, images, and motion.
- Avoid emojis in normal UI copy unless the surrounding section already uses playful media/status language.

## Quick Patterns

### Marketing Section Skeleton

```tsx
<section className="py-32 md:py-48 px-4 w-full max-w-7xl mx-auto">
  <div className="mb-20 text-center">
    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
      Title <span className="text-muted-foreground font-normal">secondary</span>
    </h2>
    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
      Short supporting copy.
    </p>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* cards */}
  </div>
</section>
```

### Standard Card

```tsx
<div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
  <div className="h-48 border-b border-border/60 bg-muted/30" />
  <div className="p-6">
    <h3 className="text-lg font-semibold text-foreground">Title</h3>
    <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">Description</p>
  </div>
</div>
```

### Compact Workspace Panel

```tsx
<div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
  <div className="h-10 px-3 border-b border-border bg-muted/20 flex items-center justify-between">
    <div className="flex items-center gap-1.5 text-sm font-medium">Panel</div>
    <div className="text-[10px] text-muted-foreground font-mono tabular-nums">12</div>
  </div>
  <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
    {/* dense rows */}
  </div>
</div>
```

### Modal Shell

```tsx
<motion.div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
  <motion.div className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
    {/* modal content */}
  </motion.div>
</motion.div>
```
