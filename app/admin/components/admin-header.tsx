"use client";

import { Menu } from "lucide-react";
import { useSideMenu } from "./side-menu-context";

export function AdminHeader() {
  const { toggle } = useSideMenu();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-md sticky top-0 z-10 border-b border-white/30">
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-2 hover:bg-white/60 rounded-lg transition cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <span className="text-lg text-[#141414] font-grotesk">Digital Office</span>
        <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-700 text-xs tracking-wide font-grotesk border border-amber-200">
          MANAGER
        </span>
      </div>
    </header>
  );
}
