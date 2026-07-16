"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Package,
  Zap,
  MessageCircle,
  Sparkles,
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

const HOLO = [
  "linear-gradient(135deg, #fde68a 0%, #fbbf24 32%, #f97316 65%, #ea580c 100%)",
  "linear-gradient(225deg, #fef08a 0%, #facc15 30%, #fb923c 65%, #ef4444 100%)",
  "linear-gradient(315deg, #fff7ed 0%, #fbbf24 28%, #f97316 62%, #dc2626 100%)",
  "linear-gradient(45deg,  #fef9c3 0%, #fde047 32%, #fb923c 65%, #f97316 100%)",
];

const TYPE_CONFIG: Record<
  AdminRequest["type"],
  { icon: React.ElementType; holoIndex: number; label: string }
> = {
  order:    { icon: Package,        holoIndex: 0, label: "ORDER" },
  problem:  { icon: Zap,            holoIndex: 1, label: "PROBLEM" },
  question: { icon: MessageCircle,  holoIndex: 2, label: "QUESTION" },
  idea:     { icon: Sparkles,       holoIndex: 3, label: "IDEA" },
};

function getRequestTitle(req: AdminRequest): string {
  const m = req.metadata as Record<string, string>;
  if (req.type === "order")    return m.what     ?? "Order";
  if (req.type === "problem")  return m.what     ?? "Problem";
  if (req.type === "question") return m.question ?? "Question";
  if (req.type === "idea")     return m.idea     ?? "Idea";
  return "Request";
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

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
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_12px_rgba(20,20,20,0.06),0_1px_3px_rgba(20,20,20,0.04)] border border-white/40">
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

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const stats: Stats = {
    new:         requests.filter((r) => r.status === "new").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    completed:   requests.filter((r) => r.status === "completed").length,
    rejected:    requests.filter((r) => r.status === "rejected").length,
  };

  const recent = requests.slice(0, 3);

  return (
    <main className="min-h-screen bg-transparent flex flex-col">
      <AdminHeader />

      <div className="flex-1 pb-28 px-4 py-5 flex flex-col gap-5">
        {/* Welcome */}
        <div className="animate-fade-up">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-grotesk">WELCOME BACK</p>
          <h1 className="text-2xl text-gray-900 mt-0.5 font-grotesk">Dashboard</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}{" "}
            <button onClick={fetchRequests} className="underline font-medium cursor-pointer">Retry</button>
          </div>
        )}

        {/* Stats 2×2 */}
        <div className="grid grid-cols-2 gap-3 animate-fade-up [animation-delay:80ms]">
          <StatCard icon={<BadgeCheck className="w-6 h-6 text-gray-500" />} label="NEW" value={stats.new} loading={loading} />
          <StatCard icon={<Clock className="w-6 h-6 text-amber-400" />} label="IN PROGRESS" value={stats.in_progress} loading={loading} />
          <StatCard icon={<CheckCircle2 className="w-6 h-6 text-green-500" />} label="DONE" value={stats.completed} loading={loading} />
          <StatCard icon={<XCircle className="w-6 h-6 text-red-400" />} label="REJECTED" value={stats.rejected} loading={loading} />
        </div>

        {/* Recent requests */}
        <div className="animate-fade-up [animation-delay:160ms]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base text-gray-900 font-grotesk">Recent Requests</h2>
            <Link href="/admin/requests" className="text-xs text-amber-600 uppercase tracking-wide font-grotesk">
              ARCHIVE
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 animate-pulse border border-white/40">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))
            ) : recent.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center text-sm text-gray-400 border border-white/40">
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
                    className="bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/80 transition border border-white/40 shadow-[0_4px_12px_rgba(20,20,20,0.06)]"
                    data-testid="admin-request-card"
                  >
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
                      style={{ background: HOLO[conf.holoIndex] }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent" />
                      <Icon className="w-5 h-5 text-white relative z-10 drop-shadow-sm" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-gray-500 uppercase tracking-wide font-grotesk border border-white/40">
                          {conf.label}
                        </span>
                        <span className="text-[10px] text-gray-400 font-techstack">{timeAgo(req.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-900 truncate font-grotesk">{getRequestTitle(req)}</p>
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
