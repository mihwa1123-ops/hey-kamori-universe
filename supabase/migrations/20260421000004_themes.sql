-- ============================================================
-- Migration 004: themes 테이블
-- Date: 2026-04-21
-- 설명: 테마 커스터마이징 (배경/버튼/폰트)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.themes (
  profile_id       UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 배경
  bg_type          TEXT NOT NULL DEFAULT 'solid',
  bg_color_1       TEXT NOT NULL DEFAULT '#FDF9F3',
  bg_color_2       TEXT,                           -- gradient일 때만 사용
  bg_image_path    TEXT,                           -- image 타입일 때 Storage 경로

  -- 버튼
  button_bg        TEXT NOT NULL DEFAULT '#FFFFFF',
  button_text      TEXT NOT NULL DEFAULT '#2D2A3E',
  button_border    TEXT NOT NULL DEFAULT '#E5DFF5',
  button_radius    TEXT NOT NULL DEFAULT 'rounded-2xl',
  button_shadow    TEXT NOT NULL DEFAULT 'shadow-sm',

  -- 폰트
  font_family      TEXT NOT NULL DEFAULT 'pretendard',

  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 제약 조건
  CONSTRAINT bg_type_check CHECK (bg_type IN ('solid', 'gradient', 'image')),
  CONSTRAINT button_shadow_check CHECK (
    button_shadow IN ('shadow-none', 'shadow-sm', 'shadow-md', 'shadow-lg')
  ),
  CONSTRAINT button_radius_check CHECK (
    button_radius IN ('rounded-none', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full')
  ),
  CONSTRAINT font_family_check CHECK (
    font_family IN ('pretendard', 'noto-sans-kr', 'nanum-square')
  ),
  CONSTRAINT color_format CHECK (
    bg_color_1 ~* '^#[0-9A-Fa-f]{6}$' AND
    (bg_color_2 IS NULL OR bg_color_2 ~* '^#[0-9A-Fa-f]{6}$') AND
    button_bg ~* '^#[0-9A-Fa-f]{6}$' AND
    button_text ~* '^#[0-9A-Fa-f]{6}$' AND
    button_border ~* '^#[0-9A-Fa-f]{6}$'
  )
);

-- updated_at 자동 갱신 트리거
DROP TRIGGER IF EXISTS themes_updated_at ON public.themes;
CREATE TRIGGER themes_updated_at
  BEFORE UPDATE ON public.themes
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

COMMENT ON TABLE public.themes IS '테마 커스터마이징 설정 (1:1 with profiles)';
