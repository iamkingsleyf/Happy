<!-- AGENTS.md — Happy agent instructions -->
# AGENTS.md

Instructions for AI agents and contributors working on **Happy**.

## Versioning and releases (required)

**Every change that ships must be versioned, tagged, and pushed.**

1. Update `CHANGELOG.md` with a new `[x.y.z]` section (never edit old versions). Date format: `dd/MM/yyyy`.
2. Bump the version in `meta.json` and `app/package.json`.
3. Verify: `cd app && npm test`, then smoke-test when Docker is available.
4. Commit only when the user asks.
5. Tag and push: `git tag vX.Y.Z && git push origin main && git push origin vX.Y.Z`

## Conventions

- KISS / YAGNI / DRY.
- WordPress-style file headers on new source files.
- UI copy must be clear to a non-technical iPhone user. No Fal / API / key jargon on screen.
- Log technical errors server-side with `[Happy/...]` prefixes.
- Do not modify `@since` tags when editing existing code.

## Key paths

| Path | Purpose |
|------|---------|
| `app/src/server.js` | Express entry |
| `app/src/routes/studio.js` | Create / Edit / Split |
| `app/public/index.html` | Playground UI |
| `demo.html` | Clickable UI preview (no backend) |
| `CHANGELOG.md` | Release notes |
| `meta.json` | Stack version |
