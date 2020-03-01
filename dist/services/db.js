"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const chalk = require("chalk");
exports.dbUri = "mongodb://localhost:27017/flashscore_scrapper_db";
mongoose.connection.on("connecting", () => console.log(chalk.green("Connecting to the db........")));
mongoose.connection.on("connected", () => console.log(chalk.bgGreen("connected to the db")));
exports.connectToDb = async () => {
    try {
        await mongoose.connect(exports.dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }
    catch (e) {
        console.log(chalk.bgRed("Error while connecting to the db"));
        console.log(chalk.red(e.message));
    }
};
//# sourceMappingURL=db.js.map