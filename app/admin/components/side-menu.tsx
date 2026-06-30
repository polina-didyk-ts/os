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
        className={`fixed top-0 left-0 h-full w-72 bg-[#FAF8F5] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* User info */}
        <div className="mx-4 mt-10 mb-3 bg-white rounded-2xl px-5 py-5 shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)]">
          <div className="w-12 h-12 rounded-full bg-[#141414] flex items-center justify-center text-white text-base font-grotesk mb-3 select-none">
            {initials}
          </div>
          <p className="text-base text-gray-900 font-grotesk">{displayName}</p>
          <p className="text-sm text-gray-500 mt-0.5 font-techstack">{user?.email ?? ""}</p>
          <span className="mt-2 inline-block px-3 py-0.5 rounded-full bg-[#141414] text-white text-xs uppercase tracking-wide font-grotesk">
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
            <span className="text-sm font-grotesk">Announcements</span>
          </Link>

          {/* Coming soon items */}
          {COMING_SOON_ITEMS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3 text-gray-400">
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm font-grotesk">{label}</span>
              </div>
              <span className="text-[10px] text-gray-400 border border-gray-100 rounded px-2 py-0.5 tracking-wide font-grotesk">
                SOON
              </span>
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-5 py-6 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 text-red-500 hover:text-red-600 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm font-grotesk">Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
