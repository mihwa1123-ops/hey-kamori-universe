import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LinkManager } from '@/components/links/LinkManager';

export default async function AdminHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: links }] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'display_name, bio, avatar_path, social_instagram, social_twitter, social_youtube'
      )
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('links')
      .select('id, title, url, is_public, click_count, display_order')
      .eq('profile_id', user.id)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false }),
  ]);

  if (!profile) {
    return (
      <div className="p-4 md:p-8 text-center">
        <p className="text-sm text-neutral-500">프로필이 아직 설정되지 않았어요.</p>
      </div>
    );
  }

  const avatarUrl = profile.avatar_path
    ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_path).data
        .publicUrl
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
          profile={{ ...profile, avatar_url: avatarUrl }}
        />
      </div>
    </div>
  );
}
