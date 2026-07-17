"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, FileText, User, LogOut, ChevronRight, BookOpen, Bell } from "lucide-react";
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
  { href: "/employee/articles", label: "Articles", icon: BookOpen },
  { href: "/employee/announcements", label: "Announcements", icon: Bell },
  { href: "/employee/profile", label: "Profile", icon: User },
];

const HOLO = [
  "linear-gradient(135deg, #fde68a 0%, #fbbf24 32%, #f97316 65%, #ea580c 100%)",
  "linear-gradient(225deg, #fef08a 0%, #facc15 30%, #fb923c 65%, #ef4444 100%)",
  "linear-gradient(315deg, #fff7ed 0%, #fbbf24 28%, #f97316 62%, #dc2626 100%)",
];

const SIDEBAR_BG = {
  background:
    "linear-gradient(160deg, rgba(255,251,240,0.97) 0%, rgba(255,237,210,0.96) 60%, rgba(255,228,196,0.95) 100%)",
  backdropFilter: "blur(24px)",
  boxShadow: "4px 0 40px rgba(20,20,20,0.08)",
};

function UserAvatar({
  image,
  name,
  initials,
  size,
  title,
}: {
  image?: string | null;
  name?: string | null;
  initials: string;
  size: "sm" | "lg";
  title?: string;
}) {
  const imgCls =
    size === "lg"
      ? "w-12 h-12 rounded-full object-cover mb-3"
      : "w-7 h-7 rounded-full object-cover shrink-0";
  const initCls =
    size === "lg"
      ? "w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-grotesk mb-3 select-none relative overflow-hidden"
      : "w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-grotesk relative overflow-hidden shrink-0";

  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt={name ?? ""} className={imgCls} title={title} />
  ) : (
    <div className={initCls} style={{ background: HOLO[0] }} title={title}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent" />
      <span className="relative z-10">{initials}</span>
    </div>
  );
}

function AuroraBlobs({ rounded = false }: { rounded?: boolean }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${rounded ? "rounded-r-3xl" : ""}`}
    >
      <div className="absolute -top-16 -right-8 w-64 h-64 rounded-full bg-amber-400/50 blur-[60px]" />
      <div className="absolute top-1/3 -right-12 w-48 h-48 rounded-full bg-orange-300/40 blur-[50px]" />
      <div className="absolute bottom-16 -left-8 w-52 h-52 rounded-full bg-orange-400/40 blur-[55px]" />
      <div className="absolute bottom-1/3 left-1/4 w-36 h-36 rounded-full bg-yellow-300/35 blur-[45px]" />
    </div>
  );
}

export function SideMenu() {
  const { isOpen, close, isCollapsed } = useSideMenu();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const user = session?.user;
  const initials = getInitials(user?.name, user?.email ?? "");
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "—";
  const email = user?.email ?? "";

  const isActive = (href: string) => {
    if (href === "/employee") return pathname === "/employee";
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    close();
    await signOut();
    router.push("/employee/signin");
  };

  return (
    <>
      {/* ─────────────── DESKTOP SIDEBAR ─────────────── */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full z-30 transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? "w-16" : "w-64"
        }`}
        style={SIDEBAR_BG}
        aria-label="Main navigation"
      >
        <AuroraBlobs />

        {/* Logo */}
        <div
          className={`relative flex items-center gap-3 border-b border-white/30 py-[17px] ${
            isCollapsed ? "px-4 justify-center" : "px-5"
          }`}
        >
          <div
            className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-grotesk font-semibold"
            style={{
              background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)",
            }}
          >
            DO
          </div>
          {!isCollapsed && (
            <span className="text-gray-900 font-grotesk font-medium whitespace-nowrap overflow-hidden">
              Digital Office
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="relative flex-1 py-3 px-2.5 overflow-y-auto">
          <div className="space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }, idx) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={isCollapsed ? label : undefined}
                  className={`flex items-center gap-3 rounded-xl transition-all duration-150 ${
                    isCollapsed ? "px-2 py-3 justify-center" : "px-3 py-3"
                  } ${
                    active
                      ? "bg-white/70 backdrop-blur-sm shadow-[0_2px_8px_rgba(20,20,20,0.06)] border border-white/50"
                      : "hover:bg-white/50"
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center relative overflow-hidden shrink-0"
                    style={{ background: active ? HOLO[idx % HOLO.length] : "transparent" }}
                  >
                    {active && (
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent" />
                    )}
                    <Icon
                      className={`w-4 h-4 relative z-10 ${active ? "text-white" : "text-gray-500"}`}
                      strokeWidth={1.5}
                    />
                  </div>
                  {!isCollapsed && (
                    <span
                      className={`text-sm font-grotesk flex-1 whitespace-nowrap overflow-hidden ${
                        active ? "text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User + sign out */}
        <div
          className={`relative border-t border-white/40 py-4 ${
            isCollapsed ? "flex flex-col items-center gap-3 px-2" : "px-4 space-y-2"
          }`}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 mb-1">
              <UserAvatar image={user?.image} name={user?.name} initials={initials} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-grotesk text-gray-800 truncate">{displayName}</p>
                <p className="text-[10px] font-techstack text-gray-500 truncate">{email}</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <UserAvatar
              image={user?.image}
              name={user?.name}
              initials={initials}
              size="sm"
              title={displayName}
            />
          )}
          <button
            onClick={handleSignOut}
            title={isCollapsed ? "Sign out" : undefined}
            className={`flex items-center gap-2 text-red-400 hover:text-red-500 cursor-pointer transition-colors ${
              isCollapsed ? "" : "px-0"
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            {!isCollapsed && <span className="text-sm font-grotesk">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ─────────────── MOBILE BACKDROP ─────────────── */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* ─────────────── MOBILE DRAWER ─────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={SIDEBAR_BG}
        aria-label="Side menu"
      >
        <AuroraBlobs rounded />

        {/* User info card */}
        <div className="relative mx-4 mt-10 mb-3 bg-white/60 backdrop-blur-sm rounded-2xl px-5 py-5 border border-white/50 shadow-[0_4px_12px_rgba(20,20,20,0.06)]">
          <UserAvatar image={user?.image} name={user?.name} initials={initials} size="lg" />
          <p className="text-base text-gray-900 font-grotesk">{displayName}</p>
          <p className="text-sm text-gray-500 mt-0.5 font-techstack">{email}</p>
          <span className="mt-2 inline-block px-3 py-0.5 rounded-full bg-white/50 backdrop-blur-sm text-gray-600 text-xs uppercase tracking-wide border border-white/60 font-grotesk">
            Member
          </span>
        </div>

        {/* Nav */}
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
                  <span
                    className={`text-sm font-grotesk ${active ? "text-gray-900" : "text-gray-600"}`}
                  >
                    {label}
                  </span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-opacity ${active ? "opacity-60" : "opacity-20"}`}
                />
              </Link>
            );
          })}
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
