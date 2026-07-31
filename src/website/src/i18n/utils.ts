import { ca } from './ca';
import { en } from './en';
import { es } from './es';
import { localizedRoutes } from './localized-routes';
import type { Translations } from './types';

const translations: Record<string, Translations> = { en, ca, es };

export const languages = {
  en: 'English',
  ca: 'Català',
  es: 'Español',
};

export const defaultLang = 'en';

export type Lang = keyof typeof languages;

function normalizeLang(lang: string): Lang {
  return Object.hasOwn(languages, lang) ? (lang as Lang) : defaultLang;
}

export function useTranslations(lang: string) {
  return translations[normalizeLang(lang)];
}

function splitPath(path: string) {
  const match = path.match(/^([^?#]*)(.*)$/);
  return {
    pathname: match?.[1] || '/',
    suffix: match?.[2] || '',
  };
}

export function normalizePath(path: string) {
  const { pathname, suffix } = splitPath(path);
  const normalizedPathname =
    pathname === '/' ? '/' : `${pathname.replace(/\/+$/, '')}/`;

  return `${normalizedPathname}${suffix}`;
}

export function stripLocalePrefix(path: string) {
  const { pathname, suffix } = splitPath(path);
  const localePattern = Object.keys(languages).filter(
    (language) => language !== defaultLang,
  );
  const strippedPathname = pathname.replace(
    new RegExp(`^/(?:${localePattern.join('|')})(?=/|$)`),
    '',
  );

  return normalizePath(`${strippedPathname || '/'}${suffix}`);
}

export function localizedLanguages(path: string): readonly Lang[] {
  const { pathname } = splitPath(path);
  const normalizedPath = normalizePath(stripLocalePrefix(pathname));
  const routeLanguages = Object.hasOwn(localizedRoutes, normalizedPath)
    ? localizedRoutes[normalizedPath as keyof typeof localizedRoutes]
    : undefined;

  return (routeLanguages ?? [defaultLang]) as readonly Lang[];
}

export function localizedPath(lang: string, path: string) {
  const normalized = normalizeLang(lang);
  const { pathname, suffix } = splitPath(path);
  const normalizedPath = normalizePath(stripLocalePrefix(pathname));
  const selectedLanguage = localizedLanguages(normalizedPath).includes(
    normalized,
  )
    ? normalized
    : defaultLang;

  if (selectedLanguage === defaultLang) return `${normalizedPath}${suffix}`;
  return `/${selectedLanguage}${normalizedPath}${suffix}`;
}
