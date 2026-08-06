"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Wrench, MessageSquare, Lightbulb } from "lucide-react";
import { EmployeeHeader, BottomNavigation } from "../../components";

// ── types ──────────────────────────────────────────────────────────────────

type RequestType = "order" | "problem" | "question" | "idea";
type RequestStatus = "new" | "in_progress" | "completed" | "rejected";

interface Request {
  id: string;
  ticketNumber: string;
  type: RequestType;
  priority: string;
  status: RequestStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string };
}

// ── config ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RequestStatus, { label: string; badgeClass: string }> = {
  new: {
    label: "NEW",
    badgeClass: "bg-white/40 backdrop-blur-sm text-gray-600 border border-white/30",
  },
  in_progress: {
    label: "IN PROGRESS",
    badgeClass: "bg-amber-100/80 backdrop-blur-sm text-amber-700 border border-amber-200/60",
  },
  completed: {
    label: "DONE",
    badgeClass: "bg-green-100/80 backdrop-blur-sm text-green-700 border border-green-200/60",
  },
  rejected: {
    label: "REJECTED",
    badgeClass: "bg-red-100/80 backdrop-blur-sm text-red-600 border border-red-200/60",
  },
};

const TYPE_CONFIG: Record<
  RequestType,
  { icon: React.ElementType; gradientFrom: string; gradientTo: string; label: string }
> = {
  order: {
    icon: ShoppingCart,
    gradientFrom: "#fbbf24",
    gradientTo: "#f97316",
    label: "ORDER",
  },
  problem: {
    icon: Wrench,
    gradientFrom: "#fb7185",
    gradientTo: "#f43f5e",
    label: "PROBLEM",
  },
  question: {
    icon: MessageSquare,
    gradientFrom: "#94a3b8",
    gradientTo: "#64748b",
    label: "QUESTION",
  },
  idea: {
    icon: Lightbulb,
    gradientFrom: "#fb923c",
    gradientTo: "#ea580c",
    label: "IDEA / FEEDBACK",
  },
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

// ── helpers ────────────────────────────────────────────────────────────────

function getTitle(req: Request): string {
  const m = req.metadata as Record<string, string>;
  if (req.type === "order") return m.what ?? "Order";
  if (req.type === "problem") return m.what ?? "Problem";
  if (req.type === "question") return m.question ?? "Question";
  if (req.type === "idea") return m.idea ?? "Idea";
  return "Request";
}

function getDescription(req: Request): string | null {
  const m = req.metadata as Record<string, string>;
  return m.description ?? m.comment ?? null;
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── page ───────────────────────────────────────────────────────────────────

export default function EmployeeRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [request, setRequest] = useState<Request | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqRes, comRes] = await Promise.all([
        fetch(`/api/requests/${id}`),
        fetch(`/api/requests/${id}/comments`),
      ]);
      if (!reqRes.ok) throw new Error("not found");
      setRequest(await reqRes.json());
      if (comRes.ok) setComments(await comRes.json());
    } catch {
      setError("Failed to load request");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent" />
      </main>
    );
  }

  if (error || !request) {
    return (
      <main className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-600 font-techstack text-sm">{error ?? "Request not found"}</p>
        <button
          onClick={() => router.back()}
          className="text-amber-600 text-sm font-grotesk underline"
        >
          ← Back
        </button>
      </main>
    );
  }

  const statusConf = STATUS_CONFIG[request.status];
  const typeConf = TYPE_CONFIG[request.type];
  const Icon = typeConf.icon;
  const title = getTitle(request);
  const description = getDescription(request);

  return (
    <main className="min-h-screen bg-transparent flex flex-col">
      <EmployeeHeader />

      {/* Sticky header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-md sticky top-0 z-10 border-b border-white/30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/60 rounded-lg transition cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <p className="text-sm text-gray-900 font-grotesk">#{request.ticketNumber}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-grotesk">
              {typeConf.label}
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-grotesk uppercase tracking-widest px-3 py-1 rounded-full ${statusConf.badgeClass}`}>
          {statusConf.label}
        </span>
      </header>

      <div className="flex-1 pb-32 flex flex-col gap-4 px-4 pt-5 max-w-2xl mx-auto w-full">

        {/* Request card */}
        <div className="bg-white/28 backdrop-blur-xl rounded-2xl border border-white/15 shadow-[0_8px_32px_rgba(20,20,20,0.11),inset_0_1px_0_rgba(255,255,255,0.55)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${typeConf.gradientFrom}, ${typeConf.gradientTo})` }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-grotesk">
                {typeConf.label}
              </p>
              <p className="text-xs text-gray-400 font-techstack">{formatDateTime(request.createdAt)}</p>
            </div>
          </div>

          <h1 className="text-lg text-gray-900 mb-2 font-grotesk">{title}</h1>

          {description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-4 font-techstack">
              {description}
            </p>
          )}

          <div className="flex items-center gap-6 pt-4 border-t border-white/40">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-grotesk mb-0.5">
                Priority
              </p>
              <p className="text-sm text-gray-800 font-techstack">
                {PRIORITY_LABEL[request.priority] ?? request.priority}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-grotesk mb-0.5">
                Updated
              </p>
              <p className="text-sm text-gray-800 font-techstack">
                {formatDateTime(request.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Activity log */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-grotesk px-1">
            Activity Log
          </p>
          <div className="flex flex-col gap-2">
            <div className="bg-white/28 backdrop-blur-xl rounded-xl border border-white/15 shadow-[0_4px_16px_rgba(20,20,20,0.07),inset_0_1px_0_rgba(255,255,255,0.5)] px-4 py-3 border-l-4"
              style={{ borderLeftColor: "#fbbf24" }}>
              <p className="text-sm text-gray-900 font-grotesk">You submitted a request</p>
              <p className="text-xs text-gray-400 mt-0.5 font-techstack">
                {formatDateTime(request.createdAt)}
              </p>
            </div>
            {request.status !== "new" && (
              <div className="bg-white/28 backdrop-blur-xl rounded-xl border border-white/15 shadow-[0_4px_16px_rgba(20,20,20,0.07),inset_0_1px_0_rgba(255,255,255,0.5)] px-4 py-3 border-l-4"
                style={{ borderLeftColor: "#fbbf24" }}>
                <p className="text-sm text-gray-900 font-grotesk">
                  Status changed to &ldquo;{statusConf.label}&rdquo;
                </p>
                <p className="text-xs text-gray-400 mt-0.5 font-techstack">
                  {formatDateTime(request.updatedAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Manager comments */}
        {comments.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-grotesk px-1">
              Manager Comment
            </p>
            <div className="flex flex-col gap-2">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-white/28 backdrop-blur-xl rounded-xl border border-white/15 shadow-[0_4px_16px_rgba(20,20,20,0.07),inset_0_1px_0_rgba(255,255,255,0.5)] px-4 py-3 border-l-4"
                  style={{ borderLeftColor: "#f97316" }}
                >
                  <p className="text-sm text-gray-900 font-techstack leading-relaxed">{c.text}</p>
                  <p className="text-xs text-gray-400 mt-1.5 font-techstack">
                    {formatDateTime(c.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </main>
  );
}
