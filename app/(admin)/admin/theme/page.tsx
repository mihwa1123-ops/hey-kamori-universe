import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ThemeManager, THEME_DEFAULTS } from '@/components/theme/ThemeManager';

export default async function AdminThemePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: theme } = await supabase
    .from('themes')
    .select(
      'bg_color_1, button_bg, button_text, button_border, button_style, button_radius, button_shadow, font_family, font_weight'
    )
    .eq('profile_id', user.id)
    .maybeSingle();

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <nav className="flex gap-2 text-sm flex-wrap">
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-full text-neutral-700 hover:bg-brand-pink-soft transition-colors"
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
            className="px-3 py-1.5 rounded-full bg-brand-lavender text-white font-medium"
          >
            테마
          </Link>
        </nav>
        <ThemeManager theme={theme ?? THEME_DEFAULTS} />
      </div>
    </div>
  );
}
