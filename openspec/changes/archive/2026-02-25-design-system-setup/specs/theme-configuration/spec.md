# Theme Configuration Specification

## Overview

This specification defines the theme configuration for the design system using **Tailwind CSS v4**.

**Key Changes in Tailwind v4**:

- Theme tokens are defined in CSS using `@theme` directive instead of JavaScript config
- PostCSS uses `@tailwindcss/postcss` plugin instead of traditional `tailwindcss` plugin
- CSS custom properties in `@theme` automatically generate Tailwind utilities
- `tailwind.config.ts` is optional (used only for plugin compatibility and content optimization)

**Implementation Files**:

- `src/app/globals.css` - Contains `@theme` block with all design tokens
- `postcss.config.mjs` - PostCSS configuration with @tailwindcss/postcss
- `tailwind.config.ts` - Optional config for plugins (e.g., @tailwindcss/forms)
- `src/lib/design/tokens.ts` - Static TypeScript object for programmatic token access

---

## ADDED Requirements

### Requirement: Theme tokens SHALL be defined using Tailwind v4 @theme directive

The system SHALL use Tailwind CSS v4 which requires theme tokens to be defined in CSS using the `@theme` directive in `src/app/globals.css`.

All design tokens MUST be defined as CSS custom properties within the `@theme` block.

**Note**: Tailwind v4 changed from JavaScript configuration (tailwind.config.ts) to CSS-based theme definition.

#### Scenario: Defining custom colors

- **WHEN** configuring the theme
- **THEN** custom colors SHALL be defined in `@theme` block as `--color-{name}`

#### Scenario: TypeScript compatibility

- **WHEN** using Tailwind v4
- **THEN** theme tokens SHALL be CSS variables accessible via utility classes like `bg-primary`

### Requirement: PostCSS configuration SHALL use @tailwindcss/postcss plugin

The system SHALL configure PostCSS in `postcss.config.mjs` with:

- `@tailwindcss/postcss` plugin (Tailwind v4)

Configuration MUST be compatible with Next.js build process.

#### Scenario: Building CSS

- **WHEN** Next.js builds the application
- **THEN** PostCSS SHALL process Tailwind v4 directives

#### Scenario: Theme variable resolution

- **WHEN** using utility classes
- **THEN** Tailwind SHALL resolve them from @theme CSS variables

### Requirement: Globals CSS SHALL import Tailwind and define theme

The `src/app/globals.css` file SHALL include:

```css
@import 'tailwindcss';

@theme {
  /* Design tokens as CSS custom properties */
}
```

All theme tokens SHALL be defined within the `@theme` block as CSS custom properties.

#### Scenario: Loading Tailwind styles

- **WHEN** application starts
- **THEN** Tailwind v4 styles SHALL be imported via @import

#### Scenario: Custom global styles

- **WHEN** adding global CSS overrides
- **THEN** they SHALL be placed after the `@theme` block

### Requirement: Color palette SHALL be extensible

The theme configuration SHALL define color tokens in the `@theme` block:

- Primary palette colors: `--color-primary`, `--color-primary-hover`, `--color-secondary`, `--color-accent`, `--color-highlight`
- Semantic colors: `--color-success`, `--color-error`, `--color-warning`, `--color-info`
- Each semantic color MAY have variants (`-light`, `-dark` suffixes)

All colors MUST be in `@theme` block as CSS custom properties with hex values.

#### Scenario: Primary color with hover variant

- **WHEN** configuring primary color
- **THEN** it SHALL include `--color-primary` and `--color-primary-hover` variables

#### Scenario: Success color shades

- **WHEN** defining success color
- **THEN** it MAY include `--color-success-light`, `--color-success`, and `--color-success-dark` variants

### Requirement: Theme tokens SHALL be accessible via Tailwind utilities

The system SHALL make all theme tokens accessible through Tailwind utility classes.

Tailwind v4 automatically generates utilities from CSS custom properties defined in `@theme`.

#### Scenario: Using color in component

- **WHEN** a component needs primary color
- **THEN** it SHALL use `bg-primary` or `text-primary` utility classes

#### Scenario: Using color variants

- **WHEN** applying hover state
- **THEN** component SHALL use `hover:bg-primary-hover` utility class

### Requirement: TypeScript token access SHALL use static values

The system SHALL export theme tokens from `lib/design/tokens.ts` as static TypeScript object.

Export MUST provide type-safe access to design token values without runtime Tailwind dependency.

**Note**: Tailwind v4 does not support `resolveConfig` for theme extraction, so tokens are manually defined.

#### Scenario: Importing theme tokens in TypeScript

- **WHEN** a utility function needs to access a color value
- **THEN** it SHALL import `tokens` from `@/lib/design/tokens`

#### Scenario: Type safety for token access

- **WHEN** accessing `tokens.colors.primary.DEFAULT`
- **THEN** TypeScript SHALL provide autocomplete and type checking

### Requirement: Content paths SHALL be configured for CSS optimization

Tailwind v4 automatically discovers component files, but `tailwind.config.ts` MAY specify content paths for optimization:

- `./src/app/**/*.{js,ts,jsx,tsx,mdx}`
- `./src/components/**/*.{js,ts,jsx,tsx}`
- `./src/lib/**/*.{js,ts,jsx,tsx}`

**Note**: In Tailwind v4, content paths are optional as it uses automatic content detection, but explicit paths improve build performance.

#### Scenario: Building for production

- **WHEN** running `pnpm build`
- **THEN** final CSS SHALL only include used utility classes

#### Scenario: Adding new component

- **WHEN** a component is created in `src/components/`
- **THEN** its Tailwind classes SHALL be automatically detected and included

### Requirement: Theme changes SHALL update globally

Changes to `@theme` block in `globals.css` MUST propagate to:

- All Tailwind utility classes
- All components using those utilities

A single theme change SHALL update the entire application without code changes in components.

#### Scenario: Updating primary color

- **WHEN** `--color-primary` hex value is changed in @theme
- **THEN** all `bg-primary` utilities SHALL reflect new color without component code changes

#### Scenario: Adding new design token

- **WHEN** a new CSS variable is added to @theme
- **THEN** corresponding utility classes SHALL be available immediately

### Requirement: Plugins SHALL extend Tailwind functionality

The system MAY use Tailwind plugins for extended functionality:

- Form styling (`@tailwindcss/forms`)
- Custom utilities
- Additional variants

Plugins MUST be added to `plugins` array in optional `tailwind.config.ts`.

**Note**: Tailwind v4 supports legacy plugins when tailwind.config.ts is present.

#### Scenario: Forms plugin for styled inputs

- **WHEN** using `@tailwindcss/forms` plugin
- **THEN** it SHALL provide default form styling utilities

#### Scenario: Custom plugin configuration

- **WHEN** adding plugins
- **THEN** they SHALL be configured in tailwind.config.ts plugins array

### Requirement: Dark mode configuration SHALL be supported

The system SHALL support dark mode using `darkMode: 'class'` strategy.

Dark mode variants SHALL be available via `dark:` prefix in utility classes.

#### Scenario: Dark mode class strategy

- **WHEN** dark mode is enabled
- **THEN** adding `dark` class to html element SHALL activate dark variants

#### Scenario: Dark mode utility usage

- **WHEN** applying dark mode styles
- **THEN** components SHALL use `dark:bg-gray-900` pattern

### Requirement: Globals CSS SHALL import Tailwind layers

The `src/app/globals.css` file SHALL include:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Custom CSS variables and base styles MAY be added after Tailwind imports.

#### Scenario: Loading Tailwind styles

- **WHEN** application starts
- **THEN** all three Tailwind layers SHALL be available

#### Scenario: Custom global styles

- **WHEN** adding global CSS overrides
- **THEN** they SHALL be placed after `@tailwind utilities`

### Requirement: Design token categories SHALL be organized

The `@theme` block SHALL organize design tokens by category:

- **Colors**: `--color-{name}` (primary, secondary, accent, semantic colors)
- **Spacing**: `--spacing-{size}` or use Tailwind defaults
- **Radii**: `--radius-{size}` for border radius values
- **Shadows**: `--shadow-{size}` for box shadow utilities

Each category MUST use consistent naming convention for Tailwind utility generation.

#### Scenario: Color token naming

- **WHEN** defining a color
- **THEN** it SHALL use `--color-{name}` format

#### Scenario: Accessing design tokens

- **WHEN** using design tokens in components
- **THEN** they SHALL be accessed via Tailwind utilities like `bg-primary`, `shadow-md`, `rounded-lg`

### Requirement: Legacy config SHALL remain for plugin compatibility

The system MAY maintain a `tailwind.config.ts` file for:

- Plugin compatibility (e.g., @tailwindcss/forms)
- Content path optimization
- IDE autocomplete support

**Note**: In Tailwind v4, this config is optional but useful for backwards compatibility with plugins.

#### Scenario: Plugin configuration

- **WHEN** using Tailwind plugins requiring config
- **THEN** tailwind.config.ts SHALL be present with necessary settings

#### Scenario: Content path specification

- **WHEN** optimizing build performance
- **THEN** content paths MAY be specified in tailwind.config.ts
