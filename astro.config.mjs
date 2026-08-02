// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Custom domain: preview.myts.org.uk (see public/CNAME).
// Preview subdomain used during launch so the current live site stays up;
// switch `site` and public/CNAME to 'myts.org.uk' when cutting over to the apex.
export default defineConfig({
  site: 'https://preview.myts.org.uk',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  image: {
    // Astro handles image optimisation at build time via sharp.
    responsiveStyles: true,
  },
});
