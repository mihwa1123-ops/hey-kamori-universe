# hey.kamori - DESIGN_TOKENS.md

> 색상·폰트·간격·반지름·그림자 토큰. **프로젝트 시작 전 확정**.
> 하드코딩된 값을 코드에 쓰지 말 것. 모든 값은 Tailwind 설정 또는 CSS 변수로.

---

## 🎨 컬러 토큰

### 브랜드 (카모리 파스텔)
| 토큰 | HEX | Tailwind 클래스 | 용도 |
|---|---|---|---|
| `brand-lavender` | `#B8A4E3` | `bg-brand-lavender` | 메인 포인트 (버튼, 링크 호버) |
| `brand-lavender-soft` | `#D4C5F0` | `bg-brand-lavender-soft` | 부드러운 배경, 태그 |
| `brand-pink` | `#F5C6D9` | `bg-brand-pink` | 서브 포인트, 강조 |
| `brand-pink-soft` | `#FBDFEA` | `bg-brand-pink-soft` | 호버 배경, 알림 |
| `brand-mint` | `#C5E8D5` | `bg-brand-mint` | 성공/공개 상태 |
| `brand-cream` | `#FDF9F3` | `bg-brand-cream` | 기본 배경 (공개 페이지) |

### 중성색 (Neutral)
| 토큰 | HEX | 용도 |
|---|---|---|
| `neutral-50` | `#FAFAFA` | 배경 (편집 페이지) |
| `neutral-100` | `#F5F5F5` | 카드 배경 |
| `neutral-200` | `#E5E5E5` | 테두리 |
| `neutral-300` | `#D4D4D4` | 비활성 테두리 |
| `neutral-500` | `#737373` | 보조 텍스트 |
| `neutral-700` | `#404040` | 본문 텍스트 |
| `neutral-900` | `#2D2A3E` | 제목 텍스트 (메인 텍스트) |

### 상태 (Semantic)
| 토큰 | HEX | 용도 |
|---|---|---|
| `success` | `#10B981` | 저장 완료, 공개 상태 |
| `warning` | `#F59E0B` | 주의, 임시저장 |
| `danger` | `#EF4444` | 삭제, 오류 |
| `info` | `#3B82F6` | 안내 |

### 다크모드
- **현재 MVP에선 다크모드 미지원**. 나중에 추가 예정.
- 다만 CSS 변수 기반 설계로 확장 가능하게 유지.

---

## 📝 Tailwind 설정 (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          lavender: '#B8A4E3',
          'lavender-soft': '#D4C5F0',
          pink: '#F5C6D9',
          'pink-soft': '#FBDFEA',
          mint: '#C5E8D5',
          cream: '#FDF9F3',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          500: '#737373',
          700: '#404040',
          900: '#2D2A3E',
        },
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-pretendard)', 'ui-sans-serif'],
      },
      fontSize: {
        // 기본 Tailwind 사이즈 사용
      },
      borderRadius: {
        'xl': '0.875rem',   // 14px
        '2xl': '1.25rem',   // 20px - 기본 버튼/카드
        '3xl': '1.75rem',   // 28px - 큰 카드
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(184, 164, 227, 0.08)',
        'card': '0 4px 16px rgba(45, 42, 62, 0.06)',
        'hover': '0 8px 24px rgba(184, 164, 227, 0.15)',
      },
      spacing: {
        // 기본 Tailwind 스페이싱 사용 (4px 단위)
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 🔤 폰트

### 기본 폰트: Pretendard
- 한글·영문 겸용, 가독성 우수, 무료 오픈소스
- `next/font/local` 또는 `next/font/google`로 로드

```typescript
// app/layout.tsx
import localFont from 'next/font/local';

const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  variable: '--font-pretendard',
  weight: '45 920',
});
```

### 폰트 사이즈 스케일 (Tailwind 기본 사용)
| 토큰 | 크기 | 용도 |
|---|---|---|
| `text-xs` | 12px | 메타 정보, 캡션 |
| `text-sm` | 14px | 보조 텍스트, 버튼 작은 것 |
| `text-base` | 16px | 본문, 링크 버튼 |
| `text-lg` | 18px | 소제목 |
| `text-xl` | 20px | 섹션 제목 |
| `text-2xl` | 24px | 프로필 닉네임 |
| `text-3xl` | 30px | 대시보드 숫자 |

### 폰트 굵기
- `font-normal` (400): 본문
- `font-medium` (500): 버튼
- `font-semibold` (600): 소제목
- `font-bold` (700): 대시보드 숫자, 강조

### Line Height
- 제목: `leading-tight` (1.25)
- 본문: `leading-relaxed` (1.625)

---

## 📏 간격 (Spacing)

Tailwind 기본 4px 단위 사용.

### 컴포넌트별 권장 간격
| 위치 | Tailwind | 실제값 |
|---|---|---|
| 링크 버튼 세로 간격 | `gap-3` | 12px |
| 섹션 간 간격 (모바일) | `space-y-6` | 24px |
| 섹션 간 간격 (PC) | `space-y-10` | 40px |
| 카드 내부 패딩 | `p-4` | 16px |
| 페이지 좌우 패딩 (모바일) | `px-4` | 16px |
| 페이지 좌우 패딩 (PC) | `px-8` | 32px |
| 링크 버튼 높이 | `h-14` | 56px (터치 영역) |

### 컨테이너 최대 폭
- 공개 페이지: `max-w-md` (448px) — 모바일 기준
- 편집 페이지 편집 영역: `max-w-2xl` (672px)
- 통계 페이지: `max-w-5xl` (1024px)

---

## 🔘 반지름 (Border Radius)

| 토큰 | 값 | 용도 |
|---|---|---|
| `rounded` | 4px | 작은 태그 |
| `rounded-lg` | 8px | 입력 필드 |
| `rounded-xl` | 14px | 작은 카드 |
| `rounded-2xl` | 20px | **기본 버튼/카드** (공개 링크 버튼) |
| `rounded-3xl` | 28px | 큰 카드 (프로필 영역) |
| `rounded-full` | 원형 | 프로필 사진, 아이콘 버튼 |

### 공개 링크 버튼 기본
```html
<a class="h-14 rounded-2xl bg-white border border-brand-lavender-soft ...">
```

---

## 🌑 그림자 (Shadow)

| 토큰 | 값 | 용도 |
|---|---|---|
| `shadow-none` | - | 기본 |
| `shadow-soft` | `0 2px 8px rgba(184, 164, 227, 0.08)` | 링크 버튼 기본 |
| `shadow-card` | `0 4px 16px rgba(45, 42, 62, 0.06)` | 카드 |
| `shadow-hover` | `0 8px 24px rgba(184, 164, 227, 0.15)` | 호버 상태 |

### 호버 애니메이션
```css
.link-button {
  @apply shadow-soft transition-all duration-200;
}
.link-button:hover {
  @apply shadow-hover -translate-y-0.5;
}
```

---

## 🎬 모션 (Motion)

### 트랜지션 시간
- 기본: `duration-200` (200ms) — 호버, 클릭
- 느림: `duration-300` (300ms) — 모달, Sheet
- 빠름: `duration-100` (100ms) — 미세 피드백

### 이징
- 기본: `ease-out`
- 모달 진입: `ease-[cubic-bezier(0.22,1,0.36,1)]`

### 드래그 정렬
- `@dnd-kit`이 제공하는 기본 이징 사용
- 드래그 중 카드: `scale-105` + `shadow-hover`

### 로딩 상태
- 스켈레톤: `animate-pulse bg-neutral-100`
- 스피너: lucide `Loader2` + `animate-spin`

---

## 🖼 CSS 변수 (`app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* 테마용 동적 변수 (사용자 커스터마이징 시 변경) */
    --bg-main: #FDF9F3;
    --btn-bg: #FFFFFF;
    --btn-text: #2D2A3E;
    --btn-border: #E5DFF5;
    --btn-radius: 1.25rem;
  }

  body {
    @apply text-neutral-900 antialiased;
    font-family: var(--font-pretendard), ui-sans-serif, system-ui;
  }
}

@layer components {
  .themed-bg {
    background: var(--bg-main);
  }
  .themed-button {
    background: var(--btn-bg);
    color: var(--btn-text);
    border: 1px solid var(--btn-border);
    border-radius: var(--btn-radius);
  }
}
```

---

## 📱 반응형 브레이크포인트

Tailwind 기본 사용:
| 토큰 | 최소 폭 | 대상 |
|---|---|---|
| (기본) | 0 | 모바일 (디자인 기준) |
| `sm:` | 640px | 큰 모바일 |
| `md:` | 768px | 태블릿, PC 전환점 |
| `lg:` | 1024px | PC |
| `xl:` | 1280px | 큰 PC |

### 설계 원칙
- **모바일 퍼스트**: 기본 스타일은 모바일용, `md:` 이상부터 PC 확장
- **편집 페이지**: `md:` 이상에서 3단 분할 (사이드바 + 편집 + 미리보기)
- **공개 페이지**: 모든 화면에서 `max-w-md` 중앙 정렬 유지

---

## ♿ 접근성 (A11y)

### 색상 대비
- 본문 텍스트(`neutral-900`) vs 배경(`brand-cream`): **WCAG AA 4.5:1 이상**
- 버튼 텍스트 vs 배경: **4.5:1 이상 필수**
- 테마 커스터마이징 시 대비 경고 표시

### 터치 영역
- 최소 44x44px (iOS 가이드라인)
- 링크 버튼 높이 `h-14` (56px) 충족

### 포커스 스타일
- 모든 인터랙티브 요소: `focus-visible:ring-2 focus-visible:ring-brand-lavender focus-visible:ring-offset-2`
- 마우스 클릭 시 ring 안 보이게 `focus-visible` 사용

### ARIA
- 드래그 핸들: `aria-label="순서 변경"`
- 토글: `aria-label="공개 여부"` + `aria-checked`
- 통계 차트: `role="img" aria-label="..."`

---

## 🎯 아이콘

- 라이브러리: `lucide-react` (shadcn 기본)
- 크기 기본: `w-5 h-5` (20px)
- 작은 아이콘: `w-4 h-4` (16px)
- 큰 아이콘: `w-6 h-6` (24px)
- 색상: `text-neutral-700` 기본, 상태에 따라 변경

### 자주 쓰는 아이콘
| 아이콘 | 용도 |
|---|---|
| `GripVertical` | 드래그 핸들 |
| `Plus` | 추가 버튼 |
| `Pencil` | 편집 |
| `Trash2` | 삭제 |
| `Eye` / `EyeOff` | 공개/비공개 |
| `BarChart3` | 통계 |
| `Palette` | 테마 |
| `User` | 프로필 |
| `ExternalLink` | 외부 링크 |

---

## 🔍 사용 예시

### ✅ 좋은 예
```tsx
<button className="h-14 rounded-2xl bg-white border border-brand-lavender-soft
                   text-neutral-900 font-medium shadow-soft
                   hover:shadow-hover hover:-translate-y-0.5
                   transition-all duration-200">
  링크 제목
</button>
```

### ❌ 나쁜 예
```tsx
{/* 하드코딩 색상 — 금지 */}
<button className="bg-[#B8A4E3]" style={{ color: '#2D2A3E' }}>
```
```tsx
{/* 인라인 스타일 — 금지 */}
<div style={{ padding: '16px', borderRadius: '20px' }}>
```

---

## ✅ 체크리스트 (신규 컴포넌트 만들 때)

- [ ] 색상이 모두 토큰(`brand-*`, `neutral-*`)으로 되어 있는가?
- [ ] 반지름이 정의된 스케일(`rounded-xl`/`2xl`/`3xl`)을 쓰는가?
- [ ] 그림자가 `shadow-soft`/`card`/`hover` 중 하나인가?
- [ ] 폰트 사이즈가 Tailwind 기본 스케일을 쓰는가?
- [ ] 터치 영역이 44px 이상인가?
- [ ] 포커스 스타일이 있는가?
- [ ] 모바일·PC 양쪽에서 확인했는가?
