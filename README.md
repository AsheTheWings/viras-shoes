# Viras Shoes

Viras is a footwear storefront and order-management application built with
Next.js 16, React 19, and Supabase. The shop is available in Arabic at `/`,
English at `/en`, and French at `/fr`.

## Shop

The collection displays prices in Moroccan dirhams and available EU sizes.
Customers can search names and descriptions, filter by available size, sort
by price or name, and save pairs in their browser. Saved pairs stay on that
browser across visits; they do not require an account.

Each product opens a gallery with thumbnails, previous/next controls, a
full-size photo view, descriptions, stock availability, and a size picker.
Product links use `#shoe-<id>` and can be copied from the share button or
address bar. The browser Back button closes an opened product.

To order, choose an available size, enter a name, and provide a valid phone
number or email. Moroccan mobile numbers accept local, `+212`, and `00212`
formats. An order request records one pair, updates stock, and displays a
confirmation until the customer closes it. The shop uses a contact-based
confirmation flow; it does not collect payment or a delivery address.
The team confirms availability and delivery details with the customer.

## Development

Install dependencies with `npm ci`. Supply the following values through the
process environment or an untracked Next.js environment file:

| Input                           | Purpose                                           |
| ------------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase client key                        |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-side admin and image-storage access        |
| `ADMIN_CODE`                    | Single-admin sign-in code, 1–8 letters or digits  |
| `TELEGRAM_BOT_TOKEN`            | Optional server-side order notification bot token |
| `TELEGRAM_CHAT_ID`              | Optional order notification destination           |

Both Telegram values must be present to enable order notifications. They are
server-only. Never commit real credentials.

```sh
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open the loopback listener through your development host's reachable name.
For an optimized build, run `npm run build` and then
`npm run start -- --hostname 127.0.0.1 --port 3000`.

## Verification

Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` for static and build
checks. Pure unit tests for catalog filtering, sorting, price formatting,
and order validation run with Node.js 22.18 or later:

```sh
node --experimental-strip-types --test tests/*.unit.test.mts
```

Browser checks should exercise desktop and mobile layouts, all three
languages, search and empty results, favorites across reloads, size filtering,
product deep links, gallery navigation and zoom, and checkout validation.
Use a separate fixture database for order submission checks; placing an order
writes an order and changes stock.

## Admin

Sign in at `/admin` with the admin code to manage orders, product details,
available sizes, stock, and galleries. The dashboard summarizes orders,
products, stock units, and sizes with one or two units remaining. Orders can
be searched by customer, contact details, product name, or order ID and
filtered by their stored status.

The admin code is case-sensitive and contains 1 to 8 ASCII letters or digits;
a configured value in any other format leaves sign-in unavailable. Each client
IP gets eight wrong attempts per 10 minutes. Admin data access uses the
service-role key in server code, and session signatures combine both secrets,
so rotating the admin code or the service-role key invalidates existing
sessions. The orders view displays the latest 500 orders, and its search and
summaries apply to that loaded set.

Product photos live in the Supabase `assets` bucket, with filenames keyed by
item number. WebP uploads are limited to 5 MB per image. The gallery groups
files with the same stem into one photo and uses the lightweight variant for
thumbnails and the full-quality variant for detail views. Missing photos
and failed image loads display a product placeholder.
