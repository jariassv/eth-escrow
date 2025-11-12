"use client";

import { useMemo } from "react";
import { ProjectCard } from "./project-card";
import { useProjects } from "@/hooks/useProjects";
import { useFairFundContract } from "@/hooks/useFairFundContract";
import { env } from "@/lib/env";

const SkeletonCard = () => (
  <div className="h-[320px] animate-pulse rounded-2xl border border-white/40 bg-white/50 shadow-lg shadow-[var(--shadow)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5" />
);

export const ProjectList = () => {
  const { isConfigured } = useFairFundContract();
  const { data, isLoading, error } = useProjects();

  const projects = useMemo(() => data ?? [], [data]);
  const stats = useMemo(() => {
    const funded = projects.filter((project) => project.status === "funded").length;
    const active = projects.filter((project) => project.status === "active").length;
    const failed = projects.filter((project) => project.status === "failed").length;
    return { total: projects.length, funded, active, failed };
  }, [projects]);

  const tokenBadges = env.supportedTokens;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="mb-10 grid gap-6 rounded-3xl border border-white/30 bg-white/60 p-6 shadow-xl shadow-[rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))] sm:text-3xl">
              Campañas activas de la comunidad
            </h2>
            <p className="max-w-2xl text-sm text-[rgb(var(--foreground))]/70 sm:text-base">
              Revisa el estado de cada campaña, cuánto han recaudado y cuál es el token utilizado.
              Toda la información proviene directamente del contrato inteligente en la red que
              configuraste.
            </p>
            <div className="flex flex-wrap gap-2">
              {tokenBadges.length === 0 ? (
                <span className="rounded-full border border-dashed border-[rgb(var(--border))] px-3 py-1 text-xs font-medium text-[rgb(var(--foreground))]/60">
                  Configura <code>NEXT_PUBLIC_SUPPORTED_TOKENS</code> para ver los tokens permitidos
                </span>
              ) : (
                tokenBadges.map((token) => (
                  <span
                    key={token.address}
                    className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-3 py-1 text-xs font-medium text-[rgb(var(--foreground))] shadow-sm dark:border-white/15 dark:bg-white/10"
                  >
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[rgb(var(--primary))] via-[rgb(var(--accent))] to-[rgb(var(--accent-secondary))]" />
                    {token.symbol}
                    <span className="text-[rgb(var(--foreground))]/50">
                      {token.address.slice(0, 6)}…{token.address.slice(-4)}
                    </span>
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
            <SummaryCard label="Activas" value={stats.active} highlight="🔥" />
            <SummaryCard label="Financiadas" value={stats.funded} highlight="🎉" />
            <SummaryCard label="En campaña" value={stats.total} subValue={`${stats.failed} fallidas`} />
          </div>
        </div>
      </div>

      {!isConfigured ? (
        <div className="rounded-2xl border border-dashed border-[rgb(var(--border))] bg-white/60 p-6 text-sm text-[rgb(var(--foreground))]/70 shadow-sm backdrop-blur-sm dark:bg-white/5">
          Configura las variables de entorno (`NEXT_PUBLIC_FAIRFUND_ADDRESS`, `NEXT_PUBLIC_RPC_URL`) o ejecuta el script
          <code className="mx-1 rounded bg-[rgb(var(--surface-muted))] px-1 py-0.5 text-xs">
            ./scripts/fairfund-manager.sh deploy-and-sync
          </code>
          para sincronizar el ABI y la dirección del contrato.
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6 text-sm text-red-700 shadow-sm">
          Error obteniendo campañas: {(error as Error).message}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
            : projects.length === 0
            ? (
              <div className="col-span-full rounded-2xl border border-dashed border-[rgb(var(--border))] bg-white/60 p-6 text-sm text-[rgb(var(--foreground))]/70 shadow-sm backdrop-blur-sm dark:bg-white/5">
                Aún no hay campañas registradas. Sé el primero en crear una desde
                <span className="font-semibold text-[rgb(var(--primary))]"> /create</span>.
              </div>
            )
            : projects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
    </section>
  );
};

const SummaryCard = ({
  label,
  value,
  subValue,
  highlight,
}: {
  label: string;
  value: number;
  subValue?: string;
  highlight?: string;
}) => (
  <div className="rounded-2xl border border-white/50 bg-white/60 p-4 shadow-md shadow-[rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-wide text-[rgb(var(--foreground))]/50">
        {label}
      </p>
      {highlight && <span className="text-lg">{highlight}</span>}
    </div>
    <p className="mt-1 text-2xl font-semibold text-[rgb(var(--foreground))]">{value}</p>
    {subValue && <p className="text-xs text-[rgb(var(--foreground))]/60">{subValue}</p>}
  </div>
);
