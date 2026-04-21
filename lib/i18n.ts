export type Lang = 'ko' | 'en' | 'ja' | 'es';

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'ko', label: '한국어', short: '한' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ja', label: '日本語', short: '日' },
  { code: 'es', label: 'Español', short: 'ES' },
];

type TranslationKey = 'emptyLinks' | 'notConfigured' | 'defaultFooter';

const TRANSLATIONS: Record<Lang, Record<TranslationKey, string>> = {
  ko: {
    emptyLinks: '준비 중이에요 🌱',
    notConfigured: '아직 설정 중이에요 🌱',
    defaultFooter: 'Made with 💜 by kamori',
  },
  en: {
    emptyLinks: 'Coming soon 🌱',
    notConfigured: 'Getting ready 🌱',
    defaultFooter: 'Made with 💜 by kamori',
  },
  ja: {
    emptyLinks: '準備中です 🌱',
    notConfigured: '準備中です 🌱',
    defaultFooter: 'Made with 💜 by kamori',
  },
  es: {
    emptyLinks: 'Próximamente 🌱',
    notConfigured: 'Preparándose 🌱',
    defaultFooter: 'Made with 💜 by kamori',
  },
};

export function parseLang(raw: string | string[] | undefined): Lang {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (val === 'en' || val === 'ja' || val === 'es') return val;
  return 'ko';
}

export function t(lang: Lang, key: TranslationKey): string {
  return TRANSLATIONS[lang][key] ?? TRANSLATIONS.ko[key];
}
