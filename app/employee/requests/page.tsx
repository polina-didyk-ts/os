"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  ShoppingCart,
  Wrench,
  MessageSquare,
  Lightbulb,
  Menu,
} from "lucide-react";
import { BottomNavigation, useSideMenu } from "../components";
import { useSession } from "@/src/lib/client";

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
  { id: "all" as const, label: "All" },
  { id: "new" as const, label: "New" },
  { id: "in_progress" as const, label: "In Progress" },
  { id: "completed" as const, label: "Done" },
  { id: "rejected" as const, label: "Rejected" },
];

type FilterId = "all" | RequestStatus;

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

const TYPE_CONFIG: Record<
  RequestType,
  { icon: React.ElementType; bgClass: string; iconClass: string; label: string }
> = {
  order: {
    icon: ShoppingCart,
    bgClass: "bg-[#FFC600]/15",
    iconClass: "text-[#141414]",
    label: "Order",
  },
  problem: {
    icon: Wrench,
    bgClass: "bg-gray-100",
    iconClass: "text-gray-600",
    label: "Problem",
  },
  question: {
    icon: MessageSquare,
    bgClass: "bg-gray-100",
    iconClass: "text-gray-600",
    label: "Question",
  },
  idea: {
    icon: Lightbulb,
    bgClass: "bg-orange-100",
    iconClass: "text-orange-500",
    label: "Idea",
  },
};

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  high:   { label: "High",   className: "bg-red-50 text-red-600 border border-red-200"              },
  medium: { label: "Medium", className: "bg-[#FFC600]/15 text-[#8B6914] border border-[#FFC600]/40" },
  low:    { label: "Low",    className: "bg-green-50 text-green-700 border border-green-200"         },
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

  const timeStr = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${timeStr}`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${timeStr}`;
  }

  return (
    date.toLocaleDateString("en-US", { month: "long", day: "numeric" }) +
    `, ${timeStr}`
  );
}

function RequestCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="h-4 bg-gray-200 rounded w-3/5" />
            <div className="h-5 bg-gray-200 rounded w-16 shrink-0" />
          </div>
          <div className="h-3 bg-gray-100 rounded w-1/3 mt-2" />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-3 bg-gray-200 rounded w-2/5 mt-1" />
      </div>
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <MessageSquare className="w-7 h-7 text-gray-400" />
      </div>
      <p className="text-gray-800 font-semibold text-base">
        {filtered ? "No results found" : "No requests yet"}
      </p>
      <p className="text-gray-500 text-sm mt-1">
        {filtered
          ? "Try changing the filter"
          : "Create your first request"}
      </p>
      {!filtered && (
        <Link
          href="/employee/requests/new"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#141414] text-white text-sm font-medium rounded-xl"
        >
          <Plus className="w-4 h-4" />
          New Request
        </Link>
      )}
    </div>
  );
}

export default function EmployeeRequestsPage() {
  const { data: session } = useSession();
  const { toggle } = useSideMenu();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

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
    activeFilter === "all"
      ? requests
      : requests.filter((r) => r.status === activeFilter);

  const userInitial = session?.user?.name?.[0]?.toUpperCase() ?? "?";

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="p-2 hover:bg-gray-100 rounded-lg transition" aria-label="Open menu">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <span className="text-lg font-semibold text-gray-900">My Requests</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#141414] flex items-center justify-center text-white text-sm font-semibold">
          {userInitial}
        </div>
      </header>

      {/* Status filter tabs */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {STATUS_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            const statusInfo =
              filter.id !== "all"
                ? STATUS_CONFIG[filter.id as RequestStatus]
                : null;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-[#141414] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {statusInfo && !isActive && (
                  <span
                    className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`}
                  />
                )}
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-28 px-4 py-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
            <button
              onClick={fetchRequests}
              className="ml-2 underline font-medium"
            >
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
        ) : filtered.length === 0 ? (
          <EmptyState filtered={activeFilter !== "all"} />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((request) => {
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
                  className="bg-white rounded-2xl px-4 pt-4 pb-0 shadow-sm block"
                  data-testid="request-card"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${typeConf.bgClass} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${typeConf.iconClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                          {title}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {hasComments && (
                            <div className="relative">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#FFC600] rounded-full" />
                            </div>
                          )}
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusConf.badgeClass}`}
                          >
                            {statusConf.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        ID #{request.ticketNumber}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                          {typeConf.label}
                        </span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${priorityConf.className}`}>
                          {priorityConf.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 pb-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        Created
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5">
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
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#141414] rounded-full flex items-center justify-center shadow-lg z-30 hover:bg-black transition"
        data-testid="create-request-fab"
      >
        <Plus className="w-7 h-7 text-white" />
      </Link>

      <BottomNavigation />
    </main>
  );
}
