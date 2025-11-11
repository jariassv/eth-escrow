"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/useWallet";
import { useProjects } from "@/hooks/useProjects";

export default function DashboardPage() {
  const { address, status, connect } = useWallet();
  const { data: projects } = useProjects();

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
