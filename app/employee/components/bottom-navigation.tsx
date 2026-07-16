"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, User } from "lucide-react";

export function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/employee" && pathname === "/employee") return true;
    if (path !== "/employee" && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: "/employee", label: "HOME", icon: Home },
    { path: "/employee/requests", label: "REQUESTS", icon: FileText },
    { path: "/employee/profile", label: "PROFILE", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-md border-t border-white/30 px-4 py-2 flex justify-around z-40">
      {navItems.map(({ path, label, icon: Icon }) => {
        const active = isActive(path);
        return (
          <Link
            key={path}
            href={path}
            className={`flex flex-col items-center gap-1 py-3 px-6 rounded-lg transition ${
              active ? "text-[#141414] bg-[#FFC600]/20" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon className="w-6 h-6" strokeWidth={1.5} />
            <span className="text-xs font-grotesk">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
