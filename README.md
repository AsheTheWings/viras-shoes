This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Admin

The `/admin` page is a single-admin back office: sign in with one admin code,
then manage orders (status, delete) and shoes (name, price, description, sizes
and stock, WebP images per variant).

Environment (never commit real values; `.env*` is gitignored):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
ADMIN_CODE=$(openssl rand -hex 32)
SUPABASE_SERVICE_ROLE_KEY=<service role key from the Supabase dashboard>
```

- `ADMIN_CODE` is server-only and never sent to the browser. Generate a fresh
  value per environment; rotating it signs everyone out.
- Admin reads and writes use the service role key from server code only, so
  the admin code cannot be bypassed through the public API.
- Product images live in the `assets` storage bucket as
  `item-<item_number>-<variant>.webp` (`main`, `standard`, `worn`, `top`).
  Uploads must be WebP files of 5 MB or less.
