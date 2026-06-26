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
        <div className="absolute inset-0 bg-[#141414] rounded-full flex items-center justify-center">
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl text-gray-900 font-grotesk">Request Submitted!</h1>
        <p className="text-green-600 flex items-center justify-center gap-1">
          <span className="text-xl">✅</span>
        </p>
      </div>

      {/* Ticket Number */}
      <div className="space-y-1 text-center">
        <p className="text-xs text-gray-600 uppercase font-grotesk">Request Number</p>
        <p className="text-2xl text-gray-900 font-grotesk">#{ticketNumber}</p>
      </div>

      {/* Info Text */}
      <p className="text-gray-700 text-center max-w-sm font-techstack">
        We&apos;ll notify you as soon as the status changes
      </p>

      {/* What Next */}
      <div className="w-full max-w-md bg-gray-50 rounded-lg p-4 space-y-2">
        <p className="text-xs text-gray-900 uppercase font-grotesk">What&apos;s Next?</p>
        <p className="text-sm text-gray-600 font-techstack">
          Your request is now being reviewed by the office manager. You&apos;ll typically receive a response within 2 business hours. Check updates in your profile.
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-md space-y-3">
        <Link href="/employee/requests" className="block">
          <Button className="w-full bg-[#141414] hover:bg-black text-white py-3 rounded-lg transition">
            View My Requests
          </Button>
        </Link>
        <Link href="/employee" className="block">
          <Button variant="outline" className="w-full py-3 rounded-lg transition">
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
