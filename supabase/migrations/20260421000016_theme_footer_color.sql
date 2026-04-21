-- ============================================================
-- 20260421000016_theme_footer_color.sql
-- themes: 푸터 글자 색상 추가
-- ============================================================

ALTER TABLE themes DROP CONSTRAINT IF EXISTS color_format;

ALTER TABLE themes
  ADD COLUMN IF NOT EXISTS footer_color TEXT NOT NULL DEFAULT '#737373';

ALTER TABLE themes ADD CONSTRAINT color_format CHECK (
  bg_color_1 ~* '^#[0-9A-F]{6}$' AND
  (bg_color_2 IS NULL OR bg_color_2 ~* '^#[0-9A-F]{6}$') AND
  button_bg ~* '^#[0-9A-F]{6}$' AND
  button_text ~* '^#[0-9A-F]{6}$' AND
  button_border ~* '^#[0-9A-F]{6}$' AND
  display_name_color ~* '^#[0-9A-F]{6}$' AND
  bio_color ~* '^#[0-9A-F]{6}$' AND
  footer_color ~* '^#[0-9A-F]{6}$'
);
