const pt = require("puppeteer");

// 35 - 45
// 80 - 90

const test = async () => {
  try {
    const browser = await pt.launch();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await page.goto("https://flashscore.com");

    const link = await page.$(".event__match.event__match--scheduled");
    const links = await page.$$(".event__match.event__match--scheduled");

    await link.click();

    const [popup] = await Promise.all([
      new Promise(resolve => page.once("popup", resolve)),
      console.log("opened opup")
    ]);

    await popup.waitForSelector("#a-match-head-2-head");

    await popup.click("#li-match-head-2-head");

    // await popup.waitForSelector("#a-match-head-2-head");

    console.log(await popup.url());
    const matchLink = await popup.url();

    const pageh2h = await browser.newPage();

    pageh2h.goto(matchLink + "#h2h;overall");

    pageh2h.waitFor(1000);

    // await popup.screenshot({ path: "example2.png" });
    // await page.screenshot({ path: "example.png" });
    // await pageh2h.screenshot({ path: "h2h.png" });

    // console.log("got ss ");

    await new Promise((resolve, reject) => {
      links.forEach(async (url, i) => {
        try {
          if (i < 4) {
            const matchId = await (await url.getProperty("id")).jsonValue();

            console.log(matchId);

            const linkId = matchId.replace("g_1_", "");

            browser
              .newPage()
              .then(async page => {
                page.setDefaultNavigationTimeout(0);
                await page.goto(
                  "https://flashscore.com/match/" + linkId + "#h2h;overall"
                );

                console.log("opened ew tab for: " + linkId);

                page.waitForSelector("#a-match-head-2-head");

                await page.screenshot({
                  path: `h2h-${matchId}.png`,
                  fullPage: true
                });
                console.log("fetched " + i + " match");

                page.close();
              })
              .catch(e => console.log("loop of tabs error"));
          }

          if (i === links.length - 1) {
            resolve();
            console.log("finished fething 2 matches");
          }
        } catch (e) {
          console.log(e);
        }
      });
    });

    // await browser.close();
    browser.on("targetdestroyed", async e => {
      console.log("page was closed");
      const pagesLength = await browser.pages();
      console.log(pagesLength.length);
    });
  } catch (e) {
    console.log(e);
  }

  // event__match
};

test();
