# hey.kamori - SPEC.md

> 모든 페이지·기능·화면의 동작을 정의한다. 코드를 쓰기 전 이 문서가 먼저 업데이트돼야 한다.

---

## 📑 페이지 목록

| 경로 | 이름 | 권한 | 렌더링 | 설명 |
|---|---|---|---|---|
| `/` | 공개 링크 페이지 | Public | ISR (60초) | 방문자가 보는 메인 페이지 |
| `/login` | 로그인 | Public | CSR | 이메일 매직링크 발송 |
| `/auth/callback` | 인증 콜백 | Public | Server | Supabase Auth 리다이렉트 |
| `/admin` | 편집 홈 (링크 관리) | Admin | CSR | 링크 CRUD + 실시간 미리보기 |
| `/admin/stats` | 클릭 통계 | Admin | CSR | 일자별 차트 + 지역/디바이스/유입경로 |
| `/admin/theme` | 테마 커스터마이징 | Admin | CSR | 색상/배경 변경 + 실시간 미리보기 |
| `/admin/profile` | 프로필 편집 | Admin | CSR | 이름/소개/프로필 사진 변경 |

---

## 🌐 `/` 공개 링크 페이지 (Public)

### 레이아웃 (위에서 아래로)
1. **프로필 영역**
   - 프로필 사진 (원형, 120x120)
   - 닉네임 (`hey.kamori`)
   - 바이오 (1~2줄)
2. **소셜 아이콘 줄** (Instagram 등, 있으면 표시)
3. **링크 버튼 목록**
   - 공개 상태(`is_public = true`)인 링크만 표시
   - `display_order ASC` 정렬
   - 각 버튼 탭/클릭 시:
     - 클릭 이벤트 `/api/click` 비동기 전송 (navigator.sendBeacon)
     - 대상 URL로 이동 (`target="_blank"`, `rel="noopener"`)
4. **푸터**
   - `Made with 💜 by kamori` (매우 작게)

### 데이터 로딩
- Server Component에서 Supabase 쿼리
- ISR 60초 (`export const revalidate = 60`)
- 편집 페이지에서 변경 시 `revalidatePath('/')` 즉시 반영

### 빈 상태
- 링크가 0개면: 프로필 영역만 표시 + "준비 중이에요 🌱" 메시지

### SEO
- `<title>`: `hey.kamori`
- `<meta description>`: 바이오 내용
- Open Graph: 프로필 이미지 + 바이오
- `robots: index, follow`

---

## 🔐 `/login` 로그인 (Public)

### 동작
1. 이메일 입력란 + "매직링크 보내기" 버튼
2. Supabase `signInWithOtp({ email })` 호출
3. 성공: "메일함을 확인해주세요" 메시지
4. 실패: 에러 토스트

### 제약
- `ADMIN_EMAIL`이 아닌 주소는 로그인되어도 `/admin` 접근 거부 (middleware에서 차단)

---

## 🛠 `/admin` 편집 페이지 (Admin)

### 레이아웃

**PC (>= 768px)**:
```
┌──────────────────────────────────────────┐
│ 사이드바 │  편집 영역       │ 미리보기     │
│ (200px)  │  (flex-1)        │ (320px)     │
│          │                  │ sticky top  │
└──────────────────────────────────────────┘
```

**모바일 (< 768px)**:
- 사이드바 → 햄버거 메뉴 → Sheet로 열림
- 미리보기 → 하단 플로팅 버튼 → Sheet로 열림
- 편집 영역이 전체 너비

### 사이드바 메뉴
- 🔗 링크 (`/admin`)
- 📊 통계 (`/admin/stats`)
- 🎨 테마 (`/admin/theme`)
- 👤 프로필 (`/admin/profile`)
- 🚪 로그아웃 (하단)

### 편집 영역 구성 (위에서 아래로)

1. **헤더**
   - "내 링크" 제목
   - "+ 링크 추가" 버튼 (우측)
2. **링크 목록** (`<LinkList>`)
   - 드래그 핸들(왼쪽 `⋮⋮` 아이콘)로 순서 변경
   - 각 카드에 포함:
     - 드래그 핸들
     - 제목 (인라인 편집 가능)
     - URL (인라인 편집 가능)
     - 공개/비공개 토글
     - 편집 버튼 (상세 모달 열기)
     - 삭제 버튼 (확인 다이얼로그)
     - 클릭 수 (`12 clicks`)
3. **빈 상태**: "+ 첫 링크를 추가해보세요" 일러스트

### 링크 추가/수정 모달 (`<LinkForm>`)
- 제목 (필수, 1-40자)
- URL (필수, http/https 검증)
- 공개 여부 (기본 true)
- 저장 / 취소

### 드래그 정렬
- `@dnd-kit/sortable` 사용
- 드래그 완료 시 `display_order` 일괄 업데이트 (Server Action)
- Optimistic UI: 화면은 즉시 반영, 실패 시 롤백

### 실시간 미리보기 (`<PhonePreview>`)
- **아이폰 mockup 프레임** 안에 공개 페이지와 동일한 UI 렌더링
- 편집 상태 변경 시 **즉시 반영** (debounce 200ms)
- 드래그 중에도 순서 실시간 반영
- 공개/비공개 토글 시 즉시 숨김/표시

### 저장 방식
- **자동 저장** (debounce 500ms) — "저장됨" 인디케이터 표시
- 명시적 저장 버튼 없음 (실수 방지)
- 네트워크 오류 시 토스트로 재시도 유도

---

## 📊 `/admin/stats` 클릭 통계 (Admin)

### 상단 필터
- 기간 선택: `최근 7일` (기본) / `최근 30일` / `전체`

### 상단 요약 카드 (`<StatCard>` 3개)
1. **총 클릭 수** (기간 내) + 전일 대비 증감 화살표
2. **총 방문 수** (유니크 세션) + 증감
3. **평균 CTR** (클릭/방문 %) + 증감

### 섹션 1: 일자별 클릭 추이 차트
- 라인 차트 (recharts)
- X축: 날짜, Y축: 클릭 수
- 전체 합계 + 링크별 필터 가능 (드롭다운)

### 섹션 2: 링크별 클릭 순위 (`<StatsLinkRanking>`)
- 표 형태
- 컬럼: 순위 / 링크 제목 / 클릭 수 / 비중(%)
- 클릭 수 내림차순 정렬
- 비공개 링크는 회색 + 자물쇠 아이콘

### 섹션 3: 국가별 클릭 (`<StatsGeo>`)
- 상위 10개국 막대 차트
- `KR`, `US` 등 ISO 코드 → 국기 + 국가명 변환
- Vercel `x-vercel-ip-country` 헤더 사용

### 섹션 4: 디바이스별 (`<StatsDevice>`)
- 도넛 차트: Mobile / Desktop / Tablet

### 섹션 5: 유입경로 (`<StatsReferrer>`)
- 상위 10개 referrer 도메인
- `(direct)`: referrer 없음
- `instagram.com`, `twitter.com` 등 아이콘 매핑

---

## 🎨 `/admin/theme` 테마 커스터마이징 (Admin)

### 편집 항목
1. **배경 타입**: 단색 / 그라디언트 / 이미지 업로드
2. **배경 색상**: 컬러 피커 (단색/그라디언트 시작·끝)
3. **버튼 스타일**:
   - 색상 (텍스트 / 배경 / 테두리)
   - 모양 (둥근 정도: `rounded-lg`, `rounded-full` 등)
   - 그림자 (없음/약함/강함)
4. **폰트 선택**: Pretendard (기본) / 본고딕 / 나눔스퀘어

### 저장
- 우측 미리보기에 실시간 반영
- "저장" 버튼 누르면 DB 반영 (자동 저장 아님 — 테마는 실수 방지)
- "기본값으로 초기화" 버튼 제공

---

## 👤 `/admin/profile` 프로필 편집 (Admin)

### 편집 항목
1. **프로필 사진**
   - 원형 미리보기 + "변경" 버튼
   - 클릭 시 파일 선택 (jpg/png/webp, 최대 2MB)
   - Supabase Storage 업로드 후 URL 저장
   - 크롭 기능 없음 (정사각형만 허용)
2. **닉네임** (1-30자)
3. **바이오** (0-100자, 줄바꿈 허용)
4. **소셜 링크** (Instagram 등, URL 입력)

### 저장
- 자동 저장 (debounce 500ms)

---

## 🔌 API 엔드포인트

### `POST /api/click`
**Request**:
```json
{
  "link_id": "uuid",
  "referrer": "https://instagram.com" // optional
}
```

**Response**: `204 No Content`

**처리**:
1. `link_id` 유효성 확인
2. `click_events` 테이블에 INSERT
   - `country`: `x-vercel-ip-country` 헤더
   - `device`: user-agent 파싱 (simple regex)
   - `referrer`: 요청 body
3. IP는 저장하지 않음

### `POST /api/upload`
**Auth 필요**: Supabase 세션 검증

**Request**: `multipart/form-data` (파일)

**Response**:
```json
{ "url": "https://xxx.supabase.co/storage/.../avatar.png" }
```

---

## 🧭 미들웨어

`middleware.ts`:
1. 모든 요청에서 Supabase 세션 갱신 (`updateSession`)
2. `/admin/*` 접근 시:
   - 세션 없음 → `/login` 리다이렉트
   - 세션 있으나 이메일이 `ADMIN_EMAIL`과 다름 → `/` 리다이렉트 + 로그아웃

---

## ✅ 완료 정의 (Definition of Done)

각 기능은 아래를 모두 만족해야 "완료"다:

- [ ] TypeScript 오류 0개 (`pnpm type-check`)
- [ ] ESLint 경고 0개 (`pnpm lint`)
- [ ] `pnpm build` 성공
- [ ] **모바일·PC 양쪽 스크린샷** 확인
- [ ] Lighthouse 성능 점수 90+ (공개 페이지)
- [ ] 빈 상태 / 로딩 상태 / 에러 상태 모두 처리됨
- [ ] 관련 `.md` 문서 업데이트됨
