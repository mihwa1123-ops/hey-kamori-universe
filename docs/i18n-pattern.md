# 다국어 대응 패턴 (Next.js 16 + Supabase)

URL 쿼리 기반 i18n. hey.kamori 프로젝트에서 검증됨. 다른 프로젝트에 이식 가능.

---

## 🔧 다른 프로젝트에서 쓰는 법 (3가지)

### A) Claude Code 새 세션에서 이 파일 참조
```
이 파일의 구조대로 i18n 적용해줘:
https://github.com/mihwa1123-ops/hey-kamori-universe/blob/main/docs/i18n-pattern.md
```
→ Claude가 WebFetch 로 읽고 적용.

### B) 파일 직접 복사
새 프로젝트 루트에서:
```bash
mkdir -p docs
curl -o docs/i18n-pattern.md \
  https://raw.githubusercontent.com/mihwa1123-ops/hey-kamori-universe/main/docs/i18n-pattern.md
```
→ Claude 에게 `docs/i18n-pattern.md 대로 붙여줘` 지시.

### B') 간단: 프로젝트 CLAUDE.md에 한 줄 추가
```
## 참조 패턴
- i18n: https://github.com/mihwa1123-ops/hey-kamori-universe/blob/main/docs/i18n-pattern.md
```
→ Claude 가 자동으로 로드.

### C) 이미 Claude 메모리에 저장됨
같은 Mac에서 새 Claude 세션 시작하면, 메모리의 레퍼런스 노트가 자동 참조됨 (`Claude, 다국어 적용해줘` → 과거 패턴 기억).

---

## 🧭 설계 원칙

1. URL 쿼리 `?lang=en|ja|es` 기반 (SSR 친화적)
2. UI 문구는 `lib/i18n.ts` 사전에, 사용자 콘텐츠는 **DB 언어별 컬럼**
3. 번역 없으면 기본 언어(한국어)로 폴백
4. 관리자 폼에는 번역 필드를 primary 필드 바로 밑 compact 블록으로

---

## 📁 추가할 파일 6개

| 파일 | 역할 |
|---|---|
| `supabase/migrations/xxx_translations.sql` | 번역 컬럼 추가 |
| `lib/i18n.ts` | 언어 타입·사전·헬퍼 |
| `components/LanguageSwitcher.tsx` | 오른쪽 상단 드롭다운 |
| `app/<공개>/page.tsx` | lang 감지 + 적절한 콘텐츠 |
| `app/<관리자>/actions.ts` | 번역 필드 저장 |
| `components/<Manager>.tsx` | 번역 입력 UI |

---

## 1. DB 마이그레이션

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio_en TEXT,
  ADD COLUMN IF NOT EXISTS bio_ja TEXT,
  ADD COLUMN IF NOT EXISTS bio_es TEXT;
-- 번역 대상 필드마다 _en/_ja/_es 반복
```

---

## 2. 언어 사전 `lib/i18n.ts`

```ts
export type Lang = 'ko' | 'en' | 'ja' | 'es';

export const LANGS = [
  { code: 'ko', label: '한국어', short: '한' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ja', label: '日本語', short: '日' },
  { code: 'es', label: 'Español', short: 'ES' },
] as const;

const T: Record<Lang, Record<string, string>> = {
  ko: { emptyState: '준비 중이에요 🌱' },
  en: { emptyState: 'Coming soon 🌱' },
  ja: { emptyState: '準備中です 🌱' },
  es: { emptyState: 'Próximamente 🌱' },
};

export function parseLang(raw: string | string[] | undefined): Lang {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === 'en' || v === 'ja' || v === 'es' ? v : 'ko';
}
export const t = (lang: Lang, key: string) => T[lang][key] ?? T.ko[key];
```

---

## 3. 언어 전환 `components/LanguageSwitcher.tsx`

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LANGS, type Lang } from '@/lib/i18n';

export function LanguageSwitcher({ current }: { current: Lang }) {
  const router = useRouter(); const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const switchTo = (code: Lang) => {
    const sp = new URLSearchParams(params.toString());
    code === 'ko' ? sp.delete('lang') : sp.set('lang', code);
    router.push(`${pathname}${sp.toString() ? `?${sp}` : ''}`);
    setOpen(false);
  };

  const cur = LANGS.find(l => l.code === current) ?? LANGS[0];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className="w-11 h-11 rounded-full bg-white border shadow-sm">
        {cur.short}
      </button>
      {open && (
        <ul className="absolute right-0 top-12 bg-white border rounded-xl shadow">
          {LANGS.map(l => (
            <li key={l.code}>
              <button onClick={() => switchTo(l.code)}
                className={`px-3 py-2 text-sm w-full text-left ${l.code === current ? 'bg-neutral-100 font-medium' : ''}`}>
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 4. 공개 페이지 통합

```tsx
export default async function Page({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const lang = parseLang((await searchParams).lang);
  const { data: p } = await supabase.from('profiles').select('bio, bio_en, bio_ja, bio_es').single();

  const bio = (lang === 'en' ? p?.bio_en : lang === 'ja' ? p?.bio_ja : lang === 'es' ? p?.bio_es : null) || p?.bio;

  return (
    <main>
      <LanguageSwitcher current={lang} />
      <p>{bio}</p>
      {!items.length && <p>{t(lang, 'emptyState')}</p>}
    </main>
  );
}
```

---

## 5. 관리자 폼 (번역 입력)

```tsx
<textarea value={bio} onChange={e => setBio(e.target.value)} />

<div className="rounded bg-neutral-50 border p-3 space-y-2">
  <p className="text-xs text-neutral-500">번역 (선택)</p>
  <input placeholder="English" value={bioEn} onChange={e => setBioEn(e.target.value)} />
  <input placeholder="日本語"   value={bioJa} onChange={e => setBioJa(e.target.value)} />
  <input placeholder="Español" value={bioEs} onChange={e => setBioEs(e.target.value)} />
</div>
```

Server action에서 저장:
```ts
await supabase.from('profiles').update({
  bio, bio_en: bioEn || null, bio_ja: bioJa || null, bio_es: bioEs || null,
}).eq('id', userId);
revalidatePath('/');
```

---

## ⚠️ 흔한 함정

1. **기존 CHECK 제약 확인** — 번역 대상 컬럼에 `CHECK (x IN (...))` 있으면 DROP 필요
2. **`revalidatePath('/')`** — 번역 저장 후 캐시 무효화 필수
3. **CJK 폰트** — 일본어·중국어 지원 시 `Noto Sans JP`/`SC` 스택 추가
4. **OG 썸네일 캐시** — 카톡·Slack은 URL 단위 캐시. 언어별 공유는 `?lang=en` 포함 URL 사용

---

## 💡 확장 팁

- **언어 추가 (예: 중국어 `zh`)**: `Lang` 타입·`LANGS`·DB 컬럼·fallback chain 각각에 1줄씩
- **Cookie 기반 선호 저장**: switcher 에서 `document.cookie` 작성 + server에서 읽기 (SSR 고려)
- **자동 번역**: DeepL/Google API 호출 → 번역 결과를 DB 컬럼에 저장 (수동 편집 가능하게)
- **URL 서브패스 `/en/...`**: SEO 강화 시 Next.js middleware로 prefix 라우팅

---

## 🎯 프로젝트별 적용 가이드

| 프로젝트 | 번역 대상 | 추천 언어 |
|---|---|---|
| **대전 소개** | 관광지 이름·설명, 카테고리 라벨, 이미지 alt | 한·영·일·중(간체) |
| **포트폴리오** | 프로젝트 타이틀/설명, About, CTA | 한·영만 (글로벌 채용용) |

대전 프로젝트는 관광지 이미지도 언어별 캡션 필요 → `images.caption_{lang}` 추가.
