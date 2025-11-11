import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectSummary } from "@/types/project";
import { cn } from "@/lib/utils";

const statusStyles: Record<ProjectSummary["status"], string> = {
  active: "text-blue-600 bg-blue-600/10",
  funded: "text-green-600 bg-green-600/10",
  failed: "text-red-600 bg-red-600/10",
};

export const ProjectCard = ({ project }: { project: ProjectSummary }) => {
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
            {project.status === "active" ? "Activa" : project.status === "funded" ? "Financiada" : "Fallida"}
          </span>
        </div>
        <p className="text-sm text-[rgb(var(--foreground))]/60">
          Creado por {project.creator}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-sm leading-relaxed text-[rgb(var(--foreground))]/80">
          {project.description}
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[rgb(var(--foreground))]/60">Meta</p>
            <p className="font-semibold text-[rgb(var(--foreground))]">{project.goal}</p>
          </div>
          <div>
            <p className="text-[rgb(var(--foreground))]/60">Recaudado</p>
            <p className="font-semibold text-[rgb(var(--foreground))]">{project.raised}</p>
          </div>
          <div>
            <p className="text-[rgb(var(--foreground))]/60">Aportantes</p>
            <p className="font-semibold text-[rgb(var(--foreground))]">{project.backers}</p>
          </div>
          <div>
            <p className="text-[rgb(var(--foreground))]/60">Deadline</p>
            <p className="font-semibold text-[rgb(var(--foreground))]">{project.deadline}</p>
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

