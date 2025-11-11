import { notFound } from "next/navigation";
import Link from "next/link";
import { mockProjects } from "@/lib/mocks/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProjectPageProps = {
  params: {
    id: string;
  };
};

export default function ProjectDetailPage({ params }: ProjectPageProps) {
  const projectId = Number(params.id);
  const project = mockProjects.find((item) => item.id === projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Volver al listado
      </Link>

      <section className="mt-6 grid gap-6 md:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{project.title}</CardTitle>
            <p className="text-sm text-[rgb(var(--foreground))]/70">
              Creado por <span className="font-medium">{project.creator}</span>
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <p className="text-sm leading-relaxed text-[rgb(var(--foreground))]/80">
              {project.description}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Detail label="Meta" value={project.goal} />
              <Detail label="Recaudado" value={project.raised} />
              <Detail label="Token" value={project.tokenSymbol} />
              <Detail label="Deadline" value={project.deadline} />
              <Detail label="Aportantes" value={`${project.backers}`} />
              <Detail
                label="Estado"
                value={
                  project.status === "active"
                    ? "Activa"
                    : project.status === "funded"
                    ? "Financiada"
                    : "Fallida"
                }
              />
            </div>
          </CardContent>
        </Card>

        <aside className="flex flex-col gap-4">
          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
              Aportar al proyecto
            </h2>
            <p className="mt-2 text-sm text-[rgb(var(--foreground))]/70">
              La interacción directa con el contrato estará disponible en la siguiente iteración.
            </p>
            <Button className="mt-4" disabled>
              Aportar (próximamente)
            </Button>
          </div>
          <div className="rounded-xl border border-dashed border-[rgb(var(--border))] p-6 text-sm text-[rgb(var(--foreground))]/60">
            <p>
              Esta vista consumirá los datos reales desde el contrato mediante eventos y React Query.
              Por ahora se muestra contenido de ejemplo para avanzar en diseño y flujo.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-[rgb(var(--surface-muted))] p-4">
    <p className="text-xs uppercase tracking-wide text-[rgb(var(--foreground))]/50">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-[rgb(var(--foreground))]">{value}</p>
  </div>
);

