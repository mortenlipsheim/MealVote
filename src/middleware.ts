import createMiddleware from 'next-intl/middleware';
import {pathnames, locales, localePrefix} from './navigation';
 
export default createMiddleware({
  defaultLocale: process.env.DEFAULT_LOCALE || 'en',
  locales,
  pathnames,
  localePrefix
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(de|en|fr|es|it|nl|no|sv|da|fi)/:path*',

    // Enable redirects that add a locale prefix
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
