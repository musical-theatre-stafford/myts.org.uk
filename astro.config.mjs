// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Public site URL — drives canonical tags, og:url and the sitemap.
// The apex myts.org.uk is now live (fronted by Cloudflare over the GitHub Pages
// origin, which still answers on preview.myts.org.uk via public/CNAME — that's
// deliberate and separate from the public URL below).
export default defineConfig({
  site: 'https://myts.org.uk',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  image: {
    // Astro handles image optimisation at build time via sharp.
    responsiveStyles: true,
  },
});
