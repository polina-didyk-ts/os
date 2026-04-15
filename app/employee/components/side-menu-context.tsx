"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface SideMenuContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const SideMenuContext = createContext<SideMenuContextValue | null>(null);

export function SideMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <SideMenuContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </SideMenuContext.Provider>
  );
}

export function useSideMenu(): SideMenuContextValue {
  const ctx = useContext(SideMenuContext);
  if (!ctx) throw new Error("useSideMenu must be used inside SideMenuProvider");
  return ctx;
}
