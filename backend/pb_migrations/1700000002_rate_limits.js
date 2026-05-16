/// <reference path="../pb_data/types.d.ts" />

/**
 * 빌트인 rate limiter 활성화. PB 기본값(*:auth = 2/3s)이 brute-force에
 * 사실상 무방비라 직접 룰을 깐다. Admin UI에서 조정하면 후속 마이그레이션
 * 자동 생성됨.
 */

const EMAIL_SEND_PATHS = [
  "/api/collections/users/request-password-reset",
  "/api/collections/users/request-verification",
  "/api/collections/users/request-email-change",
];

migrate(
  (app) => {
    const settings = app.settings();

    settings.rateLimits.enabled = true;
    settings.rateLimits.rules = [
      // *:auth 는 로그인뿐 아니라 토큰 refresh 도 포함 — 너무 빡빡하면 SDK 자동갱신이 막힘
      new RateLimitRule({ label: "*:auth", maxRequests: 5, duration: 60 }),

      // 이메일 발송 abuse — 비용·스팸 리스크 때문에 별도로 빡빡하게
      ...EMAIL_SEND_PATHS.map(
        (label) => new RateLimitRule({ label, maxRequests: 3, duration: 900 }),
      ),

      new RateLimitRule({
        label: "posts:create",
        audience: "@auth",
        maxRequests: 5,
        duration: 60,
      }),
      new RateLimitRule({
        label: "comments:create",
        audience: "@auth",
        maxRequests: 15,
        duration: 60,
      }),

      new RateLimitRule({
        label: "*",
        audience: "@guest",
        maxRequests: 300,
        duration: 60,
      }),
      new RateLimitRule({
        label: "*",
        audience: "@auth",
        maxRequests: 600,
        duration: 60,
      }),
    ];

    app.save(settings);
  },

  (app) => {
    const settings = app.settings();
    settings.rateLimits.enabled = false;
    settings.rateLimits.rules = [];
    app.save(settings);
  },
);
