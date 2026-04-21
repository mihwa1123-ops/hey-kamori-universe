-- ============================================================
-- Migration 002: profiles 테이블
-- Date: 2026-04-21
-- 설명: 프로필 정보 (1행만 존재, 관리자 본인)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username         TEXT NOT NULL UNIQUE,
  display_name     TEXT NOT NULL,
  bio              TEXT NOT NULL DEFAULT '',
  avatar_path      TEXT,                          -- Storage 경로만, 전체 URL 금지!
  social_instagram TEXT,
  social_twitter   TEXT,
  social_youtube   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 제약 조건
  CONSTRAINT display_name_length CHECK (char_length(display_name) BETWEEN 1 AND 30),
  CONSTRAINT bio_length CHECK (char_length(bio) <= 100),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9._-]+$')
);

-- 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- updated_at 자동 갱신 트리거
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- 코멘트
COMMENT ON TABLE public.profiles IS '프로필 정보 (본인 1명만)';
COMMENT ON COLUMN public.profiles.avatar_path IS 'Supabase Storage 경로. 전체 URL 저장 금지!';
