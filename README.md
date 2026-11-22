# Astro + Sanity Starter

Starter na bazie [sanity-template-astro-clean](https://github.com/sanity-io/sanity-template-astro-clean), przebudowany według kursu Astro:

- **`frontend/`**: Astro 7, domyślnie **SSG** (statyczny HTML, zero JS od Sanity),
- **`studio/`**: Sanity Studio z Presentation tool (podgląd z edycją po kliknięciu).

## Dwa tryby z jednego kodu

| | Produkcja | Podgląd |
|---|---|---|
| `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` | puste / `false` | `true` |
| Renderowanie | SSG (`output: "static"`) | SSR (`output: "server"`) |
| Dane | loadery content layer, opublikowane treści, cache + fallback | zapytania na żywo, wersje robocze + stega |
| Visual Editing | brak (nic nie trafia do przeglądarki) | `@sanity/visual-editing-standalone`, bez Reacta w projekcie |
| `robots.txt` | indeksowanie + sitemap | `Disallow: /`, wszystkie strony `noindex` |
| Hosting | główny projekt Vercel, build po publikacji (Deploy Hook) | drugi projekt Vercel z tego samego repo, chroniony hasłem |

Strony nie wiedzą, w którym trybie działają. Decyduje o tym `frontend/src/utils/posts.ts` i `settings.ts`: w produkcji czytają kolekcję, w podglądzie pytają Sanity bezpośrednio. Kształt danych i walidacja (Zod) są wspólne: `frontend/src/utils/schemas.ts`.

## Start

```shell
npm create sanity@latest -- --template <github-user>/astro-sanity-starter
```

CLI zaloguje Cię do Sanity, założy projekt i dataset, a ID wpisze do `frontend/.env` i `studio/.env`.

```shell
cd <nazwa-projektu>
npm install
npm run dev
```

Projekt używa **npm workspaces** (`frontend` i `studio`). Instaluj zawsze w katalogu głównym, a nie w `frontend/` czy `studio/` osobno.

- frontend: http://localhost:4321
- Studio: http://localhost:3333

Pierwsze kroki w Studio: uzupełnij **Ustawienia strony** (nazwa, opis, nawigacja), dodaj **Wpis** i opublikuj. W terminalu z frontendem wpisz `s` + Enter, żeby pobrać nowe dane bez restartu.

## Tryb podglądu lokalnie

1. W sanity.io/manage → projekt → **API → Tokens** utwórz token z uprawnieniem **Viewer**.
2. W `frontend/.env`:

   ```shell
   PUBLIC_SANITY_VISUAL_EDITING_ENABLED="true"
   SANITY_API_READ_TOKEN="sk…"
   ```

3. `npm run dev` i w Studio zakładka **Presentation**.

## Deploy

1. **Produkcja**: projekt Vercel z katalogiem głównym `frontend`, zmienne z `frontend/.env` bez trybu podglądu. W Vercel → Settings → Git → **Deploy Hooks** utwórz hook, a w sanity.io/manage → API → **Webhooks** wskaż jego adres (publikacja = nowy build).
2. **Podgląd**: drugi projekt Vercel z tego samego repo, `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true` i `SANITY_API_READ_TOKEN`. Włącz **Deployment Protection**, bo podgląd pokazuje wersje robocze. Adres wpisz w `studio/.env` jako `SANITY_STUDIO_PREVIEW_URL`.
3. **Studio**: `npm run deploy:studio`. Adres podglądu musi też być na liście **CORS origins** projektu Sanity.

## Konwencje (z kursu)

- alias `@/` → `frontend/src/`,
- sekrety tylko przez `astro:env` (schemat w `astro.config.mjs`),
- skrypty w komponentach: funkcja `initX(root)` zwraca `Cleanup`, klasa custom elementu tylko ją wywołuje (`src/scripts/types.ts`),
- style w **SCSS**: `src/styles/global.scss` (tokeny jako custom properties, base, utilities) + `src/styles/reset.scss`, skala 62.5% (1rem = 10px), style komponentów scoped w `<style lang="scss">`,
- `npm run analyze --workspace=frontend` generuje `frontend/stats.html` z mapą bundla.
