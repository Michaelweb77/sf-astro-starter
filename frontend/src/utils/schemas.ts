import { z } from "astro/zod";

// Jedno zrodlo prawdy o ksztalcie danych:
// - content.config.ts uzywa ich w kolekcjach (produkcja, walidacja w buildzie),
// - utils/posts.ts i utils/settings.ts parsuja nimi dane na zywo (tryb podgladu).

export const imageSchema = z.object({
  src: z.url(),
  alt: z.string(),
  width: z.number(),
  height: z.number(),
});

// Portable Text: looseObject, bo z.object wycialby tresc blokow
export const portableTextSchema = z.array(z.looseObject({ _type: z.string() }));

export const seoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.url().optional(),
});

export const postSchema = z.object({
  // _id i _type sa potrzebne do atrybutow Visual Editing (createDataAttribute)
  _id: z.string(),
  _type: z.literal("post"),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().optional(),
  publishedAt: z.coerce.date(),
  mainImage: imageSchema.optional(),
  body: portableTextSchema.default([]),
  seo: seoSchema,
});

const linkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const settingsSchema = z.object({
  _id: z.string(),
  _type: z.literal("siteSettings"),
  name: z.string(),
  description: z.string(),
  navLinks: z.array(linkSchema).default([]),
  socials: z.array(linkSchema).default([]),
  ogImage: z.url().optional(),
});

export type Post = z.infer<typeof postSchema>;
export type Settings = z.infer<typeof settingsSchema>;
