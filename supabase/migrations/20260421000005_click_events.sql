-- ============================================================
-- Migration 005: click_events 테이블
-- Date: 2026-04-21
-- 설명: 링크 클릭 이벤트 로그 (분석용)
-- 개인정보 방침:
--   - IP 원본 저장 금지 (국가만 추출)
--   - User-Agent 원본 저장 금지 (디바이스 타입만)
--   - Referrer는 도메인만 (쿼리스트링 제거)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.click_events (
  id          BIGSERIAL PRIMARY KEY,
  link_id     UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  clicked_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  country     TEXT,                               -- ISO 2-letter (예: 'KR', 'US')
  device      TEXT,                               -- 'mobile' | 'desktop' | 'tablet' | 'unknown'
  referrer    TEXT,                               -- 도메인만 (예: 'instagram.com')
  session_id  TEXT,                               -- 익명 해시 (24시간 유효)

  -- 제약 조건
  CONSTRAINT device_check CHECK (
    device IS NULL OR device IN ('mobile', 'desktop', 'tablet', 'unknown')
  ),
  CONSTRAINT country_format CHECK (
    country IS NULL OR (char_length(country) = 2 AND country = upper(country))
  )
);

-- 인덱스 (통계 쿼리용)
CREATE INDEX IF NOT EXISTS click_events_link_time_idx
  ON public.click_events(link_id, clicked_at DESC);

CREATE INDEX IF NOT EXISTS click_events_time_idx
  ON public.click_events(clicked_at DESC);

CREATE INDEX IF NOT EXISTS click_events_session_idx
  ON public.click_events(session_id, clicked_at)
  WHERE session_id IS NOT NULL;

COMMENT ON TABLE public.click_events IS '링크 클릭 로그. 90일 후 자동 삭제';
COMMENT ON COLUMN public.click_events.country IS 'Vercel x-vercel-ip-country 헤더 값 (ISO 2자)';
COMMENT ON COLUMN public.click_events.referrer IS '도메인만 저장. 전체 URL 저장 금지';
COMMENT ON COLUMN public.click_events.session_id IS '익명 세션 해시 (유니크 방문자 집계용)';
