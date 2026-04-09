## Context

The current system stores registered users in the database but provides no administrative interface to view, verify, or audit the user list. When employees are enrolled in the face recognition system, administrators must rely on backend logs or direct database queries to confirm registrations or troubleshoot issues. This is inefficient and error-prone.

The Users feature adds a dedicated admin-only page that leverages existing database queries and Next.js Server Components to provide a performant, real-time view of all registered employees.

## Goals / Non-Goals

**Goals:**

- Provide a searchable, paginated list of all registered users
- Display key employee information (ID, name, department, email, registration date)
- Enable administrators to verify enrollments and troubleshoot
- Use Server Components for data fetching and rendering (performance, minimal client JS)
- Integrate into existing navigation bar with clear access controls
- Support sorting by common fields (name, registration date)

**Non-Goals:**

- User editing or deletion (admin controls for user management)
- Batch import/export of user data (will be a separate feature)
- Real-time sync badges or status indicators
- Search by face descriptor or similarity matching

## Decisions

### 1. **Server Component for User List Page**

**Decision:** Use Next.js Server Component (no `'use client'` directive) for the `/users` page.

**Rationale:** User data display is static content that doesn't require client-side interactivity. Server Components reduce client-side JavaScript and allow direct database access server-side. Query caching (`cache: 'no-store'`) ensures data freshness.

**Alternatives Considered:**

- Client Component with client-side fetch: Would increase JS bundle and add waterfalls on page load
- Static generation (ISR): Not suitable since user data changes frequently

### 2. **Pagination via Query Parameters**

**Decision:** Implement pagination using `page` and `limit` query parameters (e.g., `/users?page=1&limit=50`).

**Rationale:** Simple to understand, URL-bookmarkable, and integrates cleanly with Server Component data fetching. Avoids complex state management.

**Alternatives Considered:**

- Cursor-based pagination: More efficient at scale but adds complexity
- Infinite scroll: Would require Client Component and useEffect

### 3. **API Route for Flexibility**

**Decision:** Create a dedicated `GET /api/users` endpoint for fetching user data.

**Rationale:** Separates data layer from presentation. Allows dashboard and other features to reuse the same endpoint. Makes testing easier.

**Query params:** `?page=1&limit=50&sort=name&department=Engineering`

### 4. **UI: Table Component with Sorting**

**Decision:** Use a simple HTML table with column headers that allow sorting by name, department, and registration date.

**Rationale:** Tables are accessible, familiar to admins, and easy to read. No heavy charting/visualization library needed.

**Alternatives Considered:**

- Data grid library: Overkill for feature scope, adds dependency
- Card layout: Less scannable for large datasets

### 5. **Authentication & Access Control**

**Decision:** Protect `/users` route and `/api/users` endpoint with admin-only middleware.

**Rationale:** User data is sensitive. Only administrators should access the list.

**Implementation:** Middleware checks session/JWT for `role: 'admin'` before allowing access.

### 6. **No Real-Time Updates**

**Decision:** Page refresh on user demand; no WebSocket or polling for live updates.

**Rationale:** User enrollment is infrequent. Real-time sync adds complexity with marginal UX benefit. Admins can refresh the page if needed.

## Risks / Trade-offs

| Risk                                                                                     | Mitigation                                                                                                     |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Performance at scale** → If dataset > 5000 users, pagination query could be slow       | Use database indexes on `employeeId`, `name`, `createdAt`. Implement query optimization. Monitor slow queries. |
| **Missing email field** → If email is optional but displayed, some rows show blank       | Choose sensible default (e.g., "—") or mark optional fields clearly.                                           |
| **Admin data exposure** → Sensitive info like email visible if admin account compromised | Ensure HTTPS, implement rate limiting on API, add audit logging on `/users` and `/api/users` access.           |
| **Stale UI after registration** → New users don't appear until page refresh              | Document that page auto-updates in future. For now, users can refresh manually.                                |

## Migration Plan

**Deployment Steps:**

1. Create database indexes on User model fields used in sorting/filtering
2. Deploy API route (`GET /api/users`)
3. Deploy Server Component page (`/users`)
4. Add navigation menu item in layout (link to `/users`)
5. Test admin access; verify non-admin users are redirected

**Rollback:** Remove `/users` route, remove API endpoint, revert navigation.

## Open Questions

- Should non-admin users be able to view their own profile? (Scope for future feature)
- Do we need export-to-CSV immediately, or is it acceptable as a future enhancement?
- Should department filtering be a separate control or part of a global search bar?
