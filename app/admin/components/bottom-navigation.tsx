"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, User } from "lucide-react";

const NAV_ITEMS = [
  { path: "/admin", label: "HOME", icon: Home },
  { path: "/admin/requests", label: "REQUESTS", icon: FileText },
  { path: "/admin/profile", label: "PROFILE", icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-md border-t border-white/30 px-4 py-2 flex justify-around z-40">
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
        const active = isActive(path);
        return (
          <Link
            key={path}
            href={path}
            className={`flex flex-col items-center gap-1 py-2 px-5 rounded-xl transition ${
              active ? "text-white" : "text-gray-500 hover:text-gray-800"
            }`}
            style={
              active
                ? { background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }
                : {}
            }
          >
            <Icon className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] tracking-wide font-grotesk">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
