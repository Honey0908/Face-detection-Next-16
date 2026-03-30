## ADDED Requirements

### Requirement: Components SHALL be organized in atomic hierarchy

The system SHALL organize components in `/src/components/` using atomic design structure:

- `atoms/`: Basic building blocks (Button, Input, Icon, Badge, Avatar)
- `molecules/`: Simple combinations (SearchField, FormField, StatCard)
- `organisms/`: Complex UI sections (Header, ScannerCard, EmployeeTable)
- `templates/`: Page layouts (DashboardTemplate, ScanTemplate)
- `pages/`: Page-specific implementations (if needed outside `/src/app/`)

Each level MUST only import from lower levels (organisms import molecules/atoms, molecules import atoms).

#### Scenario: Creating a button atom

- **WHEN** a new Button component is created
- **THEN** it SHALL be placed in `components/atoms/Button/Button.tsx`

#### Scenario: Building a form field molecule

- **WHEN** creating a form field with label and input
- **THEN** it SHALL be in `components/molecules/FormField/` and import from `atoms/`

### Requirement: Each component SHALL follow consistent file structure

Components MUST follow this file structure:

```
ComponentName/
├── ComponentName.tsx      # Main component
├── ComponentName.test.tsx # Unit tests (optional)
├── index.ts              # Re-export
└── types.ts              # Component-specific types (if needed)
```

The index.ts file MUST re-export the main component for cleaner imports.

#### Scenario: Importing a Button component

- **WHEN** a developer imports Button
- **THEN** they SHALL use `import { Button } from '@/components/atoms/Button'`

#### Scenario: Component with complex types

- **WHEN** a component has multiple type definitions
- **THEN** types SHALL be in separate `types.ts` file

### Requirement: Atoms SHALL be pure and reusable

Atom components MUST be:

- Single-purpose UI elements
- Free of business logic
- Stateless (or minimal internal state for UI only)
- Accept props for variants, sizes, and styling
- Use design tokens exclusively

Atoms SHALL NOT import from molecules or organisms.

#### Scenario: Button atom with variants

- **WHEN** Button component is created
- **THEN** it SHALL accept `variant` prop (primary, secondary, accent) using design tokens

#### Scenario: Input atom with size options

- **WHEN** Input component is created
- **THEN** it SHALL accept `size` prop (sm, md, lg) with token-based sizing

### Requirement: Molecules SHALL combine atoms meaningfully

Molecule components MUST:

- Combine 2+ atoms into functional units
- Handle simple component-level logic
- Use composition over complex props
- Import only from atoms/

Molecules SHALL NOT handle application state or data fetching.

#### Scenario: SearchField molecule

- **WHEN** creating a search field
- **THEN** it SHALL combine Input atom + Icon atom + Button atom

#### Scenario: FormField with label and validation

- **WHEN** creating a form field
- **THEN** it SHALL combine Label atom + Input atom + ErrorText atom

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

### Requirement: Templates SHALL define page layouts

Template components MUST:

- Define page structure and layout
- Position organisms and molecules
- Handle responsive layout logic
- Be content-agnostic (accept children or slots)

Templates SHALL NOT contain hardcoded content.

#### Scenario: Dashboard template

- **WHEN** creating admin dashboard layout
- **THEN** it SHALL define header, sidebar, main content positions

#### Scenario: Scan layout template

- **WHEN** creating scan page layout
- **THEN** it SHALL accept scanner component and status areas as children

### Requirement: Import paths SHALL use TypeScript aliases

All component imports MUST use TypeScript path alias `@/components/`.

Relative imports (e.g., `../../atoms/Button`) SHALL be avoided.

#### Scenario: Importing Button in a molecule

- **WHEN** FormField molecule imports Button
- **THEN** it SHALL use `import { Button } from '@/components/atoms/Button'`

#### Scenario: Cross-organism imports

- **WHEN** an organism imports another organism
- **THEN** it SHALL use `@/components/organisms/ComponentName`

### Requirement: Components SHALL use consistent naming conventions

Component naming MUST follow:

- **Files**: PascalCase matching component name (`Button.tsx`, `SearchField.tsx`)
- **Folders**: PascalCase matching component name (`Button/`, `ScannerCard/`)
- **Exports**: Named exports using component name
- **Props types**: `{ComponentName}Props` interface

#### Scenario: Button component naming

- **WHEN** creating Button component
- **THEN** file SHALL be `Button.tsx`, type SHALL be `ButtonProps`

#### Scenario: Multi-word component

- **WHEN** creating SearchField component
- **THEN** folder SHALL be `SearchField/`, file SHALL be `SearchField.tsx`

### Requirement: Server and Client components SHALL be clearly distinguished

Components MUST:

- Default to Server Components (no `'use client'` directive)
- Use `'use client'` directive only for interactive/stateful components
- Place `'use client'` at the top of the file if needed
- Document in comments why client rendering is needed

#### Scenario: Button atom as Client Component

- **WHEN** Button needs onClick handlers
- **THEN** file SHALL start with `'use client'` directive

#### Scenario: StatCard as Server Component

- **WHEN** StatCard only displays data
- **THEN** it SHALL NOT have `'use client'` directive

### Requirement: Component props SHALL use TypeScript interfaces

All components MUST:

- Define props using TypeScript `interface` or `type`
- Extend appropriate HTML element props when applicable
- Export props types for reusability
- Use `React.ComponentProps<typeof Component>` for composition

#### Scenario: Button props extending HTML attributes

- **WHEN** defining ButtonProps
- **THEN** it SHALL extend `ButtonHTMLAttributes<HTMLButtonElement>`

#### Scenario: Reusing props in another component

- **WHEN** a wrapper component needs same props
- **THEN** it SHALL import and extend the base props type

### Requirement: Composition utilities SHALL be provided

The system SHALL provide utility functions in `lib/utils.ts`:

- `cn()`: Merge Tailwind classes with conflict resolution
- Component composition helpers as needed

#### Scenario: Merging className props

- **WHEN** a component accepts custom className
- **THEN** it SHALL use `cn(baseClasses, customClassName)` to merge

#### Scenario: Conditional classes

- **WHEN** applying variant-based classes
- **THEN** component SHALL use `cn()` with conditional objects
