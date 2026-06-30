"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShoppingCart,
  Wrench,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import { AdminHeader, BottomNavigation } from "./components";

interface AdminRequest {
  id: string;
  ticketNumber: string;
  type: "order" | "problem" | "question" | "idea";
  priority: string;
  status: "new" | "in_progress" | "completed" | "rejected";
  metadata: Record<string, unknown>;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
}

interface Stats {
  new: number;
  in_progress: number;
  completed: number;
  rejected: number;
}

// ── helpers ────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  AdminRequest["type"],
  { icon: React.ElementType; bgClass: string; iconClass: string; label: string }
> = {
  order:    { icon: ShoppingCart,  bgClass: "bg-[#FFC600]/15", iconClass: "text-[#141414]", label: "ORDER"    },
  problem:  { icon: Wrench,        bgClass: "bg-pink-100",   iconClass: "text-pink-500",   label: "PROBLEM"  },
  question: { icon: MessageSquare, bgClass: "bg-gray-100",   iconClass: "text-gray-600",   label: "QUESTION" },
  idea:     { icon: Lightbulb,     bgClass: "bg-orange-100", iconClass: "text-orange-400", label: "IDEA"     },
};

function getRequestTitle(req: AdminRequest): string {
  const m = req.metadata as Record<string, string>;
  if (req.type === "order")    return m.what      ?? "Order";
  if (req.type === "problem")  return m.what      ?? "Problem";
  if (req.type === "question") return m.question  ?? "Question";
  if (req.type === "idea")     return m.idea      ?? "Idea";
  return "Request";
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)          return `${diff}s ago`;
  if (diff < 3600)        return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)       return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

// ── stat card ──────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)]">
      <div className="flex flex-col gap-1">
        {icon}
        <span className="text-[10px] uppercase tracking-widest text-gray-400 mt-1 font-grotesk">
          {label}
        </span>
      </div>
      {loading ? (
        <div className="w-8 h-8 rounded bg-gray-100 animate-pulse" />
      ) : (
        <span className="text-3xl text-gray-900 font-grotesk">{value}</span>
      )}
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/requests?limit=50");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRequests(data.items);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const stats: Stats = {
    new:         requests.filter((r) => r.status === "new").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    completed:   requests.filter((r) => r.status === "completed").length,
    rejected:    requests.filter((r) => r.status === "rejected").length,
  };

  const recent = requests.slice(0, 3);

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <AdminHeader />

      <div className="flex-1 pb-28 px-4 py-5 flex flex-col gap-5">
        {/* Welcome */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-grotesk">
            WELCOME BACK
          </p>
          <h1 className="text-2xl text-gray-900 mt-0.5 font-grotesk">
            Dashboard
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}{" "}
            <button onClick={fetchRequests} className="underline font-medium">
              Retry
            </button>
          </div>
        )}

        {/* Stats 2×2 */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<BadgeCheck className="w-6 h-6 text-[#141414]" />}
            label="NEW"
            value={stats.new}
            loading={loading}
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-yellow-500" />}
            label="IN PROGRESS"
            value={stats.in_progress}
            loading={loading}
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6 text-green-500" />}
            label="DONE"
            value={stats.completed}
            loading={loading}
          />
          <StatCard
            icon={<XCircle className="w-6 h-6 text-red-400" />}
            label="REJECTED"
            value={stats.rejected}
            loading={loading}
          />
        </div>

        {/* Recent requests */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base text-gray-900 font-grotesk">Recent Requests</h2>
            <Link
              href="/admin/requests"
              className="text-xs text-[#141414] uppercase tracking-wide font-grotesk"
            >
              ARCHIVE
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3 animate-pulse shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)]">
                  <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))
            ) : recent.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-400 shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)]">
                No requests yet
              </div>
            ) : (
              recent.map((req) => {
                const conf = TYPE_CONFIG[req.type];
                const Icon = conf.icon;
                return (
                  <Link
                    key={req.id}
                    href={`/admin/requests/${req.id}`}
                    className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-[#FAF8F5] transition shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)]"
                    data-testid="admin-request-card"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${conf.bgClass} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${conf.iconClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide font-grotesk">
                          {conf.label}
                        </span>
                        <span className="text-[10px] text-gray-400 font-techstack">
                          {timeAgo(req.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 truncate font-grotesk">
                        {getRequestTitle(req)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}
