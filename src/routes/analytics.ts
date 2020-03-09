import * as express from "express";
import { Analysis } from "../models/analysis.model";
const router: express.Router = express.Router();
import * as fs from "fs";

router.get("/", async (req, res) => {
  console.log("getting analytics");
  try {
    const latestAnalytics = await Analysis.find()
      .sort({
        createdAt: "desc"
      })
      .limit(1);

    const analyticsRootPath = "./client/src/analytics";

    if (!fs.existsSync(analyticsRootPath)) {
      fs.mkdirSync(analyticsRootPath);
      // fs.unlinkSync("./client/src/analytics/analytics.json");
      fs.unlinkSync("./client/src/analytics/analytics.txt");
    }
    // fs.writeFile("./client/src/analytics/analytics.json", latestAnalytics, () =>
    //   console.log("Saved analysis to JSON")
    // );
    fs.writeFileSync(
      "./client/src/analytics/analytics.txt",
      JSON.stringify(latestAnalytics)
    );

    res.json({
      msg: "Fetched anaytics",
      data: latestAnalytics
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      msg: "Error with fetching analytics",
      error: e.message
    });
  }
});

export default router;
