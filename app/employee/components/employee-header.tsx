"use client";

import { useEffect, useState } from "react";
import { Menu, Bell } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/src/lib/client";
import { useSideMenu } from "./side-menu-context";

function getInitial(name: string | null | undefined, email: string): string {
  if (name) return name.trim()[0].toUpperCase();
  return email[0].toUpperCase();
}

export function EmployeeHeader() {
  const { toggle } = useSideMenu();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/employee/announcements/unread-count")
      .then((r) => r.json())
      .then((data) => setUnreadCount(data.count ?? 0))
      .catch(() => {});
  }, []);

  const user = session?.user;
  const initial = getInitial(user?.name, user?.email ?? "");

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <span className="text-lg font-semibold text-gray-800">Digital Office</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/employee/announcements"
          className="relative p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Announcements"
        >
          <Bell className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-[#FFC600] text-[#141414] text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="w-10 h-10 rounded-full bg-[#141414] flex items-center justify-center text-white font-semibold select-none">
          {initial}
        </div>
      </div>
    </header>
  );
}
