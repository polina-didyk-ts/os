"use client";

import Link from "next/link";
import { useSession } from "@/src/lib/client";
import { Logo } from "@/app/components/Logo";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

export default function Home() {
  const { data: session, isPending } = useSession();

  return (
    <main className="min-h-screen flex flex-col p-6 bg-background">
      <div className="mb-12">
        <Logo />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground leading-tight">
              Welcome to Techstack Web Starter!
            </h1>
            <p className="text-muted-foreground text-lg">
              A modern full-stack TypeScript starter with Next.js, Prisma, and Better Auth
            </p>
          </div>

          {isPending ? (
            <div className="py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
            </div>
          ) : session ? (
            <div className="space-y-4 pt-8">
              <Alert className="border-brand-200 bg-brand-50 text-brand-800">
                <AlertDescription className="text-center font-medium">
                  Welcome back, {session.user.name || session.user.email}!
                </AlertDescription>
              </Alert>
              <Button asChild className="w-full">
                <Link href="/app">Go to Dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-8">
              <Button asChild className="w-full">
                <Link href="/signup">Create Account</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/signin">Login</Link>
              </Button>
            </div>
          )}

          <div className="pt-12 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Built with modern tech:</p>
            <p>Next.js • Prisma • Better Auth • PostgreSQL</p>
          </div>
        </div>
      </div>
    </main>
  );
}
