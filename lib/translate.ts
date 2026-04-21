type TargetLang = 'en' | 'ja' | 'es';

async function translateOne(
  text: string,
  target: TargetLang
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const email = process.env.ADMIN_EMAIL ?? 'hey.kamori@gmail.com';
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    trimmed
  )}&langpair=ko|${target}&de=${encodeURIComponent(email)}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      responseData?: { translatedText?: string };
    };
    const translated = data.responseData?.translatedText?.trim();
    if (!translated) return null;
    const upper = translated.toUpperCase();
    if (upper.startsWith('NO QUERY') || upper.startsWith('MYMEMORY WARNING')) {
      return null;
    }
    return translated;
  } catch {
    return null;
  }
}

export async function translateToAll(text: string): Promise<{
  en: string | null;
  ja: string | null;
  es: string | null;
}> {
  if (!text.trim()) return { en: null, ja: null, es: null };
  const [en, ja, es] = await Promise.all([
    translateOne(text, 'en'),
    translateOne(text, 'ja'),
    translateOne(text, 'es'),
  ]);
  return { en, ja, es };
}
