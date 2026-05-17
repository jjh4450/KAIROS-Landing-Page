/// <reference path="../../pb_data/types.d.ts" />

/**
 * down 방향 — 초기 마이그레이션 롤백.
 * 컬렉션 역순 삭제, 데모 유저 정리, users 확장 필드 제거.
 * (rate_limits 의 down 은 resetRateLimits 가 담당)
 */

const TO_DELETE = [
  "main_aboutPillars",
  "main_sections",
  "main_heroSettings",
  "members",
  "siteSettings",
  "sponsors",
  "events",
  "achievements",
  "comments",
  "posts",
  "tags",
  "categories",
];

function teardown(app) {
  for (const name of TO_DELETE) {
    try {
      const col = app.findCollectionByNameOrId(name);
      app.delete(col);
    } catch (e) {
      // 무시
    }
  }

  try {
    const demo = app.findFirstRecordByFilter(
      "users",
      "email='demo@kairos.dev'",
    );
    app.delete(demo);
  } catch (e) {
    // 무시
  }

  try {
    const users = app.findCollectionByNameOrId("users");
    users.fields.removeByName("role");
    users.fields.removeByName("nickname");
    app.save(users);
  } catch (e) {
    // 무시
  }
}

module.exports = { teardown };
