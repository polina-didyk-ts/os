"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, authClient } from "@/src/lib/client";
import { Logo } from "@/app/components/Logo";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await signUp.email(
      { name, email, password },
      {
        onSuccess: () => {
          router.push("/app");
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Sign up failed");
          setLoading(false);
        },
      }
    );
  };

  const handleGoogleSignUp = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/app",
    });
  };

  return (
    <main className="min-h-screen flex flex-col p-6 bg-background">
      <div className="mb-8">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Card className="max-w-md w-full border-0 shadow-none bg-transparent">
          <CardHeader className="text-center px-0">
            <CardTitle className="text-3xl font-bold text-foreground mb-2">
              Create Account
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Please enter your details below
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" data-testid="signup-error-message">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground text-sm">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-12 bg-input border-0 rounded-xl"
                  data-testid="signup-name-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground text-sm">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-12 bg-input border-0 rounded-xl"
                  data-testid="signup-email-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="h-12 bg-input border-0 rounded-xl"
                  data-testid="signup-password-input"
                />
                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
              </div>

              <div className="text-xs text-muted-foreground pt-2">
                By signing up you have read and understood our{" "}
                <Link href="/terms" className="text-foreground underline">
                  terms & conditions
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-4"
                data-testid="signup-submit-button"
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-background text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignUp}
                  className="flex-1 h-12"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignUp}
                  className="flex-1 h-12"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Button>
              </div>
            </form>

            <p className="text-center text-sm text-foreground mt-8">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-brand-600 hover:text-brand-700 font-semibold"
                data-testid="signup-signin-link"
              >
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
