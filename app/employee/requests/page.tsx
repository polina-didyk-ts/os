"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  Package,
  Zap,
  MessageCircle,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { EmployeeHeader, BottomNavigation } from "../components";

type RequestStatus = "new" | "in_progress" | "completed" | "rejected";
type RequestType = "order" | "problem" | "question" | "idea";

interface Request {
  id: string;
  ticketNumber: string;
  type: RequestType;
  priority: string;
  status: RequestStatus;
  userId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
}

const STATUS_FILTERS = [
  { id: "all", label: "ALL" },
  { id: "new", label: "NEW" },
  { id: "in_progress", label: "IN PROGRESS" },
  { id: "completed", label: "DONE" },
  { id: "rejected", label: "REJECTED" },
] as const;

type FilterId = "all" | RequestStatus;
type SortOption = "newest" | "oldest" | "updated" | "priority" | "status";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "updated", label: "Recently updated" },
  { value: "priority", label: "Priority" },
  { value: "status", label: "Status" },
];

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };
const STATUS_ORDER: Record<RequestStatus, number> = {
  new: 0,
  in_progress: 1,
  completed: 2,
  rejected: 3,
};

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; dotColor: string; badgeClass: string }
> = {
  new: {
    label: "NEW",
    dotColor: "bg-gray-400",
    badgeClass: "bg-gray-100 text-gray-700",
  },
  in_progress: {
    label: "IN PROGRESS",
    dotColor: "bg-yellow-500",
    badgeClass: "bg-yellow-100 text-yellow-700",
  },
  completed: {
    label: "DONE",
    dotColor: "bg-green-100 text-green-700",
    badgeClass: "bg-green-100 text-green-700",
  },
  rejected: {
    label: "REJECTED",
    dotColor: "bg-red-500",
    badgeClass: "bg-red-100 text-red-600",
  },
};

const HOLO: string[] = [
  "linear-gradient(135deg, #fde68a 0%, #fbbf24 32%, #f97316 65%, #ea580c 100%)",
  "linear-gradient(225deg, #fef08a 0%, #facc15 30%, #fb923c 65%, #ef4444 100%)",
  "linear-gradient(315deg, #fff7ed 0%, #fbbf24 28%, #f97316 62%, #dc2626 100%)",
  "linear-gradient(45deg,  #fef9c3 0%, #fde047 32%, #fb923c 65%, #f97316 100%)",
];

const TYPE_CONFIG: Record<
  RequestType,
  { icon: React.ElementType; holoIndex: number; label: string }
> = {
  order: { icon: Package, holoIndex: 0, label: "Order" },
  problem: { icon: Zap, holoIndex: 1, label: "Problem" },
  question: { icon: MessageCircle, holoIndex: 2, label: "Question" },
  idea: { icon: Sparkles, holoIndex: 3, label: "Idea" },
};

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  high: { label: "High", className: "bg-red-50 text-red-600 border border-red-200" },
  medium: { label: "Medium", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  low: { label: "Low", className: "bg-green-50 text-green-700 border border-green-200" },
};

function getRequestTitle(request: Request): string {
  const meta = request.metadata as Record<string, string | number>;
  if (request.type === "order") return (meta.what as string) ?? "Order";
  if (request.type === "problem") return (meta.what as string) ?? "Problem";
  if (request.type === "question") return (meta.question as string) ?? "Question";
  if (request.type === "idea") return (meta.idea as string) ?? "Idea";
  return "Request";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const timeStr = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  if (date.toDateString() === today.toDateString()) return `Today, ${timeStr}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${timeStr}`;

  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" }) + `, ${timeStr}`;
}

function RequestCardSkeleton() {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 animate-pulse border border-white/40">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gray-200 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="h-4 bg-gray-200 rounded w-3/5" />
            <div className="h-5 bg-gray-200 rounded w-16 shrink-0" />
          </div>
          <div className="h-3 bg-gray-100 rounded w-1/3 mt-2" />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/40">
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-3 bg-gray-200 rounded w-2/5 mt-1" />
      </div>
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center mb-4">
        <MessageSquare className="w-7 h-7 text-gray-400" />
      </div>
      <p className="text-gray-800 text-base font-grotesk">
        {filtered ? "No results found" : "No requests yet"}
      </p>
      <p className="text-gray-500 text-sm mt-1 font-techstack">
        {filtered ? "Try changing the filter" : "Create your first request"}
      </p>
      {!filtered && (
        <Link
          href="/employee"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-grotesk rounded-xl"
          style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }}
        >
          <Plus className="w-4 h-4" />
          New Request
        </Link>
      )}
    </div>
  );
}

export default function EmployeeRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/requests");
      if (!res.ok) throw new Error("Failed to load requests");
      const data = await res.json();
      setRequests(data);
    } catch {
      setError("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filtered =
    activeFilter === "all" ? requests : requests.filter((r) => r.status === activeFilter);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "oldest":
        return arr.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "updated":
        return arr.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "priority":
        return arr.sort(
          (a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
        );
      case "status":
        return arr.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
      default:
        return arr.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [filtered, sortBy]);

  return (
    <main className="min-h-screen bg-transparent flex flex-col">
      <EmployeeHeader />

      {/* Sort filter */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-white/30 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-grotesk whitespace-nowrap transition cursor-pointer ${
                sortBy === opt.value
                  ? "text-white"
                  : "bg-white/40 backdrop-blur-sm text-gray-600 border border-white/60 hover:bg-white/60"
              }`}
              style={
                sortBy === opt.value
                  ? { background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }
                  : {}
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-white/30 px-4 pb-3">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-grotesk whitespace-nowrap transition border-b-2 cursor-pointer ${
                activeFilter === f.id
                  ? "border-amber-400 text-amber-700"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-28 px-4 py-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
            <button onClick={fetchRequests} className="ml-2 underline font-medium cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <RequestCardSkeleton key={i} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState filtered={activeFilter !== "all"} />
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((request, i) => {
              const typeConf = TYPE_CONFIG[request.type];
              const statusConf = STATUS_CONFIG[request.status];
              const priorityConf = PRIORITY_CONFIG[request.priority] ?? PRIORITY_CONFIG.low;
              const Icon = typeConf.icon;
              const title = getRequestTitle(request);
              const hasComments = (request._count?.comments ?? 0) > 0;

              return (
                <Link
                  key={request.id}
                  href={`/employee/requests/${request.id}`}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl px-4 pt-4 pb-0 shadow-[0_4px_12px_rgba(20,20,20,0.06),0_1px_3px_rgba(20,20,20,0.04)] border border-white/40 block animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 70, 350)}ms` }}
                  data-testid="request-card"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
                      style={{ background: HOLO[typeConf.holoIndex] }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent" />
                      <Icon
                        className="w-5 h-5 text-white relative z-10 drop-shadow-sm"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-900 leading-snug line-clamp-2 font-grotesk">
                          {title}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {hasComments && (
                            <div className="relative">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full" />
                            </div>
                          )}
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusConf.badgeClass}`}
                          >
                            {statusConf.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 font-techstack">
                        ID #{request.ticketNumber}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[11px] font-grotesk px-2 py-0.5 rounded-md bg-white/60 text-gray-500 border border-white/40">
                          {typeConf.label}
                        </span>
                        <span
                          className={`text-[11px] font-grotesk px-2 py-0.5 rounded-md ${priorityConf.className}`}
                        >
                          {priorityConf.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/40 pb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-grotesk">
                        Created
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5 font-techstack">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/employee"
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,115,22,0.3)]"
        style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }}
        data-testid="create-request-fab"
      >
        <Plus className="w-7 h-7 text-white" />
      </Link>

      <BottomNavigation />
    </main>
  );
}
