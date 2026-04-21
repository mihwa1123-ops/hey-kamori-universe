# 🛠 SETUP.md - 개발 환경 설치 (macOS)

> 처음이라면 **위에서부터 순서대로** 따라해주세요. 각 명령어 앞에는 "왜 이걸 하는지" 설명이 있어요.

---

## 1️⃣ 터미널 열기

1. `Cmd + Space` → "터미널" 검색 → Enter
2. 까만 창이 열리면 준비 완료

> 💡 터미널에 명령어를 **붙여넣을 때**: `Cmd + V`. 실행은 Enter.

---

## 2️⃣ Homebrew 설치 (macOS의 앱스토어 같은 것)

**왜 필요?** Node.js, pnpm 등을 쉽게 설치하려고.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

설치 중 **Password 입력** 요청이 나오면 맥 비밀번호를 입력하세요. (입력해도 화면에 안 보여요. 정상!)

설치 완료 후, 터미널이 알려주는 대로 **"Next steps"**에 나온 2줄을 복사해서 또 실행해주세요. 보통 이런 식:

```bash
echo >> ~/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 확인
```bash
brew --version
```
`Homebrew 4.x.x`가 나오면 성공.

---

## 3️⃣ Node.js 설치 (JavaScript 실행 엔진)

**왜 필요?** Next.js와 모든 라이브러리가 Node.js 위에서 동작해요.

```bash
brew install node@20
```

설치 후 경로 연결:
```bash
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

### 확인
```bash
node --version
```
`v20.x.x` 또는 그 이상이 나오면 성공.

---

## 4️⃣ pnpm 설치 (빠른 패키지 관리자)

**왜 필요?** npm보다 훨씬 빠르고 디스크 용량을 절약해요.

```bash
npm install -g pnpm
```

### 확인
```bash
pnpm --version
```

---

## 5️⃣ Git 설정 (코드 버전 관리)

**왜 필요?** 코드 변경 이력을 저장하고, GitHub에 올리려고.

```bash
git --version
```

안 깔려있으면:
```bash
brew install git
```

GitHub 이름/이메일 등록 (GitHub 가입한 이메일 사용):
```bash
git config --global user.name "본인이름"
git config --global user.email "본인이메일@example.com"
```

---

## 6️⃣ GitHub 인증 설정

**왜 필요?** `git push`할 때 매번 비밀번호 안 묻도록.

```bash
brew install gh
gh auth login
```

선택지가 여러 개 나오는데 **기본값(Enter)**으로 계속 누르세요:
- GitHub.com
- HTTPS
- Yes (Git credentials)
- Login with a web browser
- 화면에 나온 코드를 브라우저에서 입력

---

## 7️⃣ Supabase CLI 설치

**왜 필요?** DB 마이그레이션(스키마 변경)을 코드로 관리하려고.

```bash
brew install supabase/tap/supabase
```

### 확인
```bash
supabase --version
```

---

## 8️⃣ Vercel CLI 설치 (선택)

**왜 필요?** 터미널에서 바로 배포하려고. (GitHub 연결만 해도 자동 배포되긴 해요.)

```bash
npm install -g vercel
vercel login
```

---

## 9️⃣ 코드 에디터 - VS Code (선택이지만 추천)

**왜 필요?** Claude Code는 터미널에서 쓰지만, 파일을 눈으로 확인할 때 편해요.

```bash
brew install --cask visual-studio-code
```

---

## 🔟 전체 설치 확인

아래 명령어 한 줄씩 실행해서 모두 버전이 나오면 완료:

```bash
brew --version
node --version
pnpm --version
git --version
gh --version
supabase --version
claude --version
```

Claude Code가 없다면:
```bash
npm install -g @anthropic-ai/claude-code
```

---

## ⚠️ 자주 만나는 문제

### "command not found: brew"
→ 2단계 마지막의 `eval "$(/opt/homebrew/bin/brew shellenv)"` 다시 실행

### "permission denied"
→ 명령어 앞에 `sudo `를 붙이고 맥 비밀번호 입력

### "xcode-select: error"
→ `xcode-select --install` 실행 (팝업에서 "설치" 클릭)

### Apple Silicon Mac (M1/M2/M3)인데 Intel 경로 에러
→ `/opt/homebrew/` (Apple Silicon) vs `/usr/local/` (Intel) 차이. 맥북이 M시리즈라면 `/opt/homebrew/` 경로 사용.

---

## ✅ 다음 단계

모두 설치 완료했다면 **`README.md`의 2단계 (프로젝트 스캐폴딩)**로 돌아가세요.
