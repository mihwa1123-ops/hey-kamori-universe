-- ============================================================
-- Migration 006: click_count 자동 증가 트리거
-- Date: 2026-04-21
-- 설명: click_events INSERT 시 links.click_count를 자동으로 +1
--       매번 COUNT 쿼리 돌리지 않고 캐시된 값 사용 (성능)
-- ============================================================

-- 트리거 함수
CREATE OR REPLACE FUNCTION public.increment_link_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.links
  SET click_count = click_count + 1
  WHERE id = NEW.link_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 연결
DROP TRIGGER IF EXISTS click_events_increment ON public.click_events;
CREATE TRIGGER click_events_increment
  AFTER INSERT ON public.click_events
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_link_click_count();

-- 클릭 이벤트 삭제 시 click_count도 감소 (90일 정리 후 정확도 유지)
CREATE OR REPLACE FUNCTION public.decrement_link_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.links
  SET click_count = GREATEST(click_count - 1, 0)
  WHERE id = OLD.link_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS click_events_decrement ON public.click_events;
CREATE TRIGGER click_events_decrement
  AFTER DELETE ON public.click_events
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_link_click_count();

COMMENT ON FUNCTION public.increment_link_click_count() IS 'click_events INSERT 시 links.click_count +1';
COMMENT ON FUNCTION public.decrement_link_click_count() IS 'click_events DELETE 시 links.click_count -1';
