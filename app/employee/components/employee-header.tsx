"use client";

import { Menu } from "lucide-react";
import { useSideMenu } from "./side-menu-context";

export function EmployeeHeader() {
  const { toggle, toggleCollapse } = useSideMenu();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-white/15 bg-white/28 backdrop-blur-xl sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Mobile: opens drawer */}
        <button
          onClick={toggle}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        {/* Desktop: collapses/expands sidebar */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex p-2 hover:bg-white/60 rounded-lg transition cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Logo text — visible on mobile only */}
        <span className="text-lg text-gray-800 font-grotesk lg:hidden">Digital Office</span>
      </div>
    </header>
  );
}
