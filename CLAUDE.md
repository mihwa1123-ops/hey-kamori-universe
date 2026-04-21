# hey.kamori - CLAUDE.md

> Claude Code가 이 프로젝트에서 작업할 때 **세션 시작 시 자동으로 읽는** 작업 규칙.
> 모든 신규 작업 전에 이 문서, `SPEC.md`, `DB_SCHEMA.md`, `DESIGN_TOKENS.md`를 먼저 확인할 것.

---

## 🤖 Claude Code에게 (세션 시작 시 반드시 수행)

1. **이 파일(CLAUDE.md), SPEC.md, DB_SCHEMA.md, DESIGN_TOKENS.md를 읽었다고 확인 메시지 출력**
2. 사용자가 어느 마일스톤(M1~M5)에 있는지 확인
3. 작업 시작 전 해당 마일스톤의 완료 정의(DoD)를 인용
4. **사용자는 비개발자다**. 전문 용어는 풀어 설명하고, 명령어는 왜 쓰는지 한 줄 설명 추가

---

## 📌 프로젝트 개요

- **프로젝트명**: hey.kamori
- **한 줄 정의**: 카모리 개인용 링크 허브 (Linktree 대체)
- **사용자**: 본인 1명 (관리자) + 공개 방문자 (읽기 전용)
- **URL**: `hey-kamori.vercel.app` (추후 커스텀 도메인 연결 가능하도록 설계)

---

## 🛠 기술 스택 (확정)

| 레이어 | 스택 | 버전 | 선택 이유 |
|---|---|---|---|
| 프레임워크 | Next.js (App Router) | 16.2.x | SSR(공개 페이지 SEO) + CSR(편집 인터랙션) 공존 |
| 언어 | TypeScript | 5.x (strict) | 타입 안전성 |
| DB | Supabase (Postgres) | 최신 | RLS + 실시간 + Auth 통합 |
| 인증 | Supabase Auth | 이메일 매직링크 | 비밀번호 관리 불필요 |
| 스토리지 | Supabase Storage | 최신 | 프로필 사진 업로드 |
| 스타일 | Tailwind CSS | 4.x | 디자인 토큰 강제 |
| UI 컴포넌트 | shadcn/ui | CLI v4+ | 복사-붙여넣기 방식 |
| 드래그 정렬 | `@dnd-kit/core` + `@dnd-kit/sortable` | 최신 | 모바일 터치 지원 |
| 아이콘 | lucide-react | 최신 | shadcn 기본 아이콘 |
| 차트 | recharts | 최신 | 통계 페이지용 |
| 배포 | Vercel | - | Next.js 공식, git push 자동 배포 |
| 폰트 | Pretendard (한글) + Inter (영문) | - | 한글 가독성 우수 |

### 금지 스택
- ❌ Pages Router (App Router만 사용)
- ❌ CSS-in-JS (styled-components, emotion) — Tailwind만
- ❌ react-beautiful-dnd — 유지보수 중단됨
- ❌ redux, zustand 등 전역 상태 라이브러리 — 필요하면 React Context + useReducer
- ❌ Prisma — Supabase 클라이언트로 충분
- ❌ Jest — 테스트가 필요하면 Vitest 사용

---

## 📂 폴더 구조 (확정)

```
hey-kamori/
├── app/
│   ├── (public)/
│   │   └── page.tsx              # 공개 링크 페이지 (/)
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── page.tsx          # 편집 페이지 (/admin)
│   │   │   ├── stats/page.tsx    # 통계 (/admin/stats)
│   │   │   ├── theme/page.tsx    # 테마 (/admin/theme)
│   │   │   ├── profile/page.tsx  # 프로필 (/admin/profile)
│   │   │   └── layout.tsx        # 사이드바 + 미리보기 레이아웃
│   │   └── login/
│   │       └── page.tsx          # 로그인 (/login)
│   ├── api/
│   │   ├── click/route.ts        # 클릭 기록 API
│   │   └── upload/route.ts       # 프로필 사진 업로드 API
│   ├── auth/
│   │   └── callback/route.ts     # Supabase Auth 콜백
│   ├── layout.tsx
│   └── globals.css               # 디자인 토큰 CSS 변수
├── components/
│   ├── ui/                       # shadcn/ui (버튼, 입력, 토글 등)
│   ├── links/
│   │   ├── LinkCard.tsx          # 링크 1개 카드 (편집/공개 공용)
│   │   ├── LinkForm.tsx          # 링크 추가/수정 폼
│   │   ├── LinkList.tsx          # 드래그 가능한 목록
│   │   └── LinkPreview.tsx       # 공개 화면용 링크 버튼
│   ├── preview/
│   │   └── PhonePreview.tsx      # 편집 화면 오른쪽 실시간 미리보기
│   └── stats/
│       ├── StatsOverview.tsx
│       ├── StatsChart.tsx
│       └── StatsGeo.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # 브라우저용 클라이언트
│   │   ├── server.ts             # 서버용 클라이언트
│   │   └── middleware.ts         # 세션 갱신 미들웨어
│   ├── analytics.ts              # 클릭 추적 헬퍼
│   └── utils.ts                  # cn(), 날짜 포맷 등
├── types/
│   └── database.ts               # Supabase 타입 자동 생성
├── supabase/
│   └── migrations/               # SQL 마이그레이션 파일
├── public/
│   └── kamori-default.png        # 기본 프로필 이미지
├── .claude/
│   ├── settings.json             # Claude Code 동작 설정
│   └── commands/                 # 슬래시 명령어
├── CLAUDE.md
├── SPEC.md
├── DB_SCHEMA.md
├── DESIGN_TOKENS.md
├── middleware.ts
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 🎨 브랜드 요약 (자세한 건 DESIGN_TOKENS.md)

- **메인 컬러**: 파스텔 라벤더 `#B8A4E3` / 핑크 `#F5C6D9`
- **배경**: 크림 `#FDF9F3`
- **텍스트**: 딥 그레이 `#2D2A3E`
- **폰트**: Pretendard (한글) / Inter (영문)
- **톤앤매너**: 부드럽고 아기자기한 파스텔, 카모리 캐릭터 배경의 수채화 감성

---

## 🔐 권한 구조

| 경로 | 권한 | 인증 방식 |
|---|---|---|
| `/` | 누구나 (Public) | 없음 (ISR 60초) |
| `/login` | 누구나 | 없음 |
| `/admin/*` | 본인만 | Supabase Auth (매직링크) |
| `/api/click` | 누구나 | 없음 |
| `/api/upload` | 본인만 | Supabase Auth 검증 |

- **관리자 판별**: `auth.users`에서 env `ADMIN_EMAIL`과 일치하는 유저만 `/admin` 접근.
- 회원가입 기능 없음.

---

## 📐 데이터 표시 규칙 (절대 나중에 바꾸지 말 것)

### 날짜
- DB 저장: `timestamptz` UTC
- 화면 표시: `YYYY. MM. DD` (예: `2026. 04. 21`)
- 상대시간: `n분 전`, `n시간 전`, `어제`, 그 이후는 절대날짜

### 숫자
- 클릭 수: 천 단위 쉼표 (`1,234 clicks`)
- 1000 이상 대시보드: `1.2K` 표기
- 0일 때: `0 clicks` (`—` 금지)

### 정렬 규칙
- **공개/편집 링크 목록**: `ORDER BY display_order ASC, created_at DESC`
- **통계 기간**: 기본 최근 7일 (7/30/전체 선택 가능)

### 공개/비공개
- `is_public = false`는 공개 페이지에서 **완전히 숨김**
- 편집 페이지에서는 **회색 + 자물쇠 아이콘**

---

## ✅ 공통 컴포넌트 원칙 (반복 개발 방지)

### 먼저 만들고 재사용할 컴포넌트
1. **`<LinkCard>`**: `mode="edit" | "preview"` prop으로 두 화면 모두 커버
2. **`<FormField>`**: 라벨 + 입력 + 에러 메시지 한 세트
3. **`<Toggle>`**: shadcn Switch 래퍼 (공개/비공개)
4. **`<Avatar>`**: 프로필 사진 + fallback
5. **`<StatCard>`**: 숫자 + 라벨 + 증감 화살표

**규칙**: 같은 UI가 2곳에 나오면 **무조건** 컴포넌트로 추출.

---

## 🖥 반응형 설계 원칙

- **처음부터 모바일 + PC 동시 개발**. 한쪽 완성 후 다른 쪽 대응 금지.
- **Breakpoint**:
  - `< 768px`: 모바일 (기본)
  - `>= 768px`: 태블릿/PC
- **편집 페이지 (`/admin`)**:
  - PC: 왼쪽 편집(60%) + 오른쪽 sticky 미리보기(40%)
  - 모바일: 편집 전체 너비, 하단 플로팅 버튼 → Sheet로 미리보기
- **공개 페이지 (`/`)**:
  - 모든 화면에서 `max-w-md` 중앙 정렬 (모바일 뷰가 기준)

---

## 🚫 절대 하지 말 것 (Do Not)

1. **DB 스키마를 코드 작성 중에 추가하지 말 것**. 반드시 `DB_SCHEMA.md` 먼저 수정 → 마이그레이션 SQL 파일 생성 → `pnpm db:push`.
2. **이미지 URL을 링크 테이블에 직접 저장 금지**. Storage 경로만.
3. **`border-collapse` + `sticky` 동시 사용 금지**.
4. **인라인 스타일 금지** (`style={{...}}`). Tailwind 클래스만.
5. **하드코딩 색상 금지** (`bg-[#B8A4E3]`). 디자인 토큰만.
6. **`any` 타입 금지**. `unknown` + type guard.
7. **`useEffect`로 데이터 페칭 금지**. Server Component / Server Action.
8. **환경 변수를 클라이언트에 노출 금지**. `NEXT_PUBLIC_` 접두어 확인.
9. **`.env.local`을 git에 커밋 금지**. `.gitignore`에 이미 포함.
10. **`node_modules/`, `.next/`, `public/` 폴더 파일 수정 금지** (생성은 OK).

---

## 🤖 Claude Code 작업 규칙

### 파일 수정 범위
- **수정 가능**: `app/`, `components/`, `lib/`, `types/`, `supabase/migrations/`, `public/` 추가만, 루트 설정 파일
- **수정 금지**: `node_modules/`, `.next/`, `.env.local`, `.git/`
- **수정 전 확인**: 사용자가 직접 수정한 `.env.local`, `package.json`의 `dependencies`

### 작업 단위
- **한 작업당 파일 3개 이하**. 4개 이상 수정이 필요하면 먼저 계획 제시 후 승인받기.
- **커밋 단위**: 기능 단위로 작게. "feat: 링크 드래그 정렬 추가" 같이.
- **여러 기능 섞어 커밋 금지**.

### 작업 순서
1. **읽기**: 관련 파일을 먼저 읽고 현재 상태 파악
2. **계획**: "~를 위해 A, B, C를 수정할게요"라고 사용자에게 설명
3. **실행**: 한 파일씩 수정
4. **검증**: `pnpm type-check` + `pnpm lint` 실행
5. **보고**: 변경한 내용과 확인 방법 설명

### 사용자에게 확인 받아야 하는 상황
- 새 라이브러리 설치 (`pnpm add` 전)
- DB 마이그레이션 실행 (`pnpm db:push` 전)
- 배포 (`git push`로 Vercel 트리거)
- 기존 기능 크게 변경
- 보안·인증 관련 코드 수정

### 커밋 메시지 컨벤션
```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 스타일 (기능 변화 없음)
refactor: 리팩토링
chore: 빌드/설정 변경
```

예: `feat: 링크 드래그 정렬 추가`, `fix: 공개 페이지 ISR 캐싱 오류 수정`

---

## 🔧 개발 워크플로우

### 시작 시
```bash
pnpm install
cp .env.example .env.local        # Supabase 키 입력
pnpm dev                           # localhost:3000
```

### 커밋 전 필수 검증
```bash
pnpm pre-deploy                    # type-check + lint + build
```

### DB 변경 시 (순서 엄수)
1. `DB_SCHEMA.md` 먼저 수정
2. `supabase/migrations/YYYYMMDDHHMMSS_설명.sql` 파일 생성
3. `pnpm db:push`
4. `pnpm db:types` → `types/database.ts` 갱신

### 배포
- `main` 브랜치 push → Vercel 자동 배포
- PR → Preview 배포 자동 생성

---

## 🧪 하네스 (자동 검증 장치)

### `package.json` scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "pre-deploy": "pnpm type-check && pnpm lint && pnpm build",
    "db:push": "supabase db push",
    "db:types": "supabase gen types typescript --linked > types/database.ts",
    "db:reset": "supabase db reset"
  }
}
```

### Git 훅
- `pre-commit`: lint-staged
- `pre-push`: `pnpm pre-deploy`

### Claude Code 훅 (`.claude/settings.json`)
- `git push` 전 자동으로 `pnpm pre-deploy` 실행 차단

---

## 🔑 환경 변수 (`.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx    # 서버 전용, 절대 클라이언트 노출 금지

# Auth
ADMIN_EMAIL=kamori@example.com       # 이 이메일만 /admin 접근 가능

# Site
NEXT_PUBLIC_SITE_URL=https://hey-kamori.vercel.app
```

---

## 📊 분석/통계 방침

- **직접 구현** (Supabase `click_events` 테이블) — 무료 유지
- 외부 서비스 사용 금지 (Google Analytics 등) — 개인정보 최소화
- 수집: `link_id`, `clicked_at`, `country`(Vercel 헤더), `device`(UA 파싱), `referrer`(도메인만)
- **수집 안 함**: IP 원본, 이메일, 지속 쿠키 기반 추적

---

## 🗺 마일스톤

1. **M1: 공개 페이지 MVP** — DB 스키마 적용 + `/` SSR + 링크 클릭 트래킹
2. **M2: 편집 페이지 + 실시간 미리보기** — 로그인 + CRUD + 드래그 정렬
3. **M3: 통계 페이지** — 클릭 집계 대시보드
4. **M4: 테마 커스터마이징** — 배경/버튼 색 변경 + 실시간 반영
5. **M5: 프로필 편집** — 사진 업로드 + 닉네임/바이오

각 마일스톤 완료 정의는 `SPEC.md`의 DoD 섹션 참조.

---

## 📎 참고 문서

- `SPEC.md` — 페이지별 기능 명세
- `DB_SCHEMA.md` — 전체 DB 구조 및 RLS 정책
- `DESIGN_TOKENS.md` — 색상/폰트/간격 토큰
- `WORKFLOW.md` — 비개발자를 위한 작업 가이드
- `GLOSSARY.md` — 개발 용어 사전
- `SETUP.md` — 개발 환경 설치
