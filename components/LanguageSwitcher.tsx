'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LANGS, type Lang } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ current }: { current: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const currentLang = LANGS.find((l) => l.code === current) ?? LANGS[0];

  const switchTo = (code: Lang) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (code === 'ko') sp.delete('lang');
    else sp.set('lang', code);
    const query = sp.toString();
    router.push(`${pathname}${query ? `?${query}` : ''}`);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="언어 선택"
        className="w-11 h-11 rounded-full bg-white/85 backdrop-blur border border-neutral-200 shadow-soft
                   text-sm font-semibold text-neutral-900
                   hover:bg-white transition-colors
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lavender"
      >
        {currentLang.short}
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-12 min-w-[140px] rounded-xl bg-white border border-neutral-200 shadow-card overflow-hidden"
        >
          {LANGS.map((l) => (
            <li key={l.code} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l.code === current}
                onClick={() => switchTo(l.code)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm transition-colors',
                  l.code === current
                    ? 'bg-brand-lavender-soft text-neutral-900 font-medium'
                    : 'text-neutral-700 hover:bg-brand-pink-soft'
                )}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
