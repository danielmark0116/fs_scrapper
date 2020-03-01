import * as express from "express";
import * as chalk from "chalk";
import scrapperRoutes from "./routes/scrapper";
import analyticsRoutes from "./routes/analytics";
import { connectToDb } from "./services/db";
import { initializeAnalysis } from "./services/test";
const app: express.Express = express();
const port = 8000;

connectToDb();

// initializeAnalysis(1, 2);

app.use("/api/scrapper", scrapperRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.json({
    msg: "App root"
  });
});

app.listen(port, () =>
  console.log(chalk.bgBlue("Started server on port: " + port))
);
