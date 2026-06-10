# Refactor `server/index.ts` And Large Pages/Panels

## Goal

Reduce iteration cost and merge risk by splitting the largest backend/frontend modules into smaller domain-oriented files without changing public behavior, route contracts, or persisted content structure.

## Why This Refactor Now

- `server/index.ts` currently mixes runtime config, content-store persistence, auth, media, posts, analytics, monitoring, screenings, talks import, admin content APIs, and SSE in one file (`server/index.ts:1`, `server/index.ts:3291`).
- The largest UI modules each carry multiple responsibilities:
  - `src/pages/Workspace.tsx:1` is a shell, dashboard, notifications center, moderation queue, monitoring surface, and panel router in one file.
  - `src/workspace/ScreeningsAdminPanel.tsx:434` mixes content loading, schedule editing, library CRUD, metadata scraping, AI completion, submission review, and publish orchestration.
  - `src/pages/Screenings.tsx:314` mixes derived analytics, history building, library filtering, watched-state sync, source submissions, and multiple display modes.
  - `src/pages/Talks.tsx:285` mixes archive transforms, filters, hero/schedule/sidebar rendering, and modal orchestration.

## Refactor Principles

- Keep endpoint URLs, response shapes, local storage keys, content keys, and published payload shapes stable during the refactor.
- Prefer **extract-and-wire** over redesign: move code first, then simplify behavior in later passes.
- Split by **domain responsibility**, not by arbitrary file size.
- Each step must be shippable on its own and pass the existing `npm run lint` check.
- Do not mix architectural movement with unrelated product behavior changes.

## Target Architecture

### Backend target structure

```text
server/
  index.ts                    # thin bootstrap only
  app.ts                      # express app factory + shared middleware wiring
  config/runtime.ts           # env parsing and runtime config
  db/pool.ts                  # db pool + schema bootstrap helpers
  store/content-store.ts      # load/save/mutate content store
  store/content-events.ts     # SSE client registry + broadcast helpers
  routes/
    auth.ts
    users.ts
    posts.ts
    content.ts
    media.ts
    analytics.ts
    monitoring.ts
    screenings.ts
    feedback.ts
    talks.ts
    realtime.ts
  services/
    auth.ts
    posts.ts
    screenings.ts
    analytics.ts
    monitoring.ts
    media-scraper.ts
    ai.ts
  utils/
    http.ts
    validation.ts
    rate-limit.ts
```

### Frontend target structure

```text
src/
  pages/
    screenings/
      ScreeningsPage.tsx
      sections/
      hooks/
      utils/
    talks/
      TalksPage.tsx
      sections/
      hooks/
      utils/
    workspace/
      WorkspacePage.tsx
      components/
      hooks/
      registry.ts
  workspace/
    screenings/
      ScreeningsAdminPanel.tsx
      components/
      hooks/
      utils/
    plaza/
      PlazaAdminPanel.tsx
      hooks/
    gaming/
      GamingAdminPanel.tsx
      hooks/
```

## Implementation Phases

### Phase 0: Baseline and guardrails

Purpose: reduce refactor risk before moving files.

Tasks:

1. Create a lightweight dependency map for:
   - `server/index.ts`
   - `src/pages/Workspace.tsx`
   - `src/pages/Screenings.tsx`
   - `src/workspace/ScreeningsAdminPanel.tsx`
   - `src/pages/Talks.tsx`
2. Freeze current contracts:
   - API paths under `/api/*`
   - content entry keys such as `screenings.library`, `plaza.main`, `talks.main`
   - workspace panel props and auth assumptions
3. Add a simple manual regression checklist document next to the implementation work.

Success criteria:

- There is a clear list of exported helpers/components to move.
- No production behavior changes yet.

### Phase 1: Split `server/index.ts` into bootstrap + route registration

Purpose: reduce the biggest merge hotspot first while preserving route behavior.

Tasks:

1. Extract runtime/db/store/event helpers from `server/index.ts`:
   - runtime config/env parsing
   - database/schema bootstrap
   - content-store load/save/mutate
   - SSE client registry/broadcast
2. Introduce a shared app context object passed into route modules, for example:

```ts
type AppContext = {
  runtimeConfig: RuntimeConfig;
  db: Pool | null;
  contentStore: ContentStoreService;
  events: ContentEventBus;
  auth: AuthService;
  // existing helpers reused by routes
};
```

3. Move route groups out incrementally, in this order:
   - `routes/content.ts`
   - `routes/realtime.ts`
   - `routes/auth.ts`
   - `routes/users.ts`
   - `routes/posts.ts`
   - `routes/media.ts`
   - `routes/analytics.ts`
   - `routes/monitoring.ts`
   - `routes/screenings.ts`
   - `routes/talks.ts`
4. Keep `server/index.ts` as the startup entry that only:
   - loads config
   - constructs services/context
   - registers middleware
   - mounts route modules
   - starts timers/listeners

Success criteria:

- `server/index.ts` becomes a thin composition root.
- All existing endpoints remain unchanged.
- `npm run lint` still passes.

Risk controls:

- Move one route group at a time and validate affected endpoints before the next extraction.
- Keep old helper names when practical to reduce churn.

### Phase 2: Extract shared screening domain utilities

Purpose: reduce duplication before splitting the screenings page and admin panel further.

Tasks:

1. Consolidate pure screening helpers into `src/content/screeningUtils.ts` and adjacent files:
   - date parsing/formatting
   - source status/timing labels
   - movie/source transforms
   - dedupe helpers
   - schedule date helpers
2. Remove duplicated logic from:
   - `src/pages/Screenings.tsx:94`
   - `src/workspace/ScreeningsAdminPanel.tsx:125`
3. Keep server-only screening helpers separate from browser helpers when they touch persistence or Express.

Success criteria:

- Both the public screenings page and the admin panel depend on the same pure helpers for shared concepts.
- Behavior remains unchanged aside from the already accepted fixes.

### Phase 3: Split `src/pages/Screenings.tsx`

Purpose: isolate read-only presentation and view-model logic.

Tasks:

1. Create a page-level container component that only owns top-level state and data acquisition.
2. Extract pure/derived logic into hooks and utils:
   - `useScreeningRecords`
   - `useScreeningLibraryFilters`
   - `useWatchedSources`
   - `useSourceSubmissions`
3. Extract sections/components:
   - `ScreeningsHeroSection`
   - `ScreeningsStatsSection`
   - `ScreeningHistorySection`
   - `ScreeningLibrarySection`
   - `ScreeningSourceDetailPanel`
   - `ScreeningSubmissionsSection`
4. Keep route/export stable by re-exporting from the current page entry if needed.

Success criteria:

- `src/pages/Screenings.tsx` becomes a thin container/orchestrator.
- Most JSX-heavy sections live in focused components.

### Phase 4: Split `src/workspace/ScreeningsAdminPanel.tsx`

Purpose: isolate the heaviest admin workflow into domain subpanels.

Tasks:

1. Extract a shared admin content hook:
   - load entry data
   - track entry meta/version
   - commit batch operations
2. Extract subpanels/components:
   - `NextScreeningEditor`
   - `ScreeningLibraryManager`
   - `ScreeningMetadataScrapePanel`
   - `ScreeningAiCompletionPanel`
   - `ScreeningSubmissionReviewPanel`
   - `ScreeningArchiveActions`
3. Move stateful logic into hooks where it represents workflows:
   - `useScreeningsAdminContent`
   - `useMediaScraperWorkbench`
   - `useScreeningPublishActions`
4. Keep the top-level panel as a layout shell plus workflow wiring.

Success criteria:

- The panel can be edited by multiple contributors without touching one giant file.
- Scraping, review, and publish behavior become independently testable.

### Phase 5: Split `src/pages/Workspace.tsx`

Purpose: separate shell/layout concerns from dashboard and panel registry concerns.

Tasks:

1. Extract workspace shell/layout pieces:
   - resizable layout primitives
   - header/toolbar
   - left nav / panel switcher
2. Extract dashboard sections:
   - moderation queue
   - monitoring summary
   - analytics snapshot
   - activity/event feed
3. Move panel registry into a dedicated module, e.g. `src/pages/workspace/registry.ts`, mapping panel ids to labels/icons/components.
4. Move shared workspace hooks out:
   - layout persistence
   - event polling / refresh
   - pending submission normalization

Success criteria:

- `Workspace.tsx` becomes mostly state orchestration and panel composition.
- Adding a new admin panel becomes a registry update instead of a large-file edit.

### Phase 6: Split `src/pages/Talks.tsx` and tighten view types

Purpose: reduce page complexity and align data transformations with modal usage.

Tasks:

1. Extract page utilities/hooks:
   - `useTalkArchiveFilters`
   - `useTalkCards`
   - `talks/utils.ts` for date/year/provider/duration helpers
2. Extract presentation sections:
   - hero/live card section
   - upcoming schedule section
   - archive folders section
   - archive full-screen view
   - sidebar recent/top/uploads sections
3. Introduce a dedicated UI type for the modal/card view instead of relying on `any` or ad hoc shape extension.

Success criteria:

- `Talks.tsx` becomes a container instead of a monolith.
- Talk transformations can evolve without editing the page and modal at the same time.

## Recommended Execution Order

1. Phase 1: `server/index.ts`
2. Phase 2: shared screening utils
3. Phase 4: `ScreeningsAdminPanel`
4. Phase 3: `Screenings.tsx`
5. Phase 5: `Workspace.tsx`
6. Phase 6: `Talks.tsx`

Rationale:

- Backend split removes the highest central merge hotspot first.
- Screening utilities/admin split pays down the most duplicated domain complexity next.
- `Workspace.tsx` should move after panel boundaries become cleaner.

## Suggested Commit / PR Slicing

Use small, reviewable slices instead of one giant refactor:

1. `refactor(server): extract content store and route registration`
2. `refactor(screenings): extract shared domain utils`
3. `refactor(workspace): split screenings admin panel workflows`
4. `refactor(screenings): split public page sections and hooks`
5. `refactor(workspace): extract layout shell and panel registry`
6. `refactor(talks): split page sections and archive hooks`

## Validation Checklist Per Phase

### Backend

- `npm run lint`
- Manual smoke checks:
  - auth login/me/logout
  - content bootstrap/content publish
  - SSE refresh after publish
  - screenings source submission + review
  - talks JSON import
  - analytics visit ingestion

### Frontend

- `npm run lint`
- Manual smoke checks:
  - Workspace panel switching
  - Screenings page filters, library details, watched sync, submissions
  - Screenings admin next/library/review/scrape flows
  - Talks archive filters, modal open/close, upcoming cards
  - Plaza/Gaming panels still load and publish after workspace shell split

## Risks And Mitigations

### Risk: accidental contract drift while moving server routes

Mitigation:

- Move route code verbatim first.
- Keep payload parsing and response shape untouched during extraction.

### Risk: circular imports between page hooks, shared utils, and content defaults

Mitigation:

- Keep pure domain helpers in leaf modules that depend only on `types.ts`.
- Do not import React components into hooks/utils layers.

### Risk: workspace split breaks panel-local state or auth assumptions

Mitigation:

- Introduce a panel registry only after extracting stable props.
- Keep panel signatures unchanged until the shell split is complete.

### Risk: refactor becomes too broad and stalls feature delivery

Mitigation:

- Timebox each phase.
- Merge each phase independently after lint + manual smoke checks.
- Defer behavior cleanup to follow-up PRs once file movement lands.

## Out Of Scope For This Refactor

- Changing database schema or content payload schema design.
- Rewriting routing from hash routing to a router library.
- Replacing SSE with WebSocket.
- Redesigning admin UX while files are being split.

## First Implementation Slice

If implementation starts immediately, begin with this exact slice:

1. Extract `server/config/runtime.ts`, `server/store/content-store.ts`, and `server/store/content-events.ts`.
2. Create `server/routes/content.ts` and `server/routes/realtime.ts`.
3. Keep all route handlers otherwise unchanged.
4. Run `npm run lint`.
5. Smoke-check publish + bootstrap + SSE refresh.

This slice is the highest leverage/lowest ambiguity starting point and unlocks the later page/panel splits.
