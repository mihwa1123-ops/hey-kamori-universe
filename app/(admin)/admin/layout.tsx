import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChartBar, LayoutGrid, Lock, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

async function signOutAction() {
  'use server';
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

const NAV_ITEMS = [
  { href: '/admin', label: '링크 허브 설정', icon: LayoutGrid },
  { href: '/admin/stats', label: '통계', icon: ChartBar },
  { href: '/admin/password', label: '비밀번호', icon: Lock },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 md:flex">
      <aside className="bg-white border-b border-neutral-200 md:w-[200px] md:min-h-screen md:border-b-0 md:border-r md:flex md:flex-col md:shrink-0">
        <div className="hidden md:block px-6 py-5 border-b border-neutral-200">
          <h1 className="text-lg font-semibold text-neutral-900">hey.kamori</h1>
        </div>

        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible md:flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-6 py-4 md:py-3 text-sm text-neutral-700 hover:bg-brand-pink-soft transition-colors whitespace-nowrap"
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <form action={signOutAction} className="border-t border-neutral-200 p-4 md:mt-auto">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lavender focus-visible:ring-offset-2"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </form>
      </aside>

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
