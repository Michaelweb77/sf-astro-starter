import { getCollection, getEntry } from "astro:content";
import { isPreview, previewClient } from "@/utils/sanity";
import { postQuery, postsQuery, toPost, type SanityPost } from "@/utils/queries";
import { postSchema, type Post } from "@/utils/schemas";

// Jedna funkcja, dwie drogi:
// - produkcja: kolekcja z content layer (dane z buildu, cache, fallback),
// - podglad: zapytanie na zywo z wersjami roboczymi i stega.
// Strony nie wiedza, w ktorym trybie dzialaja.

export async function getPosts(): Promise<Post[]> {
  if (isPreview) {
    const raw = await previewClient.fetch<SanityPost[]>(postsQuery);
    return raw.map((el) => postSchema.parse(toPost(el)));
  }

  const entries = await getCollection("posts");

  return entries
    .map((el) => el.data)
    .sort((a, b) => b.publishedAt.valueOf() - a.publishedAt.valueOf());
}

export async function getPost(slug: string): Promise<Post | undefined> {
  if (isPreview) {
    const raw = await previewClient.fetch<SanityPost | null>(postQuery, { slug });
    return raw ? postSchema.parse(toPost(raw)) : undefined;
  }

  const entry = await getEntry("posts", slug);
  return entry?.data;
}
