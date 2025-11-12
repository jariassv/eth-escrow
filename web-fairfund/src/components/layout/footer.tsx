export const Footer = () => {
  return (
    <footer className="border-t border-white/20 bg-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-[rgb(var(--foreground))]/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-semibold text-[rgb(var(--foreground))]">FairFund</p>
          <p className="text-xs text-[rgb(var(--foreground))]/50">
            &copy; {new Date().getFullYear()} FairFund. Construido para practicar integraciones Web3.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-[rgb(var(--foreground))]"
          >
            Código fuente
          </a>
          <a
            href="https://docs.ethers.org/"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-[rgb(var(--foreground))]"
          >
            Documentación Ethers
          </a>
          <a
            href="https://book.getfoundry.sh/"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-[rgb(var(--foreground))]"
          >
            Foundry docs
          </a>
        </div>
      </div>
    </footer>
  );
};

