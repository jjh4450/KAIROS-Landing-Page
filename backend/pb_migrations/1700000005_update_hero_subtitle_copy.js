/// <reference path="../pb_data/types.d.ts" />

/**
 * siteSettings (key="main") 의 heroSubtitle 문구를 새 카피로 업데이트.
 *
 * 1700000002 마이그레이션의 시드는 이미 적용된 환경의 기존 레코드를
 * 자동으로 갱신하지 않으므로, 라이브 DB의 값도 새 카피와 맞추기 위해
 * 별도 마이그레이션으로 처리.
 *
 * 이전 영어 직역체 "함께 배우고, 함께 공격하고, 함께 방어합니다." 를
 * 담백한 사실 진술로 교체.
 */

const OLD_SUBTITLE =
  "강원대학교 보안 동아리. 함께 배우고, 함께 공격하고, 함께 방어합니다.";
const NEW_SUBTITLE =
  "강원대학교 학생 보안 동아리입니다. 함께 공부하고, 활동을 기록으로 남깁니다.";

migrate(
  (app) => {
    let rec;
    try {
      rec = app.findFirstRecordByFilter("siteSettings", "key='main'");
    } catch (e) {
      // 시드 레코드가 없으면 (예: 부분적으로 손상된 환경) 조용히 종료.
      return;
    }
    rec.set("heroSubtitle", NEW_SUBTITLE);
    app.save(rec);
  },
  (app) => {
    let rec;
    try {
      rec = app.findFirstRecordByFilter("siteSettings", "key='main'");
    } catch (e) {
      return;
    }
    rec.set("heroSubtitle", OLD_SUBTITLE);
    app.save(rec);
  },
);
