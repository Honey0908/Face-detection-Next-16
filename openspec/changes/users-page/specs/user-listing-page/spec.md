## ADDED Requirements

### Requirement: Users listing page SHALL display all registered employees

The system SHALL render a protected admin-only page at `/users` that displays a paginated list of all registered employees with their core details.

#### Scenario: Page loads with first page of users

- **WHEN** an authenticated admin navigates to `/users`
- **THEN** the page displays the first page of registered users (default 50 per page)

#### Scenario: User details are visible

- **WHEN** the users list is rendered
- **THEN** the page displays: employee ID, name, department, email, and registration date for each user

#### Scenario: Unauthorized access is denied

- **WHEN** a non-admin user attempts to access `/users`
- **THEN** the user is redirected to login or shown a 403 permission denied message

### Requirement: Users list SHALL support pagination

The system SHALL allow administrators to navigate through pages of user records using pagination controls and query parameters.

#### Scenario: Pagination controls are visible

- **WHEN** more than 50 users exist in the system
- **THEN** pagination controls (prev/next buttons, page numbers) are displayed

#### Scenario: Page parameter controls results

- **WHEN** an admin accesses `/users?page=2`
- **THEN** the page displays users 51-100, not users 1-50

#### Scenario: Limit parameter adjusts page size

- **WHEN** an admin accesses `/users?page=1&limit=100`
- **THEN** the page displays 100 users per page instead of the default 50

### Requirement: Users list SHALL display total user count

The system SHALL show the total number of registered employees on the page.

#### Scenario: Total count is shown

- **WHEN** the users list page renders
- **THEN** the page displays text like "Showing page 1 of X (N total users)"

### Requirement: Users list SHALL support sorting

The system SHALL allow administrators to sort the user list by name, department, or registration date.

#### Scenario: Default sort by name ascending

- **WHEN** the page first loads
- **THEN** users are sorted alphabetically by name (A-Z)

#### Scenario: Clickable column headers enable sorting

- **WHEN** an admin clicks the "Registered Date" column header
- **THEN** the page re-sorts users by registration date (newest first on first click, oldest first on second click)

#### Scenario: Sort preference persists in URL

- **WHEN** an admin sorts by department
- **THEN** the URL updates to reflect the sort parameter (e.g., `/users?sort=department`)

### Requirement: Users list page uses Server Components

The system SHALL render the users list as a Next.js Server Component for data fetching efficiency.

#### Scenario: Data fetches server-side without client-side waterfall

- **WHEN** the `/users` page loads
- **THEN** the user data is fetched directly from the database in the Server Component, not via client-side fetch

#### Scenario: Page shows fresh data on every load

- **WHEN** an admin refreshes the `/users` page
- **THEN** the latest user data from the database is displayed (not cached from previous session)
