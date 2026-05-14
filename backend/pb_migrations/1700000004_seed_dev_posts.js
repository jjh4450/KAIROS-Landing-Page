/// <reference path="../pb_data/types.d.ts" />

/**
 * Dev-only mock 시드.
 *  - kairos-bot 데모 작성자 1명
 *  - 카테고리별 샘플 게시글 8개
 *
 * 운영 배포 전에 이 마이그레이션은 down 으로 되돌리거나 파일 자체를 제거하세요.
 */

migrate(
  (app) => {
    // ---- demo author ----
    const usersCol = app.findCollectionByNameOrId("users");

    let demo;
    try {
      demo = app.findFirstRecordByFilter("users", "email='demo@kairos.dev'");
    } catch (e) {
      demo = new Record(usersCol);
      demo.set("email", "demo@kairos.dev");
      demo.setPassword("kairos-dev-seed-pass!");
      demo.set("verified", true);
      demo.set("nickname", "kairos-bot");
      demo.set("role", "staff");
      app.save(demo);
    }

    // ---- helper ----
    const catBySlug = (slug) =>
      app.findFirstRecordByFilter("categories", `slug='${slug}'`);

    const postsCol = app.findCollectionByNameOrId("posts");

    function createPost({ title, slug, content, daysAgo, isPinned = false, viewCount = 0 }) {
      // 같은 제목이 이미 시드되어 있으면 스킵 (멱등성)
      try {
        const existing = app.findFirstRecordByFilter("posts", `title='${title.replace(/'/g, "''")}'`);
        if (existing) return existing;
      } catch (e) {
        // not found — proceed
      }

      const r = new Record(postsCol);
      r.set("title", title);
      r.set("content", content);
      r.set("author", demo.id);
      r.set("category", catBySlug(slug).id);
      r.set("isPinned", isPinned);
      r.set("isPrivate", false);
      r.set("viewCount", viewCount);
      app.save(r);

      // created 필드를 과거로 조정해서 정렬용 시간차 부여
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

    const samples = [
      {
        slug: "notice",
        title: "[공지] KAIROS 1기 정기 모집 안내",
        daysAgo: 1,
        isPinned: true,
        viewCount: 142,
        content: `<p>보안 동아리 KAIROS의 1기 정기 모집을 시작합니다.</p>
<h3>지원 자격</h3>
<ul><li>추후 공지</li><li>보안에 대한 호기심과 꾸준히 학습할 의지</li></ul>
<h3>지원 일정</h3>
<p>지원서 제출 후 면접을 거쳐 최종 합격자를 선발합니다. 자세한 일정은 곧 공지될 예정입니다.</p>`,
      },
      {
        slug: "ctf",
        title: "Dreamhack BoB 2025 — Web / Crypto Write-up",
        daysAgo: 3,
        viewCount: 87,
        content: `<p>이번 BoB 예선 대회의 웹·암호 분야 풀이를 정리했습니다.</p>
<h3>Web — admin-only</h3>
<p>인증 우회 + 2nd-order SQL injection 의 조합. 세션 토큰의 padding oracle 을 이용해 admin 권한 획득.</p>
<h3>Crypto — small-e RSA</h3>
<p>e=3 이고 평문이 작아 m^3 &lt; n. 단순히 세제곱근을 취해 평문 복구.</p>`,
      },
      {
        slug: "study",
        title: "웹해킹 스터디 #4 — SQLi 심화 (UNION / Blind / Time-based)",
        daysAgo: 5,
        viewCount: 56,
        content: `<p>이번 주 스터디는 SQL injection 의 세 가지 변형을 다뤘습니다.</p>
<p>실습 환경은 DVWA Hard 와 PortSwigger Lab을 활용했고, sqlmap 의 내부 동작도 함께 살펴봤습니다.</p>`,
      },
      {
        slug: "resources",
        title: "[자료실] The Web Application Hacker's Handbook 추천 사유",
        daysAgo: 8,
        viewCount: 34,
        content: `<p>웹 보안 입문자가 가장 먼저 잡으면 좋은 책. 다음 학기 스터디 교재로도 채택될 예정.</p>
<p>오래된 책이지만 OWASP Top 10 의 본질을 가장 잘 설명한다.</p>`,
      },
      {
        slug: "news",
        title: "OpenSSH regreSSHion (CVE-2024-6387) 요약과 영향",
        daysAgo: 11,
        viewCount: 73,
        content: `<p>2024년 7월 공개된 OpenSSH server 의 사전인증 RCE 취약점. signal handler race condition 으로 sshd 권한에서 코드 실행.</p>
<p>OpenSSH 8.5p1 ~ 9.7p1 영향. 패치 또는 LoginGraceTime=0 으로 임시 차단.</p>`,
      },
      {
        slug: "career",
        title: "BoB 14기 모집 — 일정 / 지원서 팁",
        daysAgo: 14,
        viewCount: 48,
        content: `<p>한국정보기술연구원 BoB 14기 일정과 KAIROS 선배들의 합격 후기 모음.</p>
<p>지원서는 \"왜 보안인가\" 에 대한 자기 스토리가 명확할수록 좋다.</p>`,
      },
      {
        slug: "free",
        title: "신입 환영 모임 후기",
        daysAgo: 18,
        viewCount: 29,
        content: `<p>1기 신입 환영 모임 후기. 운영진 + 신입생 30명 참석.</p>
<p>다음 모임은 다음 주 금요일 동방에서 LT 형식으로 진행됩니다.</p>`,
      },
      {
        slug: "minutes",
        title: "[회의록] 25-1 운영진 1차 정기 회의",
        daysAgo: 22,
        viewCount: 18,
        content: `<p>안건: 학기 일정, 외부 대회 참여, 동방 운영 규칙.</p>
<p>참석: 회장, 부회장, 학술부장, 홍보부장. 결정사항은 노션에 정리됨.</p>`,
      },
    ];

    for (const s of samples) {
      createPost(s);
    }
  },

  (app) => {
    // down: 시드 데이터 제거
    try {
      const titles = [
        "[공지] KAIROS 1기 정기 모집 안내",
        "Dreamhack BoB 2025 — Web / Crypto Write-up",
        "웹해킹 스터디 #4 — SQLi 심화 (UNION / Blind / Time-based)",
        "[자료실] The Web Application Hacker's Handbook 추천 사유",
        "OpenSSH regreSSHion (CVE-2024-6387) 요약과 영향",
        "BoB 14기 모집 — 일정 / 지원서 팁",
        "신입 환영 모임 후기",
        "[회의록] 25-1 운영진 1차 정기 회의",
      ];
      for (const t of titles) {
        try {
          const rec = app.findFirstRecordByFilter(
            "posts",
            `title='${t.replace(/'/g, "''")}'`,
          );
          app.delete(rec);
        } catch (e) {
          // ignore
        }
      }
      const demo = app.findFirstRecordByFilter("users", "email='demo@kairos.dev'");
      app.delete(demo);
    } catch (e) {
      // ignore
    }
  },
);
