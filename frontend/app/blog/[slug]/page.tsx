import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Tag, ArrowLeft, ArrowRight } from "lucide-react";
import { api } from "@/services/api";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

async function getPost(slug: string) {
  try {
    const res = await api.get(`/blog/${slug}`);
    return res.data;
  } catch {
    return null;
  }
}

async function getRelatedPosts(currentSlug: string) {
  try {
    const res = await api.get("/blog");
    return (res.data || []).filter((p: any) => p.slug !== currentSlug).slice(0, 3);
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

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | BricksNBeyond Insights`,
    description: post.excerpt || post.content?.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      images: post.coverUrl ? [post.coverUrl] : []
    }
  };
}

export default async function BlogArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(slug);

  return (
    <main>
      {/* Hero image */}
      {post.coverUrl && (
        <div className="relative h-72 md:h-[440px] w-full overflow-hidden">
          <Image
            src={post.coverUrl}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>
      )}

      {/* Article content */}
      <section className="section-shell max-w-3xl pt-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-[#68625a] hover:text-[#171717] transition mb-8"
        >
          <ArrowLeft size={15} /> Back to Insights
        </Link>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-[#b89658]/10 px-3 py-1 text-xs font-semibold text-[#b89658]"
              >
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Market insights</p>
        <h1 className="mt-3 font-[var(--font-display)] text-4xl md:text-5xl leading-tight text-[#171717]">
          {post.title}
        </h1>

        <div className="mt-4 flex items-center gap-2 text-sm text-[#68625a]">
          <CalendarDays size={15} />
          <time dateTime={post.publishedAt || post.createdAt}>
            {formatDate(post.publishedAt || post.createdAt)}
          </time>
        </div>

        {post.excerpt && (
          <p className="mt-6 text-xl text-[#4f4942] leading-8 font-medium border-l-2 border-[#b89658] pl-5">
            {post.excerpt}
          </p>
        )}

        {/* Main content */}
        <div className="mt-8 text-[#4f4942] leading-8 text-lg whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Footer divider */}
        <div className="mt-16 border-t border-black/5 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#b89658] hover:underline"
          >
            <ArrowLeft size={15} /> All Insights
          </Link>
        </div>
      </section>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="section-shell mt-16 pb-20">
          <h2 className="font-[var(--font-display)] text-3xl">More insights</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p: any) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
                <article className="rounded-xl bg-white border border-black/5 luxury-shadow overflow-hidden transition hover:shadow-lg">
                  {p.coverUrl && (
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={p.coverUrl}
                        alt={p.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-[#171717] group-hover:text-[#b89658] transition line-clamp-2">
                      {p.title}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#b89658]">
                      Read article <ArrowRight size={12} />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
