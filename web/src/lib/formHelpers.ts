export function formStr(form: FormData, name: string): string {
	return String(form.get(name) ?? '').trim();
}

export function formBool(form: FormData, name: string): boolean {
	return form.get(name) === 'on';
}

export function formFile(form: FormData, name: string): File | null {
	const v = form.get(name);
	return v instanceof File && v.size > 0 ? v : null;
}
