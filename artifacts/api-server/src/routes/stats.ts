import { Router } from "express";
import { db } from "../data/store";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const summary = await db.stats.summary();
    const progressRate = summary.totalTarget > 0
      ? ((summary.totalRaised / summary.totalTarget) * 100).toFixed(2)
      : "0.00";

    res.json({
      success: true,
      data: {
        ...summary,
        progressRate: `${progressRate}%`,
        totalRaisedFormatted: `Rp ${summary.totalRaised.toLocaleString("id-ID")}`,
        totalTargetFormatted: `Rp ${summary.totalTarget.toLocaleString("id-ID")}`,
      },
    });
  } catch (err) {
    req.log.error({ err }, "GET /stats error");
    res.status(500).json({ success: false, message: "Gagal mengambil statistik" });
  }
});

export default router;
