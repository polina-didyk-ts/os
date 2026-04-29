"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/lib/client";
import { EmployeeHeader, RequestTypeCard, BottomNavigation } from "./components";
import { REQUEST_TYPES } from "@/src/modules/requests/request-types";
import { FileText, ChevronRight } from "lucide-react";

export default function EmployeeDashboard() {
  const router = useRouter();
  const { data: session } = useSession();

  const userName = session?.user?.name || "Guest";

  const handleRequestTypeClick = (typeId: string) => {
    router.push(`/employee/requests/new?type=${typeId}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <EmployeeHeader />

      <div className="flex-1 pb-32 overflow-y-auto">
        {/* Greeting Section */}
        <section className="px-4 py-6 bg-white border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Hey, {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-600">How can we help you today?</p>
        </section>

        {/* Request Types Grid */}
        <section className="px-4 py-6">
          <div className="grid grid-cols-2 gap-4">
            {REQUEST_TYPES.map((type) => (
              <RequestTypeCard
                key={type.id}
                icon={type.icon}
                title={type.title}
                description={type.description}
                onClick={() => handleRequestTypeClick(type.id)}
              />
            ))}
          </div>
        </section>

        {/* My Requests Section */}
        <section className="px-4 pb-6">
          <Link
            href="/employee/requests"
            className="flex items-center justify-between px-4 py-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
              <span className="text-gray-900 font-medium">My Requests</span>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
          </Link>
        </section>

      </div>

      <BottomNavigation />
    </main>
  );
}
