"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const chalk = require("chalk");
const scrapper_1 = require("./routes/scrapper");
const db_1 = require("./services/db");
const app = express();
const port = 8000;
db_1.connectToDb();
app.use("/api/scrapper", scrapper_1.default);
app.get("/", (req, res) => {
    res.json({
        msg: "App root"
    });
});
app.listen(port, () => console.log(chalk.bgBlue("Started server on port: " + port)));
//# sourceMappingURL=index.js.map