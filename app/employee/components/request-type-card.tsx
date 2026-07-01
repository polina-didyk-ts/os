"use client";

import { LucideIcon } from "lucide-react";
import { ShoppingCart, Search, Mail, Lightbulb } from "lucide-react";

interface RequestTypeCardProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  ShoppingCart,
  Search,
  Mail,
  Lightbulb,
};

const ICON_GRADIENTS: Record<string, string> = {
  ShoppingCart: "linear-gradient(135deg, #FFC600, #FFB800)",
  Search: "linear-gradient(135deg, #FFC600, #FFB800)",
  Mail: "linear-gradient(135deg, #FFC600, #FFB800)",
  Lightbulb: "linear-gradient(135deg, #FFC600, #FFB800)",
};

export function RequestTypeCard({ icon, title, description, onClick }: RequestTypeCardProps) {
  const Icon = iconMap[icon];
  const gradient = ICON_GRADIENTS[icon];

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-4 flex flex-col gap-3 text-left cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)] hover:shadow-[0_8px_24px_rgba(20,20,20,0.12),0_2px_6px_rgba(20,20,20,0.08)] hover:-translate-y-0.5"
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: gradient,
          boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {Icon && <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />}
      </div>
      <div>
        <h3 className="text-sm md:text-base text-gray-900 font-grotesk leading-tight">{title}</h3>
        <p className="text-xs text-gray-500 font-techstack leading-tight mt-0.5">{description}</p>
      </div>
    </button>
  );
}
