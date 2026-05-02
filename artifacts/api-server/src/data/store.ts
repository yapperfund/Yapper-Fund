export interface Fund {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  category: string;
  status: "active" | "closed" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  totalInvested: number;
  joinedAt: string;
}

export interface Investment {
  id: string;
  fundId: string;
  investorId: string;
  amount: number;
  note: string;
  investedAt: string;
}

let funds: Fund[] = [
  {
    id: "fund-001",
    name: "Yapper Seed Fund",
    description: "Dana awal untuk startup teknologi tahap awal di Indonesia",
    targetAmount: 5000000000,
    raisedAmount: 2350000000,
    category: "Teknologi",
    status: "active",
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-04-28T10:30:00Z",
  },
  {
    id: "fund-002",
    name: "Yapper Growth Fund",
    description: "Dana pertumbuhan untuk UMKM digital siap scale-up",
    targetAmount: 10000000000,
    raisedAmount: 10000000000,
    category: "UMKM",
    status: "completed",
    createdAt: "2025-06-01T08:00:00Z",
    updatedAt: "2025-12-31T23:59:59Z",
  },
  {
    id: "fund-003",
    name: "Yapper Green Fund",
    description: "Investasi untuk startup ramah lingkungan dan energi terbarukan",
    targetAmount: 7500000000,
    raisedAmount: 500000000,
    category: "Green Tech",
    status: "active",
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-04-30T12:00:00Z",
  },
];

let investors: Investor[] = [
  {
    id: "inv-001",
    name: "Budi Santoso",
    email: "budi@example.com",
    totalInvested: 500000000,
    joinedAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "inv-002",
    name: "Sari Dewi",
    email: "sari@example.com",
    totalInvested: 1200000000,
    joinedAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "inv-003",
    name: "Ahmad Fauzi",
    email: "ahmad@example.com",
    totalInvested: 300000000,
    joinedAt: "2026-03-10T11:00:00Z",
  },
];

let investments: Investment[] = [
  {
    id: "txn-001",
    fundId: "fund-001",
    investorId: "inv-001",
    amount: 500000000,
    note: "Investasi tahap pertama",
    investedAt: "2026-01-20T09:00:00Z",
  },
  {
    id: "txn-002",
    fundId: "fund-001",
    investorId: "inv-002",
    amount: 1000000000,
    note: "Lead investor round A",
    investedAt: "2026-02-05T10:00:00Z",
  },
  {
    id: "txn-003",
    fundId: "fund-003",
    investorId: "inv-002",
    amount: 200000000,
    note: "Komitmen awal green fund",
    investedAt: "2026-03-15T08:30:00Z",
  },
  {
    id: "txn-004",
    fundId: "fund-003",
    investorId: "inv-003",
    amount: 300000000,
    note: "Investasi green energy",
    investedAt: "2026-04-01T14:00:00Z",
  },
];

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function now(): string {
  return new Date().toISOString();
}

export const db = {
  funds: {
    findAll: () => [...funds],
    findById: (id: string) => funds.find((f) => f.id === id) ?? null,
    create: (data: Omit<Fund, "id" | "createdAt" | "updatedAt">): Fund => {
      const fund: Fund = { ...data, id: generateId("fund"), createdAt: now(), updatedAt: now() };
      funds.push(fund);
      return fund;
    },
    update: (id: string, data: Partial<Omit<Fund, "id" | "createdAt">>): Fund | null => {
      const idx = funds.findIndex((f) => f.id === id);
      if (idx === -1) return null;
      funds[idx] = { ...funds[idx], ...data, updatedAt: now() };
      return funds[idx];
    },
    delete: (id: string): boolean => {
      const before = funds.length;
      funds = funds.filter((f) => f.id !== id);
      return funds.length < before;
    },
  },

  investors: {
    findAll: () => [...investors],
    findById: (id: string) => investors.find((i) => i.id === id) ?? null,
    create: (data: Omit<Investor, "id" | "totalInvested" | "joinedAt">): Investor => {
      const investor: Investor = { ...data, id: generateId("inv"), totalInvested: 0, joinedAt: now() };
      investors.push(investor);
      return investor;
    },
    update: (id: string, data: Partial<Omit<Investor, "id" | "joinedAt">>): Investor | null => {
      const idx = investors.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      investors[idx] = { ...investors[idx], ...data };
      return investors[idx];
    },
    delete: (id: string): boolean => {
      const before = investors.length;
      investors = investors.filter((i) => i.id !== id);
      return investors.length < before;
    },
  },

  investments: {
    findAll: () => [...investments],
    findByFund: (fundId: string) => investments.filter((i) => i.fundId === fundId),
    findByInvestor: (investorId: string) => investments.filter((i) => i.investorId === investorId),
    create: (data: Omit<Investment, "id" | "investedAt">): Investment => {
      const investment: Investment = { ...data, id: generateId("txn"), investedAt: now() };
      investments.push(investment);
      const fund = funds.find((f) => f.id === data.fundId);
      if (fund) fund.raisedAmount += data.amount;
      const investor = investors.find((i) => i.id === data.investorId);
      if (investor) investor.totalInvested += data.amount;
      return investment;
    },
    delete: (id: string): boolean => {
      const inv = investments.find((i) => i.id === id);
      if (!inv) return false;
      investments = investments.filter((i) => i.id !== id);
      const fund = funds.find((f) => f.id === inv.fundId);
      if (fund) fund.raisedAmount -= inv.amount;
      const investor = investors.find((i) => i.id === inv.investorId);
      if (investor) investor.totalInvested -= inv.amount;
      return true;
    },
  },

  stats: {
    summary: () => ({
      totalFunds: funds.length,
      activeFunds: funds.filter((f) => f.status === "active").length,
      totalRaised: funds.reduce((sum, f) => sum + f.raisedAmount, 0),
      totalTarget: funds.reduce((sum, f) => sum + f.targetAmount, 0),
      totalInvestors: investors.length,
      totalTransactions: investments.length,
    }),
  },
};
