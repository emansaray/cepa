# CEPA — Community Evidence for Progressive Action

A full-stack community forum: categories ("chambers"), threads, and replies, with
JWT-based authentication. Built with React + Vite on the frontend and
Node/Express + Prisma + Microsoft SQL Server on the backend — the same stack as
your clinic system dissertation project.

## Project layout

```
cepa/
  backend/     Express API, Prisma schema, JWT auth
  frontend/    React (Vite) client
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — point this at your SQL Server instance (local install,
  Docker container, or a hosted instance like Azure SQL).
- `JWT_SECRET` — replace with a long random string
  (e.g. run `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).

Then create the database tables and seed starter chambers:

```bash
npm run prisma:migrate
npm run seed
```

Start the API:

```bash
npm run dev
```

The API runs on `http://localhost:4000`. Check `http://localhost:4000/api/health`
to confirm it's up.

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` requests to the
backend automatically (see `vite.config.js`).

## 3. Using it

1. Open `http://localhost:5173`, click **Join CEPA**, and create an account.
2. Pick a chamber and click **Start a thread**.
3. Sign in as a second user (or another browser/incognito window) to reply.
4. Thread authors, repliers, and users with `MODERATOR` or `ADMIN` roles can
   delete their own threads/replies. Promote a user to moderator/admin
   directly in the database (`role` column on `users`) — there's no UI for
   this yet, by design, since it's a sensitive action.

## What's included

- **Auth**: register/login with bcrypt-hashed passwords, JWT tokens stored in
  `localStorage`, protected routes on both client and server.
- **Categories, threads, replies**: full CRUD for threads and replies
  (create, edit, delete), with ownership and role checks throughout.
- **Endorsements (votes)**: members can endorse a thread or reply once;
  clicking again removes it.
- **Search**: full-text-style search across thread titles and bodies.
- **Member profiles**: a public page per user showing their recent threads
  and replies, plus a settings page to edit your own display name and bio.
- **Pagination**: thread lists and search results load in pages of 20.
- **Admin dashboard** (`/admin`, ADMIN role only): promote/demote members'
  roles, create or delete chambers.
- **AI FAQ chatbot**: a floating help panel (bottom-right) that answers
  questions about using CEPA, grounded in a short FAQ you can edit in
  `backend/src/controllers/chatbotController.js`. Requires an
  `ANTHROPIC_API_KEY` in `backend/.env` — get one at
  [console.anthropic.com](https://console.anthropic.com). Without a key, the
  rest of the site works fine; the chatbot just shows a friendly "not
  configured yet" message.
- **Validation**: server-side validation on every write (`express-validator`),
  plus rate limiting on auth endpoints and the chatbot.
- **Design system**: a civic "ledger/register" visual identity — deep navy and
  civic blue, progress green accents, record-numbered threads and replies,
  Newsreader/IBM Plex typography. Tokens live in
  `frontend/src/styles/tokens.css`.

## Making the first admin

There's no signup option for admin — that's intentional, since it's a
sensitive permission. After registering your first account normally, open
your database directly (SQL Server Management Studio, DB Browser for SQLite,
or `npm run sqlite:studio` / `npm run prisma:studio`) and change that user's
`role` column from `MEMBER` to `ADMIN`. From then on you can promote other
members from `/admin` in the app.

## Extending it

Natural next steps if you want to keep building:
- Email verification
- Threaded (nested) replies
- Notifications for replies to your threads
- Rich text or image attachments in posts

## Applying updates to an existing local copy

If you already ran the app once and are updating to a newer version of this
project (like the one that added endorsements, search, profiles, admin, and
the chatbot), you need one extra step beyond replacing the files: re-run the
migration so your database picks up the new `Vote` table and any schema
changes.

```bash
cd backend
npm run sqlite:migrate   # or npm run prisma:migrate for SQL Server
```

Prisma will detect the schema changes and create a new migration
automatically — it won't touch your existing data. Then restart both
`npm run dev` processes (backend and frontend) as usual.

## Prototyping locally with SQLite

`backend/prisma/schema.prisma` targets SQL Server — that's the schema to use
for the version you'll actually ship. But setting up a local SQL Server
instance is friction you don't need just to click around the app, so there's
a second schema, `backend/prisma/schema.sqlite.prisma`, that mirrors it for
zero-install local testing:

```bash
cd backend
npm install

# In .env, use the SQLite line instead of the SQL Server one:
# DATABASE_URL="file:./dev.db"

npm run sqlite:generate
npm run sqlite:migrate
npm run seed
npm run dev
```

One real difference: SQLite doesn't support Prisma's `enum` type, so
`schema.sqlite.prisma` stores `role` as a plain string (`"MEMBER"`,
`"MODERATOR"`, `"ADMIN"`) instead of the `Role` enum. Nothing in the app code
needs to change either way, since roles are already compared as strings
throughout the backend and frontend.

**Switching back to SQL Server later:** update `DATABASE_URL` back to your
SQL Server connection string, then run `npm run prisma:generate` and
`npm run prisma:migrate` (the non-`sqlite:` scripts) to regenerate the client
against `schema.prisma`. Prisma Client is generated fresh each time you run
`generate`, so whichever schema you generated from most recently is the one
that's active — don't run both in the same session without regenerating in
between.
