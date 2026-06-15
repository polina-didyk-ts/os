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
    // Client-side UX guard — real security is enforced on API level via requireRole()
    if (session.user.role !== "admin") {
      router.push("/");
    }
  }, [session, isPending, router, pathname]);

  if (isPending) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#141414] border-t-transparent" />
      </main>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <SideMenuProvider>
      <SideMenu />
      {children}
    </SideMenuProvider>
  );
}
