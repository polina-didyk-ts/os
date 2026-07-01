"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ChevronRight, Calendar } from "lucide-react";

const CATEGORIES = ["All", "News", "Guides", "Office Life", "Events"] as const;

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

function FeaturedPlaceholder() {
  return (
    <svg width="140" height="84" viewBox="0 0 140 84" fill="none" aria-hidden="true">
      <rect x="8"  y="34" width="44" height="46" rx="5" fill="#FFC600" opacity="0.55" />
      <rect x="18" y="22" width="24" height="14" rx="3" fill="#FFB800" opacity="0.75" />
      <rect x="62" y="42" width="62" height="38" rx="5" fill="#FFB800" opacity="0.45" />
      <rect x="70" y="51" width="14" height="11" rx="2" fill="white" opacity="0.65" />
      <rect x="90" y="51" width="14" height="11" rx="2" fill="white" opacity="0.65" />
      <rect x="110" y="51" width="8"  height="11" rx="2" fill="white" opacity="0.65" />
      <circle cx="30" cy="16" r="9" fill="#FFD426" opacity="0.45" />
      <rect x="72" y="66" width="46" height="4"  rx="2" fill="#FFD94D" opacity="0.4" />
    </svg>
  );
}

export function PortalHighlights() {
  const [articles, setArticles]     = useState<Article[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchArticles = useCallback(async () => {
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

  const featured = articles[0] ?? null;
  const compact  = articles.slice(1, 3);

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)] overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #FFC600, #FFB800)",
              boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
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
        /* Skeleton */
        <div className="mx-5 mb-4 rounded-xl overflow-hidden border border-gray-100 animate-pulse">
          <div className="h-32 bg-gray-100" />
          <div className="px-4 py-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-full" />
          </div>
        </div>
      ) : articles.length === 0 ? (
        /* Empty state */
        <div className="mx-5 mb-5 rounded-xl border border-dashed border-gray-200 px-5 py-8 flex flex-col items-center text-center gap-2">
          <Sparkles className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
          <p className="text-sm font-grotesk text-gray-400">No articles yet</p>
          <p className="text-xs font-techstack text-gray-400">Check back soon for updates</p>
        </div>
      ) : (
        <>
          {/* Featured article */}
          {featured && (
            <Link
              href={`/employee/articles/${featured.slug}`}
              className="mx-5 mb-4 rounded-xl overflow-hidden border border-[#FFE99A]/60 bg-[#FFFBEE] flex flex-col sm:flex-row hover:border-[#FFC600]/60 transition block"
            >
              {/* Thumbnail */}
              <div className="h-32 sm:h-auto sm:w-44 sm:shrink-0 bg-gradient-to-br from-[#FFF3C4] to-[#FFE566] flex items-center justify-center overflow-hidden relative">
                {featured.coverImage ? (
                  <Image
                    src={featured.coverImage}
                    alt={featured.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <FeaturedPlaceholder />
                )}
              </div>

              {/* Content */}
              <div className="px-4 py-3 flex flex-col justify-center">
                <span className="inline-block text-[10px] font-grotesk tracking-widest text-[#8A6500] bg-[#FFC600]/25 px-2 py-0.5 rounded-full mb-2 uppercase w-fit">
                  Latest
                </span>
                <h3 className="text-sm font-grotesk text-gray-900 leading-snug mb-1.5 line-clamp-2">
                  {featured.title}
                </h3>
                {featured.excerpt && (
                  <p className="text-xs font-techstack text-gray-500 mb-2 leading-relaxed line-clamp-2">
                    {featured.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-techstack">
                  <Calendar className="w-3 h-3" />
                  {formatDate(featured.publishedAt ?? featured.createdAt)}
                </div>
              </div>
            </Link>
          )}

          {/* Category chips */}
          <div className="flex gap-2 px-5 mb-4 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-grotesk transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#141414] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Compact list */}
          {compact.length > 0 && (
            <div className="border-t border-gray-100">
              {compact.map((article, i) => (
                <Link
                  key={article.id}
                  href={`/employee/articles/${article.slug}`}
                  className={`flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAF8F5] transition ${
                    i < compact.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg shrink-0 bg-gradient-to-br from-[#FFF3C4] to-[#FFE566] flex items-center justify-center border border-[#FFE099]">
                    <Sparkles className="w-4 h-4 text-[#D4960A]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-grotesk text-gray-900 leading-snug line-clamp-1">
                      {article.title}
                    </p>
                    <p className="text-xs font-techstack text-gray-400 mt-0.5">
                      {formatDate(article.publishedAt ?? article.createdAt)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
