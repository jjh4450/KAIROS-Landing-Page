/// <reference path="../pb_data/types.d.ts" />

/**
 * KAIROS 랜딩 페이지 운영용 컬렉션
 *
 *   - achievements : 대회 수상 / CVE 발견 등 Wall of Fame
 *   - events       : 세미나·스터디·CTF·컨퍼런스 일정
 *   - sponsors     : 후원사 / 파트너
 *   - siteSettings : 사이트 전역 설정 (싱글톤, key="main" 한 레코드 운영 컨벤션)
 *
 * 가입 신청은 Google Form으로 대체하므로 applications 컬렉션은 만들지 않음.
 */

migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId("users");

    // ============================================================
    // 1) achievements
    // ============================================================
    const achievements = new Collection({
      type: "base",
      name: "achievements",
      // 누구나 열람
      listRule: "",
      viewRule: "",
      // 운영진(admin/staff)만 작성/수정/삭제
      createRule:
        "@request.auth.role = 'admin' || @request.auth.role = 'staff'",
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.role = 'staff'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { type: "text", name: "title", required: true, max: 200 },
        { type: "text", name: "competition", required: false, max: 200 },
        // 자유형식: "1st", "Honorable Mention", "본선 진출" 등
        { type: "text", name: "rank", required: false, max: 50 },
        { type: "date", name: "date", required: false },
        { type: "url", name: "link", required: false },
        {
          type: "file",
          name: "coverImage",
          required: false,
          maxSelect: 1,
          maxSize: 5242880, // 5MB
        },
        {
          type: "relation",
          name: "members",
          required: false,
          maxSelect: 50,
          collectionId: usersCol.id,
          cascadeDelete: false,
        },
        { type: "editor", name: "description", required: false },
        { type: "number", name: "sortOrder", required: false },
        { type: "autodate", name: "created", onCreate: true },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE INDEX `idx_achievements_date` ON `achievements` (`date`)",
      ],
    });
    app.save(achievements);

    // ============================================================
    // 2) events
    // ============================================================
    const events = new Collection({
      type: "base",
      name: "events",
      listRule: "",
      viewRule: "",
      createRule:
        "@request.auth.role = 'admin' || @request.auth.role = 'staff'",
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.role = 'staff'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { type: "text", name: "title", required: true, max: 200 },
        { type: "editor", name: "description", required: false },
        {
          type: "select",
          name: "type",
          required: true,
          maxSelect: 1,
          values: ["seminar", "study", "ctf", "conference", "social", "other"],
        },
        { type: "date", name: "startsAt", required: true },
        { type: "date", name: "endsAt", required: false },
        { type: "text", name: "location", required: false, max: 200 },
        { type: "url", name: "link", required: false },
        {
          type: "file",
          name: "coverImage",
          required: false,
          maxSelect: 1,
          maxSize: 5242880,
        },
        { type: "autodate", name: "created", onCreate: true },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE INDEX `idx_events_startsAt` ON `events` (`startsAt`)",
        "CREATE INDEX `idx_events_type` ON `events` (`type`)",
      ],
    });
    app.save(events);

    // ============================================================
    // 3) sponsors
    // ============================================================
    const sponsors = new Collection({
      type: "base",
      name: "sponsors",
      listRule: "",
      viewRule: "",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { type: "text", name: "name", required: true, max: 100 },
        {
          type: "file",
          name: "logo",
          required: false,
          maxSelect: 1,
          maxSize: 2097152, // 2MB
        },
        { type: "url", name: "link", required: false },
        {
          type: "select",
          name: "tier",
          required: true,
          maxSelect: 1,
          values: ["platinum", "gold", "silver", "bronze", "partner"],
        },
        { type: "text", name: "description", required: false, max: 300 },
        { type: "number", name: "sortOrder", required: false },
        { type: "autodate", name: "created", onCreate: true },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE INDEX `idx_sponsors_tier_order` ON `sponsors` (`tier`, `sortOrder`)",
      ],
    });
    app.save(sponsors);

    // ============================================================
    // 4) siteSettings (싱글톤 컨벤션: key="main" 한 레코드)
    // ============================================================
    const siteSettings = new Collection({
      type: "base",
      name: "siteSettings",
      // 공개 (랜딩 페이지에서 anonymous로 읽음)
      listRule: "",
      viewRule: "",
      // 관리자만 수정 가능, 생성/삭제 차단 (단일 레코드만 운영)
      createRule: null,
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: null,
      fields: [
        // key="main" 으로 고정. UNIQUE 인덱스로 싱글톤 강제
        { type: "text", name: "key", required: true, max: 30 },

        // 히어로 카피
        { type: "text", name: "heroTitle", required: false, max: 200 },
        { type: "text", name: "heroSubtitle", required: false, max: 400 },

        // 가입 모집 정보 (Google Form으로 처리)
        { type: "bool", name: "recruitmentOpen", required: false },
        { type: "date", name: "recruitmentDeadline", required: false },
        { type: "url", name: "recruitmentFormUrl", required: false },

        // 외부 채널 링크
        { type: "url", name: "discordUrl", required: false },
        { type: "url", name: "kakaoUrl", required: false },
        { type: "url", name: "githubUrl", required: false },
        { type: "url", name: "instagramUrl", required: false },
        { type: "email", name: "contactEmail", required: false },

        // 푸터 카피 (저작권, 학교 동아리 안내 문구 등)
        { type: "text", name: "footerCopy", required: false, max: 500 },

        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX `idx_siteSettings_key` ON `siteSettings` (`key`)",
      ],
    });
    app.save(siteSettings);

    // 싱글톤 시드 레코드
    const settingsRec = new Record(siteSettings);
    settingsRec.set("key", "main");
    settingsRec.set("heroTitle", "KAIROS — KAIROS");
    settingsRec.set(
      "heroSubtitle",
      "강원대학교 학생 보안 동아리입니다. 함께 공부하고, 활동을 기록으로 남깁니다.",
    );
    settingsRec.set("recruitmentOpen", false);
    settingsRec.set("footerCopy", "© KAIROS · KAIROS");
    app.save(settingsRec);
  },

  // ----------------------------------------------------------------
  // down: 역순 삭제
  // ----------------------------------------------------------------
  (app) => {
    const toDelete = ["siteSettings", "sponsors", "events", "achievements"];
    for (const name of toDelete) {
      try {
        const col = app.findCollectionByNameOrId(name);
        app.delete(col);
      } catch (e) {
        // 무시
      }
    }
  },
);
