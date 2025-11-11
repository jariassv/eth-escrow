"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProject } from "@/hooks/useProjects";
import { useWallet } from "@/hooks/useWallet";
import { useProjectActions } from "@/hooks/useProjectActions";

const DetailSkeleton = () => (
  <div className="mt-6 grid gap-6 md:grid-cols-[2fr,1fr]">
    <div className="h-[360px] animate-pulse rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))]" />
    <div className="flex flex-col gap-4">
      <div className="h-[180px] animate-pulse rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))]" />
      <div className="h-[140px] animate-pulse rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))]" />
    </div>
  </div>
);

const contributionSchema = z.object({
  amount: z
    .string()
    .trim()
    .regex(/^(?!0(?:\.0+)?$)\d+(?:\.\d+)?$/, {
      message: "Ingresa un monto válido",
    }),
});

const fieldClasses =
  "flex flex-col gap-2 text-sm text-[rgb(var(--foreground))]/80";
const inputClasses =
  "w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--primary))]";

export const ProjectDetailClient = () => {
  const params = useParams<{ id: string }>();
  const projectId = Number(params?.id ?? 0);
  const { data, isLoading, error } = useProject(projectId);
  const { status, address } = useWallet();

  const projectTokenAddress = data?.tokenAddress ?? "0x0000000000000000000000000000000000000000";
  const {
    fund,
    refund,
    withdraw,
    fundStatus,
    refundStatus,
    withdrawStatus,
    message,
  } = useProjectActions(projectId, projectTokenAddress);

  const contributionForm = useForm<z.infer<typeof contributionSchema>>({
    resolver: zodResolver(contributionSchema),
    defaultValues: { amount: "" },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = contributionForm;

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

  const onContribute = handleSubmit(async ({ amount }) => {
    await fund(amount);
    reset({ amount: "" });
  });

  const isWalletConnected = status === "connected";
  const isCreator =
    isWalletConnected &&
    address &&
    data.creator.toLowerCase() === address.toLowerCase();

  const isFunding = fundStatus === "pending" || isSubmitting;
  const isRefunding = refundStatus === "pending";
  const isWithdrawing = withdrawStatus === "pending";
  const canWithdraw =
    isCreator && data.status === "funded" && !data.withdrawn;

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
              Creado por <span className="font-medium">{data.creator}</span>
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
          <Card>
            <CardHeader>
              <CardTitle>Aportar al proyecto</CardTitle>
              <p className="text-sm text-[rgb(var(--foreground))]/70">
                Necesitas aprobar el gasto del token y luego confirmar el aporte.
              </p>
            </CardHeader>
            <CardContent>
              {!isWalletConnected && (
                <div className="mb-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] p-3 text-xs text-[rgb(var(--foreground))]/70">
                  Conecta tu wallet para aportar.
                </div>
              )}

              <form onSubmit={onContribute} className="flex flex-col gap-4">
                <div className={fieldClasses}>
                  <label htmlFor="amount">Monto</label>
                  <input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="100"
                    disabled={!isWalletConnected || isFunding}
                    className={inputClasses}
                    {...register("amount")}
                  />
                  {errors.amount && (
                    <span className="text-xs text-red-500">{errors.amount.message}</span>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!isWalletConnected || isFunding}
                  isLoading={isFunding}
                >
                  {isFunding ? "Procesando..." : "Aportar"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Solicitar reembolso</CardTitle>
              <p className="text-sm text-[rgb(var(--foreground))]/70">
                Disponible cuando la campaña falla o es cancelada.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  void refund();
                }}
                disabled={!isWalletConnected || isRefunding}
                isLoading={isRefunding}
              >
                {isRefunding ? "Procesando..." : "Solicitar reembolso"}
              </Button>
              <div className="rounded-lg border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-3 text-xs text-[rgb(var(--foreground))]/70">
                Token ERC20: <span className="font-mono">{data.tokenAddress}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retirar fondos</CardTitle>
              <p className="text-sm text-[rgb(var(--foreground))]/70">
                Sólo disponible para el creador cuando la campaña fue financiada y aún no retiró.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  void withdraw();
                }}
                disabled={!canWithdraw || isWithdrawing}
                isLoading={isWithdrawing}
              >
                {isWithdrawing ? "Procesando..." : "Retirar fondos"}
              </Button>
              {!canWithdraw && (
                <span className="text-xs text-[rgb(var(--foreground))]/60">
                  Debes ser el creador y la campaña debe estar financiada.
                </span>
              )}
            </CardContent>
          </Card>

          {message && (
            <div
              className={`rounded-lg border p-4 text-sm ${
                fundStatus === "success" ||
                refundStatus === "success" ||
                withdrawStatus === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : fundStatus === "error" ||
                    refundStatus === "error" ||
                    withdrawStatus === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] text-[rgb(var(--foreground))]"
              }`}
            >
              {message}
            </div>
          )}
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
