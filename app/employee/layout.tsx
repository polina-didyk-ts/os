"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/src/lib/client";
import { SideMenuProvider, SideMenu, useSideMenu } from "./components";

function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSideMenu();
  return (
    <div
      className={`transition-all duration-300 ease-in-out ${isCollapsed ? "lg:pl-16" : "lg:pl-64"}`}
    >
      {children}
    </div>
  );
}

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const isSigningOut = useRef(false);

  const isAuthPage = pathname === "/employee/signin";

  useEffect(() => {
    if (isAuthPage) return;
    if (!isPending && !session && !isSigningOut.current) {
      router.push(`/employee/signin?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [session, isPending, router, isAuthPage, pathname]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isPending) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f9f7ff]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-400 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SideMenuProvider>
      {/* Aurora mesh background — fixed, behind all content */}
      <div className="fixed inset-0 -z-10 bg-[#fffdf7] overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-0 w-[750px] h-[750px] rounded-full bg-amber-300/40 blur-[110px]" />
        <div className="absolute top-1/4 -left-40 w-[650px] h-[650px] rounded-full bg-orange-300/35 blur-[95px]" />
        <div className="absolute bottom-10 right-1/3 w-[550px] h-[550px] rounded-full bg-yellow-300/38 blur-[95px]" />
        <div className="absolute top-2/3 left-1/2 w-[400px] h-[400px] rounded-full bg-rose-300/22 blur-[75px]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(120,80,20,0.09) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>
      <SideMenu />
      <ContentWrapper>{children}</ContentWrapper>
    </SideMenuProvider>
  );
}
