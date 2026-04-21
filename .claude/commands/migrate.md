---
description: DB 마이그레이션을 안전하게 실행
allowed-tools: Bash(pnpm:*), Bash(supabase:*), Read(DB_SCHEMA.md), Read(supabase/migrations/**)
---

# DB 마이그레이션 실행

DB_SCHEMA.md와 supabase/migrations/의 상태를 확인하고, 안전하게 마이그레이션을 실행합니다.

## 실행 순서

1. 가장 최신 마이그레이션 파일을 읽고 내용 요약
2. `DB_SCHEMA.md`와 일치하는지 확인
3. 사용자에게 실행 전 확인 요청:
   - 변경될 테이블/컬럼 목록
   - 데이터 손실 가능성
   - 롤백 방법
4. 사용자 승인 후 `pnpm db:push` 실행
5. 성공 시 `pnpm db:types` 실행하여 TypeScript 타입 갱신
6. 변경된 타입 파일을 요약해서 보고

## 주의

- 사용자가 명시적으로 "실행해"라고 말하기 전까지 `db:push`를 실행하지 말 것
- `db:reset`은 절대 자동 실행하지 말 것 (데이터 전부 삭제됨)
- 실패 시 어떤 단계에서 실패했는지 명확히 보고
