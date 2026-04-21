---
description: 배포 전 모든 검증을 실행
allowed-tools: Bash(pnpm:*), Bash(git status), Read(**)
---

# 배포 전 검증

Vercel에 배포하기 전에 안전한지 확인합니다.

## 실행 순서

1. **Git 상태 확인**
   - `git status`로 커밋되지 않은 변경 확인
   - 커밋 안 한 파일이 있으면 경고

2. **TypeScript 검증**
   - `pnpm type-check` 실행
   - 에러 있으면 여기서 중단하고 보고

3. **린트 검증**
   - `pnpm lint` 실행
   - 경고/에러 있으면 보고

4. **빌드 검증**
   - `pnpm build` 실행
   - 빌드 실패 시 로그 요약

5. **환경 변수 체크**
   - `.env.example`과 `.env.local` 비교
   - 빠진 변수 있는지 확인

6. **마이그레이션 동기화 확인**
   - DB_SCHEMA.md 최종 수정일 vs 가장 최신 마이그레이션 파일 날짜 비교
   - DB_SCHEMA.md가 더 최신이면 "마이그레이션 파일 빠진 것 같은데요?" 경고

7. **요약 리포트**
   - 모든 검증 결과를 표로 정리
   - 배포 가능 여부 결론
   - 문제 있으면 해결 방법 제시

## 출력 예시

```
✅ Git: 모든 변경 커밋됨
✅ TypeScript: 오류 0개
⚠️  Lint: 경고 3개 (무시 가능)
✅ Build: 성공
✅ 환경 변수: 모두 설정됨
✅ 마이그레이션: 동기화됨

배포 가능 상태입니다. git push로 Vercel 배포 트리거하세요.
```
