"use client";

import { useSession } from "@/src/lib/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {session?.user.name || "User"}!</p>
      </div>

      {/* User Info Card */}
      <Card className="border border-border shadow-sm" data-testid="dashboard-user-info">
        <CardHeader>
          <CardTitle className="text-foreground text-xl">User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-semibold text-foreground" data-testid="dashboard-user-name">
              {session?.user.name || "Not set"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-semibold text-foreground" data-testid="dashboard-user-email">
              {session?.user.email}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Role:</span>
            <span className="font-semibold text-foreground capitalize">{session?.user.role}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">User ID:</span>
            <span className="font-mono text-sm text-muted-foreground">{session?.user.id}</span>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      <Alert className="border-brand-200 bg-brand-50" data-testid="dashboard-success-message">
        <AlertDescription>
          <p className="font-semibold text-brand-800">✓ Authentication verified!</p>
          <p className="text-sm mt-1 text-brand-700">
            You are authenticated and can access protected routes.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
