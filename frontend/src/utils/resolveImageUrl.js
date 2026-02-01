const ALLOWED_HOSTS = new Set([
	'pixabay.com',
	'cdn.pixabay.com',
	'images.unsplash.com',
	'via.placeholder.com'
]);

const isAllowedHost = (url) => {
	try {
		const parsed = new URL(url);
		const host = parsed.hostname.replace(/^www\./, '');
		return Array.from(ALLOWED_HOSTS).some(h => host === h || host.endsWith(`.${h}`));
	} catch {
		return false;
	}
};

export const resolveImageUrl = (url) => {
	if (!url || typeof url !== 'string') return '';
	if (url.startsWith('data:') || url.startsWith('blob:')) return url;
	if (url.startsWith('/images/') || url.startsWith('/api/images/proxy')) return url;

	if (/^https?:\/\//i.test(url)) {
		if (isAllowedHost(url)) {
			return `/api/images/proxy?url=${encodeURIComponent(url)}`;
		}
		return url;
	}

	return url;
};

export default resolveImageUrl;
