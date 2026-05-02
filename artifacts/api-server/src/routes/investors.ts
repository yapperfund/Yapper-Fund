import { Router } from "express";
import { db } from "../data/store";

const router = Router();

router.get("/investors", async (req, res) => {
  try {
    const investors = await db.investors.findAll();
    res.json({ success: true, data: investors, total: investors.length });
  } catch (err) {
    req.log.error({ err }, "GET /investors error");
    res.status(500).json({ success: false, message: "Gagal mengambil data investor" });
  }
});

router.get("/investors/:id", async (req, res) => {
  try {
    const investor = await db.investors.findById(req.params.id);
    if (!investor) {
      res.status(404).json({ success: false, message: "Investor tidak ditemukan" });
      return;
    }
    const investments = await db.investments.findByInvestor(investor.id);
    res.json({ success: true, data: { ...investor, investments } });
  } catch (err) {
    req.log.error({ err }, "GET /investors/:id error");
    res.status(500).json({ success: false, message: "Gagal mengambil data investor" });
  }
});

router.post("/investors", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      res.status(400).json({ success: false, message: "name dan email wajib diisi" });
      return;
    }
    const investor = await db.investors.create({ name, email });
    res.status(201).json({ success: true, data: investor, message: "Investor berhasil didaftarkan" });
  } catch (err) {
    req.log.error({ err }, "POST /investors error");
    res.status(500).json({ success: false, message: "Gagal mendaftarkan investor" });
  }
});

router.put("/investors/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    const investor = await db.investors.update(req.params.id, {
      ...(name && { name }),
      ...(email && { email }),
    });
    if (!investor) {
      res.status(404).json({ success: false, message: "Investor tidak ditemukan" });
      return;
    }
    res.json({ success: true, data: investor, message: "Investor berhasil diupdate" });
  } catch (err) {
    req.log.error({ err }, "PUT /investors/:id error");
    res.status(500).json({ success: false, message: "Gagal mengupdate investor" });
  }
});

router.delete("/investors/:id", async (req, res) => {
  try {
    const deleted = await db.investors.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Investor tidak ditemukan" });
      return;
    }
    res.json({ success: true, message: "Investor berhasil dihapus" });
  } catch (err) {
    req.log.error({ err }, "DELETE /investors/:id error");
    res.status(500).json({ success: false, message: "Gagal menghapus investor" });
  }
});

export default router;
