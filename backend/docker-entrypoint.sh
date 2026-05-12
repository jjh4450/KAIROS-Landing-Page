#!/bin/sh
# 부팅 시 로컬 DB 없으면 R2에서 restore, 그 다음 litestream이 pocketbase를 -exec.
set -eu

PB_DATA_DIR="${PB_DATA_DIR:-/pb/pb_data}"
DB_PATH="${PB_DATA_DIR}/data.db"

mkdir -p "${PB_DATA_DIR}"

if [ -z "${LITESTREAM_ACCESS_KEY_ID:-${AWS_ACCESS_KEY_ID:-}}" ]; then
  echo "[entrypoint] WARN: LITESTREAM_ACCESS_KEY_ID/AWS_ACCESS_KEY_ID 미설정 — 복제 실패"
fi

if [ ! -f "${DB_PATH}" ]; then
  echo "[entrypoint] restore from replica"
  litestream restore -if-replica-exists -if-db-not-exists -o "${DB_PATH}" "${DB_PATH}" || \
    echo "[entrypoint] restore 실패/스킵 — PocketBase가 새 DB 생성"
fi

PB_ARGS="serve --http=0.0.0.0:8090 --dir=${PB_DATA_DIR} --migrationsDir=/pb/pb_migrations --hooksDir=/pb/pb_hooks"

if [ -n "${PB_ENCRYPTION_KEY:-}" ]; then
  PB_ARGS="${PB_ARGS} --encryptionEnv=PB_ENCRYPTION_KEY"
fi

exec litestream replicate -exec "/usr/local/bin/pocketbase ${PB_ARGS}"
