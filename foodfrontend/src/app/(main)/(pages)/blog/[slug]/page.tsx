import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { blogPosts } from '../data';

const BASE_URL = 'https://highlanddogchew.co.uk';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} | Highland Yakchew Blog`,
    description: post.excerpt,
    alternates: { canonical: `${BASE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${BASE_URL}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      images: [{ url: post.image, width: 1200, height: 630, alt: post.title }],
    },
  };
}

const categoryColors: Record<string, string> = {
  'Dog Health':    'bg-[#e8f5e9] text-[#2e7d32] dark:bg-emerald-900/40 dark:text-emerald-300',
  'Our Story':     'bg-[#fff3e0] text-[#e65100] dark:bg-amber-900/40  dark:text-amber-300',
  'Buying Guide':  'bg-[#e3f2fd] text-[#1565c0] dark:bg-sky-900/40    dark:text-sky-300',
  'Product Guide': 'bg-[#f3e5f5] text-[#7b1fa2] dark:bg-purple-900/40 dark:text-purple-300',
};

function renderMarkdown(md: string) {
  const lines = md.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;
  let inTable = false;
  let tableRows: string[] = [];

  const flushTable = () => {
    if (!tableRows.length) return;
    const [headerRow, , ...bodyRows] = tableRows;
    const headers = headerRow.split('|').map((s) => s.trim()).filter(Boolean);
    elements.push(
      <div key={key++} className="overflow-x-auto my-8 rounded-xl border" style={{ borderColor: 'var(--border-base)' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: 'var(--surface-secondary)' }}>
              {headers.map((h, i) => (
                <th key={i} className="px-5 py-3 text-left font-semibold border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-base)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, ri) => {
              const cells = row.split('|').map((s) => s.trim()).filter(Boolean);
              return (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'var(--surface-card)' : 'var(--surface-page)' }}>
                  {cells.map((c, ci) => (
                    <td key={ci} className="px-5 py-3 border-b" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-base)' }}>{c}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  for (const line of lines) {
    if (line.startsWith('|')) {
      inTable = true;
      tableRows.push(line);
      continue;
    }
    if (inTable) flushTable();

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-xl font-bold mt-10 mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-antique-serif), DM Serif Display, serif' }}>
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-2xl md:text-3xl font-bold mt-12 mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-antique-serif), DM Serif Display, serif' }}>
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('- ')) {
      const text = line.slice(2);
      const parts = text.split(/\*\*(.+?)\*\*/);
      elements.push(
        <li key={key++} className="leading-relaxed ml-5 list-disc marker:text-[#B8976A]" style={{ color: 'var(--text-secondary)' }}>
          {parts.map((part, i) =>
            i % 2 === 0 ? part : <strong key={i} style={{ color: 'var(--text-primary)' }}>{part}</strong>
          )}
        </li>
      );
    } else if (/^\d+\./.test(line)) {
      const text = line.replace(/^\d+\.\s*/, '');
      const parts = text.split(/\*\*(.+?)\*\*/);
      elements.push(
        <li key={key++} className="leading-relaxed ml-5 list-decimal marker:text-[#B8976A] marker:font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {parts.map((part, i) =>
            i % 2 === 0 ? part : <strong key={i} style={{ color: 'var(--text-primary)' }}>{part}</strong>
          )}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      const parsed = line
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color: var(--text-primary); font-weight: 600;">$1</strong>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #9A7B52; text-decoration: underline; text-underline-offset: 3px;">$1</a>');
      elements.push(
        <p key={key++} className="leading-[1.8] text-[15px] md:text-base" style={{ color: 'var(--text-secondary)' }}
          dangerouslySetInnerHTML={{ __html: parsed }} />
      );
    }
  }
  if (inTable) flushTable();
  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'Highland Yakchew', url: BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Highland Yakchew',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/images/logos.png` },
    },
    image: `${BASE_URL}${post.image}`,
    url: `${BASE_URL}/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <main className="min-h-screen" style={{ background: 'var(--surface-page)' }}>
        {/* Hero header */}
        <section
          className="border-b"
          style={{
            background: 'linear-gradient(180deg, var(--surface-secondary) 0%, var(--surface-page) 100%)',
            borderColor: 'var(--border-base)',
          }}
        >
          <div className="max-w-3xl mx-auto px-6 py-14 md:py-16">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
              <Link href="/" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Home</Link>
              <svg className="w-3 h-3" style={{ color: 'var(--color-gold-light)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/blog" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Blog</Link>
              <svg className="w-3 h-3" style={{ color: 'var(--color-gold-light)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{post.title}</span>
            </nav>

            <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full mb-5 ${categoryColors[post.category] ?? 'bg-gray-100 text-gray-700'}`}>
              {post.category}
            </span>

            <h1
              className="text-3xl md:text-4xl lg:text-[2.6rem] font-bold leading-tight mb-6"
              style={{
                fontFamily: 'var(--font-antique-serif), DM Serif Display, serif',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              {/* Author */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--color-gold-light)', color: 'var(--color-dark-brown)' }}>
                  HY
                </div>
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{post.author || 'Highland Yakchew'}</span>
              </div>
              <span className="w-1 h-1 rounded-full" style={{ background: 'var(--color-gold)' }} />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
              <span className="w-1 h-1 rounded-full" style={{ background: 'var(--color-gold)' }} />
              <span>{post.readTime}</span>
            </div>
          </div>
        </section>

        {/* Featured image */}
        <div className="max-w-3xl mx-auto px-6 -mt-2">
          <div
            className="relative h-72 md:h-[420px] rounded-2xl overflow-hidden group"
            style={{ boxShadow: '0 8px 32px rgba(46, 31, 20, 0.12)', background: 'var(--surface-image-bg)' }}
          >
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              priority
            />
            {/* Subtle warm vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 50%, rgba(46, 31, 20, 0.12) 100%)',
              }}
            />
          </div>
          {/* Image caption */}
          <p className="text-center text-xs mt-3 italic" style={{ color: 'var(--text-muted)' }}>
            {post.imageAlt}
          </p>
        </div>

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-6 py-12 md:py-14 space-y-1.5">
          {renderMarkdown(post.content)}
        </article>

        {/* CTA */}
        <div className="max-w-3xl mx-auto px-6 pb-12">
          <div
            className="rounded-2xl p-8 md:p-10 text-center border relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--surface-secondary) 0%, var(--surface-card) 100%)',
              borderColor: 'var(--border-base)',
            }}
          >
            {/* Paw pattern bg */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232E1F14'%3E%3Cellipse cx='15' cy='15' rx='3' ry='4'/%3E%3Cellipse cx='25' cy='15' rx='3' ry='4'/%3E%3Cellipse cx='12' cy='22' rx='2.5' ry='3'/%3E%3Cellipse cx='28' cy='22' rx='2.5' ry='3'/%3E%3Cpath d='M20 30c-5 0-8-4-8-6.5S15 18 20 18s8 3 8 5.5-3 6.5-8 6.5z'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '80px 80px',
              }}
            />
            <p className="text-xs font-medium uppercase tracking-[0.2em] mb-2 relative" style={{ color: 'var(--color-gold)' }}>
              Shop Now
            </p>
            <h3
              className="text-xl md:text-2xl font-bold mb-3 relative"
              style={{
                fontFamily: 'var(--font-antique-serif), DM Serif Display, serif',
                color: 'var(--text-primary)',
              }}
            >
              Ready to treat your dog?
            </h3>
            <p className="text-sm mb-6 max-w-md mx-auto relative" style={{ color: 'var(--text-secondary)' }}>
              Browse our full range of natural yak milk chews, Himalayan puff treats, and Highland mix chews — all grain-free, all natural.
            </p>
            <Link
              href="/products"
              className="relative inline-flex items-center gap-2 text-sm font-semibold px-8 py-3.5 rounded-full transition-all duration-300 hover:shadow-lg"
              style={{
                background: 'var(--color-dark-brown)',
                color: 'var(--color-parchment)',
                letterSpacing: '0.03em',
              }}
            >
              Shop All Products
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="max-w-3xl mx-auto px-6 pb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px" style={{ background: 'var(--border-base)' }} />
              <h2
                className="text-sm font-medium tracking-[0.2em] uppercase"
                style={{ color: 'var(--color-gold)' }}
              >
                More Articles
              </h2>
              <div className="flex-1 h-px" style={{ background: 'var(--border-base)' }} />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {related.map((rp) => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group block">
                  <div
                    className="rounded-xl overflow-hidden border bg-white dark:bg-[#1f1812] hover:shadow-lg transition-all duration-400"
                    style={{ borderColor: 'var(--border-base)' }}
                  >
                    <div className="relative h-44 overflow-hidden" style={{ background: 'var(--surface-image-bg)' }}>
                      <Image
                        src={rp.image}
                        alt={rp.imageAlt}
                        fill
                        sizes="(max-width: 640px) 100vw, 384px"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="p-5">
                      <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full mb-2 ${categoryColors[rp.category] ?? 'bg-gray-100 text-gray-700'}`}>
                        {rp.category}
                      </span>
                      <h3
                        className="text-sm font-bold leading-snug transition-colors duration-300 group-hover:text-[#8B5E3C]"
                        style={{
                          fontFamily: 'var(--font-antique-serif), DM Serif Display, serif',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {rp.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
