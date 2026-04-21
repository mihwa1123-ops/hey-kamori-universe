'use client';

import type { CSSProperties } from 'react';
import { buildButtonStyle } from '@/lib/theme';

type LinkData = {
  id: string;
  title: string;
  url: string;
};

type LinkTheme = {
  button_bg: string;
  button_text: string;
  button_border: string;
  button_style: string;
  button_radius: string;
  button_shadow: string;
};

export function LinkPreview({
  link,
  theme,
}: {
  link: LinkData;
  theme?: LinkTheme;
}) {
  const handleClick = () => {
    if (typeof navigator === 'undefined' || !('sendBeacon' in navigator)) return;

    const payload = JSON.stringify({
      link_id: link.id,
      referrer:
        typeof document !== 'undefined' && document.referrer
          ? document.referrer
          : undefined,
    });
    navigator.sendBeacon(
      '/api/click',
      new Blob([payload], { type: 'application/json' })
    );
  };

  const themedStyle: CSSProperties | undefined = theme
    ? buildButtonStyle(theme)
    : undefined;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener"
      onClick={handleClick}
      style={themedStyle}
      className="flex items-center justify-center h-14 px-4 font-medium text-base
                 transition-all duration-200
                 hover:-translate-y-0.5
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lavender focus-visible:ring-offset-2
                 [&:not([style])]:rounded-2xl [&:not([style])]:bg-white [&:not([style])]:border [&:not([style])]:border-brand-lavender-soft [&:not([style])]:text-neutral-900 [&:not([style])]:shadow-soft"
    >
      {link.title}
    </a>
  );
}
