import { Router } from "express";
import { db } from "../data/store";

const router = Router();

router.get("/funds", async (req, res) => {
  try {
    const { status, category } = req.query;
    const funds = await db.funds.findAll({
      status: status as string | undefined,
      category: category as string | undefined,
    });
    res.json({ success: true, data: funds, total: funds.length });
  } catch (err) {
    req.log.error({ err }, "GET /funds error");
    res.status(500).json({ success: false, message: "Gagal mengambil data fund" });
  }
});

router.get("/funds/:id", async (req, res) => {
  try {
    const fund = await db.funds.findById(req.params.id);
    if (!fund) {
      res.status(404).json({ success: false, message: "Fund tidak ditemukan" });
      return;
    }
    const investments = await db.investments.findByFund(fund.id);
    res.json({ success: true, data: { ...fund, investments } });
  } catch (err) {
    req.log.error({ err }, "GET /funds/:id error");
    res.status(500).json({ success: false, message: "Gagal mengambil data fund" });
  }
});

router.post("/funds", async (req, res) => {
  try {
    const { name, description, targetAmount, category } = req.body;
    if (!name || !targetAmount || !category) {
      res.status(400).json({ success: false, message: "name, targetAmount, dan category wajib diisi" });
      return;
    }
    const fund = await db.funds.create({
      name,
      description: description ?? "",
      targetAmount: Number(targetAmount),
      raisedAmount: 0,
      category,
      status: "active",
    });
    res.status(201).json({ success: true, data: fund, message: "Fund berhasil dibuat" });
  } catch (err) {
    req.log.error({ err }, "POST /funds error");
    res.status(500).json({ success: false, message: "Gagal membuat fund" });
  }
});

router.put("/funds/:id", async (req, res) => {
  try {
    const { name, description, targetAmount, category, status } = req.body;
    const fund = await db.funds.update(req.params.id, {
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
  } catch (err) {
    req.log.error({ err }, "PUT /funds/:id error");
    res.status(500).json({ success: false, message: "Gagal mengupdate fund" });
  }
});

router.delete("/funds/:id", async (req, res) => {
  try {
    const deleted = await db.funds.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Fund tidak ditemukan" });
      return;
    }
    res.json({ success: true, message: "Fund berhasil dihapus" });
  } catch (err) {
    req.log.error({ err }, "DELETE /funds/:id error");
    res.status(500).json({ success: false, message: "Gagal menghapus fund" });
  }
});

export default router;
