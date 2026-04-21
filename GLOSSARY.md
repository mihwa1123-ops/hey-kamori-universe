# 📖 GLOSSARY.md - 개발 용어 사전

> 모르는 단어가 나오면 여기서 찾아보세요. 없는 단어는 Claude에게 설명 부탁하고, 여기 추가해주세요.

---

## 🔤 알파벳순

### A

- **API (에이피아이)**: 프로그램끼리 대화하는 약속. 예: "날씨 API를 부른다" = 날씨 서버에 정보를 요청한다.
- **App Router**: Next.js 13부터 생긴 새로운 폴더 구조. `app/` 폴더 안에 파일을 두면 자동으로 URL이 됨. (예: `app/admin/page.tsx` → `/admin`)
- **Auth (오쓰)**: Authentication의 줄임말. 로그인/로그아웃/본인확인.

### B

- **Build (빌드)**: 개발자가 쓴 코드를 브라우저가 이해할 수 있게 변환하는 과정. `pnpm build`.
- **Breakpoint (브레이크포인트)**: 반응형 디자인에서 "이 화면 크기부터 레이아웃이 바뀜"을 정하는 기준. 예: 768px 이상이면 PC.

### C

- **CLI (씨엘아이)**: Command Line Interface. 터미널에서 명령어로 조작하는 도구.
- **Commit (커밋)**: "여기까지 작업 저장!"하고 스냅샷 찍는 것.
- **Component (컴포넌트)**: 재사용 가능한 UI 조각. 예: `<Button>`, `<Avatar>`.
- **CSS (씨에스에스)**: 색상/간격/폰트 등 꾸미기를 담당하는 언어.

### D

- **DB (디비)**: Database. 데이터를 저장하는 창고. 우리는 Supabase(Postgres 기반) 사용.
- **Deploy (디플로이)**: 배포. 내 컴퓨터에서 동작하는 웹사이트를 인터넷에 올려서 남이 볼 수 있게 하기.
- **Dependencies (디펜던시)**: 의존성. 이 프로젝트가 동작하려면 필요한 다른 라이브러리들.
- **dnd-kit**: 드래그 앤 드롭(Drag and Drop) 기능을 쉽게 만드는 라이브러리.

### E

- **Env (엔브) / Environment Variables**: 환경 변수. API 키처럼 **코드에 적으면 안 되는 비밀값**을 `.env.local` 파일에 분리 저장.
- **ESLint (이에스린트)**: 코드에서 실수를 자동으로 찾아주는 도구.

### F

- **Fetch (페치)**: 서버에서 데이터를 가져오는 것.
- **Flex / Grid**: CSS에서 요소를 정렬하는 방식.

### G

- **Git (깃)**: 코드 변경 이력을 관리하는 도구.
- **GitHub (깃허브)**: Git 저장소를 인터넷에 올려두는 서비스. Claude 소유가 아니라 Microsoft 소유.

### H

- **Homebrew (홈브루)**: macOS용 프로그램 설치 도구.
- **Hook (훅)**: React의 `useState`, `useEffect` 같은 기능. "어떤 일이 일어날 때 내 코드 실행해줘".

### I

- **ISR (아이에스알)**: Incremental Static Regeneration. 정적 페이지를 일정 시간마다 갱신하는 Next.js 기능.

### J

- **JSX / TSX**: HTML과 JavaScript를 섞어 쓰는 파일 형식. `.tsx`는 TypeScript+JSX.

### L

- **Lighthouse (라이트하우스)**: Chrome에 내장된 성능 측정 도구. 90점 이상이면 좋음.
- **Linting (린팅)**: 코드 실수 자동 검사.

### M

- **Migration (마이그레이션)**: DB 구조를 바꾸는 SQL 파일. "4월 21일에 이 테이블을 추가했다"를 기록.
- **Middleware (미들웨어)**: 요청이 오면 먼저 실행되는 코드. 로그인 체크 등에 사용.
- **MVP (엠비피)**: Minimum Viable Product. 최소 기능만 있는 첫 버전.

### N

- **Next.js (넥스트제이에스)**: React 기반의 웹 프레임워크. Vercel 회사가 만듦.
- **Node.js (노드제이에스)**: 서버에서 JavaScript를 실행하는 환경.
- **npm / pnpm**: 라이브러리 설치 도구. pnpm이 더 빠르고 가벼움.

### O

- **OAuth (오쓰/오어쓰)**: "구글로 로그인" 같은 타사 로그인 방식.

### P

- **Package.json**: 프로젝트에 어떤 라이브러리가 필요한지 적힌 파일.
- **PR (피알)**: Pull Request. "내가 작성한 코드 검토 후 합쳐줘" 요청.
- **Postgres (포스트그레스)**: 관계형 데이터베이스. Supabase가 내부적으로 씀.
- **Props (프롭스)**: React 컴포넌트에 전달하는 데이터.

### R

- **React (리액트)**: 페이스북이 만든 UI 라이브러리.
- **Repo / Repository (레포)**: 코드 저장소.
- **Responsive (리스폰시브)**: 반응형. 화면 크기에 따라 레이아웃이 바뀜.
- **RLS (알엘에스)**: Row Level Security. Supabase에서 "누가 어떤 데이터를 볼 수 있나" 설정.

### S

- **Scaffold (스캐폴드)**: 빈 프로젝트 뼈대 생성.
- **Schema (스키마)**: DB 구조 설계도.
- **SEO (에스이오)**: 검색 엔진 최적화. 구글에 잘 나오게 하기.
- **Server Component**: Next.js에서 서버에서 렌더링되는 컴포넌트. 빠름.
- **shadcn/ui**: 복사해서 쓰는 UI 컴포넌트 모음. Radix UI + Tailwind 기반.
- **SQL (에스큐엘)**: 데이터베이스와 대화하는 언어.
- **SSG (에스에스지)**: Static Site Generation. 빌드 시점에 HTML을 미리 만들어둠.
- **SSR (에스에스알)**: Server Side Rendering. 요청 올 때마다 서버에서 HTML 생성.
- **Storage (스토리지)**: 파일(이미지 등) 저장 공간. Supabase가 내장 제공.
- **Supabase (수파베이스)**: DB + Auth + Storage를 한 번에 제공하는 서비스. Firebase 대체재.

### T

- **Tailwind CSS**: 클래스로 CSS를 빠르게 쓰는 방식. `className="p-4 bg-blue-500"`.
- **Terminal (터미널)**: 명령어 치는 까만 창.
- **Token (토큰)**:
  - 디자인 토큰: 색상/폰트 이름 (예: `brand-lavender`)
  - API 토큰: 인증에 쓰는 비밀번호
- **TypeScript (타입스크립트)**: JavaScript에 "이 변수는 숫자다"처럼 타입을 추가한 언어. 실수 줄여줌.

### U

- **URL (유알엘)**: 웹 주소.
- **useState / useEffect**: React의 상태 관리 함수.
- **UI (유아이)**: User Interface. 화면 구성.
- **UX (유엑스)**: User Experience. 사용 경험.

### V

- **Vercel (버셀)**: Next.js 만든 회사. 배포 서비스도 제공. 무료 티어 넉넉함.
- **Viewport (뷰포트)**: 브라우저에 보이는 화면 영역.
- **VS Code**: Microsoft가 만든 무료 코드 에디터.

### W

- **Webhook (웹훅)**: "이 이벤트가 일어나면 저 URL로 알림 보내줘".

### Y

- **YAML (야믈)**: 설정 파일 형식. `.yml` 확장자.

---

## 🔤 한글

### ㄱ

- **커밋**: Commit 참조
- **컴포넌트**: Component 참조

### ㄷ

- **드래그 앤 드롭**: 마우스/손가락으로 집어서 다른 곳에 놓기

### ㄹ

- **라이브러리**: 남이 만들어 둔 코드 모음. `pnpm add`로 설치해서 씀.
- **렌더링**: 데이터를 화면으로 그리는 과정.
- **리팩토링**: 동작은 같게 두고 코드를 정리하는 것.

### ㅁ

- **미들웨어**: Middleware 참조
- **마이그레이션**: Migration 참조

### ㅂ

- **브랜치**: Git에서 독립된 작업 라인. `main` 브랜치가 기본.
- **빌드**: Build 참조

### ㅅ

- **스키마**: Schema 참조. DB 테이블 구조.
- **세션**: 로그인한 상태가 유지되는 기간.

### ㅇ

- **유저 에이전트 (User Agent)**: 브라우저 정보. "Chrome on Mac" 같은 문자열.
- **인증**: 로그인, 신원 확인.
- **인가**: 권한 확인. "이 유저가 이 페이지 볼 수 있나?"

### ㅈ

- **저장소 (Repository)**: 코드 저장 장소. GitHub의 한 프로젝트.

### ㅊ

- **커밋**: 저장 시점 찍기.

### ㅋ

- **클라이언트**: 브라우저. 서버의 반대.
- **쿼리**: DB에 보내는 질문. `SELECT * FROM links`.

### ㅌ

- **테이블**: DB의 엑셀 시트 같은 것. 행(row)과 열(column)로 구성.
- **터미널**: Terminal 참조.

### ㅍ

- **패키지**: 라이브러리와 같은 뜻.
- **프로퍼티 / Props**: 컴포넌트에 전달하는 값.

### ㅎ

- **훅**: Hook 참조. React의 `use-` 함수들.

---

## ➕ 본인이 추가하고 싶은 단어

> 여기에 프로젝트 하면서 새로 만난 단어를 추가해주세요.

- (예시) **ISR**: 60초마다 페이지 자동 갱신되는 Next.js 기능
- ...
