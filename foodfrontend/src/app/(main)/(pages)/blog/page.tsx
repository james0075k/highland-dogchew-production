import Link from 'next/link';
import Image from 'next/image';
import { blogPosts } from './data';

const categoryColors: Record<string, string> = {
  'Dog Health':    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Our Story':     'bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300',
  'Buying Guide':  'bg-sky-100    text-sky-800    dark:bg-sky-900/40    dark:text-sky-300',
  'Product Guide': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <main className="min-h-screen bg-[#FDFAF6] dark:bg-[#1a1209]">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#F4EDE4] to-[#FDFAF6] dark:from-[#1f1812] dark:to-[#1a1209] border-b border-[#2E1F14]/10 dark:border-[#3a2c23]">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#C4A882] dark:text-amber-500 mb-4">
            Highland Yakchew
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-4 leading-tight">
            Dog Chew Guides &amp; Tips
          </h1>
          <p className="text-lg text-[#7A5C4F] dark:text-[#c8b6a6] max-w-2xl mx-auto">
            Expert articles on yak milk chews, dog nutrition, and everything you need to give your
            dog the best natural treats.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Featured post */}
        <div className="mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C4A882] dark:text-amber-500 mb-4">
            Latest Article
          </p>
          <Link href={`/blog/${featured.slug}`} className="group block">
            <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-[#2E1F14]/10 dark:border-[#3a2c23] shadow-md hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-[#1f1812]">
              <div className="relative h-64 md:h-auto min-h-[260px] bg-[#F4EDE4] dark:bg-[#241b16]">
                <Image
                  src={featured.image}
                  alt={featured.imageAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span
                  className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[featured.category] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {featured.category}
                </span>
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-xs text-[#7A5C4F] dark:text-[#c8b6a6] mb-4">
                  <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                  <span>&bull;</span>
                  <span>{featured.readTime}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-4 leading-snug group-hover:text-[#8B5E3C] dark:group-hover:text-amber-400 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed mb-6">
                  {featured.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B5E3C] dark:text-amber-400 group-hover:gap-3 transition-all">
                  Read Article
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Grid of remaining posts */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <article className="rounded-2xl overflow-hidden border border-[#2E1F14]/10 dark:border-[#3a2c23] bg-white dark:bg-[#1f1812] hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <div className="relative h-52 bg-[#F4EDE4] dark:bg-[#241b16]">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span
                    className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[post.category] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {post.category}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-[#7A5C4F] dark:text-[#c8b6a6] mb-3">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span>&bull;</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-3 leading-snug group-hover:text-[#8B5E3C] dark:group-hover:text-amber-400 transition-colors flex-1">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B5E3C] dark:text-amber-400 group-hover:gap-3 transition-all mt-auto">
                    Read More
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
