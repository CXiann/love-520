# 520 · Cinematic Love Website

A scroll-driven, cinematic love story site for your second **520** (May 20) celebration — built with Next.js, Prisma, and Framer Motion.

## Features

- **Cinematic scroll journey**: opening, two year chapters, timeline ordering game, gallery, love letter
- **Collect 520 hearts** mini-game with confetti
- **Days together** counter
- **Background music** (Spotify embed or MP3 URL)
- **Secret page** (`/secret`) — password-protected surprise
- **Admin panel** (`/admin`) — edit all content and upload photos

## Quick start

```bash
cd love-520
cp .env.example .env
# Edit .env — set ADMIN_PASSWORD and SECRET_PASSWORD

npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Route | Purpose |
|-------|---------|
| `/` | Main love story |
| `/secret` | Password-gated surprise (default password in `.env`: `SECRET_PASSWORD`) |
| `/admin` | Content management (login with `ADMIN_PASSWORD`) |

## Customize your content

1. Go to **`/admin`** and sign in with `ADMIN_PASSWORD`.
2. Update names, dates, chapter copy, letter, timeline, gallery, and secret page.
3. Upload photos via the admin panel (stored in `public/uploads/`).
4. **First celebration video**: default is `public/uploads/video-2.mp4.mov` (`/uploads/video-2.mp4.mov` in admin). The poster falls back to the Topic 1 image unless you set a separate poster URL.
5. **Timeline game**: in admin **Timeline**, upload a photo per milestone (or use **Upload photo** to add one); she drags them into chronological order to unlock the secret clue `_ _ _ _ _ _ _ 5 2 0` (the `520` tail of the password).
6. **This Year**: in admin **This Year → Favorite moments game**, set photo pool, pick count (3–8), prompts, story-rail labels, optional background; she picks favorites, orders them, then unlocks the baby duet. Default pool uses images in `public/uploads/favorite/`; starter/load in admin pulls from that folder.

Timeline, gallery, and dolls are stored in the database — use **`/admin`** to edit them. Re-running `npm run db:seed` only fills **empty** tables; it will not wipe milestones you already saved. To reset demo data: `FORCE_SEED=1 npm run db:seed`.

Initial demo copy can also live in [`scripts/seed.ts`](scripts/seed.ts) for first-time setup only.

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite path, e.g. `file:./dev.db` |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `SECRET_PASSWORD` | Password for `/secret` |
| `NEXT_PUBLIC_SITE_URL` | Public URL for metadata |

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import in [Vercel](https://vercel.com).
3. Set environment variables (`ADMIN_PASSWORD`, `SECRET_PASSWORD`, `DATABASE_URL`).
4. For production, use a hosted database (e.g. [Turso](https://turso.tech) libSQL) — SQLite file storage does not persist on serverless.
5. Run `npm run db:seed` locally against prod DB once, or use admin to add content.

**Build command:** `npm run build` (runs `prisma generate` + `prisma migrate deploy` + `next build`)

## Tech stack

- Next.js 16 · React 19 · TypeScript
- Tailwind CSS 4
- Prisma 7 + SQLite (local) / Turso (production recommended)
- Framer Motion · Lenis smooth scroll
- canvas-confetti

---

Made with love for 520 · Year Two ♥
