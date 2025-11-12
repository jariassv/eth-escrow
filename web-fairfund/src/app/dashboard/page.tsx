"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/useWallet";
import { useProjects } from "@/hooks/useProjects";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { env } from "@/lib/env";

export default function DashboardPage() {
  const { address, status, connect } = useWallet();
  const { data: projects } = useProjects();
  const {
    data: balances = [],
    isLoading: balancesLoading,
    error: balancesError,
  } = useWalletBalances(address);

  const ownedProjects = useMemo(
    () =>
      (projects ?? []).filter(
        (project) =>
          address &&
          project.creator.toLowerCase() === address.toLowerCase()
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
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[rgb(var(--foreground))]">
            Mi actividad
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--foreground))]/70">
            Visualiza tus campañas y lleva control de los retiros y aportes.
          </p>
        </div>
        <Link
          href="/create"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          + Crear nueva campaña
        </Link>
      </div>

      {!isConnected ? (
        <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 text-sm text-[rgb(var(--foreground))]/70">
          Conecta tu wallet para sincronizar campañas y aportes.
          <button
            onClick={() => {
              void connect();
            }}
            className="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
          >
            Conectar wallet
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Wallet conectada</CardTitle>
              <p className="text-sm text-[rgb(var(--foreground))]/60">
                Saldos disponibles para los tokens permitidos en FairFund.
              </p>
            </CardHeader>
            <CardContent>
              {env.supportedTokens.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-4 text-sm text-[rgb(var(--foreground))]/70">
                  Configura tokens en <code>NEXT_PUBLIC_SUPPORTED_TOKENS</code> para visualizar saldos.
                </div>
              ) : balancesLoading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: env.supportedTokens.length || 2 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))]"
                    />
                  ))}
                </div>
              ) : balancesError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  Error al consultar los saldos de la wallet. {(balancesError as Error).message}
                </div>
              ) : balances.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-4 text-sm text-[rgb(var(--foreground))]/70">
                  No se detectaron balances para los tokens configurados.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {balances.map((token) => (
                    <div
                      key={token.address}
                      className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[rgb(var(--foreground))]">
                          {token.symbol}
                        </span>
                        <span className="font-mono text-sm text-[rgb(var(--foreground))]">
                          {token.formatted}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[rgb(var(--foreground))]/60">
                        Token: {token.address.slice(0, 6)}…{token.address.slice(-4)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de campañas</CardTitle>
              <div className="grid grid-cols-2 gap-3 text-sm text-[rgb(var(--foreground))]/70">
                <div>
                  <p>Total</p>
                  <p className="text-lg font-semibold text-[rgb(var(--foreground))]">
                    {ownedStats.total}
                  </p>
                </div>
                <div>
                  <p>Activas</p>
                  <p className="text-lg font-semibold text-[rgb(var(--foreground))]">
                    {ownedStats.active}
                  </p>
                </div>
                <div>
                  <p>Financiadas</p>
                  <p className="text-lg font-semibold text-[rgb(var(--foreground))]">
                    {ownedStats.funded}
                  </p>
                </div>
                <div>
                  <p>Retiros ejecutados</p>
                  <p className="text-lg font-semibold text-[rgb(var(--foreground))]">
                    {ownedStats.withdrawn}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {ownedProjects.length === 0 ? (
                <p className="text-sm text-[rgb(var(--foreground))]/60">
                  Aún no has creado campañas. Lanza una desde la sección Crear.
                </p>
              ) : (
                ownedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-4"
                  >
                    <p className="text-sm font-semibold text-[rgb(var(--foreground))]">
                      {project.title}
                    </p>
                    <p className="text-xs text-[rgb(var(--foreground))]/60">
                      Estado: {project.status === "active" ? "Activa" : project.status === "funded" ? "Financiada" : "Finalizada"}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contribuciones</CardTitle>
              <p className="text-sm text-[rgb(var(--foreground))]/60">
                Próximamente mostraremos tu historial de aportes leyendo eventos del contrato.
              </p>
            </CardHeader>
            <CardContent className="text-sm text-[rgb(var(--foreground))]/60">
              Estamos preparando la consulta de contribuciones. Vuelve pronto para ver totales y estados de reembolso.
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
