import { runAndroidTest } from "../appium-helpers.js";
import { YouTubePage } from "../pages/YouTubePage.js";

const env = process.env;
const searchText = env.YOUTUBE_SEARCH_TEXT ?? "cricket";
const youtubeAppPackage = env.YOUTUBE_APP_PACKAGE ?? "com.google.android.youtube";
const youtubeAppActivity =
  env.YOUTUBE_APP_ACTIVITY ??
  "com.google.android.apps.youtube.app.WatchWhileActivity";

await runAndroidTest({
  appPackage: youtubeAppPackage,
  appActivity: youtubeAppActivity,
  testFn: async (driver) => {
    const youtubePage = new YouTubePage(driver);
    await youtubePage.searchFor(searchText);
    await youtubePage.playThirdResult();
    console.log(`Started YouTube playback for result of "${searchText}".`);
    await driver.pause(30000);
  },
});
