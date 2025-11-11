"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProject } from "@/hooks/useProjects";

const DetailSkeleton = () => (
  <div className="mt-6 grid gap-6 md:grid-cols-[2fr,1fr]">
    <div className="h-[360px] animate-pulse rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))]" />
    <div className="flex flex-col gap-4">
      <div className="h-[180px] animate-pulse rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))]" />
      <div className="h-[140px] animate-pulse rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))]" />
    </div>
  </div>
);

export const ProjectDetailClient = () => {
  const params = useParams<{ id: string }>();
  const projectId = Number(params?.id ?? 0);
  const { data, isLoading, error } = useProject(projectId);

  if (isLoading) {
    return (
      <>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Volver al listado
        </Link>
        <DetailSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Volver al listado
        </Link>
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Error obteniendo la campaña: {(error as Error).message}
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Volver al listado
        </Link>
        <div className="mt-6 rounded-lg border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 text-sm text-[rgb(var(--foreground))]/70">
          La campaña solicitada no existe o aún no se indexa. Verifica el identificador.
        </div>
      </>
    );
  }

  return (
    <>
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Volver al listado
      </Link>

      <section className="mt-6 grid gap-6 md:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{data.title}</CardTitle>
            <p className="text-sm text-[rgb(var(--foreground))]/70">
              Creado por{" "}
              <span className="font-medium">{data.creator}</span>
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <p className="text-sm leading-relaxed text-[rgb(var(--foreground))]/80">
              {data.description || "Sin descripción detallada registrada."}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Detail label="Meta" value={data.goalDisplay} />
              <Detail label="Recaudado" value={data.raisedDisplay} />
              <Detail label="Total reembolsado" value={data.totalRefundedDisplay} />
              <Detail label="Token" value={data.tokenSymbol} />
              <Detail label="Deadline" value={data.deadlineLabel} />
              <Detail
                label="Estado"
                value={
                  data.status === "active"
                    ? "Activa"
                    : data.status === "funded"
                    ? "Financiada"
                    : "Finalizada"
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
              La interacción de aporte se habilitará cuando finalicemos la integración de escritura
              mediante `useFairFundContract` y el ABI real sincronizado.
            </p>
            <Button className="mt-4" disabled>
              Aportar (próximamente)
            </Button>
          </div>
          <div className="rounded-xl border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 text-sm text-[rgb(var(--foreground))]/60">
            Token ERC20: <span className="font-mono text-xs">{data.tokenAddress}</span>
          </div>
        </aside>
      </section>
    </>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-[rgb(var(--surface-muted))] p-4">
    <p className="text-xs uppercase tracking-wide text-[rgb(var(--foreground))]/50">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-[rgb(var(--foreground))]">
      {value}
    </p>
  </div>
);

