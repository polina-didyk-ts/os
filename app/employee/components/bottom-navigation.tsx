"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, User } from "lucide-react";

const HOLO = [
  "linear-gradient(135deg, #fde68a 0%, #fbbf24 32%, #f97316 65%, #ea580c 100%)",
  "linear-gradient(225deg, #fef08a 0%, #facc15 30%, #fb923c 65%, #ef4444 100%)",
  "linear-gradient(315deg, #fff7ed 0%, #fbbf24 28%, #f97316 62%, #dc2626 100%)",
];

const NAV_ITEMS = [
  { path: "/employee", label: "Home", icon: Home },
  { path: "/employee/requests", label: "Requests", icon: FileText },
  { path: "/employee/profile", label: "Profile", icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/employee" && pathname === "/employee") return true;
    if (path !== "/employee" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/28 backdrop-blur-xl border-t border-white/15 px-4 py-1 flex justify-around z-40 lg:hidden">
      {NAV_ITEMS.map(({ path, label, icon: Icon }, idx) => {
        const active = isActive(path);
        return (
          <Link
            key={path}
            href={path}
            className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all duration-150 ${
              active
                ? "bg-white/35 backdrop-blur-xl shadow-[0_2px_8px_rgba(20,20,20,0.06)] border border-white/25"
                : "hover:bg-white/20"
            }`}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center relative overflow-hidden"
              style={{ background: active ? HOLO[idx % HOLO.length] : "transparent" }}
            >
              {active && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent" />
              )}
              <Icon
                className={`w-3.5 h-3.5 relative z-10 ${active ? "text-white" : "text-gray-500"}`}
                strokeWidth={1.5}
              />
            </div>
            <span className={`text-[10px] font-grotesk ${active ? "text-gray-900" : "text-gray-500"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
