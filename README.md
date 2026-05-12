# KAIROS Landing Page

경북대학교 정보보호 동아리 KAIROS 랜딩 페이지 + 게시판.

## 구성

```
.
├── web/        SvelteKit 프론트엔드 (TypeScript, Tailwind, paraglide i18n, shadcn-svelte)
└── backend/    PocketBase 백엔드 (게시물·댓글·카테고리 + JS hooks)
```

프론트와 백엔드는 **분리 배포**합니다. 자세한 사용법은 각 하위 폴더의 README 참고:

- [web/README.md](web/README.md) — 개발 서버 실행, 빌드
- [backend/README.md](backend/README.md) — PocketBase 바이너리 설치, 마이그레이션, 권한 모델

## 빠른 시작

```powershell
# 프론트
cd web
pnpm install
pnpm dev          # http://localhost:5173

# 백엔드 (별도 터미널)
cd backend
.\pocketbase.exe serve   # http://127.0.0.1:8090
```

`web/.env`에 `PUBLIC_PB_URL=http://127.0.0.1:8090` 설정 필요.
