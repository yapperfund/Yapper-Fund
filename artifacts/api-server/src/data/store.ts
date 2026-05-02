import { Pool } from "pg";
import { logger } from "../lib/logger";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  logger.error({ err }, "PostgreSQL pool error");
});

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

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function mapFund(row: Record<string, unknown>): Fund {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    targetAmount: Number(row.target_amount),
    raisedAmount: Number(row.raised_amount),
    category: row.category as string,
    status: row.status as Fund["status"],
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

function mapInvestor(row: Record<string, unknown>): Investor {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    totalInvested: Number(row.total_invested),
    joinedAt: (row.joined_at as Date).toISOString(),
  };
}

function mapInvestment(row: Record<string, unknown>): Investment {
  return {
    id: row.id as string,
    fundId: row.fund_id as string,
    investorId: row.investor_id as string,
    amount: Number(row.amount),
    note: row.note as string,
    investedAt: (row.invested_at as Date).toISOString(),
  };
}

export const db = {
  funds: {
    findAll: async (filters?: { status?: string; category?: string }): Promise<Fund[]> => {
      let query = "SELECT * FROM funds WHERE 1=1";
      const params: string[] = [];
      if (filters?.status) { params.push(filters.status); query += ` AND status = $${params.length}`; }
      if (filters?.category) { params.push(filters.category); query += ` AND category = $${params.length}`; }
      query += " ORDER BY created_at DESC";
      const { rows } = await pool.query(query, params);
      return rows.map(mapFund);
    },
    findById: async (id: string): Promise<Fund | null> => {
      const { rows } = await pool.query("SELECT * FROM funds WHERE id = $1", [id]);
      return rows.length ? mapFund(rows[0]) : null;
    },
    create: async (data: Omit<Fund, "id" | "createdAt" | "updatedAt">): Promise<Fund> => {
      const id = generateId("fund");
      const { rows } = await pool.query(
        `INSERT INTO funds (id, name, description, target_amount, raised_amount, category, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [id, data.name, data.description, data.targetAmount, data.raisedAmount, data.category, data.status]
      );
      return mapFund(rows[0]);
    },
    update: async (id: string, data: Partial<Omit<Fund, "id" | "createdAt">>): Promise<Fund | null> => {
      const fields: string[] = [];
      const params: unknown[] = [];
      if (data.name) { params.push(data.name); fields.push(`name = $${params.length}`); }
      if (data.description !== undefined) { params.push(data.description); fields.push(`description = $${params.length}`); }
      if (data.targetAmount) { params.push(data.targetAmount); fields.push(`target_amount = $${params.length}`); }
      if (data.raisedAmount !== undefined) { params.push(data.raisedAmount); fields.push(`raised_amount = $${params.length}`); }
      if (data.category) { params.push(data.category); fields.push(`category = $${params.length}`); }
      if (data.status) { params.push(data.status); fields.push(`status = $${params.length}`); }
      if (!fields.length) return db.funds.findById(id);
      fields.push(`updated_at = NOW()`);
      params.push(id);
      const { rows } = await pool.query(
        `UPDATE funds SET ${fields.join(", ")} WHERE id = $${params.length} RETURNING *`,
        params
      );
      return rows.length ? mapFund(rows[0]) : null;
    },
    delete: async (id: string): Promise<boolean> => {
      const { rowCount } = await pool.query("DELETE FROM funds WHERE id = $1", [id]);
      return (rowCount ?? 0) > 0;
    },
  },

  investors: {
    findAll: async (): Promise<Investor[]> => {
      const { rows } = await pool.query("SELECT * FROM investors ORDER BY joined_at DESC");
      return rows.map(mapInvestor);
    },
    findById: async (id: string): Promise<Investor | null> => {
      const { rows } = await pool.query("SELECT * FROM investors WHERE id = $1", [id]);
      return rows.length ? mapInvestor(rows[0]) : null;
    },
    create: async (data: Pick<Investor, "name" | "email">): Promise<Investor> => {
      const id = generateId("inv");
      const { rows } = await pool.query(
        "INSERT INTO investors (id, name, email) VALUES ($1,$2,$3) RETURNING *",
        [id, data.name, data.email]
      );
      return mapInvestor(rows[0]);
    },
    update: async (id: string, data: Partial<Pick<Investor, "name" | "email">>): Promise<Investor | null> => {
      const fields: string[] = [];
      const params: unknown[] = [];
      if (data.name) { params.push(data.name); fields.push(`name = $${params.length}`); }
      if (data.email) { params.push(data.email); fields.push(`email = $${params.length}`); }
      if (!fields.length) return db.investors.findById(id);
      params.push(id);
      const { rows } = await pool.query(
        `UPDATE investors SET ${fields.join(", ")} WHERE id = $${params.length} RETURNING *`,
        params
      );
      return rows.length ? mapInvestor(rows[0]) : null;
    },
    delete: async (id: string): Promise<boolean> => {
      const { rowCount } = await pool.query("DELETE FROM investors WHERE id = $1", [id]);
      return (rowCount ?? 0) > 0;
    },
  },

  investments: {
    findAll: async (filters?: { fundId?: string; investorId?: string }): Promise<Investment[]> => {
      let query = "SELECT * FROM investments WHERE 1=1";
      const params: string[] = [];
      if (filters?.fundId) { params.push(filters.fundId); query += ` AND fund_id = $${params.length}`; }
      if (filters?.investorId) { params.push(filters.investorId); query += ` AND investor_id = $${params.length}`; }
      query += " ORDER BY invested_at DESC";
      const { rows } = await pool.query(query, params);
      return rows.map(mapInvestment);
    },
    findByFund: async (fundId: string): Promise<Investment[]> => {
      const { rows } = await pool.query("SELECT * FROM investments WHERE fund_id = $1 ORDER BY invested_at DESC", [fundId]);
      return rows.map(mapInvestment);
    },
    findByInvestor: async (investorId: string): Promise<Investment[]> => {
      const { rows } = await pool.query("SELECT * FROM investments WHERE investor_id = $1 ORDER BY invested_at DESC", [investorId]);
      return rows.map(mapInvestment);
    },
    create: async (data: Omit<Investment, "id" | "investedAt">): Promise<Investment> => {
      const id = generateId("txn");
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const { rows } = await client.query(
          "INSERT INTO investments (id, fund_id, investor_id, amount, note) VALUES ($1,$2,$3,$4,$5) RETURNING *",
          [id, data.fundId, data.investorId, data.amount, data.note]
        );
        await client.query(
          "UPDATE funds SET raised_amount = raised_amount + $1, updated_at = NOW() WHERE id = $2",
          [data.amount, data.fundId]
        );
        await client.query(
          "UPDATE investors SET total_invested = total_invested + $1 WHERE id = $2",
          [data.amount, data.investorId]
        );
        await client.query("COMMIT");
        return mapInvestment(rows[0]);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    },
    delete: async (id: string): Promise<boolean> => {
      const { rows } = await pool.query("SELECT * FROM investments WHERE id = $1", [id]);
      if (!rows.length) return false;
      const inv = mapInvestment(rows[0]);
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM investments WHERE id = $1", [id]);
        await client.query(
          "UPDATE funds SET raised_amount = raised_amount - $1, updated_at = NOW() WHERE id = $2",
          [inv.amount, inv.fundId]
        );
        await client.query(
          "UPDATE investors SET total_invested = total_invested - $1 WHERE id = $2",
          [inv.amount, inv.investorId]
        );
        await client.query("COMMIT");
        return true;
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    },
  },

  stats: {
    summary: async () => {
      const { rows } = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM funds) AS total_funds,
          (SELECT COUNT(*) FROM funds WHERE status = 'active') AS active_funds,
          (SELECT COALESCE(SUM(raised_amount), 0) FROM funds) AS total_raised,
          (SELECT COALESCE(SUM(target_amount), 0) FROM funds) AS total_target,
          (SELECT COUNT(*) FROM investors) AS total_investors,
          (SELECT COUNT(*) FROM investments) AS total_transactions
      `);
      const r = rows[0];
      return {
        totalFunds: Number(r.total_funds),
        activeFunds: Number(r.active_funds),
        totalRaised: Number(r.total_raised),
        totalTarget: Number(r.total_target),
        totalInvestors: Number(r.total_investors),
        totalTransactions: Number(r.total_transactions),
      };
    },
  },
};
