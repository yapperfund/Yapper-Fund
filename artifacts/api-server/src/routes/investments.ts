import { Router } from "express";
import { db } from "../data/store";

const router = Router();

router.get("/investments", async (req, res) => {
  try {
    const { fundId, investorId } = req.query;
    const investments = await db.investments.findAll({
      fundId: fundId as string | undefined,
      investorId: investorId as string | undefined,
    });
    res.json({ success: true, data: investments, total: investments.length });
  } catch (err) {
    req.log.error({ err }, "GET /investments error");
    res.status(500).json({ success: false, message: "Gagal mengambil data investasi" });
  }
});

router.post("/investments", async (req, res) => {
  try {
    const { fundId, investorId, amount, note } = req.body;
    if (!fundId || !investorId || !amount) {
      res.status(400).json({ success: false, message: "fundId, investorId, dan amount wajib diisi" });
      return;
    }
    const fund = await db.funds.findById(fundId);
    if (!fund) {
      res.status(404).json({ success: false, message: "Fund tidak ditemukan" });
      return;
    }
    if (fund.status !== "active") {
      res.status(400).json({ success: false, message: "Fund sudah tidak aktif, tidak bisa menerima investasi baru" });
      return;
    }
    const investor = await db.investors.findById(investorId);
    if (!investor) {
      res.status(404).json({ success: false, message: "Investor tidak ditemukan" });
      return;
    }
    const investment = await db.investments.create({
      fundId,
      investorId,
      amount: Number(amount),
      note: note ?? "",
    });
    res.status(201).json({ success: true, data: investment, message: "Investasi berhasil dicatat" });
  } catch (err) {
    req.log.error({ err }, "POST /investments error");
    res.status(500).json({ success: false, message: "Gagal mencatat investasi" });
  }
});

router.delete("/investments/:id", async (req, res) => {
  try {
    const deleted = await db.investments.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Investasi tidak ditemukan" });
      return;
    }
    res.json({ success: true, message: "Investasi berhasil dihapus" });
  } catch (err) {
    req.log.error({ err }, "DELETE /investments/:id error");
    res.status(500).json({ success: false, message: "Gagal menghapus investasi" });
  }
});

export default router;
