"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { parseUnits } from "ethers";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useFairFundContract } from "@/hooks/useFairFundContract";
import { env } from "@/lib/env";
import { getTokenMetadata } from "@/lib/token-metadata";

const fieldClasses =
  "flex flex-col gap-2 text-sm text-[rgb(var(--foreground))]/80";
const inputClasses =
  "w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--primary))]";

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Ingresa un título descriptivo"),
  description: z
    .string()
    .trim()
    .min(10, "Describe brevemente la campaña"),
  token: z.string().min(1, "Selecciona un token"),
  goal: z
    .string()
    .trim()
    .regex(/^(?!0(?:\.0+)?$)\d+(?:\.\d+)?$/, {
      message: "Ingresa un monto válido",
    }),
  durationDays: z.coerce
    .number({ invalid_type_error: "Ingresa los días de duración" })
    .int("Debe ser un número entero")
    .min(1, "La duración mínima es 1 día")
    .max(180, "La duración máxima sugerida es 180 días"),
  documentationUrl: z
    .string()
    .trim()
    .url("URL inválida")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function CreateProjectPage() {
  const router = useRouter();
  const { status, connect } = useWallet();
  const { contractWithSigner, readOnlyProvider } = useFairFundContract();
  const supportedTokens = env.supportedTokens;

  const isWalletConnected = status === "connected";
  const isContractReady = Boolean(contractWithSigner);
  const isDisabled = !isWalletConnected || !isContractReady;

  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      token: supportedTokens[0]?.address ?? "",
      goal: "",
      durationDays: 30,
      documentationUrl: "",
    },
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    if (!contractWithSigner) {
      setTxStatus("error");
      setTxError("Conecta tu wallet para firmar la transacción.");
      toast.error("Wallet no conectada", {
        description: "Conecta tu wallet para crear un proyecto.",
      });
      return;
    }

    const tokenConfig = supportedTokens.find(
      (token) => token.address.toLowerCase() === values.token.toLowerCase()
    );

    if (!tokenConfig) {
      setTxStatus("error");
      setTxError("El token seleccionado no está configurado en el entorno.");
      toast.error("Token no válido", {
        description: "El token seleccionado no está configurado en el entorno.",
      });
      return;
    }

    try {
      setTxStatus("pending");
      setTxError(null);
      setTxHash(null);
      const loadingToast = toast.loading("Creando proyecto...", {
        description: "Preparando la transacción",
      });

      const metadata = await getTokenMetadata(
        tokenConfig.address,
        readOnlyProvider ?? contractWithSigner.runner ?? contractWithSigner.provider
      );

      const goalAmount = parseUnits(values.goal, metadata.decimals);
      const durationSeconds = BigInt(values.durationDays) * 86_400n;

      const tx = await contractWithSigner.createProject(
        tokenConfig.address,
        values.title,
        values.description,
        goalAmount,
        durationSeconds
      );

      setTxHash(tx.hash);
      toast.loading("Transacción enviada", {
        id: loadingToast,
        description: `Esperando confirmación... Hash: ${tx.hash.slice(0, 10)}...`,
      });
      await tx.wait();

      setTxStatus("success");
      toast.success("Proyecto creado exitosamente", {
        id: loadingToast,
        description: `"${values.title}" ha sido publicado correctamente.`,
      });
      reset({
        title: "",
        description: "",
        token: supportedTokens[0]?.address ?? "",
        goal: "",
        durationDays: 30,
        documentationUrl: "",
      });
      
      // Redirigir al listado después de un breve delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("[create-project]", error);
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo crear la campaña";
      setTxStatus("error");
      setTxError(errorMessage);
      toast.error("Error al crear el proyecto", {
        description: errorMessage,
      });
    }
  });

  const isFormDisabled = isDisabled || isSubmitting;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[rgb(var(--foreground))]">
            Lanzar nueva campaña
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[rgb(var(--foreground))]/70">
            Define los parámetros clave de tu campaña (token admitido, meta y deadline).
            El contrato FairFund custodiará los fondos hasta que se cumpla la meta.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Volver al listado
        </Link>
      </div>

      {!isWalletConnected && (
        <div className="mb-6 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-4 text-sm text-[rgb(var(--foreground))]/70">
          Conecta tu wallet para poder enviar la transacción de creación.
          <button
            onClick={() => {
              void connect();
            }}
            className="ml-2 inline-flex items-center rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
          >
            Conectar wallet
          </button>
        </div>
      )}

      {supportedTokens.length === 0 && (
        <div className="mb-6 rounded-lg border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-4 text-sm text-[rgb(var(--foreground))]/70">
          Configura <code>NEXT_PUBLIC_SUPPORTED_TOKENS</code> en tu entorno con los tokens permitidos para las campañas.
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="grid gap-6 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-sm"
      >
        <div className={fieldClasses}>
          <label htmlFor="title" className="font-medium text-[rgb(var(--foreground))]">
            Título de la campaña
          </label>
          <input
            id="title"
            placeholder="Semilla para huertos urbanos"
            className={inputClasses}
            disabled={isFormDisabled}
            {...register("title")}
          />
          {errors.title && (
            <span className="text-xs text-red-500">{errors.title.message}</span>
          )}
        </div>
        <div className={fieldClasses}>
          <label
            htmlFor="description"
            className="font-medium text-[rgb(var(--foreground))]"
          >
            Descripción
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Describe el objetivo, entregables y métrica de éxito."
            className={inputClasses}
            disabled={isFormDisabled}
            {...register("description")}
          />
          {errors.description && (
            <span className="text-xs text-red-500">
              {errors.description.message}
            </span>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className={fieldClasses}>
            <label htmlFor="token" className="font-medium text-[rgb(var(--foreground))]">
              Token ERC20 permitido
            </label>
            <select
              id="token"
              className={inputClasses}
              disabled={isFormDisabled || supportedTokens.length === 0}
              {...register("token")}
            >
              {supportedTokens.length === 0 ? (
                <option value="">Sin tokens configurados</option>
              ) : (
                supportedTokens.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol}
                  </option>
                ))
              )}
            </select>
            {errors.token && (
              <span className="text-xs text-red-500">{errors.token.message}</span>
            )}
          </div>
          <div className={fieldClasses}>
            <label htmlFor="goal" className="font-medium text-[rgb(var(--foreground))]">
              Meta (en unidades del token)
            </label>
            <input
              id="goal"
              type="number"
              min="0"
              step="0.01"
              placeholder="50000"
              className={inputClasses}
              disabled={isFormDisabled}
              {...register("goal")}
            />
            {errors.goal && (
              <span className="text-xs text-red-500">{errors.goal.message}</span>
            )}
          </div>
          <div className={fieldClasses}>
            <label htmlFor="duration" className="font-medium text-[rgb(var(--foreground))]">
              Duración (días)
            </label>
            <input
              id="duration"
              type="number"
              min="1"
              placeholder="30"
              className={inputClasses}
              disabled={isFormDisabled}
              {...register("durationDays")}
            />
            {errors.durationDays && (
              <span className="text-xs text-red-500">
                {errors.durationDays.message}
              </span>
            )}
          </div>
          <div className={fieldClasses}>
            <label htmlFor="uri" className="font-medium text-[rgb(var(--foreground))]">
              Documento detallado (IPFS / URL opcional)
            </label>
            <input
              id="uri"
              type="url"
              placeholder="https://ipfs.io/ipfs/..."
              className={inputClasses}
              disabled={isFormDisabled}
              {...register("documentationUrl")}
            />
            {errors.documentationUrl && (
              <span className="text-xs text-red-500">
                {errors.documentationUrl.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            type="button"
            disabled={isFormDisabled}
            onClick={() => reset()}
          >
            Limpiar
          </Button>
          <Button type="submit" disabled={isFormDisabled || supportedTokens.length === 0}>
            {isSubmitting || txStatus === "pending"
              ? "Procesando..."
              : "Publicar campaña"}
          </Button>
        </div>
      </form>

      {txStatus === "success" && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Campaña creada correctamente.
          {txHash && (
            <div className="mt-1 text-xs">
              Hash de la transacción: <span className="font-mono">{txHash}</span>
            </div>
          )}
        </div>
      )}

      {txStatus === "error" && txError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {txError}
        </div>
      )}

      <p className="mt-4 text-xs text-[rgb(var(--foreground))]/60">
        Esta vista utiliza <code>createProject</code> del contrato FairFund y asume que el token ya fue permitido por el owner.
      </p>
    </div>
  );
}
