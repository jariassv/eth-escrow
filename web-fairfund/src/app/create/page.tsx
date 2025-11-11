"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";

const fieldClasses =
  "flex flex-col gap-2 text-sm text-[rgb(var(--foreground))]/80";
const inputClasses =
  "w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--primary))]";

export default function CreateProjectPage() {
  const { status, connect } = useWallet();
  const isDisabled = status !== "connected";

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

      {isDisabled && (
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

      <div className="grid gap-6 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-sm">
        <div className={fieldClasses}>
          <label htmlFor="title" className="font-medium text-[rgb(var(--foreground))]">
            Título de la campaña
          </label>
          <input
            id="title"
            placeholder="Semilla para huertos urbanos"
            className={inputClasses}
            disabled={isDisabled}
          />
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
            disabled={isDisabled}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className={fieldClasses}>
            <label htmlFor="token" className="font-medium text-[rgb(var(--foreground))]">
              Token ERC20 permitido
            </label>
            <select
              id="token"
              className={inputClasses}
              defaultValue=""
              disabled={isDisabled}
            >
              <option value="" disabled>
                Selecciona token
              </option>
              <option value="DAI">DAI</option>
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
            </select>
          </div>
          <div className={fieldClasses}>
            <label htmlFor="goal" className="font-medium text-[rgb(var(--foreground))]">
              Meta (en unidades del token)
            </label>
            <input
              id="goal"
              type="number"
              min="0"
              placeholder="50000"
              className={inputClasses}
              disabled={isDisabled}
            />
          </div>
          <div className={fieldClasses}>
            <label htmlFor="deadline" className="font-medium text-[rgb(var(--foreground))]">
              Duración (días)
            </label>
            <input
              id="deadline"
              type="number"
              min="1"
              placeholder="30"
              className={inputClasses}
              disabled={isDisabled}
            />
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
              disabled={isDisabled}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" type="reset" disabled={isDisabled}>
            Limpiar
          </Button>
          <Button type="submit" disabled>
            Publicar campaña (próximamente)
          </Button>
        </div>
      </div>
      <p className="mt-4 text-xs text-[rgb(var(--foreground))]/60">
        En la siguiente iteración conectaremos este formulario con el método <code>createProject</code> del contrato.
      </p>
    </div>
  );
}
