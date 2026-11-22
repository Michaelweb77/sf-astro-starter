// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import { visualizer } from "rollup-plugin-visualizer";

// Config to zwykly Node - astro:env tu nie dziala. .env wczytujemy wbudowana funkcja Node
// (bez importu "vite" - nie jest bezposrednia zaleznoscia projektu).
// Na Vercelu pliku .env nie ma - zmienne sa juz w process.env.
try {
  process.loadEnvFile(".env");
} catch {
  // brak pliku .env - zostaja zmienne systemowe
}

const env = process.env;

// Dwa tryby z jednego kodu:
// - produkcja (zmienna pusta/false): SSG, opublikowane tresci, zero JS od Sanity
// - podglad (zmienna "true"): SSR, wersje robocze + Visual Editing dla Presentation tool
const isPreview = env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true";

// Strony, ktore nie maja trafic do sitemapy
const excludedPaths = ["/404"];

// https://astro.build/config
export default defineConfig({
  site: env.PUBLIC_SITE_URL || "http://localhost:4321",

  output: isPreview ? "server" : "static",
  adapter: vercel(),

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },

  fonts: [
    {
      name: "Inter",
      cssVariable: "--font-body",
      provider: fontProviders.fontsource(),
      weights: [400, 700],
      styles: ["normal", "italic"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["sans-serif"],
    },
  ],

  image: {
    domains: ["cdn.sanity.io"],
  },

  env: {
    schema: {
      // Nazwy jak w szablonie Sanity - CLI (npm create sanity) wypelnia je samo
      PUBLIC_SANITY_STUDIO_PROJECT_ID: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_SANITY_STUDIO_DATASET: envField.string({
        context: "client",
        access: "public",
        default: "production",
      }),
      PUBLIC_SANITY_STUDIO_URL: envField.string({
        context: "client",
        access: "public",
        default: "http://localhost:3333",
      }),
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: envField.boolean({
        context: "client",
        access: "public",
        default: false,
      }),
      // Token tylko do odczytu - potrzebny wylacznie w trybie podgladu (wersje robocze)
      SANITY_API_READ_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },

  integrations: [
    sitemap({
      filter: (page) =>
        !excludedPaths.some((path) => new URL(page).pathname.startsWith(path)),
    }),
  ],

  vite: {
    plugins: [
      // npm ustawia npm_lifecycle_event na nazwe skryptu: raport tylko przy "analyze"
      process.env.npm_lifecycle_event === "analyze" &&
        visualizer({ filename: "stats.html", template: "treemap", gzipSize: true }),
    ],
  },
});
