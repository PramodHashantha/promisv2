# Hooks and Context Usage Guide

This guide explains how to use hooks and contexts currently available in this project.

## Available Hooks

- `useApi`
- `useStatus`
- `useNetworkStatus`
- `useNotification`
- `useConfirmation`

## Available Contexts

- `AuthContext` via `useAuth`
- `NotificationContext` via `useNotification`
- `NetworkContext` via `useNetwork`

## `useApi`

Path: `src/hooks/useApi.js`

Purpose:

- Runs API functions with loading/error/data state management.
- Supports auto-fetch and manual execution.
- Cancels in-flight request when a new call starts.

Basic usage:

```jsx
import { useApi } from "@/hooks/useApi";
import { getAllUsers } from "@/api/services/user.service";

function UsersList() {
  const { data, loading, error, execute, cancel } = useApi(getAllUsers, [], true);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => execute()}>Refresh</button>
      <button onClick={cancel}>Cancel</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

Notes:

- `apiFn` should accept `signal` as its last parameter.
- For manual mode, pass `auto = false` and call `execute(...)` explicitly.

## `useStatus`

Path: `src/hooks/useStatus.js`

Purpose:

- Fetches enum display values and enum map from status endpoints.
- Caches using React Query.
- Supports client-side include/exclude filtering.

Basic usage:

```jsx
import { useStatus } from "@/hooks/useStatus";

function StatusSelect() {
  const { statuses, loading, getLabel, getValue } = useStatus("MaterialRequestStatus", {
    exclude: [0],
  });

  if (loading) return <span>Loading statuses...</span>;

  return (
    <select>
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
```

Notes:

- `endpointName` is required to enable query execution.
- `getLabel(value)` helps display readable status labels.
- `getValue(name)` helps map enum name to numeric value.

## `useNetworkStatus`

Path: `src/hooks/useNetworkStatus.jsx`

Purpose:

- Returns live online/offline status based on browser events.

Basic usage:

```jsx
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

function NetworkBadge() {
  const isOnline = useNetworkStatus();
  return <span>{isOnline ? "Online" : "Offline"}</span>;
}
```

## `useNotification`

Path: `src/hooks/useNotification.js`

Purpose:

- Accesses notification/toast functions from `NotificationProvider`.
- Throws error if provider is missing.

Basic usage:

```jsx
import useNotification from "@/hooks/useNotification";

function SaveButton() {
  const { success, error } = useNotification();

  const onSave = async () => {
    try {
      // await save call
      success("Saved successfully");
    } catch {
      error("Save failed");
    }
  };

  return <button onClick={onSave}>Save</button>;
}
```

## `useConfirmation`

Path: `src/hooks/useConfirmation.js`

Purpose:

- Shows a SweetAlert2 confirmation modal.
- Returns `confirmAction(...)` for reusable confirm workflows.

Basic usage:

```jsx
import useConfirmation from "@/hooks/useConfirmation";

function DeleteButton({ onDelete }) {
  const { confirmAction } = useConfirmation();

  const handleDelete = async () => {
    const confirmed = await confirmAction({
      title: "Delete item?",
      text: "This action cannot be undone.",
      icon: "warning",
      confirmButtonText: "Yes, delete",
    });

    if (confirmed) onDelete();
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

## Context Usage

## `AuthContext` and `useAuth`

Path: `src/context/AuthContext.jsx`

Provides:

- `user`
- `menu`
- `loading`
- `login(pfno, password)`
- `loginDev(pfno, password)`
- `logout()`

Usage:

```jsx
import { useAuth } from "@/context/AuthContext";

function ProfileMenu() {
  const { user, logout } = useAuth();
  return (
    <div>
      <span>{user?.fullname}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## `NotificationContext` and `useNotification`

Path: `src/context/NotificationContext.jsx`

Provides:

- `notify(type, message, duration?)`
- `success(message, duration?)`
- `error(message, duration?)`
- `warning(message, duration?)`
- `info(message, duration?)`
- `removeToast(id)`
- `confirm(options)`

Use the hook instead of calling context directly.

## `NetworkContext` and `useNetwork`

Path: `src/context/NetworkContext.jsx`

Provides:

- `isOnline`

Usage:

```jsx
import { useNetwork } from "@/context/NetworkContext";

function SyncIndicator() {
  const { isOnline } = useNetwork();
  return <span>{isOnline ? "Sync active" : "Offline mode"}</span>;
}
```

## Provider Order

All consumer hooks must be used under their providers.

Recommended app wrapper order:

1. `NotificationProvider`
2. `AuthProvider`
3. `NetworkProvider`
4. App routes/components

Reason:

- `AuthProvider` uses `useNotification`, so `NotificationProvider` must wrap it.

## Best Practices

- Keep hooks focused on one responsibility.
- Never call hooks conditionally.
- Keep side effects inside `useEffect`.
- Prefer returning stable callbacks from hooks when used in dependencies.
- In context values, memoize objects/functions to reduce re-renders.
- For API hooks, support cancellation via `AbortController` where possible.

## Common Mistakes

- Using `useNotification`, `useAuth`, or `useNetwork` outside provider tree.
- Mixing direct `fetch` in components when a domain service/hook already exists.
- Creating duplicate hooks for the same purpose in multiple features.
- Returning non-memoized objects from custom hooks that are used in dependency arrays.
