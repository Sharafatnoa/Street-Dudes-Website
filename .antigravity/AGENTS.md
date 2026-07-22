# Street Dudes — Agent Rules

Read this file completely before starting any task.
These rules exist so that any developer or agent can pick up this project
at any point without confusion.

---

## Project Overview

**Website:** streetdudes.se
**Purpose:** Menu display site for Street Dudes restaurant in Borås, Sweden.
**Phase 1 (now):** Static menu, bilingual (SV default / EN toggle), location map.
**Phase 2 (later):** Online ordering with custom delivery system.

Design tokens are in `src/styles/brand.ts`. Never hard-code colours or fonts.

---

## Tech Stack

| Layer     | Tool                  | Why                                      |
| --------- | --------------------- | ---------------------------------------- |
| Framework | Next.js 14 App Router | SEO, i18n routing, easy Phase 2 API add  |
| Language  | TypeScript (strict)   | Catch errors early, safe refactoring     |
| Styling   | Tailwind CSS          | Utility-first, no CSS files to hunt down |
| i18n      | next-intl             | File-based, no runtime bloat             |
| Testing   | Jest + Playwright     | Unit for logic, E2E for user flows       |
| Hosting   | Vercel                | Zero-config Next.js, free tier for now   |

---

## Naming Conventions

### Files

- Components: PascalCase → `MenuItemCard.tsx`
- Utilities: camelCase → `formatPrice.ts`
- Test files: same name + `.test` or `.spec` → `formatPrice.test.ts`
- Data files: camelCase → `menu.ts`

### Inside files

- React components: PascalCase function → `function MenuItemCard()`
- Helper functions: camelCase verb-noun → `function formatPrice()`
- Constants: SCREAMING_SNAKE → `BRAND_GOLD`
- TypeScript types: PascalCase + noun → `type MenuItem`
- TypeScript props: PascalCase + "Props" → `type MenuItemCardProps`

---

## Code Rules

1. **One component per file.** No barrel-exporting multiple components.
2. **No inline styles.** Use Tailwind classes or brand tokens only.
3. **No magic strings.** All UI text lives in `i18n/sv.json` + `i18n/en.json`.
4. **No magic numbers.** Prices and data live in `src/data/menu.ts` only.
5. **Comments explain WHY, not WHAT.** If the code is readable, skip the comment.
   Bad: `// loop through items`
   Good: `// Items are sorted server-side; do not re-sort here`
6. **Every component gets a JSDoc header** with purpose + props summary.
7. **Keep components small.** If a component exceeds ~80 lines, split it.
8. **No `any` types.** Use `unknown` and narrow it.

---

## i18n Rules

- Swedish (`sv`) is the default locale.
- ALL user-facing strings go in `i18n/sv.json` and `i18n/en.json`.
- Use dot-notation keys: `menu.burgers.truffleSmash.name`
- Never translate inside a component — always use the `useTranslations` hook.
- Menu item names (TRUFFLE SMASH, BIRRIA TACO) are NOT translated — they are
  brand names. Only descriptions and UI labels get translated.

---

## Testing Rules

- Every pure utility function in `src/lib/` must have a unit test.
- Every page must have at least one Playwright smoke test:
  - Page loads without JS errors
  - All menu sections are visible
  - Language toggle switches text correctly
- Tests live in `tests/` mirroring `src/` structure.
- CI must pass before any merge to `main`.

---

## What NOT To Do

- Do NOT add dependencies without checking if a native solution exists first.
- Do NOT put business logic inside page files (`app/[locale]/page.tsx`).
  Pages import components; components contain logic.
- Do NOT commit `.env` files. Use `.env.example` as a template.
- Do NOT hard-code the Google Maps API key. Use `NEXT_PUBLIC_GOOGLE_MAPS_KEY`.
- Do NOT create a new UI component if an existing one in `src/components/ui/`
  can be extended with a prop.

---

## Phase 2 Readiness (Ordering System)

The `src/app/api/` folder is reserved for future API routes.
When Phase 2 starts:

- Order endpoints go in `src/app/api/orders/`
- Delivery logic goes in `src/app/api/delivery/`
- The `OrderButton` component already accepts an `href` prop —
  flip it from `disabled` to active when the endpoint is ready.
- Menu data in `src/data/menu.ts` is already typed for price lookups.

Do not add any ordering code to Phase 1 beyond what is described above.
