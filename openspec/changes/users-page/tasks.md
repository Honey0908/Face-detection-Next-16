## 1. API Endpoint Setup

- [x] 1.1 Create GET /api/users route handler with basic structure
- [x] 1.2 Add authentication middleware to verify admin access
- [x] 1.3 Implement pagination logic (page, limit parameters with defaults)
- [x] 1.4 Add sorting support (sort parameter with field names and ascending/descending)
- [x] 1.5 Add optional department filter query parameter
- [x] 1.6 Write user query function to fetch from database with pagination and filters
- [x] 1.7 Format API response with success/error structure and pagination metadata
- [ ] 1.8 Test endpoint with curl or Postman (pagination, auth, filters)

## 2. Users List Page Component

- [x] 2.1 Create /users page.tsx as Server Component (no 'use client')
- [x] 2.2 Add authentication check - redirect non-admin users to login
- [ ] 2.3 Fetch initial user list from API (page=1, limit=50)
- [x] 2.4 Create UserTable component to display users (ID, name, department, email, created date)
- [x] 2.5 Create Pagination component with prev/next buttons and page numbers
- [x] 2.6 Add total user count display (e.g., "Showing page X of Y (N total users)")
- [x] 2.7 Create sortable column headers - clicking sorts by that field
- [x] 2.8 Implement URL query parameter handling for page, limit, and sort
- [x] 2.9 Add loading state/skeleton while data fetches (if using dynamic rendering)
- [ ] 2.10 Test page loads and displays users, pagination works, sorting works

## 3. Navigation Integration

- [x] 3.1 Update top navigation component (navbar) to include Users link
- [x] 3.2 Add "/users" route link to navigation menu
- [x] 3.3 Conditionally hide Users link for non-admin users (check role/session)
- [x] 3.4 Position Users link in navigation (after Scan, before other admin features)
- [ ] 3.5 Test navigation link renders and navigates correctly for admins
- [ ] 3.6 Test navigation link is hidden for non-admin users

## 4. Error Handling & Edge Cases

- [x] 4.1 Add error boundary on /users page to catch crashes
- [x] 4.2 Handle empty user list (show "No users registered" message)
- [x] 4.3 Handle API errors (network failures, server errors) with user-friendly messages
- [x] 4.4 Validate query parameters (invalid page/limit/sort handled gracefully)
- [ ] 4.5 Test authentication failures return 403 and redirect appropriately

## 5. Performance & Polish

- [ ] 5.1 Verify database query uses proper indexes on userId, name, createdAt
- [ ] 5.2 Test response time is under 300ms for typical queries (page 1, limit 50)
- [x] 5.3 Add aria labels and semantic HTML for accessibility
- [ ] 5.4 Test on mobile viewport - ensure table is readable or responsive
- [x] 5.5 Add TypeScript types for User and API response objects
- [ ] 5.6 Document /api/users endpoint in API reference (optional)
