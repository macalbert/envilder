import { ca } from './ca';
import { en } from './en';
import { es } from './es';
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
  return Object.prototype.hasOwnProperty.call(languages, lang)
    ? (lang as Lang)
    : defaultLang;
}

export function useTranslations(lang: string) {
  return translations[normalizeLang(lang)];
}

export function localizedPath(lang: string, path: string) {
  const normalized = normalizeLang(lang);
  if (normalized === defaultLang) return path;
  return `/${normalized}${path}`;
}
