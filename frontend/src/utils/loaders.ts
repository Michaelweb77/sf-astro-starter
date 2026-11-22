import type { Loader, LoaderContext } from "astro/loaders";
import { sanityClient } from "@/utils/sanity";
import {
  postsQuery,
  settingsQuery,
  toPost,
  toSettings,
  type SanityPost,
  type SanitySettings,
} from "@/utils/queries";

// Loadery content layer: dane z Sanity pobierane przy starcie dev i w buildzie.
// W dev: "s + Enter" w terminalu odswieza dane bez restartu.

async function fetchFromSanity<T>(query: string, context: LoaderContext) {
  const { store, logger, collection } = context;

  try {
    return await sanityClient.fetch<T>(query);
  } catch (error) {
    // Jest cache z poprzedniego pobrania - zostawiamy go, strona dalej sie buduje
    if (store.keys().length > 0) {
      logger.warn(`Brak polaczenia z Sanity, zostaja poprzednie dane. ${error}`);
      return undefined;
    }

    // Bez cache: blad, zeby nie opublikowac pustej strony
    throw new Error(`Nie udalo sie pobrac danych z Sanity (kolekcja „${collection}”).`, {
      cause: error,
    });
  }
}

export function sanityPostsLoader(): Loader {
  return {
    name: "sanity-posts",
    load: async (context) => {
      const { store, parseData, logger } = context;
      const raw = await fetchFromSanity<SanityPost[]>(postsQuery, context);

      if (!raw) return;

      // magazyn czyscimy dopiero po udanym pobraniu
      store.clear();

      for (const el of raw) {
        const post = toPost(el);
        const data = await parseData({ id: post.slug, data: post });
        store.set({ id: post.slug, data });
      }

      logger.info(`Pobrano posty z Sanity: ${raw.length}`);
    },
  };
}

export function sanitySettingsLoader(): Loader {
  return {
    name: "sanity-settings",
    load: async (context) => {
      const { store, parseData, logger } = context;
      const raw = await fetchFromSanity<SanitySettings | null>(settingsQuery, context);

      if (raw === undefined) return;

      if (raw === null) {
        logger.warn("Brak dokumentu „Ustawienia strony” w Sanity - uzywam wartosci domyslnych.");
      }

      const data = await parseData({ id: "site", data: toSettings(raw) });

      store.clear();
      store.set({ id: "site", data });
    },
  };
}
