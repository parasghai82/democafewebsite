# Butter & Blue Website Plan

## Positioning

A cozy, character-rich café website for Butter & Blue (7 Baldwin St, Baldwin Village). The site sells the feeling of discovering an older house-turned-café, not just menu items. Tone is warm, nostalgic, intimate and playful, built around the butter-yellow + blue identity and the café's cat/Pom personality.

## Decisions

- **Main goal:** Get more people to visit the café in person.
- **Primary CTA:** Get Directions / Visit Us.
- **Visual identity:** Preserve strongly — butter yellow + blue, house character, cat/Pom charm.
- **Overall feeling:** Cozy neighbourhood house café (warm sand palette).
- **Imagery:** Use clearly defined image placeholders / generation prompts; no real photos provided.

## Information Architecture

Single landing page with anchored sections:

```text
1. Hero
   - Café name + tagline
   - Primary CTA: Get Directions
   - Secondary CTA: View menu highlights
   - Hero image: exterior or interior of the Baldwin house

2. Atmosphere / The House
   - Multi-environment story: main floor, basement nooks, garden/patio
   - Warm copy about study, hangouts, casual dates

3. Drinks & Bites Highlights
   - Specialty coffee, matcha, tea, Hong Kong/Asian-inspired drinks
   - House-made baked goods and savoury treats
   - Link to full menu (optional anchor or separate route)

4. Visit Us
   - Address, hours, neighbourhood note (Baldwin Village)
   - Map/directions link
   - Patio note when seasonal

5. Private Events & Catering
   - Secondary mention for bookings / custom orders
   - Soft CTA to inquire

6. Footer
   - Social link (Instagram)
   - Location + hours recap
   - Cat/Pom brand moment
```

## Visual Art Direction

- Warm sand palette anchored by butter yellow and a friendly blue.
- Soft, rounded corners and generous whitespace.
- Editorial-but-cozy typography: a warm serif or rounded sans for headings, clean sans for body.
- Illustrative/photographic placeholders showing the older house, intimate interiors, garden nook, drinks, baked goods, and a subtle cat/Pom touch.
- No generic corporate SaaS aesthetics; keep it neighbourhood-personal.

## UX Direction

- One clear action above the fold: get directions.
- Scroll tells a story; sections flow from first impression → atmosphere → menu → visit → extras.
- Mobile-first stacking with readable tap targets.
- Reserve heavier interaction for gentle scroll reveals and hover accents; avoid over-animating.

## Build Steps

1. **Design tokens** — update `src/styles.css` with butter yellow, blue, warm sand and cozy neutrals in oklch.
2. **Hero + page shell** — replace `src/routes/index.tsx` placeholder with the full landing page, using semantic tokens and proper `head()` metadata.
3. **Sections** — build atmosphere, menu highlights, visit us, events/catering and footer as components in or imported by the index route.
4. **Image placeholders** — generate images for house exterior, interior nook, patio/garden, coffee/matcha, baked goods and cat/Pom brand touch; import them into the page.
5. **Polish + SEO** — add alt text, canonical tag, meta description, og/twitter tags and responsive spacing.
6. **Validate** — run build check, inspect for errors, and verify the preview shows the cozy café direction.
