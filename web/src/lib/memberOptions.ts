export const POSITIONS = [
	'president',
	'vice-president',
	'officer',
	'member',
	'alumni',
	'advisor'
] as const;

export const TRACKS = [
	'web',
	'pwn',
	'reverse',
	'crypto',
	'forensics',
	'network',
	'ai-security',
	'blockchain',
	'malware',
	'cloud',
	'other'
] as const;

export type Position = (typeof POSITIONS)[number];
export type Track = (typeof TRACKS)[number];

export function isPosition(v: string): v is Position {
	return (POSITIONS as readonly string[]).includes(v);
}

export function isTrack(v: string): v is Track {
	return (TRACKS as readonly string[]).includes(v);
}
