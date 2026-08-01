# Street Dudes — Website & Ordering System

Restaurant website and online ordering system for **Street Dudes**,
Alingsåsvägen 40, Borås, Sweden.

Live: [streetdudes.se](https://streetdudes.se)

---

## Tech Stack

| Layer     | Tool                  | Purpose                                   |
| --------- | --------------------- | ----------------------------------------- |
| Framework | Next.js 14 App Router | Routing, API, SSR                         |
| Language  | TypeScript strict     | Type safety across the full stack         |
| Styling   | Tailwind CSS          | Utility-first, brand tokens in brand.ts   |
| i18n      | next-intl             | Swedish (sv) default, English (en) toggle |
| Database  | Supabase (PostgreSQL) | Orders, config, realtime kitchen updates  |
| Testing   | Jest + Playwright     | Unit tests + E2E user flow verification   |
| Hosting   | Vercel                | Automatic deploys from main branch        |

---

## Project Status

| Phase | Description                       | Status      |
| ----- | --------------------------------- | ----------- |
| 1     | Bilingual menu website            | ✅ Live     |
| 2     | Online ordering + delivery system | 🔄 Building |
| 3     | Payments (Stripe + Swish)         | ⏳ Planned  |
| 4     | Loyalty, promos, analytics        | ⏳ Planned  |

---

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in all values in .env.local before running

# Start development server
npm run dev
```

Open http://localhost:3000/sv

---

## Environment Variables

All variables are documented in `.env.example`.

```bash
# Supabase — get from supabase.com project settings
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server-side only

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY=      # Browser embed key
GOOGLE_MAPS_GEOCODING_KEY=        # Server-side geocoding (no referrer restriction)

# PIN Protection
KITCHEN_PIN=                      # Sam uses this for kitchen dashboard
ADMIN_PIN=                        # Yasha uses this for admin config

# Email (Phase 2b)
RESEND_API_KEY=                   # resend.com — order confirmation emails
```

**Never commit `.env.local` to git.**

---

## Scripts

| Command            | What it does                    |
| ------------------ | ------------------------------- |
| `npm run dev`      | Start local development server  |
| `npm run build`    | Build production bundle         |
| `npm run lint`     | Check code quality with ESLint  |
| `npm run format`   | Format code with Prettier       |
| `npm run test`     | Run Jest unit tests             |
| `npm run test:e2e` | Run Playwright end-to-end tests |

---

## Quick Reference Card

### Content Changes (no code needed)

| Need to...                        | Where                                   |
| --------------------------------- | --------------------------------------- |
| Change a menu item price          | `src/data/menu.ts`                      |
| Add a new menu item               | `src/data/menu.ts`                      |
| Change item customization options | `src/data/menu.ts` → item.customization |
| Change Swedish UI text            | `src/i18n/sv.json`                      |
| Change English UI text            | `src/i18n/en.json`                      |
| Change opening hours              | `src/i18n/sv.json` + `en.json`          |
| Change brand colours or fonts     | `src/styles/brand.ts`                   |

### Config Changes (Supabase dashboard or Admin UI)

| Need to...                     | Where                                          |
| ------------------------------ | ---------------------------------------------- |
| Change delivery radius         | Supabase → config → delivery_radius_km         |
| Change delivery fee            | Supabase → config → delivery_fee_kr            |
| Change free delivery threshold | Supabase → config → free_delivery_threshold_kr |
| Change minimum order amount    | Supabase → config → min_order_kr               |
| Change estimated delivery time | Supabase → config → estimated_delivery_mins    |
| Turn ordering on or off        | Supabase → config → is_open                    |

### Code Changes

| Need to...                       | Where                                    |
| -------------------------------- | ---------------------------------------- |
| Change the map location          | `src/components/map/RestaurantMap.tsx`   |
| Change cart behaviour            | `src/lib/cart.ts`                        |
| Change delivery radius logic     | `src/lib/haversine.ts`                   |
| Change address geocoding         | `src/lib/geocode.ts`                     |
| Change order creation logic      | `src/app/api/orders/route.ts`            |
| Change delivery validation logic | `src/app/api/delivery/validate/route.ts` |
| Change kitchen dashboard         | `src/components/kitchen/`                |
| Change admin config UI           | `src/components/admin/`                  |
| Add a new page                   | `src/app/[locale]/new-page/page.tsx`     |
| Add a new API endpoint           | `src/app/api/endpoint-name/route.ts`     |

---

## Folder Structure

```
src/
├── app/
│   ├── [locale]/              # Locale-prefixed pages (sv/en)
│   │   ├── page.tsx           # Homepage — read-only menu display
│   │   ├── order/page.tsx     # Order page — interactive menu + cart
│   │   ├── checkout/page.tsx  # Checkout form
│   │   └── order/[number]/    # Order confirmation
│   ├── kitchen/page.tsx       # Kitchen dashboard (PIN protected)
│   ├── admin/page.tsx         # Admin config UI (PIN protected)
│   └── api/
│       ├── orders/route.ts    # POST — create order
│       ├── delivery/validate/ # POST — validate address + radius
│       └── config/route.ts    # GET/PATCH — read/update config
│
├── components/
│   ├── cart/                  # CartDrawer, CartItem, FloatingCartBar
│   ├── checkout/              # CheckoutForm, DeliveryCheck, OrderSummary
│   ├── kitchen/               # Dashboard, OrderCard, StatusBadge
│   ├── admin/                 # ConfigEditor
│   ├── menu/                  # MenuPage, MenuSection, MenuItemCard,
│   │                          # ItemCustomizationModal, CategoryTabs
│   ├── layout/                # Navbar, Footer, OrderNavbar, LanguageToggle
│   ├── map/                   # RestaurantMap
│   └── ui/                    # Badge, FlashingLabel (shared primitives)
│
├── context/
│   └── CartContext.tsx        # Cart state — persists in sessionStorage
│
├── lib/
│   ├── supabase.ts            # Supabase client (public + server)
│   ├── haversine.ts           # Distance calculation
│   ├── geocode.ts             # Address → coordinates (Google Maps)
│   ├── cart.ts                # Pure cart functions (testable)
│   ├── getConfig.ts           # Read config from Supabase
│   ├── recalculateOrder.ts    # Server-side price verification
│   └── formatPrice.ts         # Price display formatting
│
├── types/
│   ├── menu.ts                # MenuItem, MenuCategory, ItemCustomization
│   ├── order.ts               # Order, CartItem, OrderStatus, AddToCartInput
│   ├── delivery.ts            # Coordinates, DeliveryValidation
│   └── config.ts              # AppConfig, ConfigEntry
│
├── data/
│   └── menu.ts                # ALL menu items — single source of truth
│
├── i18n/
│   ├── sv.json                # Swedish strings (default language)
│   └── en.json                # English strings
│
└── styles/
    └── brand.ts               # Design tokens: colours, fonts
```

---

## Key URLs

| URL                      | Description                              |
| ------------------------ | ---------------------------------------- |
| `/sv`                    | Homepage in Swedish (default)            |
| `/en`                    | Homepage in English                      |
| `/sv/order`              | Online ordering page                     |
| `/sv/checkout`           | Checkout form                            |
| `/sv/order/[number]`     | Order confirmation                       |
| `/kitchen`               | Kitchen dashboard (requires KITCHEN_PIN) |
| `/admin`                 | Admin config UI (requires ADMIN_PIN)     |
| `/api/orders`            | POST — create a new order                |
| `/api/delivery/validate` | POST — validate delivery address         |
| `/api/config`            | GET/PATCH — read or update config        |

---

## Database

Supabase project: `mnzrceufcnyfvpuavdxj.supabase.co`
Region: EU West (Ireland)

Two tables:

- `config` — dynamic settings Yasha can change anytime
- `orders` — every customer order with full details

Schema: `supabase/schema.sql`

---

## Agent Rules

All coding standards, naming conventions, and architectural rules
are in `.antigravity/AGENTS.md`. Read this before making any changes.

---

## Branches

| Branch           | Purpose                                     |
| ---------------- | ------------------------------------------- |
| `main`           | Production — auto-deploys to streetdudes.se |
| `phase-1-backup` | Snapshot of completed Phase 1 menu website  |
