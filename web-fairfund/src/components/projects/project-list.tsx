"use client";

import { useMemo } from "react";
import { ProjectCard } from "./project-card";
import { useProjects } from "@/hooks/useProjects";
import { useFairFundContract } from "@/hooks/useFairFundContract";
import { env } from "@/lib/env";

const SkeletonCard = () => (
  <div className="h-[320px] animate-pulse rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))]" />
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

  const tokenSummary = env.supportedTokens
    .map(
      (token) => `${token.symbol} (${token.address.slice(0, 6)}…${token.address.slice(-4)})`
    )
    .join(", ");

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14 sm:px-6">
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[rgb(var(--foreground))]">
              Campañas FairFund
            </h1>
            <p className="mt-1 text-sm text-[rgb(var(--foreground))]/70">
              Explora campañas activas, financiadas o fallidas gestionadas por el contrato escrow.
            </p>
          </div>
          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3">
            <SummaryCard label="Activas" value={stats.active} />
            <SummaryCard label="Financiadas" value={stats.funded} />
            <SummaryCard label="Total" value={stats.total} subValue={`${stats.failed} fallidas`} />
          </div>
        </div>
        <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-3 text-xs text-[rgb(var(--foreground))]/60">
          Tokens soportados configurados: {tokenSummary || "-"}
        </div>
      </div>

      {!isConfigured ? (
        <div className="rounded-lg border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 text-sm text-[rgb(var(--foreground))]/70">
          Configura las variables de entorno (`NEXT_PUBLIC_FAIRFUND_ADDRESS`, `NEXT_PUBLIC_RPC_URL`) o ejecuta el script
          <code className="mx-1 rounded bg-[rgb(var(--surface-muted))] px-1 py-0.5 text-xs">
            ./scripts/fairfund-manager.sh deploy-and-sync
          </code>
          para sincronizar el ABI y la dirección del contrato.
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Error obteniendo campañas: {(error as Error).message}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
            : projects.length === 0
            ? (
              <div className="col-span-full rounded-lg border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 text-sm text-[rgb(var(--foreground))]/70">
                Aún no hay campañas registradas. Sé el primero en crear una desde
                <span className="font-semibold text-blue-600"> /create</span>.
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
}: {
  label: string;
  value: number;
  subValue?: string;
}) => (
  <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-3">
    <p className="text-xs uppercase tracking-wide text-[rgb(var(--foreground))]/50">{label}</p>
    <p className="text-xl font-semibold text-[rgb(var(--foreground))]">{value}</p>
    {subValue && <p className="text-xs text-[rgb(var(--foreground))]/60">{subValue}</p>}
  </div>
);
