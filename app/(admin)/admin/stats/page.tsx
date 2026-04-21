import Link from 'next/link';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import { StatsChart } from '@/components/stats/StatsChart';

type Period = '7d' | '30d' | 'all';

function parsePeriod(raw: string | string[] | undefined): Period {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (val === '30d') return '30d';
  if (val === 'all') return 'all';
  return '7d';
}

function periodDays(period: Period): number | null {
  if (period === '7d') return 7;
  if (period === '30d') return 30;
  return null;
}

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params.period);
  const days = periodDays(period);
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const from = days ? new Date(now - days * 86400000) : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let eventsQuery = supabase
    .from('click_events')
    .select('clicked_at, link_id, session_id');
  if (from) eventsQuery = eventsQuery.gte('clicked_at', from.toISOString());

  const [{ data: events }, { data: links }] = await Promise.all([
    eventsQuery,
    supabase
      .from('links')
      .select('id, title, is_public')
      .eq('profile_id', user.id),
  ]);

  const eventList = events ?? [];
  const linkList = links ?? [];

  const totalClicks = eventList.length;
  const sessionSet = new Set<string>();
  eventList.forEach((e) => {
    if (e.session_id) sessionSet.add(e.session_id);
  });
  const totalSessions = sessionSet.size;
  const avgCtr =
    totalSessions > 0 ? (totalClicks / totalSessions).toFixed(2) : '—';

  // Daily aggregation
  const dailyCounts = new Map<string, number>();
  eventList.forEach((e) => {
    if (!e.clicked_at) return;
    const day = e.clicked_at.slice(0, 10);
    dailyCounts.set(day, (dailyCounts.get(day) ?? 0) + 1);
  });

  const dayRange = days ?? 30;
  const chartData: { date: string; clicks: number }[] = [];
  for (let i = dayRange - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    chartData.push({ date: key, clicks: dailyCounts.get(key) ?? 0 });
  }

  // Link ranking
  const linkMap = new Map(linkList.map((l) => [l.id, l]));
  const byLink = new Map<string, number>();
  eventList.forEach((e) => {
    if (e.link_id) byLink.set(e.link_id, (byLink.get(e.link_id) ?? 0) + 1);
  });
  const ranking = Array.from(byLink.entries())
    .map(([id, count]) => ({ id, count, link: linkMap.get(id) }))
    .filter((r) => r.link)
    .sort((a, b) => b.count - a.count);
  const rankingTotal = ranking.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-neutral-900">통계</h1>

        <div className="flex gap-2 text-sm">
          {(['7d', '30d', 'all'] as const).map((p) => (
            <Link
              key={p}
              href={`/admin/stats?period=${p}`}
              className={cn(
                'px-3 py-1.5 rounded-full transition-colors',
                p === period
                  ? 'bg-brand-lavender text-white font-medium'
                  : 'text-neutral-700 hover:bg-brand-pink-soft'
              )}
            >
              {p === '7d' ? '최근 7일' : p === '30d' ? '최근 30일' : '전체'}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="총 클릭 수" value={totalClicks.toLocaleString()} />
          <StatCard label="총 방문 수" value={totalSessions.toLocaleString()} />
          <StatCard label="평균 CTR" value={avgCtr === '—' ? '—' : `${avgCtr}`} />
        </div>

        <section className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-6 space-y-3">
          <h2 className="text-sm font-medium text-neutral-700">일자별 클릭</h2>
          <StatsChart data={chartData} />
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-6 space-y-3">
          <h2 className="text-sm font-medium text-neutral-700">링크별 순위</h2>
          {ranking.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8 text-center">
              아직 클릭 데이터가 없어요
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-neutral-500 border-b border-neutral-200">
                  <th className="py-2 font-medium">순위</th>
                  <th className="py-2 font-medium">링크</th>
                  <th className="py-2 font-medium text-right">클릭</th>
                  <th className="py-2 font-medium text-right">비중</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, idx) => {
                  const share = rankingTotal > 0 ? ((r.count / rankingTotal) * 100).toFixed(1) : '0';
                  return (
                    <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                      <td className="py-2 text-neutral-500">{idx + 1}</td>
                      <td className="py-2 text-neutral-900 flex items-center gap-1">
                        {!r.link?.is_public && (
                          <span className="text-xs text-neutral-500" aria-label="비공개">🔒</span>
                        )}
                        <span className={cn(!r.link?.is_public && 'text-neutral-500')}>
                          {r.link?.title}
                        </span>
                      </td>
                      <td className="py-2 text-right text-neutral-900 font-medium">
                        {r.count.toLocaleString()}
                      </td>
                      <td className="py-2 text-right text-neutral-500">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-1">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}
