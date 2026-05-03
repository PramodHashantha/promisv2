# Naming Conventions

This document defines naming standards for a consistent, maintainable frontend codebase.

## General Rules

- Use clear, domain-driven names over short/ambiguous names.
- Use one naming style consistently in each category.
- Prefer full words over abbreviations unless the abbreviation is widely accepted (`API`, `ID`, `URL`).
- Keep names singular for models/types and plural for collections/lists.

## File and Folder Naming

### Folders

- Use `kebab-case` for folder names.
- Group by feature/domain where possible.

Examples:

- `stores-management`
- `user-management`
- `api`
- `shared-components`

### Files

- React component files: `PascalCase.jsx`
- Hook files: `camelCase` with `use` prefix (for example `useApi.js`)
- Context files: `PascalCase` with `Context` suffix (for example `AuthContext.jsx`)
- Service/API files: `camelCase` or `kebab-case` with `.service` suffix (pick one style and keep it global)
- Utility/helper files: `camelCase`
- Styles: follow existing project style (`.scss`) and match component/feature name.

Recommended examples:

- `AuthContext.jsx`
- `useNetworkStatus.jsx`
- `storeVerification.service.js`
- `dateHelpers.js`

## React Components

- Component names must be `PascalCase`.
- File name must match the main component export.
- Pages should end with `Page` if you adopt page suffixing, otherwise keep current route-based style consistently.

Examples:

- `MaterialRequestAllTable`
- `StoreWarehouseDetailsView`

## Hooks

- Custom hooks must start with `use`.
- Use `camelCase`.
- Hook names should describe behavior, not implementation.

Examples:

- `useApi`
- `useStatus`
- `useNotification`

## Contexts

- Context object name: `XxxContext`
- Provider component name: `XxxProvider`
- Consumer hook name: `useXxx`

Examples:

- `AuthContext`, `AuthProvider`, `useAuth`
- `NetworkContext`, `NetworkProvider`, `useNetwork`

## Variables, Functions, and Constants

- Variables and functions: `camelCase`
- Booleans: prefix with `is`, `has`, `can`, or `should`
- Constants: `UPPER_SNAKE_CASE` only for true constants (for example shared immutable values)
- Event handlers: `handleXxx`

Examples:

- `isOnline`, `hasPermission`
- `handleSubmit`, `handleLogout`
- `MAX_RETRY_COUNT`

## API Naming

- API methods should be `camelCase` and start with action verbs.
- Avoid mixed styles like `GetAllUsers` and `getAllUsers` in the same codebase.
- Prefer domain-specific service files instead of a generic `api.js`.

Examples:

- `getAllUsers`
- `createStoreWarehouse`
- `updateRackCountEndingStatus`
- `deleteStoreRack`

## Imports and Aliases

- Prefer `@/` alias imports over long relative imports when possible.
- Keep import order consistent:
  1. External packages
  2. Internal aliases (`@/...`)
  3. Relative imports
  4. Styles

## Environment Variables

- Frontend env vars must use `VITE_` prefix.
- Use `UPPER_SNAKE_CASE`.

Examples:

- `VITE_API_BASE_URL`
- `VITE_API_PROXY_TARGET`

## Quick Do and Do Not

- Do: `getStoreOutDetailsByMrNo`
- Do: `storeVerification.service.js`
- Do not: `GetStoreOutDetailsByMrNo` (if your standard is `camelCase`)
- Do not: `api.js` as a catch-all endpoint file
