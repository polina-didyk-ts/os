"use client";

import { useRouter } from "next/navigation";
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
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <EmployeeHeader />

      <div className="flex-1 pb-32 overflow-y-auto">
        {/* Greeting */}
        <section className="px-4 py-6 bg-white border-b border-gray-200">
          <h1 className="text-3xl text-gray-900 mb-1 font-grotesk">
            Hey, {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-600 font-techstack">
            Here&apos;s what&apos;s happening at Techstack.
          </p>
        </section>

        <div className="px-4 py-5 flex flex-col gap-4">
          <PortalHighlights />
          <QuickActions onRequestTypeClick={handleRequestTypeClick} />
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}
