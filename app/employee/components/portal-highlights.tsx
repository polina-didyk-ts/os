"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ChevronRight, Calendar } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  author: { name: string | null };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PortalHighlights() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/articles");
      if (!res.ok) throw new Error();
      setArticles(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-[0_4px_12px_rgba(20,20,20,0.06),0_1px_3px_rgba(20,20,20,0.04)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #fde68a 0%, #fbbf24 38%, #f97316 75%, #ea580c 100%)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent" />
            <Sparkles className="w-3.5 h-3.5 text-white relative z-10" strokeWidth={1.5} />
          </div>
          <h2 className="text-base font-grotesk text-gray-900">What&apos;s New at Techstack</h2>
        </div>
        <Link
          href="/employee/articles"
          className="flex items-center gap-0.5 text-xs font-grotesk text-gray-500 hover:text-gray-900 transition"
        >
          View all
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="mx-5 mb-5 space-y-3 animate-pulse">
          <div className="h-44 bg-gray-100 rounded-xl" />
          <div className="space-y-2 px-1">
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="mx-5 mb-5 rounded-xl border border-dashed border-gray-200 px-5 py-8 flex flex-col items-center text-center gap-2">
          <Sparkles className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
          <p className="text-sm font-grotesk text-gray-400">No articles yet</p>
          <p className="text-xs font-techstack text-gray-400">Check back soon for updates</p>
        </div>
      ) : (
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {articles.slice(0, 3).map((article, i) => (
            <Link
              key={article.id}
              href={`/employee/articles/${article.slug}`}
              className={`flex flex-col gap-2.5 group cursor-pointer ${i === 2 ? "hidden sm:flex" : ""}`}
            >
              {/* Cover image — standalone rounded block */}
              <div className="relative h-32 bg-[#141414] overflow-hidden rounded-xl shrink-0">
                {article.coverImage ? (
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-end p-3 select-none">
                    <span className="text-5xl leading-none font-grotesk text-white/[0.07]">
                      {article.title[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                {i === 0 && (
                  <span className="absolute top-2 left-2 text-[10px] font-grotesk tracking-widest text-[#141414] bg-[#FFC600] px-2 py-0.5 rounded-full uppercase">
                    Latest
                  </span>
                )}
              </div>

              {/* Text — no background, floats below image */}
              <div className="flex flex-col gap-1 px-2">
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-techstack">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
                </div>
                <p className="text-sm font-grotesk font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-gray-600 transition-colors">
                  {article.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
