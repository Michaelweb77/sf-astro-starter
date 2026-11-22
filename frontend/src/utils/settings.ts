import { getEntry } from "astro:content";
import { isPreview, previewClient } from "@/utils/sanity";
import { settingsQuery, toSettings, type SanitySettings } from "@/utils/queries";
import { settingsSchema, type Settings } from "@/utils/schemas";

// Ustawienia strony (nazwa, opis, nawigacja, social media, obraz OG) z dokumentu „Ustawienia strony”
export async function getSettings(): Promise<Settings> {
  if (isPreview) {
    const raw = await previewClient.fetch<SanitySettings | null>(settingsQuery);
    return settingsSchema.parse(toSettings(raw));
  }

  const entry = await getEntry("settings", "site");

  if (!entry) {
    throw new Error("Brak ustawien strony w content layer. Uruchom ponownie dev albo build.");
  }

  return entry.data;
}
