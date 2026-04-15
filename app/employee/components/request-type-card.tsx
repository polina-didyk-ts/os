"use client";

import { LucideIcon } from "lucide-react";
import {
  ShoppingCart,
  Search,
  Mail,
  Lightbulb,
} from "lucide-react";

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

export function RequestTypeCard({
  icon,
  title,
  description,
  onClick,
}: RequestTypeCardProps) {
  const Icon = iconMap[icon];

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-6 border-l-4 border-blue-600 shadow-sm hover:shadow-md transition text-left"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
          {Icon && <Icon className="w-7 h-7 text-blue-600" strokeWidth={1.5} />}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}
