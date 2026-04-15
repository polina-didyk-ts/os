"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/lib/client";

export default function AuthCallbackPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace("/employee/signin");
      return;
    }
    if (session.user.role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/employee");
    }
  }, [session, isPending, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
    </main>
  );
}
