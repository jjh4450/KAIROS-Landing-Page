/// <reference path="../pb_data/types.d.ts" />

/**
 * KAIROS 동아리 게시판 서버 훅
 *
 * 마이그레이션 규칙으로 표현하기 까다로운 비즈니스 로직을 여기서 처리합니다.
 */

// ============================================================
// 1) 신규 가입 사용자에게 기본 role = 'member' 자동 할당
// ============================================================
onRecordCreateRequest((e) => {
  // 슈퍼유저(관리자)가 직접 만든 경우엔 role을 임의 지정할 수 있게 우회
  if (e.hasSuperuserAuth && e.hasSuperuserAuth()) {
    return e.next();
  }

  if (!e.record.get("role")) {
    e.record.set("role", "member");
  }

  e.next();
}, "users");

// ============================================================
// 2) 게시글 작성 시 카테고리별 권한 검사 & 작성자 강제 지정
// ============================================================
onRecordCreateRequest((e) => {
  const auth = e.auth;
  if (!auth) {
    throw new ForbiddenError("로그인이 필요합니다.");
  }

  // 작성자는 항상 현재 로그인 사용자로 강제 설정 (스푸핑 방지)
  e.record.set("author", auth.id);

  const categoryId = e.record.get("category");
  if (!categoryId) {
    throw new BadRequestError("카테고리를 선택해야 합니다.");
  }

  let category;
  try {
    category = $app.findRecordById("categories", categoryId);
  } catch (err) {
    throw new BadRequestError("존재하지 않는 카테고리입니다.");
  }

  const perm = category.get("writePermission");
  const role = auth.get("role") || "";

  // 권한 위계: admin > staff > member > 비로그인
  const rolePower = { admin: 3, staff: 2, member: 1 };
  const permPower = { all: 0, member: 1, staff: 2, admin: 3 };

  const userPower = rolePower[role] ?? 0;
  const requiredPower = permPower[perm] ?? 0;

  if (userPower < requiredPower) {
    throw new ForbiddenError("이 카테고리에 작성 권한이 없습니다.");
  }

  e.next();
}, "posts");

// ============================================================
// 3) 댓글 작성 시 작성자 강제 지정 + 비공개글 권한 재검사
// ============================================================
onRecordCreateRequest((e) => {
  const auth = e.auth;
  if (!auth) {
    throw new ForbiddenError("로그인이 필요합니다.");
  }

  e.record.set("author", auth.id);

  const postId = e.record.get("post");
  if (!postId) {
    throw new BadRequestError("댓글을 달 게시글이 지정되지 않았습니다.");
  }

  let post;
  try {
    post = $app.findRecordById("posts", postId);
  } catch (err) {
    throw new BadRequestError("존재하지 않는 게시글입니다.");
  }

  // 비공개글의 경우 멤버 이상만 댓글 가능 (한 번 더 방어)
  if (post.get("isPrivate") && !auth.get("role")) {
    throw new ForbiddenError("비공개 게시글에는 멤버만 댓글을 달 수 있습니다.");
  }

  e.next();
}, "comments");

// ============================================================
// 4) 게시글 조회 시 viewCount 증가
// ============================================================
onRecordViewRequest((e) => {
  // 응답을 먼저 보내고 백그라운드에서 카운트 업데이트
  e.next();

  try {
    const current = e.record.getInt("viewCount") || 0;
    e.record.set("viewCount", current + 1);
    // saveNoValidate로 권한 규칙을 우회 (관전자도 카운트 올라가야 하므로)
    $app.saveNoValidate(e.record);
  } catch (err) {
    // 카운트 업데이트 실패는 사용자에게 영향 주지 않도록 조용히 처리
    $app.logger().warn("viewCount update failed", "error", err);
  }
}, "posts");

// ============================================================
// 5) members: 본인 옵트인 시 user.id 강제, 운영진은 임의 지정 허용
// ============================================================
onRecordCreateRequest((e) => {
  const auth = e.auth;
  if (!auth) {
    throw new ForbiddenError("로그인이 필요합니다.");
  }

  const role = auth.get("role") || "";
  const isStaff = role === "admin" || role === "staff";

  // 운영진이 아니면 user 필드는 본인으로 강제 (스푸핑 방지)
  if (!isStaff) {
    e.record.set("user", auth.id);
  }

  e.next();
}, "members");
