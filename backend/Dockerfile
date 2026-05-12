# syntax=docker/dockerfile:1.7
# PocketBase + Litestream 단일 컨테이너. Litestream이 PocketBase를 -exec로 supervise.

FROM litestream/litestream:0.5.9 AS litestream

FROM alpine:3.20 AS pb-download
ARG PB_VERSION=0.38.0
ARG TARGETARCH

RUN apk add --no-cache unzip wget ca-certificates

RUN set -eux; \
    case "${TARGETARCH}" in \
      amd64) PB_ARCH=amd64 ;; \
      arm64) PB_ARCH=arm64 ;; \
      arm)   PB_ARCH=armv7 ;; \
      *) echo "unsupported arch: ${TARGETARCH}" >&2; exit 1 ;; \
    esac; \
    wget -O /tmp/pb.zip \
      "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${PB_ARCH}.zip"; \
    unzip /tmp/pb.zip -d /pb/; \
    rm /tmp/pb.zip; \
    chmod +x /pb/pocketbase

FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata wget && \
    addgroup -S pb && \
    adduser -S -G pb -h /pb pb

COPY --from=pb-download /pb/pocketbase /usr/local/bin/pocketbase
COPY --from=litestream  /usr/local/bin/litestream /usr/local/bin/litestream

WORKDIR /pb
COPY --chown=pb:pb pb_migrations /pb/pb_migrations
COPY --chown=pb:pb pb_hooks      /pb/pb_hooks

COPY litestream.yml /etc/litestream.yml
COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN mkdir -p /pb/pb_data && chown -R pb:pb /pb /etc/litestream.yml

USER pb
EXPOSE 8090 9091

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8090/api/health || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
