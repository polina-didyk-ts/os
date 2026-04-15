"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/src/lib/client";
import { Logo } from "@/app/components/Logo";
import { Button } from "@/app/components/ui/button";
import { LayoutDashboard, FileText, Menu, X } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Track intentional sign-out to prevent useEffect redirect race
  const isSigningOut = useRef(false);

  useEffect(() => {
    // Only redirect to signin if session is missing AND user didn't intentionally sign out
    if (!isPending && !session && !isSigningOut.current) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    // Mark as intentional sign-out before calling signOut
    isSigningOut.current = true;
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  if (isPending) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  const navItems = [
    { href: "/app", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/notes", label: "Notes", icon: FileText },
  ];

  // Generate test ID from label (e.g., "Dashboard" -> "header-dashboard-link")
  const getNavTestId = (label: string) => {
    return `header-${label.toLowerCase().replaceAll(/\s+/g, "-")}-link`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-block" onClick={() => setMobileMenuOpen(false)}>
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 ml-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  data-testid={getNavTestId(item.label)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop User menu */}
          <div className="hidden md:flex ml-auto items-center gap-4">
            <div
              className="text-sm text-muted-foreground max-w-[200px] truncate"
              data-testid="header-user-info"
            >
              {session.user.name || session.user.email}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              data-testid="header-signout-button"
            >
              Sign Out
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden ml-auto p-2 text-foreground"
            aria-label="Toggle menu"
            data-testid="header-mobile-menu-button"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="container mx-auto px-4 py-4 space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-secondary text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    data-testid={getNavTestId(item.label)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-center"
                >
                  Sign Out
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</main>
    </div>
  );
}
