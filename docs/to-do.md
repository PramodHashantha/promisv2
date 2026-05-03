# Post-Bootstrap Cleanup Tasks

This document outlines the final steps to be taken after the migration to the Tailwind/Brand design system is complete and Bootstrap is ready to be fully removed from the project.

**Assignee:** Pramod

## 📋 Critical Cleanup Checklist

- [ ] **1. Clean up `public/assets/scss/theme.scss`**
  - Remove the entire `@layer bootstrap-legacy` block.
  - Delete all `@import "node_modules/bootstrap/scss/..."` lines.
  - Verify that theme overrides in the `themes/` directory do not rely on Bootstrap variables (like `$primary`, `$success`, etc.).

- [ ] **2. Update `src/index.css` Layer Ordering**
  - Update the `@layer` definition at the top of the file:
    ```diff
    - @layer bootstrap-legacy, theme, base, components, utilities;
    + @layer theme, base, components, utilities;
    ```

- [ ] **3. Dependency Cleanup**
  - Run `npm uninstall bootstrap` to remove the package and its SCSS source from `node_modules`.

- [ ] **4. JavaScript Audit**
  - Search the project for `import * as bootstrap` or `import 'bootstrap'`.
  - Remove any legacy JS initialization for Bootstrap tooltips, popovers, or modals.
  - Ensure all modals are now using the React-based components instead of Bootstrap's native `modal.js`.

- [ ] **5. Final CSS Audit**
  - Search the project for `className="btn"` or `className="btn-`.
  - Ensure all have been converted to `brand-btn-*`.

## ⚠️ Potential Side Effects to Watch For
- **Modals & Dropdowns**: Some legacy components might still rely on Bootstrap's JS/CSS for positioning. Ensure these are fully migrated to a React alternative (like headless UI or our own brand components).
- **Form Resets**: Removing `reboot.scss` will remove global margin/padding resets for form elements. If form layouts shift unexpectedly, re-add minimal resets to the `@layer base` in `index.css`.

---
*Created on 2026-04-28*
