"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Wrench, MessageSquare, Lightbulb } from "lucide-react";

// ── types ──────────────────────────────────────────────────────────────────

type RequestType   = "order" | "problem" | "question" | "idea";
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
  new:         { label: "NEW",         badgeClass: "bg-gray-100 text-gray-700"      },
  in_progress: { label: "IN PROGRESS", badgeClass: "bg-yellow-100 text-yellow-700"  },
  completed:   { label: "DONE",        badgeClass: "bg-green-100 text-green-700"    },
  rejected:    { label: "REJECTED",    badgeClass: "bg-red-100 text-red-600"        },
};

const TYPE_CONFIG: Record<RequestType, {
  icon: React.ElementType; bgClass: string; iconClass: string; label: string;
}> = {
  order:    { icon: ShoppingCart,  bgClass: "bg-[#FFC600]/15", iconClass: "text-[#141414]", label: "ORDER"           },
  problem:  { icon: Wrench,        bgClass: "bg-pink-100",   iconClass: "text-pink-500",   label: "PROBLEM"         },
  question: { icon: MessageSquare, bgClass: "bg-gray-100",   iconClass: "text-gray-600",   label: "QUESTION"        },
  idea:     { icon: Lightbulb,     bgClass: "bg-orange-100", iconClass: "text-orange-400", label: "IDEA / FEEDBACK" },
};

const PRIORITY_LABEL: Record<string, string> = {
  high:   "High",
  medium: "Medium",
  low:    "Low",
};

// ── helpers ────────────────────────────────────────────────────────────────

function getTitle(req: Request): string {
  const m = req.metadata as Record<string, string>;
  if (req.type === "order")    return m.what     ?? "Order";
  if (req.type === "problem")  return m.what     ?? "Problem";
  if (req.type === "question") return m.question ?? "Question";
  if (req.type === "idea")     return m.idea     ?? "Idea";
  return "Request";
}

function getDescription(req: Request): string | null {
  const m = req.metadata as Record<string, string>;
  return m.description ?? m.comment ?? null;
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });
}

// ── page ───────────────────────────────────────────────────────────────────

export default function EmployeeRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [request,  setRequest]  = useState<Request | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

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

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#141414] border-t-transparent" />
      </main>
    );
  }

  if (error || !request) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-600 text-sm">{error ?? "Request not found"}</p>
        <button onClick={() => router.back()} className="text-[#141414] text-sm font-medium">← Back</button>
      </main>
    );
  }

  const statusConf = STATUS_CONFIG[request.status];
  const typeConf   = TYPE_CONFIG[request.type];
  const Icon       = typeConf.icon;
  const title      = getTitle(request);
  const description = getDescription(request);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <p className="text-sm text-gray-900 font-grotesk">#{request.ticketNumber}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-grotesk">{typeConf.label}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusConf.badgeClass}`}>
          {statusConf.label}
        </span>
      </header>

      <div className="flex-1 pb-8 flex flex-col gap-4 px-4 pt-4">
        {/* Request card */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl ${typeConf.bgClass} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${typeConf.iconClass}`} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-grotesk">{typeConf.label}</p>
              <p className="text-xs text-gray-400">{formatDateTime(request.createdAt)}</p>
            </div>
          </div>

          <h1 className="text-lg text-gray-900 mb-2 font-grotesk">{title}</h1>

          {description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-3 font-techstack">{description}</p>
          )}

          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-400 font-grotesk">Priority</p>
              <p className="text-sm text-gray-800 mt-0.5 font-techstack">
                {PRIORITY_LABEL[request.priority] ?? request.priority}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-400 font-grotesk">Updated</p>
              <p className="text-sm text-gray-800 mt-0.5 font-techstack">{formatDateTime(request.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-grotesk">
            Activity Log
          </p>
          <div className="flex flex-col gap-2">
            <div className="bg-white rounded-xl px-4 py-3 border-l-4 border-[#FFC600]/60">
              <p className="text-sm text-gray-900 font-grotesk">You submitted a request</p>
              <p className="text-xs text-gray-400 mt-0.5 font-techstack">{formatDateTime(request.createdAt)}</p>
            </div>
            {request.status !== "new" && (
              <div className="bg-white rounded-xl px-4 py-3 border-l-4 border-[#FFC600]/60">
                <p className="text-sm text-gray-900 font-grotesk">
                  Status changed to &ldquo;{statusConf.label}&rdquo;
                </p>
                <p className="text-xs text-gray-400 mt-0.5 font-techstack">{formatDateTime(request.updatedAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Manager comments */}
        {comments.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-grotesk">
              Manager Comment
            </p>
            <div className="flex flex-col gap-2">
              {comments.map((c) => (
                <div key={c.id} className="bg-white rounded-xl px-4 py-3 border-l-4 border-[#FFC600]/60">
                  <p className="text-sm text-gray-900 font-techstack">{c.text}</p>
                  <p className="text-xs text-gray-400 mt-1 font-techstack">{formatDateTime(c.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
