/// <reference path="../../pb_data/types.d.ts" />

/**
 * 운영 시드 — 9개 기본 카테고리, siteSettings/heroSettings 싱글톤, sections/
 * aboutPillars 리스트. 모두 신선 인스턴스에서 첫 화면이 비지 않게 하는 데
 * 필요한 production 데이터.
 */

const DEFAULT_CATEGORIES = [
  { name: "공지사항", slug: "notice", description: "공식 공지", writePermission: "admin", sortOrder: 1 },
  { name: "회의록", slug: "minutes", description: "정기 회의 기록", writePermission: "staff", sortOrder: 2 },
  { name: "자유게시판", slug: "free", description: "자유로운 이야기", writePermission: "member", sortOrder: 10 },
  { name: "스터디", slug: "study", description: "스터디 모집 및 진행 상황", writePermission: "member", sortOrder: 20 },
  { name: "CTF", slug: "ctf", description: "CTF 정보 및 Write-up (대회 종료 후 공개 권장)", writePermission: "member", sortOrder: 21 },
  { name: "자료실", slug: "resources", description: "학습 자료, 추천 도구, 논문", writePermission: "member", sortOrder: 30 },
  { name: "보안 뉴스", slug: "news", description: "보안 동향, CVE, 침해 사고", writePermission: "member", sortOrder: 31 },
  { name: "Q&A", slug: "qa", description: "질문과 답변", writePermission: "all", sortOrder: 40 },
  { name: "진로/취업", slug: "career", description: "채용 공고, 자격증, 컨퍼런스", writePermission: "member", sortOrder: 50 },
];

const SECTIONS = [
  {
    slug: "about",
    eyebrow: "// about",
    title: "보안 커뮤니티 KAIROS.",
    description:
      "KAIROS는 보안을 공부하는 사람들이 만든 커뮤니티입니다. 정기 스터디를 함께 진행하고, 배운 내용과 활동 결과를 기록으로 남깁니다.",
    order: 10,
  },
  {
    slug: "posts",
    eyebrow: "// posts",
    title: "최근 글.",
    description: "공지, 풀이(write-up), 자료, 뉴스가 올라옵니다.",
    order: 20,
  },
  {
    slug: "activities",
    eyebrow: "// activities",
    title: "이번 학기 활동.",
    description: "정기 스터디, CTF, 세미나, 외부 행사 일정입니다.",
    order: 30,
  },
  {
    slug: "achievements",
    eyebrow: "// wall of fame",
    title: "학기별 활동 기록.",
    description: "대회 입상, CVE 발견, 외부 발표 기록입니다.",
    order: 40,
  },
  {
    slug: "members",
    eyebrow: "// roster",
    title: "공개 명단.",
    description: "공개에 동의한 운영진과 멤버입니다.",
    order: 50,
  },
  {
    slug: "sponsors",
    eyebrow: "// supported by",
    title: "후원사 & 파트너",
    description: "",
    order: 60,
  },
];

const ABOUT_PILLARS = [
  {
    idx: "01",
    title: "Learn",
    body: "웹, 포너블, 리버싱, 암호 분야로 나뉜 정기 스터디를 운영합니다. 처음 시작하는 사람도 따라올 수 있도록 단계별 자료와 멘토링을 제공합니다.",
    sortOrder: 10,
  },
  {
    idx: "02",
    title: "Compete",
    body: "국내외 CTF에 함께 참여합니다. 풀이(write-up)는 함께 기록으로 남겨 이어서 활용합니다.",
    sortOrder: 20,
  },
  {
    idx: "03",
    title: "Build",
    body: "학습 과정에서 만든 도구와 연구 결과는 오픈소스로 공개합니다.",
    sortOrder: 30,
  },
  {
    idx: "04",
    title: "Share",
    body: "세미나·컨퍼런스에 참여하고, 가능한 자리에서는 외부 발표도 합니다.",
    sortOrder: 40,
  },
];

function seedProduction(app, cols) {
  // ============================================================
  // 9개 기본 카테고리
  // ============================================================
  for (const data of DEFAULT_CATEGORIES) {
    const rec = new Record(cols.categories);
    rec.set("name", data.name);
    rec.set("slug", data.slug);
    rec.set("description", data.description);
    rec.set("writePermission", data.writePermission);
    rec.set("sortOrder", data.sortOrder);
    app.save(rec);
  }

  // ============================================================
  // siteSettings 싱글톤
  // ============================================================
  const settingsRec = new Record(cols.siteSettings);
  settingsRec.set("key", "main");
  settingsRec.set(
    "siteTitle",
    "KAIROS · Kangwon Academic Initiative for Research On Security",
  );
  settingsRec.set(
    "siteDescription",
    "보안 커뮤니티 KAIROS. 함께 공부하고 활동을 기록으로 남깁니다.",
  );
  settingsRec.set("recruitmentOpen", false);
  settingsRec.set("footerCopy", "© KAIROS");
  app.save(settingsRec);

  // ============================================================
  // heroSettings 싱글톤
  // ============================================================
  const heroRec = new Record(cols.heroSettings);
  heroRec.set("key", "main");
  heroRec.set("eyebrow", "// est. 2026");
  heroRec.set("title", "KAIROS");
  heroRec.set("tagline", "Kangwon Academic Initiative for Research On Security");
  heroRec.set(
    "subtitle",
    "강원권 학생들이 모여 만들어 나가는 보안 커뮤니티입니다.",
  );
  heroRec.set("primaryCtaLabel", "더 알아보기");
  heroRec.set("secondaryCtaLabel", "지원하기");
  app.save(heroRec);

  // ============================================================
  // sections (6 row)
  // ============================================================
  for (const s of SECTIONS) {
    const r = new Record(cols.sections);
    r.set("slug", s.slug);
    r.set("eyebrow", s.eyebrow);
    r.set("title", s.title);
    r.set("description", s.description);
    r.set("order", s.order);
    r.set("visible", true);
    app.save(r);
  }

  // ============================================================
  // aboutPillars (4 row)
  // ============================================================
  for (const p of ABOUT_PILLARS) {
    const r = new Record(cols.aboutPillars);
    r.set("idx", p.idx);
    r.set("title", p.title);
    r.set("body", p.body);
    r.set("sortOrder", p.sortOrder);
    app.save(r);
  }
}

module.exports = { seedProduction };
