"use client";

import { useEffect, useState, useCallback } from "react";
import { Menu, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/src/lib/client";
import { useSideMenu } from "./side-menu-context";

function getInitial(name: string | null | undefined, email: string): string {
  if (name) return name.trim()[0].toUpperCase();
  return email[0].toUpperCase();
}

export function EmployeeHeader() {
  const { toggle } = useSideMenu();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(() => {
    fetch("/api/employee/announcements/unread-count")
      .then((r) => r.json())
      .then((data) => setUnreadCount(data.count ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread, pathname]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchUnread();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchUnread]);

  const user = session?.user;
  const initial = getInitial(user?.name, user?.email ?? "");

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-white/30 bg-white/60 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <span className="text-lg text-gray-800 font-grotesk">Digital Office</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/employee/announcements"
          className="relative p-2 rounded-xl transition-all duration-200 hover:bg-amber-50/70 group"
          aria-label="Announcements"
        >
          <Bell
            className="w-6 h-6 transition-colors duration-200 text-amber-500 group-hover:text-amber-600"
            strokeWidth={1.5}
            style={{ filter: "drop-shadow(0 1px 3px rgba(251,191,36,0.5))" }}
          />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[9px] font-bold text-white leading-none shadow-[0_2px_6px_rgba(249,115,22,0.4)]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {user?.image ? (
          <img
            src={user.image}
            alt={user.name ?? ""}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-grotesk select-none relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 60%, #ea580c 100%)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent" />
            <span className="relative z-10 text-sm">{initial}</span>
          </div>
        )}
      </div>
    </header>
  );
}
