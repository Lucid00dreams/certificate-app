# Certificate Portal

Two parts, one Next.js app:

- **Public portal** (`/`) — participants enter their Unique ID + email, preview
  their certificate, and download the PDF.
- **Admin dashboard** (`/admin`) — password-protected; manage participants and
  upload certificate PDFs.

## Design

Palette and typography are meant to evoke an official issuing office rather
than a generic SaaS dashboard: deep ink-navy text on a cool bone background,
a brass accent for primary public actions, and a stamped wax-seal mark
(`components/ui/Seal.tsx`) that appears on verified certificates and on the
"Downloaded" status pill — the one recurring signature element tying both
halves of the app together. Headings use Fraunces (a display serif with an
engraved, certificate-like character); body text uses Inter; IDs and codes
use IBM Plex Mono so they read as data, not prose.

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` from this repo. It creates the
   `participants` table and a private `certificates` storage bucket.
3. Under **Authentication > Users**, manually create your admin account(s)
   (email + password). There's no public sign-up flow by design — admins are
   provisioned directly in Supabase.

## 2. Configure environment variables

Copy the template and fill in your project's keys (Project Settings > API):

```bash
cp .env.local.example .env.local
```

`SUPABASE_SERVICE_ROLE_KEY` is required — the app uses it server-side to look
up participants and manage storage without granting the public anon key any
direct table access (see **Security model** below).

## 3. Install and run

```bash
npm install
npm run dev
```

- Public portal: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

## Security model

- The `participants` table has RLS enabled with **no public policies at
  all**. The anon key (used by the browser) cannot read or write it directly.
- `/api/verify` and `/api/download` are server route handlers that use the
  service-role key to look up a participant by **both** Unique ID and email
  together, then issue a short-lived signed Storage URL (5 minutes for
  preview, 60 seconds for the actual download). Nothing about other
  participants is ever exposed.
- `/api/admin/*` route handlers check for an authenticated Supabase session
  (`requireAdmin()` in `lib/require-admin.ts`) before touching the database,
  independent of the `/admin` route protection already done in
  `middleware.ts`.
- The certificates Storage bucket is private; every file access goes through
  a signed URL minted server-side.

## Project structure

```
app/
  page.tsx                    Public lookup card
  certificate/page.tsx        Verified certificate + download
  admin/login/page.tsx        Admin sign-in
  admin/(dashboard)/          Sidebar-shell dashboard (protected)
  api/verify, api/download    Public participant endpoints
  api/admin/participants/*    Admin CRUD endpoints
components/
  public/                     Lookup form, certificate card
  admin/                      Sidebar, table, add-participant modal
  ui/                         Spinner, Seal (signature mark)
lib/supabase/                 Browser / server / service-role clients
supabase/schema.sql           Table, indexes, storage bucket
```
