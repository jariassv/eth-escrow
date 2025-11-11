import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectSummary } from "@/types/project";
import { cn } from "@/lib/utils";

const statusStyles: Record<ProjectSummary["status"], string> = {
  active: "text-blue-600 bg-blue-600/10",
  funded: "text-green-600 bg-green-600/10",
  failed: "text-red-600 bg-red-600/10",
};

const statusLabel: Record<ProjectSummary["status"], string> = {
  active: "Activa",
  funded: "Financiada",
  failed: "Finalizada",
};

export const ProjectCard = ({ project }: { project: ProjectSummary }) => {
  const progressPercent = Math.round(project.progress * 100);

  return (
    <Card className="flex h-full flex-col gap-4">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{project.title}</CardTitle>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              statusStyles[project.status]
            )}
          >
            {statusLabel[project.status]}
          </span>
        </div>
        <p className="text-sm text-[rgb(var(--foreground))]/60">
          Creado por {project.creator}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-sm leading-relaxed text-[rgb(var(--foreground))]/80 line-clamp-3">
          {project.description || "Sin descripción cargada."}
        </p>
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <p className="text-[rgb(var(--foreground))]/60">Meta</p>
            <p className="font-semibold text-[rgb(var(--foreground))]">
              {project.goalDisplay}
            </p>
          </div>
          <div>
            <p className="text-[rgb(var(--foreground))]/60">Recaudado</p>
            <p className="font-semibold text-[rgb(var(--foreground))]">
              {project.raisedDisplay}
            </p>
          </div>
          <div>
            <p className="text-[rgb(var(--foreground))]/60">Token</p>
            <p className="font-semibold text-[rgb(var(--foreground))]">
              {project.tokenSymbol}
            </p>
          </div>
          <div>
            <p className="text-[rgb(var(--foreground))]/60">Deadline</p>
            <p className="font-semibold text-[rgb(var(--foreground))]">
              {project.deadlineLabel}
            </p>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-[rgb(var(--foreground))]/60">
            <span>Progreso</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-[rgb(var(--surface-muted))]">
            <div
              className={cn("h-full rounded-full bg-blue-500 transition-all")}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="mt-auto">
          <Link
            href={`/project/${project.id}`}
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            Ver detalles →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

