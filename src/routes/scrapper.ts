import * as express from "express";
import { initializeAnalysis } from "../services/test";
const router: express.Router = express.Router();

router.get("/", async (req, res) => {
  try {
    console.log("initializign analysis");
    initializeAnalysis(400, 20);
    res.json({
      msg: "Scrapper route",
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error",
    });
  }
});

export default router;
