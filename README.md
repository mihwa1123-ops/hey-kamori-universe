# 🌸 hey.kamori - 프로젝트 시작 가이드

> **비개발자를 위한 한글 가이드.** 터미널 명령어가 낯설어도 이 순서대로 따라하면 돼요.

---

## 📦 이 폴더에 뭐가 들어있나요?

```
hey-kamori/
├── 📘 README.md              ← 지금 읽고 있는 파일 (시작 가이드)
├── 📘 CLAUDE.md              ← Claude Code가 매번 읽는 작업 규칙
├── 📘 SPEC.md                ← 페이지/기능 명세
├── 📘 DB_SCHEMA.md           ← 데이터베이스 설계
├── 📘 DESIGN_TOKENS.md       ← 색상/폰트 규칙
├── 📘 GLOSSARY.md            ← 개발 용어 사전 (모르는 단어 찾을 때)
├── 📘 SETUP.md               ← 설치 방법 (맥북 기준)
├── 📘 WORKFLOW.md            ← Claude Code와 일하는 방법
│
├── ⚙️ .claude/
│   ├── settings.json          ← Claude Code 동작 설정
│   └── commands/              ← 자주 쓰는 명령어 모음
│       ├── migrate.md
│       ├── deploy-check.md
│       └── next-milestone.md
│
├── ⚙️ package.json            ← 프로젝트 의존성 목록
├── ⚙️ .env.example            ← 환경변수 템플릿
├── ⚙️ .gitignore              ← Git에서 제외할 파일
│
├── 🗄 supabase/
│   └── migrations/            ← 데이터베이스 설계 SQL 파일들
│
└── 🛠 scripts/
    ├── setup.sh               ← 자동 설치 스크립트
    └── check.sh               ← 환경 검증 스크립트
```

---

## 🚀 3단계로 시작하기

### 1단계: 개발 도구 설치 (한 번만)

터미널 앱(Spotlight에서 "터미널" 검색)을 열고, 아래 한 줄을 복사해서 붙여넣으세요:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/[your-repo]/hey-kamori/main/scripts/setup.sh)
```

> ⚠️ 아직 저장소가 없으니, 지금은 **SETUP.md** 파일을 열어서 직접 따라해주세요.

### 2단계: 프로젝트 스캐폴딩

```bash
cd ~/Desktop                    # 바탕화면으로 이동
# 이 폴더(hey-kamori-setup) 전체를 Desktop에 복사한 후:
cd hey-kamori-setup
bash scripts/init-project.sh
```

이 스크립트가 자동으로:
- Next.js 프로젝트 생성
- shadcn/ui 설치
- 필요한 라이브러리(dnd-kit, supabase 등) 설치
- 폴더 구조 정리

### 3단계: Supabase 연결

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. `.env.example`을 `.env.local`로 복사
3. Supabase 대시보드의 **Settings > API**에서 값 복사해서 붙여넣기
4. 터미널에서 `pnpm db:push` 실행 → DB 테이블 자동 생성

### 4단계: 개발 시작

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000` 열면 끝!

---

## 🤝 Claude Code와 일하는 방식

터미널에서 프로젝트 폴더로 이동한 뒤:

```bash
cd ~/Desktop/hey-kamori
claude
```

Claude Code가 시작되면 **첫 메시지로 이렇게 말하세요**:

> "CLAUDE.md, SPEC.md, DB_SCHEMA.md, DESIGN_TOKENS.md를 먼저 읽고 M1(공개 페이지 MVP)부터 시작하자."

Claude Code가 자동으로 4개 문서를 읽고 규칙을 따라 작업해요.

---

## 🆘 막혔을 때

| 상황 | 어디 봐야 할지 |
|---|---|
| 설치가 안 됨 | `SETUP.md` |
| 용어를 모름 | `GLOSSARY.md` |
| Claude Code 사용법 | `WORKFLOW.md` |
| 에러가 남 | 에러 메시지 전체를 Claude Code에 복붙 |

---

## 📋 체크리스트 (한 번만 하는 것들)

- [ ] Homebrew 설치 (macOS 패키지 관리자)
- [ ] Node.js 20 이상 설치
- [ ] pnpm 설치
- [ ] Git 로그인 (GitHub)
- [ ] Supabase 프로젝트 생성
- [ ] Vercel 계정 생성 (GitHub로 로그인)
- [ ] `.env.local` 파일에 키 입력
- [ ] `pnpm install` 성공
- [ ] `pnpm dev` 실행 성공

모두 체크되면 개발 시작!
