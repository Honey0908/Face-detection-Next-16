## ADDED Requirements

### Requirement: Color palette tokens SHALL be defined

The system SHALL define a primary color palette with exact hex values in the Tailwind config:

- Primary: #8100D1 (purple, main brand color)
- Secondary: #B500B2 (magenta, supporting brand color)
- Accent: #FF52A0 (pink, call-to-action elements)
- Highlight: #FFA47F (coral, success/emphasis states)

All color tokens MUST be accessible via Tailwind utility classes (e.g., `bg-primary`, `text-secondary`).

#### Scenario: Using primary color in component

- **WHEN** a component applies `className="bg-primary"`
- **THEN** the background color SHALL be #8100D1

#### Scenario: Using accent color for buttons

- **WHEN** a button uses `className="bg-accent hover:bg-accent/90"`
- **THEN** the button background SHALL be #FF52A0 with 90% opacity on hover

### Requirement: Semantic color tokens SHALL be provided

The system SHALL provide semantic color tokens for UI states:

- Success (green tones)
- Error (red tones)
- Warning (yellow/orange tones)
- Info (blue tones)
- Neutral (gray scale for text, backgrounds, borders)

Each semantic color MUST have variants for different use cases (text, background, border).

#### Scenario: Displaying error state

- **WHEN** a form field has an error
- **THEN** it SHALL use `text-error` and `border-error` classes

#### Scenario: Success notification

- **WHEN** lunch scan succeeds
- **THEN** notification SHALL use `bg-success` background

### Requirement: Spacing scale SHALL follow consistent base unit

The system SHALL define a spacing scale using a 4px base unit, extending Tailwind's default spacing scale where needed.

Custom spacing tokens MUST be added to `tailwind.config.ts` under `theme.extend.spacing`.

#### Scenario: Applying consistent spacing between elements

- **WHEN** a developer uses `space-y-4`
- **THEN** child elements SHALL have 16px (4 \* 4px) vertical spacing

#### Scenario: Custom spacing for scan interface

- **WHEN** scan UI needs specific spacing not in defaults
- **THEN** custom tokens (e.g., `spacing.scan`) SHALL be available

### Requirement: Typography tokens SHALL be defined

The system SHALL define typography design tokens including:

- Font families (sans, mono)
- Font sizes (text-xs through text-4xl)
- Font weights (light, normal, medium, semibold, bold)
- Line heights (leading-tight, leading-normal, leading-relaxed)
- Letter spacing (tracking-tight, tracking-normal, tracking-wide)

All typography tokens MUST be configured in `tailwind.config.ts`.

#### Scenario: Applying heading typography

- **WHEN** rendering a page title
- **THEN** it SHALL use `text-2xl font-semibold leading-tight`

#### Scenario: Monospace font for employee IDs

- **WHEN** displaying employee ID text
- **THEN** it SHALL use `font-mono` class

### Requirement: Shadow tokens SHALL define elevation system

The system SHALL define shadow tokens for UI elevation:

- `shadow-xs`: Subtle elevation (buttons, cards in normal state)
- `shadow-sm`: Low elevation (dropdown menus)
- `shadow-md`: Medium elevation (modals, dialogs)
- `shadow-lg`: High elevation (tooltips, popovers)
- `shadow-xl`: Maximum elevation (overlays)

Each shadow token MUST be customizable in `tailwind.config.ts`.

#### Scenario: Card elevation on hover

- **WHEN** a stat card is hovered
- **THEN** shadow SHALL change from `shadow-sm` to `shadow-md`

#### Scenario: Modal overlay shadow

- **WHEN** a modal dialog appears
- **THEN** it SHALL use `shadow-lg` for depth perception

### Requirement: Border radius tokens SHALL be provided

The system SHALL define border radius tokens:

- `rounded-none`: 0px (sharp corners)
- `rounded-sm`: 2px (subtle rounding)
- `rounded-md`: 4px (standard rounding)
- `rounded-lg`: 8px (prominent rounding)
- `rounded-full`: Full circle/pill shape

Custom radius values MAY be added for specific UI needs.

#### Scenario: Button with rounded corners

- **WHEN** rendering a primary button
- **THEN** it SHALL use `rounded-md` class

#### Scenario: Avatar images

- **WHEN** displaying employee profile picture
- **THEN** it SHALL use `rounded-full` for circular shape

### Requirement: Design tokens SHALL be type-safe

The system SHALL export TypeScript types for all design tokens from `lib/design/tokens.ts`.

Token types MUST be auto-generated from Tailwind config using `resolveConfig`.

#### Scenario: Accessing tokens in TypeScript

- **WHEN** a utility function needs a color value
- **THEN** it SHALL import from `@/lib/design/tokens` with full type safety

#### Scenario: Invalid token reference

- **WHEN** code references a non-existent token
- **THEN** TypeScript compiler SHALL produce an error

### Requirement: No hardcoded design values SHALL be allowed

The system SHALL enforce that all design values (colors, spacing, sizes) MUST use design tokens.

Direct hex codes, pixel values, or RGB values in component code SHALL be prohibited.

#### Scenario: Code review catches hardcoded color

- **WHEN** a developer commits `style={{ color: '#FF0000' }}`
- **THEN** ESLint SHALL flag this as an error

#### Scenario: Arbitrary Tailwind values

- **WHEN** a developer uses `className="w-[23px]"`
- **THEN** ESLint SHALL warn about non-standard token usage

### Requirement: Breakpoint tokens SHALL support responsive design

The system SHALL use Tailwind's default responsive breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Custom breakpoints MAY be added if needed for specific layouts.

#### Scenario: Mobile-first responsive layout

- **WHEN** building the scan interface
- **THEN** it SHALL use `md:` and `lg:` prefixes for tablet/desktop layouts

#### Scenario: Dashboard grid responsiveness

- **WHEN** admin dashboard loads on different screens
- **THEN** layout SHALL adapt using breakpoint-prefixed utilities
