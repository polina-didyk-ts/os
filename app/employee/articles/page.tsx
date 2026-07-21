"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { EmployeeHeader, BottomNavigation } from "../components";

const CATEGORIES = ["All", "News", "Guides", "Office Life", "Events"] as const;
type Category = (typeof CATEGORIES)[number];

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
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

export default function EmployeeArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const fetchArticles = useCallback(async (category: Category) => {
    setLoading(true);
    try {
      const url =
        category === "All"
          ? "/api/articles"
          : `/api/articles?category=${encodeURIComponent(category)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      setArticles(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(activeCategory);
  }, [fetchArticles, activeCategory]);

  return (
    <main className="min-h-screen bg-transparent flex flex-col">
      <EmployeeHeader />

      {/* Category chips */}
      <div className="flex gap-2 px-4 py-3 bg-white/50 backdrop-blur-sm border-b border-white/30 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-grotesk transition-all cursor-pointer ${
              activeCategory === cat
                ? "text-white"
                : "bg-white/40 backdrop-blur-sm text-gray-600 border border-white/60 hover:bg-white/60"
            }`}
            style={
              activeCategory === cat
                ? { background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }
                : {}
            }
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 pb-28 px-4 py-5 flex flex-col gap-4 max-w-xl mx-auto w-full">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden animate-pulse border border-white/40 shadow-[0_4px_12px_rgba(20,20,20,0.06)]"
            >
              <div className="h-40 bg-gray-100/60" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            </div>
          ))
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-800 font-grotesk">No articles yet</p>
            <p className="text-gray-400 text-sm mt-1 font-techstack">
              {activeCategory === "All"
                ? "Check back soon for updates"
                : `No articles in "${activeCategory}" yet`}
            </p>
          </div>
        ) : (
          articles.map((article, i) => (
            <Link
              key={article.id}
              href={`/employee/articles/${article.slug}`}
              className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(20,20,20,0.06),0_1px_3px_rgba(20,20,20,0.04)] border border-white/40 block hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,20,20,0.10),0_2px_6px_rgba(20,20,20,0.06)] transition-all duration-200 animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 80, 400)}ms` }}
            >
              {article.coverImage && (
                <div className="relative w-full h-44">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {article.category && (
                    <span className="text-[10px] font-grotesk uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      {article.category}
                    </span>
                  )}
                  {article.publishedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400 font-techstack">
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="text-base font-grotesk text-gray-900 leading-snug">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="text-sm text-gray-500 mt-1.5 font-techstack line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                <p className="text-xs text-amber-600 font-grotesk mt-3">Read more →</p>
              </div>
            </Link>
          ))
        )}
      </div>

      <BottomNavigation />
    </main>
  );
}
