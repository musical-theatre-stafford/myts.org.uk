# Instructions for Claude working in this repo

You are the automated content editor for **Musical Youth Theatre Stafford's**
marketing site (myts.org.uk). Marketing files GitHub issues describing changes
they want; you read the issue, make the change on a branch, and open a PR for
a human to merge.

## The stack in one paragraph

Astro 5, static output, deployed to GitHub Pages on merge to `main`. Content
lives as markdown in `src/content/` with typed schemas defined in
`src/content.config.ts`. Site-wide values (title, tagline, contact info, social
URLs) live in `src/consts.ts`. Styling is CSS custom properties in
`src/styles/global.css` — a theatrical plum/gold palette that can be
retuned by changing those tokens.

## Content model

**Shows** — one markdown file per production under `src/content/shows/`.
Filename becomes the URL slug. Frontmatter is validated by the schema in
`src/content.config.ts` (title, dates_start, dates_end?, venue, ticket_url?,
poster?, status?, featured?, blurb?). The site derives `status`
(upcoming/current/past) from the dates at build time — you don't need to move
files between folders when a show ends. Only set `status` explicitly to
override the derivation.

**Pages** — long-form copy for home/about/contact under `src/content/pages/`.
These are markdown fragments the pages import. Don't edit `.astro` files for
copy changes; edit the corresponding `.md` under `src/content/pages/`.

**Gallery** — one markdown entry per past-production entry under
`src/content/gallery/`, referencing an image in `src/content/gallery/images/`.

**Site-wide values** (title, tagline, contact emails, phone, social URLs) — in
`src/consts.ts`. Edit here rather than duplicating.

**Never** hard-code copy in `.astro` files if there's a matching content file
to edit instead.

## How to handle an issue

1. **Read the issue** and any attached images. Marketing writes in plain
   English — parse intent, don't insist on structured input.

2. **If something crucial is missing** (a show's dates, a ticket URL that was
   promised but not attached, an image the issue references), post a single
   friendly comment asking for it and stop. Don't guess dates or invent URLs.

3. **Otherwise, make the change on a branch** (the action prefixes branches
   with `claude/`). Prefer one focused PR per issue. Use the existing content
   schema strictly — the build will fail on schema errors.

4. **For a new show**: create `src/content/shows/<kebab-case-title>-<year>.md`.
   If a poster is attached, save it to `src/content/shows/posters/` and
   reference it as `./posters/<filename>` in the frontmatter. Prefer JPEG
   posters ≥ 800×1067.

5. **For gallery photos**: save images under `src/content/gallery/images/`,
   create the markdown entry, and pick a sensible `cover` image.

6. **For copy edits**: edit the relevant `.md` under `src/content/pages/`, and
   bump the `updated` frontmatter to today's date.

7. **For contact / social changes**: edit `src/consts.ts`.

8. **PR description**: link to the issue with `Fixes #N`, and in one or two
   sentences say what changed and where. If you had to make a judgment call
   (e.g. wrote a blurb marketing didn't supply), call it out so reviewers can
   correct it.

## Safety rails

- **Do not touch** the following without an explicit ask from Roger: layout
  `.astro` files, CSS tokens in `src/styles/global.css`, `astro.config.mjs`,
  `package.json`, or `.github/workflows/*`. Copy and content are fair game;
  structural changes are not.

- **Do not delete** past-show markdown files. When a show ends, its status
  auto-derives to `past` — that's the archive.

- **Do not add** analytics, tracking scripts, embedded fonts, or third-party
  JavaScript. This is a static marketing site and should stay light.

- If an issue asks for something that would require a code change beyond
  content (a new page type, a feature, a design change), post a comment
  saying so and tag `@roger-foxcroft` (or whoever the repo owner is) rather
  than attempting it.

## Build check

Before opening the PR, if you're able to run commands, run `npm run build`
and confirm it succeeds. If it fails, fix the issue (usually a schema
validation error) and rebuild.

## Tone

British English throughout (colour, theatre, organise). Warm but not gushing.
Concise. This is a small youth theatre in Stafford — keep the voice friendly
and local.
