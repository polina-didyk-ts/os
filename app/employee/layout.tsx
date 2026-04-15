"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/src/lib/client";
import { SideMenuProvider, SideMenu } from "./components";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const isSigningOut = useRef(false);

  const isAuthPage = pathname === "/employee/signin";

  useEffect(() => {
    if (isAuthPage) return;
    if (!isPending && !session && !isSigningOut.current) {
      router.push("/employee/signin");
    }
  }, [session, isPending, router, isAuthPage]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isPending) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SideMenuProvider>
      <SideMenu />
      {children}
    </SideMenuProvider>
  );
}