# Happy

Self-hosted **Seedream 5.0 Pro** playground for creating, editing, and splitting images via [Fal.ai](https://fal.ai). Built for iPhone first. Same Dokploy Docker Compose pattern as IMGverse Search.

---

## Stack

| Service | Description |
|---------|-------------|
| **nginx** | Reverse proxy — only container on `dokploy-network`. Traefik handles SSL. |
| **app** | Node.js/Express — Fal.ai proxy (key stays on the server) + the playground UI |

There is no Redis. The Fal.ai key never goes to the browser.

---

## Deploy on Dokploy

Your **personal** GitHub (`iamkingsleyf`) does not need to be connected. Use the Krafty org GitHub (same account as IMGverse Search) or the public Git URL / template below.

### Option A: Compose from Krafty GitHub (same as IMGverse)

1. In Dokploy → your Project → **Create Service** → **Docker Compose**
   > Choose **Docker Compose**, not "Application". Application will try Nixpacks and fail.
2. Select the **Krafty-Sprouts-Media-LLC** GitHub account (not your personal account) and the **Happy** repository
3. Branch: `main` · **Compose Path:** `./docker-compose.yml`
   > Do **not** set Compose Path to `/`. Dokploy passes that as `-f /`, which is a directory and fails with `EISDIR`.

### Option B: One-click template (no GitHub account picker)

1. In Dokploy → **Projects** → **Create Service** → **Template**
2. Set the **Base URL** to:
   ```
   https://raw.githubusercontent.com/Krafty-Sprouts-Media-LLC/Happy/main
   ```
3. Find **Happy** and click **Create**

### Option C: Public Git URL (no GitHub login at all)

If Dokploy offers a plain **Git** source (not GitHub OAuth):

- Repository URL: `https://github.com/Krafty-Sprouts-Media-LLC/Happy.git`
- Branch: `main`
- Compose Path: `./docker-compose.yml`

The repo is public, so Dokploy can clone it without connecting `iamkingsleyf`.

### Environment variables

After the service exists, go to the **Environment** tab and paste:

```env
STACK_SLUG=happy
FAL_KEY=your_fal_api_key
```

Get a key at [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys).

> Set `STACK_SLUG=happy` **before the first deploy**.

### Deploy

Click **Deploy**. Wait until both `nginx` and `app` are healthy.

### Attach the domain

Go to **Domains** → **Add Domain**:

| Field | Value |
|-------|-------|
| **Service Name** | `nginx` |
| **Host** | `happy.yourdomain.com` (your real domain) |
| **Path** | `/` |
| **Internal Path** | `/` |
| **Container Port** | `80` |

> Service Name must be `nginx`. That is the only container on `dokploy-network`. Do not put a public domain on `app`.

Traefik will issue SSL. No SSH required.

---

## What she will see

On her iPhone:

- **Create** — type what she wants, tap **Make**
- **Edit** — tap the plus or **Pic**, pick a picture, type what to change, tap **Change**
- **Split** — tap the plus, add a pic, tap **Split** to cut it into pieces
- **Size** — Best, Square, Tall, or Wide, and how many pictures

Errors are plain English, for example: “Tell me what picture you want.”

---

## Local development

```bash
cp .env.example .env
# put your FAL_KEY in .env

docker compose up --build
```

Open http://localhost (port 80).

To try the UI without Docker, open `demo.html` in a browser (Create / Edit / Split work as a clickable preview).

---

## Tests

```bash
cd app
npm test
```

From the repo root (needs Docker):

```bash
bash tests/smoke-test.sh
```

---

## Environment variables

See [`.env.example`](.env.example).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STACK_SLUG` | Yes | `happy` | Short prefix for any Docker volume names |
| `FAL_KEY` | Yes | — | Fal.ai API key. Server-only. |
| `PORT` | No | `3000` | App listen port inside Docker |

---

*Happy — make a picture, change a pic, split it into pieces.*
