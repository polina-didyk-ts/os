"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, authClient } from "@/src/lib/client";
import { Logo } from "@/app/components/Logo";
import { Input } from "@/app/components/ui/input";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await signIn.email(
      { email, password },
      {
        onSuccess: () => {
          router.push(callbackUrl);
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Sign in failed");
          setLoading(false);
        },
      }
    );
  };

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({ provider: "google", callbackURL: callbackUrl });
  };

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-[#fff7ed]">
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

      {/* Logo */}
      <div className="p-6 relative z-10">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md bg-white/28 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_32px_rgba(20,20,20,0.11),inset_0_1px_0_rgba(255,255,255,0.55)] border border-white/15">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-grotesk text-gray-900 mb-2">Log in</h1>
            <p className="text-sm text-gray-500 font-techstack">
              Welcome back. Please enter your login details below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" data-testid="signin-error-message">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-grotesk text-gray-500 uppercase tracking-widest"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-12 bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50 rounded-xl"
                data-testid="signin-email-input"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-grotesk text-gray-500 uppercase tracking-widest"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-techstack text-gray-400 hover:text-amber-600 transition"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50 rounded-xl"
                data-testid="signin-password-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 text-white rounded-xl font-grotesk transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,115,22,0.35)] disabled:translate-y-0 disabled:shadow-none disabled:opacity-60 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)",
              }}
              data-testid="signin-submit-button"
            >
              {loading ? "Signing in…" : "Log in"}
            </button>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/60" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white/30 backdrop-blur-sm rounded-full text-gray-400 font-techstack">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 text-sm font-grotesk text-gray-700 hover:bg-white/80 transition cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 text-sm font-grotesk text-gray-700 hover:bg-white/80 transition cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
                Twitter
              </button>
            </div>
          </form>

          <p className="text-center text-sm font-techstack text-gray-500 mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-amber-600 hover:text-amber-700 font-grotesk transition"
              data-testid="signin-signup-link"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
