"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ArticleContent({ content }: { content: object }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapImage.configure({ inline: false }),
      TiptapLink.configure({
        HTMLAttributes: { class: "text-[#141414] underline", target: "_blank" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
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

  if (!editor) return null;
  return <EditorContent editor={editor} />;
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <Link href="/employee/articles" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-grotesk">
          Stacky&apos;s Internal Portal
        </p>
      </header>

      <div className="flex-1 pb-28 max-w-xl mx-auto w-full">
        {/* Cover image */}
        {article.coverImage && (
          <div className="relative w-full h-52">
            <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
          </div>
        )}

        {/* Article card */}
        <div className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)]">
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
          <ArticleContent content={article.content} />
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}
