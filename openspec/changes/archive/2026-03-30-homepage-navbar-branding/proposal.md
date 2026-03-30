## Why

The landing experience still reflects starter scaffold content and does not provide clear entry points for the two core user journeys: lunch scanning and employee registration. This should be addressed now so office users and admins can reach primary actions quickly with consistent product branding.

### Problem Statement

The current home page does not communicate the LunchTrack purpose, and navigation to key flows is not presented as a persistent top-level UI section. This increases friction for daily use and creates inconsistency with the intended smart-office product identity.

## What Changes

- Replace starter landing content with a product-oriented homepage including hero copy, action cards, and a short workflow section.
- Add a reusable top navigation organism with routes to home, scan, and register flows.
- Update root metadata (title/description) to reflect LunchTrack branding.
- Export the new navigation organism from the shared component index for consistent reuse.

### Scope

- In scope:
  - Homepage content structure and calls-to-action.
  - Primary navigation UI and route links.
  - Product metadata text updates.
- Out of scope:
  - Face detection, matching, and scan-state logic.
  - API routes, database schema, and analytics computation.
  - Authentication/authorization behavior changes.

### Non-goals

- Do not alter lunch-record business rules.
- Do not introduce new backend dependencies.
- Do not modify registration or scan processing logic.

## Capabilities

### New Capabilities
- `landing-page-navigation`: Provide a branded homepage and persistent top navigation that expose primary scan and registration actions.

### Modified Capabilities
- `atomic-structure`: Extend organism examples/usage to include a reusable navigation organism used by top-level pages.

## Impact

- Affected code:
  - `src/app/page.tsx`
  - `src/app/layout.tsx`
  - `src/components/organisms/Navbar.tsx`
  - `src/components/index.ts`
- APIs and data model:
  - No API contract changes.
  - No database schema changes.
- Business rules:
  - One lunch per employee per day remains unchanged.
  - Admin registration workflow remains unchanged.
