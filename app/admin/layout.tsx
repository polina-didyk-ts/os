"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/src/lib/client";
import { SideMenuProvider, SideMenu } from "./components";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    if (session.user.role !== "admin") router.push("/");
  }, [session, isPending, router, pathname]);

  if (isPending) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fffdf7]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-400 border-t-transparent" />
      </main>
    );
  }

  if (!session || session.user.role !== "admin") return null;

  return (
    <SideMenuProvider>
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 bg-[#fffdf7] overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-0 w-[750px] h-[750px] rounded-full bg-amber-300/41 blur-[110px]" />
        <div className="absolute top-1/4 -left-40 w-[650px] h-[650px] rounded-full bg-orange-300/34 blur-[95px]" />
        <div className="absolute bottom-10 right-1/3 w-[550px] h-[550px] rounded-full bg-yellow-300/38 blur-[95px]" />
        <div className="absolute top-2/3 left-1/2 w-[400px] h-[400px] rounded-full bg-rose-300/19 blur-[75px]" />
      </div>
      <SideMenu />
      {children}
    </SideMenuProvider>
  );
}
