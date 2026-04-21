-- ============================================================
-- Migration 008: Storage 버킷 생성
-- Date: 2026-04-21
-- 설명: 프로필 사진, 테마 배경 이미지 업로드용 버킷
-- ============================================================

-- ============================================================
-- avatars 버킷 (프로필 사진)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,                                     -- Public read
  2097152,                                  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- avatars 버킷 정책
DROP POLICY IF EXISTS "avatars_read_public" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;

-- 누구나 읽기
CREATE POLICY "avatars_read_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 본인 폴더에만 업로드 (path가 {user_id}/... 형식이어야 함)
CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 본인 파일만 수정
CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 본인 파일만 삭제
CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- backgrounds 버킷 (테마 배경 이미지)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backgrounds',
  'backgrounds',
  true,
  5242880,                                  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- backgrounds 버킷 정책
DROP POLICY IF EXISTS "backgrounds_read_public" ON storage.objects;
DROP POLICY IF EXISTS "backgrounds_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "backgrounds_update_own" ON storage.objects;
DROP POLICY IF EXISTS "backgrounds_delete_own" ON storage.objects;

CREATE POLICY "backgrounds_read_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'backgrounds');

CREATE POLICY "backgrounds_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'backgrounds'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "backgrounds_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'backgrounds'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "backgrounds_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'backgrounds'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
