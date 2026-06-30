"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { EmployeeHeader, BottomNavigation } from "../../components";
import { OrderForm, ProblemForm, QuestionForm, IdeaForm, SuccessScreen } from "../../components/forms";
import { REQUEST_TYPES } from "@/src/modules/requests/request-types";
import { ChevronLeft } from "lucide-react";

const CARD_SHADOW = "shadow-[0_2px_8px_rgba(20,20,20,0.06)]";

export default function NewRequestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");
  const [successTicket, setSuccessTicket] = useState<string | null>(null);

  const requestType = REQUEST_TYPES.find((rt) => rt.id === type);

  if (!type || !requestType) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <EmployeeHeader />
        <div className="flex-1 pb-32 flex items-center justify-center">
          <p className="text-gray-600">Invalid request type</p>
        </div>
        <BottomNavigation />
      </main>
    );
  }

  if (successTicket) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <EmployeeHeader />
        <div className="flex-1 pb-32 overflow-y-auto">
          <div className={`mx-4 mt-4 bg-white rounded-2xl p-5 ${CARD_SHADOW}`}>
            <SuccessScreen ticketNumber={successTicket} />
          </div>
        </div>
        <BottomNavigation />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <EmployeeHeader />

      <div className="flex-1 pb-32 overflow-y-auto">
        {/* Header */}
        <div className={`mx-4 mt-4 bg-white rounded-2xl px-4 py-3 ${CARD_SHADOW} flex items-center justify-between`}>
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg text-gray-900 flex-1 ml-2 font-grotesk">New Request</h1>
          <span className="px-3 py-1 bg-[#FFC600]/20 text-[#141414] text-xs font-grotesk rounded-full">
            {requestType.title.toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <div className={`mx-4 mt-3 bg-white rounded-2xl p-5 ${CARD_SHADOW}`}>
          <h2 className="text-2xl text-gray-900 font-grotesk">
            {requestType.title === "Order"
              ? "What do you need?"
              : requestType.title === "Problem"
                ? "Report a problem"
                : requestType.title === "Question"
                  ? "Ask the office manager"
                  : "Share your idea"}
          </h2>
          <p className="text-gray-600 text-sm font-techstack mt-2">
            {requestType.title === "Order"
              ? "Leave a request for anything you need — supplies, food, equipment. Specify the details and priority."
              : requestType.title === "Problem"
                ? "Let us know about an issue — we'll look into it as soon as possible."
                : requestType.title === "Question"
                  ? "We'll get back to you as soon as possible. Set a priority and describe your question."
                  : "Help us improve. Your ideas turn into real changes."}
          </p>
        </div>

        {/* Form */}
        <div className={`mx-4 mt-3 mb-4 bg-white rounded-2xl p-5 ${CARD_SHADOW}`}>
          {type === "order"    && <OrderForm    onSuccess={setSuccessTicket} />}
          {type === "problem"  && <ProblemForm  onSuccess={setSuccessTicket} />}
          {type === "question" && <QuestionForm onSuccess={setSuccessTicket} />}
          {type === "idea"     && <IdeaForm     onSuccess={setSuccessTicket} />}
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}
