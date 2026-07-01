"use client";

import { ShoppingCart, Search, Mail, Lightbulb, LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

function QuickActionCard({ icon: Icon, title, description, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-[#FAF8F5] rounded-xl p-3.5 flex flex-col gap-2.5 text-left cursor-pointer transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:shadow-[0_4px_12px_rgba(20,20,20,0.08)] hover:-translate-y-0.5"
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: "linear-gradient(135deg, #FFC600, #FFB800)",
          boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Icon className="w-4 h-4 text-white" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm text-gray-900 font-grotesk leading-tight">{title}</p>
        <p className="text-xs text-gray-400 font-techstack leading-snug mt-0.5 line-clamp-2">{description}</p>
      </div>
    </button>
  );
}

interface QuickActionsProps {
  onRequestTypeClick: (typeId: string) => void;
}

export function QuickActions({ onRequestTypeClick }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)] px-5 py-5">
      <h2 className="text-base font-grotesk text-gray-900">Quick actions</h2>
      <p className="text-xs font-techstack text-gray-400 mt-0.5 mb-4">
        Submit a request or report an issue.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <QuickActionCard
          icon={ShoppingCart}
          title="Order"
          description="Stationery, food, equipment"
          onClick={() => onRequestTypeClick("order")}
        />
        <QuickActionCard
          icon={Search}
          title="Problem"
          description="Something is broken or not working"
          onClick={() => onRequestTypeClick("problem")}
        />
        <QuickActionCard
          icon={Mail}
          title="Question"
          description="Ask the office manager"
          onClick={() => onRequestTypeClick("question")}
        />
        <QuickActionCard
          icon={Lightbulb}
          title="Idea / Feedback"
          description="Share your ideas and feedback"
          onClick={() => onRequestTypeClick("idea")}
        />
      </div>
    </div>
  );
}
