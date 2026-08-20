import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://smartcart-clothes-gifts-frontend.onrender.com';

const pageMeta = {
  home: {
    title: 'SmartCart Clothes & Footwear | Online Fashion Shopping',
    description: 'Shop clothes and footwear online at SmartCart. Discover fashion, shoes, and gifts with personalized recommendations.',
    path: '/'
  },
  clothes: {
    title: 'Clothes Online | SmartCart Clothes & Footwear',
    description: 'Browse clothes online at SmartCart, including fashion apparel and everyday styles.',
    path: '/clothes'
  },
  footwear: {
    title: 'Footwear Online | SmartCart Clothes & Footwear',
    description: 'Browse footwear online at SmartCart, including sneakers, sandals, loafers, heels, and more.',
    path: '/footwear'
  },
  wishlist: {
    title: 'Wishlist | SmartCart Clothes & Footwear',
    description: 'View your saved SmartCart fashion products.',
    path: '/wishlist',
    noindex: true
  },
  'my-orders': {
    title: 'My Orders | SmartCart',
    description: 'View your SmartCart orders.',
    path: '/my-orders',
    noindex: true
  },
  'verify-email': {
    title: 'Verify Email | SmartCart',
    description: 'Verify your SmartCart account email.',
    path: '/verify-email',
    noindex: true
  },
  product: {
    title: 'Product | SmartCart Clothes & Footwear',
    description: 'View a SmartCart product.',
    path: '/product'
  }
};

export default function SEO({ page = 'home' }) {
  const meta = pageMeta[page] || pageMeta.home;
  const canonical = `${SITE_URL}${meta.path}`;
  const robots = meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SmartCart Clothes & Footwear',
    alternateName: ['SmartCart', 'SmartCart Clothes', 'SmartCart Footwear'],
    url: SITE_URL,
    description: 'Online shopping for clothes and footwear with personalized recommendations.'
  };

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="SmartCart" />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}
