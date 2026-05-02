import { Router } from "express";
import { db } from "../data/store";

const router = Router();

router.get("/investors", (req, res) => {
  const investors = db.investors.findAll();
  res.json({ success: true, data: investors, total: investors.length });
});

router.get("/investors/:id", (req, res) => {
  const investor = db.investors.findById(req.params.id);
  if (!investor) {
    res.status(404).json({ success: false, message: "Investor tidak ditemukan" });
    return;
  }
  const investments = db.investments.findByInvestor(investor.id);
  res.json({ success: true, data: { ...investor, investments } });
});

router.post("/investors", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    res.status(400).json({ success: false, message: "name dan email wajib diisi" });
    return;
  }

  const investor = db.investors.create({ name, email });
  res.status(201).json({ success: true, data: investor, message: "Investor berhasil didaftarkan" });
});

router.put("/investors/:id", (req, res) => {
  const { name, email } = req.body;
  const investor = db.investors.update(req.params.id, {
    ...(name && { name }),
    ...(email && { email }),
  });

  if (!investor) {
    res.status(404).json({ success: false, message: "Investor tidak ditemukan" });
    return;
  }

  res.json({ success: true, data: investor, message: "Investor berhasil diupdate" });
});

router.delete("/investors/:id", (req, res) => {
  const deleted = db.investors.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ success: false, message: "Investor tidak ditemukan" });
    return;
  }
  res.json({ success: true, message: "Investor berhasil dihapus" });
});

export default router;
