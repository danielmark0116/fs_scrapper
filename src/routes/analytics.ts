import * as express from "express";
import { Analysis } from "../models/analysis.model";
const router: express.Router = express.Router();

router.get("/", async (req, res) => {
  try {
    const latestAnalytics = await Analysis.find()
      .sort({
        createdAt: "desc"
      })
      .limit(1);
    res.json({
      msg: "Fetched anaytics",
      data: latestAnalytics
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error with fetching analytics"
    });
  }
});

export default router;
