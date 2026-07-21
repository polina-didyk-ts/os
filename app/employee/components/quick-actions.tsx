"use client";

import { Package, Zap, MessageCircle, Sparkles, LucideIcon } from "lucide-react";

const HOLO: string[] = [
  "linear-gradient(135deg, #fde68a 0%, #fbbf24 32%, #f97316 65%, #ea580c 100%)",
  "linear-gradient(225deg, #fef08a 0%, #facc15 30%, #fb923c 65%, #ef4444 100%)",
  "linear-gradient(315deg, #fff7ed 0%, #fbbf24 28%, #f97316 62%, #dc2626 100%)",
  "linear-gradient(45deg,  #fef9c3 0%, #fde047 32%, #fb923c 65%, #f97316 100%)",
];

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  holoIndex: number;
  onClick?: () => void;
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  holoIndex,
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white/15 backdrop-blur-md rounded-xl p-3.5 flex flex-col gap-2.5 text-left cursor-pointer transition-all duration-200 border border-white/18 hover:border-white/35 hover:bg-white/28 hover:shadow-[0_6px_20px_rgba(20,20,20,0.10)] hover:-translate-y-0.5"
    >
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
        style={{ background: HOLO[holoIndex] }}
      >
        {/* sheen overlay — simulates holographic foil reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent" />
        <Icon className="w-5 h-5 text-white relative z-10 drop-shadow-sm" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm text-gray-900 font-grotesk leading-tight">{title}</p>
        <p className="text-xs text-gray-400 font-techstack leading-snug mt-0.5 line-clamp-2">
          {description}
        </p>
      </div>
    </button>
  );
}

interface QuickActionsProps {
  onRequestTypeClick: (typeId: string) => void;
}

export function QuickActions({ onRequestTypeClick }: QuickActionsProps) {
  return (
    <div className="bg-white/28 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(20,20,20,0.11),inset_0_1px_0_rgba(255,255,255,0.55)] border border-white/15 px-5 py-5">
      <h2 className="text-base font-grotesk text-gray-900">Quick actions</h2>
      <p className="text-xs font-techstack text-gray-400 mt-0.5 mb-4">
        Submit a request or report an issue.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <QuickActionCard
          icon={Package}
          title="Order"
          description="Stationery, food, equipment"
          holoIndex={0}
          onClick={() => onRequestTypeClick("order")}
        />
        <QuickActionCard
          icon={Zap}
          title="Problem"
          description="Something is broken or not working"
          holoIndex={1}
          onClick={() => onRequestTypeClick("problem")}
        />
        <QuickActionCard
          icon={MessageCircle}
          title="Question"
          description="Ask the office manager"
          holoIndex={2}
          onClick={() => onRequestTypeClick("question")}
        />
        <QuickActionCard
          icon={Sparkles}
          title="Idea / Feedback"
          description="Share your ideas and feedback"
          holoIndex={3}
          onClick={() => onRequestTypeClick("idea")}
        />
      </div>
    </div>
  );
}
