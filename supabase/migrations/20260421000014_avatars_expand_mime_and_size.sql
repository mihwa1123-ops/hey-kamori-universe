-- ============================================================
-- 20260421000014_avatars_expand_mime_and_size.sql
-- avatars 버킷: GIF + mp4/webm 허용, 크기 제한 10MB 로 상향
-- ============================================================

UPDATE storage.buckets
  SET
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm'
    ]
  WHERE id = 'avatars';
