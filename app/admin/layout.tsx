"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/lib/client";
import { SideMenuProvider, SideMenu } from "./components";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push("/signin");
      return;
    }
    // Client-side UX guard — real security is enforced on API level via requireRole()
    if (session.user.role !== "admin") {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
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
