# Repo Overview for Claude Code

이 레포는 단일 git repo 안에 두 개의 독립 프로젝트를 담고 있습니다.

```
web/        SvelteKit 프론트엔드. node 프로젝트(pnpm).
backend/    PocketBase 백엔드. Go 바이너리 + JS hooks/migrations. node 의존성 없음.
```

node 프로젝트는 `web/` 하나뿐이라 **pnpm 워크스페이스 구조는 쓰지 않습니다** (루트에 `pnpm-workspace.yaml` 없음, 루트 `package.json` 없음, 모든 `pnpm` 명령은 `cd web` 후 실행).

단, `web/pnpm-workspace.yaml`은 존재합니다 — 이건 워크스페이스 선언이 아니라 **pnpm 설정 파일**입니다. pnpm v11부터 `package.json`의 `pnpm` 필드를 읽지 않기 때문에 `onlyBuiltDependencies`(Tailwind oxide / esbuild postinstall 허용) 같은 설정을 여기 둡니다. `packages:` 키가 없으므로 워크스페이스로 동작하지 않음.

두 번째 node 패키지가 생기면 그때 진짜 워크스페이스(루트로 승격 + `packages:` 추가)로 전환을 고려.

## 작업 위치별 가이드

- 프론트엔드 작업: `cd web` 후 진행. `web/CLAUDE.md`의 Svelte MCP 사용 규칙을 따르세요.
- 백엔드 작업: `cd backend` 후 진행. 스키마는 `pb_migrations/`, 비즈니스 로직은 `pb_hooks/`.
- 양쪽을 동시에 건드리는 PR은 한 커밋에 묶지 말고 가능하면 분리.

## 일반 규칙

- 패키지 매니저는 `pnpm` (web/ 내에서만).
- 백엔드 데이터(`backend/pb_data/`)와 바이너리는 `.gitignore`. 마이그레이션/훅 JS만 커밋.
