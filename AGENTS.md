# Repo Overview

단일 git repo, 두 독립 프로젝트:

- `web/` — SvelteKit (pnpm)
- `backend/` — PocketBase (Go 바이너리 + JS hooks/migrations)

pnpm 워크스페이스 구조는 쓰지 않습니다 (루트에 `pnpm-workspace.yaml`·`package.json` 없음). `web/pnpm-workspace.yaml`은 존재하지만 `packages:` 없는 **pnpm 설정 전용 파일**(v11 이후 settings는 거기서만 읽음). 각 폴더 안에서 작업하세요.

상세 가이드:
- 프론트엔드: `web/AGENTS.md` (또는 `web/CLAUDE.md`)
- 백엔드: `backend/README.md`
