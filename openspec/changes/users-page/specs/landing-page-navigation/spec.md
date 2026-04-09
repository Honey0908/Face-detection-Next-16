## ADDED Requirements

### Requirement: Primary navigation SHALL include Users admin link

The system SHALL add a "Users" menu item to the primary navigation that links to the admin users list.

#### Scenario: Users link appears in navigation for admins

- **WHEN** an authenticated admin views the navigation bar
- **THEN** a "Users" link is displayed that navigates to `/users`

#### Scenario: Users link is properly positioned

- **WHEN** the navigation bar renders
- **THEN** the "Users" link appears after the "Scan" link and before or alongside other admin features

#### Scenario: Users link is hidden for non-admins

- **WHEN** a non-admin user views the navigation bar
- **THEN** the "Users" link is not displayed or is disabled
