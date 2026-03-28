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

export function useTranslations(lang: string) {
  const dict = translations[lang] || translations[defaultLang];
  return dict;
}

export function localizedPath(lang: string, path: string) {
  if (lang === defaultLang) return path;
  return `/${lang}${path}`;
}
