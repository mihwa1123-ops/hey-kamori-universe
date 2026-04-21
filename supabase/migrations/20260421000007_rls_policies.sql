-- ============================================================
-- Migration 007: Row Level Security (RLS) 정책
-- Date: 2026-04-21
-- 설명: 테이블별 행 단위 접근 권한 설정
-- ============================================================

-- ============================================================
-- profiles 테이블
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 (재실행 가능하도록)
DROP POLICY IF EXISTS "profiles_read_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;

-- 누구나 읽기 (공개 페이지용)
CREATE POLICY "profiles_read_public"
  ON public.profiles FOR SELECT
  USING (true);

-- 본인만 수정
CREATE POLICY "profiles_update_self"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 본인만 삽입 (회원가입 시 1회)
CREATE POLICY "profiles_insert_self"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- links 테이블
-- ============================================================
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "links_read_public" ON public.links;
DROP POLICY IF EXISTS "links_read_own" ON public.links;
DROP POLICY IF EXISTS "links_insert_own" ON public.links;
DROP POLICY IF EXISTS "links_update_own" ON public.links;
DROP POLICY IF EXISTS "links_delete_own" ON public.links;

-- 공개 링크는 누구나 읽기
CREATE POLICY "links_read_public"
  ON public.links FOR SELECT
  USING (is_public = true);

-- 본인 링크는 모두 읽기 (비공개 포함)
CREATE POLICY "links_read_own"
  ON public.links FOR SELECT
  USING (auth.uid() = profile_id);

-- 본인 링크만 생성
CREATE POLICY "links_insert_own"
  ON public.links FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- 본인 링크만 수정
CREATE POLICY "links_update_own"
  ON public.links FOR UPDATE
  USING (auth.uid() = profile_id);

-- 본인 링크만 삭제
CREATE POLICY "links_delete_own"
  ON public.links FOR DELETE
  USING (auth.uid() = profile_id);

-- ============================================================
-- themes 테이블
-- ============================================================
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "themes_read_public" ON public.themes;
DROP POLICY IF EXISTS "themes_write_own" ON public.themes;

-- 누구나 읽기 (공개 페이지에서 테마 렌더링)
CREATE POLICY "themes_read_public"
  ON public.themes FOR SELECT
  USING (true);

-- 본인만 CRUD
CREATE POLICY "themes_write_own"
  ON public.themes FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- ============================================================
-- click_events 테이블
-- ============================================================
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clicks_insert_anyone" ON public.click_events;
DROP POLICY IF EXISTS "clicks_read_own" ON public.click_events;

-- INSERT는 누구나 가능 (공개 페이지 방문자가 클릭할 수 있어야 함)
CREATE POLICY "clicks_insert_anyone"
  ON public.click_events FOR INSERT
  WITH CHECK (true);

-- SELECT는 본인 링크의 이벤트만 (통계 페이지용)
CREATE POLICY "clicks_read_own"
  ON public.click_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.links
      WHERE links.id = click_events.link_id
        AND links.profile_id = auth.uid()
    )
  );

-- ============================================================
-- 코멘트
-- ============================================================
COMMENT ON POLICY "profiles_read_public" ON public.profiles IS '공개 페이지용';
COMMENT ON POLICY "links_read_public" ON public.links IS 'is_public=true인 링크만 방문자에게 노출';
COMMENT ON POLICY "clicks_insert_anyone" ON public.click_events IS '방문자 클릭 기록 허용';
