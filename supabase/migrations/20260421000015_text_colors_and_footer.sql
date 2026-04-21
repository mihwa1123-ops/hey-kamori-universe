-- ============================================================
-- 20260421000015_text_colors_and_footer.sql
-- themes: 닉네임/내용 글자색 추가
-- profiles: 푸터 텍스트 추가
-- ============================================================

ALTER TABLE themes DROP CONSTRAINT IF EXISTS color_format;

ALTER TABLE themes
  ADD COLUMN IF NOT EXISTS display_name_color TEXT NOT NULL DEFAULT '#2D2A3E',
  ADD COLUMN IF NOT EXISTS bio_color TEXT NOT NULL DEFAULT '#737373';

ALTER TABLE themes ADD CONSTRAINT color_format CHECK (
  bg_color_1 ~* '^#[0-9A-F]{6}$' AND
  (bg_color_2 IS NULL OR bg_color_2 ~* '^#[0-9A-F]{6}$') AND
  button_bg ~* '^#[0-9A-F]{6}$' AND
  button_text ~* '^#[0-9A-F]{6}$' AND
  button_border ~* '^#[0-9A-F]{6}$' AND
  display_name_color ~* '^#[0-9A-F]{6}$' AND
  bio_color ~* '^#[0-9A-F]{6}$'
);

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT 'Made with 💜 by kamori';
