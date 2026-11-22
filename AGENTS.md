# AGENTS.md

Astro + Sanity starter. npm workspaces: `studio/` (Sanity Studio) i `frontend/` (Astro 7). Node >= 22.12. Szczegóły w [README.md](README.md).

## Tryby frontendu

`PUBLIC_SANITY_VISUAL_EDITING_ENABLED` w `frontend/.env`:

- puste / `false`: SSG, dane z loaderów content layer (`src/utils/loaders.ts`), opublikowane treści,
- `true`: SSR, zapytania na żywo z perspektywą `drafts` i stegą, Visual Editing (`src/components/VisualEditing.astro`).

Nie importuj danych bezpośrednio z `astro:content` na stronach. Używaj funkcji z `src/utils/posts.ts` i `src/utils/settings.ts`, które obsługują oba tryby.

## Układ

- `frontend/src/utils/schemas.ts`: schematy Zod (kolekcje i tryb podglądu),
- `frontend/src/utils/queries.ts`: zapytania GROQ i mapowanie Sanity → kształt strony (bez `astro:content`, używane w loaderach),
- `frontend/src/utils/loaders.ts`: loadery content layer (posty, ustawienia) z cache i fallbackiem,
- `frontend/src/utils/sanity.ts`: klienci (`sanityClient`, `previewClient`), `isPreview`, obrazy (`toImage`, `toOgImage`),
- `frontend/src/utils/visual-editing.ts`: `sanityAttr()` dla pól bez stegi (obrazy),
- `studio/src/schemaTypes/`: `documents/` (`post`, `siteSettings` jako singleton), `objects/` (`blockContent`, `seo`).

Dodając typ treści: schemat w Studio → zapytanie i `toX()` w `queries.ts` → schemat Zod w `schemas.ts` → kolekcja w `content.config.ts` → funkcja z dwiema drogami w `src/utils/`.

## Komendy

- `npm install` w katalogu głównym,
- `npm run dev`: frontend :4321 i Studio :3333,
- `npm run build`: `astro check` + `astro build` frontendu,
- `npm run deploy:studio`.

## Aktualna dokumentacja

- Sanity: https://www.sanity.io/docs/llms.txt
- Astro: https://docs.astro.build

## Style (SCSS)

- `frontend/src/styles/global.scss` (tokeny, base, utilities) importowany w `layouts/Layout.astro`, a na jego górze `@use "reset"` z `reset.scss` (reset na bazie SF-STARTER, bez reguł Webflow),
- style komponentów w `<style lang="scss">` w samym komponencie (scoped), bez wspólnych mixinów,
- tokeny to custom properties (`var(--space-m)`), a nie zmienne `$`.
- `frontend/src/components/LayoutGrid.astro`: nakładka siatki kolumn (tylko dev, `Shift + G`), propsy `columns`, `columnsMd`, `columnsSm`, `gap`, `color`, `visible`, `enabled`. Szerokość z `.container`.
- zmienne z Webflow: `responsive.scss` (padding, kontenery, `--text--*`), `colors.scss` (paleta `--colors--*`, role `--themes--*` + `.theme-invert`, fonty `--font-family--*`),
- `text-style.scss`: mapa `$text-styles` generuje style `h1`–`h6` (+ `.text-style-h1`…), `.text-tiny`…`.text-large`, `.display1/2`, `body` = text-regular. Nowy styl / zmiana wagi = wpis w mapie.

## Szablon npm create sanity

Walidator CLI (`@sanity/template-validator`) odrzuca `.env.example`, jeśli gdziekolwiek w pliku, także w komentarzu, występuje wzorzec `\w+\s+=` (słowo, spacja, znak równości). Pliki `.env.example` muszą też zawierać `SANITY(_STUDIO)_PROJECT_ID` i `SANITY(_STUDIO)_DATASET`.
