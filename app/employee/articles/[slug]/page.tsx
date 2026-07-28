"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUp, Heart, MessageCircle, Send, Pencil, Trash2, Clock } from "lucide-react";
import { useSession } from "@/src/lib/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { PersonQuoteExtension } from "@/app/components/person-quote-extension";
import { ImageFigureExtension } from "@/app/components/image-figure-extension";
import { EmployeeHeader, BottomNavigation } from "../../components";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: object;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  readTime: number | null;
  publishedAt: string | null;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 60);
}

function extractHeadings(content: object): TocItem[] {
  const doc = content as {
    content?: Array<{
      type: string;
      attrs?: { level?: number };
      content?: Array<{ type: string; text?: string }>;
    }>;
  };
  const items: TocItem[] = [];
  for (const node of doc.content ?? []) {
    if (node.type === "heading" && node.attrs?.level) {
      const text = node.content?.map((c) => c.text ?? "").join("") ?? "";
      if (text) items.push({ id: slugify(text), text, level: node.attrs.level });
    }
  }
  return items;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ArticleMeta({
  publishedAt,
  readTime,
  light,
}: {
  publishedAt: string | null;
  readTime: number;
  light?: boolean;
}) {
  const textCls = light ? "text-white/75" : "text-gray-500";
  const dotCls = light ? "text-white/35" : "text-gray-300";

  return (
    <div className={`flex items-center gap-2.5 flex-wrap text-sm font-techstack ${textCls}`}>
      {publishedAt && <span>{formatDate(publishedAt)}</span>}
      {publishedAt && <span className={dotCls}>·</span>}
      <span className="flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" />
        {readTime} min read
      </span>
    </div>
  );
}

function TableOfContents({ items, activeId }: { items: TocItem[]; activeId: string }) {
  if (items.length === 0) return <div className="hidden lg:block" />;
  return (
    <nav className="hidden lg:block">
      <div className="sticky top-24 space-y-0.5">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-grotesk mb-3">
          Contents
        </p>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById(item.id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`block text-xs font-techstack leading-snug py-1 transition-all duration-150 border-l-2 pl-3 ${
              activeId === item.id
                ? "border-amber-400 text-gray-900 font-grotesk"
                : "border-transparent text-gray-400 hover:text-gray-600"
            } ${item.level === 3 ? "pl-5" : ""}`}
          >
            {item.text}
          </a>
        ))}
      </div>
    </nav>
  );
}

function ArticleContent({
  content,
  tocItems,
  onActiveChange,
}: {
  content: object;
  tocItems: TocItem[];
  onActiveChange: (id: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapImage.configure({ inline: false }),
      ImageFigureExtension,
      TiptapLink.configure({
        HTMLAttributes: {
          class: "text-amber-700 underline underline-offset-2 hover:text-amber-800",
          target: "_blank",
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      PersonQuoteExtension,
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: [
          "prose max-w-none font-techstack text-gray-900",
          "prose-headings:font-grotesk prose-headings:text-gray-900 prose-headings:leading-tight prose-headings:tracking-tight",
          "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg",
          "prose-p:text-[15px] prose-p:leading-[1.85] prose-p:text-gray-900",
          "prose-img:rounded-2xl prose-img:shadow-[0_6px_24px_rgba(20,20,20,0.12)] prose-img:w-full",
          "prose-blockquote:border-l-4 prose-blockquote:border-amber-400 prose-blockquote:bg-amber-50/60 prose-blockquote:rounded-r-xl prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:not-italic prose-blockquote:text-gray-600",
          "prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline",
          "prose-strong:text-gray-900 prose-strong:font-grotesk",
          "prose-li:text-gray-900 prose-li:text-[15px]",
          "prose-hr:border-gray-100",
          "focus:outline-none",
        ].join(" "),
      },
    },
  });

  useEffect(() => {
    if (!editor || tocItems.length === 0) return;
    const container = editorRef.current;
    if (!container) return;

    const headings = container.querySelectorAll("h1,h2,h3,h4,h5,h6");
    headings.forEach((el) => {
      const id = slugify(el.textContent ?? "");
      if (id) el.id = id;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            onActiveChange(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: 0 }
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [editor, tocItems, onActiveChange]);

  if (!editor) return null;
  return (
    <div ref={editorRef}>
      <EditorContent editor={editor} />
    </div>
  );
}

interface ArticleComment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string; image: string | null };
}

function ArticleLikeButton({ articleId }: { articleId: string }) {
  const [likes, setLikes] = useState({ count: 0, liked: false });

  useEffect(() => {
    fetch(`/api/articles/${articleId}/likes`)
      .then((r) => r.json())
      .then(setLikes);
  }, [articleId]);

  const handleLike = async () => {
    const res = await fetch(`/api/articles/${articleId}/likes`, { method: "POST" });
    const data = await res.json();
    setLikes((prev) => ({ count: prev.count + (data.liked ? 1 : -1), liked: data.liked }));
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-grotesk transition-all duration-200 cursor-pointer ${
        likes.liked
          ? "text-amber-800"
          : "bg-white/28 backdrop-blur-xl text-gray-500 border border-white/15 shadow-[0_4px_16px_rgba(20,20,20,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] hover:bg-white/45 hover:shadow-[0_4px_20px_rgba(20,20,20,0.11)]"
      }`}
      style={
        likes.liked
          ? {
              background: "linear-gradient(135deg, #fef3c7, #fed7aa)",
              boxShadow: "0 4px 16px rgba(251,191,36,0.25), inset 0 1px 0 rgba(255,255,255,0.7)",
            }
          : {}
      }
    >
      <Heart
        className={`w-4 h-4 transition-all ${likes.liked ? "fill-amber-400 text-amber-400" : ""}`}
      />
      <span>
        {likes.count > 0 ? likes.count : ""} {likes.liked ? "Liked" : "Like"}
      </span>
    </button>
  );
}

function ArticleComments({
  articleId,
  currentUserId,
  isAdmin,
}: {
  articleId: string;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${articleId}/comments`)
      .then((r) => r.json())
      .then(setComments);
  }, [articleId]);

  const handleComment = async () => {
    if (!input.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch(`/api/articles/${articleId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    });
    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setInput("");
    }
    setSubmitting(false);
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    const res = await fetch(`/api/articles/${articleId}/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent.trim() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      setEditingId(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    await fetch(`/api/articles/${articleId}/comments/${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <div className="bg-white/28 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(20,20,20,0.11),inset_0_1px_0_rgba(255,255,255,0.55)] border border-white/15 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/40 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-grotesk text-gray-900">
          Comments
          {comments.length > 0 && <span className="text-gray-400 ml-1">({comments.length})</span>}
        </h3>
      </div>

      {comments.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-400 font-techstack">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="divide-y divide-white/40">
          {comments.map((comment) => {
            const isOwn = comment.author.id === currentUserId;
            const canDelete = isOwn || isAdmin;
            const displayName = comment.author.name ?? comment.author.email.split("@")[0];
            const initials = displayName.slice(0, 2).toUpperCase();

            return (
              <div key={comment.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  {comment.author.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={comment.author.image}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#141414] flex items-center justify-center text-white text-xs font-grotesk shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-grotesk text-gray-900">{displayName}</span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <span className="text-[10px] text-gray-400 font-techstack mr-1">
                          {new Date(comment.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        {isOwn && editingId !== comment.id && (
                          <button
                            onClick={() => {
                              setEditingId(comment.id);
                              setEditContent(comment.content);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-700 transition rounded cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                        {canDelete && editingId !== comment.id && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition rounded cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {editingId === comment.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          autoFocus
                          className="w-full text-sm text-gray-700 font-techstack border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(comment.id)}
                            className="px-3 py-1 bg-[#141414] text-white text-xs font-grotesk rounded-lg cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-grotesk rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 font-techstack leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="px-5 py-4 border-t border-white/40">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleComment();
              }
            }}
            placeholder="Write a comment..."
            rows={1}
            className="flex-1 text-sm font-techstack text-gray-700 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-amber-400/50 placeholder:text-gray-400"
          />
          <button
            onClick={handleComment}
            disabled={!input.trim() || submitting}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition shrink-0 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 font-techstack mt-1.5">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [progress, setProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      setShowBackToTop(scrollTop > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchArticle = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles/${slug}`);
      if (!res.ok) throw new Error();
      setArticle(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent" />
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-600 font-techstack text-sm">Article not found</p>
        <Link href="/employee/articles" className="text-amber-600 text-sm font-grotesk underline">
          ← Back to articles
        </Link>
      </main>
    );
  }

  const tocItems = extractHeadings(article.content);
  const readTime = article.readTime ?? 1;

  return (
    <main className="min-h-screen bg-transparent flex flex-col">
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 z-50 h-0.5 transition-[width] duration-100 pointer-events-none"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #fbbf24, #f97316, #ea580c)",
        }}
      />

      <EmployeeHeader />

      {/* ─── HERO ─── */}
      {article.coverImage ? (
        <div className="relative overflow-hidden" style={{ height: "clamp(260px, 52vw, 480px)" }}>
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient: subtle top → strong bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

          {/* Content anchored to bottom */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-7 lg:px-8 max-w-5xl mx-auto">
            {article.category && (
              <span className="inline-block text-[11px] font-grotesk uppercase tracking-widest text-amber-300 mb-3 bg-black/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-amber-400/30">
                {article.category}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-grotesk text-white leading-tight mb-4 drop-shadow-sm max-w-3xl">
              {article.title}
            </h1>
            <ArticleMeta publishedAt={article.publishedAt} readTime={readTime} light />
          </div>
        </div>
      ) : (
        /* No cover image — editorial title on aurora background */
        <div className="px-4 pt-10 pb-8 lg:px-8 max-w-5xl mx-auto w-full">
          {article.category && (
            <span className="inline-block text-[11px] font-grotesk uppercase tracking-widest text-amber-600 mb-4 px-2.5 py-0.5 rounded-full border border-amber-300/60 bg-amber-50/50">
              {article.category}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-grotesk text-gray-900 leading-tight mb-6 max-w-3xl">
            {article.title}
          </h1>
          <div className="pb-6 border-b border-gray-900">
            <ArticleMeta publishedAt={article.publishedAt} readTime={readTime} />
          </div>
        </div>
      )}

      {/* ─── CONTENT ─── */}
      <div className="flex-1 pb-28">
        <div className="w-full max-w-6xl mx-auto lg:grid lg:grid-cols-[160px_1fr_160px] lg:gap-8 lg:px-8 lg:pt-10 px-4 pt-7">
          <TableOfContents items={tocItems} activeId={activeId} />

          <div className="min-w-0">
            {/* Excerpt — lead paragraph */}
            {article.excerpt && (
              <>
                <p className="text-lg font-techstack text-gray-600 leading-relaxed mb-6 italic">
                  {article.excerpt}
                </p>
                <div className="w-full mb-8" style={{ height: "1px", backgroundColor: "#141414" }} />
              </>
            )}

            <ArticleContent
              content={article.content}
              tocItems={tocItems}
              onActiveChange={setActiveId}
            />

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-techstack text-amber-700 px-2.5 py-1 rounded-full border border-amber-200/80 bg-amber-50/70"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Like + back link */}
            <div
              className={`flex items-center justify-between flex-wrap gap-3 ${article.tags.length > 0 ? "mt-4" : "mt-8 pt-6 border-t border-gray-100"}`}
            >
              {session ? <ArticleLikeButton articleId={article.id} /> : <div />}
              <Link
                href="/employee/articles"
                className="text-sm text-gray-400 font-techstack hover:text-gray-600 transition"
              >
                ← All articles
              </Link>
            </div>
          </div>

          {/* mirror spacer — keeps prose centered */}
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* ─── COMMENTS ─── */}
      {session && (
        <div className="w-full max-w-6xl mx-auto lg:grid lg:grid-cols-[160px_1fr_160px] lg:gap-8 lg:px-8 px-4 pb-32">
          <div className="hidden lg:block" />
          <ArticleComments
            articleId={article.id}
            currentUserId={session.user.id}
            isAdmin={session.user.role === "admin"}
          />
          <div className="hidden lg:block" />
        </div>
      )}

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-28 right-4 w-10 h-10 bg-white/35 backdrop-blur-xl rounded-full shadow-[0_4px_12px_rgba(20,20,20,0.12)] border border-white/20 flex items-center justify-center text-gray-600 hover:bg-white/55 transition-all z-30"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      <BottomNavigation />
    </main>
  );
}
