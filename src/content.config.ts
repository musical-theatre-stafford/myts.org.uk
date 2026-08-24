import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Shows collection: one markdown file per production.
 * Marketing files an issue like "Add show: Grease, April 15–18, tickets: [link]"
 * and Claude creates a file under src/content/shows/.
 *
 * The `status` field is derived automatically from dates at render time,
 * but it can be overridden manually (e.g. to mark something "current" during a run).
 */
const shows = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './src/content/shows' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // ISO dates (YYYY-MM-DD). end defaults to start if omitted.
      dates_start: z.date(),
      dates_end: z.date().optional(),
      venue: z.string().default('Stafford Gatehouse Theatre'),
      ticket_url: z.string().url().optional(),
      poster: image().optional(),
      // Manual override; leave unset to let the site derive from dates.
      status: z.enum(['upcoming', 'current', 'past']).optional(),
      // Show it prominently on the homepage.
      featured: z.boolean().default(false),
      // Short one-line hook shown on cards.
      blurb: z.string().max(200).optional(),
      // Photo credit shown on the show page, e.g. "GCG Photography".
      photographer: z.string().optional(),
    }),
});

/**
 * Pages collection: long-form editable copy for home / about / contact panels.
 * Not one-page-per-file for routes (those live in src/pages/), but body copy
 * fragments that non-technical edits can target without touching .astro files.
 */
const pages = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    updated: z.date().optional(),
  }),
});

/**
 * Gallery: entries reference images in src/assets/gallery/.
 * Each entry becomes a card in the gallery grid.
 */
const gallery = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './src/content/gallery' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      year: z.number().int().gte(1990).lte(2100),
      cover: image(),
      credits: z.string().optional(),
    }),
});

/**
 * Alumni: former MYTS members who've gone on to careers in musical theatre or
 * the arts. One markdown file per person; the body is a short profile.
 */
const alumni = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './src/content/alumni' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      photo: image().optional(),
      // What they're best known for since MYTS (shown under their name).
      known_for: z.string().optional(),
      // Year they were last with MYTS — used to order the list (newest first).
      year_left: z.number().int().gte(1980).lte(2100).optional(),
      // Optional link to a profile or their own site.
      link: z.string().url().optional(),
    }),
});

export const collections = { shows, pages, gallery, alumni };
