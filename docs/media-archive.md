# Media archive — design & setup plan

**Status:** Design agreed 2026-08-02 (store = **Cloudflare R2**). Not yet built.
Waiting on Roger to provision R2 + a Google service account and add the secrets
(see the checklist). Pick up from "When we build this" once that's done.

## Goal

Host lots of old show photos (and other media) **outside** GitHub Pages —
uploadable by non-technical marketing folk via Google, served publicly, indexed
and integrity-checked by the site build, and browsable by Claude.

## Architecture

```
Marketing → Google Shared Drive  ──rclone sync──▶  Cloudflare R2 (public)  ──▶  Astro build
 (drag & drop, agreed folders)     (nightly / on-demand)   media.myts.org.uk       reads manifest,
                                                            + Claude browses here    builds gallery,
                                                                                     links full-res
```

**Principles**
- **Drive is the inbox only** — never served from directly (Google keeps killing
  public image hotlinking; it's unreliable as a CDN).
- **R2 is the public store** — stable URLs, zero egress cost, S3-compatible so the
  build and Claude can browse it (via `rclone` / the S3 API).
- **Repo stays light** — only small thumbnails + a JSON manifest live in git;
  full-resolution images live on R2, referenced by URL.

## Components

### 1. Inbox — Google Shared Drive
- A **Shared Drive** (team-owned, stable IDs — not a personal Drive) e.g. "MYTS Media".
- The folder convention **is** the album structure:
  ```
  MYTS Media/
    Shows/
      2016 - Bugsy Malone/
        <any-filename>.jpg
      2019 - Godspell/
      2024 - The SpongeBob Musical/
    Events/            (future: galas, workshops, etc.)
  ```
  Folder name = `<YYY> - <Title>` carries the album's year + title, so marketing
  never touches the repo or writes frontmatter.
- Optional per-album `album.yml` sidecar (title override / description / cover
  photo) — decide at build time; folder name alone is enough to start.

### 2. Sync — rclone (GitHub Actions)
- rclone remotes: `gdrive` (Google **service account**, read-only) → `r2`.
- One-way mirror (Drive is the source of truth):
  `rclone sync "gdrive:MYTS Media" "r2:myts-media"`
- Triggers: **scheduled nightly** + **manual `workflow_dispatch`** ("Sync media now").
  (Later: let marketing trigger a sync via a labelled issue, if wanted.)
- Reuses Roger's existing rclone familiarity (`~/Development/mts-rclone`).

### 3. Store — Cloudflare R2
- Bucket `myts-media`, public via custom domain `media.myts.org.uk`.
- URLs like `https://media.myts.org.uk/shows/2019-godspell/photo-01.jpg`.
- Free ≤10 GB storage, **£0 egress** — effectively free at our scale for years.

### 4. Index / manifest + verify (build)
- A build step lists R2 and generates **`media-manifest.json`** (albums → files →
  dimensions, plus any `album.yml` metadata).
- Astro reads the manifest and generates the gallery/archive pages.
- **Verify** (Roger's "create/verify index" idea): the build **fails or warns** on
  - manifest entries missing from R2,
  - orphaned R2 files not in any album,
  - name/convention mismatches.
- **Thumbnails**: generate small webp thumbs (~400px) at sync or build time; keep
  *those* in git/Pages for speed, link full-res to R2. Keeps Pages well under its
  ~1 GB cap while the gallery stays snappy.

### 5. Gallery / archive pages (Astro)
- New archive route grouping by show + year; thumbnails → lightbox → full-res on R2.
- Decide whether the current in-repo `gallery` collection folds into this or stays
  separate (it's fine to keep the small curated gallery and add a bigger archive).

## Setup checklist (Roger — at leisure)

**Cloudflare / R2**
- [ ] Cloudflare account (free).
- [ ] Create R2 bucket `myts-media`.
- [ ] Connect a custom domain `media.myts.org.uk` to the bucket (Cloudflare gives the DNS target).
- [ ] Create an R2 API token → add repo secrets: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.

**Google**
- [ ] Create the Shared Drive "MYTS Media" and the `Shows/` folder structure.
- [ ] In Google Cloud: create a project, enable the **Drive API**, create a **service account**.
- [ ] Add the service-account email as a **Viewer** on the Shared Drive.
- [ ] Download the service-account JSON → repo secret `GDRIVE_SA_JSON`.

**DNS**
- [ ] `media.myts.org.uk` → R2 (per Cloudflare's instructions).

## Open decisions (park until build time)
1. **Thumbnails**: generate at sync (store thumbs in R2 too) vs at Astro build vs
   Cloudflare Images / on-the-fly transforms.
2. **Album metadata**: folder-name-only vs an `album.yml` sidecar for titles/covers.
3. **Sync trigger**: nightly only, or also a marketing-triggerable "publish now".
4. **Gallery**: migrate the existing `gallery` collection into the archive, or coexist.

## When we build this (Claude can do, once secrets exist)
1. Add the rclone **sync workflow** + secrets wiring.
2. Add **manifest generation + verify** step.
3. Build the **archive gallery** pages from the manifest.
4. **Prototype one album end-to-end first** (e.g. 2019 Godspell) before the full run.

**Cost:** effectively free — R2 free tier + zero egress, service account free, rclone free.
