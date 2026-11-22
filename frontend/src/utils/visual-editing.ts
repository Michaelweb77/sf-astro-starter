import { createDataAttribute } from "@sanity/visual-editing-standalone";
import { PUBLIC_SANITY_STUDIO_URL } from "astro:env/client";
import { isPreview } from "@/utils/sanity";

// Atrybut data-sanity dla pol, ktorych stega nie oznaczy (obrazy, liczby).
// Poza trybem podgladu zwraca undefined, wiec atrybut w ogole nie trafia do HTML.
export function sanityAttr(doc: { _id: string; _type: string }, path: string) {
  if (!isPreview) return undefined;

  return createDataAttribute({
    baseUrl: PUBLIC_SANITY_STUDIO_URL,
    id: doc._id,
    type: doc._type,
    path,
  }).toString();
}
