"use client";

import { useState } from "react";
import { authClient } from "@/src/lib/client";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Mail, Grid2X2 } from "lucide-react";

export default function EmployeeSignInPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/auth/callback",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFC600] flex items-center justify-center shadow-lg">
            <Grid2X2 className="w-8 h-8 text-[#141414]" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Digital Office</h1>
        </div>

        {/* Icon Container */}
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-3xl bg-gray-100 flex items-center justify-center">
            <Mail className="w-16 h-16 text-[#141414]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Subtitle */}
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-900">
            Sign in to submit a request or check its status
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" data-testid="signin-error-message">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Google Sign In Button */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-12 text-base font-medium bg-[#141414] hover:bg-black text-white rounded-lg transition-colors"
          data-testid="employee-signin-google-button"
        >
          {loading ? (
            <span className="flex items-center gap-2">
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
            </span>
          ) : (
            <span className="flex items-center gap-2">
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
            </span>
          )}
        </Button>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-600 font-medium">
          For Techstack members only
        </p>

        {/* Additional Info */}
        <p className="text-center text-xs text-gray-500">
          Your data is protected. Anonymous requests are not processed.
        </p>
      </div>
    </main>
  );
}
