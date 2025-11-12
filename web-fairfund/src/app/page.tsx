import { LandingHero } from "@/components/layout/landing-hero";
import { ProjectList } from "@/components/projects/project-list";

export default function Home() {
  return (
    <div className="relative space-y-12 pb-16 pt-8 sm:pt-12">
      <LandingHero />
      <ProjectList />
    </div>
  );
}
