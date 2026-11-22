import blockContent from './objects/blockContent'
import seo from './objects/seo'
import post from './documents/post'
import siteSettings from './documents/siteSettings'

// Wszystkie typy schematu, rejestrowane w sanity.config.ts
export const schemaTypes = [siteSettings, post, blockContent, seo]

// Typy-singletony: jeden dokument, bez "Utwórz nowy" i bez usuwania
export const singletonTypes = new Set(['siteSettings'])
