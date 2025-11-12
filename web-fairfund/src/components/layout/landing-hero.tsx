"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { env } from "@/lib/env";

const stats = [
  { label: "Tokens soportados", value: () => env.supportedTokens.length },
  { label: "Comisión máxima", value: () => "10%" },
  { label: "Seguridad", value: () => "Escrow + ReentrancyGuard" },
];

export const LandingHero = () => {
  const { status, connect } = useWallet();

  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[rgba(var(--primary),0.12)] via-[rgba(var(--accent),0.08)] to-[rgba(var(--accent-secondary),0.16)] px-6 py-16 text-[rgb(var(--foreground))] shadow-[0_40px_120px_-50px_rgba(15,23,42,0.35)] sm:px-12">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_60%)] blur-2xl md:block" />
      <div className="relative z-10 grid gap-12 md:grid-cols-[1.25fr,1fr] md:items-center">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/40 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--foreground))]/80 shadow-sm dark:border-white/20 dark:bg-white/10">
            Construye campañas de confianza
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-[rgb(var(--foreground))] sm:text-5xl">
            Crowdfunding transparente impulsado por{" "}
            <span className="bg-gradient-to-r from-[rgb(var(--primary))] via-[rgb(var(--accent))] to-[rgb(var(--accent-secondary))] bg-clip-text text-transparent">
              FairFund
            </span>
          </h1>
          <p className="max-w-xl text-base text-[rgb(var(--foreground))]/70 sm:text-lg">
            Lanza campañas verificables, recauda con múltiples tokens ERC20 y ofrece reembolsos
            automáticos si la meta no se alcanza. Todo bajo un escrow inteligente y auditable.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button
              size="lg"
              onClick={() => {
                if (status === "connected") return;
                void connect();
              }}
              className="bg-gradient-to-r from-[rgb(var(--primary))] via-[rgb(var(--accent))] to-[rgb(var(--accent-secondary))] shadow-lg shadow-[rgba(79,70,229,0.2)] hover:shadow-[rgba(79,70,229,0.35)]"
            >
              {status === "connected" ? "Wallet conectada" : "Conectar wallet"}
            </Button>
            <Link
              href="/create"
              className="inline-flex items-center justify-center rounded-md border border-white/40 px-4 py-2.5 text-sm font-semibold text-[rgb(var(--foreground))] transition hover:border-white/60 hover:bg-white/40 dark:border-white/20 dark:hover:bg-white/10"
            >
              Crear campaña →
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/30 bg-white/60 p-5 shadow-lg dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-medium uppercase tracking-wide text-[rgb(var(--foreground))]/60">
              ¿Por qué FairFund?
            </p>
            <ul className="mt-4 space-y-3 text-sm text-[rgb(var(--foreground))]/75">
              <li>• Escrow asegura que los fondos solo se liberan si la meta se cumple.</li>
              <li>• Reembolsos automáticos para tus patrocinadores.</li>
              <li>• Compatible con múltiples tokens y control de comisiones.</li>
              <li>• Scripts listos para desplegar y sincronizar con tu frontend.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/30 bg-white/40 p-5 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-2xl font-semibold text-[rgb(var(--foreground))]">
                    {typeof stat.value === "function" ? stat.value() : stat.value}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-[rgb(var(--foreground))]/60">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


