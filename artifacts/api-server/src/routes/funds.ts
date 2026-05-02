import { Router } from "express";
import { db } from "../data/store";

const router = Router();

router.get("/funds", (req, res) => {
  const { status, category } = req.query;
  let funds = db.funds.findAll();

  if (status) funds = funds.filter((f) => f.status === status);
  if (category) funds = funds.filter((f) => f.category === String(category));

  res.json({ success: true, data: funds, total: funds.length });
});

router.get("/funds/:id", (req, res) => {
  const fund = db.funds.findById(req.params.id);
  if (!fund) {
    res.status(404).json({ success: false, message: "Fund tidak ditemukan" });
    return;
  }
  const investments = db.investments.findByFund(fund.id);
  res.json({ success: true, data: { ...fund, investments } });
});

router.post("/funds", (req, res) => {
  const { name, description, targetAmount, category } = req.body;

  if (!name || !targetAmount || !category) {
    res.status(400).json({ success: false, message: "name, targetAmount, dan category wajib diisi" });
    return;
  }

  const fund = db.funds.create({
    name,
    description: description ?? "",
    targetAmount: Number(targetAmount),
    raisedAmount: 0,
    category,
    status: "active",
  });

  res.status(201).json({ success: true, data: fund, message: "Fund berhasil dibuat" });
});

router.put("/funds/:id", (req, res) => {
  const { name, description, targetAmount, category, status } = req.body;
  const fund = db.funds.update(req.params.id, {
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(targetAmount && { targetAmount: Number(targetAmount) }),
    ...(category && { category }),
    ...(status && { status }),
  });

  if (!fund) {
    res.status(404).json({ success: false, message: "Fund tidak ditemukan" });
    return;
  }

  res.json({ success: true, data: fund, message: "Fund berhasil diupdate" });
});

router.delete("/funds/:id", (req, res) => {
  const deleted = db.funds.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ success: false, message: "Fund tidak ditemukan" });
    return;
  }
  res.json({ success: true, message: "Fund berhasil dihapus" });
});

export default router;
