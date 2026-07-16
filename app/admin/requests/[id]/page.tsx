"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, Clock, CircleDot, AlertTriangle } from "lucide-react";

type RequestType = "order" | "problem" | "question" | "idea";
type RequestStatus = "new" | "in_progress" | "completed" | "rejected";

interface AdminRequest {
  id: string;
  ticketNumber: string;
  type: RequestType;
  priority: string;
  status: RequestStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string };
}

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string };
}

const TYPE_LABEL: Record<RequestType, string> = {
  order: "ORDER", problem: "PROBLEM", question: "QUESTION", idea: "IDEA / FEEDBACK",
};

const STATUS_CONFIG: Record<RequestStatus, { label: string; badgeClass: string }> = {
  new:         { label: "NEW",         badgeClass: "bg-gray-100 text-gray-700" },
  in_progress: { label: "IN PROGRESS", badgeClass: "bg-yellow-100 text-yellow-700" },
  completed:   { label: "DONE",        badgeClass: "bg-green-100 text-green-700" },
  rejected:    { label: "REJECTED",    badgeClass: "bg-red-100 text-red-600" },
};

const PRIORITY_CONFIG: Record<string, { label: string; bgClass: string; textClass: string; icon: React.ElementType }> = {
  high:   { label: "HIGH PRIORITY",   bgClass: "bg-red-50/80",    textClass: "text-red-600",    icon: AlertTriangle },
  medium: { label: "MEDIUM PRIORITY", bgClass: "bg-amber-50/80",  textClass: "text-amber-600",  icon: AlertTriangle },
  low:    { label: "LOW PRIORITY",    bgClass: "bg-green-50/80",  textClass: "text-green-600",  icon: AlertTriangle },
};

const STEPPER_STEPS: { status: RequestStatus; label: string }[] = [
  { status: "new", label: "New" },
  { status: "in_progress", label: "In Progress" },
  { status: "completed", label: "Done" },
];

function getTitle(req: AdminRequest): string {
  const m = req.metadata as Record<string, string>;
  if (req.type === "order")    return m.what     ?? "Order";
  if (req.type === "problem")  return m.what     ?? "Problem";
  if (req.type === "question") return m.question ?? "Question";
  if (req.type === "idea")     return m.idea     ?? "Idea";
  return "Request";
}

function getDescription(req: AdminRequest): string | null {
  const m = req.metadata as Record<string, string>;
  return m.description ?? m.comment ?? null;
}

function getShortName(user: AdminRequest["user"]): string {
  if (user.name) {
    const parts = user.name.trim().split(/\s+/);
    return parts.length >= 2 ? `${parts[0]} ${parts[1][0]}.` : user.name;
  }
  return user.email.split("@")[0];
}

function getInitials(user: AdminRequest["user"]): string {
  if (user.name) {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return user.name.slice(0, 2).toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const date = d.toLocaleDateString("en-US", { day: "numeric", month: "long" });
  return `${time} • ${date}`;
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function getStepperIndex(status: RequestStatus): number {
  if (status === "rejected") return 1;
  return STEPPER_STEPS.findIndex((s) => s.status === status);
}

function Stepper({ status }: { status: RequestStatus }) {
  const currentIdx = getStepperIndex(status);
  const isRejected = status === "rejected";

  return (
    <div className="flex items-center gap-0">
      {STEPPER_STEPS.map((step, idx) => {
        const isDone = idx < currentIdx || (idx === currentIdx && !isRejected && status === "completed");
        const isActive = idx === currentIdx && !isRejected;
        const isPassedForRejected = isRejected && idx <= 1;
        const filled = isDone || isActive || isPassedForRejected;

        return (
          <div key={step.status} className="flex items-center">
            {idx > 0 && <div className={`h-0.5 w-8 ${filled ? "bg-amber-400" : "bg-gray-200"}`} />}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                  filled ? "border-transparent" : "bg-white/60 border-gray-200"
                }`}
                style={filled ? { background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)" } : {}}
              >
                {filled ? (
                  isActive && status === "in_progress" ? (
                    <Clock className="w-4 h-4 text-white" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )
                ) : (
                  <CircleDot className="w-4 h-4 text-gray-300" />
                )}
              </div>
              <span className={`text-[10px] font-grotesk ${filled ? "text-amber-600" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
          </div>
        );
      })}

      {isRejected && (
        <div className="flex items-center ml-0">
          <div className="h-0.5 w-8 bg-red-300" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 bg-red-500 border-red-500">
              <XCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-grotesk text-red-500">Rejected</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityLog({ req }: { req: AdminRequest }) {
  const events: { text: string; sub: string }[] = [
    { text: `${getShortName(req.user)} submitted a request`, sub: `${formatDateShort(req.createdAt)} • Via mobile app` },
  ];
  if (req.status !== "new") {
    const statusLabel = STATUS_CONFIG[req.status]?.label ?? req.status;
    events.push({ text: `Status changed to "${statusLabel}"`, sub: `${formatDateShort(req.updatedAt)} • Completion expected` });
  }
  return (
    <div className="flex flex-col gap-2">
      {events.map((e, i) => (
        <div key={i} className="bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border-l-4 border-amber-400/60 border border-white/40 shadow-[0_2px_8px_rgba(20,20,20,0.06)]">
          <p className="text-sm font-grotesk text-gray-900">{e.text}</p>
          <p className="text-xs text-gray-400 mt-0.5 font-techstack">{e.sub}</p>
        </div>
      ))}
    </div>
  );
}

function ActionButtons({ status, loading, onStatusChange }: { status: RequestStatus; loading: boolean; onStatusChange: (s: RequestStatus) => void }) {
  if (status === "completed" || status === "rejected") {
    return (
      <div className="px-4 py-3 bg-white/40 backdrop-blur-sm border border-white/40 rounded-2xl text-center text-sm text-gray-400 font-techstack">
        Request closed
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {status === "new" && (
        <button
          onClick={() => onStatusChange("in_progress")}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-grotesk flex items-center justify-center gap-2 disabled:opacity-60 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,115,22,0.3)] cursor-pointer"
          style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }}
        >
          <Clock className="w-5 h-5" />
          Take in progress
        </button>
      )}
      {status === "in_progress" && (
        <button
          onClick={() => onStatusChange("completed")}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-grotesk flex items-center justify-center gap-2 disabled:opacity-60 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,115,22,0.3)] cursor-pointer"
          style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }}
        >
          <CheckCircle2 className="w-5 h-5" />
          Mark as done
        </button>
      )}
      <button
        onClick={() => onStatusChange("rejected")}
        disabled={loading}
        className="w-full py-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 text-gray-600 font-grotesk flex items-center justify-center gap-2 disabled:opacity-60 transition hover:bg-white/60 cursor-pointer"
      >
        <XCircle className="w-5 h-5 text-red-400" />
        Reject
      </button>
    </div>
  );
}

export default function AdminRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [request, setRequest] = useState<AdminRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const fetchRequest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/requests?limit=200`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const found = (data.items as AdminRequest[]).find((r) => r.id === id);
      if (!found) throw new Error("not found");
      setRequest(found);
    } catch {
      setError("Failed to load request");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/requests/${id}/comments`);
      if (!res.ok) return;
      setComments(await res.json());
    } catch { /* non-blocking */ }
  }, [id]);

  useEffect(() => { fetchRequest(); fetchComments(); }, [fetchRequest, fetchComments]);

  const handleStatusChange = async (newStatus: RequestStatus) => {
    if (!request) return;
    setActionLoading(true);
    const comment = commentText.trim() || undefined;
    try {
      const res = await fetch(`/api/admin/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, comment }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setRequest((prev) => prev ? { ...prev, status: updated.status, updatedAt: updated.updatedAt } : prev);
      if (comment) {
        setComments((prev) => [...prev, { id: Date.now().toString(), text: comment, createdAt: new Date().toISOString(), author: { id: "", name: "You", email: "" } }]);
        setCommentText("");
      }
    } catch {
      setError("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

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
        <p className="text-gray-600 text-sm">{error ?? "Request not found"}</p>
        <button onClick={() => router.back()} className="text-amber-600 text-sm font-medium cursor-pointer">← Back</button>
      </main>
    );
  }

  const statusConf = STATUS_CONFIG[request.status];
  const priorityConf = PRIORITY_CONFIG[request.priority] ?? PRIORITY_CONFIG.low;
  const PriorityIcon = priorityConf.icon;
  const title = getTitle(request);
  const description = getDescription(request);

  return (
    <main className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-md sticky top-0 z-10 border-b border-white/30">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/60 rounded-lg transition cursor-pointer" aria-label="Back">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <p className="text-sm text-gray-900 font-grotesk">#{request.ticketNumber}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-grotesk">{TYPE_LABEL[request.type]}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusConf.badgeClass}`}>
          {statusConf.label}
        </span>
      </header>

      <div className="flex-1 pb-8 flex flex-col gap-4 px-4 pt-4">
        {/* Request card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-[0_4px_12px_rgba(20,20,20,0.06),0_1px_3px_rgba(20,20,20,0.04)] border border-white/40">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold select-none shrink-0 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                <span className="relative z-10">{getInitials(request.user)}</span>
              </div>
              <div>
                <p className="text-sm text-gray-900 font-grotesk">{getShortName(request.user)}</p>
                <p className="text-xs text-gray-400 font-techstack">{formatDateTime(request.createdAt)}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${priorityConf.bgClass} border border-white/40 shrink-0`}>
              <PriorityIcon className={`w-3.5 h-3.5 ${priorityConf.textClass}`} />
              <span className={`text-[10px] uppercase tracking-wide font-grotesk ${priorityConf.textClass}`}>{priorityConf.label}</span>
            </div>
          </div>
          <h1 className="text-lg text-gray-900 mb-2 font-grotesk">{title}</h1>
          {description && <p className="text-sm text-gray-600 leading-relaxed font-techstack">{description}</p>}
        </div>

        {/* Status stepper */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-[0_4px_12px_rgba(20,20,20,0.06)] border border-white/40">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4 font-grotesk">Status</p>
          <Stepper status={request.status} />
        </div>

        {/* Activity log */}
        <div>
          <p className="text-[10px] font-grotesk uppercase tracking-widest text-gray-400 mb-3">Activity Log</p>
          <ActivityLog req={request} />
        </div>

        {/* Comments */}
        <div>
          <p className="text-[10px] font-grotesk uppercase tracking-widest text-gray-400 mb-3">Manager Comments</p>

          {comments.length > 0 && (
            <div className="flex flex-col gap-2 mb-3">
              {comments.map((c) => (
                <div key={c.id} className="bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border-l-4 border-amber-400/60 border border-white/40 shadow-[0_2px_8px_rgba(20,20,20,0.06)]">
                  <p className="text-sm text-gray-900 font-techstack">{c.text}</p>
                  <p className="text-xs text-gray-400 mt-1 font-techstack">
                    {new Date(c.createdAt).toLocaleString("en-US", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[0_2px_8px_rgba(20,20,20,0.06)]">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a message to the employee (optional — sent with status change)..."
              rows={3}
              className="w-full text-sm text-gray-900 placeholder-gray-400 resize-none outline-none bg-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <ActionButtons status={request.status} loading={actionLoading} onStatusChange={handleStatusChange} />
      </div>
    </main>
  );
}
