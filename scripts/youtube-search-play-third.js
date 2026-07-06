import {runAndroidTest, click, setValue, assertText} from "./appium-helpers.js";

const env = process.env;

const searchText = env.YOUTUBE_SEARCH_TEXT ?? "cricket";
const youtubeAppPackage = env.YOUTUBE_APP_PACKAGE ?? "com.google.android.youtube";
const youtubeAppActivity =
  env.YOUTUBE_APP_ACTIVITY ??
  "com.google.android.apps.youtube.app.WatchWhileActivity";

// Anchor to the ScrollView, then find the specific child inside it
//const scrollableSelector = env.YOUTUBE_RESULT_SCROLL ??'android=new UiScrollable(new UiSelector().resourceId("com.google.android.youtube:id/browse_fragment_layout_coordinator_layout")).getChildByInstance(new UiSelector().className("android.view.ViewGroup").descriptionMatches(".+"), 2)';
const scrollableContainer = 'android=new UiScrollable(new UiSelector().resourceId("com.google.android.youtube:id/results"))';
const targetSelector = 'new UiSelector().className("android.view.ViewGroup").descriptionMatches(".+")';
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
      'android=new UiSelector().resourceId("com.google.android.youtube:id/results").childSelector(new UiSelector().className("android.view.ViewGroup").instance(2))',
}
await runAndroidTest({
  appPackage: youtubeAppPackage,
  appActivity: youtubeAppActivity,
  testFn: async (driver) => {
    await assertText(driver, selectors.searchButton, "Search", "Search Button");
    await click(driver, selectors.searchButton);
    await setValue(driver, selectors.searchInput, searchText);
    await driver.pressKeyCode(66);
    const element = await driver.$(selectors.searchResults);
    await element.waitForDisplayed({ timeout: 10000 });
    //const scrollEle = await driver.$(scrollableSelector);
    //await scrollEle.waitForDisplayed({ timeout: 10000 });


    // 3. Execution: Scroll until the 3rd (index 2) item is found
    const element1 = await driver.$(`${scrollableContainer}.scrollIntoView(${targetSelector}.instance(2))`);
    await element1.click();
   // await click(driver, selectors.searchResults);
        console.log(
      `Started YouTube playback for result of "${searchText}".`,
    );
    await driver.pause(30000);

  },
});

