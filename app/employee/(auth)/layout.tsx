/**
 * Auth layout for employee signin
 * This layout does NOT require authentication
 * It allows users without a session to access the signin page
 */

export default function EmployeeAuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
