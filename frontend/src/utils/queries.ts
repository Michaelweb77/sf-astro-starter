import { stegaClean } from "@sanity/client/stega";
import type { TypedObject } from "astro-portabletext/types";
import { hasAsset, toImage, toOgImage, type SanityImage } from "@/utils/sanity";

// Zapytania GROQ i mapowanie surowych danych Sanity na ksztalt strony.
// Bez importow z astro:content - plik uzywaja tez loadery w content.config.ts.

// ---------- posty ----------

export interface SanityPost {
  _id: string;
  _type: "post";
  slug: string;
  title: string | null;
  excerpt: string | null;
  publishedAt: string;
  mainImage: SanityImage | null;
  body: TypedObject[] | null;
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: SanityImage | null;
  } | null;
}

const postFields = `
  _id,
  _type,
  "slug": slug.current,
  title,
  excerpt,
  "publishedAt": coalesce(publishedAt, _createdAt),
  mainImage,
  body,
  seo
`;

export const postsQuery = `*[_type == "post" && defined(slug.current)]
  | order(coalesce(publishedAt, _createdAt) desc) { ${postFields} }`;

export const postQuery = `*[_type == "post" && slug.current == $slug][0] { ${postFields} }`;

// GROQ zwraca null dla pustych pol, a Zod przy optional czeka na undefined - mostem jest ??
// stegaClean: w trybie podgladu stega wplata niewidoczne znaki w tekst, a slug i data musza byc czyste
export function toPost(raw: SanityPost) {
  const seoImage = raw.seo?.ogImage;
  const ogSource = hasAsset(seoImage) ? seoImage : raw.mainImage;

  return {
    _id: raw._id,
    _type: raw._type,
    slug: stegaClean(raw.slug),
    title: raw.title ?? "Bez tytułu",
    excerpt: raw.excerpt ?? undefined,
    publishedAt: stegaClean(raw.publishedAt),
    mainImage: hasAsset(raw.mainImage) ? toImage(raw.mainImage, 1600, 900) : undefined,
    body: raw.body ?? [],
    seo: {
      title: raw.seo?.metaTitle ?? undefined,
      description: raw.seo?.metaDescription ?? raw.excerpt ?? undefined,
      image: hasAsset(ogSource) ? toOgImage(ogSource) : undefined,
    },
  };
}

// ---------- ustawienia strony ----------

export interface SanitySettings {
  _id: string;
  _type: "siteSettings";
  name: string | null;
  description: string | null;
  navLinks: { label: string; href: string }[] | null;
  socials: { label: string; href: string }[] | null;
  ogImage: SanityImage | null;
}

export const settingsQuery = `*[_type == "siteSettings"][0] {
  _id,
  _type,
  name,
  description,
  navLinks[] { label, href },
  socials[] { label, href },
  ogImage
}`;

// Swiezy projekt nie ma jeszcze dokumentu ustawien - strona i tak ma sie zbudowac
export function toSettings(raw: SanitySettings | null) {
  const ogImage = raw?.ogImage;

  return {
    _id: raw?._id ?? "siteSettings",
    _type: "siteSettings" as const,
    name: raw?.name ?? "Nowy projekt",
    description: raw?.description ?? "Strona zbudowana na Astro i Sanity.",
    navLinks: (raw?.navLinks ?? []).map((el) => ({ label: el.label, href: stegaClean(el.href) })),
    socials: (raw?.socials ?? []).map((el) => ({ label: el.label, href: stegaClean(el.href) })),
    ogImage: hasAsset(ogImage) ? toOgImage(ogImage) : undefined,
  };
}
