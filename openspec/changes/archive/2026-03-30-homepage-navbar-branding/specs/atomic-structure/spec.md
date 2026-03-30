## MODIFIED Requirements

### Requirement: Organisms SHALL compose complex UI sections
Organism components MUST:

- Represent distinct sections of UI (header, footer, cards, navigation bars)
- May include application logic and state
- Import from atoms, molecules, and other organisms
- Can fetch data or interact with context/state

Organisms SHALL be reusable across multiple pages/templates.

#### Scenario: Header organism

- **WHEN** creating application header
- **THEN** it SHALL include navigation, user menu, and branding using molecules/atoms

#### Scenario: ScannerCard organism

- **WHEN** building face scan interface
- **THEN** it SHALL orchestrate webcam, buttons, and status display

#### Scenario: Navbar organism

- **WHEN** creating primary route navigation for application pages
- **THEN** it SHALL be implemented as an organism that exposes reusable branding and links to core workflows
