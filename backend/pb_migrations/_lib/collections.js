/// <reference path="../../pb_data/types.d.ts" />

/**
 * KAIROS 컬렉션 13개 정의·생성.
 *
 *   1) users (auth 확장)              8) sponsors
 *   2) categories                     9) siteSettings (싱글톤, 사이트 전역)
 *   3) tags                          10) members
 *   4) posts                         11) main_heroSettings (싱글톤, 랜딩 전용)
 *   5) comments                      12) main_sections (랜딩 전용)
 *   6) achievements                  13) main_aboutPillars (랜딩 전용)
 *   7) events
 *
 * `main_` 접두사: 메인 페이지(랜딩, `/`) 렌더링에만 영향. siteSettings 는 모든
 * 페이지 헤더/푸터에서 쓰니까 접두사 없이 유지.
 */
function createCollections(app) {
  // ============================================================
  // 1) users 확장
  // ============================================================
  const users = app.findCollectionByNameOrId("users");
  users.fields.add(
    new SelectField({
      name: "role",
      required: true,
      values: ["admin", "staff", "member"],
      maxSelect: 1,
    }),
  );
  users.fields.add(
    new TextField({ name: "nickname", required: false, max: 30 }),
  );
  app.save(users);

  // ============================================================
  // 2) categories
  // ============================================================
  const categories = new Collection({
    type: "base",
    name: "categories",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "text", name: "name", required: true, max: 50 },
      { type: "text", name: "slug", required: true, max: 50 },
      { type: "text", name: "description", required: false, max: 200 },
      {
        type: "select",
        name: "writePermission",
        required: true,
        values: ["all", "member", "staff", "admin"],
        maxSelect: 1,
      },
      { type: "number", name: "sortOrder", required: false, min: 0 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX `idx_categories_slug` ON `categories` (`slug`)",
    ],
  });
  app.save(categories);

  // ============================================================
  // 3) tags
  // ============================================================
  const tags = new Collection({
    type: "base",
    name: "tags",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule:
      "@request.auth.role = 'admin' || @request.auth.role = 'staff'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [{ type: "text", name: "name", required: true, max: 30 }],
    indexes: ["CREATE UNIQUE INDEX `idx_tags_name` ON `tags` (`name`)"],
  });
  app.save(tags);

  // ============================================================
  // 4) posts
  // ============================================================
  const usersCol = app.findCollectionByNameOrId("users");
  const categoriesCol = app.findCollectionByNameOrId("categories");
  const tagsCol = app.findCollectionByNameOrId("tags");

  const posts = new Collection({
    type: "base",
    name: "posts",
    listRule: "isPrivate = false || @request.auth.id != ''",
    viewRule: "isPrivate = false || @request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule:
      "@request.auth.id = author.id || @request.auth.role = 'admin' || @request.auth.role = 'staff'",
    deleteRule:
      "@request.auth.id = author.id || @request.auth.role = 'admin'",
    fields: [
      { type: "text", name: "title", required: true, max: 200 },
      { type: "editor", name: "content", required: true },
      { type: "autodate", name: "created", onCreate: true },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      {
        type: "relation",
        name: "author",
        required: true,
        maxSelect: 1,
        collectionId: usersCol.id,
        cascadeDelete: false,
      },
      {
        type: "relation",
        name: "category",
        required: true,
        maxSelect: 1,
        collectionId: categoriesCol.id,
        cascadeDelete: false,
      },
      {
        type: "relation",
        name: "tags",
        required: false,
        maxSelect: 10,
        collectionId: tagsCol.id,
        cascadeDelete: false,
      },
      {
        type: "file",
        name: "attachments",
        required: false,
        maxSelect: 10,
        maxSize: 10485760,
      },
      { type: "bool", name: "isPinned", required: false },
      { type: "bool", name: "isPrivate", required: false },
      { type: "number", name: "viewCount", required: false, min: 0 },
    ],
    indexes: [
      "CREATE INDEX `idx_posts_category` ON `posts` (`category`)",
      "CREATE INDEX `idx_posts_author` ON `posts` (`author`)",
      "CREATE INDEX `idx_posts_created` ON `posts` (`created`)",
    ],
  });
  app.save(posts);

  // ============================================================
  // 5) comments (parent self-ref은 저장 이후 추가)
  // ============================================================
  const postsCol = app.findCollectionByNameOrId("posts");

  const comments = new Collection({
    type: "base",
    name: "comments",
    listRule: "post.isPrivate = false || @request.auth.id != ''",
    viewRule: "post.isPrivate = false || @request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id = author.id",
    deleteRule:
      "@request.auth.id = author.id || @request.auth.role = 'admin'",
    fields: [
      {
        type: "relation",
        name: "post",
        required: true,
        maxSelect: 1,
        collectionId: postsCol.id,
        cascadeDelete: true,
      },
      {
        type: "relation",
        name: "author",
        required: true,
        maxSelect: 1,
        collectionId: usersCol.id,
        cascadeDelete: false,
      },
      { type: "text", name: "content", required: true, max: 2000 },
      { type: "autodate", name: "created", onCreate: true },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
    ],
    indexes: ["CREATE INDEX `idx_comments_post` ON `comments` (`post`)"],
  });
  app.save(comments);

  const commentsCol = app.findCollectionByNameOrId("comments");
  commentsCol.fields.add(
    new RelationField({
      name: "parent",
      required: false,
      maxSelect: 1,
      collectionId: commentsCol.id,
      cascadeDelete: true,
    }),
  );
  app.save(commentsCol);

  // ============================================================
  // 6) achievements
  // ============================================================
  const achievements = new Collection({
    type: "base",
    name: "achievements",
    listRule: "",
    viewRule: "",
    createRule:
      "@request.auth.role = 'admin' || @request.auth.role = 'staff'",
    updateRule:
      "@request.auth.role = 'admin' || @request.auth.role = 'staff'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "text", name: "title", required: true, max: 200 },
      { type: "text", name: "competition", required: false, max: 200 },
      { type: "text", name: "rank", required: false, max: 50 },
      { type: "date", name: "date", required: false },
      { type: "url", name: "link", required: false },
      {
        type: "file",
        name: "coverImage",
        required: false,
        maxSelect: 1,
        maxSize: 5242880,
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
  // 7) events
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
  // 8) sponsors
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
        maxSize: 2097152,
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
  // 9) siteSettings (싱글톤 key="main")
  // ============================================================
  const siteSettings = new Collection({
    type: "base",
    name: "siteSettings",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: null,
    fields: [
      { type: "text", name: "key", required: true, max: 30 },
      { type: "text", name: "siteTitle", required: false, max: 120 },
      { type: "text", name: "siteDescription", required: false, max: 300 },
      { type: "bool", name: "recruitmentOpen", required: false },
      { type: "date", name: "recruitmentDeadline", required: false },
      { type: "url", name: "recruitmentFormUrl", required: false },
      { type: "url", name: "discordUrl", required: false },
      { type: "url", name: "kakaoUrl", required: false },
      { type: "url", name: "githubUrl", required: false },
      { type: "url", name: "instagramUrl", required: false },
      { type: "email", name: "contactEmail", required: false },
      { type: "text", name: "footerCopy", required: false, max: 500 },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE UNIQUE INDEX `idx_siteSettings_key` ON `siteSettings` (`key`)",
    ],
  });
  app.save(siteSettings);

  // ============================================================
  // 10) members
  // ============================================================
  const members = new Collection({
    type: "base",
    name: "members",
    listRule: "publicProfile = true",
    viewRule:
      "publicProfile = true || @request.auth.id = user.id || @request.auth.role = 'admin' || @request.auth.role = 'staff'",
    createRule:
      "@request.auth.id != '' && (@request.auth.id = user.id || @request.auth.role = 'admin' || @request.auth.role = 'staff')",
    updateRule:
      "@request.auth.id = user.id || @request.auth.role = 'admin' || @request.auth.role = 'staff'",
    deleteRule:
      "@request.auth.id = user.id || @request.auth.role = 'admin'",
    fields: [
      {
        type: "relation",
        name: "user",
        required: true,
        maxSelect: 1,
        collectionId: usersCol.id,
        cascadeDelete: true,
      },
      { type: "text", name: "displayName", required: false, max: 50 },
      { type: "text", name: "realName", required: false, max: 50 },
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
      { type: "number", name: "year", required: false, min: 0 },
      { type: "editor", name: "bio", required: false },
      {
        type: "file",
        name: "avatar",
        required: false,
        maxSelect: 1,
        maxSize: 3145728,
      },
      { type: "url", name: "githubUrl", required: false },
      { type: "url", name: "blogUrl", required: false },
      { type: "url", name: "linkedinUrl", required: false },
      { type: "url", name: "twitterUrl", required: false },
      { type: "url", name: "personalUrl", required: false },
      { type: "bool", name: "publicProfile", required: false },
      { type: "number", name: "sortOrder", required: false },
      { type: "autodate", name: "created", onCreate: true },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE UNIQUE INDEX `idx_members_user` ON `members` (`user`)",
      "CREATE INDEX `idx_members_position_order` ON `members` (`position`, `sortOrder`)",
    ],
  });
  app.save(members);

  // ============================================================
  // 11) main_heroSettings (싱글톤 key="main") — 랜딩 Hero 영역 전용
  // ============================================================
  const heroSettings = new Collection({
    type: "base",
    name: "main_heroSettings",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: null,
    fields: [
      { type: "text", name: "key", required: true, max: 30 },
      { type: "text", name: "eyebrow", required: false, max: 60 },
      { type: "text", name: "title", required: false, max: 120 },
      { type: "text", name: "tagline", required: false, max: 200 },
      { type: "text", name: "subtitle", required: false, max: 400 },
      { type: "text", name: "primaryCtaLabel", required: false, max: 40 },
      { type: "text", name: "secondaryCtaLabel", required: false, max: 40 },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE UNIQUE INDEX `idx_main_heroSettings_key` ON `main_heroSettings` (`key`)",
    ],
  });
  app.save(heroSettings);

  // ============================================================
  // 12) main_sections — 랜딩 Hero 외 6개 섹션. admin이 order/visible로 제어
  // ============================================================
  const sections = new Collection({
    type: "base",
    name: "main_sections",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "text", name: "slug", required: true, max: 30 },
      { type: "text", name: "eyebrow", required: false, max: 60 },
      { type: "text", name: "title", required: false, max: 120 },
      { type: "text", name: "description", required: false, max: 500 },
      { type: "number", name: "order", required: false },
      { type: "bool", name: "visible", required: false },
      { type: "autodate", name: "created", onCreate: true },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE UNIQUE INDEX `idx_main_sections_slug` ON `main_sections` (`slug`)",
      "CREATE INDEX `idx_main_sections_order` ON `main_sections` (`order`)",
    ],
  });
  app.save(sections);

  // ============================================================
  // 13) main_aboutPillars — 랜딩 About 섹션 Learn/Compete/Build/Share 카드
  // ============================================================
  const aboutPillars = new Collection({
    type: "base",
    name: "main_aboutPillars",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "text", name: "idx", required: true, max: 4 },
      { type: "text", name: "title", required: true, max: 40 },
      { type: "text", name: "body", required: true, max: 500 },
      { type: "number", name: "sortOrder", required: false },
      { type: "autodate", name: "created", onCreate: true },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE INDEX `idx_main_aboutPillars_sortOrder` ON `main_aboutPillars` (`sortOrder`)",
    ],
  });
  app.save(aboutPillars);

  return {
    users: usersCol,
    categories,
    tags,
    posts,
    comments,
    achievements,
    events,
    sponsors,
    siteSettings,
    members,
    heroSettings,
    sections,
    aboutPillars,
  };
}

module.exports = { createCollections };
