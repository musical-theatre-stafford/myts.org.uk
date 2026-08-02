# Shows content

One markdown file per production. Filename becomes the URL slug
(e.g. `grease-2027.md` → `/shows/grease-2027/`).

## Frontmatter

```yaml
---
title: Grease                            # required
dates_start: 2027-04-15                  # required (YYYY-MM-DD)
dates_end: 2027-04-18                    # optional; defaults to dates_start
venue: Stafford Gatehouse Theatre        # optional; defaults as shown
ticket_url: https://...                  # optional; button hidden when absent
poster: ./posters/grease.jpg             # optional; relative to this file
status: upcoming | current | past        # optional; auto-derived from dates otherwise
featured: true                           # optional; boosts on homepage
blurb: One-line hook for the card.       # optional; ≤ 200 chars
---

Long-form description here. Markdown supported.
```

The site derives the show's status from `dates_start` / `dates_end` at build time,
so past shows automatically move to the gallery/archive with no manual step.
