import { Router } from "express";
import { db } from "../data/store";

const router = Router();

router.get("/investments", (req, res) => {
  const { fundId, investorId } = req.query;
  let investments = db.investments.findAll();

  if (fundId) investments = investments.filter((i) => i.fundId === fundId);
  if (investorId) investments = investments.filter((i) => i.investorId === investorId);

  res.json({ success: true, data: investments, total: investments.length });
});

router.post("/investments", (req, res) => {
  const { fundId, investorId, amount, note } = req.body;

  if (!fundId || !investorId || !amount) {
    res.status(400).json({ success: false, message: "fundId, investorId, dan amount wajib diisi" });
    return;
  }

  const fund = db.funds.findById(fundId);
  if (!fund) {
    res.status(404).json({ success: false, message: "Fund tidak ditemukan" });
    return;
  }

  if (fund.status !== "active") {
    res.status(400).json({ success: false, message: "Fund sudah tidak aktif, tidak bisa menerima investasi baru" });
    return;
  }

  const investor = db.investors.findById(investorId);
  if (!investor) {
    res.status(404).json({ success: false, message: "Investor tidak ditemukan" });
    return;
  }

  const investment = db.investments.create({
    fundId,
    investorId,
    amount: Number(amount),
    note: note ?? "",
  });

  res.status(201).json({ success: true, data: investment, message: "Investasi berhasil dicatat" });
});

router.delete("/investments/:id", (req, res) => {
  const deleted = db.investments.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ success: false, message: "Investasi tidak ditemukan" });
    return;
  }
  res.json({ success: true, message: "Investasi berhasil dihapus" });
});

export default router;
