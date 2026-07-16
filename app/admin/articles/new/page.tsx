"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { ArticleEditor } from "../../components/article-editor";
import { ARTICLE_CATEGORIES } from "@/src/modules/articles/articles.dto";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    coverImage: "",
    category: "" as string,
    published: false,
  });
  const [content, setContent] = useState<object>({});

  const handleTitleChange = (val: string) => {
    setForm((f) => ({ ...f, title: val, slug: slugify(val) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, content }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      router.push("/admin/articles");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-transparent flex flex-col">
      <header className="flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-md sticky top-0 z-10 border-b border-white/30">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/60 rounded-lg transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <span className="text-lg font-grotesk text-gray-900">New Article</span>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex-1 pb-10 px-4 py-5 flex flex-col gap-4 max-w-2xl mx-auto w-full"
      >
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-grotesk text-gray-500 uppercase tracking-widest mb-2">
            Title
          </label>
          <Input
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Office Summer Party 2026"
            maxLength={255}
            required
            className="w-full bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-grotesk text-gray-500 uppercase tracking-widest mb-2">
            Slug
          </label>
          <Input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="office-summer-party-2026"
            maxLength={255}
            required
            className="w-full font-techstack bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50"
          />
        </div>

        {/* Cover Image + Category row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-grotesk text-gray-500 uppercase tracking-widest mb-2">
              Cover Image URL{" "}
              <span className="text-gray-400 normal-case font-techstack">(optional)</span>
            </label>
            <Input
              value={form.coverImage}
              onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
              placeholder="https://..."
              className="w-full font-techstack bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50"
            />
          </div>
          <div>
            <label className="block text-xs font-grotesk text-gray-500 uppercase tracking-widest mb-2">
              Category <span className="text-gray-400 normal-case font-techstack">(optional)</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full h-9 rounded-md border border-white/60 bg-white/50 backdrop-blur-sm px-3 text-sm font-techstack text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
            >
              <option value="">No category</option>
              {ARTICLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-grotesk text-gray-500 uppercase tracking-widest mb-2">
            Excerpt{" "}
            <span className="text-gray-400 normal-case font-techstack">
              (short preview description)
            </span>
          </label>
          <Textarea
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            placeholder="A short description shown in the article list…"
            rows={2}
            maxLength={500}
            className="w-full bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-grotesk text-gray-500 uppercase tracking-widest mb-2">
            Content
          </label>
          <ArticleEditor content={content} onChange={setContent} />
        </div>

        {/* Publish toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
            className="w-11 h-6 rounded-full transition-colors relative"
            style={{
              background: form.published
                ? "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)"
                : "#e5e7eb",
            }}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.published ? "translate-x-5" : ""}`}
            />
          </div>
          <span className="text-sm font-grotesk text-gray-900">Publish immediately</span>
        </label>

        <Button
          type="submit"
          disabled={loading || !form.title || !form.slug}
          className="w-full text-white py-3 rounded-xl font-grotesk font-normal cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,115,22,0.3)] disabled:translate-y-0 disabled:shadow-none disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }}
        >
          {loading ? "Saving…" : "Save Article"}
        </Button>
      </form>
    </main>
  );
}
