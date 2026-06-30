"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, AlertCircle } from "lucide-react";
import { EmployeeHeader, BottomNavigation } from "../components";

interface Announcement {
  id: string;
  subject: string;
  message: string;
  createdAt: string;
  readAt: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/employee/announcements");
      if (!res.ok) throw new Error();
      const data: Announcement[] = await res.json();
      setItems(data);

      if (data.some((a) => !a.readAt)) {
        await fetch("/api/employee/announcements/read-all", { method: "POST" });
        setItems((prev) => prev.map((a) => ({ ...a, readAt: a.readAt ?? new Date().toISOString() })));
      }
    } catch {
      setError("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <EmployeeHeader />

      <div className="flex-1 pb-28 px-4 py-5 flex flex-col gap-5 max-w-xl mx-auto w-full">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-grotesk">
            News
          </p>
          <h1 className="text-2xl text-gray-900 mt-0.5 flex items-center gap-2 font-grotesk">
            <Bell className="w-6 h-6" strokeWidth={1.5} />
            Announcements
          </h1>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 space-y-2 animate-pulse shadow-[0_2px_8px_rgba(20,20,20,0.06)]">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="w-12 h-12 text-gray-200 mb-4" strokeWidth={1} />
            <p className="text-gray-500 font-grotesk">No announcements yet</p>
            <p className="text-gray-400 text-sm mt-1 font-techstack">
              You&apos;ll see messages from your office manager here
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)]"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-sm text-gray-900 leading-snug font-grotesk">
                    {item.subject}
                  </h2>
                  {!item.readAt && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-[#FFC600] mt-1.5" />
                  )}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-techstack">
                  {item.message}
                </p>
                <p className="text-xs text-gray-400 mt-3 font-techstack">{formatDate(item.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </main>
  );
}
