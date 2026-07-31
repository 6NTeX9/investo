"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import {
  Newspaper,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  Tag,
  Edit,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverUrl?: string | null;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminBlogsPage() {
  // Lists
  const [posts, setPosts] = useState<BlogPost[]>([]);

  // Loading
  const [loading, setLoading] = useState(true);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Track slug manual editing
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  // Auth check & initial fetch
  useEffect(() => {
    fetchPosts();
  }, []);

  // Fetch blog posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/blog");
      // API may return array directly or { items: [...] }
      const data = res.data;
      setPosts(Array.isArray(data) ? data : data.items ?? []);
    } catch (err) {
      console.error("Failed to load blog posts:", err);
      toast.error("Failed to load blog posts.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (!isSlugEdited) {
      setSlug(slugify(title));
    }
  }, [title, isSlugEdited]);

  // Open create drawer
  const handleOpenCreate = () => {
    setEditingPost(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCoverUrl("");
    setTagsText("");
    setIsPublished(false);
    setIsSlugEdited(false);
    setDrawerOpen(true);
  };

  // Open edit drawer (view mode – populates form but save creates new record per spec)
  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt ?? "");
    setContent(post.content);
    setCoverUrl(post.coverUrl ?? "");
    setTagsText(post.tags?.join(", ") ?? "");
    setIsPublished(post.isPublished);
    setIsSlugEdited(true);
    setDrawerOpen(true);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !content) {
      toast.error("Title, slug and content are required.");
      return;
    }

    setSubmitting(true);

    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      coverUrl: coverUrl || null,
      tags,
      isPublished,
    };

    try {
      if (editingPost) {
        await api.patch(`/blog/${editingPost.id}`, payload);
        toast.success("Blog post updated successfully!");
      } else {
        await api.post("/blog", payload);
        toast.success("Blog post created successfully!");
      }
      setDrawerOpen(false);
      fetchPosts();
    } catch (err: any) {
      console.error("Error saving blog post:", err);
      const message = err.response?.data?.message ?? "Failed to save blog post.";
      const displayMessage = Array.isArray(message) ? message[0] : message;
      toast.error(displayMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="section-shell pt-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">
            BricksNBeyond Content
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Blog Posts</h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-md bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] active:bg-black"
        >
          <Plus size={16} />
          <span>Add Post</span>
        </button>
      </div>

      {/* Posts Table */}
      <div className="mt-8 overflow-hidden rounded-lg bg-white border border-black/5 luxury-shadow">
        {loading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-4">
                  <div className="h-14 w-20 rounded bg-black/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-black/5" />
                    <div className="h-3 w-1/2 rounded bg-black/5" />
                  </div>
                  <div className="h-6 w-16 rounded bg-black/5" />
                  <div className="h-8 w-16 rounded bg-black/5" />
                </div>
              ))}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="grid place-items-center py-20 text-center">
            <Newspaper size={48} className="text-[#b89658]/40" />
            <h3 className="mt-4 font-semibold text-lg">No blog posts yet</h3>
            <p className="mt-1 text-sm text-[#68625a]">
              Click "Add Post" to publish your first article.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-black/5 bg-[#f7f4ee] font-semibold text-[#68625a]">
                    <th className="p-4">Article</th>
                    <th className="p-4">Excerpt</th>
                    <th className="p-4">Tags</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Date</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-[#fcfbfa] transition-colors"
                    >
                      {/* Cover + Title */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 overflow-hidden rounded border border-black/5 bg-black/5 flex-shrink-0">
                            {post.coverUrl ? (
                              <img
                                src={post.coverUrl}
                                alt={post.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-black/20">
                                <Newspaper size={18} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-base text-[#171717] max-w-[200px] truncate">
                              {post.title}
                            </p>
                            <p className="text-xs text-[#68625a] font-mono">
                              {post.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Excerpt snippet */}
                      <td className="p-4 max-w-[220px]">
                        <p className="text-sm text-[#68625a] line-clamp-2">
                          {post.excerpt ?? post.content?.slice(0, 100)}
                        </p>
                      </td>

                      {/* Tags */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.length > 0 ? (
                            post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-0.5 rounded-full bg-[#b89658]/10 px-2 py-0.5 text-[10px] font-semibold text-[#b89658]"
                              >
                                <Tag size={8} />
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#68625a]/50">—</span>
                          )}
                          {post.tags?.length > 3 && (
                            <span className="text-[10px] text-[#68625a]">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        {post.isPublished ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-center">
                        <span className="text-xs text-[#68625a]">
                          {new Date(post.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(post)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit post"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-black/5 bg-white">
              {posts.map((post) => (
                <div key={post.id} className="p-4 flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="h-16 w-20 overflow-hidden rounded border border-black/5 bg-black/5 flex-shrink-0">
                      {post.coverUrl ? (
                        <img
                          src={post.coverUrl}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-black/20">
                          <Newspaper size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-[#171717] leading-tight truncate">
                        {post.title}
                      </h3>
                      <p className="text-[10px] text-[#68625a] font-mono mt-0.5 truncate">
                        {post.slug}
                      </p>
                      <p className="text-xs text-[#68625a] line-clamp-2 mt-1">
                        {post.excerpt ?? post.content?.slice(0, 100)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-black/5 pt-2 text-xs">
                    <div className="flex flex-wrap gap-1 max-w-[50%]">
                      {post.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-0.5 rounded-full bg-[#b89658]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#b89658] truncate max-w-[70px]"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags?.length > 2 && (
                        <span className="text-[9px] text-[#68625a] self-center">
                          +{post.tags.length - 2}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {post.isPublished ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-700 border border-emerald-100">
                          <span className="h-1 w-1 rounded-full bg-emerald-600" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-medium text-amber-700 border border-amber-100">
                          <span className="h-1 w-1 rounded-full bg-amber-600" />
                          Draft
                        </span>
                      )}
                      <span className="text-[10px] text-[#68625a]">
                        {new Date(post.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(post)}
                      className="flex items-center gap-1 rounded border border-black/10 px-2.5 py-1 text-xs font-semibold text-[#b89658] hover:bg-[#b89658]/5 transition"
                      title="Edit post"
                    >
                      <Edit size={12} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Slide-out Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          drawerOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => !submitting && setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel */}
        <div
          className={`absolute bottom-0 right-0 top-0 w-full max-w-2xl bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-black/10 p-5">
            <div>
              <h2 className="text-xl font-semibold text-[#171717]">
                {editingPost ? `Edit post: ${editingPost.title}` : "New blog post"}
              </h2>
              <p className="text-xs text-[#68625a] mt-0.5">
                {editingPost
                  ? "Update the article details below."
                  : "Fill in the article details to publish."}
              </p>
            </div>
            <button
              disabled={submitting}
              onClick={() => setDrawerOpen(false)}
              className="p-1 text-[#68625a] hover:bg-black/5 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6"
          >
            {/* Section 1: Identity */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">
                1. Article Identity
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                    placeholder="e.g. 5 Tips for Luxury Home Buyers"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">
                    Slug (URL) *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsSlugEdited(true);
                    }}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50 font-mono"
                    placeholder="5-tips-for-luxury-home-buyers"
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">
                  Excerpt (optional – short summary)
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                  placeholder="Brief description shown in listing cards..."
                />
              </div>
            </div>

            {/* Section 2: Content */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">
                2. Article Content
              </h3>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">
                  Content *
                </label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                  placeholder="Write the full article body here..."
                />
              </div>
            </div>

            {/* Section 3: Media & Tags */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">
                3. Media &amp; Tags
              </h3>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">
                  Cover Image URL (optional)
                </label>
                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                  placeholder="https://images.unsplash.com/photo-..."
                />
                {coverUrl && (
                  <div className="mt-1 overflow-hidden rounded border border-black/10">
                    <img
                      src={coverUrl}
                      alt="Cover preview"
                      className="h-40 w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">
                  Tags (comma separated, optional)
                </label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                  placeholder="luxury, real estate, investment"
                />
                {tagsText && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {tagsText
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-full bg-[#b89658]/10 px-2.5 py-0.5 text-xs font-semibold text-[#b89658]"
                        >
                          <Tag size={9} />
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Publishing */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">
                4. Publishing
              </h3>

              <label className="flex items-center gap-3 cursor-pointer rounded border border-black/5 p-3 hover:bg-[#fcfbfa]">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-black/20 text-[#b89658] focus:ring-[#b89658]"
                />
                <div className="flex items-center gap-2">
                  {isPublished ? (
                    <Eye size={16} className="text-emerald-600" />
                  ) : (
                    <EyeOff size={16} className="text-[#68625a]" />
                  )}
                  <div>
                    <span className="text-sm font-semibold text-[#171717]">
                      {isPublished ? "Published" : "Draft"}
                    </span>
                    <p className="text-[11px] text-[#68625a]">
                      {isPublished
                        ? "Visible on the public blog."
                        : "Only visible to admins."}
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-black/10 p-5 bg-[#fcfbfa] flex justify-end gap-3 shrink-0">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setDrawerOpen(false)}
              className="rounded-md border border-black/10 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-md bg-[#171717] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] active:bg-black disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{editingPost ? "Update Post" : "Publish Post"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
