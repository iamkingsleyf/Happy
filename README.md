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

### 1. Create a Docker Compose service

1. In Dokploy → your Project → **Create Service** → **Docker Compose**
   > Choose **Docker Compose**, not "Application". Application will try Nixpacks and fail.
2. Select the GitHub account and the **Happy** repository (`iamkingsleyf/Happy`)
3. Branch: `main` · Build Path: `/` (repo root)

### 2. Add environment variables

Go to the **Environment** tab and paste:

```env
STACK_SLUG=happy
FAL_KEY=your_fal_api_key
```

Get a key at [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys).

> Set `STACK_SLUG=happy` **before the first deploy**.

### 3. Deploy

Click **Deploy**. Wait until both `nginx` and `app` are healthy.

### 4. Attach the domain

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
- **Edit** — tap **Pic**, pick a picture, type what to change, tap **Change**
- **Split** — add a pic, tap **Split** to cut it into pieces
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
