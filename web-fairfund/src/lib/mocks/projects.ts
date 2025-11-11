import type { ProjectSummary, Contribution } from "@/types/project";

export const mockProjects: ProjectSummary[] = [
  {
    id: 1,
    title: "Refugio Solar Comunitario",
    creator: "0x3F3c...9b12",
    description:
      "Construcción de refugio autosustentable que utiliza paneles solares y almacenamiento inteligente.",
    goal: "50,000 DAI",
    deadline: "2025-02-10",
    tokenSymbol: "DAI",
    raised: "18,750 DAI",
    backers: 42,
    status: "active",
  },
  {
    id: 2,
    title: "Agua Limpia para Todos",
    creator: "0x91Aa...5dC0",
    description:
      "Implementación de sistemas de filtrado de agua en comunidades rurales de Latinoamérica.",
    goal: "30,000 USDC",
    deadline: "2025-01-21",
    tokenSymbol: "USDC",
    raised: "30,500 USDC",
    backers: 123,
    status: "funded",
  },
  {
    id: 3,
    title: "Becas STEM para Mujeres",
    creator: "0xf12C...91C4",
    description:
      "Programa de becas para impulsar talentos femeninos en ciencia y tecnología.",
    goal: "75,000 USDT",
    deadline: "2025-03-05",
    tokenSymbol: "USDT",
    raised: "48,900 USDT",
    backers: 89,
    status: "active",
  },
];

export const mockContributions: Contribution[] = [
  {
    projectId: 1,
    amount: "250 DAI",
    tokenSymbol: "DAI",
    timestamp: "2024-11-03T08:21:00Z",
  },
  {
    projectId: 3,
    amount: "120 USDT",
    tokenSymbol: "USDT",
    timestamp: "2024-11-02T14:05:00Z",
  },
];

