## ADDED Requirements

### Requirement: API SHALL provide paginated user list endpoint

The system SHALL expose a `GET /api/users` endpoint that returns a paginated list of registered employees as JSON.

#### Scenario: Endpoint returns paginated users

- **WHEN** a client calls `GET /api/users?page=1&limit=50`
- **THEN** the endpoint returns HTTP 200 with a JSON object containing an array of users and pagination metadata

#### Scenario: Default pagination when parameters omitted

- **WHEN** a client calls `GET /api/users` without query parameters
- **THEN** the endpoint uses page=1 and limit=50 as defaults

#### Scenario: Response includes user object fields

- **WHEN** the endpoint returns user objects
- **THEN** each user object includes: id, employeeId, name, department, email, createdAt

#### Scenario: Response includes pagination metadata

- **WHEN** the endpoint returns results
- **THEN** the response includes: totalCount, page, pageSize, totalPages

### Requirement: API response format SHALL be consistent

The system SHALL return a well-defined JSON response structure for the user list endpoint.

#### Scenario: Success response structure

- **WHEN** the endpoint successfully retrieves users
- **THEN** the response follows the structure:

```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "totalCount": 500,
      "page": 1,
      "pageSize": 50,
      "totalPages": 10
    }
  }
}
```

#### Scenario: Error response when unauthorized

- **WHEN** a non-admin user calls the endpoint
- **THEN** the response is HTTP 403 with:

```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Admin access required"
}
```

### Requirement: API SHALL support filtering and sorting

The system SHALL accept optional query parameters to filter and sort user results.

#### Scenario: Department filter works

- **WHEN** a client calls `GET /api/users?department=Engineering`
- **THEN** the endpoint returns only users in the Engineering department

#### Scenario: Sort by field parameter

- **WHEN** a client calls `GET /api/users?sort=name` or `GET /api/users?sort=-createdAt`
- **THEN** the endpoint sorts results by the specified field (prefix with `-` for descending order)

#### Scenario: Multiple filters combine with AND logic

- **WHEN** a client calls `GET /api/users?department=Sales&sort=name`
- **THEN** the endpoint returns Sales department users sorted by name

### Requirement: API authentication SHALL be enforced

The system SHALL verify that only authenticated administrators can access the user list endpoint.

#### Scenario: Request without auth token is rejected

- **WHEN** a client calls `GET /api/users` without valid authentication
- **THEN** the endpoint returns HTTP 401 or 403 with an error message

#### Scenario: Admin role is validated

- **WHEN** the endpoint receives a request from an authenticated user
- **THEN** the endpoint checks if the user has `role: 'admin'` before returning data

### Requirement: API response performance SHALL be acceptable

The system SHALL return user list results within 300ms for typical queries.

#### Scenario: Pagination query performs efficiently

- **WHEN** a client requests users with pagination (page=1, limit=50)
- **THEN** the query completes in under 300ms even with 500 registered users
