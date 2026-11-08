import { en, type Dictionary } from './en';
import { ru } from './ru';
import { hy } from './hy';

export type Lang = 'en' | 'ru' | 'hy';

export const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ru', label: 'Русский', short: 'РУ' },
  { code: 'hy', label: 'Հայերեն', short: 'ՀԱ' },
];

const DICTIONARIES: Record<Lang, Dictionary> = { en, ru, hy };

export const LANG_STORAGE_KEY = 'ftt-lang';

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'ru' || value === 'hy';
}

/** {var} interpolation. */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match
  );
}

/**
 * Plural forms for count-based strings. Dictionary values use "|" separators:
 *   en: 'one|other'          ru: 'one|few|many'        hy: 'one'
 * Missing trailing forms fall back to the last form.
 */
function pluralIndex(lang: Lang, n: number): number {
  const abs = Math.abs(n);
  switch (lang) {
    case 'en':
      return abs === 1 ? 0 : 1;
    case 'ru': {
      const mod10 = abs % 10;
      const mod100 = abs % 100;
      if (mod10 === 1 && mod100 !== 11) return 0;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 1;
      return 2;
    }
    case 'hy':
      return 0;
  }
}

export function translate(
  lang: Lang,
  key: string,
  vars?: Record<string, string | number>
): string {
  const dict = DICTIONARIES[lang];
  let template: string | undefined = dict[key as keyof Dictionary];

  // Plural: key ends with a count variable — callers pass vars.n and the
  // value contains "|"-separated forms.
  if (template && template.includes('|') && vars && 'n' in vars) {
    const forms = template.split('|');
    template = forms[Math.min(pluralIndex(lang, Number(vars.n)), forms.length - 1)];
  }

  if (template === undefined) {
    // Fall back to English, then to the key itself.
    const enTemplate = en[key as keyof typeof en];
    template = enTemplate ?? key;
  }

  return interpolate(template, vars);
}
