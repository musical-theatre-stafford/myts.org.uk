# myts.org.uk

The website for **Musical Youth Theatre Stafford** — an Astro-built static
site deployed to GitHub Pages, edited by Claude on demand via GitHub issues.

## What lives where

```
src/
├── consts.ts               # site title, contact info, social URLs
├── content.config.ts       # schemas for shows / pages / gallery
├── content/
│   ├── shows/              # one .md per production
│   ├── pages/              # home / about / contact body copy
│   └── gallery/            # gallery entries + images
├── layouts/                # site chrome
├── components/             # header, footer, show card, social links
├── pages/                  # routes
└── styles/global.css       # brand tokens (plum + gold, cream bg)
```

`CLAUDE.md` at the repo root is the operating manual for Claude when it's
handling an issue — read it before making changes yourself, and update it if
you change conventions.

## Local development

```
npm install
npm run dev      # http://localhost:4321
npm run build    # writes to ./dist
npm run preview  # serve the built site locally
```

## Deployment

On every push to `main`, `.github/workflows/deploy.yml` builds the site with
`withastro/action@v3` and publishes to GitHub Pages. Deploys usually complete
in about a minute.

Custom domain lives in `public/CNAME` (contains `myts.org.uk`). If you're
setting this up for the first time, enable Pages in **Settings → Pages** with
"GitHub Actions" as the source, then add `myts.org.uk` as the custom domain.

## Marketing workflow (edits via GitHub issues)

Marketing team members (with **Write** access to the repo) open an issue in
plain English:

> **Title:** Show: Grease  
> **Body:** New show — Grease, 15–18 April 2027, Stafford Gatehouse Theatre.
> Tickets: https://.../. Poster attached.

The Claude GitHub Action fires, reads `CLAUDE.md`, makes the change on a
`claude/…` branch, and opens a PR. Roger or a trusted marketing lead reviews
the PR (the site preview URL appears in the PR checks) and merges. GitHub
Pages redeploys automatically.

Three ways to trigger Claude:

1. **Open a new issue** — the workflow fires on `opened`.
2. **Comment `@claude`** on an existing issue with more info or a follow-up.
3. **Label an issue `claude`** or **assign it to `claude`** — the workflow
   fires on both.

The issue templates in `.github/ISSUE_TEMPLATE/` are just gentle nudges;
free-form issues work equally well.

### Who can approve PRs

Repository settings should:

- Protect the `main` branch with a required PR review.
- Grant **Write** access to trusted marketing leads (this lets them approve
  and merge Claude's PRs).
- Keep **Admin** rights to Roger only.

## Setting up from scratch

1. **Create the GitHub repo** (public, named `myts.org.uk`).
2. **Push this repo** to it: `git init && git add . && git commit -m "Initial site" && git remote add origin git@github.com:<you>/myts.org.uk.git && git push -u origin main`.
3. **Enable Pages**: Settings → Pages → Source: **GitHub Actions**.
4. **Custom domain**: same page, set `myts.org.uk`. GitHub will verify DNS —
   you'll need an A record (or CNAME for `www`) pointing at GitHub Pages IPs.
   [Docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).
5. **Add the Anthropic secret**: Settings → Secrets and variables → Actions →
   New repository secret. Name `ANTHROPIC_API_KEY`, value = your Anthropic
   API key (starts `sk-ant-…`). Or run `/install-github-app` inside Claude
   Code to have it done automatically.
6. **Invite marketing leads** as collaborators with **Write** role.
7. **Test the workflow**: open an issue titled "Show: Test", body describing
   any fake show, and watch the Actions tab. Claude should comment on the
   issue and open a PR within a few minutes.

## Costs

- **GitHub Pages** — free for public repos.
- **Claude Code Action** — pay-as-you-go from your Anthropic account. Typical
  content-edit issue costs a few cents.

## Changing the look

All colours and fonts are CSS custom properties in
`src/styles/global.css`. Replace the six or so values under `:root { … }`
and the whole site retunes.
