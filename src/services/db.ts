import * as mongoose from "mongoose";
import * as chalk from "chalk";

export const dbUri = "mongodb://localhost:27017/flashscore_scrapper_db";

mongoose.connection.on("connecting", () =>
  console.log(chalk.green("Connecting to the db........"))
);
mongoose.connection.on("connected", () =>
  console.log(chalk.bgGreen("connected to the db"))
);

export const connectToDb = async () => {
  try {
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (e) {
    console.log(chalk.bgRed("Error while connecting to the db"));
    console.log(chalk.red(e.message));
  }
};
