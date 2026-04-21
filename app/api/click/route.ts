import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function parseDevice(ua: string | null): string {
  if (!ua) return 'unknown';
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iPhone/i.test(ua)) return 'mobile';
  return 'desktop';
}

function parseReferrerDomain(referrer: unknown): string | null {
  if (typeof referrer !== 'string' || !referrer) return null;
  try {
    return new URL(referrer).hostname;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as { link_id?: unknown }).link_id !== 'string'
  ) {
    return new NextResponse(null, { status: 400 });
  }

  const linkId = (body as { link_id: string }).link_id;
  const referrerRaw = (body as { referrer?: unknown }).referrer;

  const country = request.headers.get('x-vercel-ip-country');
  const device = parseDevice(request.headers.get('user-agent'));
  const referrer = parseReferrerDomain(referrerRaw);

  const existingSession = request.cookies.get('session_id')?.value;
  const sessionId = existingSession ?? crypto.randomUUID();

  const supabase = await createClient();
  const { error } = await supabase.from('click_events').insert({
    link_id: linkId,
    country,
    device,
    referrer,
    session_id: sessionId,
  });

  if (error) {
    return new NextResponse(null, { status: 500 });
  }

  const response = new NextResponse(null, { status: 204 });
  if (!existingSession) {
    response.cookies.set('session_id', sessionId, {
      maxAge: 60 * 60 * 24,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return response;
}
