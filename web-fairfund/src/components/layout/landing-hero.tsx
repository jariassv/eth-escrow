"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { env } from "@/lib/env";
import { useProjects } from "@/hooks/useProjects";
import type { ProjectSummary } from "@/types/project";

const stats = [
  { label: "Tokens soportados", value: () => env.supportedTokens.length },
  { label: "Comisión máxima", value: () => "10%" },
  { label: "Seguridad", value: () => "Escrow + ReentrancyGuard" },
];

export const LandingHero = () => {
  const { status, connect } = useWallet();
  const { data: projects } = useProjects();

  const activeProjects = useMemo(
    () => (projects ?? []).filter((project) => project.status === "active"),
    [projects]
  );

  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[rgba(var(--primary),0.12)] via-[rgba(var(--accent),0.08)] to-[rgba(var(--accent-secondary),0.16)] px-6 py-16 text-[rgb(var(--foreground))] shadow-[0_40px_120px_-50px_rgba(15,23,42,0.35)] sm:px-12">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_60%)] blur-2xl md:block" />
      <div className="relative z-10 flex flex-col gap-12">
        <div className="space-y-5">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/40 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--foreground))]/80 shadow-sm dark:border-white/20 dark:bg-white/10">
            Construye campañas de confianza
          </span>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-[rgb(var(--foreground))] sm:text-[44px]">
            Crowdfunding transparente impulsado por{" "}
            <span className="bg-gradient-to-r from-[rgb(var(--primary))] via-[rgb(var(--accent))] to-[rgb(var(--accent-secondary))] bg-clip-text text-transparent">
              FairFund
            </span>
          </h1>
          <p className="max-w-3xl text-base text-[rgb(var(--foreground))]/70 sm:text-lg">
            Lanza campañas verificables, recauda con múltiples tokens ERC20 y ofrece reembolsos automáticos si la meta no se alcanza. Todo bajo un escrow inteligente y auditable.
          </p>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex w-full flex-col gap-6 lg:max-w-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button
                size="lg"
                onClick={() => {
                  if (status === "connected") return;
                  void connect();
                }}
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

            <ul className="space-y-2 text-sm text-[rgb(var(--foreground))]/70">
              <li>• Escrow inteligente que libera los fondos sólo si la meta se cumple.</li>
              <li>• Reembolsos automáticos y transparentes para cada patrocinador.</li>
              <li>• Integración rápida con múltiples tokens ERC20 y fees ajustables.</li>
            </ul>

            <div className="mt-4 grid gap-3 rounded-2xl border border-white/25 bg-white/60 p-4 text-sm text-[rgb(var(--foreground))]/75 shadow-lg shadow-[0_25px_60px_-45px_rgba(59,130,246,0.55)] backdrop-blur-md dark:border-white/10 dark:bg-white/10 sm:grid-cols-2">
              {stats.slice(0, 2).map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <span className="text-xl font-semibold text-[rgb(var(--foreground))]">
                    {typeof stat.value === "function" ? stat.value() : stat.value}
                  </span>
                  <span className="truncate text-[11px] uppercase tracking-wide text-[rgb(var(--foreground))]/55">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {activeProjects.length > 0 ? (
            <HeroSpotlight projects={activeProjects} />
          ) : (
            <div className="flex w-full max-w-sm flex-col items-center justify-center gap-3 self-center rounded-2xl border border-dashed border-white/30 bg-white/50 p-5 text-center text-sm text-[rgb(var(--foreground))]/65 shadow-[0_20px_60px_-45px_rgba(59,130,246,0.45)] backdrop-blur-md dark:border-white/15 dark:bg-white/10">
              <span className="text-base font-semibold text-[rgb(var(--foreground))]">Sin campañas activas</span>
              <p className="text-xs">
                Lanza tu primera campaña para que aparezca destacada en la portada.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const HeroSpotlight = ({ projects }: { projects: ProjectSummary[] }) => {
  const [index, setIndex] = useState(0);
  const items = projects.length > 0 ? projects : [];

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);

  if (items.length === 0) return null;

  const current = items[index];

  return (
    <div className="relative flex w-full max-w-md flex-col gap-4 lg:max-w-lg">
      <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/85 p-6 text-[rgb(var(--foreground))] shadow-[0_25px_90px_-50px_rgba(59,130,246,0.55)] backdrop-blur-xl dark:border-white/15 dark:bg-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.5),transparent_65%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--primary))]">
                #{current.id.toString().padStart(3, "0")}
              </span>
              <span className="rounded-full bg-[rgba(var(--primary),0.15)] px-3 py-1 text-[11px] font-semibold text-[rgb(var(--primary))]">
                {current.tokenSymbol}
              </span>
            </div>
            <h3 className="text-xl font-semibold leading-tight text-[rgb(var(--foreground))]">
              {current.title}
            </h3>
            <p className="line-clamp-3 text-sm text-[rgb(var(--foreground))]/70">
              {current.description || "Sin descripción proporcionada."}
            </p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/40 bg-white/65 p-4 text-[12px] text-[rgb(var(--foreground))]/65 shadow-inner shadow-[rgba(15,23,42,0.08)] backdrop-blur-lg dark:border-white/10 dark:bg-white/10 sm:grid-cols-2">
            <SpotlightInfo label="Meta" value={current.goalDisplay} />
            <SpotlightInfo label="Recaudado" value={current.raisedDisplay} />
            <SpotlightInfo label="Deadline" value={current.deadlineLabel} />
            <SpotlightInfo
              label="Estado"
              value={current.status === "active" ? "Activa" : current.status === "funded" ? "Financiada" : "Finalizada"}
            />
          </div>

          <Link
            href={`/project/${current.id}`}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-white/40 px-3 py-1.5 text-xs font-semibold text-[rgb(var(--foreground))] transition hover:border-white/60 hover:bg-white/40 dark:border-white/15 dark:hover:bg-white/10"
          >
            Ver detalles →
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[rgb(var(--foreground))]/60">
        <span>
          {index + 1} / {items.length}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/80 text-[rgb(var(--foreground))] shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/15 dark:bg-white/10"
            aria-label="Campaña anterior"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/80 text-[rgb(var(--foreground))] shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/15 dark:bg-white/10"
            aria-label="Campaña siguiente"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

const SpotlightInfo = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-wide text-[rgb(var(--foreground))]/55">
      {label}
    </span>
    <span className="text-sm font-semibold text-[rgb(var(--foreground))]">{value}</span>
  </div>
);


