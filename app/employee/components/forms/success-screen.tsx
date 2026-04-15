"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface SuccessScreenProps {
  ticketNumber: string;
}

export function SuccessScreen({ ticketNumber }: SuccessScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      {/* Checkmark Circle */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 bg-blue-600 rounded-full flex items-center justify-center">
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Запит надіслано!</h1>
        <p className="text-green-600 flex items-center justify-center gap-1">
          <span className="text-xl">✅</span>
        </p>
      </div>

      {/* Ticket Number */}
      <div className="space-y-1 text-center">
        <p className="text-xs text-gray-600 uppercase font-semibold">Номер звернення</p>
        <p className="text-2xl font-bold text-gray-900">#{ticketNumber}</p>
      </div>

      {/* Info Text */}
      <p className="text-gray-700 text-center max-w-sm">
        Ми зв&apos;язуємось з тобою, як тільки статус змінитиме
      </p>

      {/* What Next */}
      <div className="w-full max-w-md bg-gray-50 rounded-lg p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-900 uppercase">Що далі?</p>
        <p className="text-sm text-gray-600">
          Зараз твій запит перевіряє адміністратор офісу. Впевнений відповідь прийде через 2 години у робочий час. Перевірений інформацію у профілі.
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-md space-y-3">
        <Link href="/employee/requests" className="block">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition">
            Переглянути мої запити
          </Button>
        </Link>
        <Link href="/employee" className="block">
          <Button variant="outline" className="w-full py-3 rounded-lg transition">
            На головну
          </Button>
        </Link>
      </div>
    </div>
  );
}
