import * as express from "express";
import { analizeMatches } from "../services/scrapper";
import { Analysis, ASchema } from "../models/analysis.model";
const router: express.Router = express.Router();

router.get("/", async (req, res) => {
  try {
    const newAnalysis = new Analysis({
      scheduledEvents: []
    });

    const savedAnalysis: ASchema = await newAnalysis.save();

    console.log("saved new analysis");

    const analysisId = savedAnalysis._id;

    analizeMatches(2, 5, analysisId);
    res.json({
      msg: "Scrapper route"
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error"
    });
  }
});

export default router;
