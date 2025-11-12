import Link from "next/link";
import type { ProjectSummary } from "@/types/project";
import { cn } from "@/lib/utils";

const statusStyles: Record<ProjectSummary["status"], string> = {
  active: "bg-amber-500/15 text-amber-600",
  funded: "bg-emerald-500/15 text-emerald-600",
  failed: "bg-rose-500/15 text-rose-600",
};

const statusLabel: Record<ProjectSummary["status"], string> = {
  active: "Activa",
  funded: "Financiada",
  failed: "Finalizada",
};

export const ProjectCard = ({ project }: { project: ProjectSummary }) => {
  const progressPercent = Math.min(100, Math.round(project.progress * 100));

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg shadow-[rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-[rgba(79,70,229,0.18)] dark:border-white/10 dark:bg-white/10">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[rgb(var(--primary))] via-[rgb(var(--accent))] to-[rgb(var(--accent-secondary))]" />
      <div className="flex flex-1 flex-col gap-5 pt-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                {project.title}
              </h3>
              <p className="text-xs text-[rgb(var(--foreground))]/60">
                Creado por {project.creator}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                statusStyles[project.status]
              )}
            >
              {statusLabel[project.status]}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[rgb(var(--foreground))]/75 line-clamp-3">
            {project.description || "Sin descripción detallada cargada para esta campaña."}
          </p>
        </div>

        <div className="grid gap-4 rounded-2xl border border-white/50 bg-white/70 p-4 text-sm shadow-sm dark:border-white/10 dark:bg-white/5 md:grid-cols-2">
          <InfoItem label="Meta" value={project.goalDisplay} />
          <InfoItem label="Recaudado" value={project.raisedDisplay} />
          <InfoItem label="Token" value={project.tokenSymbol} />
          <InfoItem label="Deadline" value={project.deadlineLabel} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[rgb(var(--foreground))]/60">
            <span>Progreso de aporte</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-[rgba(148,163,184,0.2)]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[rgb(var(--primary))] via-[rgb(var(--accent))] to-[rgb(var(--accent-secondary))] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-auto pt-1">
          <Link
            href={`/project/${project.id}`}
            className="inline-flex items-center text-sm font-semibold text-[rgb(var(--primary))] transition hover:text-[rgb(var(--accent))]"
          >
            Ver detalles
            <span aria-hidden className="ml-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs uppercase tracking-wide text-[rgb(var(--foreground))]/45">
      {label}
    </span>
    <span className="text-sm font-semibold text-[rgb(var(--foreground))]">{value}</span>
  </div>
);

