import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/dashboard',
          '/login',
          '/forgot-password',
          '/reset-password/',
          '/api/',
          '/cart',
          '/checkout',
          '/checkout/success',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/dashboard/', '/login', '/checkout/'],
      },
    ],
    sitemap: 'https://highlanddogchew.co.uk/sitemap.xml',
    host: 'https://highlanddogchew.co.uk',
  };
}
