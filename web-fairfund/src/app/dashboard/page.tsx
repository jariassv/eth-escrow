import Link from "next/link";
import { mockContributions, mockProjects } from "@/lib/mocks/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[rgb(var(--foreground))]">
            Mi actividad
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--foreground))]/70">
            Aquí verás tus campañas creadas y aportes cuando conectes tu wallet.
            Mostramos algunos datos de ejemplo mientras se integra la lógica on-chain.
          </p>
        </div>
        <Link
          href="/create"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          + Crear nueva campaña
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campañas creadas</CardTitle>
            <p className="text-sm text-[rgb(var(--foreground))]/60">
              Este listado se poblará con `fairFund.getProjects` filtrado por tu wallet.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {mockProjects.slice(0, 1).map((project) => (
              <div key={project.id} className="rounded-lg bg-[rgb(var(--surface-muted))] p-4">
                <p className="text-sm font-semibold text-[rgb(var(--foreground))]">
                  {project.title}
                </p>
                <p className="text-xs text-[rgb(var(--foreground))]/60">
                  Progreso: {project.raised} / {project.goal}
                </p>
              </div>
            ))}
            <p className="text-xs text-[rgb(var(--foreground))]/50">
              Tip: usa el script `deploy-and-sync` para obtener el ABI actualizado y enlazarlo con
              los hooks del frontend.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mis contribuciones</CardTitle>
            <p className="text-sm text-[rgb(var(--foreground))]/60">
              Datos de ejemplo hasta conectar con eventos reales del contrato.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {mockContributions.map((contribution, index) => (
              <div
                key={`${contribution.projectId}-${index}`}
                className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-4"
              >
                <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                  Proyecto #{contribution.projectId} · {contribution.amount}
                </p>
                <p className="text-xs text-[rgb(var(--foreground))]/60">
                  {new Date(contribution.timestamp).toLocaleString("es-ES", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

