# 다국어 대응 패턴 (Next.js 16 + Supabase)

hey.kamori 프로젝트에서 검증한 **URL 쿼리 기반 i18n 패턴**. 대전 소개 웹페이지·포트폴리오 등 다른 프로젝트에 동일 구조로 이식 가능.

---

## 🧭 설계 원칙

1. **URL 쿼리 파라미터**로 언어 상태 표현 (`/?lang=en`)
   - SSR 친화적 (서버가 언어 감지해서 적절한 콘텐츠 서빙)
   - 공유 가능한 링크 (특정 언어 버전 URL로 공유)
   - 검색엔진이 각 언어별로 인덱싱 가능
2. **UI 문구**는 코드 내 사전(`lib/i18n.ts`)에 정의
3. **사용자 콘텐츠**(bio, 버튼 타이틀 등)는 DB에 **언어별 컬럼** 추가
4. 번역이 비어 있으면 **기본 언어(한국어)로 폴백**
5. 관리자 폼에는 각 언어별 입력 필드를 기본 옆에 compact하게 배치

---

## 📁 파일 체크리스트 (새 프로젝트에 추가)

| 파일 | 역할 |
|---|---|
| `supabase/migrations/xxx_translations.sql` | 번역 컬럼 추가 |
| `lib/i18n.ts` | 언어 타입, 번역 사전, `parseLang`, `t()` 헬퍼 |
| `components/LanguageSwitcher.tsx` | 오른쪽 상단 드롭다운 |
| `app/<공개경로>/page.tsx` | `searchParams.lang` 읽고 번역 선택 |
| `app/<관리자>/actions.ts` | `updateX` 액션에 번역 필드 검증·저장 |
| `components/<Manager>.tsx` | 편집 폼에 번역 입력 블록 추가 |

---

## 1. DB 마이그레이션 (번역 대상 필드별)

```sql
-- supabase/migrations/YYYYMMDDhhmmss_add_translations.sql

-- 번역 대상 컬럼: 'bio' 와 'title' 라고 가정
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio_en TEXT,
  ADD COLUMN IF NOT EXISTS bio_ja TEXT,
  ADD COLUMN IF NOT EXISTS bio_es TEXT;

ALTER TABLE links
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_ja TEXT,
  ADD COLUMN IF NOT EXISTS title_es TEXT;
```

> **원칙**: "번역 가능"한 모든 사용자 입력 필드에 대해 `{field}_{lang}` 형태로 언어별 컬럼 추가.  
> **대체안**: 필드가 많으면 `translations JSONB` 한 컬럼으로 `{ "bio_en": ..., "title_en": ... }` 저장도 가능. 대신 타입 안전성은 떨어짐.

---

## 2. 언어 사전 `lib/i18n.ts`

```ts
export type Lang = 'ko' | 'en' | 'ja' | 'es';

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'ko', label: '한국어', short: '한' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ja', label: '日本語', short: '日' },
  { code: 'es', label: 'Español', short: 'ES' },
];

type TranslationKey = 'emptyState' | 'defaultFooter'; // 프로젝트별로 확장

const TRANSLATIONS: Record<Lang, Record<TranslationKey, string>> = {
  ko: { emptyState: '준비 중이에요 🌱', defaultFooter: 'Made with 💜' },
  en: { emptyState: 'Coming soon 🌱',    defaultFooter: 'Made with 💜' },
  ja: { emptyState: '準備中です 🌱',      defaultFooter: 'Made with 💜' },
  es: { emptyState: 'Próximamente 🌱',   defaultFooter: 'Made with 💜' },
};

export function parseLang(raw: string | string[] | undefined): Lang {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (val === 'en' || val === 'ja' || val === 'es') return val;
  return 'ko';
}

export function t(lang: Lang, key: TranslationKey): string {
  return TRANSLATIONS[lang][key] ?? TRANSLATIONS.ko[key];
}
```

---

## 3. 언어 전환 Switcher `components/LanguageSwitcher.tsx`

URL 쿼리만 바꾸는 가벼운 드롭다운. 외부 클릭 시 닫기.

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LANGS, type Lang } from '@/lib/i18n';

export function LanguageSwitcher({ current }: { current: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const currentLang = LANGS.find((l) => l.code === current) ?? LANGS[0];

  const switchTo = (code: Lang) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (code === 'ko') sp.delete('lang');
    else sp.set('lang', code);
    const query = sp.toString();
    router.push(`${pathname}${query ? `?${query}` : ''}`);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="언어 선택"
              className="w-11 h-11 rounded-full bg-white border shadow-sm text-sm font-semibold">
        {currentLang.short}
      </button>
      {open && (
        <ul className="absolute right-0 top-12 min-w-[140px] rounded-xl bg-white border shadow overflow-hidden">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button onClick={() => switchTo(l.code)}
                      className={`w-full text-left px-3 py-2 text-sm ${
                        l.code === current ? 'bg-brand-lavender-soft font-medium' : 'hover:bg-neutral-50'
                      }`}>
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

**팁**: 페이지가 테마(동적 색상)를 가진다면 `theme` prop을 받아서 `buildButtonStyle(theme)`을 트리거 버튼 인라인 스타일로 넣으면 하단 링크 버튼과 스타일이 일관됨.

---

## 4. 공개 페이지에서 언어 적용 (Server Component)

```tsx
import { parseLang, t } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default async function PublicPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = parseLang(sp.lang);

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('bio, bio_en, bio_ja, bio_es, ...')
    .limit(1).maybeSingle();

  const { data: links } = await supabase
    .from('links')
    .select('id, title, title_en, title_ja, title_es, url')
    .order('display_order', { ascending: true });

  // ✨ 언어별 필드 선택 (없으면 한국어로 폴백)
  const bioForLang =
    (lang === 'en' ? profile?.bio_en : null) ??
    (lang === 'ja' ? profile?.bio_ja : null) ??
    (lang === 'es' ? profile?.bio_es : null) ??
    profile?.bio;

  const translatedLinks = (links ?? []).map((l) => ({
    ...l,
    title:
      lang === 'en' ? l.title_en || l.title :
      lang === 'ja' ? l.title_ja || l.title :
      lang === 'es' ? l.title_es || l.title :
      l.title,
  }));

  return (
    <main>
      <div className="absolute top-3 right-3 z-20">
        <LanguageSwitcher current={lang} />
      </div>
      <h1>{profile?.display_name}</h1>
      <p>{bioForLang}</p>
      {translatedLinks.length === 0 && <p>{t(lang, 'emptyState')}</p>}
      {translatedLinks.map((l) => (
        <a key={l.id} href={l.url}>{l.title}</a>
      ))}
    </main>
  );
}
```

---

## 5. 관리자 폼에서 번역 입력

### 5.1 서버 액션 (actions.ts)

```ts
export type ProfileInput = {
  bio: string;
  bio_en?: string | null;
  bio_ja?: string | null;
  bio_es?: string | null;
  // ... 기타 필드
};

function normalizeTranslation(v: string | null | undefined): string | null {
  if (!v) return null;
  const trimmed = v.trim();
  return trimmed ? trimmed : null;
}

export async function updateProfile(input: ProfileInput) {
  // 검증
  if (input.bio.length > 100) return { error: '내용은 100자 이하' };
  for (const b of [input.bio_en, input.bio_ja, input.bio_es]) {
    if (b && b.length > 100) return { error: '번역 내용도 100자 이하' };
  }

  // 저장
  const { error } = await supabase.from('profiles').update({
    bio: input.bio,
    bio_en: normalizeTranslation(input.bio_en),
    bio_ja: normalizeTranslation(input.bio_ja),
    bio_es: normalizeTranslation(input.bio_es),
  }).eq('id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/');
  return { error: null };
}
```

### 5.2 클라이언트 폼 UI (compact 블록)

```tsx
<textarea value={bio} onChange={(e) => setBio(e.target.value)} />

<div className="rounded-lg bg-neutral-50 border p-3 space-y-3">
  <p className="text-xs text-neutral-500">내용 번역 (선택)</p>

  <label className="block space-y-1">
    <span className="text-xs text-neutral-500">English</span>
    <textarea value={bioEn} onChange={(e) => setBioEn(e.target.value)}
              placeholder="Short intro for English visitors" />
  </label>

  <label className="block space-y-1">
    <span className="text-xs text-neutral-500">日本語</span>
    <textarea value={bioJa} onChange={(e) => setBioJa(e.target.value)}
              placeholder="日本語の自己紹介" />
  </label>

  <label className="block space-y-1">
    <span className="text-xs text-neutral-500">Español</span>
    <textarea value={bioEs} onChange={(e) => setBioEs(e.target.value)}
              placeholder="Breve introducción en español" />
  </label>
</div>
```

**UX 원칙**: 번역 필드는 **primary 언어 바로 밑 회색 박스** 안에 묶어서 "선택 사항"임을 시각적으로 분리.

---

## 6. 트레이드오프 / 대안

| 결정 | 선택 | 대안 | 언제 대안이 나은가 |
|---|---|---|---|
| 언어 상태 저장 | URL `?lang=` | Cookie / localStorage | 개인 설정 영구 저장 필요 시 (단, SSR에선 Cookie 읽어야) |
| 라우팅 구조 | 단일 라우트 + 쿼리 | `/en/...` 서브패스 | SEO 중요하고 언어별 도메인·페이지 분리 필요 시 |
| 번역 저장 | 언어별 컬럼 | JSONB 단일 컬럼 | 언어 수가 가변·많음 (10개+) |
| 번역 방식 | 수동 입력 | DeepL/Google Translate API 자동 | 대량 콘텐츠·사용자 기대치가 "덜 완벽해도 OK" |
| 메타데이터 | 기본 언어만 | lang별 generateMetadata | SEO 언어별 최적화 필요 시 `<html lang="...">` 까지 |

---

## 7. 확장 팁

### 언어 1개 추가 (예: 중국어 `zh`)
1. `lib/i18n.ts` `Lang` 타입과 `LANGS` 배열, `parseLang`, `TRANSLATIONS` 에 `zh` 엔트리 추가
2. DB 마이그레이션으로 `bio_zh`, `title_zh` 등 컬럼 추가
3. server page 의 fallback chain에 `zh` 분기 추가
4. 관리자 폼에 `zh` 입력 블록 1개 추가

### 메타데이터 번역
```tsx
export async function generateMetadata({ searchParams }) {
  const lang = parseLang((await searchParams).lang);
  return {
    title: t(lang, 'siteTitle'),
    description: t(lang, 'siteDescription'),
  };
}
```

### OG 이미지 언어별
`app/opengraph-image.tsx` 에서도 `searchParams` 접근 가능. 언어별로 다른 폰트/문구 적용 가능.

---

## 8. 흔한 함정

1. **CHECK 제약 잊지 말기** — 기존 스키마에 `CHECK (field IN (...))` 있으면 번역 대상은 제외해야 함. 옛 프로젝트의 CHECK가 `en` 값 거부하는 실수 방지.
2. **`revalidatePath('/')`** — 번역 저장 후 공개 페이지 재검증 필수 (ISR 캐시 때문).
3. **`useSearchParams` Suspense 경계** — Next.js 16에서 `useSearchParams` 쓰는 컴포넌트는 `Suspense`로 감싸거나 `force-dynamic` 설정 필요할 수 있음 (공개 페이지가 이미 dynamic 이면 OK).
4. **링크 공유 캐시** — 카카오톡·Slack 등은 URL 처음 본 순간의 언어로 OG 캐시. 언어별 공유 고려 시 `?lang=en` 포함된 URL 써야 함.
5. **폰트 로딩** — 일본어·중국어 선택 시 적절한 CJK 폰트가 필요 (`Noto Sans JP` / `Noto Sans SC`). 프로젝트 초기에 폰트 스택 설계.

---

## 9. 대전소개 / 포트폴리오에 적용할 때

### 대전소개 웹페이지
- 번역 대상: 관광지 이름·설명, 공지사항, 카테고리 라벨, 버튼 CTA
- 한국어 원본 외 **영어·일본어·중국어 간체** 추천 (관광객 주요 국가)
- 이미지 캡션/alt 텍스트도 번역 필요 → `images.caption_en/ja/zh` 컬럼

### 포트폴리오
- 번역 대상: 프로젝트 타이틀·설명, 스킬 태그, About 문단, 연락 CTA
- **영어만 추가해도 충분**한 경우 많음 (글로벌 채용 담당자)
- 블로그 글은 **전용 언어별 포스트** (URL 분리)가 더 SEO 유리
