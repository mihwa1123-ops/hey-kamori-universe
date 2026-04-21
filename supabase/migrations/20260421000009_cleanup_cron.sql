-- ============================================================
-- Migration 009: 오래된 클릭 이벤트 자동 정리
-- Date: 2026-04-21
-- 설명: 90일 이상 된 click_events 매일 새벽 3시에 삭제
--       개인정보 최소 보관 원칙
-- ============================================================

-- 기존 스케줄 제거 (재실행 가능하도록)
SELECT cron.unschedule('cleanup-old-clicks')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-old-clicks'
);

-- 매일 새벽 3시 (KST 12시) 실행
SELECT cron.schedule(
  'cleanup-old-clicks',
  '0 3 * * *',
  $$
    DELETE FROM public.click_events
    WHERE clicked_at < now() - INTERVAL '90 days'
  $$
);

COMMENT ON EXTENSION pg_cron IS '90일 이상 된 클릭 이벤트 자동 삭제 스케줄';
