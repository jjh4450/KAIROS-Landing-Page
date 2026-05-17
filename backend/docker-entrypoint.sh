#!/bin/sh
# 부팅 시 로컬 DB 없으면 R2에서 restore, 그 다음 litestream이 pocketbase를 -exec.
# APP_ENV=production(기본)이면 R2 자격증명 필수, dev면 자격증명 없이도 PB 단독 실행.
set -eu

APP_ENV="${APP_ENV:-production}"
PB_DATA_DIR="${PB_DATA_DIR:-/pb/pb_data}"
DB_PATH="${PB_DATA_DIR}/data.db"

mkdir -p "${PB_DATA_DIR}"

# PaaS에 GHCR 이미지를 직접 띄우면 compose.yml의 S3_*→LITESTREAM_* 매핑이
# 일어나지 않음. S3_* 를 컨테이너에서 LITESTREAM_* 로 alias.
# 이미 LITESTREAM_* 가 set이면 그쪽이 우선.
# PocketBase 파일 저장은 hook이 S3_* 를 직접 읽으므로 여기 안 거침.
: "${LITESTREAM_ACCESS_KEY_ID:=${S3_ACCESS_KEY_ID:-}}"
: "${LITESTREAM_SECRET_ACCESS_KEY:=${S3_SECRET_ACCESS_KEY:-}}"
: "${LITESTREAM_BUCKET:=${S3_BACKUP_BUCKET:-}}"
: "${LITESTREAM_ENDPOINT:=${S3_ENDPOINT:-}}"
: "${LITESTREAM_REGION:=${S3_REGION:-auto}}"
: "${LITESTREAM_PATH:=pb}"
export LITESTREAM_ACCESS_KEY_ID LITESTREAM_SECRET_ACCESS_KEY \
       LITESTREAM_BUCKET LITESTREAM_ENDPOINT LITESTREAM_REGION LITESTREAM_PATH

HAS_S3_CREDS=0
if [ -n "${LITESTREAM_ACCESS_KEY_ID:-${AWS_ACCESS_KEY_ID:-}}" ]; then
  HAS_S3_CREDS=1
fi

if [ "${HAS_S3_CREDS}" = "0" ]; then
  if [ "${APP_ENV}" = "production" ]; then
    echo "[entrypoint] FATAL: APP_ENV=production requires S3_ACCESS_KEY_ID" >&2
    exit 1
  fi
  echo "[entrypoint] WARN: APP_ENV=${APP_ENV}, S3 자격증명 없음 — litestream 비활성, PocketBase 단독 실행"
fi

if [ "${HAS_S3_CREDS}" = "1" ] && [ ! -f "${DB_PATH}" ]; then
  echo "[entrypoint] restore from replica"
  litestream restore -if-replica-exists -if-db-not-exists -o "${DB_PATH}" "${DB_PATH}" || \
    echo "[entrypoint] restore 실패/스킵 — PocketBase가 새 DB 생성"
fi

PB_ARGS="serve --http=0.0.0.0:8090 --dir=${PB_DATA_DIR} --migrationsDir=/pb/pb_migrations --hooksDir=/pb/pb_hooks"

if [ -n "${PB_ENCRYPTION_KEY:-}" ]; then
  PB_ARGS="${PB_ARGS} --encryptionEnv=PB_ENCRYPTION_KEY"
fi

if [ "${HAS_S3_CREDS}" = "1" ]; then
  exec litestream replicate -exec "/usr/local/bin/pocketbase ${PB_ARGS}"
else
  exec /usr/local/bin/pocketbase ${PB_ARGS}
fi
