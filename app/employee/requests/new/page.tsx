"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { EmployeeHeader, BottomNavigation } from "../../components";
import { OrderForm, ProblemForm, QuestionForm, IdeaForm, SuccessScreen } from "../../components/forms";
import { REQUEST_TYPES } from "@/src/modules/requests/request-types";
import { ChevronLeft } from "lucide-react";

export default function NewRequestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");
  const [successTicket, setSuccessTicket] = useState<string | null>(null);

  const requestType = REQUEST_TYPES.find((rt) => rt.id === type);

  if (!type || !requestType) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <EmployeeHeader />
        <div className="flex-1 pb-32 flex items-center justify-center">
          <p className="text-gray-600">Invalid request type</p>
        </div>
        <BottomNavigation />
      </main>
    );
  }

  // Show success screen
  if (successTicket) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <EmployeeHeader />
        <div className="flex-1 pb-32 overflow-y-auto">
          <section className="px-4 py-6">
            <SuccessScreen ticketNumber={successTicket} />
          </section>
        </div>
        <BottomNavigation />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <EmployeeHeader />

      <div className="flex-1 pb-32 overflow-y-auto">
        {/* Header */}
        <section className="px-4 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg text-gray-900 flex-1 ml-2 font-grotesk">New Request</h1>
          <span className="px-3 py-1 bg-[#FFC600]/20 text-[#141414] text-xs font-medium rounded-full">
            {requestType.title.toUpperCase()}
          </span>
        </section>

        {/* Title */}
        <section className="px-4 py-6 bg-white border-b border-gray-200">
          <div className="space-y-2">
            <h2 className="text-2xl text-gray-900 font-grotesk">
              {requestType.title === "Order"
                ? "What do you need?"
                : requestType.title === "Problem"
                  ? "Report a problem"
                  : requestType.title === "Question"
                    ? "Ask the office manager"
                    : "Share your idea"}
            </h2>
            <p className="text-gray-600 text-sm font-techstack">
              {requestType.title === "Order"
                ? "Leave a request for anything you need — supplies, food, equipment. Specify the details and priority."
                : requestType.title === "Problem"
                  ? "Let us know about an issue — we'll look into it as soon as possible."
                  : requestType.title === "Question"
                    ? "We'll get back to you as soon as possible. Set a priority and describe your question."
                    : "Help us improve. Your ideas turn into real changes."}
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="px-4 py-6">
          {type === "order" && <OrderForm onSuccess={setSuccessTicket} />}
          {type === "problem" && <ProblemForm onSuccess={setSuccessTicket} />}
          {type === "question" && <QuestionForm onSuccess={setSuccessTicket} />}
          {type === "idea" && <IdeaForm onSuccess={setSuccessTicket} />}
        </section>
      </div>

      <BottomNavigation />
    </main>
  );
}
