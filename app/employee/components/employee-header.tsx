"use client";

import { Menu } from "lucide-react";
import { useSession } from "@/src/lib/client";
import { useSideMenu } from "./side-menu-context";

function getInitial(name: string | null | undefined, email: string): string {
  if (name) return name.trim()[0].toUpperCase();
  return email[0].toUpperCase();
}

export function EmployeeHeader() {
  const { toggle } = useSideMenu();
  const { data: session } = useSession();

  const user = session?.user;
  const initial = getInitial(user?.name, user?.email ?? "");

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Відкрити меню"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <span className="text-lg font-semibold text-gray-800">Office System</span>
      </div>

      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold select-none">
        {initial}
      </div>
    </header>
  );
}
