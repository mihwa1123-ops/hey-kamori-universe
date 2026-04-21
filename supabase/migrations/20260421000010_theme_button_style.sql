-- ============================================================
-- 20260421000010_theme_button_style.sql
-- themes 테이블에 button_style 컬럼 추가 (solid/glass/outline)
-- ============================================================

ALTER TABLE themes
  ADD COLUMN IF NOT EXISTS button_style TEXT NOT NULL DEFAULT 'solid';

-- 기존 행은 기본값 'solid'로 백필

ALTER TABLE themes
  DROP CONSTRAINT IF EXISTS button_style_check;

ALTER TABLE themes
  ADD CONSTRAINT button_style_check
  CHECK (button_style IN ('solid', 'glass', 'outline'));
