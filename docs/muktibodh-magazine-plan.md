# Muktibodh Magazine Improvement Plan

## Purpose

This document captures the current Muktibodh magazine setup in the Nirvan Dham library and proposes a controlled improvement plan. No implementation changes should be made until the requested suggestions are reviewed and approved.

## Current State

- The library currently has one magazine entry in `src/lib/library-data.ts`: `muktibodh-june-2026`.
- The magazine has a PDF at `public/library/magazines/muktibodh-june-2026.pdf`.
- It also has 35 page images under `public/library/magazines/muktibodh-june-2026/pages/`.
- The library page renders a custom `MuktibodBanner` section in `src/components/LibraryPage.tsx`.
- The magazine reader route is `src/app/library/magazine/[slug]/read/page.tsx`.
- The reader reuses `PremiumBookReader`, passing the magazine PDF and page images as an `EBook`-like object.
- The magazine currently has a countdown/next issue flow using `launchDate` and `nextIssueDate`.

## Observed Strengths

- The magazine already feels visually separate from ordinary eBooks.
- The dedicated reader link is clean: `/library/magazine/muktibodh-june-2026/read`.
- Page images give reliable visual fidelity compared with rendering the PDF live.
- The PDF download remains available for users who want the exact file.
- The existing premium reader controls already provide grid, dark mode, zoom, share, and PDF access.

## Issues And Risks To Consider

- The magazine feature is currently special-cased around one issue, rather than being a scalable magazine archive.
- The banner text, cover mockup, and issue CTA are mostly hardcoded in `LibraryPage.tsx`.
- As more issues arrive, the library page can become hard to maintain unless magazine issue data is more structured.
- Countdown behavior needs a clear editorial model: show launch countdown before release, next issue countdown after release, and archive past issues.
- Magazine reader behavior is different from manuscript eBooks, so UI labels should make it clear whether the reader is showing page images/PDF pages.
- The current Muktibodh section should preserve the premium theme while becoming easier to update monthly.

## Proposed Magazine Improvements

1. Create a scalable magazine issue model.

   Add fields such as issue number, month label, release status, cover image, hero copy, contents summary, and next issue teaser. This keeps future Muktibodh issues data-driven.

2. Convert the Muktibodh banner into a reusable magazine hero component.

   The current banner can become a component that receives a magazine issue object. This makes the first issue and future issues easier to display without rewriting layout code.

3. Add a magazine archive section below the hero.

   Instead of only showing one hero, show a compact premium archive/grid of issues. Current issue can be featured; older issues can remain available as cards.

4. Improve issue CTAs.

   Use separate actions for:
   - Read issue
   - Download PDF
   - Share issue
   - View contents

5. Add issue contents metadata.

   Each issue can show a short table of contents or thematic highlights before the reader opens. This will make Muktibodh feel like a real monthly journal, not only a PDF file.

6. Clarify countdown states.

   Define three states:
   - Upcoming issue: countdown to launch.
   - Current issue: read/download active, countdown to next issue.
   - Archive issue: no countdown, only read/download/share.

7. Keep the reader stable.

   Any page flip, zoom, or scroll adjustments should be made in the shared `PremiumBookReader` only if they improve both magazine and book behavior. Magazine-specific behavior should be scoped carefully.

## Suggested Data Shape

```ts
interface Magazine {
  slug: string;
  name: string;
  nameHindi: string;
  issue: string;
  issueNumber: number;
  monthLabel: string;
  releaseDate: string;
  nextIssueDate?: string;
  status: 'upcoming' | 'current' | 'archive';
  cover?: string;
  pdf?: string;
  pageImages?: string[];
  highlights?: string[];
  highlightsHindi?: string[];
  description: string;
  descriptionHindi: string;
}
```

## Implementation Plan After Approval

1. Refactor magazine data.

   Update `src/lib/library-data.ts` so Muktibodh issue data contains enough information for current issue, archive, and future issue states.

2. Extract the banner.

   Move the current `MuktibodBanner` logic from `src/components/LibraryPage.tsx` into a reusable magazine-focused component, while preserving the current premium look.

3. Add archive cards.

   Render all magazine issues from `MAGAZINES`, with current/upcoming/archive states shown through subtle badges and actions.

4. Improve CTA behavior.

   Keep `Read`, `PDF`, and `Share` actions explicit. Avoid hiding the PDF behind the reader.

5. Test routes.

   Verify:
   - `/library`
   - `/library/magazine/muktibodh-june-2026/read`
   - PDF download route
   - mobile layout
   - desktop layout

6. Run build.

   Run `npm run build` and fix any TypeScript or route generation issues.

## Decisions Needed Before Implementation

- Should Muktibodh remain one large hero plus archive cards, or should it become a full magazine section with tabs?
- Should upcoming issues be visible before PDF/page images are ready?
- Should the next issue teaser show a designed cover placeholder or only text/countdown?
- Should magazine pages use exact page images only, or should future issues also support native article pages?
- Should each article inside Muktibodh eventually get its own shareable link?

## User Suggestions To Add

- Keep the hero + archive cards layout for Muktibodh. Do not introduce tabs until there are 6+ issues.
- Upcoming issues should be visible with countdown + teaser text only. Read/Download CTAs must stay disabled or hidden until both PDF and page images exist.
- The next issue teaser should use text/countdown only for now. Do not create a designed placeholder cover yet.
- Magazine pages should continue using exact page images only. Do not add native article-page rendering for now.
- Do not add per-article shareable links yet. Defer that until the archive has multiple issues.

## Proposed Working Rule

Do not change magazine UI/code until the suggestions are finalized and approved. Once approved, implement in small steps and verify on localhost before any push.
