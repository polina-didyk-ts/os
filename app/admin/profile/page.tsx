"use client";

import { Bell, Menu } from "lucide-react";
import { BottomNavigation, useSideMenu } from "../components";
import { useSession } from "@/src/lib/client";

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function AdminProfilePage() {
  const { toggle } = useSideMenu();
  const { data: session } = useSession();

  const user = session?.user;
  const initials = getInitials(user?.name, user?.email ?? "");
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "—";

  return (
    <main className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-md sticky top-0 z-10 border-b border-white/30">
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 hover:bg-white/60 rounded-lg transition cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <span className="text-lg font-grotesk text-gray-900">Digital Office</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/60 rounded-lg transition cursor-pointer" aria-label="Notifications">
            <Bell className="w-5 h-5 text-gray-700" />
          </button>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-grotesk select-none relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent" />
            <span className="relative z-10">{initials}</span>
          </div>
        </div>
      </header>

      {/* Profile */}
      <div className="flex-1 pb-28 flex flex-col items-center pt-16 px-4">
        {/* Avatar */}
        <div className="relative mb-5">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-white text-3xl font-bold select-none relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #fde68a 0%, #fbbf24 32%, #f97316 65%, #ea580c 100%)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent" />
            <span className="relative z-10">{initials}</span>
          </div>
          <div className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Name */}
        <h1 className="text-xl font-grotesk text-gray-900">{displayName}</h1>

        {/* Role badge */}
        <span className="mt-2 px-4 py-1 rounded-full bg-amber-100/80 text-amber-700 text-xs font-grotesk uppercase tracking-wide border border-amber-200">
          Office Manager
        </span>
      </div>

      <BottomNavigation />
    </main>
  );
}
