# HomeBuyer Pro — Style Reference
## The single source of truth for all UI styling decisions

Reference this file when building any component in any phase. Do not deviate without updating this document.

---

## Fonts

| Usage | Family | CSS Variable | Weight |
|-------|--------|-------------|--------|
| Body text, labels, buttons, nav, captions | DM Sans | `--font-dm-sans` / `font-sans` | 300 (light), 400 (regular), 500 (medium), 600 (semibold) |
| Headings (h1, h2, h3), wordmark | DM Serif Display | `--font-dm-serif` / `font-heading` | 400 |

Headings use DM Serif Display automatically via the `h1, h2, h3` base rule in globals.css.

---

## Font Sizes

Use these consistently. Do not freestyle sizes.

| Element | Tailwind Class | Px | When to use |
|---------|---------------|-----|-------------|
| Page title | `text-3xl` | 30px | Main phase heading ("Shopping", "Escrow & Due Diligence") |
| Section heading | `text-2xl` | 24px | Card group labels ("Critical Actions & Deadlines"), sidebar wordmark |
| Panel title | `text-xl` | 20px | Copilot panel header ("Homie"), modal titles |
| Body text | `text-base` | 16px | Default for all body copy, nav labels, button text, input text, card content, chat messages |
| Secondary text | `text-sm` | 14px | Timestamps, helper text below inputs, footer disclaimer, chip labels |
| Caption | `text-xs` | 12px | Badges, status indicators, very minor metadata |

**Rule:** When in doubt, use `text-base` (16px). Undersized text is the most common styling mistake. Never use `text-xs` for anything a user needs to read regularly.

---

## Font Weights

| Weight | Tailwind | When to use |
|--------|----------|-------------|
| 300 | `font-light` | Never in v1 (reserved for large display text if needed later) |
| 400 | `font-normal` | Body text, descriptions, subtitles |
| 500 | `font-medium` | Nav labels, button text, progress stepper labels, form labels |
| 600 | `font-semibold` | Page headings, card titles, key financial figures, panel headers |

---

## Colors (CSS Variables)

### Backgrounds & Surfaces
| Token | Variable | Hex | Use for |
|-------|----------|-----|---------|
| Background | `bg-background` | #F5DEB3 | Page canvas |
| Card | `bg-card` | #FFFFFF | Cards, panels, elevated surfaces |
| Secondary | `bg-secondary` | #FEFCF8 | Sidebar, progress stepper, alt surfaces |
| Muted | `bg-muted` | #FEFCF8 | Chat bubbles, hover states, recessed areas |

### Text
| Token | Variable | Hex | Use for |
|-------|----------|-----|---------|
| Foreground | `text-foreground` | #2D3748 | Primary text, headings |
| Muted foreground | `text-muted-foreground` | #767676 | Subtitles, timestamps, helper text, disabled |

### Interactive
| Token | Variable | Hex | Use for |
|-------|----------|-----|---------|
| Accent | `bg-accent` / `text-accent` | #D38E45 | CTA buttons, active nav, links, floating copilot button |
| Accent foreground | `text-accent-foreground` | #FFFFFF | Text on accent buttons |
| Primary | `bg-primary` | #6EE7B7 | Completed steps, progress bars, upload buttons, send button, positive badges |
| Primary foreground | `text-primary-foreground` | #2D3748 | Text on primary/mint surfaces |

### Status
| Token | Variable | Hex | Use for |
|-------|----------|-----|---------|
| Success | `text-success` / `bg-success` | #10B981 | Success confirmations |
| Warning | `text-warning` / `bg-warning` | #F59E0B | Approaching deadlines, caution states |
| Destructive | `text-destructive` / `bg-destructive` | #E53E3E | Critical alerts, overdue, errors |

### Border
| Token | Variable | Hex | Use for |
|-------|----------|-----|---------|
| Border | `border-border` | #E8DBBF | Card borders, dividers, input outlines, sidebar border |

---

## Cards

All content cards use this exact pattern:

```
bg-card rounded-xl border border-border shadow-sm
```

- Fill: white (#FFFFFF)
- Border: 1px solid #E8DBBF
- Shadow: `shadow-sm` (Tailwind's 2-layer: `0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)`)
- Radius: `rounded-xl` (12px)
- Padding: `p-6` for standard cards, `p-8` or `p-10` for large content areas

Never use a card without all three: border + shadow + rounded-xl.

---

## Buttons

### Primary CTA (Bronze)
```
bg-accent text-accent-foreground shadow-sm rounded-lg font-medium text-base hover:bg-accent/90
```
Padding: `px-5 py-2.5`

### Secondary / Positive (Mint)
```
bg-primary text-primary-foreground shadow-sm rounded-lg font-medium text-base hover:bg-primary/90
```

### Ghost / Outline
```
border border-border text-foreground rounded-lg font-medium text-base hover:bg-muted
```

### Icon button
```
p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground
```

Button radius is always `rounded-lg` (8px). Never `rounded-md` or `rounded-full` for standard buttons.

---

## Layout Regions

| Region | Width | Background | Border | Shadow |
|--------|-------|------------|--------|--------|
| Progress stepper | full width, h-72px | `bg-secondary` | bottom `border-border` | `shadow-sm` |
| Sidebar (expanded) | 256px | `bg-sidebar` | right `border-sidebar-border` | `shadow-sm` |
| Sidebar (collapsed) | 64px | `bg-sidebar` | right `border-sidebar-border` | `shadow-sm` |
| Main content | flex-1 | `bg-background` | none | none |
| Copilot panel | 320px | `bg-card` | left `border-border` | none |
| Footer | full width, h-52px | `bg-card` | top `border-border` | none |

---

## Spacing

| Context | Value | Tailwind |
|---------|-------|----------|
| Page padding (main content) | 32px | `p-8` |
| Card internal padding | 24px | `p-6` |
| Large card padding | 40px | `p-10` |
| Section gap | 24px | `space-y-6` |
| Between label and input | 8px | `space-y-2` |
| Between nav items | 4px | `space-y-1` |
| Sidebar padding | 16px horizontal | `px-4` |

---

## Shadows

| Level | Tailwind | When to use |
|-------|----------|-------------|
| `shadow-sm` | `shadow-sm` | Cards, sidebar, stepper, active nav buttons, CTA buttons |
| `shadow-lg` | custom | Copilot floating button only |
| None | — | Footer, main content area, inactive nav items |

---

## Border Radius

| Element | Tailwind | Px |
|---------|----------|----|
| Cards, panels, chat bubbles | `rounded-xl` | 12px |
| Buttons, inputs, nav items | `rounded-lg` | 8px |
| Badges, chips | `rounded-full` | 9999px |
| Step circles | `rounded-full` | 9999px |
| Sidebar toggle | `rounded-full` | 9999px |

---

## Naming Conventions

| Concept | Name in UI | Name in code |
|---------|-----------|--------------|
| AI assistant | Homie | `AICopilot` (component), `copilot_messages` (DB) |
| Product | HomeBuyer Pro | — |
| Left panel | Sidebar | `Sidebar.tsx` |
| Right panel | Homie panel | `AICopilotPanel` |
| Top bar | Progress stepper | `ProgressStepper.tsx` |
| Bottom bar | Footer | `GlobalFooter.tsx` |

---

## Component Patterns

### ViewEditCard
Dual-state card with view mode and edit mode. Used for any data the user enters then reviews.
```tsx
<ViewEditCard
  title="Section Name"
  subtitle="Description"
  saved={isSaved}
  onSave={() => { setSaved(true); toast.success("Saved"); }}
  saveLabel="Save"
  renderView={() => <ReadOnlyDisplay />}
  renderEdit={() => <FormInputs />}
/>
```
- **Edit mode** (default when `saved=false`): renders `renderEdit()` + Save/Cancel buttons
- **View mode** (when `saved=true`): renders `renderView()` + "Edit" pencil link in header
- Card owns the edit/save/cancel toggle; parent owns the data and save handler
- Collapsible (expand/collapse) built in
- File: `components/ui/view-edit-card.tsx`

### CollapsibleCard
Used for display-only collapsible sections (Shopping, Offer, Closing, Post-Close):
```
bg-card rounded-xl border border-border shadow-sm
```
- Header: title (text-base font-semibold) + subtitle (text-sm text-muted-foreground) + expand/collapse button
- Body: content area, hidden when collapsed
- Expand button: 32x32, `rounded-lg`

### Phase heading
```html
<h2 className="text-3xl font-semibold tracking-tight">Phase Name</h2>
<p className="text-base text-muted-foreground mt-1">Description</p>
```

### Status badge
```
text-xs px-2.5 py-0.5 rounded-full font-medium
```
- Green: `bg-primary/20 text-primary-foreground`
- Red: `bg-destructive/10 text-destructive`
- Yellow: `bg-warning/10 text-warning`
- Neutral: `bg-muted text-muted-foreground`

---

## Supported Viewports

| Device | Width | Status |
|--------|-------|--------|
| iPad Air (landscape) | 1180px | Minimum supported — sidebar auto-collapses if needed |
| MacBook Air 13" | 1280px | Primary dev target |
| MacBook Pro 15" | 1440px | Primary dev target |
| External monitor | 1920px+ | Supported — content max-width prevents stretch |
| Ultrawide | 2560px+ | Supported — generous margins, centered content |
| Mobile / portrait tablet | <1024px | Not supported in v1 |

### Responsive behavior

- Main content area caps at `max-w-[1152px]` and centers with `mx-auto`. On large screens this creates balanced margins.
- Main padding scales: `p-6` (default) → `p-8` (lg/1024px+) → `p-10` (xl/1280px+).
- Homie panel scales: `w-80` (320px default) → `w-96` (384px at xl/1280px+).
- Sidebar collapsed width (64px) ensures the app works at iPad Air landscape (1180px) with copilot open: 64 + 1180 content area minimum.
- No mobile breakpoints, no hamburger menu, no stacking layouts in v1.

---

## Rules

1. **Never go below `text-sm` (14px) for anything a user reads.** `text-xs` (12px) is for badges and minor metadata only.
2. **Every card gets `border + shadow-sm + rounded-xl`.** No exceptions.
3. **Accent (Bronze) is for CTAs only.** Don't use it for decorative elements.
4. **Primary (Mint) is for progress and positive actions.** Upload buttons, completed steps, send buttons, success badges.
5. **All headings use DM Serif Display.** All body text uses DM Sans.
6. **Main body text is always `text-base` (16px).** Never smaller for primary content.
7. **Buttons are always `rounded-lg` (8px).** Cards are always `rounded-xl` (12px).
8. **The AI assistant is called "Homie" in the UI**, `AICopilot` in code.
