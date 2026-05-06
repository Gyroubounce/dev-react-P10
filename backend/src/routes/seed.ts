import express from "express";
import seed from "../scripts/seed"; // adapte le chemin

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    await seed();
    res.json({ message: "Seed exécuté avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur seed" });
  }
});

export default router;
