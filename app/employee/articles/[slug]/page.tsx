"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, ArrowUp, Heart, MessageCircle, Send, Pencil, Trash2 } from "lucide-react";
import { useSession } from "@/src/lib/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { PersonQuoteExtension } from "@/app/components/person-quote-extension";
import { BottomNavigation } from "../../components";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: object;
  coverImage: string | null;
  publishedAt: string | null;
  author: { name: string | null };
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

function TableOfContents({ items, activeId }: { items: TocItem[]; activeId: string }) {
  if (items.length === 0) return null;
  return (
    <nav className="hidden lg:block w-52 shrink-0 animate-fade-up [animation-delay:40ms]">
      <div className="sticky top-20 space-y-0.5">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-grotesk mb-3">
          Contents
        </p>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`block text-xs font-techstack leading-snug py-1 transition-all duration-150 border-l-2 pl-3 ${
              activeId === item.id
                ? "border-[#FFC600] text-[#141414] font-grotesk"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
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
      TiptapLink.configure({
        HTMLAttributes: { class: "text-[#141414] underline", target: "_blank" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      PersonQuoteExtension,
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: [
          "prose prose-sm max-w-none font-techstack text-gray-800",
          "prose-headings:font-grotesk prose-headings:text-gray-900",
          "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
          "prose-img:rounded-2xl prose-img:shadow-[0_4px_12px_rgba(20,20,20,0.12)]",
          "prose-blockquote:border-l-4 prose-blockquote:border-[#FFC600] prose-blockquote:bg-[#FAF8F5] prose-blockquote:rounded-r-xl prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:not-italic",
          "prose-a:text-[#141414] prose-strong:font-grotesk",
        ].join(" "),
      },
    },
  });

  // Add IDs to heading DOM elements and set up IntersectionObserver
  useEffect(() => {
    if (!editor || tocItems.length === 0) return;

    const container = editorRef.current;
    if (!container) return;

    // Add IDs to headings
    const headings = container.querySelectorAll("h1,h2,h3,h4,h5,h6");
    headings.forEach((el) => {
      const text = el.textContent ?? "";
      const id = slugify(text);
      if (id) el.id = id;
    });

    // IntersectionObserver to track active heading
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
    fetch(`/api/articles/${articleId}/likes`).then((r) => r.json()).then(setLikes);
  }, [articleId]);

  const handleLike = async () => {
    const res = await fetch(`/api/articles/${articleId}/likes`, { method: "POST" });
    const data = await res.json();
    setLikes((prev) => ({ count: prev.count + (data.liked ? 1 : -1), liked: data.liked }));
  };

  return (
    <div className="flex items-center gap-3 pt-4 mt-4 border-t border-gray-100">
      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-grotesk transition-all cursor-pointer ${
          likes.liked
            ? "bg-[#FFC600]/15 text-[#141414]"
            : "bg-[#FAF8F5] text-gray-500 hover:bg-gray-100"
        }`}
      >
        <Heart
          className={`w-4 h-4 transition-all ${likes.liked ? "fill-[#FFC600] text-[#FFC600]" : ""}`}
        />
        <span>{likes.count}</span>
      </button>
    </div>
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
    fetch(`/api/articles/${articleId}/comments`).then((r) => r.json()).then(setComments);
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
    <div className="mx-4 mt-3 mb-4 lg:mx-0 animate-fade-up [animation-delay:160ms]">
      <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-grotesk text-gray-900">
            Comments
            {comments.length > 0 && (
              <span className="text-gray-400 ml-1">({comments.length})</span>
            )}
          </h3>
        </div>

        {comments.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400 font-techstack">
            No comments yet. Be the first!
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map((comment) => {
              const isOwn = comment.author.id === currentUserId;
              const canDelete = isOwn || isAdmin;
              const displayName = comment.author.name ?? comment.author.email.split("@")[0];
              const initials = displayName.slice(0, 2).toUpperCase();

              return (
                <div key={comment.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    {comment.author.image ? (
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
                            className="w-full text-sm text-gray-700 font-techstack border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#FFC600] focus:border-[#FFC600]"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(comment.id)}
                              className="px-3 py-1 bg-[#141414] text-white text-xs font-grotesk rounded-lg"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-grotesk rounded-lg"
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

        <div className="px-5 py-4 border-t border-gray-100">
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
              className="flex-1 text-sm font-techstack text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-[#FFC600] focus:border-[#FFC600] placeholder:text-gray-400"
            />
            <button
              onClick={handleComment}
              disabled={!input.trim() || submitting}
              className="w-9 h-9 bg-[#141414] rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition shrink-0 mb-0.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 font-techstack mt-1.5">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
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
      <main className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#141414] border-t-transparent" />
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-600 font-techstack text-sm">Article not found</p>
        <Link href="/employee/articles" className="text-[#141414] text-sm font-grotesk underline">
          ← Back to articles
        </Link>
      </main>
    );
  }

  const tocItems = extractHeadings(article.content);

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 z-50 h-0.5 bg-[#FFC600] transition-[width] duration-100 pointer-events-none"
        style={{ width: `${progress}%` }}
      />

      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <Link href="/employee/articles" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-grotesk">
          Stacky&apos;s Internal Portal
        </p>
      </header>

      {/* Desktop: sidebar + content. Mobile: single column */}
      <div className="flex-1 pb-28 w-full max-w-5xl mx-auto lg:flex lg:gap-8 lg:px-8 lg:pt-8">
        <TableOfContents items={tocItems} activeId={activeId} />

        <div className="flex-1 min-w-0">
          {/* Cover image */}
          {article.coverImage && (
            <div className="relative w-full h-52 animate-fade-up">
              <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
            </div>
          )}

          {/* Article card */}
          <div className="mx-4 mt-4 lg:mx-0 bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)] animate-fade-up [animation-delay:80ms]">
            {article.publishedAt && (
              <div className="flex items-center gap-1.5 mb-3">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-400 font-techstack">
                  {formatDate(article.publishedAt)}
                </span>
                {article.author.name && (
                  <span className="text-xs text-gray-400 font-techstack">
                    · {article.author.name}
                  </span>
                )}
              </div>
            )}
            <h1 className="text-2xl font-grotesk text-gray-900 mb-3">{article.title}</h1>
            {article.excerpt && (
              <p className="text-base font-techstack text-gray-500 leading-relaxed mb-5 pb-5 border-b border-gray-100">
                {article.excerpt}
              </p>
            )}
            <ArticleContent
              content={article.content}
              tocItems={tocItems}
              onActiveChange={setActiveId}
            />
            {session && <ArticleLikeButton articleId={article.id} />}
          </div>

          {session && (
            <ArticleComments
              articleId={article.id}
              currentUserId={session.user.id}
              isAdmin={session.user.role === "admin"}
            />
          )}
        </div>
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-28 right-4 w-10 h-10 bg-white rounded-full shadow-[0_4px_12px_rgba(20,20,20,0.15)] flex items-center justify-center text-[#141414] hover:bg-gray-50 transition-all z-30 animate-fade-scale"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      <BottomNavigation />
    </main>
  );
}
