import * as express from "express";
import { analizeMatches } from "../services/scrapper";
const router: express.Router = express.Router();

router.get("/", (req, res) => {
  analizeMatches(2, 5);
  res.json({
    msg: "Scrapper route"
  });
});

export default router;
