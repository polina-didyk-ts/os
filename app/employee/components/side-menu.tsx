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
  { href: "/employee", label: "Головна", icon: Home },
  { href: "/employee/requests", label: "Мої запити", icon: FileText },
  { href: "/employee/profile", label: "Профіль", icon: User },
];

export function SideMenu() {
  const { isOpen, close } = useSideMenu();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Lock body scroll when open
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
        className={`fixed top-0 left-0 h-full w-72 bg-gray-50 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Бокове меню"
      >
        {/* User info */}
        <div className="px-5 pt-10 pb-5 border-b border-gray-200 bg-gray-50">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-base font-bold mb-3 select-none">
            {initials}
          </div>
          <p className="text-base font-bold text-gray-900">{displayName}</p>
          <p className="text-sm text-gray-500 mt-0.5">{email}</p>
          <span className="mt-2 inline-block px-3 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wide">
            Співробітник
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={`flex items-center justify-between px-5 py-4 transition-colors ${
                  active
                    ? "bg-blue-50 border-l-4 border-blue-600 text-blue-600"
                    : "border-l-4 border-transparent text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  <span className={`text-sm font-medium ${active ? "text-blue-600" : ""}`}>
                    {label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-5 py-6 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm font-medium">Вийти</span>
          </button>
        </div>
      </aside>
    </>
  );
}
