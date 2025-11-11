import { ProjectCard } from "./project-card";
import { mockProjects } from "@/lib/mocks/projects";

export const ProjectList = () => {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[rgb(var(--foreground))]">
            Campañas activas
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--foreground))]/70">
            Explora y apoya proyectos verificados que utilizan el escrow de FairFund.
          </p>
        </div>
        <div className="text-sm text-[rgb(var(--foreground))]/60">
          Tokens soportados: DAI, USDC, USDT
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
};

