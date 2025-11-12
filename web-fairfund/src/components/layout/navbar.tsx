"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "@/components/web3/wallet-button";
import { cn } from "@/lib/utils";

const routes = [
  { href: "/", label: "Proyectos" },
  { href: "/create", label: "Crear campaña" },
  { href: "/dashboard", label: "Mi panel" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleNavigate = () => {
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(15,23,42,0.05)] backdrop-blur-lg backdrop-saturate-150 dark:border-white/5 dark:bg-[rgba(14,20,35,0.55)]">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold"
          onClick={handleNavigate}
        >
          <span className="bg-gradient-to-r from-[rgb(var(--primary))] via-[rgb(var(--accent))] to-[rgb(var(--accent-secondary))] bg-clip-text text-transparent">
            FairFund
          </span>
        </Link>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/40 text-sm font-medium text-[rgb(var(--foreground))] shadow-sm transition hover:border-white/40 hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--primary))] md:hidden"
          onClick={handleToggle}
          aria-label="Abrir menú de navegación"
        >
          <span className="sr-only">Abrir menú</span>
          <div className="flex flex-col gap-1.5">
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-[rgb(var(--foreground))] transition",
                menuOpen && "translate-y-1.5 rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-[rgb(var(--foreground))] transition",
                menuOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-[rgb(var(--foreground))] transition",
                menuOpen && "-translate-y-1.5 -rotate-45"
              )}
            />
          </div>
        </button>

        <nav className="hidden items-center gap-6 md:flex">
          {routes.map((route) => {
            const isActive =
              route.href === "/" ? pathname === "/" : pathname.startsWith(route.href);
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={handleNavigate}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive
                    ? "text-[rgb(var(--primary))]"
                    : "text-[rgb(var(--foreground))]/70 hover:text-[rgb(var(--foreground))]"
                )}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-2">
          <WalletButton />
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[rgba(255,255,255,0.9)] px-4 pb-4 pt-2 shadow-lg backdrop-blur-md dark:bg-[rgba(17,24,39,0.9)] md:hidden">
          <nav className="flex flex-col gap-3">
            {routes.map((route) => {
              const isActive =
                route.href === "/" ? pathname === "/" : pathname.startsWith(route.href);
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={handleNavigate}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                      : "text-[rgb(var(--foreground))]/80 hover:bg-[rgb(var(--surface-muted))] hover:text-[rgb(var(--foreground))]"
                  )}
                >
                  {route.label}
                </Link>
              );
            })}
            <div className="pt-2">
              <WalletButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

