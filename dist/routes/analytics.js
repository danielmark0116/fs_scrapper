"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const analysis_model_1 = require("../models/analysis.model");
const router = express.Router();
router.get("/", async (req, res) => {
    try {
        const latestAnalytics = await analysis_model_1.Analysis.find()
            .sort({
            createdAt: "desc"
        })
            .limit(1);
        res.json({
            msg: "Fetched anaytics",
            data: latestAnalytics
        });
    }
    catch (e) {
        res.status(500).json({
            msg: "Error with fetching analytics"
        });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map