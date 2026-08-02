# Gallery content

One markdown file per gallery entry. Frontmatter:

```yaml
---
title: Legally Blonde
year: 2017
cover: ./images/legally-blonde-2017-1.jpg   # relative to this file
credits: Photo by Jane Doe
---
```

Images should live under `src/content/gallery/images/` and Astro will optimise
them at build time. Prefer photos ≥ 1200×900 for good rendering.
