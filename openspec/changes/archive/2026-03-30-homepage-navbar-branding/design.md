## Context

The current root page still reflects starter content and does not act as a clear gateway to the two highest-frequency workflows: scanning lunch and registering employees. Current edits introduce a new navigation organism and a product-focused landing page. These updates are UI-shell concerns and should not alter face-recognition flow, API behavior, or persistence.

## Goals / Non-Goals

**Goals:**
- Provide persistent top-level navigation for home, scan, and register routes.
- Replace default starter content on the landing page with LunchTrack-specific messaging and action paths.
- Keep the change server-first and lightweight in Next.js by using non-interactive Server Components.
- Preserve existing route structure and downstream page contracts.

**Non-Goals:**
- No changes to face detection, matching, or scan-state logic.
- No API or database schema updates.
- No introduction of authentication or authorization changes.

## Decisions

### Decision 1: Introduce a reusable Navbar organism
- Choice: Add a dedicated organism-level navigation component and export it from the shared component barrel.
- Rationale: Keeps navigation reusable and consistent across pages while fitting existing atomic hierarchy conventions.
- Alternative considered: Keep navigation markup inline in each page. Rejected because it duplicates markup and increases maintenance.

### Decision 2: Implement homepage as a static Server Component
- Choice: Keep landing page content static and render with server components (no client hooks or local state).
- Rationale: Minimizes client bundle impact and aligns with project server-first guidance.
- Alternative considered: Client-rendered landing page for possible animations. Rejected for now because no interaction requires client runtime.

### Decision 3: Update global metadata in root layout
- Choice: Set app-level title and description to LunchTrack branding in root layout metadata.
- Rationale: Ensures browser title/share metadata match product identity across routes.
- Alternative considered: Per-page metadata only. Rejected to avoid duplication and inconsistent defaults.

## Risks / Trade-offs

- [Risk] The new Navbar file location may diverge from strict organism folder structure conventions.
  - Mitigation: Document modified atomic-structure requirement and optionally follow up with folder/index normalization.

- [Risk] Homepage copy and visual emphasis might require later UX tuning after user feedback.
  - Mitigation: Keep component boundaries clear so content and style can be iterated without route-level rewrites.

- [Risk] Navigation links can drift if routes change later.
  - Mitigation: Keep links centralized in one reusable organism.

## Migration Plan

- Create and export Navbar organism.
- Update landing page to use Navbar and product-focused sections.
- Update root metadata values.
- Verify route links for home, scan, and register in desktop and mobile widths.
- Rollback strategy: revert these UI-level files only; no data migration needed.

## Open Questions

- Should Navbar be mounted in root layout for all pages now, or remain homepage-only until broader shell standardization?
- Should the organism be moved into a dedicated folder with local index/types files in a follow-up structural cleanup?
