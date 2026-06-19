"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/src/lib/client";

function Spinner() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
    </main>
  );
}

function AuthCallbackInner() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace("/employee/signin");
      return;
    }
    if (session.user.role === "admin") {
      router.replace("/admin");
    } else {
      router.replace(redirect?.startsWith("/employee/") ? redirect : "/employee");
    }
  }, [session, isPending, router, redirect]);

  return <Spinner />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AuthCallbackInner />
    </Suspense>
  );
}
