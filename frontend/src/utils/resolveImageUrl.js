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

	const explicitBase = (process.env.REACT_APP_API_BASE_URL || '').trim();
	const apiBase = explicitBase
		? explicitBase.replace(/\/$/, '')
		: 'https://smartcart-clothes-gifts-backend.onrender.com/api';
	const apiHost = apiBase.replace(/\/api\/?$/, '');

	if (url.startsWith('/images/')) return `${apiHost}${url}`;
	if (url.startsWith('/api/images/proxy')) return `${apiHost}${url}`;

	if (/^https?:\/\//i.test(url)) {
		if (isAllowedHost(url)) {
			return `${apiBase}/images/proxy?url=${encodeURIComponent(url)}`;
		}
		return url;
	}

	return url;
};

export default resolveImageUrl;
