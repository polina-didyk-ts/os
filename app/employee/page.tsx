"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "@/src/lib/client";
import { EmployeeHeader, BottomNavigation } from "./components";
import { PortalHighlights } from "./components/portal-highlights";
import { QuickActions } from "./components/quick-actions";

export default function EmployeeDashboard() {
  const router = useRouter();
  const { data: session } = useSession();

  const userName = session?.user?.name || "Guest";

  const handleRequestTypeClick = (typeId: string) => {
    router.push(`/employee/requests/new?type=${typeId}`);
  };

  return (
    <main className="min-h-screen bg-transparent flex flex-col">
      <EmployeeHeader />

      <div className="flex-1 pb-32">
        {/* Greeting */}
        <section className="px-4 py-4 bg-gradient-to-br from-white/30 via-amber-50/15 to-orange-50/10 backdrop-blur-xl border-b border-white/15 relative overflow-visible z-20 animate-fade-up">
          <div className="pr-24">
            <h1 className="text-2xl text-gray-900 mb-0.5 font-grotesk">
              Hey, {userName.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-gray-600 font-techstack">
              Here&apos;s what&apos;s happening at Techstack.
            </p>
          </div>
          <Image
            src="/stacky_no_bg.png"
            alt="Stacky"
            width={110}
            height={110}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
          />
        </section>

        <div className="px-4 py-5 flex flex-col gap-4">
          <div className="animate-fade-up [animation-delay:120ms]">
            <PortalHighlights />
          </div>
          <div className="animate-fade-up [animation-delay:240ms]">
            <QuickActions onRequestTypeClick={handleRequestTypeClick} />
          </div>
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}
