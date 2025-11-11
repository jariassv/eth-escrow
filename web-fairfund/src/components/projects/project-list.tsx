"use client";

import { ProjectCard } from "./project-card";
import { useProjects } from "@/hooks/useProjects";
import { useFairFundContract } from "@/hooks/useFairFundContract";

const SkeletonCard = () => (
  <div className="h-[320px] animate-pulse rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))]" />
);

export const ProjectList = () => {
  const { isConfigured } = useFairFundContract();
  const { data, isLoading, error } = useProjects();

  const projects = data ?? [];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[rgb(var(--foreground))]">
            Campañas activas
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--foreground))]/70">
            Explora y apoya proyectos verificados que utilizan el escrow de FairFund.
          </p>
        </div>
        <div className="text-sm text-[rgb(var(--foreground))]/60">
          Tokens soportados: DAI, USDC, USDT
        </div>
      </div>

      {!isConfigured ? (
        <div className="rounded-lg border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 text-sm text-[rgb(var(--foreground))]/70">
          Configura las variables de entorno (`NEXT_PUBLIC_FAIRFUND_ADDRESS`, `NEXT_PUBLIC_RPC_URL`) o ejecuta el script{" "}
          <code className="mx-1 rounded bg-[rgb(var(--surface-muted))] px-1 py-0.5 text-xs">
            ./scripts/fairfund-manager.sh deploy-and-sync
          </code>{" "}
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
                Aún no hay campañas registradas. Sé el primero en crear una desde{" "}
                <span className="font-semibold text-blue-600">/create</span>.
              </div>
            )
            : projects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
    </section>
  );
};

