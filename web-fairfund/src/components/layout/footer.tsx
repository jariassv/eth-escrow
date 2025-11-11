export const Footer = () => {
  return (
    <footer className="border-t border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-[rgb(var(--foreground))]/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>&copy; {new Date().getFullYear()} FairFund. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[rgb(var(--foreground))]"
          >
            Código fuente
          </a>
          <a
            href="https://docs.ethers.org/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[rgb(var(--foreground))]"
          >
            Documentación Ethers
          </a>
        </div>
      </div>
    </footer>
  );
};

