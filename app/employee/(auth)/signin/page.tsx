"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Lottie from "lottie-react";
import mascotAnimation from "@/public/mascot.json";
import { authClient } from "@/src/lib/client";
import { Alert, AlertDescription } from "@/app/components/ui/alert";


function SignInForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const callbackURL = redirect?.startsWith("/employee/")
        ? `/auth/callback?redirect=${encodeURIComponent(redirect)}`
        : "/auth/callback";
      await authClient.signIn.social({ provider: "google", callbackURL });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#fff7ed]">
      {/* Saturated focal point — solid colors, no alpha wash */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 92% 2%,
              #fbbf24 0%,
              #f97316 14%,
              #ea580c 26%,
              #fed7aa 48%,
              transparent 65%),
            radial-gradient(circle at 2% 98%,
              #fb923c 0%,
              #fde68a 22%,
              #fff7ed 48%,
              transparent 65%),
            radial-gradient(circle at 12% 12%,
              #fef08a 0%,
              #fde68a 20%,
              transparent 50%),
            radial-gradient(circle at 65% 90%,
              #fed7aa 0%,
              #fef3c7 30%,
              transparent 55%),
            #fff7ed
          `,
        }}
      />
      {/* Supporting blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-[420px] h-[420px] rounded-full bg-amber-400/60 blur-[50px]" />
        <div className="absolute top-[18%] right-[20%] w-[280px] h-[280px] rounded-full bg-orange-400/50 blur-[50px]" />
        <div className="absolute top-[42%] -left-10 w-[320px] h-[320px] rounded-full bg-orange-300/55 blur-[60px]" />
        <div className="absolute bottom-[3%] right-[20%] w-[300px] h-[300px] rounded-full bg-yellow-300/60 blur-[50px]" />
        <div className="absolute top-[68%] right-[3%] w-[220px] h-[220px] rounded-full bg-amber-300/45 blur-[45px]" />
        <div className="absolute top-[32%] left-[35%] w-[240px] h-[240px] rounded-full bg-rose-300/25 blur-[55px]" />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Mascot floats above the card */}
        <div className="relative z-10 mb-[-32px]">
          <Lottie animationData={mascotAnimation} loop className="w-40 h-40" />
        </div>

        {/* Glass card */}
        <div className="w-full bg-white/28 backdrop-blur-xl rounded-3xl px-8 pt-12 pb-8 shadow-[0_8px_32px_rgba(20,20,20,0.11),inset_0_1px_0_rgba(255,255,255,0.55)] border border-white/15 flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl text-gray-900 font-grotesk">Digital Office</h1>
            <p className="text-sm text-gray-500 font-techstack">
              Submit requests, track their status, read articles, and stay updated with important
              announcements.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" data-testid="signin-error-message" className="w-full">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 text-base font-grotesk font-normal text-white rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,115,22,0.35)] disabled:translate-y-0 disabled:shadow-none disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }}
            data-testid="employee-signin-google-button"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 font-techstack">For Techstack members only</p>
        </div>
      </div>
    </main>
  );
}

export default function EmployeeSignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
