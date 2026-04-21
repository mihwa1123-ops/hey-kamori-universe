'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { Check, Copy } from 'lucide-react';
import {
  buildButtonStyle,
  getFontFamily,
  type AppliedTheme,
} from '@/lib/theme';
import { t, type Lang } from '@/lib/i18n';

export function ContactBox({
  email,
  lang,
  theme,
}: {
  email: string;
  lang: Lang;
  theme: AppliedTheme;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const ta = document.createElement('textarea');
        ta.value = email;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // 사용자가 권한 거부한 경우 등 — 조용히 무시
    }
  };

  const buttonStyle: CSSProperties = {
    ...buildButtonStyle(theme),
    fontFamily: getFontFamily(theme.font_family),
    fontWeight: Number(theme.font_weight),
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p
        className="text-sm text-center"
        style={{ color: theme.bio_color }}
      >
        {t(lang, 'contactCta')}
      </p>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`${email} ${t(lang, 'copied')}`}
        style={buttonStyle}
        className="flex items-center justify-center gap-2 h-14 px-4 w-full
                   transition-all duration-200 hover:-translate-y-0.5
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lavender focus-visible:ring-offset-2"
      >
        <span className="text-sm font-medium">{email}</span>
        {copied ? (
          <span className="flex items-center gap-1 text-success">
            <Check className="w-4 h-4" />
            <span className="text-xs">{t(lang, 'copied')}</span>
          </span>
        ) : (
          <Copy className="w-4 h-4 opacity-75" />
        )}
      </button>
    </div>
  );
}
