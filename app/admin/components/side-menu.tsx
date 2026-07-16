"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Megaphone, BarChart2, FileText, LogOut, Home, User, ChevronRight } from "lucide-react";
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

const HOLO = [
  "linear-gradient(135deg, #fde68a 0%, #fbbf24 32%, #f97316 65%, #ea580c 100%)",
  "linear-gradient(225deg, #fef08a 0%, #facc15 30%, #fb923c 65%, #ef4444 100%)",
  "linear-gradient(315deg, #fff7ed 0%, #fbbf24 28%, #f97316 62%, #dc2626 100%)",
  "linear-gradient(45deg,  #fef9c3 0%, #fde047 32%, #fb923c 65%, #f97316 100%)",
];

const NAV_ITEMS = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/requests", label: "Requests", icon: FileText },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/profile", label: "Profile", icon: User },
];

const COMING_SOON_ITEMS = [{ icon: BarChart2, label: "Analytics" }];

export function SideMenu() {
  const { isOpen, close } = useSideMenu();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    close();
    await signOut();
    router.push("/signin");
  };

  const user = session?.user;
  const initials = getInitials(user?.name, user?.email ?? "");
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "—";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "linear-gradient(160deg, rgba(255,251,240,0.97) 0%, rgba(255,237,210,0.96) 60%, rgba(255,228,196,0.95) 100%)",
          backdropFilter: "blur(24px)",
          boxShadow: "4px 0 40px rgba(20,20,20,0.12)",
        }}
      >
        {/* Aurora blobs inside drawer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-8 w-64 h-64 rounded-full bg-amber-400/50 blur-[60px]" />
          <div className="absolute top-1/3 -right-12 w-48 h-48 rounded-full bg-orange-300/40 blur-[50px]" />
          <div className="absolute bottom-16 -left-8 w-52 h-52 rounded-full bg-orange-400/40 blur-[55px]" />
          <div className="absolute bottom-1/3 left-1/4 w-36 h-36 rounded-full bg-yellow-300/35 blur-[45px]" />
        </div>

        {/* User info */}
        <div className="relative mx-4 mt-10 mb-3 bg-white/60 backdrop-blur-sm rounded-2xl px-5 py-5 border border-white/50 shadow-[0_4px_12px_rgba(20,20,20,0.06)]">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-grotesk mb-3 select-none relative overflow-hidden"
            style={{ background: HOLO[0] }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent" />
            <span className="relative z-10">{initials}</span>
          </div>
          <p className="text-base text-gray-900 font-grotesk">{displayName}</p>
          <p className="text-sm text-gray-500 mt-0.5 font-techstack">{user?.email ?? ""}</p>
          <span className="mt-2 inline-block px-3 py-0.5 rounded-full bg-amber-100/80 text-amber-700 text-xs uppercase tracking-wide border border-amber-200 font-grotesk">
            Office Manager
          </span>
        </div>

        {/* Nav items */}
        <nav className="relative flex-1 py-2 px-3 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }, idx) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl mb-1 transition-all duration-150 ${
                  active
                    ? "bg-white/70 backdrop-blur-sm shadow-[0_2px_8px_rgba(20,20,20,0.06)] border border-white/50"
                    : "hover:bg-white/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center relative overflow-hidden shrink-0"
                    style={{ background: active ? HOLO[idx % HOLO.length] : "transparent" }}
                  >
                    {active && (
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent" />
                    )}
                    <Icon
                      className={`w-4 h-4 relative z-10 ${active ? "text-white" : "text-gray-400"}`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className={`text-sm font-grotesk ${active ? "text-gray-900" : "text-gray-600"}`}>
                    {label}
                  </span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-opacity ${active ? "opacity-60" : "opacity-20"}`}
                />
              </Link>
            );
          })}

          {/* Coming soon */}
          {COMING_SOON_ITEMS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl mb-1"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gray-300" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-grotesk text-gray-300">{label}</span>
              </div>
              <span className="text-[10px] text-gray-300 border border-gray-200 rounded px-2 py-0.5 tracking-wide font-grotesk">
                SOON
              </span>
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div className="relative px-5 py-6 border-t border-white/40">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 text-red-400 hover:text-red-500 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm font-grotesk">Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
