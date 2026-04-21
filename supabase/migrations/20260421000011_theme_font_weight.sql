-- ============================================================
-- 20260421000011_theme_font_weight.sql
-- themes 테이블에 font_weight 컬럼 추가 (300/500/700)
-- ============================================================

ALTER TABLE themes
  ADD COLUMN IF NOT EXISTS font_weight TEXT NOT NULL DEFAULT '500';

ALTER TABLE themes
  DROP CONSTRAINT IF EXISTS font_weight_check;

ALTER TABLE themes
  ADD CONSTRAINT font_weight_check
  CHECK (font_weight IN ('300', '500', '700'));
