import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LinkManager } from '@/components/links/LinkManager';
import { THEME_DEFAULTS } from '@/lib/theme';

export default async function AdminHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: links }, { data: theme }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('display_name, bio, avatar_path, updated_at, footer_text')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('links')
        .select('id, title, url, is_public, click_count, display_order')
        .eq('profile_id', user.id)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase
        .from('themes')
        .select(
          'bg_color_1, button_bg, button_text, button_border, button_style, button_radius, button_shadow, font_family, font_weight, display_name_color, bio_color, footer_color'
        )
        .eq('profile_id', user.id)
        .maybeSingle(),
    ]);

  if (!profile) {
    return (
      <div className="p-4 md:p-8 text-center">
        <p className="text-sm text-neutral-500">프로필이 아직 설정되지 않았어요.</p>
      </div>
    );
  }

  const avatarUrl = profile.avatar_path
    ? `${
        supabase.storage.from('avatars').getPublicUrl(profile.avatar_path).data
          .publicUrl
      }?v=${encodeURIComponent(profile.updated_at)}`
    : null;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <nav className="flex gap-2 text-sm flex-wrap">
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-full bg-brand-lavender text-white font-medium"
          >
            링크
          </Link>
          <Link
            href="/admin/profile"
            className="px-3 py-1.5 rounded-full text-neutral-700 hover:bg-brand-pink-soft transition-colors"
          >
            프로필
          </Link>
          <Link
            href="/admin/theme"
            className="px-3 py-1.5 rounded-full text-neutral-700 hover:bg-brand-pink-soft transition-colors"
          >
            테마
          </Link>
        </nav>
        <LinkManager
          links={links ?? []}
          profile={{
            display_name: profile.display_name,
            bio: profile.bio,
            avatar_url: avatarUrl,
            footer_text: profile.footer_text ?? null,
          }}
          theme={theme ?? THEME_DEFAULTS}
        />
      </div>
    </div>
  );
}
