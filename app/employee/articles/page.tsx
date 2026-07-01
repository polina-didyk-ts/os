"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar } from "lucide-react";
import { BottomNavigation } from "../components";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
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

export default function EmployeeArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <Link href="/employee" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-grotesk">
            Stacky&apos;s Internal Portal
          </p>
          <span className="text-lg font-grotesk text-gray-900">What&apos;s New</span>
        </div>
      </header>

      <div className="flex-1 pb-28 px-4 py-5 flex flex-col gap-4 max-w-xl mx-auto w-full">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)]"
            >
              <div className="h-40 bg-gray-100" />
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
            <p className="text-gray-400 text-sm mt-1 font-techstack">Check back soon for updates</p>
          </div>
        ) : (
          articles.map((article) => (
            <Link
              key={article.id}
              href={`/employee/articles/${article.slug}`}
              className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)] block hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,20,20,0.12),0_2px_6px_rgba(20,20,20,0.08)] transition-all duration-200"
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
                {article.publishedAt && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400 font-techstack">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                )}
                <h2 className="text-base font-grotesk text-gray-900 leading-snug">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="text-sm text-gray-500 mt-1.5 font-techstack line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                <p className="text-xs text-[#141414] font-grotesk mt-3">Read more →</p>
              </div>
            </Link>
          ))
        )}
      </div>

      <BottomNavigation />
    </main>
  );
}
