/// <reference path="../pb_data/types.d.ts" />

/**
 * KAIROS 동아리 게시판 초기 스키마
 *
 * 컬렉션 구성:
 *   - users (기본 auth 컬렉션 확장): role, nickname 추가
 *   - categories: 게시판 카테고리 (공지/자유/스터디/CTF 등)
 *   - tags: 태그 (웹해킹, 리버싱, 초급 ...)
 *   - posts: 게시글
 *   - comments: 댓글 (대댓글 지원)
 *
 * 권한 규칙 요약:
 *   - role: admin > staff > member > (게스트)
 *   - 카테고리별 작성 권한은 categories.writePermission으로 제어 (훅에서 검사)
 *   - 비공개 글(isPrivate=true)은 로그인한 멤버만 열람 가능
 */

migrate(
  (app) => {
    // ============================================================
    // 1) users 컬렉션 확장 (기본 제공 auth 컬렉션에 필드 추가)
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
      new TextField({
        name: "nickname",
        required: false,
        max: 30,
      }),
    );

    app.save(users);

    // ============================================================
    // 2) categories
    // ============================================================
    const categories = new Collection({
      type: "base",
      name: "categories",
      // 누구나 카테고리 목록을 볼 수 있음
      listRule: "",
      viewRule: "",
      // 관리자만 카테고리 CRUD
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
      // 로그인한 사용자는 누구나 태그 생성 가능
      createRule: "@request.auth.id != ''",
      // 태그 수정/삭제는 운영진만
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
      // 공개글은 누구나, 비공개글은 로그인 사용자만
      listRule: "isPrivate = false || @request.auth.id != ''",
      viewRule: "isPrivate = false || @request.auth.id != ''",
      // 작성 권한은 hook에서 카테고리별로 다시 검사
      createRule: "@request.auth.id != ''",
      // 수정/삭제는 작성자 또는 운영진
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
          maxSize: 10485760, // 10MB
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
    // 5) comments (대댓글 지원: parent self-reference)
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

    // 자기 자신을 참조하는 parent 필드는 컬렉션 저장 이후에 추가
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
    // 6) 기본 카테고리 시드 데이터
    // ============================================================
    const defaultCategories = [
      {
        name: "공지사항",
        slug: "notice",
        description: "동아리 공식 공지",
        writePermission: "admin",
        sortOrder: 1,
      },
      {
        name: "회의록",
        slug: "minutes",
        description: "정기 회의 기록",
        writePermission: "staff",
        sortOrder: 2,
      },
      {
        name: "자유게시판",
        slug: "free",
        description: "자유로운 이야기",
        writePermission: "member",
        sortOrder: 10,
      },
      {
        name: "스터디",
        slug: "study",
        description: "스터디 모집 및 진행 상황",
        writePermission: "member",
        sortOrder: 20,
      },
      {
        name: "CTF",
        slug: "ctf",
        description: "CTF 정보 및 Write-up (대회 종료 후 공개 권장)",
        writePermission: "member",
        sortOrder: 21,
      },
      {
        name: "자료실",
        slug: "resources",
        description: "학습 자료, 추천 도구, 논문",
        writePermission: "member",
        sortOrder: 30,
      },
      {
        name: "보안 뉴스",
        slug: "news",
        description: "보안 동향, CVE, 침해 사고",
        writePermission: "member",
        sortOrder: 31,
      },
      {
        name: "Q&A",
        slug: "qa",
        description: "질문과 답변",
        writePermission: "all",
        sortOrder: 40,
      },
      {
        name: "진로/취업",
        slug: "career",
        description: "채용 공고, 자격증, 컨퍼런스",
        writePermission: "member",
        sortOrder: 50,
      },
    ];

    const catCol = app.findCollectionByNameOrId("categories");
    for (const data of defaultCategories) {
      const rec = new Record(catCol);
      rec.set("name", data.name);
      rec.set("slug", data.slug);
      rec.set("description", data.description);
      rec.set("writePermission", data.writePermission);
      rec.set("sortOrder", data.sortOrder);
      app.save(rec);
    }
  },

  // ----------------------------------------------------------------
  // down: 마이그레이션 되돌리기 (역순으로 삭제)
  // ----------------------------------------------------------------
  (app) => {
    const toDelete = ["comments", "posts", "tags", "categories"];
    for (const name of toDelete) {
      try {
        const col = app.findCollectionByNameOrId(name);
        app.delete(col);
      } catch (e) {
        // 이미 삭제됐거나 존재하지 않음 - 무시
      }
    }

    // users에 추가했던 필드 제거
    try {
      const users = app.findCollectionByNameOrId("users");
      users.fields.removeByName("role");
      users.fields.removeByName("nickname");
      app.save(users);
    } catch (e) {
      // 무시
    }
  },
);
