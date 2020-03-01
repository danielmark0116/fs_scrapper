"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const scrapper_1 = require("../services/scrapper");
const router = express.Router();
router.get("/", (req, res) => {
    scrapper_1.analizeMatches(2, 5);
    res.json({
        msg: "Scrapper route"
    });
});
exports.default = router;
//# sourceMappingURL=scrapper.js.map