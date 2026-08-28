# Changelog

All notable changes to Happy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 28/08/2026

### Added
- On Edit and Split, the empty-screen plus and the plus next to thumbnails both open the camera roll, same as **Pic**

## [1.0.2] - 28/08/2026

### Fixed
- Dokploy instructions now set **Compose Path** to `./docker-compose.yml`. A path of `/` made Dokploy run `docker compose -f /`, which fails with `EISDIR`

## [1.0.1] - 28/08/2026

### Added
- Dokploy `template.toml` so Happy can be deployed like IMGverse Search (Krafty org GitHub or Template Base URL — personal GitHub is not required)

### Fixed
- Smoke test copies `tests/smoke-test.env` to `.env` when missing, so GitHub Actions Compose no longer fails looking for `.env`

## [1.0.0] - 28/08/2026

### Added
- Mobile-first Seedream 5.0 Pro playground: **Create**, **Edit**, and **Split**
- Dokploy Docker Compose stack (`nginx` + Node app), same pattern as IMGverse Search
- Fal.ai calls stay on the server; `FAL_KEY` is never sent to the browser
- iPhone-friendly wording and errors (no API jargon)
- Pic upload from the camera roll, including iPhone HEIC conversion
- Save pic via the phone Share sheet
- Numbered **Pic 1 / Pic 2** labels so multi-pic edits can say which pic to swap
