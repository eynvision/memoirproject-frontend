# CLAUDE.md — The Memoir Project (Clio): Onboarding Screens 4–10

Scope of this task: build screens 4 through 10 of the onboarding flow.
Screens 1–3 exist as design references only (for continuity/context below)
and are **out of scope** — do not build or modify them as part of this task.

---

## 1. Project Context

- **Stack:** Vite 5 + React 18 + TypeScript + Tailwind CSS v3. (Ignore any
  older repo docs that say Next.js 15 — that's wrong.)
- **Design tokens:** cream background / terracotta accent / warm charcoal
  text. These must exist as named tokens in `tailwind.config.js` — reference
  them by name (`bg-cream`, `bg-terracotta`, `text-charcoal`, etc.), never
  hardcode hex values in a screen component.
- **Before touching any screen:** open `tailwind.config.js` and confirm the
  token set is already in place and `CreateIdentity.tsx` uses named tokens
  (not raw hex/rgb). If it isn't done, do that first — every screen in this
  batch should be built against the same token set, not against colors
  eyeballed from the screenshots.
- **Screen 5 already exists in the repo as `CreateIdentity.tsx`.** Do not
  rebuild it from scratch. Open it, compare it against the Screen 5 spec
  below, and reconcile: refactor to match spec (notably the live-preview
  card on the right, described below) and to use named tokens. Treat this
  as an update pass, not a rewrite.

## 2. Full Flow for Context (screens 1–10)

The screenshots are numbered by filename, not by their position in the
actual user journey — the step-dot indicators inside the screens show the
real order. Both are listed here so the numbering isn't confusing:

| File name | Screen title | Step-dot position | In scope? |
|---|---|---|---|
| Screen 2 | Landing page ("Save the memories before they fade") | pre-flow, no stepper | No |
| Screen 1 | "Who is this memoir for?" (subject name + photo) | no dots shown (unstyled draft) | No |
| Screen 3 | "How much time would you like to dedicate?" | 2 of 5 dots | No |
| **Screen 4** | "Let's begin a memoir for someone you love." | 1 of 6 dots | **Yes** |
| **Screen 5** | "Create the Identity" | 3 of 6 dots | **Yes (reconcile, don't rebuild)** |
| **Screen 6** | "How should this memoir feel?" | 4 of 6 dots | **Yes** |
| **Screen 7** | "Add More Details" | 5 of 6 dots | **Yes** |
| **Screen 8** | "This is the beginning of your family's memoir." | 6 of 6 dots | **Yes** |
| **Screen 9** | "Your memoir space is ready." | no dots (transition screen) | **Yes** |
| **Screen 10** | "Save your memoir and continue." (create account) | no dots (final step) | **Yes** |

Note the dot-count mismatch between Screen 3 (5 total dots) and Screens
4–8 (6 total dots) — that's a real inconsistency in the source file, not
something to resolve here since Screen 3 is out of scope. Just don't treat
Screen 3's dot count as a reference for anything in this batch.

## 3. UX Principles (apply to every screen below, no exceptions)

- **Deferred auth** — the user is never forced to create an account until
  Screen 10. Screens 4–9 must work fully anonymously.
- **Anonymous session preservation** — onboarding progress persists via an
  anonymous/local session (not a user ID), so someone who closes the tab
  and returns doesn't lose their place. Check the existing state mechanism
  in the repo before adding a new one.
- **No gamification** — no badges, streak counters, confetti, percentage
  complete. The only progress indicator is the plain step-dot row.
- **Grief-appropriate pacing language** — copy is gentle, unhurried. Never
  add urgency/pressure language that isn't already in the spec below.

## 4. Shared Components (build once, reuse across screens 4–10)

**StepHeader** (used on Screens 4, 5, 6, 7, 8 — not 9 or 10... see note)
- Left: back arrow icon
- Center: step-dot row, 6 dots total, filled dots in terracotta up to the
  current step, unfilled dots in light gray
- Right: close (X) icon
- **Flag:** Screens 6 and 8 show a literal text label "Step Navigation"
  above the dots. This reads like a stray Figma layer name that leaked
  into the visible design, not intentional copy — Screens 4, 5, and 7
  don't have it. Recommend building the header WITHOUT this text label
  (icon-only, matching 4/5/7) and confirming with design before adding it
  back anywhere.
- Screen 10 keeps the back arrow + close (X) but has **no dots** — it's
  outside the main 6-step counter (makes sense, it's the deferred-auth step
  after the flow is already complete).
- Screen 9 has **no header at all** — no back arrow, no dots, no close.
  Build it without a StepHeader.

**ActionRow** (bottom button row — back/skip/continue pattern)
- Varies per screen (see individual specs below); build it flexible enough
  to take 1 or 2 buttons with configurable labels, not a rigid 2-button
  component.

**MemoirPreviewCard** (right-side live preview, used on Screen 5, and a
similar-but-not-identical card layout on Screen 8 — check whether these
should be the same component with variant props, or two components; they
share a card shape but different content structure)

## 5. Screen Specs

### Screen 4 — Begin
- Centered layout, generous vertical whitespace, cream background
- Decorative icon: sparkle/stars, in a white circle, centered above headline
- Headline: "Let's begin a memoir for someone you love."
- Subtext: "We'll help you create a space for your family's memories,
  stories, photographs, and voices."
- Primary CTA: **Begin** (terracotta filled pill button, centered)
- Secondary link: **Skip** (plain text, centered below the button)
- Step dots: 1 of 6 active
- **Flag:** confirm what "Skip" actually does here — skipping the very
  first content screen presumably skips the whole memoir-creation flow
  (straight to dashboard?) rather than just this screen. Don't guess;
  confirm the destination before wiring it up.

### Screen 5 — Create the Identity (reconcile with existing `CreateIdentity.tsx`)
- Two-column layout: form on the left, live preview card on the right
- Headline: "Create the Identity"
- Subtext: "Let's give this collection a name and define your connection
  to the storyteller."
- Field 1 label: "What would you like to call this memoir?" — text input,
  placeholder "The Story of Grandma Ayesha"
- Field 2 label: "How would you describe your relationship with them?" —
  text input, placeholder "My grandmother"
- Right column: **MemoirPreviewCard**, labeled "LIVE PREVIEW" (small pill,
  top-right of card, with a small dot indicator), showing the memoir title
  and relationship live-updating as the user types — title styled as a
  serif heading, relationship styled as small caps beneath it
- Bottom buttons: **Back** (outline) and **Continue** (terracotta filled)
- Step dots: 3 of 6 active
- Action item: compare this spec against the current `CreateIdentity.tsx`
  implementation — if the live-preview card doesn't exist yet, that's new
  work, not just a token refactor.

### Screen 6 — Choose Feeling
- Headline: "How should this memoir feel?"
- Subtext: "Select a mood to help us tailor the visual style, prompts, and
  overall tone of your digital heirloom."
- Left column: 5 selectable mood cards, single-select, radio-button
  behavior (selecting one deselects the others):
  1. **Warm and nostalgic** — "Soft tones, vintage touches, emotional
     resonance." (shown selected/default in the reference screenshot,
     with a terracotta border and a checkmark badge)
  2. **Celebratory** — "Bright colors, joyous moments, uplifting energy."
  3. **Reflective** — "Quiet focus, deep thoughts, serene presentation."
  4. **Humorous** — "Lighthearted, playful accents, joyful memories."
  5. **Simple and timeless** — "Clean lines, elegant typography, minimal
     distraction."
- Right column: a photo-backed preview card that updates based on the
  selected mood — shows a representative image, an overlay with the mood
  name and its description, and a small "Style Preview" caption beneath
  the card
- Bottom: single centered CTA, **Continue to Content →** (terracotta
  filled, with a right-arrow icon) — no separate Back/Skip visible in this
  frame; add a Back arrow in the header only, consistent with the shared
  StepHeader
- Step dots: 4 of 6 active
- (See Section 4 flag on the stray "Step Navigation" text label.)

### Screen 7 — Add More Details
- **Background is white/off-cream in this frame**, unlike every other
  screen in this batch (which use the cream background). Flag this before
  building — confirm whether that's intentional (e.g. this step is meant
  to feel visually distinct because it's the "optional extra" step) or a
  design oversight that should use the same cream token as the rest.
- Headline: "Add More Details"
- Subtext: "You can skip anything you are not ready to add. These details
  help us build a richer context for the memoir."
- Content sits inside a light card/panel:
  - Label: "Short Description" — multi-line textarea, placeholder "A
    brief note about their life or legacy…"
  - Two side-by-side date fields:
    - "Birth Date" — date input with calendar icon, placeholder
      mm/dd/yyyy
    - "Passing Date" (labeled Optional) — date input with calendar icon,
      placeholder mm/dd/yyyy
  - Divider, then sub-heading "What does the family hope to preserve?" —
    multi-line textarea, placeholder "Stories of their travels, lessons
    they taught, recipes…"
- Bottom buttons: **Skip for now** (plain text link) and **Continue**
  (terracotta filled)
- Step dots: 5 of 6 active
- All fields on this screen are optional per the subtext — don't add
  required-field validation here unless told otherwise.

### Screen 8 — Final Preview
- Headline: "This is the beginning of your family's memoir."
- Subtext: "A preview of how your collection will look. The tactile
  legacy begins here."
- Centered book-cover mockup card: small icon (open-book/crown mark) in
  gold/muted-gold, memoir title as large serif text (sample: "The
  Harrison Legacy" — this should render the actual title from Screen 5's
  input, not static text), a thin gold divider rule, an "EST. [year]"
  line (derived from birth date entered in Screen 7, if provided), and a
  small embedded photo card near the bottom of the cover
- Bottom buttons: **Edit details** (outline) and **Looks good** (terracotta
  filled)
- Step dots: 6 of 6 active (final step of the main stepper)
- **Flag:** there's a small gray rectangle artifact in the top-left corner
  of this frame in the export. It doesn't look like an intentional design
  element (no equivalent on any other screen) — likely a crop/export
  artifact from Figma. Don't build it; verify directly in Figma if unsure.
- (See Section 4 flag on the stray "Step Navigation" text label.)

### Screen 9 — Memoir Ready (transition/celebration screen)
- No header — no back arrow, no dots, no close icon
- Centered layout, generous whitespace
- Decorative element: a soft glowing orb (warm gradient — cream/terracotta
  tones, blurred) centered above the headline. This reads as a CSS effect
  (radial gradient + blur), not a photo asset — build it that way unless
  an actual exported asset exists in the repo.
- Headline: "Your memoir space is ready."
- Subtext: "You have created the beginning of a family story. You can now
  invite your family to add their memories."
- Primary CTA: **Go to my memoir →** (terracotta filled, with right-arrow
  icon)
- Secondary CTA: **Invite family later** (outline button)
- No step dots — this is a transition screen after the main 6-step
  sequence, before the deferred-auth step.

### Screen 10 — Create Account (deferred-auth checkpoint)
- Header: back arrow + close (X), no step dots
- Headline: "Save your memoir and continue."
- Subtext: "Create an account to protect your memoir, invite your family,
  and return to it whenever you wish."
- Form, inside a card:
  - **Full Name** — text input, placeholder "Jane Doe"
  - **Email** — text input, placeholder "jane@example.com"
  - **Password** — password input (masked)
  - Checkbox: "I agree to the Terms of Service and Privacy Policy." (both
    links styled in terracotta, underlined)
  - Primary CTA: **Create Account** (full-width terracotta button)
  - Divider: "OR"
  - Secondary CTA: **Continue with Google** (outline button, Google "G"
    icon, white background)
- Below the card: "Already have an account? Log in" (Log in link in
  terracotta)
- This is the deferred-auth checkpoint from the UX principles — whatever
  anonymous session data was built up across Screens 4–9 needs to attach
  to the newly created account here, not get lost. Confirm this wiring
  works before considering the screen done.
- **Flag:** confirm whether "Continue with Google" is a real OAuth
  integration to wire up in this batch or a placeholder UI for now — don't
  build a fake/non-functional button silently either way; ask if it's not
  already clear from existing repo code (e.g. Auth0 config referenced
  elsewhere in the project).

## 6. File Structure

Audit the current scaffolding first — it's described as mostly empty, so
consolidate into this structure rather than creating a second, competing
one:

```
src/
  features/
    onboarding/
      OnboardingFlow.tsx          # stepper/route controller for screens 4-8
      screens/
        BeginIntro.tsx            # Screen 4
        CreateIdentity.tsx        # Screen 5 (existing — reconcile, don't duplicate)
        ChooseFeeling.tsx         # Screen 6
        AddDetails.tsx            # Screen 7
        FinalPreview.tsx          # Screen 8
        MemoirReady.tsx           # Screen 9
        CreateAccount.tsx         # Screen 10
      components/
        StepHeader.tsx
        ActionRow.tsx
        MemoirPreviewCard.tsx
      state/
        onboarding-context.tsx    # or match whatever state pattern already exists
      types/
        onboarding.types.ts
```

- Match existing naming/casing conventions already established by
  `CreateIdentity.tsx` rather than introducing a new convention.
- One component per file, no bundling multiple screens into one file.
- No dead/unused scaffolding left behind — if the existing empty folders
  don't match this structure, clean them up rather than leaving both.

## 7. State & Data Flow

- Title and relationship from Screen 5, mood from Screen 6, and
  description/dates from Screen 7 all need to reach Screen 8's cover
  preview and (implicitly) Screen 10's saved record — confirm a single
  onboarding state object flows through all screens rather than each
  screen managing isolated local state.
- Everything must survive anonymously until Screen 10, per the deferred
  auth principle.

## 8. Git Workflow

- Commit at reasonable checkpoints as you go (e.g., shared components,
  then each screen) with clear, scoped commit messages.
- **Do not push to the remote until the entire batch is done** — all of
  Screens 4–10 built, reconciled with existing code, matching the specs
  above, and the app builds and runs locally without errors.
- Once everything in this batch is complete and verified, push the work.

## 9. Definition of Done

- [ ] Design tokens confirmed in `tailwind.config.js` (or fixed first)
- [ ] `CreateIdentity.tsx` reconciled with Screen 5 spec (not duplicated)
- [ ] Screens 4, 6, 7, 8, 9, 10 built per spec
- [ ] Shared StepHeader and ActionRow used consistently, no per-screen
      one-off headers
- [ ] Onboarding state flows correctly from Screen 5 → 8 (title, mood,
      details all reflected in the final preview)
- [ ] No hardcoded colors — everything through named tokens
- [ ] File structure matches Section 6, no leftover duplicate scaffolding
- [ ] App builds and runs locally with no errors before pushing
- [ ] All "Flag" items above either resolved or explicitly confirmed with
      the team, not silently guessed
- [ ] Final push done only after all of the above

## 10. Open Questions (confirm before/while building — don't guess)

1. Screen 4's "Skip" link — what does it skip to?
2. Screens 6 & 8's "Step Navigation" text label — keep or remove?
3. Screen 7's white (vs. cream) background — intentional or design bug?
4. Screen 8's top-left gray artifact — real element or export artifact?
5. Screen 10 "Continue with Google" — real OAuth wiring in this batch, or
   placeholder UI?