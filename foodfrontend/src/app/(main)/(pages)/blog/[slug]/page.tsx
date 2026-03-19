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
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${BASE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${BASE_URL}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: post.title }],
    },
  };
}

function renderMarkdown(md: string) {
  const lines = md.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (!tableRows.length) return;
    const [headerRow, , ...bodyRows] = tableRows;
    const headers = headerRow.split('|').map((s) => s.trim()).filter(Boolean);
    elements.push(
      <div key={key++} className="overflow-x-auto my-6">
        <table className="w-full text-sm border-collapse border border-[#2E1F14]/15 dark:border-[#3a2c23] rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-[#F4EDE4] dark:bg-[#241b16]">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left font-semibold text-[#2E1F14] dark:text-[#f5e9dc] border border-[#2E1F14]/15 dark:border-[#3a2c23]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, ri) => {
              const cells = row.split('|').map((s) => s.trim()).filter(Boolean);
              return (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-[#1f1812]' : 'bg-[#FDFAF6] dark:bg-[#1a1209]'}>
                  {cells.map((c, ci) => (
                    <td key={ci} className="px-4 py-2.5 text-[#7A5C4F] dark:text-[#c8b6a6] border border-[#2E1F14]/10 dark:border-[#3a2c23]">{c}</td>
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
      tableRows.push(line.split('|').map((s) => s.trim()).filter(Boolean));
      continue;
    }
    if (inTable) flushTable();

    if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mt-8 mb-3">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-2xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mt-10 mb-4">{line.slice(3)}</h2>);
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={key++} className="text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed ml-5 list-disc">
          {line.slice(2).replace(/\*\*(.+?)\*\*/g, '').split(/\*\*(.+?)\*\*/).map((part, i) =>
            i % 2 === 0 ? part : <strong key={i} className="text-[#2E1F14] dark:text-[#f5e9dc]">{part}</strong>
          )}
        </li>
      );
    } else if (/^\d+\./.test(line)) {
      elements.push(
        <li key={key++} className="text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed ml-5 list-decimal">
          {line.replace(/^\d+\.\s*/, '').replace(/\*\*(.+?)\*\*/g, '$1')}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<br key={key++} />);
    } else {
      // Parse inline markdown: **bold** and [text](href)
      const parsed = line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#2E1F14] dark:text-[#f5e9dc] font-semibold">$1</strong>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#8B5E3C] dark:text-amber-400 underline underline-offset-2 hover:opacity-80">$1</a>');
      elements.push(
        <p key={key++} className="text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed"
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
    image: `${BASE_URL}/og-image.jpg`,
    url: `${BASE_URL}/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <main className="min-h-screen bg-[#FDFAF6] dark:bg-[#1a1209]">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#F4EDE4] to-[#FDFAF6] dark:from-[#1f1812] dark:to-[#1a1209] border-b border-[#2E1F14]/10 dark:border-[#3a2c23]">
          <div className="max-w-3xl mx-auto px-6 py-14">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-[#7A5C4F] dark:text-[#c8b6a6] mb-8">
              <Link href="/" className="hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-[#2E1F14] dark:text-[#f5e9dc] truncate max-w-[200px]">{post.title}</span>
            </nav>

            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#C4A882] dark:text-amber-500 mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] leading-tight mb-5">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
              <span>&bull;</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </section>

        {/* Featured image */}
        <div className="max-w-3xl mx-auto px-6 -mt-2">
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-md bg-[#F4EDE4] dark:bg-[#241b16]">
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-6 py-12 space-y-2">
          {renderMarkdown(post.content)}
        </article>

        {/* CTA */}
        <div className="max-w-3xl mx-auto px-6 pb-10">
          <div className="rounded-2xl bg-gradient-to-br from-[#F4EDE4] to-[#E8DFD1] dark:from-[#1f1812] dark:to-[#18120e] border border-[#2E1F14]/10 dark:border-[#3a2c23] p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#C4A882] dark:text-amber-500 mb-2">Shop Now</p>
            <h3 className="text-xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-3">
              Ready to treat your dog?
            </h3>
            <p className="text-[#7A5C4F] dark:text-[#c8b6a6] mb-6 text-sm">
              Browse our full range of natural yak milk chews and Himalayan puff treats.
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#2E1F14] dark:bg-amber-700 hover:bg-[#3D2B1C] dark:hover:bg-amber-600 text-white text-sm font-semibold px-8 py-3 rounded-full transition-colors"
            >
              Shop All Products
            </Link>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="max-w-3xl mx-auto px-6 pb-16">
            <h2 className="text-xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-6">More Articles</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {related.map((rp) => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group block">
                  <div className="rounded-xl overflow-hidden border border-[#2E1F14]/10 dark:border-[#3a2c23] bg-white dark:bg-[#1f1812] hover:shadow-md transition-shadow">
                    <div className="relative h-40 bg-[#F4EDE4] dark:bg-[#241b16]">
                      <Image src={rp.image} alt={rp.imageAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-[#C4A882] dark:text-amber-500 font-semibold mb-1">{rp.category}</p>
                      <h3 className="text-sm font-bold text-[#2E1F14] dark:text-[#f5e9dc] group-hover:text-[#8B5E3C] dark:group-hover:text-amber-400 transition-colors leading-snug">
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
