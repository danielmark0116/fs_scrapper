import * as express from "express";
import { Analysis } from "../models/analysis.model";
const router: express.Router = express.Router();
import * as fs from "fs";

router.get("/", async (req, res) => {
  try {
    const latestAnalytics = await Analysis.find()
      .sort({
        createdAt: "desc"
      })
      .limit(1);

    fs.writeFileSync("docs/analytics.txt", JSON.stringify(latestAnalytics));
    fs.writeFileSync("analytics.txt", JSON.stringify(latestAnalytics));
    fs.writeFileSync("analytics.json", JSON.stringify(latestAnalytics));

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
