import * as pt from "puppeteer";
import * as chalk from "chalk";
import { HESchema, SESchema, Analysis } from "../models/analysis.model";

interface scheduledEventsLinks {
  link: string;
  fsId: string;
}

const getMatchDate = async (page: pt.Page) => {
  try {
    const time = await (await page.$("#utime")).getProperty("innerText");

    const matchTime = await time.jsonValue();
    return `${matchTime || ""}`;
  } catch (e) {
    console.log("error from getMatchDate");
    return "";
  }
};

const getTeams = async (page: pt.Page) => {
  try {
    await page.waitForSelector(".tname-home");
    await page.waitForSelector(".tname-away");

    const team1 = await (await page.$(".tname-home a")).getProperty(
      "innerText"
    );

    const team2 = await (await page.$(".tname-away a")).getProperty(
      "innerText"
    );

    const team1Name = await team1.jsonValue();
    const team2Name = await team2.jsonValue();

    if (!team1Name || !team2Name) {
      throw new Error("Error from getNames");
    }

    return [`${team1Name}`, `${team2Name}`];
  } catch (e) {
    console.log("error From getTeams");
    return ["nodata", "nodata"];
  }
};

export const initializeAnalysis = async (
  eventsToBePlayed: number = 2,
  historyQuantity: number = 4
) => {
  try {
    const links = await sEventsLinks(eventsToBePlayed);

    console.log(chalk.blue("Fetched links for scheduled matches"));

    console.log(links.length);

    await analise(links, historyQuantity);

    console.log(chalk.green("Analysis DONE"));
  } catch (e) {
    console.log("error from initializing Analysis");
    console.log(e.message);
  }
};

const fetchHistoryData = async (
  ids: string[],
  browser: pt.Browser
): Promise<any[]> => {
  try {
    const noOfIds = ids.length;
    const historyData: HESchema[] = [];

    if (ids.length === 0) {
      return historyData;
    }

    for (let i in ids) {
      const index = parseInt(i);
      const lastItem = noOfIds - 1;
      const matchId = ids[index];

      const page = await browser.newPage();

      page.setDefaultTimeout(0);

      console.log("mathc id: " + matchId);

      await page
        .goto("https://flashscore.com/match/" + matchId + "#match-summary")
        .then(() => console.log("went to match summary page"))
        .catch((e) => console.log("Could not visit match summary page + ", e));

      await page.waitForSelector("#a-match-head-2-head");
      await page.waitForSelector(".detailMS", {
        visible: true,
        timeout: 0,
      });

      const events = await page.$$eval(".detailMS__incidentRow", (all: any) =>
        all.map((event: any) => {
          if (event.getAttribute("class").includes("--empty")) {
            return {
              minute: "0",
              wasScored: null,
            };
          } else {
            const eventIcon = event.children[1].getAttribute("class");
            let wasScored;

            if (eventIcon) {
              wasScored = event.children[1]
                .getAttribute("class")
                .includes("soccer-ball");
            } else {
              wasScored = false;
            }

            return {
              minute: event.firstChild.innerHTML,
              wasScored,
            };
          }
        })
      );

      const [team1, team2] = await getTeams(page);
      const matchDate = await getMatchDate(page);

      //   HISTORY DATA TO BE SAVED
      const goals = await events.filter((data: any) => data.wasScored);
      const goalsAtRoundsEnd = await goals.filter((goal: any) => {
        const time = parseInt(goal.minute.split("'")[0].split("+")[0]);
        if ((time >= 35 && time <= 45) || (time >= 80 && time <= 90)) {
          return true;
        }
        return false;
      });
      const fsId = matchId;
      const title = `${team1} - ${team2}`;
      const matchDetailsLink = `https://flashscore.com/match/${fsId}/#match-summary`;

      historyData.push({
        goals,
        goalsAtRoundsEnd,
        date: matchDate,
        team1: `${team1 || ""}`,
        team2: `${team2 || ""}`,
        title,
        fsId,
        matchDetailsLink,
      });

      await page.close();

      if (index === lastItem) {
        return historyData;
      }
    }
  } catch (e) {
    console.log("Error from fetchHistoryData");
    return [];
  }
};

const analise = async (
  SELinks: scheduledEventsLinks[],
  historyQuantity: number
) => {
  try {
    const newAnalysis = new Analysis({
      scheduledEvents: [],
    });

    const analysisId = newAnalysis._id;

    await newAnalysis.save();

    console.log("saved new analisis with id: " + analysisId);

    let browser: pt.Browser = await pt.launch();

    browser.on("disconnected", async () => {
      browser = await pt.launch();
      console.log(chalk.green('"Closed browser for ANALYSE"'));
    });

    for (let i in SELinks) {
      const seIndex = parseInt(i);
      const lastItem = SELinks.length - 1;
      const scheduledEventLink = SELinks[seIndex].link;
      const scheduledEventId = SELinks[seIndex].fsId;

      const page = await browser.newPage();
      page.setDefaultTimeout(0);

      await page.goto(scheduledEventLink);

      console.log(scheduledEventLink);

      await page.waitForSelector("#a-match-head-2-head");
      await page.waitForSelector("#tab-h2h-overall");

      const h2hQuantity = (await page.$$("table.h2h_mutual tr.highlight"))
        .length;

      let historyDataIds: any[] = [];

      if (h2hQuantity > 0) {
        // let awaitOutput;

        await page
          .waitForSelector("table.h2h_mutual tr.highlight", {
            visible: true,
            hidden: false,
            timeout: 10000,
          })
          .then((page) => {
            console.log(chalk.blue("found table.h2h_mutual tr.highlight"));
          })
          .catch(() => {
            console.log(
              chalk.red("Did not found table.h2h_mutual tr.highlight")
            );
          });

        const historyDataIdsWithDuplicates = await page.$$eval(
          "table.h2h_mutual tr.highlight",
          (links: any) =>
            links.map(
              (link: any) =>
                link
                  .getAttribute("onclick")
                  .split("detail_open('g_0_")[1]
                  .split("', null")[0]
            )
        );

        historyDataIds = [...new Set(historyDataIdsWithDuplicates)];
      }

      // console.log(historyDataIds);

      const [team1Name, team2Name] = await getTeams(page);

      const seDate = await getMatchDate(page);

      console.log(
        chalk.bgYellow.blue(`FOR: ${team1Name} - ${team2Name} || ${seDate}`)
      );

      const historyIdsShortened = historyDataIds.slice(0, historyQuantity);

      const allHistoryDataForOneScheduledEvent = await fetchHistoryData(
        historyIdsShortened,
        browser
      );

      const scheduledEventFinalData: SESchema = {
        date: seDate,
        title: `${team1Name} - ${team2Name}`,
        team1: `${team1Name}`,
        team2: `${team2Name}`,
        fsId: scheduledEventId,
        matchDetailsLink: scheduledEventLink,
        historyEvents: allHistoryDataForOneScheduledEvent,
      };

      const analysisToBeUpdated = await Analysis.findById(analysisId);
      analysisToBeUpdated.scheduledEvents.push(scheduledEventFinalData);
      await analysisToBeUpdated.save();

      console.log(chalk.bgGreen.blue("History FETCHED"));

      await page.close();

      if (seIndex === lastItem) {
        browser.close();
        return true;
      }
    }
  } catch (e) {
    console.log(chalk.red("Error form ANALISE"));
    console.log(e.message);
    console.log("but going on, just skipping this one");
    // return false;
    return true;
  }
};

// GETTINGS SCHEDULED EVENTS
export const sEventsLinks = async (
  noOfScheduledEvents: number = 4
): Promise<scheduledEventsLinks[]> => {
  try {
    const outputLinks: scheduledEventsLinks[] = [];
    const browser: pt.Browser = await pt.launch();
    const page: pt.Page = await browser.newPage();
    page.setDefaultNavigationTimeout(20000);

    browser.on("targetdestroyed", async (pt: pt.Target) => {
      const pagesCount = (await browser.pages()).length;

      if (pagesCount === 1) {
        await browser.close();
      }
    });

    browser.once("disconnected", () => {
      console.log(chalk.green("Closed Browser for fetching SCHEDULED EVENTS"));
    });

    await page.goto("https://flashscore.com");

    console.log("awaotng for selecotrs");
    await page.waitForSelector(".event__match.event__match--scheduled");

    console.log("have selectors");

    const links = await page.$$(".event__match.event__match--scheduled");

    console.log(links.length);

    for (let index in links) {
      const i = parseInt(index);
      const lastItem =
        noOfScheduledEvents - 1 > links.length
          ? links.length - 1
          : noOfScheduledEvents - 1;

      console.log(index);
      console.log(lastItem);

      if (i < noOfScheduledEvents) {
        const url = links[index];
        const fullId = await (await url.getProperty("id")).jsonValue();
        const finalId = `${fullId}`;
        const scheduledEventId = finalId.replace("g_1_", "");

        const sEventLink =
          "https://flashscore.com/match/" + scheduledEventId + "/#h2h;overall";

        // console.log(outputLinks);

        // console.log(sEventLink);
        outputLinks.push({
          link: sEventLink,
          fsId: scheduledEventId,
        });

        if (i === lastItem) {
          console.log("last item");
          await page.close();
          return outputLinks;
        }
      }
    }
  } catch (e) {
    console.log(chalk.red("Error while fetching links for SCHEDULED EVENTS"));
    return [];
  }
};
