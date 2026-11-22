import { createClient } from "@sanity/client";
import { stegaClean } from "@sanity/client/stega";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import {
  PUBLIC_SANITY_STUDIO_DATASET,
  PUBLIC_SANITY_STUDIO_PROJECT_ID,
  PUBLIC_SANITY_STUDIO_URL,
  PUBLIC_SANITY_VISUAL_EDITING_ENABLED,
} from "astro:env/client";
import { SANITY_API_READ_TOKEN } from "astro:env/server";

// true = tryb podgladu (SSR, wersje robocze, Visual Editing). Ta sama zmienna steruje output w astro.config.mjs
export const isPreview = PUBLIC_SANITY_VISUAL_EDITING_ENABLED;

// Bez ID projektu klient Sanity rzuca malo czytelnym bledem - mowimy wprost, co poprawic
if (!PUBLIC_SANITY_STUDIO_PROJECT_ID) {
  throw new Error(
    "Brak PUBLIC_SANITY_STUDIO_PROJECT_ID. Skopiuj frontend/.env.example jako frontend/.env i wpisz ID projektu Sanity (sanity.io/manage).",
  );
}

if (isPreview && !SANITY_API_READ_TOKEN) {
  console.warn(
    "[sanity] Tryb podgladu bez SANITY_API_READ_TOKEN - wersje robocze nie beda widoczne.",
  );
}

// Opublikowane tresci: loadery w buildzie (produkcja)
export const sanityClient = createClient({
  projectId: PUBLIC_SANITY_STUDIO_PROJECT_ID,
  dataset: PUBLIC_SANITY_STUDIO_DATASET,
  apiVersion: "2026-11-01",
  // build pobiera dane raz - CDN nic nie przyspiesza, a moze oddac stara kopie
  useCdn: false,
  perspective: "published",
});

// Wersje robocze + stega: zapytania na zywo w trybie podgladu
export const previewClient = sanityClient.withConfig({
  perspective: "drafts",
  token: SANITY_API_READ_TOKEN,
  stega: {
    enabled: true,
    studioUrl: PUBLIC_SANITY_STUDIO_URL,
  },
});

// ---------- obrazy ----------

export interface SanityImage {
  _type?: "image";
  asset?: { _ref: string };
  alt?: string;
  hotspot?: unknown;
  crop?: unknown;
}

export interface ImageData {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const imageBuilder = createImageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return imageBuilder.image(source);
}

export function hasAsset(image: SanityImage | null | undefined): image is SanityImage {
  return Boolean(image?.asset?._ref);
}

// Obraz Sanity -> props dla <Image> z astro:assets (zdalny obraz wymaga width i height)
export function toImage(image: SanityImage, width: number, height: number): ImageData {
  return {
    src: urlFor(image as SanityImageSource).width(width).height(height).url(),
    alt: stegaClean(image.alt) ?? "",
    width,
    height,
  };
}

// Obraz Open Graph: 1200 x 630, kadr wedlug hotspotu
export function toOgImage(image: SanityImage) {
  return urlFor(image as SanityImageSource).width(1200).height(630).url();
}
