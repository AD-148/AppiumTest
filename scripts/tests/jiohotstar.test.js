import { runAndroidTest } from "../appium-helpers.js";
import { JioHotstarPage } from "../pages/JioHotstarPage.js";

const env = process.env;
const searchText = env.JIOHOTSTAR_SEARCH_TEXT ?? "cricket";
const jioHotstarAppPackage = env.JIOHOTSTAR_APP_PACKAGE ?? "in.startv.hotstar";
const jioHotstarAppActivity =
  env.JIOHOTSTAR_APP_ACTIVITY ?? "com.hotstar.MainActivity";

await runAndroidTest({
  appPackage: jioHotstarAppPackage,
  appActivity: jioHotstarAppActivity,
  testFn: async (driver) => {
    const jioHotstarPage = new JioHotstarPage(driver);
    await jioHotstarPage.searchFor(searchText);
    await jioHotstarPage.playThirdResult();
    console.log(`Started JioHotstar playback for result of "${searchText}".`);
    await driver.pause(30000);
  },
});
