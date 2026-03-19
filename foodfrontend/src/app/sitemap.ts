import { MetadataRoute } from 'next';
import { blogPosts } from './(main)/(pages)/blog/data';

const BASE_URL = 'https://highlanddogchew.co.uk';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Blog post routes
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                                    lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/products`,                      lastModified: now, changeFrequency: 'daily',   priority: 0.95 },
    { url: `${BASE_URL}/products/yak-chews`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/products/puff-treats`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/products/highland-mix`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/blog`,                          lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    ...blogRoutes,
    { url: `${BASE_URL}/faq`,                           lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE_URL}/about`,                         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`,                       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/shipping-policy`,               lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy-policy`,                lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/testimonials`,                  lastModified: now, changeFrequency: 'weekly',  priority: 0.65 },
    { url: `${BASE_URL}/process`,                       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/future`,                        lastModified: now, changeFrequency: 'monthly', priority: 0.55 },
    { url: `${BASE_URL}/about/terms`,                   lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ];

  // Dynamic product pages
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      const products: any[] = Array.isArray(data.data) ? data.data : [];
      const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
        url: `${BASE_URL}/products/${p.slug}`,
        lastModified: new Date(p.updatedAt || now),
        changeFrequency: 'weekly',
        priority: 0.85,
      }));
      return [...staticRoutes, ...productRoutes];
    }
  } catch {
    // Fallback to static only
  }

  return staticRoutes;
}
