"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, FileText, User, LogOut, ChevronRight } from "lucide-react";
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

const NAV_ITEMS = [
  { href: "/employee", label: "Home", icon: Home },
  { href: "/employee/requests", label: "My Requests", icon: FileText },
  { href: "/employee/profile", label: "Profile", icon: User },
];

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
    if (href === "/employee") return pathname === "/employee";
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    close();
    await signOut();
    router.push("/employee/signin");
  };

  const user = session?.user;
  const initials = getInitials(user?.name, user?.email ?? "");
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "—";
  const email = user?.email ?? "";

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
        aria-label="Side menu"
      >
        {/* User info card */}
        <div className="mx-4 mt-10 mb-3 bg-white rounded-2xl px-5 py-5 shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)]">
          <div className="w-12 h-12 rounded-full bg-[#141414] flex items-center justify-center text-white text-base font-grotesk mb-3 select-none">
            {initials}
          </div>
          <p className="text-base text-gray-900 font-grotesk">{displayName}</p>
          <p className="text-sm text-gray-500 mt-0.5 font-techstack">{email}</p>
          <span className="mt-2 inline-block px-3 py-0.5 rounded-full bg-[#FFC600]/20 text-[#141414] text-xs uppercase tracking-wide font-grotesk">
            Member
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl mb-1 transition-all duration-150 ${
                  active
                    ? "bg-white shadow-[0_2px_8px_rgba(20,20,20,0.06)] text-[#141414]"
                    : "text-gray-600 hover:bg-white/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    active ? "bg-[#FFC600]/20" : "bg-transparent"
                  }`}>
                    <Icon className={`w-4 h-4 ${active ? "text-[#141414]" : "text-gray-500"}`} strokeWidth={1.5} />
                  </div>
                  <span className={`text-sm font-grotesk ${active ? "text-[#141414]" : "text-gray-600"}`}>
                    {label}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-opacity ${active ? "opacity-60" : "opacity-20"}`} />
              </Link>
            );
          })}
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
