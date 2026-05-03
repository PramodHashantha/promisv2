# Frontend Governance Standard

This is the single source of truth for frontend design, implementation, and review standards.

## Purpose

- Keep frontend code consistent across features and teams.
- Improve maintainability and onboarding speed.
- Reduce regressions caused by mixed patterns.

## Source of Truth Priority

If rules conflict, apply this order:

1. `docs/standards/frontend-governance.md` (this file)
2. `docs/standards/naming-conventions.md`
3. `docs/guides/hooks-and-context-usage.md`

## Architecture Rules

### API Layer

- Do not call `fetch` or `axios` directly in components.
- All endpoint calls must live in API service files.
- Use the API client wrappers for auth headers, refresh behavior, and error handling.

Preferred structure:

- `src/api/client/*` for HTTP client, request manager, query client
- `src/api/services/*` for domain endpoint files

- Existing `src/utils/api/*` files are transitional only and should be migrated to `src/api/*`.
- Do not create new files under `src/utils/api`.

### Hooks and Context

- Use project hooks for common concerns (`useApi`, `useStatus`, `useNotification`, `useConfirmation`, network hooks).
- Keep context values stable (memoize when needed) and expose consumer hooks (`useAuth`, `useNetwork`, etc.).
- Do not use hooks outside their provider tree.
- Use `useApi` for endpoint-driven requests to preserve loading/error/cancel behavior consistency.

## UI and Styling Rules

- Use semantic theme tokens (brand/background/text/state tokens).
- Reuse shared components before creating new UI primitives.
- Do not use emoji in UI; use icon libraries/utilities.
- Prefer Tailwind utility classes for feature-level styling.

### Modals

- **Implementation**: All modals must use `createPortal(..., document.body)` to ensure proper z-index and overflow behavior.
- **Overlay**: Use the `.modal-overlay-new` class for the backdrop.
- **Content**: Use the `.modal-content-new` class for the modal container.
- **Structure**: Follow this standard hierarchy:
    - `.modal-close`: Top-right exit button (usually `✕`).
    - `.modal-title`: Header for the modal.
    - `.modal-body`: Main content area (forms, tables, etc.).
    - `.modal-actions`: Footer area containing buttons (use `.danger-actions` and `.save-actions` for alignment).
- **Width**: Prefer utility classes like `max-w-lg` or `max-w-md`. Avoid extremely wide modals unless displaying complex data tables.
- **Accessibility**: Always include `role="dialog"` and `aria-modal="true"` on the overlay.

### Color System

- Use neutral tokens for 85-95% of surfaces.
- Allowed surface tokens: `brand-background`, `brand-surface`, `brand-surface-elevated`, `brand-muted`.
- Use brand color for primary actions, active states, and key highlights only.
- Do not use brand color for large background surfaces.
- Text hierarchy:
  - `brand-text` for headings
  - `brand-text-secondary` for standard body text
  - `brand-text-muted` for hints/helper text

### Spacing and Layout

- Use a 4px spacing system only (`4, 8, 12, 16, 20, 24, 32, 40...`).
- Do not use arbitrary spacing values (for example `13px`, `22px`).
- Standard container paddings:
  - cards: `16px` or `20px`
  - major sections: `24px` or `32px`
- Align sibling elements to a consistent grid.
- Prefer whitespace and grouping over excessive borders.

### Component Consistency

- Buttons should use consistent height and padding across the app.
- Inputs should align with button height and shared radius.
- Cards should use consistent radius and border treatment.

### Elevation and Interaction

- Elevation levels:
  - level 0: app background
  - level 1: surface/cards
  - level 2: hover/dropdown/popover
  - level 3: overlay/modal
- Prefer subtle color elevation over heavy shadows.
- Interaction states:
  - hover: small background/elevation change
  - active: slight scale (`0.98`) when appropriate
  - focus: visible focus ring or border
  - disabled: lowered opacity (`0.4-0.6`) and non-interactive behavior

### Dark Mode

- Preserve information hierarchy from light mode.
- Maintain clear layer contrast: background < surface < elevated.
- Avoid pure white text everywhere; use semantic text tokens.

### Typography and Motion

- Limit font scale variants to a small, predictable set (about 4-6 sizes).
- Keep line-height consistent for readability.
- Avoid excessive font-weight changes.
- Animation duration should usually stay in `150-250ms`.
- Use shimmer/skeleton effects for loading only.

### Charts and Data Visuals

- Use chart palette tokens (`--chart-*`) for series colors.
- Avoid single-color-only charts for multi-series data.
- Maintain contrast and visual balance.

### Strict Prohibitions

- No random colors outside token system.
- No inconsistent spacing patterns.
- No mixed radius/padding logic for same component type.
- No heavy shadow overuse.
- No misaligned layouts.
- No new direct endpoint calls in UI components.

## Naming Rules (Quick)

- Components: `PascalCase`
- Hooks: `useXxx` in `camelCase`
- Contexts: `XxxContext`, `XxxProvider`, `useXxx`
- Service methods: `camelCase` verb-first (`getUsers`, `createWarehouse`)
- Avoid mixed styles in same module (`GetAllUsers` and `getAllUsers`)

See full details in `docs/standards/naming-conventions.md`.

## Testing and Reliability Rules

- New business logic must include test coverage strategy (unit/integration/manual checklist).
- For bug fixes, add at least one regression test or clearly documented manual verification step.
- Handle loading, error, and empty states for data-driven UI.

## Documentation Rules

When adding/changing architecture, update docs in same PR:

- naming changes -> `docs/standards/naming-conventions.md`
- hook/context behavior -> `docs/guides/hooks-and-context-usage.md`
- design/token updates -> `docs/standards/frontend-governance.md`

## PR Checklist (Required)

Before merging, confirm all:

- [ ] No direct API calls from components
- [ ] No new code added under `src/utils/api`
- [ ] Hook/context usage follows provider boundaries
- [ ] Naming matches project conventions
- [ ] UI follows design tokens and spacing/radius rules
- [ ] Loading/error/empty states are handled
- [ ] Docs updated for behavior/architecture changes
