/// <reference path="../pb_data/types.d.ts" />

/**
 * heroSubtitle: "보안 동아리" → "보안 모임" 리카피.
 * init.js 시드는 신규 설치용이고 이미 떠 있는 인스턴스는 이 마이그레이션으로 갱신.
 */

migrate(
  (app) => {
    try {
      const r = app.findFirstRecordByFilter("siteSettings", "key='main'");
      r.set(
        "heroSubtitle",
        "강원권 학생들이 모여 만들어 나가는 보안 모임입니다.",
      );
      app.save(r);
    } catch (e) {
      // 시드 레코드가 없는 fresh install — init.js가 새 카피로 시드함
    }
  },

  (app) => {
    try {
      const r = app.findFirstRecordByFilter("siteSettings", "key='main'");
      r.set(
        "heroSubtitle",
        "강원권 학생들이 모여 만들어 나가는 보안 동아리입니다.",
      );
      app.save(r);
    } catch (e) {
      // ignore
    }
  },
);
