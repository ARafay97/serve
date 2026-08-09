# serve — MyBagh POS

Order taking and order records for MyBagh, as a single Next.js app on Vercel.

This replaces the two-repo, two-deploy setup (`restaurant-pos-frontend` on
Netlify + `restaurant-pos-backend` on Azure App Service). Orders now live in
Supabase Postgres instead of a JSON file on the Azure filesystem.

## How it fits together

```
Browser ──fetch──> /api/orders (Next.js route handler) ──service-role key──> Supabase Postgres
```

Every database call happens server-side inside a route handler. The browser
never talks to Supabase directly, so there is no `NEXT_PUBLIC_` Supabase
variable and no key in the JavaScript bundle. The `orders` table has RLS on
with no policies, which denies the anon role outright; the service role bypasses
RLS, so only the server can read or write.

The screens are a record, not a live feed — each one loads on open and has a
**Refresh** button with a "last updated" timestamp. There is no WebSocket
server, which is what lets the whole app run as ordinary serverless functions.

## Setup

1. **Create the table.** In the Supabase dashboard: SQL Editor → New query →
   paste [`supabase/schema.sql`](supabase/schema.sql) → Run.

2. **Fill in the environment.** Copy `.env.example` to `.env.local` and set both
   values from Project Settings → API. Use the **service_role** key, not anon.

3. **Run it.**

   ```bash
   npm install && npm run dev
   ```

4. **Deploy.** Import the repo in Vercel and add `SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY` under Settings → Environment Variables. No build
   configuration needed — Vercel detects Next.js on its own.

With the environment blank the app still builds and runs; API calls return a
`503` explaining what is missing, rather than crashing at boot.

## Screens

| Route | What it does |
| --- | --- |
| `/` | Station picker |
| `/employee` | Take an order: pick a table (or Takeout), tap items, send |
| `/kitchen` | Food sections, mark each done, finish the order |
| `/bar` | Drinks sections, mark done |
| `/orders` | All active orders, mark complete |
| `/completed` | Completed history with total takings |
| `/orders/bar` | Bar-only completed history |
| `/orders/kitchen` | Kitchen-only completed history |

The last two moved from `/ordersBar` and `/ordersKitchen` to sit under
`/orders`.

## Menu and station routing

[`src/data/categories.ts`](src/data/categories.ts) is the single source of truth:
it maps each of the 12 menu sections to a station (kitchen or bar) and to the
done-flag that section satisfies. Every screen derives its grouping from that
list, so adding a menu section is one entry there plus the items in
[`src/data/menu.json`](src/data/menu.json).

Item prices are copied onto the order when it is sent, so repricing the menu
never rewrites the history of past orders.

## API

| Method | Route | Notes |
| --- | --- | --- |
| `GET` | `/api/orders?completed=true\|false` | Active oldest-first, completed newest-first |
| `POST` | `/api/orders` | Body `{ id?, table, items[], isKitchenOrder }` |
| `GET` | `/api/orders/:id` | |
| `PATCH` | `/api/orders/:id` | `{ action: "complete" }` and/or done-flags, applied together |
| `GET` | `/api/health` | Reports whether Supabase env vars are present |

Takeout ticket numbers come from a Postgres sequence rather than
`MAX(order_number) + 1`, so two tills ordering at the same moment cannot be
handed the same number.

## Known gap

There is **no authentication**. Anyone with the URL can read every order and
post new ones, exactly as in the previous build. Worth closing before this is
on a public domain.
