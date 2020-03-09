"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const analysis_model_1 = require("../models/analysis.model");
const router = express.Router();
const fs = require("fs");
router.get("/", async (req, res) => {
    console.log("getting analytics");
    try {
        const latestAnalytics = await analysis_model_1.Analysis.find()
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
        fs.writeFileSync("./client/src/analytics/analytics.txt", JSON.stringify(latestAnalytics));
        res.json({
            msg: "Fetched anaytics",
            data: latestAnalytics
        });
    }
    catch (e) {
        console.log(e.message);
        res.status(500).json({
            msg: "Error with fetching analytics",
            error: e.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map