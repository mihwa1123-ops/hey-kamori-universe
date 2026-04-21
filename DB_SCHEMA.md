# hey.kamori - DB_SCHEMA.md

> Supabase (Postgres) 전체 스키마 정의. **코드 작성 전에 이 문서가 먼저 확정**돼야 한다.
> 변경 시 반드시 `supabase/migrations/` 아래 SQL 파일 추가.

---

## 🗂 테이블 개요

| 테이블 | 용도 | Row 예상 수 |
|---|---|---|
| `profiles` | 프로필 정보 (1행 고정) | 1 |
| `links` | 링크 목록 | 10~50 |
| `themes` | 테마 설정 (1행 고정) | 1 |
| `click_events` | 클릭 이벤트 로그 | 수천~수만 |

> `auth.users`는 Supabase Auth가 자동 관리 — 직접 수정하지 않음.

---

## 1. `profiles`

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL UNIQUE,          -- 예: 'hey.kamori'
  display_name TEXT NOT NULL,                -- 화면에 표시되는 이름
  bio         TEXT DEFAULT '',               -- 바이오 (0-100자)
  avatar_path TEXT,                          -- Supabase Storage 경로 (NOT URL)
  social_instagram TEXT,                     -- 인스타그램 URL
  social_twitter   TEXT,                     -- 트위터 URL (옵션)
  social_youtube   TEXT,                     -- 유튜브 URL (옵션)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE UNIQUE INDEX profiles_username_idx ON profiles(username);

-- updated_at 자동 갱신 트리거
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

### 필드 설명
| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | UUID | PK, FK → auth.users | Supabase Auth 유저 ID |
| `username` | TEXT | NOT NULL, UNIQUE | URL용 식별자 (소문자+점) |
| `display_name` | TEXT | NOT NULL, 1-30자 | 화면 표시 이름 |
| `bio` | TEXT | 기본값 `''`, 0-100자 | 프로필 소개 |
| `avatar_path` | TEXT | nullable | **Storage 경로만 저장** (URL 저장 금지!) |
| `social_*` | TEXT | nullable | 전체 URL 저장 |

### ⚠️ 주의
- `avatar_path`에 **절대 전체 URL을 저장하지 말 것**. Storage 버킷 내 경로만 저장하고, 렌더링 시 `supabase.storage.from().getPublicUrl()` 또는 `createSignedUrl()`로 변환.
- 지난 프로젝트의 "이미지 URL 필드" 문제 재발 방지.

---

## 2. `links`

```sql
CREATE TABLE links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,              -- 1-40자
  url             TEXT NOT NULL,              -- http/https 시작 검증
  is_public       BOOLEAN NOT NULL DEFAULT true,
  display_order   INTEGER NOT NULL DEFAULT 0, -- 낮을수록 위에 표시
  click_count     INTEGER NOT NULL DEFAULT 0, -- 캐시된 집계 (성능)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT title_length CHECK (char_length(title) BETWEEN 1 AND 40),
  CONSTRAINT url_format CHECK (url ~* '^https?://.+')
);

CREATE INDEX links_profile_order_idx ON links(profile_id, display_order);
CREATE INDEX links_public_idx ON links(profile_id, is_public, display_order)
  WHERE is_public = true;

CREATE TRIGGER links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

### 필드 설명
| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | UUID | PK |
| `profile_id` | UUID | FK → profiles.id |
| `title` | TEXT | 링크 제목 (1-40자) |
| `url` | TEXT | 대상 URL (http/https만) |
| `is_public` | BOOLEAN | true면 공개 페이지 노출 |
| `display_order` | INTEGER | 드래그 정렬용, 낮을수록 위 |
| `click_count` | INTEGER | **비정규화 캐시**. `click_events` 집계 결과. |

### 정렬 규칙 (절대 바꾸지 말 것)
- **기본 정렬**: `ORDER BY display_order ASC, created_at DESC`
- `display_order` 동일 시 최근 생성이 위

### `click_count` 업데이트 전략
- `click_events` INSERT 시 트리거로 자동 증가:
```sql
CREATE FUNCTION increment_link_click_count()
  RETURNS TRIGGER AS $$
BEGIN
  UPDATE links SET click_count = click_count + 1 WHERE id = NEW.link_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER click_events_increment
  AFTER INSERT ON click_events
  FOR EACH ROW EXECUTE FUNCTION increment_link_click_count();
```

---

## 3. `themes`

```sql
CREATE TABLE themes (
  profile_id       UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- 배경
  bg_type          TEXT NOT NULL DEFAULT 'solid',  -- 'solid' | 'gradient' | 'image'
  bg_color_1       TEXT NOT NULL DEFAULT '#FDF9F3',
  bg_color_2       TEXT,                            -- gradient일 때 두 번째 색
  bg_image_path    TEXT,                            -- Storage 경로

  -- 버튼
  button_bg        TEXT NOT NULL DEFAULT '#FFFFFF',
  button_text      TEXT NOT NULL DEFAULT '#2D2A3E',
  button_border    TEXT NOT NULL DEFAULT '#E5DFF5',
  button_radius    TEXT NOT NULL DEFAULT 'rounded-2xl',  -- Tailwind 클래스
  button_shadow    TEXT NOT NULL DEFAULT 'shadow-sm',    -- 'shadow-none' | 'shadow-sm' | 'shadow-lg'

  -- 폰트
  font_family      TEXT NOT NULL DEFAULT 'pretendard',

  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT bg_type_check CHECK (bg_type IN ('solid', 'gradient', 'image')),
  CONSTRAINT color_format CHECK (
    bg_color_1 ~* '^#[0-9A-F]{6}$' AND
    (bg_color_2 IS NULL OR bg_color_2 ~* '^#[0-9A-F]{6}$') AND
    button_bg ~* '^#[0-9A-F]{6}$' AND
    button_text ~* '^#[0-9A-F]{6}$' AND
    button_border ~* '^#[0-9A-F]{6}$'
  )
);

CREATE TRIGGER themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

### 기본값 (DESIGN_TOKENS.md와 일치)
- 배경: 크림 `#FDF9F3` 단색
- 버튼: 흰색 바탕 + 라벤더 테두리
- 버튼 둥근 정도: `rounded-2xl`

---

## 4. `click_events`

```sql
CREATE TABLE click_events (
  id          BIGSERIAL PRIMARY KEY,
  link_id     UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  clicked_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  country     TEXT,                           -- ISO 2-letter, 예: 'KR', 'US'
  device      TEXT,                           -- 'mobile' | 'desktop' | 'tablet' | 'unknown'
  referrer    TEXT,                           -- 도메인만 저장, 전체 URL 금지
  session_id  TEXT                            -- 유니크 방문자 집계용 (쿠키 기반 익명 해시)
);

CREATE INDEX click_events_link_time_idx ON click_events(link_id, clicked_at DESC);
CREATE INDEX click_events_time_idx ON click_events(clicked_at DESC);
```

### 필드 설명
| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | BIGSERIAL | PK (이벤트 수가 많아서 BIGINT) |
| `link_id` | UUID | FK → links.id |
| `clicked_at` | TIMESTAMPTZ | 기본값 now() |
| `country` | TEXT | Vercel `x-vercel-ip-country` 헤더 값 |
| `device` | TEXT | user-agent 파싱 결과 |
| `referrer` | TEXT | **도메인만** (예: `instagram.com`), 전체 URL 저장 금지 |
| `session_id` | TEXT | 쿠키에 저장한 익명 해시 (24시간 유효) |

### ⚠️ 개인정보 방침
- **IP 원본 저장 금지**. 국가만 추출.
- **User-Agent 원본 저장 금지**. 디바이스 타입만.
- **Referrer는 도메인만**. 쿼리스트링 제거.
- `session_id`는 랜덤 해시, 개인 식별 불가.

### 데이터 보관
- 90일 이후 자동 삭제 (Supabase cron):
```sql
-- 매일 새벽 3시 실행
SELECT cron.schedule(
  'cleanup-old-clicks',
  '0 3 * * *',
  $$ DELETE FROM click_events WHERE clicked_at < now() - INTERVAL '90 days' $$
);
```

---

## 5. Storage 버킷

### `avatars` (public)
- 프로필 사진
- 경로: `{user_id}/avatar.{ext}`
- 허용 MIME: `image/jpeg`, `image/png`, `image/webp`
- 최대 크기: 2MB
- **Public read**, **Auth required for write**

### `backgrounds` (public)
- 테마 배경 이미지
- 경로: `{user_id}/bg.{ext}`
- 허용 MIME: `image/jpeg`, `image/png`, `image/webp`
- 최대 크기: 5MB

---

## 🔒 Row Level Security (RLS)

**모든 테이블에 RLS 활성화 필수.**

### `profiles`
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 (공개 페이지)
CREATE POLICY "profiles_read_public" ON profiles
  FOR SELECT USING (true);

-- 본인만 수정
CREATE POLICY "profiles_update_self" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### `links`
```sql
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- 공개 링크는 누구나 읽기
CREATE POLICY "links_read_public" ON links
  FOR SELECT USING (is_public = true);

-- 본인 링크는 모두 읽기 (비공개 포함)
CREATE POLICY "links_read_own" ON links
  FOR SELECT USING (auth.uid() = profile_id);

-- 본인만 CRUD
CREATE POLICY "links_write_own" ON links
  FOR ALL USING (auth.uid() = profile_id);
```

### `themes`
```sql
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "themes_read_public" ON themes
  FOR SELECT USING (true);

CREATE POLICY "themes_write_own" ON themes
  FOR ALL USING (auth.uid() = profile_id);
```

### `click_events`
```sql
ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;

-- INSERT는 누구나 가능 (공개 페이지에서)
CREATE POLICY "clicks_insert_anyone" ON click_events
  FOR INSERT WITH CHECK (true);

-- SELECT는 본인 링크의 이벤트만
CREATE POLICY "clicks_read_own" ON click_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = click_events.link_id
        AND links.profile_id = auth.uid()
    )
  );
```

---

## 📦 마이그레이션 파일 순서

```
supabase/migrations/
├── 20260421000001_init_extensions.sql      # moddatetime, pg_cron 활성화
├── 20260421000002_profiles.sql
├── 20260421000003_links.sql
├── 20260421000004_themes.sql
├── 20260421000005_click_events.sql
├── 20260421000006_click_count_trigger.sql
├── 20260421000007_rls_policies.sql
├── 20260421000008_storage_buckets.sql
└── 20260421000009_cleanup_cron.sql
```

---

## 🧪 타입 생성

스키마 변경 후 항상:
```bash
pnpm db:push                        # 마이그레이션 반영
pnpm db:types                       # types/database.ts 자동 생성
```

TypeScript에서:
```typescript
import type { Database } from '@/types/database';

type Link = Database['public']['Tables']['links']['Row'];
type LinkInsert = Database['public']['Tables']['links']['Insert'];
type LinkUpdate = Database['public']['Tables']['links']['Update'];
```

---

## 🚫 스키마 변경 금지 사항

1. **컬럼 이름 변경 금지** — 꼭 필요하면 새 컬럼 추가 후 마이그레이션, 이후 old 컬럼 삭제.
2. **기존 컬럼 타입 변경 금지** — 호환 안 되면 새 컬럼 추가.
3. **이미지 URL 필드 절대 금지** — Storage 경로만.
4. **IP/이메일/User-Agent 원본 저장 금지** — 개인정보 최소 수집.
