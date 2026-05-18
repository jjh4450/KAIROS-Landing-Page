/// <reference path="../pb_data/types.d.ts" />

/**
 * comments.updateRule 을 본인 한정으로 되돌림.
 *
 * 정책 변경:
 *   - 편집(update): 본인만. admin/staff 는 남의 댓글 편집 불가.
 *   - 삭제(delete): 본인 + admin (init 그대로). 모더레이션은 삭제로만.
 *
 * 1700000002 가 잠시 admin/staff 에게도 편집 권한을 줬었으나, 댓글 내용 변조
 * 우려가 더 큰 것으로 판단해 원복.
 */
migrate(
	(app) => {
		const comments = app.findCollectionByNameOrId('comments');
		comments.updateRule = "@request.auth.id = author.id";
		app.save(comments);
	},

	(app) => {
		const comments = app.findCollectionByNameOrId('comments');
		comments.updateRule =
			"@request.auth.id = author.id || @request.auth.role = 'admin' || @request.auth.role = 'staff'";
		app.save(comments);
	}
);
