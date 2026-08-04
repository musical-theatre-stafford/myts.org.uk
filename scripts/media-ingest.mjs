#!/usr/bin/env node
/*
 * media-ingest.mjs — MYTS media pipeline (the reusable engine).
 *
 * For each original photo it generates two web derivatives:
 *   thumb   (<=500px longest edge)  — gallery grid
 *   display (<=1800px longest edge) — lightbox
 * both as webp, written under a staging tree that mirrors the R2 `_web/` prefix:
 *   <out>/<show-slug>/thumb/<name>.webp
 *   <out>/<show-slug>/display/<name>.webp
 * and it (re)writes a photo manifest the site build reads.
 *
 * It is INCREMENTAL: a photo whose thumb already exists is skipped (unless --force),
 * so re-runs only process new images — exactly what the Drive→R2 sync will need.
 * It does NOT upload; that's a separate `rclone copy` step (see README below).
 *
 * Usage:
 *   node scripts/media-ingest.mjs --root "<MYTS dir>" --out "<staging dir>" \
 *        [--show <slug>] [--limit N] [--force]
 *
 * Defaults: root = ~/Development/mts archive/MYTS
 *           out  = <root>/../_myts-web
 *           manifest = src/data/photo-manifest.json
 */
import sharp from 'sharp';
import { readdir, mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const HOME = process.env.HOME;
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
    return acc;
  }, [])
);

const ROOT = args.root || path.join(HOME, 'Development/mts archive/MYTS');
const OUT = args.out || path.join(ROOT, '..', '_myts-web');
const MANIFEST = args.manifest || 'src/data/photo-manifest.json';
const ONLY = args.show || null;
const LIMIT = args.limit ? parseInt(args.limit, 10) : Infinity;
const FORCE = !!args.force;

const THUMB = 500, DISPLAY = 1800;
const IMG_RE = /\.(jpe?g|png)$/i;
const isImage = (f) => IMG_RE.test(f) && !f.startsWith('.') && !/^programme\./i.test(f);

async function listShows(root) {
  const entries = await readdir(root, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_'))
    .map((e) => e.name)
    .filter((slug) => !ONLY || slug === ONLY)
    .sort();
}

async function processShow(slug) {
  const dir = path.join(ROOT, slug);
  const allFiles = await readdir(dir);
  const files = allFiles.filter(isImage).sort();
  const pdf = allFiles.find((f) => /^programme\.pdf$/i.test(f)) ?? null;
  if (files.length === 0) return pdf ? { photos: [], pdf } : null;

  const thumbDir = path.join(OUT, slug, 'thumb');
  const dispDir = path.join(OUT, slug, 'display');
  await mkdir(thumbDir, { recursive: true });
  await mkdir(dispDir, { recursive: true });

  const photos = [];
  let made = 0, skipped = 0;
  for (const file of files.slice(0, LIMIT)) {
    const name = file.replace(IMG_RE, '');
    const ext = path.extname(file).slice(1).toLowerCase();
    const src = path.join(dir, file);
    const thumbOut = path.join(thumbDir, `${name}.webp`);
    const dispOut = path.join(dispDir, `${name}.webp`);

    let meta;
    try {
      meta = await sharp(src).metadata();
    } catch (e) {
      console.warn(`  ! skip unreadable ${file}: ${e.message}`);
      continue;
    }
    if (!FORCE && existsSync(thumbOut) && existsSync(dispOut)) {
      skipped++;
    } else {
      const base = sharp(src).rotate(); // honour EXIF orientation
      await base.clone().resize(THUMB, THUMB, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 72 }).toFile(thumbOut);
      await base.clone().resize(DISPLAY, DISPLAY, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(dispOut);
      made++;
    }
    // record ORIGINAL dimensions (respect orientation) for layout/lightbox
    const w = meta.orientation && meta.orientation >= 5 ? meta.height : meta.width;
    const h = meta.orientation && meta.orientation >= 5 ? meta.width : meta.height;
    photos.push({ name, ext, w, h });
  }
  console.log(`  ${slug}: ${photos.length} photos (${made} generated, ${skipped} already done)${pdf ? ' +programme.pdf' : ''}`);
  return pdf ? { photos, pdf } : { photos };
}

async function loadManifest() {
  try { return JSON.parse(await readFile(MANIFEST, 'utf8')); } catch { return { shows: {} }; }
}

const shows = await listShows(ROOT);
console.log(`Ingesting ${shows.length} show(s) from ${ROOT}\n  → derivatives: ${OUT}\n  → manifest:    ${MANIFEST}\n`);
const manifest = await loadManifest();
for (const slug of shows) {
  const res = await processShow(slug);
  if (res) manifest.shows[slug] = res;
}
await mkdir(path.dirname(MANIFEST), { recursive: true });
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nDone. ${Object.keys(manifest.shows).length} show(s) in manifest.`);
console.log(`\nTo publish to R2 (after \`rclone\` remote \`r2\` is configured):`);
console.log(`  rclone copy "${ROOT}" r2:myts-media --exclude "_*/**" --transfers 8   # originals (mirror)`);
console.log(`  rclone copy "${OUT}" r2:myts-media/_web --transfers 8                 # thumb+display derivatives`);
