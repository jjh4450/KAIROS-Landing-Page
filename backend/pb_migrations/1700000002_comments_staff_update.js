/// <reference path="../pb_data/types.d.ts" />

/**
 * comments.updateRule 확장: 본인 외에 admin/staff 도 수정 가능.
 * (posts 는 이미 admin/staff 가 수정 가능하도록 init 단계에서 설정됨)
 */
migrate(
  (app) => {
    const comments = app.findCollectionByNameOrId("comments");
    comments.updateRule =
      "@request.auth.id = author.id || @request.auth.role = 'admin' || @request.auth.role = 'staff'";
    app.save(comments);
  },

  (app) => {
    const comments = app.findCollectionByNameOrId("comments");
    comments.updateRule = "@request.auth.id = author.id";
    app.save(comments);
  },
);
