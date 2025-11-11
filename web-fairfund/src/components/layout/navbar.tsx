"use client";

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

  return (
    <header className="border-b border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-[rgb(var(--foreground))]">
          FairFund
        </Link>
        <nav className="hidden md:flex md:items-center md:gap-6">
          {routes.map((route) => {
            const isActive =
              route.href === "/" ? pathname === "/" : pathname.startsWith(route.href);
            return (
              <Link
                key={route.href}
                href={route.href}
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
        <div className="flex items-center gap-2">
          <WalletButton />
        </div>
      </div>
    </header>
  );
};

