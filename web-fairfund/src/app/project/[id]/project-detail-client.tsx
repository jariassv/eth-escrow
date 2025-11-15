"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/useProjects";
import { useWallet } from "@/hooks/useWallet";
import { useProjectActions } from "@/hooks/useProjectActions";
import { cn } from "@/lib/utils";

const DetailSkeleton = () => (
  <div className="mt-8 flex flex-col-reverse gap-4 md:flex-row md:items-start">
    <div className="flex flex-col gap-3 md:w-[320px]">
      <div className="h-32 animate-pulse rounded-xl border border-white/25 bg-white/60 backdrop-blur-md dark:border-white/10 dark:bg-white/10" />
      <div className="h-32 animate-pulse rounded-xl border border-white/25 bg-white/60 backdrop-blur-md dark:border-white/10 dark:bg-white/10" />
      <div className="h-28 animate-pulse rounded-xl border border-white/25 bg-white/60 backdrop-blur-md dark:border-white/10 dark:bg-white/10" />
    </div>
    <div className="h-[360px] flex-1 animate-pulse rounded-xl border border-white/25 bg-white/65 backdrop-blur-md dark:border-white/10 dark:bg-white/10" />
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
  "w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm text-[rgb(var(--foreground))] shadow-inner shadow-[rgba(15,23,42,0.05)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--primary))] dark:border-white/10 dark:bg-white/10";

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
      <Link
        href="/"
        className="inline-flex items-center text-sm font-semibold text-[rgb(var(--primary))] transition hover:text-[rgb(var(--accent))]"
      >
        ← Volver al listado
      </Link>

      <section className="relative mt-8 space-y-5">
        <div className="flex flex-col-reverse gap-5 md:flex-row md:items-start">
          <aside className="flex flex-col gap-3 md:w-[320px] md:sticky md:top-24">
            <ActionCard
              title="Aportar al proyecto"
              description="Aprueba y firma tu transacción para apoyar la campaña con el token seleccionado."
              footer={
                !isWalletConnected && (
                  <div className="mb-3 rounded-lg border border-dashed border-white/35 bg-white/50 p-2 text-xs text-[rgb(var(--foreground))]/70 dark:border-white/15 dark:bg-white/10">
                    Conecta tu wallet para poder aportar.
                  </div>
                )
              }
            >
              <form onSubmit={onContribute} className="flex flex-col gap-3">
                <div className={fieldClasses}>
                  <label
                    htmlFor="amount"
                    className="text-[11px] font-medium uppercase tracking-wide text-[rgb(var(--foreground))]/50"
                  >
                    Monto a aportar
                  </label>
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
                  className="w-full"
                >
                  {isFunding ? "Procesando..." : "Aportar ahora"}
                </Button>
              </form>
            </ActionCard>

            <ActionCard
              title="Solicitar reembolso"
              description="Disponible cuando la campaña no alcance la meta o sea cancelada por su creador."
            >
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    void refund();
                  }}
                  disabled={!isWalletConnected || isRefunding}
                  isLoading={isRefunding}
                  className="w-full border-white/40 text-[rgb(var(--foreground))] hover:border-white/60 hover:bg-white/50 dark:border-white/15 dark:hover:bg-white/10"
                >
                  {isRefunding ? "Procesando..." : "Solicitar reembolso"}
                </Button>
                <div className="rounded-lg border border-dashed border-white/35 bg-white/50 p-2 text-xs text-[rgb(var(--foreground))]/70 dark:border-white/15 dark:bg-white/5">
                  Token ERC20:
                  <br />
                  <span className="font-mono text-[11px]">{data.tokenAddress}</span>
                </div>
              </div>
            </ActionCard>

            <ActionCard
              title="Retirar fondos"
              description="Disponible sólo para el creador cuando la campaña alcanzó la meta y aún no retiró."
            >
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    void withdraw();
                  }}
                  disabled={!canWithdraw || isWithdrawing}
                  isLoading={isWithdrawing}
                  className="w-full"
                >
                  {isWithdrawing ? "Procesando..." : "Retirar fondos"}
                </Button>
                {!canWithdraw && (
                  <span className="text-xs text-[rgb(var(--foreground))]/60">
                    Debes ser el creador y la campaña debe estar financiada.
                  </span>
                )}
              </div>
            </ActionCard>

            {message && (
              <div
                className={cn(
                  "rounded-lg border p-3 text-sm shadow-lg backdrop-blur-md",
                  fundStatus === "success" ||
                    refundStatus === "success" ||
                    withdrawStatus === "success"
                    ? "border-emerald-200 bg-emerald-100/70 text-emerald-700"
                    : fundStatus === "error" ||
                      refundStatus === "error" ||
                      withdrawStatus === "error"
                    ? "border-rose-200 bg-rose-100/70 text-rose-700"
                    : "border-white/30 bg-white/60 text-[rgb(var(--foreground))]/80 dark:border-white/10 dark:bg-white/10"
                )}
              >
                {message}
              </div>
            )}
          </aside>

          <article className="relative flex-1 rounded-2xl border border-white/25 bg-white/75 p-6 shadow-[0_20px_60px_-40px_rgba(59,130,246,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
            <span
              className={cn(
                "absolute -top-4 right-6 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm dark:border-white/10 dark:bg-white/15",
                {
                  "text-emerald-600": data.status === "funded",
                  "text-blue-600": data.status === "active",
                  "text-rose-600": data.status === "failed",
                }
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  data.status === "funded"
                    ? "bg-emerald-500"
                    : data.status === "active"
                    ? "bg-blue-500"
                    : "bg-rose-500"
                )}
              />
              {data.status === "active"
                ? "Activa"
                : data.status === "funded"
                ? "Financiada"
                : "Finalizada"}
            </span>
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[rgb(var(--foreground))]/60 dark:border-white/10 dark:bg-white/10">
                    Campaña #{projectId}
                  </span>
                  <h1 className="text-2xl font-semibold text-[rgb(var(--foreground))] sm:text-[28px]">
                    {data.title}
                  </h1>
                  <p className="text-sm text-[rgb(var(--foreground))]/60">
                    Creada por <span className="font-medium text-[rgb(var(--foreground))]">{data.creator}</span>
                  </p>
                </div>
              </div>

              <p className="max-w-3xl text-sm leading-relaxed text-[rgb(var(--foreground))]/75 line-clamp-6">
                {data.description || "Sin descripción detallada registrada para esta campaña."}
              </p>

              <div className="grid gap-3 rounded-xl border border-white/35 bg-white/65 p-4 shadow-inner shadow-[rgba(15,23,42,0.02)] backdrop-blur-lg dark:border-white/10 dark:bg-white/5 sm:grid-cols-2">
                <Detail label="Meta" value={data.goalDisplay} />
                <Detail label="Recaudado" value={data.raisedDisplay} />
                <Detail label="Total reembolsado" value={data.totalRefundedDisplay} />
                <Detail label="Token" value={data.tokenSymbol} />
                <Detail label="Deadline" value={data.deadlineLabel} />
                <Detail label="Dirección token" value={`${data.tokenAddress.slice(0, 10)}…${data.tokenAddress.slice(-6)}`} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[rgb(var(--foreground))]/60">
                  <span>Progreso de la campaña</span>
                  <span>
                    {Math.min(100, Math.round(data.progress * 100))}
                    %
                  </span>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full bg-[rgba(148,163,184,0.2)]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transition-all"
                    style={{ width: `${Math.min(100, Math.round(data.progress * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-white/70 p-3 shadow-inner shadow-[rgba(15,23,42,0.02)] dark:bg-white/5">
    <p className="text-[10px] uppercase tracking-wide text-[rgb(var(--foreground))]/45">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-[rgb(var(--foreground))]">
      {value}
    </p>
  </div>
);

const ActionCard = ({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-white/25 bg-white/70 p-4 shadow-lg shadow-[rgba(15,23,42,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-white/10">
    <div className="mb-3 space-y-1.5">
      <h2 className="text-sm font-semibold text-[rgb(var(--foreground))]">{title}</h2>
      <p className="text-xs text-[rgb(var(--foreground))]/60">{description}</p>
    </div>
    {footer}
    {children}
  </div>
);
