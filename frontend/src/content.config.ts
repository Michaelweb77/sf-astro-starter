import { defineCollection } from "astro:content";
import { postSchema, settingsSchema } from "@/utils/schemas";
import { sanityPostsLoader, sanitySettingsLoader } from "@/utils/loaders";

// Wszystkie tresci pochodza z Sanity. Schematy sa wspolne z trybem podgladu (utils/schemas.ts).

const posts = defineCollection({
  loader: sanityPostsLoader(),
  schema: postSchema,
});

const settings = defineCollection({
  loader: sanitySettingsLoader(),
  schema: settingsSchema,
});

export const collections = { posts, settings };
