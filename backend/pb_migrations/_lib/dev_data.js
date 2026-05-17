/// <reference path="../../pb_data/types.d.ts" />

/**
 * dev/local 환경용 모의 데이터 — 데모 staff 유저 1명 + 샘플 게시물 8건.
 * 운영 배포 전 별도 마이그레이션으로 정리 검토.
 */

const SAMPLES = [
  {
    slug: "notice",
    title: "[샘플 공지] 더미 공지 1",
    daysAgo: 1,
    isPinned: true,
    viewCount: 142,
    content: `<p>샘플 공지 본문입니다. 실제 운영 공지로 대체하세요.</p>`,
  },
  {
    slug: "ctf",
    title: "샘플 라이트업 — Web 카테고리",
    daysAgo: 3,
    viewCount: 87,
    content: `<p>샘플 CTF 라이트업 본문 placeholder.</p>`,
  },
  {
    slug: "study",
    title: "샘플 스터디 노트 — 주제 A",
    daysAgo: 5,
    viewCount: 56,
    content: `<p>샘플 스터디 진행 메모 placeholder.</p>`,
  },
  {
    slug: "resources",
    title: "[자료실] 샘플 추천 자료 1",
    daysAgo: 8,
    viewCount: 34,
    content: `<p>샘플 자료 소개 placeholder.</p>`,
  },
  {
    slug: "news",
    title: "샘플 보안 뉴스 — CVE 요약",
    daysAgo: 11,
    viewCount: 73,
    content: `<p>샘플 보안 뉴스 본문 placeholder.</p>`,
  },
  {
    slug: "career",
    title: "샘플 진로 글 1",
    daysAgo: 14,
    viewCount: 48,
    content: `<p>샘플 진로/취업 글 placeholder.</p>`,
  },
  {
    slug: "free",
    title: "샘플 자유 게시물 1",
    daysAgo: 18,
    viewCount: 29,
    content: `<p>샘플 자유게시판 글 placeholder.</p>`,
  },
  {
    slug: "minutes",
    title: "샘플 회의록 1",
    daysAgo: 22,
    viewCount: 18,
    content: `<p>샘플 회의록 placeholder.</p>`,
  },
];

function seedDevData(app, cols) {
  let demo;
  try {
    demo = app.findFirstRecordByFilter("users", "email='demo@kairos.dev'");
  } catch (e) {
    demo = new Record(cols.users);
    demo.set("email", "demo@kairos.dev");
    demo.setPassword("kairos-dev-seed-pass!");
    demo.set("verified", true);
    demo.set("nickname", "kairos-bot");
    demo.set("role", "staff");
    app.save(demo);
  }

  const catBySlug = (slug) =>
    app.findFirstRecordByFilter("categories", `slug='${slug}'`);

  function createPost({ title, slug, content, daysAgo, isPinned = false, viewCount = 0 }) {
    try {
      const existing = app.findFirstRecordByFilter(
        "posts",
        `title='${title.replace(/'/g, "''")}'`,
      );
      if (existing) return existing;
    } catch (e) {
      // not found — proceed
    }

    const r = new Record(cols.posts);
    r.set("title", title);
    r.set("content", content);
    r.set("author", demo.id);
    r.set("category", catBySlug(slug).id);
    r.set("isPinned", isPinned);
    r.set("isPrivate", false);
    r.set("viewCount", viewCount);
    app.save(r);

    if (daysAgo) {
      const past = new Date(Date.now() - daysAgo * 86400000)
        .toISOString()
        .replace("T", " ");
      r.set("created", past);
      r.set("updated", past);
      app.saveNoValidate(r);
    }
    return r;
  }

  for (const s of SAMPLES) {
    createPost(s);
  }
}

module.exports = { seedDevData };
