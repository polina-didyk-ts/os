"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Megaphone, BarChart2, LogOut } from "lucide-react";
import { useSession, signOut } from "@/src/lib/client";
import { useSideMenu } from "./side-menu-context";

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

const COMING_SOON_ITEMS = [
  { icon: BarChart2, label: "Analytics" },
];

export function SideMenu() {
  const { isOpen, close } = useSideMenu();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSignOut = async () => {
    close();
    await signOut();
    router.push("/signin");
  };

  const user        = session?.user;
  const initials    = getInitials(user?.name, user?.email ?? "");
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "—";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* User info */}
        <div className="px-5 pt-10 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-[#141414] flex items-center justify-center text-white text-sm font-bold select-none shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email ?? ""}</p>
            </div>
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#141414] text-white text-xs font-semibold uppercase tracking-wide">
            Office Manager
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-5">
          {/* Announcements */}
          <Link
            href="/admin/announcements"
            onClick={close}
            className="flex items-center gap-3 py-4 border-b border-gray-100 text-gray-700 hover:text-gray-900 transition"
          >
            <Megaphone className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm font-medium">Announcements</span>
          </Link>

          {/* Coming soon items */}
          {COMING_SOON_ITEMS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3 text-gray-400">
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-2 py-0.5 tracking-wide">
                SOON
              </span>
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-5 py-6 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
