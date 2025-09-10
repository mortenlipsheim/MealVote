import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation';
 
export const locales = ['en', 'de', 'fr', 'es', 'it', 'nl', 'no', 'sv', 'da', 'fi'] as const;
export const localePrefix = 'always'; // Default
 
// The `pathnames` object holds pairs of internal
// and external paths, separated by locale.
export const pathnames = {
  // If all locales use the same pathname, a single
  // external path can be used for all locales.
  '/': '/',
  '/admin': '/admin',
 
  // If locales use different paths, you can
  // specify each external path per locale.
  '/vote/[pollId]': {
    en: '/vote/[pollId]',
    de: '/abstimmen/[pollId]',
    fr: '/voter/[pollId]',
    es: '/votar/[pollId]',
    it: '/votare/[pollId]',
    nl: '/stemmen/[pollId]',
    no: '/stemme/[pollId]',
    sv: '/rosta/[pollId]',
    da: '/stemme/[pollId]',
    fi: '/aanesta/[pollId]'
  }
} satisfies Pathnames<typeof locales>;
 
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createLocalizedPathnamesNavigation({locales, localePrefix, pathnames});