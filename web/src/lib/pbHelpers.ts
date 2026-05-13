import { PUBLIC_PB_URL } from '$env/static/public';

type FileRecord = { id: string; collectionId?: string; collectionName?: string };

export function fileUrl(record: FileRecord, filename: string, thumb?: string): string {
	const collection = record.collectionId ?? record.collectionName;
	if (!collection || !filename) return '';
	const qs = thumb ? `?thumb=${encodeURIComponent(thumb)}` : '';
	return `${PUBLIC_PB_URL}/api/files/${collection}/${record.id}/${filename}${qs}`;
}

export function fileUrls(record: FileRecord, filenames: string[] | undefined): { name: string; url: string }[] {
	if (!filenames?.length) return [];
	return filenames.map((name) => ({ name, url: fileUrl(record, name) }));
}
