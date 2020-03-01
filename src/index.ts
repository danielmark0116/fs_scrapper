import * as express from "express";
import * as chalk from "chalk";
import scrapperRoutes from "./routes/scrapper";
import { connectToDb } from "./services/db";
const app: express.Express = express();
const port = 8000;

connectToDb();

app.use("/api/scrapper", scrapperRoutes);

app.get("/", (req, res) => {
  res.json({
    msg: "App root"
  });
});

app.listen(port, () =>
  console.log(chalk.bgBlue("Started server on port: " + port))
);
