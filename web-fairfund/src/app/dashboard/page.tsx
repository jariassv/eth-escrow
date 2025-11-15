"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useProjects } from "@/hooks/useProjects";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { useContributionHistory } from "@/hooks/useContributionHistory";
import { env } from "@/lib/env";

export default function DashboardPage() {
  const { address, status, connect } = useWallet();
  const { data: projects } = useProjects();
  const {
    data: balances = [],
    isLoading: balancesLoading,
    error: balancesError,
  } = useWalletBalances(address);
  const {
    data: contributions = [],
    isLoading: contributionsLoading,
  } = useContributionHistory(address, projects ?? []);

  const ownedProjects = useMemo(
    () =>
      (projects ?? []).filter(
        (project) =>
          address && project.creator.toLowerCase() === address.toLowerCase()
      ),
    [projects, address]
  );

  const ownedStats = useMemo(() => {
    const total = ownedProjects.length;
    const funded = ownedProjects.filter((project) => project.status === "funded").length;
    const active = ownedProjects.filter((project) => project.status === "active").length;
    const withdrawn = ownedProjects.filter((project) => project.withdrawn).length;
    return { total, funded, active, withdrawn };
  }, [ownedProjects]);

  const isConnected = status === "connected";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 text-[rgb(var(--foreground))] sm:px-6">
      <header className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Mi panel</h1>
          <p className="text-sm text-[rgb(var(--foreground))]/65">
            Controla tus métricas personales, saldos y aportes en FairFund.
          </p>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center justify-center rounded-md border border-white/35 px-4 py-2 text-sm font-semibold text-[rgb(var(--foreground))] transition hover:border-white/60 hover:bg-white/50 dark:border-white/15 dark:hover:bg-white/10"
        >
          + Crear nueva campaña
        </Link>
      </header>

      {!isConnected ? (
        <div className="rounded-2xl border border-white/25 bg-white/70 p-6 text-sm text-[rgb(var(--foreground))]/70 shadow-[0_25px_70px_-45px_rgba(59,130,246,0.45)] backdrop-blur-md dark:border-white/15 dark:bg-white/10">
          Conecta tu wallet para sincronizar tus datos.
          <button
            onClick={() => {
              void connect();
            }}
            className="ml-3 inline-flex items-center rounded-md bg-[rgb(var(--primary))] px-3 py-1 text-xs font-semibold text-[rgb(var(--primary-foreground))] shadow-sm transition hover:opacity-90"
          >
            Conectar wallet
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Campañas" value={ownedStats.total} />
            <Metric label="Activas" value={ownedStats.active} />
            <Metric label="Financiadas" value={ownedStats.funded} />
            <Metric label="Retiros ejecutados" value={ownedStats.withdrawn} />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Panel title="Saldos por token" description="Wallet conectada en FairFund.">
              {env.supportedTokens.length === 0 ? (
                <EmptyState>
                  Configura <code>NEXT_PUBLIC_SUPPORTED_TOKENS</code> para visualizar saldos.
                </EmptyState>
              ) : balancesLoading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: env.supportedTokens.length || 2 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-xl border border-white/30 bg-white/60 dark:border-white/15 dark:bg-white/10"
                    />
                  ))}
                </div>
              ) : balancesError ? (
                <EmptyState variant="error">
                  Error al consultar los saldos de la wallet. {(balancesError as Error).message}
                </EmptyState>
              ) : balances.length === 0 ? (
                <EmptyState>No se detectaron balances para los tokens configurados.</EmptyState>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {balances.map((token) => (
                    <div
                      key={token.address}
                      className="rounded-xl border border-white/30 bg-white/70 p-4 text-sm shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{token.symbol}</span>
                        <span className="font-mono text-sm">{token.formatted}</span>
                      </div>
                      <p className="mt-2 text-xs text-[rgb(var(--foreground))]/55">
                        {token.address.slice(0, 6)}…{token.address.slice(-4)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel
              title="Historial de contribuciones"
              description="Aportes que has realizado en campañas FairFund."
            >
              {contributionsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-24 animate-pulse rounded-xl border border-white/30 bg-white/60 dark:border-white/15 dark:bg-white/10"
                    />
                  ))}
                </div>
              ) : contributions.length === 0 ? (
                <EmptyState>
                  Aún no has realizado aportes. Participa en campañas activas desde la página principal.
                </EmptyState>
              ) : (
                <div className="space-y-4">
                  {contributions.map((entry) => (
                    <Link
                      key={`${entry.projectId}-${entry.tokenAddress}`}
                      href={`/project/${entry.projectId}`}
                      className="group flex flex-col gap-2 rounded-2xl border border-white/30 bg-white/75 p-4 text-sm shadow-[0_25px_70px_-45px_rgba(59,130,246,0.55)] transition hover:-translate-y-1 hover:shadow-[0_30px_80px_-40px_rgba(59,130,246,0.6)] backdrop-blur-lg dark:border-white/15 dark:bg-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))]">
                          {entry.title}
                        </p>
                        <span className="rounded-full bg-[rgba(var(--primary),0.12)] px-3 py-1 text-[11px] font-semibold text-[rgb(var(--primary))]">
                          {entry.tokenSymbol}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[rgb(var(--foreground))]/60">
                        <span className="font-semibold text-[rgb(var(--foreground))]">
                          Aportado: {entry.contributedDisplay}
                        </span>
                        {entry.refunded > 0n ? (
                          <span className="rounded-full bg-emerald-100/70 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            Reembolsado: {entry.refundedDisplay}
                          </span>
                        ) : (
                          <span className="rounded-full bg-[rgba(var(--primary),0.1)] px-2 py-0.5 text-[11px] font-semibold text-[rgb(var(--primary))]">
                            Estado: {entry.status === "active" ? "Activa" : entry.status === "funded" ? "Financiada" : "Finalizada"}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Panel>
          </section>

          <Panel title="Campañas creadas" description="Proyectos que has publicado." className="w-full">
            {ownedProjects.length === 0 ? (
              <EmptyState>
                Aún no has creado campañas. Lanza una desde la sección Crear.
              </EmptyState>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ownedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col gap-1 rounded-xl border border-white/25 bg-white/70 p-4 text-sm shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{project.title}</span>
                      <span className="text-[11px] uppercase text-[rgb(var(--foreground))]/55">
                        {project.status === "active"
                          ? "Activa"
                          : project.status === "funded"
                          ? "Financiada"
                          : "Finalizada"}
                      </span>
                    </div>
                    <p className="text-xs text-[rgb(var(--foreground))]/60">
                      Meta: {project.goalDisplay} · Token {project.tokenSymbol}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}

const Panel = ({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`rounded-2xl border border-white/25 bg-white/70 p-6 shadow-[0_25px_70px_-45px_rgba(59,130,246,0.5)] backdrop-blur-md dark:border-white/15 dark:bg-white/10 ${className ?? ""}`.trim()}
  >
    <div className="mb-4 space-y-1">
      <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">{title}</h2>
      {description && (
        <p className="text-sm text-[rgb(var(--foreground))]/60">{description}</p>
      )}
    </div>
    {children}
  </section>
);

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl border border-white/30 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-white/10">
    <span className="text-xs uppercase tracking-wide text-[rgb(var(--foreground))]/55">
      {label}
    </span>
    <p className="mt-1 text-xl font-semibold text-[rgb(var(--foreground))]">{value}</p>
  </div>
);

const EmptyState = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: "error";
}) => (
  <div
    className={
      variant === "error"
        ? "rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        : "rounded-xl border border-white/30 bg-white/60 p-4 text-sm text-[rgb(var(--foreground))]/70 backdrop-blur-md dark:border-white/15 dark:bg-white/10"
    }
  >
    {children}
  </div>
);
