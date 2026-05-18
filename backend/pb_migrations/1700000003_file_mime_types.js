/// <reference path="../pb_data/types.d.ts" />

/**
 * file 필드에 mimeTypes 화이트리스트 적용.
 *
 * PB 는 mimeTypes 미지정 시 모든 MIME 허용 → `.html` / 임의 `<script>` 박힌 SVG
 * 업로드 시 `${PB_URL}/api/files/...` 가 inline 서빙되어 PB origin XSS 가능.
 * raster 4종 + SVG 허용. SVG 는 SvelteKit 업로드 경로에서 DOMPurify(SVG profile)
 * 로 sanitize 한 뒤 PB 로 넘김.
 */

const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const TARGETS = [
  { collection: "posts", field: "attachments" },
  { collection: "achievements", field: "coverImage" },
  { collection: "events", field: "coverImage" },
  { collection: "sponsors", field: "logo" },
  { collection: "members", field: "avatar" },
];

function setMime(app, collection, fieldName, mimeTypes) {
  const col = app.findCollectionByNameOrId(collection);
  const field = col.fields.getByName(fieldName);
  if (!field) {
    throw new Error(`field not found: ${collection}.${fieldName}`);
  }
  field.mimeTypes = mimeTypes;
  app.save(col);
}

migrate(
  (app) => {
    for (const t of TARGETS) {
      setMime(app, t.collection, t.field, IMAGE_MIME_TYPES);
    }
  },

  (app) => {
    for (const t of TARGETS) {
      setMime(app, t.collection, t.field, []);
    }
  },
);
