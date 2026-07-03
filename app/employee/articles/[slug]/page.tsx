"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, ArrowUp } from "lucide-react";
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
            className={`block text-xs font-techstack leading-snug py-1 transition-all duration-150 border-l-2 ${
              item.level === 1 ? "pl-3" : item.level === 2 ? "pl-5" : "pl-7"
            } ${
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

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
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
            <h1 className="text-2xl font-grotesk text-gray-900 mb-4">{article.title}</h1>
            <ArticleContent
              content={article.content}
              tocItems={tocItems}
              onActiveChange={setActiveId}
            />
          </div>
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
