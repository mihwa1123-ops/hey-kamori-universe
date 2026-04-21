-- ============================================================
-- Migration 001: 확장 프로그램 활성화
-- Date: 2026-04-21
-- ============================================================

-- updated_at 자동 갱신용 트리거 함수 제공
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- 주기적 작업 스케줄러 (오래된 클릭 이벤트 삭제용)
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA extensions;

-- UUID 생성
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
