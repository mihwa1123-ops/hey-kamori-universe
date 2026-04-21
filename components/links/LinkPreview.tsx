'use client';

import type { CSSProperties } from 'react';

type LinkData = {
  id: string;
  title: string;
  url: string;
};

type LinkTheme = {
  button_bg: string;
  button_text: string;
  button_border: string;
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
    ? {
        backgroundColor: theme.button_bg,
        color: theme.button_text,
        borderColor: theme.button_border,
      }
    : undefined;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener"
      onClick={handleClick}
      style={themedStyle}
      className="flex items-center justify-center h-14 rounded-2xl bg-white border border-brand-lavender-soft
                 px-4 text-base font-medium text-neutral-900
                 shadow-soft transition-all duration-200
                 hover:shadow-hover hover:-translate-y-0.5
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lavender focus-visible:ring-offset-2"
    >
      {link.title}
    </a>
  );
}
