-- ============================================================
-- 20260421000018_bio_link_translations.sql
-- profiles.bio + links.title 다국어 번역 컬럼 추가 (en/ja/es)
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio_en TEXT,
  ADD COLUMN IF NOT EXISTS bio_ja TEXT,
  ADD COLUMN IF NOT EXISTS bio_es TEXT;

ALTER TABLE links
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_ja TEXT,
  ADD COLUMN IF NOT EXISTS title_es TEXT;
