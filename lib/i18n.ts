export type Lang = 'ko' | 'en' | 'ja' | 'es';

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇦🇺' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

type TranslationKey =
  | 'emptyLinks'
  | 'notConfigured'
  | 'defaultFooter'
  | 'contactCta'
  | 'copied';

const TRANSLATIONS: Record<Lang, Record<TranslationKey, string>> = {
  ko: {
    emptyLinks: '준비 중이에요 🌱',
    notConfigured: '아직 설정 중이에요 🌱',
    defaultFooter: 'Made with 💜 by kamori',
    contactCta: '✉️ 협업 & 광고 문의',
    copied: '복사됨',
  },
  en: {
    emptyLinks: 'Coming soon 🌱',
    notConfigured: 'Getting ready 🌱',
    defaultFooter: 'Made with 💜 by kamori',
    contactCta: '✉️ Collab & ad inquiries',
    copied: 'Copied',
  },
  ja: {
    emptyLinks: '準備中です 🌱',
    notConfigured: '準備中です 🌱',
    defaultFooter: 'Made with 💜 by kamori',
    contactCta: '✉️ コラボ・広告のお問い合わせ',
    copied: 'コピー済み',
  },
  es: {
    emptyLinks: 'Próximamente 🌱',
    notConfigured: 'Preparándose 🌱',
    defaultFooter: 'Made with 💜 by kamori',
    contactCta: '✉️ Colaboraciones y anuncios',
    copied: 'Copiado',
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
