import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LinkPreview } from '@/components/links/LinkPreview';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ContactBox } from '@/components/ContactBox';
import { THEME_DEFAULTS, getFontFamily } from '@/lib/theme';
import { isAvatarVideo } from '@/lib/avatar';
import { parseLang, t } from '@/lib/i18n';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio')
    .limit(1)
    .maybeSingle();

  const title = profile?.display_name ?? 'hey.kamori';
  const description = profile?.bio ?? '카모리의 작은 링크 허브 💜';

  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'hey.kamori',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
  };
}

export default async function PublicHomePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = parseLang(sp.lang);

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (!profile) {
    return (
      <main className="min-h-screen bg-brand-cream flex items-center justify-center px-4">
        <p className="text-sm text-neutral-500">{t(lang, 'notConfigured')}</p>
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
      'bg_color_1, button_bg, button_text, button_border, button_style, button_radius, button_shadow, font_family, font_weight, display_name_color, bio_color, footer_color'
    )
    .eq('profile_id', profile.id)
    .maybeSingle();

  const appliedTheme = theme ?? THEME_DEFAULTS;

  const { data: links } = await supabase
    .from('links')
    .select(
      'id, title, url, display_order, created_at, title_en, title_ja, title_es'
    )
    .eq('is_public', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  const pickLinkTitle = (l: {
    title: string;
    title_en: string | null;
    title_ja: string | null;
    title_es: string | null;
  }) => {
    if (lang === 'en') return l.title_en || l.title;
    if (lang === 'ja') return l.title_ja || l.title;
    if (lang === 'es') return l.title_es || l.title;
    return l.title;
  };

  const translatedLinks = (links ?? []).map((l) => ({
    id: l.id,
    url: l.url,
    title: pickLinkTitle(l),
  }));

  const bioForLang =
    (lang === 'en' ? profile.bio_en : null) ??
    (lang === 'ja' ? profile.bio_ja : null) ??
    (lang === 'es' ? profile.bio_es : null) ??
    profile.bio;

  const hasLinks = translatedLinks.length > 0;
  const footerText = profile.footer_text ?? t(lang, 'defaultFooter');

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: appliedTheme.bg_color_1,
        fontFamily: getFontFamily(appliedTheme.font_family),
        fontWeight: Number(appliedTheme.font_weight),
      }}
    >
      <div className="max-w-md mx-auto relative">
        <div className="absolute top-3 right-3 z-20">
          <LanguageSwitcher current={lang} theme={appliedTheme} />
        </div>
        <div
          className="relative w-full h-[30vh] min-h-[220px] max-h-[380px] overflow-hidden"
          style={{ backgroundColor: appliedTheme.bg_color_1 }}
        >
          {avatarUrl ? (
            isAvatarVideo(avatarUrl) ? (
              <video
                src={avatarUrl}
                className="block w-full h-full object-cover"
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
                className="block w-full h-full object-cover"
              />
            )
          ) : (
            <div
              className="flex items-center justify-center w-full h-full
                         bg-gradient-to-br from-brand-pink-soft via-brand-cream to-brand-lavender-soft"
            >
              <span className="text-6xl font-semibold text-neutral-900">
                {profile.display_name.charAt(0)}
              </span>
            </div>
          )}
          <div
            className="pointer-events-none absolute left-0 right-0 bottom-[-1px] h-3/5"
            style={{
              backgroundImage: `linear-gradient(to bottom, transparent 0%, ${appliedTheme.bg_color_1} 70%, ${appliedTheme.bg_color_1} 100%)`,
              backgroundColor: appliedTheme.bg_color_1,
            }}
          />
        </div>

        <div
          className="px-4 pb-10 -mt-8 relative space-y-6"
          style={{ backgroundColor: appliedTheme.bg_color_1 }}
        >
          <section className="text-center space-y-2">
            <h1
              className="text-2xl font-semibold"
              style={{ color: appliedTheme.display_name_color }}
            >
              {profile.display_name}
            </h1>
            {bioForLang && (
              <p
                className="text-sm leading-relaxed whitespace-pre-line"
                style={{ color: appliedTheme.bio_color }}
              >
                {bioForLang}
              </p>
            )}
          </section>

          {hasLinks ? (
            <section className="flex flex-col gap-3">
              {translatedLinks.map((link) => (
                <LinkPreview key={link.id} link={link} theme={appliedTheme} />
              ))}
            </section>
          ) : (
            <section className="py-10 text-center">
              <p className="text-sm text-neutral-500">{t(lang, 'emptyLinks')}</p>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <ContactBox
              email="hey.kamori@gmail.com"
              lang={lang}
              theme={appliedTheme}
            />
          </section>

          {footerText && (
            <footer className="pt-6 text-center">
              <p
                className="text-xs"
                style={{ color: appliedTheme.footer_color }}
              >
                {footerText}
              </p>
            </footer>
          )}
        </div>
      </div>
    </main>
  );
}
