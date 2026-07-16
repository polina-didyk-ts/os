"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, FileText, Eye, EyeOff, Pencil, Trash2, MessageCircle, ChevronDown, ChevronUp, Heart } from "lucide-react";
import { AdminHeader, BottomNavigation } from "../components";

interface AdminComment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string };
}

interface ArticleLiker {
  id: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: { id: string; name: string | null };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [commentsByArticle, setCommentsByArticle] = useState<Record<string, AdminComment[]>>({});
  const [expandedLikes, setExpandedLikes] = useState<string | null>(null);
  const [likersByArticle, setLikersByArticle] = useState<Record<string, ArticleLiker[]>>({});

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/articles");
      if (!res.ok) throw new Error();
      setArticles(await res.json());
    } catch {
      setError("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const toggleLikes = async (articleId: string) => {
    if (expandedLikes === articleId) { setExpandedLikes(null); return; }
    setExpandedLikes(articleId);
    if (!likersByArticle[articleId]) {
      const res = await fetch(`/api/admin/articles/${articleId}/likes`);
      if (res.ok) {
        const data: ArticleLiker[] = await res.json();
        setLikersByArticle((prev) => ({ ...prev, [articleId]: data }));
      }
    }
  };

  const toggleComments = async (articleId: string) => {
    if (expandedComments === articleId) { setExpandedComments(null); return; }
    setExpandedComments(articleId);
    if (!commentsByArticle[articleId]) {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      if (res.ok) {
        const data: AdminComment[] = await res.json();
        setCommentsByArticle((prev) => ({ ...prev, [articleId]: data }));
      }
    }
  };

  const handleDeleteComment = async (articleId: string, commentId: string) => {
    await fetch(`/api/articles/${articleId}/comments/${commentId}`, { method: "DELETE" });
    setCommentsByArticle((prev) => ({
      ...prev,
      [articleId]: prev[articleId].filter((c) => c.id !== commentId),
    }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const togglePublish = async (article: Article) => {
    const res = await fetch(`/api/admin/articles/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !article.published }),
    });
    if (res.ok) {
      const updated = await res.json();
      setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    }
  };

  return (
    <main className="min-h-screen bg-transparent flex flex-col">
      <AdminHeader />

      <div className="flex-1 pb-28 px-4 py-5 flex flex-col gap-5 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <p className="text-xs font-grotesk uppercase tracking-widest text-gray-400">ADMIN</p>
            <h1 className="text-2xl font-grotesk text-gray-900 mt-0.5 flex items-center gap-2">
              <FileText className="w-6 h-6" strokeWidth={1.5} />
              Articles
            </h1>
          </div>
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-grotesk text-sm transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,115,22,0.3)]"
            style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }}
          >
            <Plus className="w-4 h-4" />
            New
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 animate-pulse border border-white/40 shadow-[0_4px_12px_rgba(20,20,20,0.06)]">
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/40 shadow-[0_4px_12px_rgba(20,20,20,0.06)]">
            <p className="text-gray-400 font-techstack text-sm">No articles yet</p>
            <Link href="/admin/articles/new" className="mt-3 inline-block text-sm font-grotesk text-amber-600 underline">
              Create first article
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {articles.map((article, i) => (
              <div
                key={article.id}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-[0_4px_12px_rgba(20,20,20,0.06),0_1px_3px_rgba(20,20,20,0.04)] border border-white/40 animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-grotesk text-gray-900 truncate">{article.title}</p>
                    <p className="text-xs font-techstack text-gray-400 mt-0.5">
                      {formatDate(article.createdAt)} · /{article.slug}
                    </p>
                    {article.excerpt && (
                      <p className="text-xs font-techstack text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>
                    )}
                  </div>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-grotesk ${
                    article.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {article.published ? "PUBLISHED" : "DRAFT"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/40 flex-wrap">
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 backdrop-blur-sm text-gray-700 text-xs font-grotesk border border-white/60 hover:bg-white/80 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() => togglePublish(article)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 backdrop-blur-sm text-gray-700 text-xs font-grotesk border border-white/60 hover:bg-white/80 transition cursor-pointer"
                  >
                    {article.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {article.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => toggleLikes(article.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 backdrop-blur-sm text-gray-700 text-xs font-grotesk border border-white/60 hover:bg-white/80 transition cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    Likes
                    {expandedLikes === article.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => toggleComments(article.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 backdrop-blur-sm text-gray-700 text-xs font-grotesk border border-white/60 hover:bg-white/80 transition cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Comments
                    {expandedComments === article.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50/80 text-red-500 text-xs font-grotesk border border-red-100 hover:bg-red-100 transition cursor-pointer ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>

                {expandedLikes === article.id && (
                  <div className="mt-3 border-t border-white/40 pt-3">
                    {!likersByArticle[article.id] ? (
                      <p className="text-xs text-gray-400 font-techstack">Loading...</p>
                    ) : likersByArticle[article.id].length === 0 ? (
                      <p className="text-xs text-gray-400 font-techstack">No likes yet</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {likersByArticle[article.id].map((liker) => {
                          const name = liker.user.name ?? liker.user.email.split("@")[0];
                          const initials = name.slice(0, 2).toUpperCase();
                          return (
                            <div key={liker.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/50 backdrop-blur-sm rounded-full border border-white/50">
                              {liker.user.image ? (
                                <img src={liker.user.image} alt={name} className="w-4 h-4 rounded-full object-cover" />
                              ) : (
                                <div
                                  className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-grotesk relative overflow-hidden shrink-0"
                                  style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)" }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                                  <span className="relative z-10">{initials}</span>
                                </div>
                              )}
                              <span className="text-xs font-grotesk text-gray-700">{name}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {expandedComments === article.id && (
                  <div className="mt-3 border-t border-white/40 pt-3 space-y-2">
                    {!commentsByArticle[article.id] ? (
                      <p className="text-xs text-gray-400 font-techstack">Loading...</p>
                    ) : commentsByArticle[article.id].length === 0 ? (
                      <p className="text-xs text-gray-400 font-techstack">No comments yet</p>
                    ) : (
                      commentsByArticle[article.id].map((comment) => {
                        const displayName = comment.author.name ?? comment.author.email.split("@")[0];
                        return (
                          <div key={comment.id} className="flex items-start gap-2 p-2.5 bg-white/40 backdrop-blur-sm rounded-xl border border-white/40">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-grotesk shrink-0 relative overflow-hidden"
                              style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)" }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                              <span className="relative z-10">{displayName.slice(0, 2).toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-grotesk text-gray-700">{displayName}</span>
                                <span className="text-[10px] text-gray-400 font-techstack shrink-0">
                                  {new Date(comment.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 font-techstack mt-0.5 line-clamp-2">{comment.content}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteComment(article.id, comment.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </main>
  );
}
