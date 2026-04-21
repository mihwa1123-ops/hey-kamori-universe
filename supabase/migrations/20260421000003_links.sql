-- ============================================================
-- Migration 003: links 테이블
-- Date: 2026-04-21
-- 설명: 링크 목록 (드래그 정렬, 공개/비공개 지원)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  url             TEXT NOT NULL,
  is_public       BOOLEAN NOT NULL DEFAULT true,
  display_order   INTEGER NOT NULL DEFAULT 0,     -- 낮을수록 위에 표시
  click_count     INTEGER NOT NULL DEFAULT 0,     -- 비정규화 캐시 (성능)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 제약 조건
  CONSTRAINT title_length CHECK (char_length(title) BETWEEN 1 AND 40),
  CONSTRAINT url_format CHECK (url ~* '^https?://.+'),
  CONSTRAINT click_count_nonneg CHECK (click_count >= 0)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS links_profile_order_idx
  ON public.links(profile_id, display_order);

-- 공개 링크 전용 인덱스 (공개 페이지 쿼리 최적화)
CREATE INDEX IF NOT EXISTS links_public_idx
  ON public.links(profile_id, is_public, display_order)
  WHERE is_public = true;

-- updated_at 자동 갱신 트리거
DROP TRIGGER IF EXISTS links_updated_at ON public.links;
CREATE TRIGGER links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- 코멘트
COMMENT ON TABLE public.links IS '사용자의 링크 목록';
COMMENT ON COLUMN public.links.display_order IS '낮을수록 위에 표시. 드래그 정렬 시 일괄 업데이트';
COMMENT ON COLUMN public.links.click_count IS '클릭 수 캐시. click_events 트리거로 자동 증가';
