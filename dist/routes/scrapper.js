"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const test_1 = require("../services/test");
const router = express.Router();
router.get("/", async (req, res) => {
    try {
        test_1.initializeAnalysis(30, 20);
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