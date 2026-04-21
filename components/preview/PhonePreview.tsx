'use client';

import { isAvatarVideo } from '@/lib/avatar';

type PreviewProfile = {
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  social_youtube: string | null;
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
}: {
  profile: PreviewProfile;
  links: PreviewLink[];
}) {
  const publicLinks = links.filter((l) => l.is_public);
  const hasSocial = Boolean(
    profile.social_instagram || profile.social_twitter || profile.social_youtube
  );

  return (
    <div className="mx-auto w-[280px] rounded-[2.5rem] bg-neutral-900 p-2 shadow-card">
      <div className="rounded-[2rem] overflow-hidden bg-brand-cream">
        <div className="h-[560px] overflow-y-auto px-4 py-6">
          <section className="flex flex-col items-center text-center space-y-2">
            <div
              className="w-full aspect-square rounded-2xl overflow-hidden
                         bg-gradient-to-br from-brand-pink-soft via-brand-cream to-brand-lavender-soft
                         border border-brand-lavender-soft"
            >
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
                <div className="flex items-center justify-center w-full h-full">
                  <span className="text-3xl font-semibold text-neutral-900">
                    {profile.display_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-base font-semibold text-neutral-900">
              {profile.display_name}
            </h1>
            {profile.bio && (
              <p className="text-xs text-neutral-500 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            )}
          </section>

          {hasSocial && (
            <section className="flex justify-center gap-1 mt-3">
              {profile.social_instagram && (
                <span className="px-2 h-7 inline-flex items-center rounded-full text-[10px] text-neutral-700">
                  Instagram
                </span>
              )}
              {profile.social_twitter && (
                <span className="px-2 h-7 inline-flex items-center rounded-full text-[10px] text-neutral-700">
                  Twitter
                </span>
              )}
              {profile.social_youtube && (
                <span className="px-2 h-7 inline-flex items-center rounded-full text-[10px] text-neutral-700">
                  YouTube
                </span>
              )}
            </section>
          )}

          <section className="mt-4">
            {publicLinks.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-8">
                준비 중이에요 🌱
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {publicLinks.map((link) => (
                  <li
                    key={link.id}
                    className="h-10 rounded-xl bg-white border border-brand-lavender-soft shadow-soft px-3 flex items-center justify-center"
                  >
                    <span className="text-xs font-medium text-neutral-900 truncate">
                      {link.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <footer className="pt-4 text-center">
            <p className="text-[10px] text-neutral-500">Made with 💜 by kamori</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
