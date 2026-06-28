import {runAndroidTest, click, setValue} from "./appium-helpers.js";

const env = process.env;

const searchText = env.YOUTUBE_SEARCH_TEXT ?? "cricket";
const youtubeAppPackage = env.YOUTUBE_APP_PACKAGE ?? "com.google.android.youtube";
const youtubeAppActivity =
  env.YOUTUBE_APP_ACTIVITY ??
  "com.google.android.apps.youtube.app.WatchWhileActivity";

const selectors = {
  searchButton:
    env.YOUTUBE_SEARCH_ENTRY_SELECTOR ??
    '//android.widget.ImageView[@content-desc="Search"]',
  searchInput:
    env.YOUTUBE_SEARCH_FIELD_SELECTOR ??
    '//android.widget.EditText[@resource-id="com.google.android.youtube:id/search_edit_text"]',
  resultsPage: "id=com.google.android.youtube:id/results",
  searchResults:
    env.YOUTUBE_RESULT_SELECTOR ??
    'android=new UiSelector().resourceId("com.google.android.youtube:id/results").childSelector(new UiSelector().className("android.view.ViewGroup").descriptionContains("").instance(2))',
};

await runAndroidTest({
  appPackage: youtubeAppPackage,
  appActivity: youtubeAppActivity,
  testFn: async (driver) => {
    await click(driver, selectors.searchButton);
    await setValue(driver, selectors.searchInput, searchText);
    await driver.pressKeyCode(66);
    await click(driver, selectors.searchResults);
        console.log(
      `Started YouTube playback for result of "${searchText}".`,
    );
    await driver.pause(30000);

  },
});

