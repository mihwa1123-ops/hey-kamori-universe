import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LinkPreview } from '@/components/links/LinkPreview';
import { THEME_DEFAULTS, getFontFamily } from '@/lib/theme';
import { isAvatarVideo } from '@/lib/avatar';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio')
    .limit(1)
    .maybeSingle();

  const title = profile?.display_name ?? 'hey.kamori';
  const description = profile?.bio ?? '';

  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: { title, description },
  };
}

export default async function PublicHomePage() {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (!profile) {
    return (
      <main className="min-h-screen bg-brand-cream flex items-center justify-center px-4">
        <p className="text-sm text-neutral-500">아직 설정 중이에요 🌱</p>
      </main>
    );
  }

  const avatarUrl = profile.avatar_path
    ? `${
        supabase.storage.from('avatars').getPublicUrl(profile.avatar_path).data
          .publicUrl
      }?v=${encodeURIComponent(profile.updated_at)}`
    : null;

  const { data: theme } = await supabase
    .from('themes')
    .select(
      'bg_color_1, button_bg, button_text, button_border, button_style, button_radius, button_shadow, font_family, font_weight'
    )
    .eq('profile_id', profile.id)
    .maybeSingle();

  const appliedTheme = theme ?? THEME_DEFAULTS;

  const { data: links } = await supabase
    .from('links')
    .select('id, title, url, display_order, created_at')
    .eq('is_public', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  const hasLinks = (links?.length ?? 0) > 0;
  const hasSocial = Boolean(
    profile.social_instagram || profile.social_twitter || profile.social_youtube
  );

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: appliedTheme.bg_color_1,
        fontFamily: getFontFamily(appliedTheme.font_family),
        fontWeight: Number(appliedTheme.font_weight),
      }}
    >
      <div className="max-w-md mx-auto px-4 py-10 space-y-6">
        <section className="flex flex-col items-center text-center space-y-3">
          <div
            className="w-full aspect-square max-h-[400px] rounded-3xl overflow-hidden
                       bg-gradient-to-br from-brand-pink-soft via-brand-cream to-brand-lavender-soft
                       border border-brand-lavender-soft shadow-card"
          >
            {avatarUrl ? (
              isAvatarVideo(avatarUrl) ? (
                <video
                  src={avatarUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <span className="text-6xl font-semibold text-neutral-900">
                  {profile.display_name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            {profile.display_name}
          </h1>
          {profile.bio && (
            <p className="text-sm text-neutral-500 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          )}
        </section>

        {hasSocial && (
          <section className="flex justify-center gap-3 text-sm">
            {profile.social_instagram && (
              <a
                href={profile.social_instagram}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center h-11 px-3 rounded-full text-neutral-700 hover:bg-brand-pink-soft transition-colors"
              >
                Instagram
              </a>
            )}
            {profile.social_twitter && (
              <a
                href={profile.social_twitter}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center h-11 px-3 rounded-full text-neutral-700 hover:bg-brand-pink-soft transition-colors"
              >
                Twitter
              </a>
            )}
            {profile.social_youtube && (
              <a
                href={profile.social_youtube}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center h-11 px-3 rounded-full text-neutral-700 hover:bg-brand-pink-soft transition-colors"
              >
                YouTube
              </a>
            )}
          </section>
        )}

        {hasLinks ? (
          <section className="flex flex-col gap-3">
            {links!.map((link) => (
              <LinkPreview key={link.id} link={link} theme={appliedTheme} />
            ))}
          </section>
        ) : (
          <section className="py-10 text-center">
            <p className="text-sm text-neutral-500">준비 중이에요 🌱</p>
          </section>
        )}

        <footer className="pt-6 text-center">
          <p className="text-xs text-neutral-500">Made with 💜 by kamori</p>
        </footer>
      </div>
    </main>
  );
}
