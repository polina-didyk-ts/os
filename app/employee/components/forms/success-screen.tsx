"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

interface SuccessScreenProps {
  ticketNumber: string;
}

export function SuccessScreen({ ticketNumber }: SuccessScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      {/* Cat + Title grouped */}
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/sucess-cat.png"
          alt="Success"
          width={190}
          height={190}
          className="object-contain"
        />
        <h1 className="text-3xl text-gray-900 font-grotesk">Request Submitted!</h1>
      </div>

      {/* Ticket Number */}
      <div className="space-y-1 text-center">
        <p className="text-xs text-gray-600 uppercase font-grotesk">Request Number</p>
        <p className="text-2xl text-gray-900 font-grotesk">#{ticketNumber}</p>
      </div>

      {/* What Next */}
      <div className="w-full max-w-md bg-white rounded-2xl p-4 space-y-2 shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)]">
        <p className="text-xs text-gray-900 uppercase font-grotesk">What&apos;s Next?</p>
        <p className="text-sm text-gray-600 font-techstack">
          Your request is now being reviewed by the office manager. You&apos;ll typically receive a
          response within 2 business hours. Check updates in your profile.
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-md space-y-3">
        <Link
          href="/employee/requests"
          className="block rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,20,20,0.12),0_2px_6px_rgba(20,20,20,0.08)]"
        >
          <Button className="w-full bg-[#141414] hover:bg-black text-white py-3 rounded-lg font-grotesk font-normal cursor-pointer transition">
            View My Requests
          </Button>
        </Link>
        <Link
          href="/employee"
          className="block rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,20,20,0.12),0_2px_6px_rgba(20,20,20,0.08)]"
        >
          <Button
            variant="outline"
            className="w-full py-3 rounded-lg font-grotesk font-normal cursor-pointer transition"
          >
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
