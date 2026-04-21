'use client';

import type { CSSProperties } from 'react';
import { isAvatarVideo } from '@/lib/avatar';
import {
  buildButtonStyle,
  getFontFamily,
  THEME_DEFAULTS,
  type AppliedTheme,
} from '@/lib/theme';

type PreviewProfile = {
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  footer_text: string | null;
};

type PreviewLink = {
  id: string;
  title: string;
  url: string;
  is_public: boolean;
};

export function PhonePreview({
  profile,
  links,
  theme,
}: {
  profile: PreviewProfile;
  links: PreviewLink[];
  theme?: AppliedTheme;
}) {
  const appliedTheme = theme ?? THEME_DEFAULTS;
  const publicLinks = links.filter((l) => l.is_public);
  const footer = profile.footer_text ?? 'Made with 💜 by kamori';

  const screenStyle: CSSProperties = {
    backgroundColor: appliedTheme.bg_color_1,
    fontFamily: getFontFamily(appliedTheme.font_family),
    fontWeight: Number(appliedTheme.font_weight),
  };
  const btnStyle: CSSProperties = {
    ...buildButtonStyle(appliedTheme),
    fontFamily: getFontFamily(appliedTheme.font_family),
    fontWeight: Number(appliedTheme.font_weight),
    fontSize: '11px',
  };

  return (
    <div className="mx-auto w-[280px] rounded-[2.5rem] bg-neutral-900 p-2 shadow-card">
      <div className="rounded-[2rem] overflow-hidden" style={screenStyle}>
        <div className="h-[560px] overflow-y-auto">
          <div className="relative w-full h-[168px] overflow-hidden">
            {profile.avatar_url ? (
              isAvatarVideo(profile.avatar_url) ? (
                <video
                  src={profile.avatar_url}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div
                className="flex items-center justify-center w-full h-full
                           bg-gradient-to-br from-brand-pink-soft via-brand-cream to-brand-lavender-soft"
              >
                <span className="text-3xl font-semibold text-neutral-900">
                  {profile.display_name.charAt(0)}
                </span>
              </div>
            )}
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/2"
              style={{
                background: `linear-gradient(to bottom, transparent 0%, ${appliedTheme.bg_color_1} 100%)`,
              }}
            />
          </div>

          <div className="px-4 pb-4 -mt-3 relative space-y-3">
            <section className="text-center space-y-1">
              <h1
                className="text-base font-semibold"
                style={{ color: appliedTheme.display_name_color }}
              >
                {profile.display_name}
              </h1>
              {profile.bio && (
                <p
                  className="text-[10px] leading-relaxed whitespace-pre-line"
                  style={{ color: appliedTheme.bio_color }}
                >
                  {profile.bio}
                </p>
              )}
            </section>

            <section>
              {publicLinks.length === 0 ? (
                <p
                  className="text-[10px] text-center py-4"
                  style={{ color: appliedTheme.bio_color }}
                >
                  준비 중이에요 🌱
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {publicLinks.map((link) => (
                    <li
                      key={link.id}
                      className="h-9 flex items-center justify-center px-3 truncate"
                      style={btnStyle}
                    >
                      <span className="truncate">{link.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {footer && (
              <footer className="pt-2 text-center">
                <p
                  className="text-[9px]"
                  style={{ color: appliedTheme.footer_color }}
                >
                  {footer}
                </p>
              </footer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
