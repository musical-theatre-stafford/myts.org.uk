// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Custom domain: myts.org.uk (see public/CNAME).
// If you ever deploy under username.github.io/myts.org.uk instead,
// change `site` to 'https://<username>.github.io' and set `base: '/myts.org.uk'`.
export default defineConfig({
  site: 'https://myts.org.uk',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  image: {
    // Astro handles image optimisation at build time via sharp.
    responsiveStyles: true,
  },
});
