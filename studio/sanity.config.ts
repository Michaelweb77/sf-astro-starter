import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {codeInput} from '@sanity/code-input'
import {defineDocuments, defineLocations, presentationTool} from 'sanity/presentation'
import {schemaTypes, singletonTypes} from './src/schemaTypes'

// Projekt i dataset ze zmiennych - npm create sanity wpisuje je do studio/.env
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// Adres frontendu w trybie podgladu (PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true)
const previewUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:4321'

export default defineConfig({
  name: 'default',
  title: 'Astro + Sanity Starter',
  projectId,
  dataset,
  plugins: [
    structureTool({
      // Ustawienia jako jeden staly dokument na gorze listy, reszta typow pod spodem
      structure: (S) =>
        S.list()
          .title('Treść')
          .items([
            S.listItem()
              .title('Ustawienia strony')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => !singletonTypes.has(item.getId() ?? ''),
            ),
          ]),
    }),
    presentationTool({
      previewUrl,
      resolve: {
        // Adres w podgladzie -> dokument w panelu bocznym
        mainDocuments: defineDocuments([
          {
            route: '/post/:slug',
            filter: ({params}) => `_type == "post" && slug.current == "${params.slug}"`,
          },
        ]),
        // Dokument -> adres podgladu (przycisk „Otwórz w podglądzie” przy dokumencie)
        locations: {
          post: defineLocations({
            select: {title: 'title', slug: 'slug.current'},
            resolve: (doc) => ({
              locations: doc?.slug
                ? [
                    {title: doc?.title || 'Bez tytułu', href: `/post/${doc.slug}`},
                    {title: 'Strona główna', href: '/'},
                  ]
                : [],
            }),
          }),
          siteSettings: defineLocations({
            message: 'Ustawienia są widoczne na każdej stronie',
            tone: 'positive',
            locations: [{title: 'Strona główna', href: '/'}],
          }),
        },
      },
    }),
    visionTool(),
    codeInput(),
  ],
  schema: {
    types: schemaTypes,
    // Singletonow nie da sie utworzyc z menu „+ Utwórz”
    templates: (templates) => templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },
  document: {
    // ...ani zduplikowac czy usunac
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : input,
  },
})
