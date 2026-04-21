-- ============================================================
-- 20260421000017_profile_og_image.sql
-- profiles: og_image_path 컬럼 (링크 공유 썸네일용 정적 이미지)
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS og_image_path TEXT;
