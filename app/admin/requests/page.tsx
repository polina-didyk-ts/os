"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Menu,
  ShoppingCart,
  Wrench,
  MessageSquare,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { BottomNavigation, useSideMenu } from "../components";

// ── types ──────────────────────────────────────────────────────────────────

type RequestType   = "order" | "problem" | "question" | "idea";
type RequestStatus = "new" | "in_progress" | "completed" | "rejected";

interface AdminRequest {
  id: string;
  ticketNumber: string;
  type: RequestType;
  priority: string;
  status: RequestStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
}

// ── config ─────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<RequestType, {
  icon: React.ElementType;
  bgClass: string;
  iconClass: string;
  label: string;
}> = {
  order:    { icon: ShoppingCart,  bgClass: "bg-[#FFC600]/15", iconClass: "text-[#141414]", label: "ORDER"           },
  problem:  { icon: Wrench,        bgClass: "bg-pink-100",   iconClass: "text-pink-500",   label: "PROBLEM"         },
  question: { icon: MessageSquare, bgClass: "bg-gray-100",   iconClass: "text-gray-600",   label: "QUESTION"        },
  idea:     { icon: Lightbulb,     bgClass: "bg-orange-100", iconClass: "text-orange-400", label: "IDEA / FEEDBACK" },
};

const STATUS_CONFIG: Record<RequestStatus, {
  label: string;
  badgeClass: string;
  dotClass: string;
}> = {
  new:         { label: "NEW",         badgeClass: "bg-gray-100 text-gray-700",     dotClass: "bg-gray-400"   },
  in_progress: { label: "IN PROGRESS", badgeClass: "bg-yellow-100 text-yellow-700", dotClass: "bg-yellow-500" },
  completed:   { label: "DONE",        badgeClass: "bg-green-100 text-green-700",   dotClass: "bg-green-500"  },
  rejected:    { label: "REJECTED",    badgeClass: "bg-red-100 text-red-600",       dotClass: "bg-red-500"    },
};

const PRIORITY_CONFIG: Record<string, { label: string; dotClass: string }> = {
  high:   { label: "HIGH",   dotClass: "bg-red-500"    },
  medium: { label: "MEDIUM", dotClass: "bg-yellow-500" },
  low:    { label: "LOW",    dotClass: "bg-green-500"  },
};

const TYPE_FILTERS = [
  { id: "all",      label: "All"      },
  { id: "order",    label: "Order"    },
  { id: "problem",  label: "Problem"  },
  { id: "question", label: "Question" },
  { id: "idea",     label: "Idea"     },
] as const;

const STATUS_FILTERS = [
  { id: "all",         label: "ALL"         },
  { id: "new",         label: "NEW"         },
  { id: "in_progress", label: "IN PROGRESS" },
  { id: "completed",   label: "DONE"        },
  { id: "rejected",    label: "REJECTED"    },
] as const;

// ── helpers ────────────────────────────────────────────────────────────────

function getTitle(req: AdminRequest): string {
  const m = req.metadata as Record<string, string>;
  if (req.type === "order")    return m.what     ?? "Order";
  if (req.type === "problem")  return m.what     ?? "Problem";
  if (req.type === "question") return m.question ?? "Question";
  if (req.type === "idea")     return m.idea     ?? "Idea";
  return "Request";
}

function getShortName(user: AdminRequest["user"]): string {
  if (user.name) {
    const parts = user.name.trim().split(/\s+/);
    return parts.length >= 2 ? `${parts[0]} ${parts[1][0]}.` : user.name;
  }
  return user.email.split("@")[0];
}

function getInitial(user: AdminRequest["user"]): string {
  if (user.name) return user.name.trim()[0].toUpperCase();
  return user.email[0].toUpperCase();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === today.toDateString())     return `${time} • Today`;
  if (d.toDateString() === yesterday.toDateString()) return `${time} • Yesterday`;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "long" });
}

// ── skeleton ───────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <div className="h-3 bg-gray-100 rounded w-16" />
            <div className="h-5 bg-gray-100 rounded w-16" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </div>
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────

export default function AdminRequestsPage() {
  const { toggle } = useSideMenu();

  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [typeFilter, setTypeFilter]     = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (typeFilter   !== "all") params.set("type",   typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/requests?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRequests(data.items);
    } catch {
      setError("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="p-2 hover:bg-gray-100 rounded-lg transition" aria-label="Menu">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <span className="text-lg text-gray-900 font-grotesk">All Requests</span>
        </div>
      </header>

      {/* Type filter */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-grotesk whitespace-nowrap transition ${
                typeFilter === f.id
                  ? "bg-[#141414] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div className="bg-white border-b border-gray-100 px-4 pb-3">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-grotesk whitespace-nowrap transition border-b-2 ${
                statusFilter === f.id
                  ? "border-[#FFC600] text-[#141414]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 pb-28 px-4 py-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}{" "}
            <button onClick={fetchRequests} className="underline font-medium">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3,4].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-800 font-grotesk">No results found</p>
            <p className="text-gray-400 text-sm mt-1 font-techstack">Try changing the filters</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((req) => {
              const typeConf     = TYPE_CONFIG[req.type];
              const statusConf   = STATUS_CONFIG[req.status];
              const priorityConf = PRIORITY_CONFIG[req.priority] ?? PRIORITY_CONFIG.low;
              const Icon = typeConf.icon;

              return (
                <Link
                  key={req.id}
                  href={`/admin/requests/${req.id}`}
                  className="bg-white rounded-2xl px-4 pt-4 pb-0 shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)] block"
                  data-testid="admin-request-card"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "linear-gradient(135deg, #FFC600, #FFB800)", boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.1)" }}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${priorityConf.dotClass}`} />
                            <span className="text-[10px] text-gray-500 uppercase tracking-wide font-grotesk">
                              {priorityConf.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 leading-snug line-clamp-2 font-grotesk">
                            {getTitle(req)}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 font-techstack">ID-{req.ticketNumber}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusConf.badgeClass}`}>
                          {statusConf.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#141414] flex items-center justify-center text-white text-[10px] font-bold">
                        {getInitial(req.user)}
                      </div>
                      <span className="text-xs text-gray-500 font-techstack">{getShortName(req.user)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-techstack">{formatDate(req.createdAt)}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <BottomNavigation />
    </main>
  );
}
