"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
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
  tags: string[];
  readTime: number | null;
  featured: boolean;
  publishedAt: string | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-block text-[10px] font-grotesk uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
      {category}
    </span>
  );
}

function FeaturedCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/employee/articles/${article.slug}`}
      className="block rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(20,20,20,0.10),0_2px_8px_rgba(20,20,20,0.06)] border border-white/40 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(20,20,20,0.14)] transition-all duration-200 animate-fade-up bg-white/60 backdrop-blur-sm"
    >
      {article.coverImage ? (
        <div className="relative w-full" style={{ height: "clamp(180px, 42vw, 280px)" }}>
          <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {article.category && (
            <div className="absolute top-3 left-3">
              <span className="inline-block text-[10px] font-grotesk uppercase tracking-widest text-amber-300 bg-black/30 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-amber-400/30">
                {article.category}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
            <h2 className="text-xl font-grotesk text-white leading-tight drop-shadow-sm line-clamp-3">
              {article.title}
            </h2>
          </div>
        </div>
      ) : (
        <div className="px-5 pt-5 pb-2">
          {article.category && <CategoryBadge category={article.category} />}
          <h2 className="text-xl font-grotesk text-gray-900 leading-tight mt-2 line-clamp-3">
            {article.title}
          </h2>
        </div>
      )}

      <div className="px-4 py-3">
        {article.excerpt && (
          <p className="text-sm font-techstack text-gray-500 line-clamp-2 leading-relaxed mb-3">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-techstack min-w-0">
            {article.publishedAt && (
              <span className="shrink-0">{formatDate(article.publishedAt)}</span>
            )}
          </div>
          <span className="text-xs text-amber-600 font-grotesk shrink-0">Read →</span>
        </div>
      </div>
    </Link>
  );
}

function RegularCard({ article, delay }: { article: Article; delay: number }) {
  return (
    <Link
      href={`/employee/articles/${article.slug}`}
      className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(20,20,20,0.06),0_1px_3px_rgba(20,20,20,0.04)] border border-white/40 block hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,20,20,0.10)] transition-all duration-200 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {article.coverImage && (
        <div className="relative w-full h-44">
          <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {article.category && <CategoryBadge category={article.category} />}
          {article.publishedAt && (
            <span className="text-[10px] text-gray-400 font-techstack">
              {formatDate(article.publishedAt)}
            </span>
          )}
        </div>
        <h2 className="text-base font-grotesk text-gray-900 leading-snug line-clamp-2">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-sm text-gray-500 mt-1.5 font-techstack line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-end mt-3">
          <span className="text-xs text-amber-600 font-grotesk">Read →</span>
        </div>
      </div>
    </Link>
  );
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

  const featuredArticle = articles.find((a) => a.featured) ?? articles[0];
  const rest = articles.filter((a) => a !== featuredArticle);

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
          <>
            {/* Featured skeleton */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden animate-pulse border border-white/40 shadow-[0_8px_32px_rgba(20,20,20,0.08)]">
              <div className="h-52 bg-gray-100/60" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden animate-pulse border border-white/40 shadow-[0_4px_12px_rgba(20,20,20,0.06)]"
              >
                <div className="h-40 bg-gray-100/60" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)" }}
            >
              <Clock className="w-7 h-7 text-white" />
            </div>
            <p className="text-gray-800 font-grotesk">No articles yet</p>
            <p className="text-gray-400 text-sm mt-1 font-techstack">
              {activeCategory === "All"
                ? "Check back soon for updates"
                : `No articles in "${activeCategory}" yet`}
            </p>
          </div>
        ) : (
          <>
            {featuredArticle && <FeaturedCard article={featuredArticle} />}
            {rest.map((article, i) => (
              <RegularCard key={article.id} article={article} delay={Math.min((i + 1) * 80, 400)} />
            ))}
          </>
        )}
      </div>

      <BottomNavigation />
    </main>
  );
}
