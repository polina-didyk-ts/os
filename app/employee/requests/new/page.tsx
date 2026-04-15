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
          <h1 className="text-lg font-semibold text-gray-900 flex-1 ml-2">Новий запит</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
            {requestType.title.toUpperCase()}
          </span>
        </section>

        {/* Title */}
        <section className="px-4 py-6 bg-white border-b border-gray-200">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {requestType.title === "Замовити"
                ? "Створити запит"
                : requestType.title === "Проблема"
                  ? "Повідомити про проблему"
                  : requestType.title === "Питання"
                    ? "Запитати у офіс-менеджера"
                    : "Ваша думка важлива"}
            </h2>
            <p className="text-gray-600 text-sm">
              {requestType.title === "Замовити"
                ? "Залиште запит на все необхідне: від матеріалів до їжі чи напоїв. Вважіть деталі та пріоритет — менеджер опрацює ваш запит і організує все потрібне."
                : requestType.title === "Проблема"
                  ? "Повідомите про проблему в офісі — ми допоможемо вирішити її якнайшвидше. Опишіть, що сталося, та оберіть пріоритет."
                  : requestType.title === "Питання"
                    ? "Ми допоможемо вирішити ваші питання максимально швидко. Оберіть пріоритет та опишіть суть."
                    : "Допоможіть нам зробити сервіс кращим. Ваші ідеї перетворюються на реальні зміни."}
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
