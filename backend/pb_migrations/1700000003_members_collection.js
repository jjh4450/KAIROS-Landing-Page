/// <reference path="../pb_data/types.d.ts" />

/**
 * members - 공개 프로필 컬렉션
 *
 * 정책
 *  - users (auth) 와 1:1 관계. UNIQUE INDEX on user.
 *  - 본인이 옵트인(publicProfile=true)한 사람만 멤버 페이지에 노출.
 *  - 게시물의 작성자 이름은 users.nickname 으로 표시되므로,
 *    members 레코드가 없거나 비공개여도 글쓰기/이름 노출은 정상 동작.
 *  - 운영진(admin/staff)은 누구든 등록·수정 가능 (예: 새 멤버 온보딩 시 대신 작성).
 *  - 본인은 자기 레코드만 생성·수정·삭제 가능.
 */

migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId("users");

    const members = new Collection({
      type: "base",
      name: "members",

      // 공개 노출은 publicProfile=true 인 것만
      listRule: "publicProfile = true",
      // 본인 또는 운영진은 비공개 프로필도 볼 수 있음
      viewRule:
        "publicProfile = true || @request.auth.id = user.id || @request.auth.role = 'admin' || @request.auth.role = 'staff'",

      // 본인 또는 운영진만 생성. 본인이 자기 user.id 와 다른 값을 쓰는 건 hook에서 차단 가능
      createRule:
        "@request.auth.id != '' && (@request.auth.id = user.id || @request.auth.role = 'admin' || @request.auth.role = 'staff')",
      updateRule:
        "@request.auth.id = user.id || @request.auth.role = 'admin' || @request.auth.role = 'staff'",
      deleteRule:
        "@request.auth.id = user.id || @request.auth.role = 'admin'",

      fields: [
        // ---- 연결 ----
        {
          type: "relation",
          name: "user",
          required: true,
          maxSelect: 1,
          collectionId: usersCol.id,
          cascadeDelete: true, // users 레코드 삭제 시 같이 정리
        },

        // ---- 노출 정보 ----
        // 카드/명단에 표시할 이름. 비워두면 프론트에서 user.nickname 으로 폴백.
        { type: "text", name: "displayName", required: false, max: 50 },
        { type: "text", name: "realName", required: false, max: 50 },

        // 직책: 회장/부회장/운영진/일반멤버/졸업멤버
        {
          type: "select",
          name: "position",
          required: true,
          maxSelect: 1,
          values: [
            "president",
            "vice-president",
            "officer",
            "member",
            "alumni",
            "advisor",
          ],
        },

        // 관심/전공 트랙 (다중 선택)
        {
          type: "select",
          name: "tracks",
          required: false,
          maxSelect: 5,
          values: [
            "web",
            "pwn",
            "reverse",
            "crypto",
            "forensics",
            "network",
            "ai-security",
            "blockchain",
            "malware",
            "cloud",
            "other",
          ],
        },

        // 기수 또는 학번 (예: 24기, 2024)
        { type: "number", name: "year", required: false, min: 0 },

        { type: "editor", name: "bio", required: false },

        {
          type: "file",
          name: "avatar",
          required: false,
          maxSelect: 1,
          maxSize: 3145728, // 3MB
        },

        // ---- 외부 링크 ----
        { type: "url", name: "githubUrl", required: false },
        { type: "url", name: "blogUrl", required: false },
        { type: "url", name: "linkedinUrl", required: false },
        { type: "url", name: "twitterUrl", required: false },
        { type: "url", name: "personalUrl", required: false },

        // ---- 노출 제어 ----
        { type: "bool", name: "publicProfile", required: false },
        { type: "number", name: "sortOrder", required: false },

        { type: "autodate", name: "created", onCreate: true },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],

      indexes: [
        // 1 user : 1 member 강제
        "CREATE UNIQUE INDEX `idx_members_user` ON `members` (`user`)",
        "CREATE INDEX `idx_members_position_order` ON `members` (`position`, `sortOrder`)",
      ],
    });

    app.save(members);
  },

  (app) => {
    try {
      const col = app.findCollectionByNameOrId("members");
      app.delete(col);
    } catch (e) {
      // 무시
    }
  },
);
