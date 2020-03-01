"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pt = require("puppeteer");
const chalk = require("chalk");
const analysis_model_1 = require("../models/analysis.model");
const getTeams = async (page) => {
    const team1 = await (await page.$(".tname-home a")).getProperty("innerText");
    const team2 = await (await page.$(".tname-away a")).getProperty("innerText");
    const team1Name = await team1.jsonValue();
    const team2Name = await team2.jsonValue();
    return [team1Name, team2Name];
};
exports.analizeMatches = async (matchesToBePlayed = 10, historyMatchesNumber = 6) => {
    console.log("Initialized scrapping");
    try {
        const newAnalysis = new analysis_model_1.Analysis({
            scheduledEvents: []
        });
        const savedAnalysis = await newAnalysis.save();
        const analysisId = savedAnalysis._id;
        const browser = await pt.launch();
        const page = await browser.newPage();
        browser.on("targetcreated", async (pt) => {
            const pagesCount = (await browser.pages()).length;
            console.log(chalk.greenBright("created new page, now there is: " + pagesCount));
        });
        page.setDefaultNavigationTimeout(0);
        await page.goto("https://flashscore.com");
        const links = await page.$$(".event__match.event__match--scheduled");
        links.forEach(async (url, i) => {
            try {
                if (i < matchesToBePlayed) {
                    const fullId = await (await url.getProperty("id")).jsonValue();
                    const linkId = fullId.replace("g_1_", "");
                    const matchDetailsLink = "https://flashscore.com/match/" + linkId + "#h2h;overall";
                    console.log(chalk.bgGreen.red("handled link no: " + i));
                    await new Promise((res, rej) => {
                        browser
                            .newPage()
                            .then(async (page) => {
                            const idClosure = linkId;
                            try {
                                page.setDefaultNavigationTimeout(0);
                                await page.goto(matchDetailsLink);
                                await page.waitForSelector("#a-match-head-2-head");
                                await page.waitForSelector("table.h2h_mutual tr.highlight", {
                                    visible: true,
                                    hidden: false,
                                    timeout: 0
                                });
                                const team1 = await (await page.$(".tname-home a")).getProperty("innerText");
                                const team2 = await (await page.$(".tname-away a")).getProperty("innerText");
                                const team1Name = await team1.jsonValue();
                                const team2Name = await team2.jsonValue();
                                const analysisToBeUpdated = await analysis_model_1.Analysis.findById(analysisId);
                                analysisToBeUpdated.scheduledEvents = [
                                    ...analysisToBeUpdated.scheduledEvents,
                                    {
                                        fsId: linkId,
                                        historyEvents: [],
                                        matchDetailsLink,
                                        team1: team1Name,
                                        team2: team2Name,
                                        title: `${team1Name} - ${team2Name}`
                                    }
                                ];
                                await analysisToBeUpdated.save();
                                console.log(`match between ${team1Name} - ${team2Name}`);
                                const givenMatchHistoryIds = await page.$$eval("table.h2h_mutual tr.highlight", (links) => links.map((link) => link
                                    .getAttribute("onclick")
                                    .split("detail_open('g_0_")[1]
                                    .split("', null")[0]));
                                console.log(i + "history matches: " + givenMatchHistoryIds.length);
                                for (let i = 0; i < givenMatchHistoryIds.length; i++) {
                                    if (i < historyMatchesNumber) {
                                        console.log(givenMatchHistoryIds[i]);
                                        const historyMatchFsId = givenMatchHistoryIds[i];
                                        browser
                                            .newPage()
                                            .then(async (historyMatchPage) => {
                                            historyMatchPage.setDefaultTimeout(0);
                                            historyMatchPage.goto("https://flashscore.com/match/" +
                                                givenMatchHistoryIds[i] +
                                                "#match-summary");
                                            await historyMatchPage.waitForSelector("#a-match-head-2-head");
                                            await historyMatchPage.waitForSelector(".detailMS", {
                                                visible: true,
                                                timeout: 0
                                            });
                                            const [team1, team2] = await getTeams(page);
                                            console.log(chalk.bgBlue.white("fetched first history match from: " + team1Name, team2Name));
                                            console.log(team1, team2);
                                            console.log(chalk.green("https://flashscore.com/match/" +
                                                givenMatchHistoryIds[i] +
                                                "/#match-summary"));
                                            const events = await historyMatchPage.$$eval(".detailMS__incidentRow", (all) => all.map((event) => {
                                                if (event
                                                    .getAttribute("class")
                                                    .includes("--empty")) {
                                                    return {
                                                        minute: "0",
                                                        wasScored: null
                                                    };
                                                }
                                                else {
                                                    const eventIcon = event.children[1].getAttribute("class");
                                                    let wasScored;
                                                    if (eventIcon) {
                                                        wasScored = event.children[1]
                                                            .getAttribute("class")
                                                            .includes("soccer-ball");
                                                    }
                                                    else {
                                                        wasScored = false;
                                                    }
                                                    return {
                                                        minute: event.firstChild.innerHTML,
                                                        wasScored
                                                    };
                                                }
                                            }));
                                            for (let i = 0; i < events.length; i++) {
                                                const event = events[i];
                                                const lastItem = events.length - 1;
                                                const time = parseInt(event.minute.split("'")[0].split("+")[0]);
                                                if (event.wasScored) {
                                                    // 35 - 45
                                                    // 80 - 90
                                                    if ((time >= 35 && time <= 45) ||
                                                        (time >= 80 && time <= 90)) {
                                                        // event that is of type GOAL to be saved in DB
                                                        console.log(event);
                                                        console.log(chalk.bgCyan("This history match was match for bet"));
                                                        historyMatchPage
                                                            .screenshot({
                                                            path: `./historyMatches/${team1}-${team2}__${i}.png`,
                                                            fullPage: true
                                                        })
                                                            .then(() => {
                                                            historyMatchPage.close();
                                                        })
                                                            .catch(e => console.log(e.message));
                                                        break;
                                                    }
                                                }
                                            }
                                            const analysisToBeUpdated = await analysis_model_1.Analysis.findById(analysisId);
                                            analysisToBeUpdated.scheduledEvents.map((event) => {
                                                if (event.fsId === idClosure) {
                                                    const prevHistoryMatches = event.historyEvents;
                                                    const goals = events.filter((data) => data.wasScored);
                                                    const goalsAtRoundsEnd = goals.filter((goal) => {
                                                        const time = parseInt(goal.minute.split("'")[0].split("+")[0]);
                                                        if ((time >= 35 && time <= 45) ||
                                                            (time >= 80 && time <= 90)) {
                                                            return true;
                                                        }
                                                        return false;
                                                    });
                                                    event.historyEvents = [
                                                        ...prevHistoryMatches,
                                                        {
                                                            fsId: historyMatchFsId,
                                                            goals,
                                                            goalsAtRoundsEnd,
                                                            title: `${team1} - ${team2}`,
                                                            team1,
                                                            team2,
                                                            matchDetailsLink: "https://flashscore.com/match/" +
                                                                givenMatchHistoryIds[i] +
                                                                "/#match-summary"
                                                        }
                                                    ];
                                                }
                                            });
                                            await analysisToBeUpdated.save();
                                        })
                                            .catch((e) => console.error(e.message));
                                    }
                                }
                                res();
                            }
                            catch (e) {
                                console.log(e.message);
                            }
                        })
                            .catch((e) => {
                            rej();
                            console.error(e.message);
                        });
                    });
                }
            }
            catch (e) {
                console.error(e);
            }
        });
        browser.on("targetdestroyed", async (e) => {
            const pages = await browser.pages();
            console.log(pages.length);
            console.log(chalk.bgRed("closed page after ss"));
        });
    }
    catch (e) {
        console.log(e);
    }
};
// STARTING ANALISING -> NEW ENTRY IN DB
const analisis = {
    date: "",
    id: "",
    scheduledEvents: [
        {
            title: "Team - Team",
            date: "",
            team1: "",
            team2: "",
            liveScoreId: "",
            matchDetailsLink: "",
            historyEvents: [
                {
                    title: "Team - Team",
                    date: "",
                    team1: "",
                    team2: "",
                    liveScoreId: "",
                    matchDetailsLink: "",
                    goals: [
                        // all goals
                        {
                            minute: "",
                            wasScored: true,
                            who: ""
                        }
                    ],
                    goalsAtRoundsEnd: [
                        // only goals scored in the last 10 minutes of round
                        {
                            minute: "",
                            wasScored: true,
                            who: ""
                        }
                    ]
                }
            ]
        }
    ]
};
//# sourceMappingURL=scrapper.js.map