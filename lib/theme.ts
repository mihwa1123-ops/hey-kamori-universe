import type { CSSProperties } from 'react';

export type AppliedTheme = {
  bg_color_1: string;
  button_bg: string;
  button_text: string;
  button_border: string;
  button_style: string;
  button_radius: string;
  button_shadow: string;
  font_family: string;
  font_weight: string;
  display_name_color: string;
  bio_color: string;
  footer_color: string;
};

export const THEME_DEFAULTS: AppliedTheme = {
  bg_color_1: '#FDF9F3',
  button_bg: '#FFFFFF',
  button_text: '#2D2A3E',
  button_border: '#E5DFF5',
  button_style: 'solid',
  button_radius: 'rounder',
  button_shadow: 'soft',
  font_family: 'pretendard',
  font_weight: '500',
  display_name_color: '#2D2A3E',
  bio_color: '#737373',
  footer_color: '#737373',
};

const RADIUS_MAP: Record<string, string> = {
  square: '0',
  round: '0.5rem',
  rounder: '1.25rem',
  full: '9999px',
};

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  soft: '0 2px 8px rgba(45, 42, 62, 0.06)',
  strong: '0 4px 16px rgba(45, 42, 62, 0.14)',
  hard: '6px 6px 0 0 #2D2A3E',
};

const FONT_MAP: Record<string, string> = {
  pretendard:
    "'Pretendard Variable', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', system-ui, sans-serif",
  'noto-kr': "'Noto Sans KR', 'Noto Sans JP', sans-serif",
  'noto-jp': "'Noto Sans JP', 'Noto Sans KR', sans-serif",
  'plex-kr': "'IBM Plex Sans KR', 'Noto Sans JP', sans-serif",
};

export function getRadius(r: string): string {
  return RADIUS_MAP[r] ?? RADIUS_MAP.rounder;
}

export function getShadow(s: string): string {
  return SHADOW_MAP[s] ?? SHADOW_MAP.soft;
}

export function getFontFamily(f: string): string {
  return FONT_MAP[f] ?? FONT_MAP.pretendard;
}

export function buildButtonStyle(theme: {
  button_bg: string;
  button_text: string;
  button_border: string;
  button_style: string;
  button_radius: string;
  button_shadow: string;
}): CSSProperties {
  const base: CSSProperties = {
    color: theme.button_text,
    borderRadius: getRadius(theme.button_radius),
    boxShadow: getShadow(theme.button_shadow),
    borderStyle: 'solid',
  };

  if (theme.button_style === 'glass') {
    return {
      ...base,
      backgroundColor: `color-mix(in srgb, ${theme.button_bg} 55%, transparent)`,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderColor: `color-mix(in srgb, ${theme.button_border} 40%, transparent)`,
      borderWidth: '1px',
    };
  }
  if (theme.button_style === 'outline') {
    return {
      ...base,
      backgroundColor: 'transparent',
      borderColor: theme.button_border,
      borderWidth: '2px',
    };
  }
  return {
    ...base,
    backgroundColor: theme.button_bg,
    borderColor: theme.button_border,
    borderWidth: '1px',
  };
}
