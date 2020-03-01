"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const scrapper_1 = require("../services/scrapper");
const analysis_model_1 = require("../models/analysis.model");
const router = express.Router();
router.get("/", async (req, res) => {
    try {
        const newAnalysis = new analysis_model_1.Analysis({
            scheduledEvents: []
        });
        const savedAnalysis = await newAnalysis.save();
        console.log("saved new analysis");
        const analysisId = savedAnalysis._id;
        scrapper_1.analizeMatches(2, 5, analysisId);
        res.json({
            msg: "Scrapper route"
        });
    }
    catch (e) {
        res.status(500).json({
            msg: "Error"
        });
    }
});
exports.default = router;
//# sourceMappingURL=scrapper.js.map