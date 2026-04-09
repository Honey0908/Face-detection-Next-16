## Why

Currently, administrators have no centralized view of all registered users in the system. When new employees are registered via face recognition enrollment, there's no easy way to verify registrations, review employee details, or audit the user database. A dedicated users list page will provide admins visibility into who has been registered and their enrollment status.

## What Changes

- Create a new admin-only Users page (`/users`) to display all registered employees
- Display employee details: ID, name, department, email, registration date
- Show total registered user count on the page
- Add navigation menu item to access the users page from the main dashboard

## Capabilities

### New Capabilities

- `user-listing-page`: Server-rendered page displaying all registered users with employee details and filters
- `user-list-api`: API endpoint to fetch paginated list of registered users with optional filters

### Modified Capabilities

- `landing-page-navigation`: Add "Users" link to admin navigation menu to access the new users page

## Impact

- **New Pages**: `/users` page (Server Component)
- **New API Routes**: `GET /api/users` endpoint with pagination support
- **Database**: Query existing User model - no schema changes needed
- **UI Components**: New user table/list component, navigation updates
- **Admin Features**: Enable user audit and verification workflows
