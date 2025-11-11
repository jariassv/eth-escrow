"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/useWallet";
import { useProjects } from "@/hooks/useProjects";

export default function DashboardPage() {
  const { address, status, connect } = useWallet();
  const { data } = useProjects();

  const ownedProjects = useMemo(
    () =>
      (data ?? []).filter(
        (project) =>
          address &&
          project.creator.toLowerCase() === address.toLowerCase()
      ),
    [data, address]
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[rgb(var(--foreground))]">
            Mi actividad
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--foreground))]/70">
            Visualiza las campañas que has creado y tus aportes una vez conectes tu wallet.
          </p>
        </div>
        <Link
          href="/create"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          + Crear nueva campaña
        </Link>
      </div>

      {status !== "connected" ? (
        <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 text-sm text-[rgb(var(--foreground))]/70">
          Conecta tu wallet para sincronizar tus campañas y aportes.
          <button
            onClick={() => {
              void connect();
            }}
            className="mt-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
          >
            Conectar wallet
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Mis campañas</CardTitle>
              <p className="text-sm text-[rgb(var(--foreground))]/60">
                Se listan proyectos creados con la cuenta conectada.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {ownedProjects.length === 0 ? (
                <p className="text-sm text-[rgb(var(--foreground))]/60">
                  Aún no has creado campañas. Ve a <span className="font-medium text-blue-600">/create</span> para iniciar una.
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
                      Recaudado: {project.raisedDisplay} / {project.goalDisplay}
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
                Próximamente integraremos el historial leyendo eventos del contrato.
              </p>
            </CardHeader>
            <CardContent className="text-sm text-[rgb(var(--foreground))]/60">
              Estamos preparando la consulta de `Contribution` para que puedas ver tus aportes y estados de reembolso.
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

