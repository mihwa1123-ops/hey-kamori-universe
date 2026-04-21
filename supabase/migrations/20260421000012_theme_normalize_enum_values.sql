-- ============================================================
-- 20260421000012_theme_normalize_enum_values.sql
-- button_radius / button_shadow 값을 Tailwind 클래스 → 시맨틱 enum 으로 정규화
-- 원본 4번 마이그레이션에 이미 옛 값 기준 CHECK 제약이 걸려있어서
-- 먼저 제약을 DROP 한 뒤 UPDATE 하고, 새 CHECK 제약을 다시 건다.
-- ============================================================

ALTER TABLE themes DROP CONSTRAINT IF EXISTS button_radius_check;
ALTER TABLE themes DROP CONSTRAINT IF EXISTS button_shadow_check;

UPDATE themes
  SET button_radius = CASE button_radius
    WHEN 'rounded-none' THEN 'square'
    WHEN 'rounded-lg'   THEN 'round'
    WHEN 'rounded-xl'   THEN 'round'
    WHEN 'rounded-2xl'  THEN 'rounder'
    WHEN 'rounded-3xl'  THEN 'rounder'
    WHEN 'rounded-full' THEN 'full'
    ELSE 'rounder'
  END
  WHERE button_radius NOT IN ('square', 'round', 'rounder', 'full');

UPDATE themes
  SET button_shadow = CASE button_shadow
    WHEN 'shadow-none' THEN 'none'
    WHEN 'shadow-sm'   THEN 'soft'
    WHEN 'shadow-md'   THEN 'strong'
    WHEN 'shadow-lg'   THEN 'hard'
    ELSE 'soft'
  END
  WHERE button_shadow NOT IN ('none', 'soft', 'strong', 'hard');

ALTER TABLE themes ALTER COLUMN button_radius SET DEFAULT 'rounder';
ALTER TABLE themes ALTER COLUMN button_shadow SET DEFAULT 'soft';

ALTER TABLE themes
  ADD CONSTRAINT button_radius_check
  CHECK (button_radius IN ('square', 'round', 'rounder', 'full'));

ALTER TABLE themes
  ADD CONSTRAINT button_shadow_check
  CHECK (button_shadow IN ('none', 'soft', 'strong', 'hard'));
