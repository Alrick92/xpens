---
name: testing-xpens-design
description: Test XpenS dashboard design and UI changes end-to-end. Use when verifying visual/CSS changes to the expense tracking app.
---

# Testing XpenS Design Changes

## Environment Setup

1. Ensure Docker is running for PostgreSQL: `docker compose up -d db`
2. Start the dev server: `cd ~/repos/xpens && npm run dev`
3. Wait for compilation at http://localhost:3000
4. Login with: `admin@xpens.local` / `admin123`

## Test Data

- DB is seeded with 1 expense ($49.99 Staples, APPROVED), 1 project (Website Redesign), 10 categories
- Second user: `test@xpens.local` / `test123` (employee role)
- The approvals page shows an empty state since the only expense is already approved

## CSS Verification Approach

Use browser console JavaScript to verify computed styles rather than visual inspection alone. This provides exact values:

```javascript
// Find elements by class pattern
for (const el of document.querySelectorAll('main *')) {
  if (el.className?.includes('text-[32px]')) {
    const style = getComputedStyle(el);
    console.log(style.fontSize, style.fontWeight);
  }
}
```

Key patterns:
- **Find by class substring**: `el.className.includes('text-[32px]')` 
- **Find by text content**: `el.textContent.trim() === 'target text'`
- **Check computed styles**: `getComputedStyle(el).fontSize`
- **Scope to main content**: `document.querySelectorAll('main *')` to avoid sidebar duplicates

## Pages to Test

| Route | Key Elements |
|-------|-------------|
| /dashboard | Stat cards, charts, recent expenses table, status pills |
| /expenses | Expense list, status pills, table headers |
| /projects | Project cards, budget progress bars |
| /approvals | Empty state (if no pending), recent decisions |
| /reports | Export filters, stat summary card |
| /settings | Profile form, category manager, team members |

## Common Design Tokens

- Primary (olive): `#6B7C5E` / `rgb(107, 124, 94)`
- Foreground (warm brown): `#2D2A22` / `rgb(45, 42, 34)`
- Background (cream): `#F5F0EB` / `rgb(245, 240, 235)`
- Earthy red: `#C4533A` / `rgb(196, 83, 58)`
- Muted foreground: `rgb(124, 120, 104)`
- Muted background: `rgb(237, 232, 224)`

## Known Issues

- **Hydration mismatch**: React hydration errors may appear in the console on pages with date formatting (Expenses, Projects). This is a pre-existing SSR issue from `Date.now()` or locale-dependent formatting, not related to design changes.
- **First page load**: After `npm run dev`, the first navigation to a new page triggers compilation. Wait ~3 seconds before interacting.
- **Sidebar link collisions**: When querying `a[href="/expenses"]`, scope to `main` to avoid matching the sidebar nav link.

## Devin Secrets Needed

No secrets required — the app uses local PostgreSQL with credentials in `.env`.
