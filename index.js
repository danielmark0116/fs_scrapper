const pt = require("puppeteer");
const chalk = require("chalk");

const getTeams = async page => {
  const team1 = await (await page.$(".tname-home a")).getProperty("innerText");

  const team2 = await (await page.$(".tname-away a")).getProperty("innerText");

  const team1Name = await team1.jsonValue();
  const team2Name = await team2.jsonValue();

  return [team1Name, team2Name];
};

// 35 - 45
// 80 - 90

const test = async () => {
  try {
    const browser = await pt.launch();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await page.goto("https://flashscore.com");

    const links = await page.$$(".event__match.event__match--scheduled");

    await new Promise((resolve, reject) => {
      links.forEach(async (url, i) => {
        try {
          if (i < 10) {
            const matchId = await (await url.getProperty("id")).jsonValue();

            const linkId = matchId.replace("g_1_", "");

            browser
              .newPage()
              .then(async page => {
                page.setDefaultNavigationTimeout(0);
                await page.goto(
                  "https://flashscore.com/match/" + linkId + "#h2h;overall"
                );

                await page.waitForSelector("#a-match-head-2-head");

                await page.waitForSelector("table.h2h_mutual tr.highlight", {
                  visible: true,
                  hidden: false,
                  timeout: 0
                });

                const team1 = await (await page.$(".tname-home a")).getProperty(
                  "innerText"
                );

                const team2 = await (await page.$(".tname-away a")).getProperty(
                  "innerText"
                );

                const team1Name = await team1.jsonValue();
                const team2Name = await team2.jsonValue();

                console.log(`match between ${team1Name} - ${team2Name}`);

                const givenMatchHistoryIds = await page.$$eval(
                  "table.h2h_mutual tr.highlight",
                  links =>
                    links.map(
                      link =>
                        link
                          .getAttribute("onclick")
                          .split("detail_open('g_0_")[1]
                          .split("', null")[0]
                    )
                );
                console.log(
                  i + "history matches: " + givenMatchHistoryIds.length
                );

                for (let i = 0; i < givenMatchHistoryIds.length; i++) {
                  if (i < 6) {
                    console.log(givenMatchHistoryIds[i]);
                    browser
                      .newPage()
                      .then(async historyMatchPage => {
                        historyMatchPage.setDefaultTimeout(0);
                        historyMatchPage.goto(
                          "https://flashscore.com/match/" +
                            givenMatchHistoryIds[i] +
                            "#match-summary"
                        );

                        await historyMatchPage.waitForSelector(
                          "#a-match-head-2-head"
                        );
                        await historyMatchPage.waitForSelector(".detailMS", {
                          visible: true,
                          timeout: 0
                        });

                        const [team1, team2] = await getTeams(page);

                        console.log(
                          chalk.bgBlue.white(
                            "fetched first history match from: " + team1Name,
                            team2Name
                          )
                        );
                        console.log(team1, team2);

                        console.log(
                          chalk.green(
                            "https://flashscore.com/match/" +
                              givenMatchHistoryIds[i] +
                              "/#match-summary"
                          )
                        );

                        const events = await historyMatchPage.$$eval(
                          ".detailMS__incidentRow",
                          all =>
                            all.map(event => {
                              if (
                                event.getAttribute("class").includes("--empty")
                              ) {
                                return {
                                  minute: "0",
                                  wasScored: null
                                };
                              } else {
                                const eventIcon = event.children[1].getAttribute(
                                  "class"
                                );
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
                                  wasScored
                                };
                              }
                            })
                        );

                        events.forEach(e => {
                          const time = parseInt(
                            e.minute.split("'")[0].split("+")[0]
                          );

                          if (e.wasScored) {
                            // 35 - 45
                            // 80 - 90
                            if (
                              (time >= 35 && time <= 45) ||
                              (time >= 80 && time <= 90)
                            ) {
                              // event that is of type GOAL to be saved in DB
                              console.log(e);
                              console.log(
                                chalk.bgCyan(
                                  "This history match was match for bet"
                                )
                              );
                              historyMatchPage.screenshot({
                                path: `./historyMatches/${team1}-${team2}__${i}.png`,
                                fullPage: true
                              });
                            }
                          }
                        });

                        // await historyMatchPage.close();
                      })
                      .catch(e => console.error(e.message));
                  }
                }

                // await page.screenshot({
                //   path: `h2h-${matchId}.png`,
                //   fullPage: true
                // });
              })
              .catch(e => console.error(e.message));
          }

          if (i === links.length - 1) {
            resolve();
          }
        } catch (e) {
          console.error(e);
        }
      });
    });

    browser.on("targetdestroyed", async e => {
      const pages = await browser.pages();
      console.log(pages.length);

      if (pages.length === 2) {
        console.log("FINISHED RUNNIGN SCRAPING");
        page.close();
      }
    });
  } catch (e) {
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
test();
