import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Home page only
    hero: z
      .object({
        eyebrow: z.string(),
        title: z.string(),
        tagline: z.string(),
        note: z.string().optional(),
      })
      .optional(),
    features: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          href: z.string(),
        }),
      )
      .optional(),
    pillars: z
      .object({
        eyebrow: z.string(),
        title: z.string(),
        items: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
          }),
        ),
      })
      .optional(),
    contact: z
      .object({
        eyebrow: z.string(),
        title: z.string(),
        general: z.object({ label: z.string(), email: z.string() }),
        copyright: z.object({ label: z.string(), email: z.string() }),
      })
      .optional(),
    // Legal pages only — set from a real source, never invented
    updated: z.string().optional(),
  }),
});

export const collections = { pages };
