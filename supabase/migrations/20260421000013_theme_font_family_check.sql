-- ============================================================
-- 20260421000013_theme_font_family_check.sql
-- font_family 값을 새 enum 으로 정규화 + CHECK 제약 교체
-- 이전 허용값: 'pretendard', 'noto-sans-kr', 'nanum-square'
-- 새 허용값: 'pretendard', 'noto-kr', 'noto-jp', 'plex-kr'
-- ============================================================

ALTER TABLE themes DROP CONSTRAINT IF EXISTS font_family_check;

UPDATE themes
  SET font_family = CASE font_family
    WHEN 'noto-sans-kr' THEN 'noto-kr'
    WHEN 'nanum-square' THEN 'pretendard'
    ELSE font_family
  END
  WHERE font_family NOT IN ('pretendard', 'noto-kr', 'noto-jp', 'plex-kr');

ALTER TABLE themes
  ADD CONSTRAINT font_family_check
  CHECK (font_family IN ('pretendard', 'noto-kr', 'noto-jp', 'plex-kr'));
