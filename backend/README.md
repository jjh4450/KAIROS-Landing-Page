# KAIROS PocketBase Backend

동아리 게시판용 PocketBase 백엔드. 모노레포 내에서 SvelteKit 프론트엔드(`../web/`)와 **분리 배포**된다.

## 디렉토리 구조

```
backend/
├── pb_migrations/         # 스키마 정의 (Git에 커밋)
│   └── 1700000001_initial_schema.js
├── pb_hooks/              # 서버 훅 (Git에 커밋)
│   └── main.pb.js
├── pb_data/               # DB + 업로드 파일 (.gitignore)
├── .gitignore
└── README.md
```

## 빠른 시작 (로컬 개발)

```bash
# 1. PocketBase 바이너리 다운로드 (현재 v0.38.0)
#    https://github.com/pocketbase/pocketbase/releases 에서 OS에 맞는 파일
#    macOS:   pocketbase_0.38.0_darwin_arm64.zip
#    Linux:   pocketbase_0.38.0_linux_amd64.zip
#    Windows: pocketbase_0.38.0_windows_amd64.zip

# 2. 압축 풀고 이 디렉토리에 pocketbase(.exe) 실행 파일 배치

# 3. 실행 - 마이그레이션이 자동 적용됨
./pocketbase serve          # macOS / Linux
.\pocketbase.exe serve      # Windows

# Admin UI 접속: http://127.0.0.1:8090/_/
# API 엔드포인트: http://127.0.0.1:8090/api/
```

처음 실행하면 슈퍼유저(관리자) 계정 생성 안내가 나옵니다. 콘솔에 출력되는 URL로 접속해 계정을 만드세요.

### Docker 이미지로 구동

`APP_ENV`는 기본 `production` — R2 자격증명 없으면 즉시 종료. 로컬에서 R2 없이 띄우려면 `APP_ENV=dev`, litestream 끄고 PocketBase만 실행.

## 스키마

| 컬렉션 | 설명 | 주요 필드 |
|---|---|---|
| `users` | 기본 auth 컬렉션 확장 | role(admin/staff/member), nickname |
| `categories` | 게시판 카테고리 | name, slug, writePermission |
| `tags` | 태그 | name |
| `posts` | 게시글 | title, content, author, category, tags, isPinned, isPrivate |
| `comments` | 댓글 (대댓글 지원) | post, author, content, parent |

### 권한 모델

`role` 위계: **admin > staff > member > (게스트)**

- **공지사항/회의록**: admin 또는 staff만 작성
- **자유게시판/스터디/CTF/자료실/뉴스/진로**: member 이상 작성
- **Q&A**: 게스트도 작성 가능 (`writePermission: "all"`)
- **비공개 글 (`isPrivate: true`)**: 로그인한 사용자만 열람

작성자 검증, 카테고리별 권한 검사는 `pb_hooks/main.pb.js`에서 추가로 enforce합니다.

## 운영 팁

### 신규 가입자에게 자동 역할 부여

기본값으로 `member`가 자동 할당됩니다 (훅에서 처리). 정식 멤버 승급은 Admin UI에서 수동으로 `role`을 변경하세요. 추후 가입 코드/초대 시스템을 붙일 거면 `onRecordCreateRequest("users")` 훅에 로직을 추가하시면 됩니다.

### Write-up 임바고 (대회 종료 후 공개)

1. CTF 카테고리에 글 작성할 때 `isPrivate: true`로 저장
2. 대회 종료 후 운영진이 Admin UI에서 토글로 공개 전환

자동화하려면 `expiresAt` 필드를 추가해서 크론으로 처리할 수도 있습니다 (JS Jobs scheduling 참고).

### 백업

`pb_data/` 폴더 자체를 주기적으로 복사하면 됩니다 (SQLite라 단순). Admin UI의 Backups 메뉴에서 스냅샷을 생성할 수도 있습니다.

```bash
./pocketbase backups create
```

### 마이그레이션 추가하기

스키마 변경은 Admin UI에서 하면 자동으로 `pb_migrations/`에 파일이 생성됩니다 (`--automigrate` 기본 활성화). 이를 Git에 커밋해 팀원과 공유하세요.

```bash
# 빈 마이그레이션 파일 만들기 (예: 데이터 변환)
./pocketbase migrate create "your_migration_name"

# 수동 적용
./pocketbase migrate up

# 되돌리기
./pocketbase migrate down 1
```

## SvelteKit에서 사용

```bash
# 모노레포 루트에서
pnpm --filter ./web add pocketbase
```

```ts
// web/src/lib/pb.ts
import PocketBase from "pocketbase";
import { PUBLIC_PB_URL } from "$env/static/public";

export const pb = new PocketBase(PUBLIC_PB_URL);
```

`web/.env`에 `PUBLIC_PB_URL=http://127.0.0.1:8090` 추가.

서버 컴포넌트(load 함수)에서 SSR로 데이터 가져올 때는 쿠키 기반 인증을 위해 인스턴스를 요청마다 분리하는 패턴을 권장합니다. 공식 가이드: https://github.com/pocketbase/js-sdk#ssr-integration

## 배포

프론트(`web/`)와 분리 배포하므로 백엔드는 별도 호스트에 둡니다:

- **학교/동아리 자체 서버**: 바이너리 + systemd + nginx reverse proxy
- **VPS (DigitalOcean, Vultr, Hetzner)**: 월 $5짜리도 충분
- **Fly.io**: 무료 티어 + 영구 디스크 지원, PocketBase 공식 가이드 있음
- **PocketHost**: PocketBase 전용 호스팅 서비스, 무료 플랜 있음 (가장 빠름)

운영 환경에서는 반드시:
- HTTPS 설정 (Let's Encrypt + nginx, 또는 Cloudflare Tunnel)
- `pb_data/` 정기 백업
- Admin UI는 가능하면 VPN/내부망으로만 접근
- CORS: Admin UI → Settings → Application에서 프론트 도메인 허용

## 참고

- PocketBase 공식 문서: https://pocketbase.io/docs/
- JS SDK: https://github.com/pocketbase/js-sdk
- 이벤트 훅 레퍼런스: https://pocketbase.io/docs/js-event-hooks/
- 마이그레이션 가이드: https://pocketbase.io/docs/js-migrations/
