import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Tag, ArrowRight } from "lucide-react";
import { api } from "@/services/api";

export const metadata: Metadata = {
  title: "Insights & Market Reports | BricksNBeyond",
  description: "Stay informed with the latest real estate market insights, investment guides, and property trends from BricksNBeyond's expert advisory team."
};

export const dynamic = "force-dynamic";

async function getPosts() {
  try {
    const res = await api.get("/blog");
    return res.data || [];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export default async function BlogListPage() {
  const posts = await getPosts();

  return (
    <main>
      {/* Hero */}
      <section className="section-shell pt-16 pb-12 border-b border-black/5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Market insights</p>
        <h1 className="mt-2 font-[var(--font-display)] text-5xl">Insights &amp; Reports</h1>
        <p className="mt-4 max-w-xl text-lg text-[#68625a] leading-7">
          Expert commentary on India&apos;s luxury real estate market — trends, investment hotspots, and buying guides curated by our advisory team.
        </p>
      </section>

      {/* Posts */}
      <section className="section-shell py-14 pb-24">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-[#b89658]/10 flex items-center justify-center text-3xl">📰</div>
            <p className="font-semibold text-lg">No articles published yet</p>
            <p className="text-sm text-[#68625a]">Check back soon for market insights and property guides.</p>
          </div>
        ) : (
          <>
            {/* Featured first post */}
            {posts[0] && (
              <Link href={`/blog/${posts[0].slug}`} className="group mb-12 block">
                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center rounded-2xl bg-white border border-black/5 luxury-shadow overflow-hidden">
                  <div className="relative h-72 lg:h-96 overflow-hidden bg-[#f0ece4]">
                    {posts[0].coverUrl ? (
                      <Image
                        src={posts[0].coverUrl}
                        alt={posts[0].title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 55vw, 100vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-6xl">📰</div>
                    )}
                  </div>
                  <div className="p-8">
                    {posts[0].tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {posts[0].tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#b89658]/10 px-3 py-0.5 text-xs font-semibold text-[#b89658]">
                            <Tag size={10} /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="font-[var(--font-display)] text-3xl text-[#171717] group-hover:text-[#b89658] transition">
                      {posts[0].title}
                    </h2>
                    {posts[0].excerpt && (
                      <p className="mt-3 text-[#68625a] leading-7 line-clamp-3">{posts[0].excerpt}</p>
                    )}
                    <div className="mt-5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-[#68625a]">
                        <CalendarDays size={13} />
                        {formatDate(posts[0].publishedAt || posts[0].createdAt)}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-semibold text-[#b89658] group-hover:gap-2 transition-all">
                        Read article <ArrowRight size={15} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Rest of posts grid */}
            {posts.length > 1 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.slice(1).map((post: any) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                    <article className="h-full rounded-xl bg-white border border-black/5 luxury-shadow overflow-hidden transition hover:shadow-lg">
                      <div className="relative h-48 overflow-hidden bg-[#f0ece4]">
                        {post.coverUrl ? (
                          <Image
                            src={post.coverUrl}
                            alt={post.title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-4xl">📰</div>
                        )}
                      </div>
                      <div className="p-5">
                        {post.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {post.tags.slice(0, 2).map((tag: string) => (
                              <span key={tag} className="rounded-full bg-[#b89658]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#b89658]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <h2 className="font-semibold text-lg text-[#171717] group-hover:text-[#b89658] transition line-clamp-2">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="mt-2 text-sm text-[#68625a] leading-6 line-clamp-2">{post.excerpt}</p>
                        )}
                        <div className="mt-4 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs text-[#68625a]">
                            <CalendarDays size={12} />
                            {formatDate(post.publishedAt || post.createdAt)}
                          </span>
                          <span className="text-xs font-semibold text-[#b89658]">Read →</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
