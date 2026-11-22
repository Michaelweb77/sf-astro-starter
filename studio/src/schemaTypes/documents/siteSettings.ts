import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Ustawienia strony - singleton (jeden dokument o _id "siteSettings").
 * Zasila naglowek, stopke i domyslne SEO we frontendzie.
 */
const link = defineArrayMember({
  type: 'object',
  name: 'link',
  fields: [
    defineField({
      name: 'label',
      title: 'Etykieta',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'Adres',
      type: 'string',
      description: 'Na stronie: /o-nas. Na zewnątrz: https://…',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {select: {title: 'label', subtitle: 'href'}},
})

export default defineType({
  name: 'siteSettings',
  title: 'Ustawienia strony',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nazwa strony',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Opis domyślny',
      type: 'text',
      rows: 3,
      description: 'Używany w wynikach wyszukiwania, gdy strona nie ma własnego opisu.',
      validation: (Rule) =>
        Rule.required().max(160).warning('Opisy dłuższe niż 160 znaków są obcinane.'),
    }),
    defineField({
      name: 'navLinks',
      title: 'Nawigacja',
      type: 'array',
      of: [link],
    }),
    defineField({
      name: 'socials',
      title: 'Social media',
      type: 'array',
      of: [link],
    }),
    defineField({
      name: 'ogImage',
      title: 'Domyślny obraz udostępniania',
      type: 'image',
      description: 'Podgląd linku na Facebooku, LinkedInie itp. Zalecany rozmiar 1200 × 630 px.',
      options: {hotspot: true},
    }),
  ],
  preview: {
    prepare: () => ({title: 'Ustawienia strony'}),
  },
})
