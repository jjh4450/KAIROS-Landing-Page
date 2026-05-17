/// <reference path="../pb_data/types.d.ts" />

/**
 * KAIROS 백엔드 초기 마이그레이션.
 *
 * 실제 작업은 ./_lib/ 모듈로 분리:
 *   collections.js  — 14개 컬렉션 정의/생성
 *   seeds.js        — 운영 시드 (카테고리 9개 + 4 싱글톤/리스트)
 *   rate_limits.js  — 빌트인 rate limiter 룰
 *   teardown.js     — down 역순 삭제
 *
 * PB 마이그레이션 로더는 `<timestamp>_<name>.js` 만 픽업하므로
 * _lib/ 하위는 자동 실행 대상이 아님.
 */

// `__hooks` 는 pb_hooks 절대경로 — cwd 와 무관하게 _lib 위치 고정
// PB 0.23+ 부터 마이그레이션 로더에도 노출 (참고: pocketbase/pocketbase#7125)
const _libBase = `${__hooks}/../pb_migrations/_lib`;
const { createCollections } = require(`${_libBase}/collections.js`);
const { seedProduction } = require(`${_libBase}/seeds.js`);
const { applyRateLimits, resetRateLimits } = require(`${_libBase}/rate_limits.js`);
const { teardown } = require(`${_libBase}/teardown.js`);

migrate(
  (app) => {
    const cols = createCollections(app);
    seedProduction(app, cols);
    applyRateLimits(app);
  },

  (app) => {
    teardown(app);
    resetRateLimits(app);
  },
);
